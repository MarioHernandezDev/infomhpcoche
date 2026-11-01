import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'es.mhp.captur',
  appName: 'Captur',
  webDir: '.output/public',
  backgroundColor: '#050507',
  android: {
    backgroundColor: '#050507'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      backgroundColor: '#050507',
      showSpinner: false
    }
  }
}

export default config
