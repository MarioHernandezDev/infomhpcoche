<script setup lang="ts">
const user = useSupabaseUser()
watch(user, (u) => {
  if (u) navigateTo('/')
}, { immediate: true })
</script>

<template>
  <p class="pt-16 text-center text-muted">
    Entrando…
  </p>
</template>
