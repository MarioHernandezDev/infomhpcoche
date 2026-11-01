import { z } from 'zod'

const query = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(1).max(100).default(15)
})

export default defineEventHandler(async (event) => {
  const { lat, lng, radius } = await getValidatedQuery(event, query.parse)

  const [glp, gas] = await Promise.all([
    fetchProduct(PRODUCT.glp),
    fetchProduct(PRODUCT.gasolina95).catch(() => [])
  ])
  const gasById = new Map(gas.map(s => [s.id, s.price]))

  return glp
    .map(({ price, ...s }) => ({
      ...s,
      glp: price,
      gasolina: gasById.get(s.id) ?? null,
      distance: distanceKm(lat, lng, s.lat, s.lng)
    }))
    .filter(s => s.distance <= radius)
    .sort((a, b) => a.distance - b.distance)
})
