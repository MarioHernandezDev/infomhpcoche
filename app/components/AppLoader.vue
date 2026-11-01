<script setup lang="ts">
// Pantalla completa borrosa con loader. Espera 150 ms para no parpadear en cargas rápidas.
const { isLoading } = useLoadingIndicator()
const { busy } = useBusy()

const wanted = computed(() => isLoading.value || busy.value)
const visible = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

watch(wanted, (w) => {
  clearTimeout(timer)
  if (w) timer = setTimeout(() => (visible.value = true), 150)
  else visible.value = false
}, { immediate: true })
</script>

<template>
  <Transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 z-[100] grid place-items-center bg-black/55 backdrop-blur-md"
      role="status"
      aria-label="Cargando"
    >
      <div class="relative size-36">
        <svg
          viewBox="0 0 100 100"
          class="absolute inset-0 animate-spin [animation-duration:1.1s]"
        >
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="rgb(255 255 255 / .08)"
            stroke-width="3"
          />
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="#ef4444"
            stroke-width="3"
            stroke-linecap="round"
            stroke-dasharray="70 210"
            style="filter: drop-shadow(0 0 6px #ef4444)"
          />
        </svg>
        <AppLogo class="absolute inset-0 m-auto w-24 animate-pulse" />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
