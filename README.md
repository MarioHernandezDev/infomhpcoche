# Mi Captur

PWA para llevar repostajes (GLP + gasolina), consumos y avisos (ITV, seguro, revisiones) de un Renault Captur ECO-G.
Nuxt 4 + Nuxt UI + Supabase + Vercel.

## Puesta en marcha
1. Crea un proyecto en Supabase y ejecuta `supabase/migrations/0001_init.sql` en el SQL Editor.
2. Authentication → Users → crea tu usuario (email + contraseña) y desactiva «Allow new users to sign up».
3. `cp .env.example .env` y rellena la URL y la publishable key (Project Settings → API).
4. `npm install && npm run dev`
5. Despliegue: importa el repo en Vercel y añade las dos variables de entorno.
