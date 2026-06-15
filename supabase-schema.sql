-- === Esquema de base de datos de Flashrider ===
-- Cópialo y pégalo COMPLETO en Supabase → SQL Editor → New query → Run.
-- (Una sola vez, al crear el proyecto.)

-- 1) Tablas. Cada registro guarda su objeto completo en 'data' (JSONB).
create table if not exists conductores (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

create table if not exists comercios (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

create table if not exists viajes (
  id text primary key,
  data jsonb not null,
  estado text,
  conductor_id text,
  comercio_id text,
  updated_at timestamptz default now()
);

-- 2) Tiempo real (para que los cambios lleguen al instante a otros teléfonos).
alter publication supabase_realtime add table conductores;
alter publication supabase_realtime add table comercios;
alter publication supabase_realtime add table viajes;

-- 3) Seguridad (RLS). Para la PRUEBA dejamos acceso abierto con la clave anónima.
--    Más adelante, con login real, se endurecen estas políticas.
alter table conductores enable row level security;
alter table comercios enable row level security;
alter table viajes enable row level security;

create policy "flashrider conductores" on conductores for all using (true) with check (true);
create policy "flashrider comercios" on comercios for all using (true) with check (true);
create policy "flashrider viajes" on viajes for all using (true) with check (true);
