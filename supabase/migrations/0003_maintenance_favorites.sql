-- Historial de mantenimiento (ITV, revisiones, neumáticos...)
create table public.maintenance_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  date date not null default current_date,
  odometer integer check (odometer >= 0),
  cost numeric(8,2) check (cost >= 0),
  notes text,
  created_at timestamptz not null default now()
);
create index maintenance_logs_user_date_idx on public.maintenance_logs (user_id, date desc);

-- Gasolineras favoritas (station_id = IDEESS del Ministerio)
create table public.favorite_stations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  station_id text not null,
  name text not null,
  address text,
  lat double precision not null,
  lng double precision not null,
  last_glp numeric(6,3),
  created_at timestamptz not null default now(),
  unique (user_id, station_id)
);

alter table public.maintenance_logs enable row level security;
alter table public.favorite_stations enable row level security;

create policy "own maintenance_logs" on public.maintenance_logs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own favorite_stations" on public.favorite_stations
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
