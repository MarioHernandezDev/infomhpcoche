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

export type MaintenanceLog = {
  id: string
  title: string
  date: string
  odometer: number | null
  cost: number | null
  notes: string | null
}

export type FavoriteStation = {
  id: string
  station_id: string
  name: string
  address: string | null
  lat: number
  lng: number
  last_glp: number | null
}

export type Station = {
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
