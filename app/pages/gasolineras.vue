<script setup lang="ts">
import { Geolocation } from '@capacitor/geolocation'
import type { Station } from '~/types'

const { withBusy } = useBusy()
const { favorites, prices, load: loadFavorites, toggle, remove, isFavorite, checkPrices } = useFavorites()

const apiBase = useRuntimeConfig().public.apiBase

const stations = ref<Station[]>([])
const radius = ref(15)
const sort = ref<'precio' | 'distancia'>('precio')
const view = ref<'lista' | 'mapa'>('lista')
const onlyOpen = ref(false)
const selectedId = ref<string | null>(null)
const error = ref('')
const loaded = ref(false)
const coords = ref<{ lat: number, lng: number } | null>(null)
watch(coords, c => c && localStorage.setItem('last-coords', JSON.stringify(c)))

await loadFavorites()

// En Android pide el permiso nativo; en el navegador usa la API web
const getPosition = () => Geolocation.getCurrentPosition({ enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60_000 })

async function search(refreshPosition = true) {
  error.value = ''
  await withBusy(async () => {
    if (refreshPosition || !coords.value) {
      try {
        const p = await getPosition()
        coords.value = { lat: p.coords.latitude, lng: p.coords.longitude }
      } catch {
        error.value = 'No puedo acceder a tu ubicación. Concede el permiso de ubicación a la app.'
        return
      }
    }
    try {
      stations.value = await $fetch<Station[]>(`${apiBase}/api/stations`, {
        query: { lat: coords.value!.lat, lng: coords.value!.lng, radius: radius.value }
      })
      loaded.value = true
      selectedId.value = null
    } catch {
      error.value = 'No se pudieron cargar las gasolineras. Inténtalo de nuevo.'
    }
  })
}

const visible = computed(() =>
  stations.value
    .filter(s => !onlyOpen.value || isOpenNow(s.schedule) !== false)
    .sort((a, b) => sort.value === 'precio' ? a.glp - b.glp || a.distance - b.distance : a.distance - b.distance)
)
const cheapest = computed(() => visible.value.reduce<Station | null>((m, s) => (!m || s.glp < m.glp ? s : m), null))
const average = computed(() => visible.value.length ? visible.value.reduce((s, x) => s + x.glp, 0) / visible.value.length : 0)
const selected = computed(() => visible.value.find(s => s.id === selectedId.value) ?? null)
const favoriteIds = computed(() => favorites.value.map(f => f.station_id))

const fillHere = (s: Station) =>
  navigateTo({ path: '/repostajes', query: { nuevo: 1, fuel: 'glp', price: s.glp, station: `${s.brand} ${s.town}` } })

onMounted(() => {
  checkPrices(false)
  const saved = localStorage.getItem('last-coords')
  if (saved) {
    coords.value = JSON.parse(saved)
    search(false)
  }
})
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <p
          v-reveal
          class="hud-label"
        >
          Gasolineras con
        </p>
        <AnimTitle
          text="GLP CERCA"
          class="font-display text-3xl tracking-[0.1em] glow-text"
        />
      </div>
      <UButton
        icon="i-lucide-locate-fixed"
        @click="search()"
      >
        Mi ubicación
      </UButton>
    </div>

    <div
      v-if="favorites.length"
      class="space-y-4"
    >
      <p
        v-reveal
        class="section-title"
      >
        Mis favoritas
      </p>
      <FavoriteRow
        v-for="(f, i) in favorites"
        :key="f.id"
        v-reveal="i"
        :fav="f"
        :price="prices[f.station_id] ?? f.last_glp"
        @remove="remove(f)"
      />
    </div>

    <div class="space-y-4">
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
      <div class="flex gap-3">
        <UTabs
          v-model="view"
          :items="[{ label: 'Lista', value: 'lista', icon: 'i-lucide-list' }, { label: 'Mapa', value: 'mapa', icon: 'i-lucide-map' }]"
          :content="false"
          size="sm"
          class="flex-1"
        />
        <UButton
          :color="onlyOpen ? 'primary' : 'neutral'"
          :variant="onlyOpen ? 'soft' : 'outline'"
          icon="i-lucide-clock"
          @click="onlyOpen = !onlyOpen"
        >
          Abiertas ahora
        </UButton>
      </div>
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
      <strong class="ml-1 text-red-400"> {{ cheapest.brand }} · {{ num(cheapest.glp, 3) }} €/L</strong>
      <span class="ml-1 text-white/60">({{ num((average - cheapest.glp) * 40, 2) }} € menos que la media en 40 L)</span>
    </div>

    <template v-if="view === 'mapa'">
      <StationMap
        v-if="loaded"
        :stations="visible"
        :favorite-ids="favoriteIds"
        :selected-id="selectedId"
        :best-id="cheapest?.id ?? null"
        :user="coords"
        @select="selectedId = $event"
      />
      <StationCard
        v-if="selected"
        :station="selected"
        :favorite="isFavorite(selected.id)"
        :best="selected.id === cheapest?.id"
        @fav="toggle(selected)"
        @fill="fillHere(selected)"
      />
      <p
        v-else-if="loaded"
        class="text-sm text-white/50"
      >
        Toca un precio del mapa para ver la gasolinera.
      </p>
    </template>

    <div
      v-else
      class="space-y-5"
    >
      <StationCard
        v-for="(s, i) in visible"
        :key="s.id"
        v-reveal="i"
        :station="s"
        :favorite="isFavorite(s.id)"
        :best="s.id === cheapest?.id"
        @fav="toggle(s)"
        @fill="fillHere(s)"
      />
    </div>

    <p
      v-if="loaded && !visible.length"
      class="text-sm text-white/50"
    >
      No hay gasolineras con GLP{{ onlyOpen ? ' abiertas ahora' : '' }} en {{ radius }} km. Prueba con un radio mayor.
    </p>
    <p
      v-if="!loaded && !error"
      class="text-sm text-white/50"
    >
      Pulsa «Mi ubicación» para ver las gasolineras con GLP a tu alrededor. Precios oficiales del Ministerio, actualizados cada 30 min.
    </p>
  </div>
</template>
