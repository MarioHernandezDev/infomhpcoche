<script setup lang="ts">
import type { Station } from '~/types'

const props = defineProps<{
  station: Station
  favorite: boolean
  best?: boolean
}>()
defineEmits<{ fav: [], fill: [] }>()

const open = computed(() => isOpenNow(props.station.schedule))
const mapsUrl = computed(() => `https://www.google.com/maps/dir/?api=1&destination=${props.station.lat},${props.station.lng}`)
</script>

<template>
  <div class="panel space-y-4 p-5">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 space-y-1">
        <p class="flex flex-wrap items-center gap-2 font-semibold">
          <span class="truncate">{{ station.brand }}</span>
          <UBadge
            v-if="best"
            color="success"
            variant="subtle"
            size="sm"
          >
            más barata
          </UBadge>
          <UBadge
            v-if="open === true"
            color="success"
            variant="outline"
            size="sm"
          >
            abierta
          </UBadge>
          <UBadge
            v-else-if="open === false"
            color="neutral"
            variant="outline"
            size="sm"
          >
            cerrada
          </UBadge>
        </p>
        <p class="truncate text-xs text-white/55">
          {{ station.address }}, {{ station.town }}
        </p>
        <p class="text-xs text-white/40">
          {{ station.schedule }}
        </p>
      </div>
      <div class="shrink-0 text-right">
        <p class="font-num text-3xl font-semibold leading-none text-red-400">
          {{ num(station.glp, 3) }}
        </p>
        <p class="mt-1 text-[0.65rem] text-white/50">
          € /L GLP
        </p>
        <p class="text-xs text-white/50">
          {{ num(station.distance, 1) }} km<span v-if="station.gasolina"> · G95 {{ num(station.gasolina, 3) }}</span>
        </p>
      </div>
    </div>
    <div class="flex items-center gap-3 pt-1">
      <UButton
        :to="mapsUrl"
        target="_blank"
        size="sm"
        color="neutral"
        variant="outline"
        icon="i-lucide-navigation"
      >
        Ir
      </UButton>
      <UButton
        size="sm"
        variant="soft"
        icon="i-lucide-fuel"
        @click="$emit('fill')"
      >
        Repostar aquí
      </UButton>
      <UButton
        class="ml-auto"
        size="sm"
        color="neutral"
        variant="ghost"
        :aria-label="favorite ? 'Quitar de favoritas' : 'Añadir a favoritas'"
        :icon="favorite ? 'i-lucide-star' : 'i-lucide-star'"
        :class="favorite ? 'text-amber-400 [&_svg]:fill-current' : ''"
        @click="$emit('fav')"
      />
    </div>
  </div>
</template>
