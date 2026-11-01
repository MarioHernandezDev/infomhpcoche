const BASE = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRestCarburantes/PreciosCarburantes/EstacionesTerrestres/FiltroProducto'

// Ids de producto del Ministerio
export const PRODUCT = { glp: 17, gasolina95: 1 } as const

export interface MineturStation {
  id: string
  brand: string
  address: string
  town: string
  schedule: string
  lat: number
  lng: number
  price: number
}

const dec = (s: string) => Number.parseFloat(s.replace(',', '.'))

export const fetchProduct = defineCachedFunction(async (product: number): Promise<MineturStation[]> => {
  const res = await $fetch<{ ListaEESSPrecio: Record<string, string>[] }>(`${BASE}/${product}`, { timeout: 30000 })
  return res.ListaEESSPrecio
    .map(s => ({
      id: s.IDEESS!,
      brand: s['Rótulo']!.trim(),
      address: s['Dirección']!.trim(),
      town: s.Municipio!.trim(),
      schedule: s.Horario!.trim(),
      lat: dec(s.Latitud!),
      lng: dec(s['Longitud (WGS84)']!),
      price: dec(s.PrecioProducto!)
    }))
    .filter(s => Number.isFinite(s.lat) && Number.isFinite(s.lng) && Number.isFinite(s.price))
}, { name: 'minetur', getKey: (p: number) => String(p), maxAge: 60 * 30, swr: true })

export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const r = (d: number) => (d * Math.PI) / 180
  const a = Math.sin(r(lat2 - lat1) / 2) ** 2
    + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(r(lng2 - lng1) / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(a))
}
