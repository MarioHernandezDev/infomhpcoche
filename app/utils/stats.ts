import type { Fillup, Fuel } from '~/types'

export const fuelLabel: Record<Fuel, string> = { glp: 'GLP', gasolina: 'Gasolina' }

export const eur = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n)

export const num = (n: number, d = 1) =>
  new Intl.NumberFormat('es-ES', { maximumFractionDigits: d, minimumFractionDigits: d, useGrouping: 'always' }).format(n)

/** Fecha local en formato YYYY-MM-DD (toISOString usa UTC y entre las 00:00 y las 02:00 daría el día anterior). */
export const localISO = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const fmtDate = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })

/**
 * Estadísticas entre el primer y el último repostaje.
 * El primer repostaje solo marca el km de partida; el combustible consumido
 * en el tramo es el repostado después. En un bifuel no se sabe qué km se hicieron
 * con cada combustible, así que los L/100 por combustible son sobre el total de km.
 */
export function computeStats(fillups: Fillup[]) {
  const sorted = [...fillups].sort((a, b) => a.odometer - b.odometer)
  if (sorted.length < 2) return null
  const km = sorted.at(-1)!.odometer - sorted[0]!.odometer
  if (km <= 0) return null
  const used = sorted.slice(1)
  const cost = used.reduce((s, f) => s + f.total, 0)
  const litersOf = (fuel: Fuel) => used.filter(f => f.fuel === fuel).reduce((s, f) => s + f.liters, 0)
  return {
    km,
    cost,
    costPerKm: cost / km,
    glpPer100: (litersOf('glp') / km) * 100,
    gasPer100: (litersOf('gasolina') / km) * 100
  }
}

export function addMonths(iso: string, months: number) {
  const d = new Date(iso + 'T00:00:00')
  d.setMonth(d.getMonth() + months)
  return localISO(d)
}
