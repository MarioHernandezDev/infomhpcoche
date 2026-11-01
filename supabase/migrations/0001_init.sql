-- Repostajes (coche bifuel: GLP + gasolina)
create table public.fillups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  date date not null default current_date,
  fuel text not null check (fuel in ('glp', 'gasolina')),
  liters numeric(7,2) not null check (liters > 0),
  price_per_liter numeric(6,3) not null check (price_per_liter > 0),
  total numeric(8,2) generated always as (round(liters * price_per_liter, 2)) stored,
  odometer integer not null check (odometer >= 0),
  station text,
  notes text,
  created_at timestamptz not null default now()
);
create index fillups_user_date_idx on public.fillups (user_id, date desc, odometer desc);

-- Recordatorios (ITV, seguro, revisión...) por fecha y/o km
create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  due_date date,
  due_odometer integer,
  done boolean not null default false,
  created_at timestamptz not null default now(),
  check (due_date is not null or due_odometer is not null)
);

alter table public.fillups enable row level security;
alter table public.reminders enable row level security;

create policy "own fillups" on public.fillups
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own reminders" on public.reminders
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
