<script setup lang="ts">
const { fillups, load: loadFillups } = useFillups()
const { reminders, load, add, toggle, remove, status } = useReminders()
await Promise.all([load(), loadFillups()])

const currentKm = computed(() => fillups.value[0]?.odometer ?? 0)
const open = ref(false)
const pick = (t: string) => {
  form.title = t
  open.value = true
}
const suggestions = ['ITV', 'Seguro', 'Revisión', 'Neumáticos', 'Revisión del equipo GLP']
const error = ref('')
const form = reactive({ title: '', due_date: '', due_odometer: undefined as number | undefined })

async function save() {
  error.value = ''
  if (!form.title || (!form.due_date && form.due_odometer == null)) {
    error.value = 'Pon un título y una fecha o unos km'
    return
  }
  const err = await add({ title: form.title, due_date: form.due_date || null, due_odometer: form.due_odometer ?? null })
  if (err) {
    error.value = err.message
    return
  }
  Object.assign(form, { title: '', due_date: '', due_odometer: undefined })
  open.value = false
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="font-display text-3xl tracking-[0.1em]">
        Avisos
      </h1>
      <UButton
        icon="i-lucide-plus"
        @click="open = true"
      >
        Nuevo
      </UButton>
    </div>
    <p class="text-sm text-muted">
      ITV, seguro, revisión, aceite… por fecha y/o km. Avisamos 30 días o 1.000 km antes.
    </p>

    <div class="flex flex-wrap gap-2">
      <UButton
        v-for="t in suggestions"
        :key="t"
        size="xs"
        color="neutral"
        variant="outline"
        @click="pick(t)"
      >
        + {{ t }}
      </UButton>
    </div>

    <UCard
      v-for="r in reminders"
      :key="r.id"
    >
      <div class="flex items-center gap-3">
        <UCheckbox
          :model-value="r.done"
          @update:model-value="toggle(r)"
        />
        <div
          class="flex-1"
          :class="{ 'line-through text-muted': r.done }"
        >
          <p class="font-medium">
            {{ r.title }}
          </p>
          <p class="text-xs text-muted">
            <span v-if="r.due_date">{{ fmtDate(r.due_date) }}</span>
            <span v-if="r.due_date && r.due_odometer != null"> · </span>
            <span v-if="r.due_odometer != null">{{ num(r.due_odometer, 0) }} km</span>
          </p>
        </div>
        <UBadge
          v-if="status(r, currentKm)?.level"
          :color="status(r, currentKm)!.level!"
          variant="subtle"
        >
          {{ status(r, currentKm)!.level === 'error' ? 'Vencido' : 'Pronto' }}
        </UBadge>
        <UButton
          icon="i-lucide-trash-2"
          size="xs"
          color="neutral"
          variant="ghost"
          aria-label="Borrar"
          @click="remove(r.id)"
        />
      </div>
    </UCard>
    <p
      v-if="!reminders.length"
      class="text-sm text-muted"
    >
      Sin avisos todavía.
    </p>

    <USlideover
      v-model:open="open"
      side="bottom"
      title="Nuevo aviso"
    >
      <template #body>
        <form
          class="space-y-4"
          @submit.prevent="save"
        >
          <UFormField label="Qué">
            <UInput
              v-model="form.title"
              placeholder="ITV, seguro, aceite…"
              size="xl"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Fecha límite">
            <UInput
              v-model="form.due_date"
              type="date"
              size="xl"
            />
          </UFormField>
          <UFormField label="o a los km">
            <UInput
              v-model.number="form.due_odometer"
              type="number"
              inputmode="numeric"
              size="xl"
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
          >
            Guardar
          </UButton>
        </form>
      </template>
    </USlideover>
  </div>
</template>
