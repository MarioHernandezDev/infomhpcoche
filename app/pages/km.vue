<script setup lang="ts">
const { fillups, load: loadFillups } = useFillups()
const { logs, settings, points, currentKm, pace, load, addLog, removeLog, saveSettings } = useOdometer()
await Promise.all([loadFillups(), load()])

const route = useRoute()
const today = () => localISO()

// --- Apuntar km ---
const open = ref(!!route.query.nuevo)
const form = reactive({ date: today(), odometer: undefined as number | undefined })
const error = ref('')
const saving = ref(false)

async function save() {
  error.value = ''
  if (form.odometer == null) {
    error.value = 'Escribe los km del cuentakilómetros'
    return
  }
  if (form.odometer < currentKm.value) {
    error.value = `No pueden ser menos que los últimos registrados (${num(currentKm.value, 0)})`
    return
  }
  saving.value = true
  const err = await addLog(form.date, form.odometer)
  saving.value = false
  if (err) {
    error.value = err.message
    return
  }
  Object.assign(form, { date: today(), odometer: undefined })
  open.value = false
}

const askDelete = (id: string) => window.confirm('¿Borrar este registro?') && removeLog(id)

// --- Ajustes del contrato ---
const showSettings = ref(!settings.value.start_date)
const cfg = reactive({ ...settings.value, start_date: settings.value.start_date ?? today() })
const cfgError = ref('')
async function saveCfg() {
  cfgError.value = ''
  const err = await saveSettings({ annual_km: cfg.annual_km, start_date: cfg.start_date, start_km: cfg.start_km })
  if (err) cfgError.value = err.message
  else showSettings.value = false
}

const barPct = computed(() => (pace.value ? Math.min(100, (pace.value.used / pace.value.allowanceAtEnd) * 100) : 0))
const markPct = computed(() => (pace.value ? Math.min(100, (pace.value.allowedToDate / pace.value.allowanceAtEnd) * 100) : 0))
const hasFillups = computed(() => fillups.value.length > 0)
</script>

