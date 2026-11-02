<script setup lang="ts">
const { fillups, load } = useFillups()
const { reminders, load: loadReminders, status } = useReminders()
const { load: loadOdometer, currentKm, pace } = useOdometer()
const { favorites, drops, load: loadFavorites, checkPrices } = useFavorites()
const client = useSupabaseClient()

await Promise.all([load(), loadReminders(), loadOdometer(), loadFavorites()])
// Las bajadas de GLP en favoritas se comprueban en segundo plano
onMounted(checkPrices)

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
        <AppLogo
          v-reveal
          class="h-16 w-auto shrink-0"
        />
        <div class="space-y-1">
          <p
            v-reveal
            class="hud-label"
          >
            Renault
          </p>
          <AnimTitle
            text="CAPTUR"
            class="font-display text-4xl tracking-[0.1em] glow-text leading-none"
          />
          <p
            v-reveal="1"
            class="hud-label !text-red-400"
          >
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

    <CarHero
      :km="currentKm"
      :glp="lastPrice('glp')"
      :gasolina="lastPrice('gasolina')"
      :used="pace?.used"
      :allowance="pace?.allowanceAtEnd"
      :allowed-to-date="pace?.allowedToDate"
    />

    <div
      v-if="alerts.length || drops.length"
      class="space-y-4"
    >
      <UAlert
        v-for="d in drops"
        :key="d.station.id"
        v-reveal
        color="success"
        variant="subtle"
        icon="i-lucide-trending-down"
        :title="`Bajó el GLP en ${d.station.name}`"
        :description="`${num(d.from, 3)} → ${num(d.to, 3)} €/L`"
      />
      <UAlert
        v-for="a in alerts"
        :key="a.r.id"
        v-reveal
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
        v-for="(x, i) in shortcuts"
        :key="x.to"
        v-reveal="i"
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
      <p
        v-reveal
        class="section-title"
      >
        Tu coche en cifras
      </p>
      <div class="space-y-4">
        <StatPill
          v-if="pace"
          label="Ritmo anual"
          :value="Math.round(pace.projection)"
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
          :value="monthCost"
          :decimals="2"
          suffix=" €"
        />
        <StatPill
          label="Coste por km"
          :value="stats ? stats.costPerKm : '—'"
          :decimals="3"
          unit="€/km"
        />
        <StatPill
          label="Consumo GLP"
          :value="stats ? stats.glpPer100 : '—'"
          :decimals="1"
          unit="L/100 km"
        />
        <StatPill
          label="Consumo gasolina"
          :value="stats ? stats.gasPer100 : '—'"
          :decimals="1"
          unit="L/100 km"
        />
      </div>
      <p
        v-reveal
        class="text-xs leading-relaxed text-white/50"
      >
        <template v-if="stats">
          Al ser bifuel, los L/100 de cada combustible se calculan sobre el total de km.
        </template>
        <template v-else>
          Las estadísticas de consumo aparecen a partir del 2.º repostaje.
        </template>
      </p>
    </div>

    <div class="space-y-5">
      <p
        v-reveal
        class="section-title"
      >
        Últimos repostajes
      </p>
      <div class="space-y-4">
        <div
          v-for="(f, i) in last"
          :key="f.id"
          v-reveal="i"
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
          <p class="font-num text-xl font-semibold">
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
      <p
        v-if="favorites.length"
        class="text-xs text-white/40"
      >
        Vigilando {{ favorites.length }} gasolinera{{ favorites.length > 1 ? 's' : '' }} favorita{{ favorites.length > 1 ? 's' : '' }}.
      </p>
    </div>
  </div>
</template>
