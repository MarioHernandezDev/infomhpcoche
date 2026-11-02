# Mi Captur

PWA para llevar repostajes (GLP + gasolina), consumos y avisos (ITV, seguro, revisiones) de un Renault Captur ECO-G.
Nuxt 4 + Nuxt UI + Supabase + Vercel.

## Puesta en marcha
1. Crea un proyecto en Supabase y ejecuta `supabase/migrations/0001_init.sql` en el SQL Editor.
2. Authentication → Users → crea tu usuario (email + contraseña) y desactiva «Allow new users to sign up».
3. `cp .env.example .env` y rellena la URL y la publishable key (Project Settings → API).
4. `npm install && npm run dev`
5. Despliegue: importa el repo en Vercel y añade las dos variables de entorno.

## Migraciones
Ejecuta en orden en el SQL Editor de Supabase: `0001_init.sql` (repostajes y avisos) y `0002_km.sql` (registro de km y ajustes del contrato) y `0003_maintenance_favorites.sql` (historial de mantenimiento y gasolineras favoritas).

## App Android (Capacitor)
La app nativa es la misma web empaquetada (SPA) dentro de un WebView, con permisos nativos (ubicación) y base para añadir Bluetooth más adelante.
Como dentro del APK no hay servidor, `/api/stations` se pide al despliegue de Vercel: define `NUXT_PUBLIC_API_BASE=https://tu-app.vercel.app` al compilar.

```bash
NUXT_PUBLIC_API_BASE=https://tu-app.vercel.app npm run build:android   # genera la web y sincroniza con android/
npm run android                                                         # abre Android Studio
# o, por línea de comandos (JAVA_HOME = JBR de Android Studio, ANDROID_HOME = tu SDK):
cd android && ./gradlew assembleDebug   # → android/app/build/outputs/apk/debug/app-debug.apk
```
