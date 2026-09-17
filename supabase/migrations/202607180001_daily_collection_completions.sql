create table if not exists public.daily_collection_completions (
  user_id uuid not null references public.profiles (id) on delete cascade,
  day_key date not null,
  category text not null check (category in ('morning', 'evening', 'before_sleep')),
  time_zone text not null default 'local',
  created_at timestamptz not null default now(),
  primary key (user_id, day_key, category)
);

alter table public.daily_collection_completions enable row level security;

drop policy if exists "daily_collection_completions_own_all" on public.daily_collection_completions;
create policy "daily_collection_completions_own_all"
on public.daily_collection_completions
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
