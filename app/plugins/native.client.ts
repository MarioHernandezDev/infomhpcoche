import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import { StatusBar, Style } from '@capacitor/status-bar'
import type { Reminder } from '~/types'

// Comportamiento propio de la app nativa: barra de estado y notificaciones
export default defineNuxtPlugin((nuxtApp) => {
  if (!Capacitor.isNativePlatform()) return

  StatusBar.setStyle({ style: Style.Dark })
  StatusBar.setBackgroundColor({ color: '#050507' })

  const { init, sync } = useNotifications()
  const reminders = useState<Reminder[]>('reminders', () => [])

  nuxtApp.hook('app:mounted', async () => {
    await init()
    // Reprograma los avisos cada vez que cambian los recordatorios (y al abrir la app)
    watch(reminders, () => sync(), { deep: true, immediate: true })
  })

  // Al tocar una notificación, abre la pantalla correspondiente
  LocalNotifications.addListener('localNotificationActionPerformed', (e) => {
    const route = e.notification.extra?.route
    if (typeof route === 'string') navigateTo(route)
  })
})
