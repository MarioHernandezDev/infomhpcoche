<script setup lang="ts">
import type { Reminder } from '~/types'

const { load: loadFillups } = useFillups()
const { currentKm, load: loadOdometer } = useOdometer()
const { reminders, load, add, remove, status } = useReminders()
const { logs, totalCost, load: loadLogs, add: addLog, remove: removeLog } = useMaintenance()
await Promise.all([load(), loadFillups(), loadOdometer(), loadLogs()])

const tab = ref<'pendientes' | 'historial'>('pendientes')
const suggestions = ['ITV', 'Seguro', 'Revisión', 'Neumáticos', 'Revisión del equipo GLP']

// --- Nuevo aviso ---
const openReminder = ref(false)
const rForm = reactive({ title: '', due_date: '', due_odometer: undefined as number | undefined })
const rError = ref('')

function pick(title: string) {
  rForm.title = title
  openReminder.value = true
}

async function saveReminder() {
  rError.value = ''
  if (!rForm.title || (!rForm.due_date && rForm.due_odometer == null)) {
    rError.value = 'Pon un título y una fecha o unos km'
    return
  }
  const err = await add({ title: rForm.title, due_date: rForm.due_date || null, due_odometer: rForm.due_odometer ?? null })
  if (err) {
    rError.value = err.message
    return
  }
  Object.assign(rForm, { title: '', due_date: '', due_odometer: undefined })
  openReminder.value = false
}

// --- Registrar algo hecho (desde un aviso o suelto) ---
const openDone = ref(false)
const source = ref<Reminder | null>(null)
const dForm = reactive({
  title: '',
  date: localISO(),
  odometer: undefined as number | undefined,
  cost: undefined as number | undefined,
  notes: '',
  repeatMonths: 0,
  repeatKm: undefined as number | undefined
})
const dError = ref('')
const saving = ref(false)

function startDone(r: Reminder | null, title = '') {
  source.value = r
  Object.assign(dForm, {
    title: r?.title ?? title,
    date: localISO(),
    odometer: currentKm.value || undefined,
    cost: undefined,
    notes: '',
    repeatMonths: 0,
    repeatKm: undefined
  })
  dError.value = ''
  openDone.value = true
}

async function saveDone() {
  dError.value = ''
  if (!dForm.title.trim()) {
    dError.value = 'Escribe qué has hecho'
    return
  }
  saving.value = true
  const err = await addLog({
    title: dForm.title.trim(),
    date: dForm.date,
    odometer: dForm.odometer ?? null,
    cost: dForm.cost ?? null,
    notes: dForm.notes.trim() || null
  })
  if (err) {
    saving.value = false
    dError.value = err.message
    return
  }
  if (source.value) await remove(source.value.id)
  if (dForm.repeatMonths || dForm.repeatKm) {
    await add({
      title: dForm.title.trim(),
      due_date: dForm.repeatMonths ? addMonths(dForm.date, dForm.repeatMonths) : null,
      due_odometer: dForm.repeatKm && dForm.odometer != null ? dForm.odometer + dForm.repeatKm : null
    })
  }
  saving.value = false
  openDone.value = false
  tab.value = 'historial'
}

