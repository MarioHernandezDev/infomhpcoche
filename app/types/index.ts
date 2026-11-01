export type Fuel = 'glp' | 'gasolina'

export type Fillup = {
  id: string
  date: string
  fuel: Fuel
  liters: number
  price_per_liter: number
  total: number
  odometer: number
  station: string | null
  notes: string | null
}

export type Reminder = {
  id: string
  title: string
  due_date: string | null
  due_odometer: number | null
  done: boolean
}

export type KmLog = {
  id: string
  date: string
  odometer: number
}

export type KmSettings = {
  annual_km: number
  start_date: string | null
  start_km: number
}
