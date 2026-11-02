// Build para la app nativa (Capacitor): SPA sin servidor y sin service worker
const isNative = process.env.NUXT_CAPACITOR === '1'

export default defineNuxtConfig({

  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vite-pwa/nuxt',
    '@nuxtjs/supabase'
  ],
  ssr: !isNative,

  devtools: { enabled: true },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      htmlAttrs: { lang: 'es' },
      title: 'Captur',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#050507' }
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  colorMode: { preference: 'dark', fallback: 'dark' },

  runtimeConfig: {
    public: {
      // URL del despliegue en Vercel; la app nativa la usa para /api/stations
      apiBase: ''
    }
  },

  routeRules: {
    '/api/**': { cors: true }
  },

  compatibilityDate: '2026-06-30',

  eslint: {
    config: {
      stylistic: { commaDangle: 'never', braceStyle: '1tbs' }
    }
  },

  pwa: {
    disable: isNative,
    registerType: 'autoUpdate',
    manifest: {
      name: 'Captur',
      short_name: 'Captur',
      description: 'Repostajes, consumos y recordatorios de mi Renault Captur',
      lang: 'es',
      theme_color: '#050507',
      background_color: '#050507',
      display: 'standalone',
      start_url: '/',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
      ]
    },
    workbox: { navigateFallback: '/' },
    devOptions: { enabled: false }
  },

  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: []
    }
  }
})
