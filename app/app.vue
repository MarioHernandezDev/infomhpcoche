<script setup lang="ts">
const user = useSupabaseUser()
const route = useRoute()

const tabs = [
  { to: '/', label: 'Resumen', icon: 'i-lucide-gauge' },
  { to: '/km', label: 'Km', icon: 'i-lucide-route' },
  { to: '/gasolineras', label: 'GLP', icon: 'i-lucide-map-pin' },
  { to: '/repostajes', label: 'Repostajes', icon: 'i-lucide-fuel' },
  { to: '/recordatorios', label: 'Avisos', icon: 'i-lucide-bell' }
]
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator
      color="#ef4444"
      :height="3"
    />
    <AppLoader />

    <div class="min-h-dvh pb-28">
      <UContainer class="max-w-xl py-8">
        <NuxtPage />
      </UContainer>
    </div>

    <nav
      v-if="user && route.path !== '/login'"
      class="fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-black/70 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]"
    >
      <div class="mx-auto max-w-xl grid grid-cols-5">
        <NuxtLink
          v-for="t in tabs"
          :key="t.to"
          :to="t.to"
          class="flex flex-col items-center gap-0.5 py-3 text-[0.6rem] tracking-wider uppercase transition"
          :class="route.path === t.to ? 'text-red-400' : 'text-white/45'"
        >
          <UIcon
            :name="t.icon"
            class="size-6"
            :style="route.path === t.to ? 'filter: drop-shadow(0 0 6px #ef4444)' : ''"
          />
          {{ t.label }}
        </NuxtLink>
      </div>
    </nav>
  </UApp>
</template>
