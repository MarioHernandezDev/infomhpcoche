import { z } from 'zod'

const query = z.object({
  ids: z.string().regex(/^[\d,]+$/).max(500)
})

// Precio actual de GLP de unas gasolineras concretas (para vigilar las favoritas)
export default defineEventHandler(async (event) => {
  const { ids } = await getValidatedQuery(event, query.parse)
  const wanted = new Set(ids.split(','))
  const glp = await fetchProduct(PRODUCT.glp)
  return glp.filter(s => wanted.has(s.id)).map(s => ({ id: s.id, glp: s.price }))
})
