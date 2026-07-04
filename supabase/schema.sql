create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  phone text,
  preferred_language text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  dark_mode boolean not null default true,
  settings_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_progress (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  completed jsonb not null default '{"morning":[],"evening":[],"before_sleep":[]}'::jsonb,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.session_history (
  id text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  category text not null check (category in ('morning', 'evening', 'before_sleep')),
  completed_count integer not null default 0,
  total_count integer not null default 0,
  duration_seconds integer not null default 0,
  is_complete boolean not null default false,
  completed_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.user_progress enable row level security;
alter table public.session_history enable row level security;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id);

create policy "user_settings_own_all"
on public.user_settings
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "user_progress_own_all"
on public.user_progress
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "session_history_own_all"
on public.session_history
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
