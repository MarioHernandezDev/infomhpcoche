import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'

// Barra de estado oscura a juego con la app cuando corre como app nativa
export default defineNuxtPlugin(() => {
  if (!Capacitor.isNativePlatform()) return
  StatusBar.setStyle({ style: Style.Dark })
  StatusBar.setBackgroundColor({ color: '#050507' })
})
