import { Capacitor } from '@capacitor/core'
import { LocalNotifications, type LocalNotificationSchema } from '@capacitor/local-notifications'
import type { Reminder } from '~/types'

const KEY = 'notifications-enabled'
const CHANNEL = 'avisos'
const WEEKLY_ID = 1
const TEST_ID = 2
const DAY = 86_400_000

type Permission = 'granted' | 'denied' | 'prompt' | 'prompt-with-rationale' | 'unknown'

/**
 * Notificaciones locales (las programa el propio móvil, sin servidor):
 *  - recordatorio semanal para apuntar los km
 *  - avisos de vencimiento por fecha: 30 días antes, 7 días antes y el mismo día
 * Los avisos por km no se pueden programar (dependen de lo que lleves), esos salen en la portada.
 */
export function useNotifications() {
  const supported = import.meta.client && Capacitor.isNativePlatform()
  const enabled = useState('notif-enabled', () => false)
  const permission = useState<Permission>('notif-permission', () => 'unknown')
  const reminders = useState<Reminder[]>('reminders', () => [])

  async function init() {
    if (!supported) return
    enabled.value = localStorage.getItem(KEY) === '1'
    permission.value = (await LocalNotifications.checkPermissions()).display
    await LocalNotifications.createChannel({
      id: CHANNEL,
      name: 'Avisos del coche',
      description: 'ITV, seguro, revisiones y recordatorio de km',
      importance: 4
    })
  }

  async function sync() {
    if (!supported || !enabled.value || permission.value !== 'granted') return

    const pending = await LocalNotifications.getPending()
    if (pending.notifications.length) await LocalNotifications.cancel({ notifications: pending.notifications })

    const list: LocalNotificationSchema[] = [{
      id: WEEKLY_ID,
      title: 'Apunta tus km',
      body: 'Dos toques y sigues al día con el límite anual de km.',
      channelId: CHANNEL,
      extra: { route: '/km?nuevo=1' },
      schedule: { on: { weekday: 1, hour: 19, minute: 0 }, allowWhileIdle: true } // domingo 19:00
    }]

    let id = 100
    const now = Date.now()
    for (const r of reminders.value) {
      if (r.done || !r.due_date) continue
      for (const [before, text] of [[30, 'Vence en 30 días'], [7, 'Vence en 7 días'], [0, 'Vence hoy']] as const) {
        const at = new Date(new Date(r.due_date + 'T09:00:00').getTime() - before * DAY)
        if (at.getTime() <= now) continue
        list.push({
          id: id++,
          title: r.title,
          body: text,
          channelId: CHANNEL,
          extra: { route: '/recordatorios' },
          schedule: { at, allowWhileIdle: true }
        })
      }
    }
    await LocalNotifications.schedule({ notifications: list })
  }

  async function enable() {
    if (!supported) return false
    const res = await LocalNotifications.requestPermissions()
    permission.value = res.display
    if (res.display !== 'granted') return false
    enabled.value = true
    localStorage.setItem(KEY, '1')
    await sync()
    return true
  }

  async function disable() {
    if (!supported) return
    enabled.value = false
    localStorage.setItem(KEY, '0')
    const pending = await LocalNotifications.getPending()
    if (pending.notifications.length) await LocalNotifications.cancel({ notifications: pending.notifications })
  }

  async function sendTest() {
    if (!supported) return
    await LocalNotifications.schedule({
      notifications: [{
        id: TEST_ID,
        title: 'Mi Captur',
        body: 'Las notificaciones funcionan.',
        channelId: CHANNEL,
        schedule: { at: new Date(Date.now() + 3000), allowWhileIdle: true }
      }]
    })
  }

  return { supported, enabled, permission, init, sync, enable, disable, sendTest }
}
