<script setup lang="ts">
interface Station {
  id: string
  brand: string
  address: string
  town: string
  schedule: string
  lat: number
  lng: number
  glp: number
  gasolina: number | null
  distance: number
}

const { withBusy } = useBusy()

const stations = ref<Station[]>([])
const radius = ref(15)
const sort = ref<'precio' | 'distancia'>('precio')
const error = ref('')
const loaded = ref(false)
const coords = ref<{ lat: number, lng: number } | null>(null)
watch(coords, c => c && localStorage.setItem('last-coords', JSON.stringify(c)))

function getPosition() {
  return new Promise<GeolocationPosition>((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60_000 })
  )
}

async function search(refreshPosition = true) {
  error.value = ''
  await withBusy(async () => {
    try {
      if (refreshPosition || !coords.value) {
        const p = await getPosition()
        coords.value = { lat: p.coords.latitude, lng: p.coords.longitude }
      }
      stations.value = await $fetch<Station[]>('/api/stations', {
        query: { lat: coords.value!.lat, lng: coords.value!.lng, radius: radius.value }
      })
      loaded.value = true
    } catch (e) {
      error.value = e instanceof GeolocationPositionError
        ? 'No puedo acceder a tu ubicación. Actívala en el navegador (hace falta HTTPS).'
        : 'No se pudieron cargar las gasolineras. Inténtalo de nuevo.'
    }
  })
}

const sorted = computed(() =>
  [...stations.value].sort((a, b) => sort.value === 'precio' ? a.glp - b.glp || a.distance - b.distance : a.distance - b.distance)
)
const cheapest = computed(() => stations.value.reduce<Station | null>((m, s) => (!m || s.glp < m.glp ? s : m), null))
const average = computed(() => stations.value.length ? stations.value.reduce((s, x) => s + x.glp, 0) / stations.value.length : 0)

const mapsUrl = (s: Station) => `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`
const fillHere = (s: Station) =>
  navigateTo({ path: '/repostajes', query: { nuevo: 1, fuel: 'glp', price: s.glp, station: `${s.brand} ${s.town}` } })

onMounted(() => {
  const saved = localStorage.getItem('last-coords')
  if (saved) {
    coords.value = JSON.parse(saved)
    search(false)
  }
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="hud-label">
          Gasolineras con
        </p>
        <h1 class="font-display text-3xl tracking-[0.1em] glow-text">
          GLP CERCA
        </h1>
      </div>
      <UButton
        icon="i-lucide-locate-fixed"
        @click="search()"
      >
        Mi ubicación
      </UButton>
    </div>

    <div class="flex gap-3">
      <USelect
        v-model="radius"
        :items="[{ label: '5 km', value: 5 }, { label: '15 km', value: 15 }, { label: '30 km', value: 30 }, { label: '60 km', value: 60 }]"
        class="w-28"
        @update:model-value="coords && search(false)"
      />
      <UTabs
        v-model="sort"
        :items="[{ label: 'Más baratas', value: 'precio' }, { label: 'Más cercanas', value: 'distancia' }]"
        :content="false"
        size="sm"
        class="flex-1"
      />
    </div>

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      :title="error"
    />

    <div
      v-if="cheapest"
      class="panel p-5 text-sm leading-relaxed"
    >
      <span class="text-white/60">Más barata en {{ radius }} km:</span>
      <strong class="text-red-400"> {{ cheapest.brand }} · {{ num(cheapest.glp, 3) }} €/L</strong>
      <span class="text-white/60"> ({{ num((average - cheapest.glp) * 40, 2) }} € menos que la media en 40 L)</span>
    </div>

    <div
      v-for="s in sorted"
      :key="s.id"
      class="panel space-y-4 p-5"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="truncate font-semibold">
            {{ s.brand }}
            <UBadge
              v-if="s.id === cheapest?.id"
              color="success"
              variant="subtle"
              size="sm"
            >
              más barata
            </UBadge>
          </p>
          <p class="truncate text-xs text-white/55">
            {{ s.address }}, {{ s.town }}
          </p>
          <p class="text-xs text-white/40">
            {{ s.schedule }}
          </p>
        </div>
        <div class="shrink-0 text-right">
          <p class="font-mono text-xl font-bold text-red-400">
            {{ num(s.glp, 3) }}
          </p>
          <p class="text-[0.65rem] text-white/50">
            € /L GLP
          </p>
          <p class="text-xs text-white/50">
            {{ num(s.distance, 1) }} km<span v-if="s.gasolina"> · G95 {{ num(s.gasolina, 3) }}</span>
          </p>
        </div>
      </div>
      <div class="flex gap-2">
        <UButton
          :to="mapsUrl(s)"
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
          @click="fillHere(s)"
        >
          Repostar aquí
        </UButton>
      </div>
    </div>

    <p
      v-if="loaded && !stations.length"
      class="text-sm text-white/50"
    >
      No hay gasolineras con GLP en {{ radius }} km. Prueba con un radio mayor.
    </p>
    <p
      v-if="!loaded && !error"
      class="text-sm text-white/50"
    >
      Pulsa «Mi ubicación» para ver las gasolineras con GLP a tu alrededor. Precios oficiales del Ministerio, actualizados cada 30 min.
    </p>
  </div>
</template>
