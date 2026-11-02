<script setup lang="ts">
definePageMeta({ title: 'Entrar' })
const client = useSupabaseClient()
const user = useSupabaseUser()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

watchEffect(() => {
  if (user.value) navigateTo('/')
})

async function login() {
  loading.value = true
  error.value = ''
  const { error: e } = await client.auth.signInWithPassword({ email: email.value, password: password.value })
  if (e) error.value = 'Email o contraseña incorrectos'
  loading.value = false
}
</script>

<template>
  <div class="space-y-10 pt-16">
    <div class="space-y-4 text-center">
      <AppLogo
        v-reveal
        class="mx-auto h-32 w-auto"
      />
      <AnimTitle
        text="CAPTUR"
        class="font-display text-3xl tracking-[0.1em] glow-text"
      />
    </div>
    <form
      class="space-y-6"
      @submit.prevent="login"
    >
      <UFormField label="Email">
        <UInput
          v-model="email"
          type="email"
          autocomplete="email"
          size="xl"
          class="w-full"
          required
        />
      </UFormField>
      <UFormField label="Contraseña">
        <UInput
          v-model="password"
          type="password"
          autocomplete="current-password"
          size="xl"
          class="w-full"
          required
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
        :loading="loading"
      >
        Entrar
      </UButton>
    </form>
  </div>
</template>
