import type { Database } from '~/types/database.types'
import type { Reminder } from '~/types'

export function useReminders() {
  const client = useSupabaseClient<Database>()
  const reminders = useState<Reminder[]>('reminders', () => [])

  async function load() {
    const { data } = await client.from('reminders').select('*').order('due_date', { ascending: true, nullsFirst: false })
    reminders.value = (data ?? []) as Reminder[]
  }

  async function add(r: Pick<Reminder, 'title' | 'due_date' | 'due_odometer'>) {
    const { error } = await client.from('reminders').insert(r)
    if (!error) await load()
    return error
  }

  async function toggle(r: Reminder) {
    await client.from('reminders').update({ done: !r.done }).eq('id', r.id)
    await load()
  }

  async function remove(id: string) {
    await client.from('reminders').delete().eq('id', id)
    await load()
  }

  /** Aviso si falta poco: <= 30 días o <= 1000 km. */
  function status(r: Reminder, currentKm: number) {
    if (r.done) return null
    const days = r.due_date ? Math.ceil((new Date(r.due_date + 'T00:00:00').getTime() - Date.now()) / 86400000) : null
    const km = r.due_odometer != null ? r.due_odometer - currentKm : null
    const overdue = (days != null && days < 0) || (km != null && km < 0)
    const soon = (days != null && days <= 30) || (km != null && km <= 1000)
    return { days, km, level: overdue ? 'error' : soon ? 'warning' : null } as const
  }

  return { reminders, load, add, toggle, remove, status }
}
