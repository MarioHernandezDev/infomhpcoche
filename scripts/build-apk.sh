#!/usr/bin/env bash
# Compila el APK de Android: genera la web, sincroniza con Capacitor y construye con Gradle.
# Resultado: ./mi-captur.apk
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f .env ] && { set -a; . ./.env; set +a; }

if [ -z "${NUXT_PUBLIC_API_BASE:-}" ]; then
  echo "⚠  NUXT_PUBLIC_API_BASE no está definida en .env: «GLP cerca» no funcionará en la app."
  echo "   Ponla con la URL de Vercel, p. ej. NUXT_PUBLIC_API_BASE=https://mi-captur.vercel.app"
fi

# Gradle 8 no soporta Java 25 (el de Android Studio): usa un JDK 21
export JAVA_HOME="${JAVA_HOME:-$(ls -d "$HOME"/.jdks/jbr-21* "$HOME"/jdks/jdk-21* 2>/dev/null | head -1)}"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"
[ -x "$JAVA_HOME/bin/java" ] || { echo "No encuentro un JDK 21. Define JAVA_HOME."; exit 1; }
[ -d "$ANDROID_HOME" ] || { echo "No encuentro el SDK de Android en $ANDROID_HOME. Define ANDROID_HOME."; exit 1; }

NUXT_CAPACITOR=1 npx nuxt generate
npx cap sync android
(cd android && ./gradlew assembleDebug -q)

cp android/app/build/outputs/apk/debug/app-debug.apk mi-captur.apk
echo "✔ APK listo: $(pwd)/mi-captur.apk ($(du -h mi-captur.apk | cut -f1))"
