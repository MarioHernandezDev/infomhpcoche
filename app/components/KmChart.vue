<script setup lang="ts">
const props = defineProps<{
  points: { date: string, odometer: number }[]
  start: Date
  end: Date
  startKm: number
  allowance: number
  annualKm: number
}>()

const W = 360
const H = 220
const m = { l: 46, r: 14, t: 14, b: 30 }
const w = W - m.l - m.r
const h = H - m.t - m.b

const t0 = computed(() => props.start.getTime())
const t1 = computed(() => props.end.getTime())
const yMax = computed(() => Math.max(props.allowance, ...props.points.map(p => p.odometer - props.startKm)))

const x = (t: number) => m.l + ((t - t0.value) / (t1.value - t0.value)) * w
const y = (km: number) => m.t + h - (km / yMax.value) * h

const series = computed(() => [
  { date: localISO(props.start), km: 0, x: x(t0.value), y: y(0) },
  ...props.points
    .filter(p => new Date(p.date + 'T00:00:00').getTime() >= t0.value)
    .map((p) => {
      const t = new Date(p.date + 'T00:00:00').getTime()
      const km = p.odometer - props.startKm
      return { date: p.date, km, x: x(t), y: y(km) }
    })
])
const path = computed(() => series.value.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' '))
const limit = computed(() => ({ x1: x(t0.value), y1: y(0), x2: x(t1.value), y2: y(props.allowance) }))
const todayX = computed(() => {
  const t = Date.now()
  return t > t0.value && t < t1.value ? x(t) : null
})
const yTicks = computed(() => [0, 0.5, 1].map(f => ({ y: y(yMax.value * f), label: num(Math.round((yMax.value * f) / 100) * 100, 0) })))
const shortDate = (d: Date) => d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })

const hover = ref<number | null>(null)
function onMove(e: PointerEvent) {
  const svg = e.currentTarget as SVGElement
  const rect = svg.getBoundingClientRect()
  const px = ((e.clientX - rect.left) / rect.width) * W
  let best = 0
  series.value.forEach((p, i) => {
    if (Math.abs(p.x - px) < Math.abs(series.value[best]!.x - px)) best = i
  })
  hover.value = best
}
const hp = computed(() => (hover.value != null ? series.value[hover.value] : null))
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/70">
      <span class="flex items-center gap-2">
        <span class="h-0.5 w-5 rounded-full bg-red-500" /> Tus km
      </span>
      <span class="flex items-center gap-2">
        <span class="w-5 border-t-2 border-dashed border-white/50" /> Límite {{ num(annualKm, 0) }} km/año
      </span>
    </div>

    <div class="relative">
      <svg
        :viewBox="`0 0 ${W} ${H}`"
        class="w-full touch-pan-y"
        role="img"
        aria-label="Evolución de los km frente al límite anual"
        @pointermove="onMove"
        @pointerleave="hover = null"
      >
        <g
          stroke="rgb(255 255 255 / .08)"
          stroke-width="1"
        >
          <line
            v-for="t in yTicks"
            :key="t.label"
            :x1="m.l"
            :x2="W - m.r"
            :y1="t.y"
            :y2="t.y"
          />
        </g>
        <g
          class="fill-white/50 font-mono"
          font-size="9"
        >
          <text
            v-for="t in yTicks"
            :key="t.label"
            :x="m.l - 8"
            :y="t.y + 3"
            text-anchor="end"
          >{{ t.label }}</text>
          <text
            :x="m.l"
            :y="H - 8"
          >{{ shortDate(start) }}</text>
          <text
            :x="W - m.r"
            :y="H - 8"
            text-anchor="end"
          >{{ shortDate(end) }}</text>
        </g>

        <line
          v-if="todayX"
          :x1="todayX"
          :x2="todayX"
          :y1="m.t"
          :y2="m.t + h"
          stroke="rgb(255 255 255 / .18)"
          stroke-dasharray="2 4"
        />
        <line
          :x1="limit.x1"
          :y1="limit.y1"
          :x2="limit.x2"
          :y2="limit.y2"
          stroke="rgb(255 255 255 / .5)"
          stroke-width="2"
          stroke-dasharray="6 6"
          stroke-linecap="round"
        />
        <path
          :d="path"
          stroke="#ef4444"
          stroke-width="2"
          stroke-linejoin="round"
          stroke-linecap="round"
          fill="none"
        />
        <circle
          v-for="(p, i) in series"
          :key="i"
          :cx="p.x"
          :cy="p.y"
          r="4"
          fill="#ef4444"
          stroke="#050507"
          stroke-width="2"
        />
        <g v-if="hp">
          <line
            :x1="hp.x"
            :x2="hp.x"
            :y1="m.t"
            :y2="m.t + h"
            stroke="rgb(255 255 255 / .35)"
          />
          <circle
            :cx="hp.x"
            :cy="hp.y"
            r="6"
            fill="#ef4444"
            stroke="#fff"
            stroke-width="2"
          />
        </g>
      </svg>

      <div
        v-if="hp"
        class="panel pointer-events-none absolute -top-2 -translate-x-1/2 -translate-y-full !rounded-2xl px-4 py-2 text-xs"
        :style="{ left: `${Math.min(Math.max((hp.x / W) * 100, 18), 82)}%` }"
      >
        <p class="text-white/60">
          {{ fmtDate(hp.date) }}
        </p>
        <p class="font-mono font-bold">
          {{ num(hp.km, 0) }} km <span class="font-normal text-white/50">desde el inicio</span>
        </p>
      </div>
    </div>
  </div>
</template>
