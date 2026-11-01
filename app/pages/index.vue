<script setup lang="ts">
const { fillups, load } = useFillups()
const { reminders, load: loadReminders, status } = useReminders()
const { load: loadOdometer, currentKm, pace } = useOdometer()
const client = useSupabaseClient()

await Promise.all([load(), loadReminders(), loadOdometer()])

const stats = computed(() => computeStats(fillups.value))
const lastPrice = (fuel: 'glp' | 'gasolina') => fillups.value.find(f => f.fuel === fuel)?.price_per_liter ?? null
const monthCost = computed(() => {
  const m = localISO().slice(0, 7)
  return fillups.value.filter(f => f.date.startsWith(m)).reduce((s, f) => s + f.total, 0)
})
const alerts = computed(() =>
  reminders.value
    .map(r => ({ r, s: status(r, currentKm.value) }))
    .filter(x => x.s?.level)
)
const last = computed(() => fillups.value.slice(0, 3))

const shortcuts = [
  { to: '/repostajes?nuevo=1', label: 'Repostar', icon: 'i-lucide-fuel' },
  { to: '/km?nuevo=1', label: 'Km', icon: 'i-lucide-route' },
  { to: '/gasolineras', label: 'GLP cerca', icon: 'i-lucide-map-pin' },
  { to: '/recordatorios', label: 'Avisos', icon: 'i-lucide-bell-ring' }
]

async function logout() {
  await client.auth.signOut()
  navigateTo('/login')
}
</script>

<template>
  <div class="space-y-12">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <AppLogo class="h-16 w-auto shrink-0" />
        <div class="space-y-1">
          <p class="hud-label">
            Renault
          </p>
          <h1 class="font-display text-4xl tracking-[0.1em] glow-text leading-none">
            CAPTUR
          </h1>
          <p class="hud-label !text-red-400">
            Techno · Eco-G 120
          </p>
        </div>
      </div>
      <UButton
        icon="i-lucide-log-out"
        color="neutral"
        variant="ghost"
        aria-label="Salir"
        @click="logout"
      />
    </div>

    <div class="space-y-8">
      <CarHero
        :glp="lastPrice('glp')"
        :gasolina="lastPrice('gasolina')"
      />

      <div class="space-y-2 text-center">
        <p class="hud-label">
          Cuentakilómetros
        </p>
        <p class="font-num text-6xl font-semibold tracking-wide">
          {{ num(currentKm, 0) }}<span class="ml-2 text-lg text-white/50">km</span>
        </p>
      </div>
    </div>

    <div
      v-if="alerts.length"
      class="space-y-4"
    >
      <UAlert
        v-for="a in alerts"
        :key="a.r.id"
        :color="a.s!.level === 'error' ? 'error' : 'warning'"
        variant="subtle"
        icon="i-lucide-triangle-alert"
        :title="a.r.title"
        :description="[
          a.s!.days != null ? (a.s!.days < 0 ? `venció hace ${-a.s!.days} días` : `en ${a.s!.days} días`) : '',
          a.s!.km != null ? (a.s!.km < 0 ? `pasado ${-a.s!.km} km` : `en ${a.s!.km} km`) : ''
        ].filter(Boolean).join(' · ')"
      />
    </div>

    <div class="grid grid-cols-4 gap-2">
      <NuxtLink
        v-for="x in shortcuts"
        :key="x.to"
        :to="x.to"
        class="hex block aspect-[1/1.05]"
      >
        <div class="hex-inner">
          <UIcon
            :name="x.icon"
            class="size-6 text-red-400"
          />
          <span class="font-display text-[0.65rem] uppercase tracking-[0.12em] text-white/85">{{ x.label }}</span>
        </div>
      </NuxtLink>
    </div>

    <div class="space-y-5">
      <p class="section-title">
        Tu coche en cifras
      </p>
      <div class="space-y-4">
        <StatPill
          v-if="pace"
          label="Ritmo anual"
          :value="num(pace.projection, 0)"
          unit="km/año"
          :tone="pace.level"
          to="/km"
        />
        <StatPill
          v-else
          label="Ritmo anual"
          value="Configurar"
          to="/km"
        />
        <StatPill
          label="Gasto del mes"
          :value="eur(monthCost)"
        />
        <StatPill
          label="Coste por km"
          :value="stats ? num(stats.costPerKm, 3) : '—'"
          unit="€/km"
        />
        <StatPill
          label="Consumo GLP"
          :value="stats ? num(stats.glpPer100) : '—'"
          unit="L/100 km"
        />
        <StatPill
          label="Consumo gasolina"
          :value="stats ? num(stats.gasPer100) : '—'"
          unit="L/100 km"
        />
      </div>
      <p class="text-xs leading-relaxed text-white/50">
        <template v-if="stats">
          Al ser bifuel, los L/100 de cada combustible se calculan sobre el total de km.
        </template>
        <template v-else>
          Las estadísticas de consumo aparecen a partir del 2.º repostaje.
        </template>
      </p>
    </div>

    <div class="space-y-5">
      <p class="section-title">
        Últimos repostajes
      </p>
      <div class="space-y-4">
        <div
          v-for="f in last"
          :key="f.id"
          class="panel flex items-center justify-between gap-4 !rounded-full px-8 py-4"
        >
          <div>
            <p class="font-medium">
              {{ fuelLabel[f.fuel] }} · {{ num(f.liters, 2) }} L
            </p>
            <p class="text-xs text-white/50">
              {{ fmtDate(f.date) }} · {{ num(f.odometer, 0) }} km
            </p>
          </div>
          <p class="font-num font-semibold">
            {{ eur(f.total) }}
          </p>
        </div>
      </div>
      <p
        v-if="!last.length"
        class="text-sm text-white/50"
      >
        Aún no hay repostajes.
      </p>
    </div>
  </div>
</template>
