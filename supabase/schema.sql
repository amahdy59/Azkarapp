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

create index if not exists session_history_user_completed_idx
on public.session_history (user_id, completed_at desc);

-- Append-only, conflict-safe completion ledger used by the private routine garden.
-- A row is a completed collection, not a spiritual score or rank.
create table if not exists public.daily_collection_completions (
  user_id uuid not null references public.profiles (id) on delete cascade,
  day_key date not null,
  category text not null check (category in ('morning', 'evening', 'before_sleep')),
  time_zone text not null default 'local',
  created_at timestamptz not null default now(),
  primary key (user_id, day_key, category)
);

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.user_progress enable row level security;
alter table public.session_history enable row level security;
alter table public.daily_collection_completions enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "user_settings_own_all" on public.user_settings;
create policy "user_settings_own_all"
on public.user_settings
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "user_progress_own_all" on public.user_progress;
create policy "user_progress_own_all"
on public.user_progress
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "session_history_own_all" on public.session_history;
create policy "session_history_own_all"
on public.session_history
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "daily_collection_completions_own_all" on public.daily_collection_completions;
create policy "daily_collection_completions_own_all"
on public.daily_collection_completions
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
