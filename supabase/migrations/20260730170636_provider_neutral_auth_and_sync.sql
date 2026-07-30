-- Provider-neutral account identity. Existing phone identities remain valid data,
-- but the application no longer offers phone/SMS authentication.
alter table public.profiles
  add column if not exists email text,
  add column if not exists avatar_url text;

update public.profiles as profile
set email = auth_user.email
from auth.users as auth_user
where profile.id = auth_user.id
  and profile.email is null
  and auth_user.email is not null;

-- Session history records every collection the application can complete.
alter table public.session_history
  drop constraint if exists session_history_category_check;

alter table public.session_history
  add constraint session_history_category_check
  check (
    category in (
      'morning',
      'evening',
      'before_sleep',
      'waking_up',
      'home',
      'mosque',
      'after_prayer',
      'restroom',
      'food_drink',
      'clothing',
      'travel',
      'distress_anxiety',
      'illness_ruqyah',
      'social_community',
      'natural_events',
      'miscellaneous'
    )
  ) not valid;

alter table public.session_history
  validate constraint session_history_category_check;

-- The garden intentionally records the three core routines and extra completed
-- collections as one idempotent row per user, progress day, and category.
alter table public.daily_collection_completions
  drop constraint if exists daily_collection_completions_category_check;

alter table public.daily_collection_completions
  add constraint daily_collection_completions_category_check
  check (
    category in (
      'morning',
      'evening',
      'before_sleep',
      'waking_up',
      'home',
      'mosque',
      'after_prayer',
      'restroom',
      'food_drink',
      'clothing',
      'travel',
      'distress_anxiety',
      'illness_ruqyah',
      'social_community',
      'natural_events',
      'miscellaneous'
    )
  ) not valid;

alter table public.daily_collection_completions
  validate constraint daily_collection_completions_category_check;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'session_history_counts_nonnegative'
      and conrelid = 'public.session_history'::regclass
  ) then
    alter table public.session_history
      add constraint session_history_counts_nonnegative
      check (
        completed_count >= 0
        and total_count >= 0
        and duration_seconds >= 0
        and completed_count <= total_count
      ) not valid;
  end if;
end
$$;

alter table public.session_history
  validate constraint session_history_counts_nonnegative;

create table if not exists public.saved_zikr (
  user_id uuid not null references public.profiles (id) on delete cascade,
  zikr_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, zikr_id)
);

-- Safely preserve saved IDs previously embedded in user_settings.settings_json.
insert into public.saved_zikr (user_id, zikr_id)
select settings.user_id, saved_id.value
from public.user_settings as settings
cross join lateral jsonb_array_elements_text(
  case
    when jsonb_typeof(settings.settings_json -> 'savedZikrIds') = 'array'
      then settings.settings_json -> 'savedZikrIds'
    else '[]'::jsonb
  end
) as saved_id(value)
where btrim(saved_id.value) <> ''
on conflict (user_id, zikr_id) do nothing;

alter table public.saved_zikr enable row level security;

drop policy if exists "saved_zikr_select_own" on public.saved_zikr;
create policy "saved_zikr_select_own"
on public.saved_zikr
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "saved_zikr_insert_own" on public.saved_zikr;
create policy "saved_zikr_insert_own"
on public.saved_zikr
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "saved_zikr_delete_own" on public.saved_zikr;
create policy "saved_zikr_delete_own"
on public.saved_zikr
for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Explicit Data API privileges keep exposure independent from dashboard defaults.
revoke all on table
  public.profiles,
  public.user_settings,
  public.user_progress,
  public.session_history,
  public.daily_collection_completions,
  public.saved_zikr
from anon;

grant select, insert, update on table public.profiles to authenticated;
grant select, insert, update on table public.user_settings to authenticated;
grant select, insert, update on table public.user_progress to authenticated;
grant select, insert, update on table public.session_history to authenticated;
grant select, insert, update on table public.daily_collection_completions to authenticated;
grant select, insert, delete on table public.saved_zikr to authenticated;
