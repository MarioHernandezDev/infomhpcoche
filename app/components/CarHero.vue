<script setup lang="ts">
import gsap from 'gsap'

const props = defineProps<{
  km: number
  glp?: number | null
  gasolina?: number | null
  /** Km usados del contrato y lo permitido en total, para el arco de progreso */
  used?: number
  allowance?: number
  allowedToDate?: number
}>()

const root = ref<HTMLElement>()

// Geometría del arco (240°, abierto por abajo)
const CX = 200
const CY = 210
const R = 178
const pt = (deg: number, r = R) => ({
  x: CX + r * Math.cos((deg * Math.PI) / 180),
  y: CY + r * Math.sin((deg * Math.PI) / 180)
})
const arc = (r: number) => {
  const a = pt(150, r)
  const b = pt(30, r)
  return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} A ${r} ${r} 0 1 1 ${b.x.toFixed(1)} ${b.y.toFixed(1)}`
}

const pct = computed(() => (props.allowance ? Math.min(1, Math.max(0, (props.used ?? 0) / props.allowance)) : 0))
const paceFrac = computed(() => (props.allowance && props.allowedToDate != null ? Math.min(1, props.allowedToDate / props.allowance) : null))
const mark = computed(() => {
  if (paceFrac.value == null) return null
  const deg = 150 + 240 * paceFrac.value
  const a = pt(deg, R - 12)
  const b = pt(deg, R + 14)
  return { x1: a.x, y1: a.y, x2: b.x, y2: b.y }
})
const over = computed(() => paceFrac.value != null && pct.value > paceFrac.value)

// Animación mínima y solo con transform/opacity: el coche entra y el arco se dibuja
onMounted(() => {
  const offset = 100 - pct.value * 100
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const ctx = gsap.context(() => {
    if (reduced) {
      gsap.set('.arc-progress', { strokeDashoffset: offset })
      return
    }
    gsap.set('.arc-progress', { strokeDashoffset: 100 })
    gsap.timeline({ defaults: { ease: 'power2.out' } })
      .from('.hero-fade', { opacity: 0, duration: 0.4 }, 0)
      .from('.car', { x: 60, opacity: 0, duration: 0.55 }, 0)
      .to('.arc-progress', { strokeDashoffset: offset, duration: 0.8 }, 0.1)
  }, root.value)
  onBeforeUnmount(() => ctx.revert())
})
</script>

<template>
  <div
    ref="root"
    class="relative mx-auto aspect-[1/1.05] w-full max-w-md select-none [container-type:inline-size]"
  >
    <!-- Luz roja de fondo (degradado, sin blur) -->
    <div class="hero-fade absolute inset-x-[6%] top-[14%] h-[60%] bg-[radial-gradient(closest-side,rgb(220_38_38/.32),transparent)]" />

    <!-- Palabra gigante tras el coche -->
    <div
      class="hero-fade pointer-events-none absolute inset-x-0 top-[7%] flex justify-center font-display leading-none"
      aria-hidden="true"
    >
      <span class="ghost-text text-[28cqw]">CAPTUR</span>
    </div>

    <!-- Arco de progreso del contrato -->
    <svg
      viewBox="0 0 400 400"
      class="hero-fade absolute inset-0 size-full"
      fill="none"
      aria-hidden="true"
    >
      <path
        :d="arc(194)"
        stroke="#ef4444"
        stroke-width="7"
        stroke-dasharray="1.5 7"
        opacity=".4"
      />
      <path
        :d="arc(R)"
        stroke="rgb(255 255 255 / .16)"
        stroke-width="5"
        stroke-linecap="round"
      />
      <path
        class="arc-progress"
        :d="arc(R)"
        pathLength="100"
        stroke="#ef4444"
        stroke-opacity=".3"
        stroke-width="13"
        stroke-linecap="round"
        stroke-dasharray="100"
        stroke-dashoffset="100"
      />
      <path
        class="arc-progress"
        :d="arc(R)"
        pathLength="100"
        stroke="#ef4444"
        stroke-width="6"
        stroke-linecap="round"
        stroke-dasharray="100"
        stroke-dashoffset="100"
      />
      <line
        v-if="mark"
        v-bind="mark"
        stroke="#fff"
        stroke-width="3"
        stroke-linecap="round"
      />
    </svg>

    <!-- Suelo + coche -->
    <div class="hero-fade absolute inset-x-[14%] top-[66%] h-[5%] bg-[radial-gradient(closest-side,rgb(239_68_68/.4),transparent)]" />
    <div class="car absolute inset-x-[9%] top-[27%]">
      <img
        src="/img/captur.webp"
        alt="Renault Captur rojo"
        width="1100"
        height="553"
        class="w-full"
        draggable="false"
      >
    </div>

    <!-- Lectura inferior -->
    <div class="hero-fade absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 px-1">
      <div class="w-24 space-y-1">
        <p class="hud-label">
          GLP
        </p>
        <p class="font-num text-2xl font-medium leading-none">
          <template v-if="glp">
            {{ num(glp, 3) }}<span class="ml-1 text-xs text-white/40">€/L</span>
          </template>
          <template v-else>
            —
          </template>
        </p>
      </div>

      <div class="space-y-1 text-center">
        <p class="hud-label">
          Cuentakilómetros
        </p>
        <p class="font-num text-6xl font-semibold leading-none tracking-wide">
          <CountUp :value="km" /><span class="ml-2 text-lg text-white/50">km</span>
        </p>
        <p
          v-if="allowance"
          class="text-xs text-white/55"
        >
          <span :class="over ? 'text-red-400' : 'text-emerald-400'">{{ Math.round(pct * 100) }}%</span> del límite del contrato
        </p>
      </div>

      <div class="w-24 space-y-1 text-right">
        <p class="hud-label">
          Gasolina
        </p>
        <p class="font-num text-2xl font-medium leading-none">
          <template v-if="gasolina">
            {{ num(gasolina, 3) }}<span class="ml-1 text-xs text-white/40">€/L</span>
          </template>
          <template v-else>
            —
          </template>
        </p>
      </div>
    </div>
  </div>
</template>
