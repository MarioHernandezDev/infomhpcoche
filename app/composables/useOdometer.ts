import type { Database } from '~/types/database.types'
import type { KmLog, KmSettings } from '~/types'

const DAY = 86_400_000
const toDate = (d: string) => new Date(d + 'T00:00:00')

export function useOdometer() {
  const client = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  const { fillups } = useFillups()

  const logs = useState<KmLog[]>('km-logs', () => [])
  const settings = useState<KmSettings>('km-settings', () => ({ annual_km: 20000, start_date: null, start_km: 0 }))

  async function load() {
    const [l, s] = await Promise.all([
      client.from('km_logs').select('*').order('date', { ascending: false }).order('odometer', { ascending: false }),
      client.from('settings').select('annual_km,start_date,start_km').maybeSingle()
    ])
    logs.value = (l.data ?? []) as KmLog[]
    if (s.data) settings.value = s.data as KmSettings
  }

  async function addLog(date: string, odometer: number) {
    const { error } = await client.from('km_logs').insert({ date, odometer })
    if (!error) await load()
    return error
  }

  async function removeLog(id: string) {
    await client.from('km_logs').delete().eq('id', id)
    await load()
  }

  async function saveSettings(s: KmSettings) {
    const { error } = await client.from('settings').upsert({ ...s, user_id: user.value!.sub })
    if (!error) settings.value = s
    return error
  }

  /** Todas las lecturas del cuentakilómetros (registros manuales + repostajes), de antigua a reciente. */
  const points = computed(() => {
    const all = [
      ...logs.value.map(l => ({ date: l.date, odometer: l.odometer })),
      ...fillups.value.map(f => ({ date: f.date, odometer: f.odometer }))
    ]
    return all.sort((a, b) => a.date.localeCompare(b.date) || a.odometer - b.odometer)
  })

  const currentKm = computed(() => Math.max(settings.value.start_km, ...points.value.map(p => p.odometer)))

  /** Ritmo respecto al límite anual del contrato. Null si aún no hay fecha de inicio. */
  const pace = computed(() => {
    const { annual_km, start_date, start_km } = settings.value
    if (!start_date) return null
    const start = toDate(start_date)
    const today = toDate(localISO())
    const last = points.value.at(-1)
    const lastDate = last ? toDate(last.date) : start

    const days = Math.max(1, Math.round((today.getTime() - start.getTime()) / DAY))
    const daysAtLast = Math.max(1, Math.round((lastDate.getTime() - start.getTime()) / DAY))
    const yearsIn = Math.floor(days / 365) + 1
    const end = new Date(start.getTime() + yearsIn * 365 * DAY)

    const used = currentKm.value - start_km
    const allowedToDate = (annual_km * days) / 365
    const perDay = used / daysAtLast
    const projection = perDay * 365
    const allowanceAtEnd = annual_km * yearsIn
    const daysLeft = Math.max(1, Math.round((end.getTime() - today.getTime()) / DAY))
    const remaining = allowanceAtEnd - used

    const ratio = projection / annual_km
    return {
      start,
      end,
      days,
      used,
      allowedToDate,
      diff: used - allowedToDate, // >0 vas por encima del ritmo permitido
      perDay,
      projection,
      remaining,
      neededPerDay: remaining / daysLeft,
      allowanceAtEnd,
      level: ratio > 1 ? 'error' : ratio > 0.92 ? 'warning' : 'success'
    } as const
  })

  return { logs, settings, points, currentKm, pace, load, addLog, removeLog, saveSettings }
}
