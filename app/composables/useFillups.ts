import type { Database } from '~/types/database.types'
import type { Fillup } from '~/types'

export function useFillups() {
  const client = useSupabaseClient<Database>()
  const fillups = useState<Fillup[]>('fillups', () => [])
  const loading = useState('fillups-loading', () => false)

  async function load() {
    loading.value = true
    const { data } = await client
      .from('fillups')
      .select('*')
      .order('odometer', { ascending: false })
    fillups.value = (data ?? []) as Fillup[]
    loading.value = false
  }

  async function add(f: Omit<Fillup, 'id' | 'total'>) {
    const { error } = await client.from('fillups').insert(f)
    if (!error) await load()
    return error
  }

  async function remove(id: string) {
    const { error } = await client.from('fillups').delete().eq('id', id)
    if (!error) await load()
    return error
  }

  return { fillups, loading, load, add, remove }
}
