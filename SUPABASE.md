# Integración con Supabase (Fase 2)

Cuando valides la demanda y quieras automatizar (asignación real, conductores
reales, historial), conecta Supabase. Capa gratis generosa, Postgres + Realtime.

## 1. Crear proyecto y tablas

En [supabase.com](https://supabase.com) crea un proyecto y corre este SQL:

```sql
-- Conductores (motorizados)
create table conductores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  telefono text not null,
  placa text not null,
  modelo_moto text,
  cedula text,
  verificado boolean default false,         -- aprobación manual al inicio
  estrellas numeric default 5,
  disponible boolean default false,
  ubicacion jsonb,                          -- { lat, lng } en tiempo real
  creado_en timestamptz default now()
);

-- Pasajeros
create table pasajeros (
  id uuid primary key default gen_random_uuid(),
  nombre text,
  telefono text not null unique,            -- login por WhatsApp-OTP
  creado_en timestamptz default now()
);

-- Viajes
create table viajes (
  id uuid primary key default gen_random_uuid(),
  pasajero_id uuid references pasajeros(id),
  conductor_id uuid references conductores(id),
  origen jsonb not null,                    -- { lat, lng }
  destino jsonb not null,
  distancia_km numeric,
  tarifa_usd numeric,
  tarifa_bs numeric,
  estado text default 'solicitado',         -- solicitado|asignado|en_curso|completado|cancelado
  calificacion int,
  comentario text,
  creado_en timestamptz default now()
);
```

## 2. Instalar el cliente

```bash
npm install @supabase/supabase-js
```

Crea `src/lib/supabase.js`:

```js
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

Y un archivo `.env.local` (NO lo subas a git):

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## 3. Dónde enchufarlo en el código actual

- **`App.jsx` → `pedirMoto()`**: en vez del `setTimeout` simulado, inserta un
  registro en `viajes` con estado `solicitado` y escucha cambios con Realtime:

  ```js
  const { data: viaje } = await supabase.from('viajes').insert({
    origen, destino, distancia_km: tarifa.km,
    tarifa_usd: tarifa.usd, tarifa_bs: tarifa.bs
  }).select().single()

  supabase.channel('viaje-' + viaje.id)
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'viajes', filter: `id=eq.${viaje.id}` },
      ({ new: v }) => { if (v.estado === 'asignado') setPantalla('viaje') })
    .subscribe()
  ```

- **`CONDUCTOR_DEMO`**: reemplázalo por el conductor real (`conductor_id`) del viaje.

- **Ubicación del conductor en vivo**: suscríbete a cambios de `conductores.ubicacion`
  y actualiza el marcador `moto` del mapa.

- **`PanelCalificar`**: guarda `calificacion` y `comentario` con un `update` sobre el viaje.

## 4. Login por WhatsApp-OTP

Para el OTP por WhatsApp (no SMS, caro en VE) usa la API de WhatsApp Cloud de
Meta o Twilio para enviar el código, y guarda el `telefono` verificado en
`pasajeros`. Mientras validas, puedes operar sin login (solo teléfono al pedir).

## 5. Panel admin

El panel web admin (tarifas, aprobar conductores, reportes) puede ser otra ruta
de esta misma app o un proyecto aparte que lea las mismas tablas. Supabase ya
trae un editor de tablas que sirve como admin mínimo el día 1.
