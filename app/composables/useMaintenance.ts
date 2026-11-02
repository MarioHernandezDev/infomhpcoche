import type { Database } from '~/types/database.types'
import type { MaintenanceLog } from '~/types'

export function useMaintenance() {
  const client = useSupabaseClient<Database>()
  const logs = useState<MaintenanceLog[]>('maintenance', () => [])

  async function load() {
    const { data } = await client.from('maintenance_logs').select('*').order('date', { ascending: false })
    logs.value = (data ?? []) as MaintenanceLog[]
  }

  async function add(l: Omit<MaintenanceLog, 'id'>) {
    const { error } = await client.from('maintenance_logs').insert(l)
    if (!error) await load()
    return error
  }

  async function remove(id: string) {
    await client.from('maintenance_logs').delete().eq('id', id)
    await load()
  }

  const totalCost = computed(() => logs.value.reduce((s, l) => s + (l.cost ?? 0), 0))

  return { logs, totalCost, load, add, remove }
}
