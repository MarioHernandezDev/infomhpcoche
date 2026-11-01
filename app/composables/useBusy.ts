/** Contador global para mostrar el loader a pantalla completa en cargas puntuales. */
export function useBusy() {
  const count = useState('busy-count', () => 0)

  async function withBusy<T>(fn: () => Promise<T>): Promise<T> {
    count.value++
    try {
      return await fn()
    } finally {
      count.value--
    }
  }

  return { busy: computed(() => count.value > 0), withBusy }
}
