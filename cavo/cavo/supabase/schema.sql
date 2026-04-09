create extension if not exists "pgcrypto";

create table if not exists public.owners_allowlist (
  email text primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  codename text not null unique,
  photos jsonb not null default '[]'::jsonb,
  specs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.roms (
  id uuid primary key default gen_random_uuid(),
  device_id uuid references public.devices(id) on delete set null,
  name text not null,
  version text not null,
  release_date date,
  changelogs text,
  installation text,
  download_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text,
  position text,
  telegram_url text,
  github_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  is_active boolean not null default true,
  pinned boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.download_events (
  id uuid primary key default gen_random_uuid(),
  rom_id uuid references public.roms(id) on delete set null,
  download_url text not null,
  clicked_at timestamptz not null default now(),
  page_url text,
  referrer text,
  user_agent text
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_devices_updated_at on public.devices;
create trigger trg_devices_updated_at before update on public.devices
for each row execute function public.set_updated_at();

drop trigger if exists trg_roms_updated_at on public.roms;
create trigger trg_roms_updated_at before update on public.roms
for each row execute function public.set_updated_at();

drop trigger if exists trg_teams_updated_at on public.teams;
create trigger trg_teams_updated_at before update on public.teams
for each row execute function public.set_updated_at();

drop trigger if exists trg_notifications_updated_at on public.notifications;
create trigger trg_notifications_updated_at before update on public.notifications
for each row execute function public.set_updated_at();

alter table public.owners_allowlist enable row level security;
alter table public.devices enable row level security;
alter table public.roms enable row level security;
alter table public.teams enable row level security;
alter table public.notifications enable row level security;
alter table public.download_events enable row level security;

create or replace function public.is_owner()
returns boolean language sql stable as $$
  select exists(
    select 1 from public.owners_allowlist a
    where a.email = auth.jwt() ->> 'email'
  );
$$;

drop policy if exists owners_read on public.owners_allowlist;
create policy owners_read on public.owners_allowlist
for select to authenticated using (public.is_owner());

-- devices public read + owners write
drop policy if exists devices_public_read on public.devices;
create policy devices_public_read on public.devices for select to anon, authenticated using (true);

drop policy if exists devices_owner_insert on public.devices;
create policy devices_owner_insert on public.devices for insert to authenticated with check (public.is_owner());

drop policy if exists devices_owner_update on public.devices;
create policy devices_owner_update on public.devices for update to authenticated
using (public.is_owner()) with check (public.is_owner());

drop policy if exists devices_owner_delete on public.devices;
create policy devices_owner_delete on public.devices for delete to authenticated using (public.is_owner());

-- roms
drop policy if exists roms_public_read on public.roms;
create policy roms_public_read on public.roms for select to anon, authenticated using (true);

drop policy if exists roms_owner_insert on public.roms;
create policy roms_owner_insert on public.roms for insert to authenticated with check (public.is_owner());

drop policy if exists roms_owner_update on public.roms;
create policy roms_owner_update on public.roms for update to authenticated
using (public.is_owner()) with check (public.is_owner());

drop policy if exists roms_owner_delete on public.roms;
create policy roms_owner_delete on public.roms for delete to authenticated using (public.is_owner());

-- teams
drop policy if exists teams_public_read on public.teams;
create policy teams_public_read on public.teams for select to anon, authenticated using (true);

drop policy if exists teams_owner_insert on public.teams;
create policy teams_owner_insert on public.teams for insert to authenticated with check (public.is_owner());

drop policy if exists teams_owner_update on public.teams;
create policy teams_owner_update on public.teams for update to authenticated
using (public.is_owner()) with check (public.is_owner());

drop policy if exists teams_owner_delete on public.teams;
create policy teams_owner_delete on public.teams for delete to authenticated using (public.is_owner());

-- notifications: public only active/time-window, owners write
drop policy if exists notifications_public_read on public.notifications;
create policy notifications_public_read on public.notifications for select to anon, authenticated
using (
  is_active = true
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at >= now())
);

drop policy if exists notifications_owner_insert on public.notifications;
create policy notifications_owner_insert on public.notifications for insert to authenticated with check (public.is_owner());

drop policy if exists notifications_owner_update on public.notifications;
create policy notifications_owner_update on public.notifications for update to authenticated
using (public.is_owner()) with check (public.is_owner());

drop policy if exists notifications_owner_delete on public.notifications;
create policy notifications_owner_delete on public.notifications for delete to authenticated using (public.is_owner());

-- download events: anyone insert, only owners read
drop policy if exists download_events_public_insert on public.download_events;
create policy download_events_public_insert on public.download_events for insert to anon, authenticated with check (true);

drop policy if exists download_events_owner_read on public.download_events;
create policy download_events_owner_read on public.download_events for select to authenticated using (public.is_owner());
