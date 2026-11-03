# Optional update readiness and mobile Masbaha settings — local only

Owner approves implementing the investigated improvements locally, explicitly retaining the choice to update or defer. Do not commit, push or deploy.

Plan: separate background worker preparation from explicit activation; ready workers take the direct activation path; preparation failures remain retryable without changing the running app or clearing user content. Keep the 24-hour Later deferral and explicit About review. Reuse shared protected sheets for a mobile Masbaha settings button with current dhikr/goal summary, direct target choices and inline custom target. Stage edits until Apply, retain saved counts and existing save/reset switch confirmation. Desktop selectors remain available.

Add unit tests for preparation/activation/deferral and draft settings; exercise real service-worker updates and mobile settings in RTL/LTR at narrow/enlarged widths. Run targeted tests, repository quality and Pages build. Record local evidence and limitations. No dependency, reviewed content, persistence schema, Android binary or deployment change.
