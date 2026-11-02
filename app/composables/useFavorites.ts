import type { Database } from '~/types/database.types'
import type { FavoriteStation, Station } from '~/types'

export type PriceDrop = { station: FavoriteStation, from: number, to: number }

export function useFavorites() {
  const client = useSupabaseClient<Database>()
  const apiBase = useRuntimeConfig().public.apiBase
  const favorites = useState<FavoriteStation[]>('favorites', () => [])
  const drops = useState<PriceDrop[]>('price-drops', () => [])
  const prices = useState<Record<string, number>>('favorite-prices', () => ({}))

  async function load() {
    const { data } = await client.from('favorite_stations').select('*').order('created_at')
    favorites.value = (data ?? []) as FavoriteStation[]
  }

  const isFavorite = (id: string) => favorites.value.some(f => f.station_id === id)

  async function toggle(s: Station) {
    const existing = favorites.value.find(f => f.station_id === s.id)
    if (existing) {
      await client.from('favorite_stations').delete().eq('id', existing.id)
    } else {
      await client.from('favorite_stations').insert({
        station_id: s.id,
        name: `${s.brand} · ${s.town}`,
        address: s.address,
        lat: s.lat,
        lng: s.lng,
        last_glp: s.glp
      })
    }
    await load()
  }

  async function remove(f: FavoriteStation) {
    await client.from('favorite_stations').delete().eq('id', f.id)
    await load()
  }

  /**
   * Trae el precio actual de las favoritas. Con commit=true (portada) compara con el último visto,
   * guarda las bajadas para avisar y actualiza el precio de referencia.
   */
  async function checkPrices(commit = true) {
    if (!favorites.value.length) return
    try {
      const current = await $fetch<{ id: string, glp: number }[]>(`${apiBase}/api/stations-by-id`, {
        query: { ids: favorites.value.map(f => f.station_id).join(',') }
      })
      prices.value = Object.fromEntries(current.map(c => [c.id, c.glp]))
      if (!commit) return
      const found: PriceDrop[] = []
      for (const f of favorites.value) {
        const now = prices.value[f.station_id]
        if (now == null || now === f.last_glp) continue
        if (f.last_glp != null && now < f.last_glp - 0.0001) found.push({ station: f, from: f.last_glp, to: now })
        await client.from('favorite_stations').update({ last_glp: now }).eq('id', f.id)
      }
      drops.value = found
      if (current.length) await load()
    } catch {
      // sin conexión o API caída: no pasa nada, se reintenta la próxima vez
    }
  }

  return { favorites, drops, prices, load, toggle, remove, isFavorite, checkPrices }
}
