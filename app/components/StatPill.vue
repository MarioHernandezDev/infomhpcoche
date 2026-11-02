<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  decimals?: number
  suffix?: string
  unit?: string
  to?: string
  tone?: 'success' | 'warning' | 'error'
}>()

const dot = { success: 'bg-emerald-400', warning: 'bg-amber-400', error: 'bg-red-500' }
</script>

<template>
  <component
    :is="to ? 'NuxtLink' : 'div'"
    v-reveal
    :to="to"
    class="panel flex items-center justify-between gap-4 !rounded-full px-8 py-5"
  >
    <span class="flex items-center gap-3">
      <span
        v-if="tone"
        class="size-2.5 rounded-full"
        :class="dot[tone]"
      />
      <span class="hud-label">{{ label }}</span>
    </span>
    <span class="font-num text-3xl font-semibold">
      <CountUp
        v-if="typeof value === 'number'"
        :value="value"
        :decimals="decimals"
        :suffix="suffix"
      />
      <template v-else>
        {{ value }}
      </template>
      <span
        v-if="unit"
        class="ml-1.5 text-sm font-normal text-white/50"
      >{{ unit }}</span>
    </span>
  </component>
</template>
