-- Existing projects need the same least-privilege Data API grants as a fresh
-- migration replay. RLS remains the per-row boundary; grants limit operations.
revoke all on table
  public.profiles,
  public.user_settings,
  public.user_progress,
  public.session_history,
  public.daily_collection_completions,
  public.saved_zikr
from anon, authenticated;

grant select, insert, update on table public.profiles to authenticated;
grant select, insert, update on table public.user_settings to authenticated;
grant select, insert, update on table public.user_progress to authenticated;
grant select, insert, update on table public.session_history to authenticated;
grant select, insert, update on table public.daily_collection_completions to authenticated;
grant select, insert, delete on table public.saved_zikr to authenticated;