const askDelete = (id: string) => window.confirm('¿Borrar este registro?') && removeLog(id)
const levelOf = (r: Reminder) => status(r, currentKm.value)?.level ?? null
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <p
          v-reveal
          class="hud-label"
        >
          Mantenimiento
        </p>
        <AnimTitle
          text="AVISOS"
          class="font-display text-3xl tracking-[0.1em] glow-text"
        />
      </div>
      <UButton
        icon="i-lucide-plus"
        @click="tab === 'pendientes' ? (openReminder = true) : startDone(null)"
      >
        {{ tab === 'pendientes' ? 'Aviso' : 'Registrar' }}
      </UButton>
    </div>

    <UTabs
      v-model="tab"
      :items="[{ label: 'Pendientes', value: 'pendientes', icon: 'i-lucide-bell' }, { label: 'Historial', value: 'historial', icon: 'i-lucide-history' }]"
      :content="false"
    />

    <!-- PENDIENTES -->
    <div
      v-if="tab === 'pendientes'"
      class="space-y-6"
    >
      <NotificationsPanel v-reveal />

      <p class="text-sm leading-relaxed text-white/60">
        ITV, seguro, revisión, aceite… por fecha y/o km. Te aviso 30 días o 1.000 km antes. Al marcarlo como hecho queda guardado en el historial.
      </p>

      <div class="flex flex-wrap gap-3">
        <UButton
          v-for="t in suggestions"
          :key="t"
          size="sm"
          color="neutral"
          variant="outline"
          @click="pick(t)"
        >
          + {{ t }}
        </UButton>
      </div>

      <div class="space-y-4">
        <div
          v-for="(r, i) in reminders"
          :key="r.id"
          v-reveal="i"
          class="panel flex items-center gap-4 p-5"
        >
          <div class="min-w-0 flex-1 space-y-1">
            <p class="flex flex-wrap items-center gap-2 font-medium">
              {{ r.title }}
              <UBadge
                v-if="levelOf(r)"
                :color="levelOf(r)!"
                variant="subtle"
                size="sm"
              >
                {{ levelOf(r) === 'error' ? 'Vencido' : 'Pronto' }}
              </UBadge>
            </p>
            <p class="text-xs text-white/50">
              <span v-if="r.due_date">{{ fmtDate(r.due_date) }}</span>
              <span v-if="r.due_date && r.due_odometer != null"> · </span>
              <span v-if="r.due_odometer != null">{{ num(r.due_odometer, 0) }} km</span>
            </p>
          </div>
          <UButton
            size="sm"
            icon="i-lucide-check"
            @click="startDone(r)"
          >
            Hecho
          </UButton>
          <UButton
            icon="i-lucide-trash-2"
            size="sm"
            color="neutral"
            variant="ghost"
            aria-label="Borrar"
            @click="remove(r.id)"
          />
        </div>
      </div>
      <p
        v-if="!reminders.length"
        class="text-sm text-white/50"
      >
        Sin avisos pendientes. Crea el primero con uno de los botones de arriba.
      </p>
    </div>

    <!-- HISTORIAL -->
    <div
      v-else
      class="space-y-6"
    >
      <StatPill
        label="Gastado en mantenimiento"
        :value="totalCost"
        :decimals="2"
        suffix=" €"
      />

      <div class="space-y-4">
        <div
          v-for="(l, i) in logs"
          :key="l.id"
          v-reveal="i"
          class="panel flex items-start gap-4 p-5"
        >
          <div class="min-w-0 flex-1 space-y-1">
            <p class="font-medium">
              {{ l.title }}
            </p>
            <p class="text-xs text-white/50">
              {{ fmtDate(l.date) }}<span v-if="l.odometer != null"> · {{ num(l.odometer, 0) }} km</span>
            </p>
            <p
              v-if="l.notes"
              class="pt-1 text-sm text-white/65"
            >
              {{ l.notes }}
            </p>
          </div>
          <div class="flex shrink-0 flex-col items-end gap-1">
            <p
              v-if="l.cost != null"
              class="font-num text-xl font-semibold"
            >
              {{ eur(l.cost) }}
            </p>
            <UButton
              icon="i-lucide-trash-2"
              size="xs"
              color="neutral"
              variant="ghost"
              aria-label="Borrar"
              @click="askDelete(l.id)"
            />
          </div>
        </div>
      </div>
      <p
        v-if="!logs.length"
        class="text-sm text-white/50"
      >
        Aquí quedará todo lo que hagas: ITV, cambio de ruedas, revisiones… Pulsa «Registrar» o marca un aviso como hecho.
      </p>
    </div>

    <!-- Nuevo aviso -->
    <USlideover
      v-model:open="openReminder"
      side="bottom"
      title="Nuevo aviso"
    >
      <template #body>
        <form
          class="space-y-6"
          @submit.prevent="saveReminder"
        >
          <UFormField label="Qué">
            <UInput
              v-model="rForm.title"
              placeholder="ITV, seguro, aceite…"
              size="xl"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Fecha límite">
            <UInput
              v-model="rForm.due_date"
              type="date"
              size="xl"
              class="w-full"
            />
          </UFormField>
          <UFormField label="o a los km">
            <UInput
              v-model.number="rForm.due_odometer"
              type="number"
              inputmode="numeric"
              size="xl"
              class="w-full"
            />
          </UFormField>
          <UAlert
            v-if="rError"
            color="error"
            variant="subtle"
            :title="rError"
          />
          <UButton
            type="submit"
            block
            size="xl"
          >
            Guardar
          </UButton>
        </form>
      </template>
    </USlideover>

    <!-- Registrar hecho -->
    <USlideover
      v-model:open="openDone"
      side="bottom"
      :title="source ? `Hecho: ${source.title}` : 'Registrar mantenimiento'"
    >
      <template #body>
        <form
          class="space-y-6"
          @submit.prevent="saveDone"
        >
          <UFormField
            v-if="!source"
            label="Qué has hecho"
          >
            <UInput
              v-model="dForm.title"
              placeholder="Cambio de ruedas, revisión, ITV…"
              size="xl"
              class="w-full"
            />
          </UFormField>
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Fecha">
              <UInput
                v-model="dForm.date"
                type="date"
                size="xl"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Km">
              <UInput
                v-model.number="dForm.odometer"
                type="number"
                inputmode="numeric"
                size="xl"
                class="w-full"
              />
            </UFormField>
          </div>
          <UFormField label="Coste (€, opcional)">
            <UInput
              v-model.number="dForm.cost"
              type="number"
              step="0.01"
              inputmode="decimal"
              size="xl"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Notas (opcional)">
            <UInput
              v-model="dForm.notes"
              placeholder="Taller, marca de neumáticos…"
              size="xl"
              class="w-full"
            />
          </UFormField>
          <div class="space-y-4 rounded-3xl border border-white/10 p-5">
            <p class="section-title">
              Repetir
            </p>
            <UFormField label="Crear el siguiente aviso en">
              <USelect
                v-model="dForm.repeatMonths"
                :items="[{ label: 'No repetir', value: 0 }, { label: '6 meses', value: 6 }, { label: '1 año', value: 12 }, { label: '2 años', value: 24 }]"
                size="xl"
                class="w-full"
              />
            </UFormField>
            <UFormField label="y/o cada (km, opcional)">
              <UInput
                v-model.number="dForm.repeatKm"
                type="number"
                inputmode="numeric"
                placeholder="15000"
                size="xl"
                class="w-full"
              />
            </UFormField>
          </div>
          <UAlert
            v-if="dError"
            color="error"
            variant="subtle"
            :title="dError"
          />
          <UButton
            type="submit"
            block
            size="xl"
            :loading="saving"
          >
            Guardar en el historial
          </UButton>
        </form>
      </template>
    </USlideover>
  </div>
</template>
