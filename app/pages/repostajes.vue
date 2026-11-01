<script setup lang="ts">
import type { Fuel } from '~/types'

const { fillups, load, add, remove } = useFillups()
await load()

const route = useRoute()
const open = ref(!!route.query.nuevo)
const askDelete = (id: string) => window.confirm('¿Borrar este repostaje?') && remove(id)
const saving = ref(false)
const error = ref('')

const blank = () => ({
  date: localISO(),
  fuel: 'glp' as Fuel,
  liters: undefined as number | undefined,
  price_per_liter: undefined as number | undefined,
  odometer: undefined as number | undefined,
  station: ''
})
const form = reactive(blank())
if (route.query.fuel === 'glp' || route.query.fuel === 'gasolina') form.fuel = route.query.fuel
if (route.query.price) form.price_per_liter = Number(route.query.price)
if (route.query.station) form.station = String(route.query.station)

const total = computed(() => (form.liters ?? 0) * (form.price_per_liter ?? 0))
const lastKm = computed(() => fillups.value[0]?.odometer ?? 0)

async function save() {
  error.value = ''
  if (!form.liters || !form.price_per_liter || form.odometer == null) {
    error.value = 'Rellena litros, precio y km'
    return
  }
  if (form.odometer < lastKm.value) {
    error.value = `Los km no pueden ser menores que el último (${lastKm.value})`
    return
  }
  saving.value = true
  const err = await add({
    date: form.date,
    fuel: form.fuel,
    liters: form.liters,
    price_per_liter: form.price_per_liter,
    odometer: form.odometer,
    station: form.station || null,
    notes: null
  })
  saving.value = false
  if (err) {
    error.value = err.message
    return
  }
  Object.assign(form, blank())
  open.value = false
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="font-display text-3xl tracking-[0.1em]">
        Repostajes
      </h1>
      <UButton
        icon="i-lucide-plus"
        @click="open = true"
      >
        Nuevo
      </UButton>
    </div>

    <UCard
      v-for="f in fillups"
      :key="f.id"
    >
      <div class="flex justify-between gap-2">
        <div>
          <p class="font-medium">
            <UBadge
              :color="f.fuel === 'glp' ? 'info' : 'warning'"
              variant="subtle"
              size="sm"
            >
              {{ fuelLabel[f.fuel] }}
            </UBadge>
            {{ num(f.liters, 2) }} L · {{ num(f.price_per_liter, 3) }} €/L
          </p>
          <p class="text-xs text-muted">
            {{ fmtDate(f.date) }} · {{ num(f.odometer, 0) }} km<span v-if="f.station"> · {{ f.station }}</span>
          </p>
        </div>
        <div class="text-right">
          <p class="font-semibold">
            {{ eur(f.total) }}
          </p>
          <UButton
            icon="i-lucide-trash-2"
            size="xs"
            color="neutral"
            variant="ghost"
            aria-label="Borrar"
            @click="askDelete(f.id)"
          />
        </div>
      </div>
    </UCard>
    <p
      v-if="!fillups.length"
      class="text-sm text-muted"
    >
      Pulsa «Nuevo» para anotar tu primer repostaje.
    </p>

    <USlideover
      v-model:open="open"
      side="bottom"
      title="Nuevo repostaje"
    >
      <template #body>
        <form
          class="space-y-4"
          @submit.prevent="save"
        >
          <UFormField label="Combustible">
            <USelect
              v-model="form.fuel"
              class="w-full"
              size="xl"
              :items="[{ label: 'GLP', value: 'glp' }, { label: 'Gasolina', value: 'gasolina' }]"
            />
          </UFormField>
          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Litros">
              <UInput
                v-model.number="form.liters"
                type="number"
                step="0.01"
                inputmode="decimal"
                size="xl"
              />
            </UFormField>
            <UFormField label="€/litro">
              <UInput
                v-model.number="form.price_per_liter"
                type="number"
                step="0.001"
                inputmode="decimal"
                size="xl"
              />
            </UFormField>
          </div>
          <p class="text-sm text-muted">
            Total: <strong>{{ eur(total) }}</strong>
          </p>
          <UFormField :label="`Km del cuentakilómetros (último: ${lastKm})`">
            <UInput
              v-model.number="form.odometer"
              type="number"
              inputmode="numeric"
              size="xl"
              class="w-full"
            />
          </UFormField>
          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Fecha">
              <UInput
                v-model="form.date"
                type="date"
                size="xl"
              />
            </UFormField>
            <UFormField label="Gasolinera">
              <UInput
                v-model="form.station"
                size="xl"
              />
            </UFormField>
          </div>
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
