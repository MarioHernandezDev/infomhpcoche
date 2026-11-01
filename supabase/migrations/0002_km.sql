-- Registro manual de km y ajustes del contrato (límite anual de km)
create table public.km_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  date date not null default current_date,
  odometer integer not null check (odometer >= 0),
  created_at timestamptz not null default now()
);
create index km_logs_user_date_idx on public.km_logs (user_id, date desc);

create table public.settings (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  annual_km integer not null default 20000 check (annual_km > 0),
  start_date date,
  start_km integer not null default 0 check (start_km >= 0)
);

alter table public.km_logs enable row level security;
alter table public.settings enable row level security;

create policy "own km_logs" on public.km_logs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own settings" on public.settings
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
