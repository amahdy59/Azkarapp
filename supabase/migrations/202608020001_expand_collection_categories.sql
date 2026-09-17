-- Keep account-sync category constraints aligned with the application contract.
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
      'after_prayer',
      'comprehensive_duas',
      'friday_kahf',
      'home',
      'mosque',
      'food_drink',
      'restroom',
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
      'after_prayer',
      'comprehensive_duas',
      'friday_kahf',
      'home',
      'mosque',
      'food_drink',
      'restroom',
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
