<script setup lang="ts">
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Station } from '~/types'

const props = defineProps<{
  stations: Station[]
  favoriteIds: string[]
  selectedId: string | null
  bestId: string | null
  user: { lat: number, lng: number } | null
}>()
const emit = defineEmits<{ select: [id: string] }>()

const el = ref<HTMLElement>()
let map: L.Map | undefined
const layer = L.layerGroup()
let fitted = false

function pinHtml(s: Station) {
  const classes = [
    'pin',
    s.id === props.bestId ? 'pin-best' : '',
    s.id === props.selectedId ? 'pin-selected' : '',
    isOpenNow(s.schedule) === false ? 'pin-closed' : ''
  ].join(' ')
  const star = props.favoriteIds.includes(s.id) ? '★ ' : ''
  return `<div class="${classes}">${star}${num(s.glp, 3)}</div>`
}

function draw() {
  if (!map) return
  layer.clearLayers()
  for (const s of props.stations) {
    const icon = L.divIcon({ className: 'pin-wrap', html: pinHtml(s), iconSize: [64, 28], iconAnchor: [32, 30] })
    L.marker([s.lat, s.lng], { icon, zIndexOffset: s.id === props.selectedId ? 1000 : s.id === props.bestId ? 500 : 0 })
      .on('click', () => emit('select', s.id))
      .addTo(layer)
  }
  if (props.user) {
    L.circleMarker([props.user.lat, props.user.lng], { radius: 7, color: '#fff', weight: 2, fillColor: '#ef4444', fillOpacity: 1 }).addTo(layer)
  }
  if (!fitted) {
    const pts: L.LatLngTuple[] = props.stations.map(s => [s.lat, s.lng])
    if (props.user) pts.push([props.user.lat, props.user.lng])
    if (pts.length) {
      map.fitBounds(L.latLngBounds(pts), { padding: [36, 36], maxZoom: 14 })
      fitted = true
    }
  }
}

onMounted(async () => {
  await nextTick()
  if (!el.value) return
  map = L.map(el.value, { zoomControl: false, attributionControl: true }).setView(
    props.user ? [props.user.lat, props.user.lng] : [40.4, -3.7],
    12
  )
  L.control.zoom({ position: 'bottomright' }).addTo(map)
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map)
  layer.addTo(map)
  draw()
  setTimeout(() => map?.invalidateSize(), 50)
})

watch(() => [props.stations, props.favoriteIds, props.selectedId, props.bestId, props.user], draw, { deep: true })

// Centra el mapa en la gasolinera elegida
watch(() => props.selectedId, (id) => {
  const s = props.stations.find(x => x.id === id)
  if (s && map) map.panTo([s.lat, s.lng], { animate: true })
})

onBeforeUnmount(() => map?.remove())
</script>

<template>
  <div
    ref="el"
    class="h-[26rem] w-full overflow-hidden rounded-[1.75rem] border border-white/10"
  />
</template>
