<script setup lang="ts">
const { supported, enabled, permission, enable, disable, sendTest } = useNotifications()
const busy = ref(false)
const sent = ref(false)

async function turnOn() {
  busy.value = true
  await enable()
  busy.value = false
}

async function test() {
  await sendTest()
  sent.value = true
  setTimeout(() => (sent.value = false), 4000)
}
</script>

<template>
  <div class="panel space-y-5 p-6">
    <div class="flex items-center gap-3">
      <UIcon
        name="i-lucide-bell-ring"
        class="size-6 text-red-400"
      />
      <p class="section-title !gap-0 before:hidden">
        Notificaciones
      </p>
      <UBadge
        v-if="supported && enabled"
        color="success"
        variant="subtle"
        class="ml-auto"
      >
        Activadas
      </UBadge>
    </div>

    <p
      v-if="!supported"
      class="text-sm leading-relaxed text-white/60"
    >
      Las notificaciones funcionan en la app de Android (instalada con el APK). Desde el navegador no se envían.
    </p>

    <template v-else-if="!enabled">
      <p class="text-sm leading-relaxed text-white/60">
        Te aviso de la ITV, el seguro y las revisiones (30 días, 7 días y el mismo día) y cada domingo a las 19:00 te recuerdo apuntar los km.
      </p>
      <p
        v-if="permission === 'denied'"
        class="text-sm leading-relaxed text-amber-300"
      >
        El permiso está bloqueado. Ve a Ajustes del móvil → Aplicaciones → Mi Captur → Notificaciones y actívalo.
      </p>
      <UButton
        block
        icon="i-lucide-bell"
        :loading="busy"
        @click="turnOn"
      >
        Activar notificaciones
      </UButton>
    </template>

    <template v-else>
      <p class="text-sm leading-relaxed text-white/60">
        Avisos por fecha y recordatorio semanal de km (domingos 19:00). Los avisos por km se ven en la portada.
      </p>
      <div class="flex gap-3">
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-send"
          @click="test"
        >
          {{ sent ? 'Llega en 3 s…' : 'Enviar prueba' }}
        </UButton>
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-bell-off"
          @click="disable"
        >
          Desactivar
        </UButton>
      </div>
    </template>
  </div>
</template>
