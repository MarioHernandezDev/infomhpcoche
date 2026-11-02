<script setup lang="ts">
import gsap from 'gsap'

const props = defineProps<{ text: string }>()
const root = ref<HTMLElement>()
const NBSP = String.fromCharCode(160)

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const ctx = gsap.context(() => {
    gsap.from('.ch', {
      x: -34,
      skewX: -14,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out',
      stagger: 0.03
    })
  }, root.value)
  onBeforeUnmount(() => ctx.revert())
})
</script>

<template>
  <h1
    ref="root"
    :aria-label="props.text"
  >
    <span
      v-for="(c, i) in props.text.split('')"
      :key="i"
      class="ch inline-block"
      aria-hidden="true"
    >{{ c === ' ' ? NBSP : c }}</span>
  </h1>
</template>
