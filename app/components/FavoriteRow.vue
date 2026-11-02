<script setup lang="ts">
import type { FavoriteStation } from '~/types'

const props = defineProps<{ fav: FavoriteStation, price: number | null }>()
defineEmits<{ remove: [] }>()

const mapsUrl = computed(() => `https://www.google.com/maps/dir/?api=1&destination=${props.fav.lat},${props.fav.lng}`)
</script>

<template>
  <div class="panel flex items-center justify-between gap-4 !rounded-full py-3 pl-7 pr-3">
    <div class="min-w-0">
      <p class="truncate font-semibold">
        {{ fav.name }}
      </p>
      <p class="truncate text-xs text-white/50">
        {{ fav.address }}
      </p>
    </div>
    <div class="flex shrink-0 items-center gap-1">
      <p class="font-num text-2xl font-semibold text-red-400">
        {{ num(price ?? 0, 3) }}
      </p>
      <UButton
        :to="mapsUrl"
        target="_blank"
        color="neutral"
        variant="ghost"
        icon="i-lucide-navigation"
        aria-label="Ir"
      />
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-lucide-star"
        class="text-amber-400 [&_svg]:fill-current"
        aria-label="Quitar de favoritas"
        @click="$emit('remove')"
      />
    </div>
  </div>
</template>