<template>
  <div class="space-y-10">
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <p class="hud-label">
          Límite del contrato
        </p>
        <h1 class="font-display text-3xl tracking-[0.1em] glow-text">
          MIS KM
        </h1>
      </div>
      <UButton
        icon="i-lucide-plus"
        @click="open = true"
      >
        Apuntar
      </UButton>
    </div>

    <template v-if="pace">
      <div class="panel space-y-6 p-7">
        <div class="space-y-2">
          <p class="hud-label">
            Llevas
          </p>
          <p class="font-num text-6xl font-semibold">
            {{ num(pace.used, 0) }}<span class="ml-2 text-lg font-normal text-white/50">km</span>
          </p>
          <p class="text-sm text-white/60">
            de {{ num(pace.allowanceAtEnd, 0) }} km hasta el {{ fmtDate(localISO(pace.end)) }}
          </p>
        </div>

        <div class="space-y-3">
          <div class="relative h-4 rounded-full bg-white/10">
            <div
              class="h-full rounded-full bg-gradient-to-r from-red-700 to-red-500"
              :style="{ width: `${barPct}%` }"
            />
            <div
              class="absolute -top-1.5 h-7 w-0.5 rounded-full bg-white"
              :style="{ left: `${markPct}%` }"
            />
          </div>
          <p class="text-sm text-white/60">
            La marca blanca es lo que «te toca» llevar hoy ({{ num(pace.allowedToDate, 0) }} km).
            <strong :class="pace.diff > 0 ? 'text-red-400' : 'text-emerald-400'">
              {{ pace.diff > 0 ? `+${num(pace.diff, 0)} km por encima` : `${num(-pace.diff, 0)} km de margen` }}
            </strong>
          </p>
        </div>
      </div>

      <div class="space-y-4">
        <StatPill
          label="Proyección al año"
          :value="num(pace.projection, 0)"
          unit="km"
          :tone="pace.level"
        />
        <StatPill
          label="Media diaria"
          :value="num(pace.perDay, 1)"
          unit="km/día"
        />
        <StatPill
          label="Para no pasarte"
          :value="num(Math.max(0, pace.neededPerDay), 1)"
          unit="km/día"
        />
        <StatPill
          label="Te quedan"
          :value="num(Math.max(0, pace.remaining), 0)"
          unit="km"
        />
      </div>

      <div class="panel space-y-6 p-7">
        <p class="section-title">
          Evolución
        </p>
        <KmChart
          :points="points"
          :start="pace.start"
          :end="pace.end"
          :start-km="settings.start_km"
          :allowance="pace.allowanceAtEnd"
          :annual-km="settings.annual_km"
        />
        <p
          v-if="points.length < 2"
          class="text-sm text-white/50"
        >
          Apunta los km de vez en cuando y aquí verás tu línea frente al límite.
        </p>
      </div>
    </template>
    <p
      v-else
      class="text-sm text-white/60"
    >
      Configura la fecha de inicio del contrato para ver tu ritmo frente al límite anual.
    </p>

    <div class="space-y-4">
      <p class="section-title">
        Registros
      </p>
      <div
        v-for="l in logs"
        :key="l.id"
        class="panel flex items-center justify-between gap-4 !rounded-full py-3 pl-7 pr-3"
      >
        <div>
          <p class="font-num text-lg font-semibold">
            {{ num(l.odometer, 0) }} km
          </p>
          <p class="text-xs text-white/50">
            {{ fmtDate(l.date) }}
          </p>
        </div>
        <UButton
          icon="i-lucide-trash-2"
          color="neutral"
          variant="ghost"
          aria-label="Borrar"
          @click="askDelete(l.id)"
        />
      </div>
      <p
        v-if="!logs.length"
        class="text-sm text-white/50"
      >
        Aún no has apuntado km.<span v-if="hasFillups"> Los repostajes también cuentan como lecturas.</span>
      </p>
    </div>

    <div class="space-y-4">
      <UButton
        color="neutral"
        variant="outline"
        :icon="showSettings ? 'i-lucide-chevron-up' : 'i-lucide-settings-2'"
        @click="showSettings = !showSettings"
      >
        Ajustes del contrato
      </UButton>
      <form
        v-if="showSettings"
        class="panel space-y-6 p-7"
        @submit.prevent="saveCfg"
      >
        <UFormField label="Fecha de inicio (entrega del coche)">
          <UInput
            v-model="cfg.start_date"
            type="date"
            size="xl"
            class="w-full"
            required
          />
        </UFormField>
        <UFormField label="Km al empezar">
          <UInput
            v-model.number="cfg.start_km"
            type="number"
            inputmode="numeric"
            size="xl"
            class="w-full"
            required
          />
        </UFormField>
        <UFormField label="Límite de km al año">
          <UInput
            v-model.number="cfg.annual_km"
            type="number"
            inputmode="numeric"
            size="xl"
            class="w-full"
            required
          />
        </UFormField>
        <UAlert
          v-if="cfgError"
          color="error"
          variant="subtle"
          :title="cfgError"
        />
        <UButton
          type="submit"
          block
          size="xl"
        >
          Guardar
        </UButton>
      </form>
    </div>

    <USlideover
      v-model:open="open"
      side="bottom"
      title="Apuntar km"
    >
      <template #body>
        <form
          class="space-y-6"
          @submit.prevent="save"
        >
          <UFormField :label="`Km del cuentakilómetros (último: ${num(currentKm, 0)})`">
            <UInput
              v-model.number="form.odometer"
              type="number"
              inputmode="numeric"
              size="xl"
              class="w-full"
              autofocus
            />
          </UFormField>
          <UFormField label="Fecha">
            <UInput
              v-model="form.date"
              type="date"
              size="xl"
              class="w-full"
            />
          </UFormField>
          <UAlert
            v-if="error"
            color="error"
            variant="subtle"
            :title="error"
          />
          <UButton
            type="submit"
            block
            size="xl"
            :loading="saving"
          >
            Guardar
          </UButton>
        </form>
      </template>
    </USlideover>
  </div>
</template>
