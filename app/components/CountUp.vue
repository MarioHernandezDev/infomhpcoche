<script setup lang="ts">
import gsap from 'gsap'

const props = withDefaults(defineProps<{
  value: number
  decimals?: number
  suffix?: string
  duration?: number
}>(), { decimals: 0, suffix: '', duration: 0.8 })

const el = ref<HTMLElement>()
const text = (v: number) => `${num(v, props.decimals)}${props.suffix}`
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
let tween: gsap.core.Tween | undefined

// Escribe directamente en el DOM en cada frame: evita que Vue re-renderice 60 veces por segundo
function run(from: number) {
  const o = { v: from }
  tween?.kill()
  tween = gsap.to(o, {
    v: props.value,
    duration: props.duration,
    ease: 'power2.out',
    onUpdate: () => {
      if (el.value) el.value.textContent = text(o.v)
    }
  })
}

onMounted(() => {
  if (!reduced()) run(0)
})

watch(() => props.value, (v) => {
  if (reduced()) {
    if (el.value) el.value.textContent = text(v)
    return
  }
  run(Number.parseFloat((el.value?.textContent ?? '0').replace(/\./g, '').replace(',', '.')) || 0)
})

onBeforeUnmount(() => tween?.kill())
</script>

<template>
  <span
    v-once
    ref="el"
    class="font-num"
  >{{ text(value) }}</span>
</template>
