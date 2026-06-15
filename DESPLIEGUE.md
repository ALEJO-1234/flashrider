# Subir Flashrider a internet (paso a paso)

Son 2 cuentas gratis. Yo ya dejé todo el código listo; tú haces estos pasos y me
pasas 2 datos (la URL y la clave de Supabase).

---

## PARTE 1 — Base de datos (Supabase) · ~10 min

1. Entra a **https://supabase.com** → **Start your project** → crea cuenta (con tu correo o con GitHub).
2. **New project**:
   - Name: `flashrider`
   - Database Password: inventa una y **guárdala**.
   - Region: la más cercana (ej. *East US*).
   - Create new project (tarda ~2 min en montarse).
3. Cuando esté listo, menú izquierdo → **SQL Editor** → **New query**.
   - Abre el archivo `supabase-schema.sql` (está en la carpeta del proyecto), **copia todo**, pégalo y dale **Run**. Debe decir "Success".
4. Menú izquierdo → **Project Settings** (engranaje) → **API**. Copia estos 2 datos:
   - **Project URL** (ej. `https://abcd1234.supabase.co`)
   - **anon public** key (una cadena larga que empieza con `eyJ...`)

👉 **Pásame esos 2 datos** (o ponlos tú en un archivo `.env`, ver abajo).

### Poner las claves (archivo .env)
En la carpeta del proyecto, copia `.env.example` como `.env` y pega tus claves:
```
VITE_SUPABASE_URL=https://abcd1234.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```
Reinicia el `npm run dev`. ¡Listo! Ya funciona entre teléfonos distintos.

---

## PARTE 2 — Publicar la app (Vercel) · ~10 min

Opción más fácil (sin instalar nada): subir el código a GitHub y conectarlo a Vercel.

1. Crea cuenta en **https://github.com** (si no tienes).
2. Sube esta carpeta a un repositorio (te ayudo con los comandos de `git` cuando llegues aquí).
3. Entra a **https://vercel.com** → entra con GitHub → **Add New → Project** → elige el repo `flashrider`.
4. En **Environment Variables** agrega las mismas 2:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. **Deploy**. En ~1 min te da un link público tipo `https://flashrider.vercel.app`.

Ese link:
- Se abre en cualquier teléfono.
- Se **instala como app** (el navegador ofrece "Agregar a pantalla de inicio").
- Usa el **GPS real** y funciona **entre teléfonos** (gracias a Supabase).

---

## Orden recomendado
1. Haz la **Parte 1** y pásame la URL + la clave (o ponlas en `.env`).
2. Probamos local que ya sincroniza entre dos teléfonos/pestañas reales.
3. Hacemos la **Parte 2** (Vercel) y queda en la calle.

> Nota: las políticas de seguridad quedaron **abiertas para la prueba**. Antes de
> crecer mucho, se endurecen junto con el login de usuarios.
