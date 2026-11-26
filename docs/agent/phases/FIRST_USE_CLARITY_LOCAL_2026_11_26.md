# Notification-first welcome — local implementation, 2026-11-26

The owner approved the generated desktop/mobile concepts and all recommendations, with an explicit local-only instruction. Do not commit or push this phase.

## Plan and scope

1. Inspect existing FirstUseSetup, permission services, location callbacks, Settings data controls and shared overlay contracts.
2. Use one protected responsive sheet with a short benefit, illustrative notification preview, collapsed actual reminder choices, explicit permission action and Later. Preserve all existing saved choices and fresh-only presets.
3. Continue automatically after a grant. Offer optional location setup only for selected location-dependent reminders when location needs confirmation. Fresh-install fallback Cairo needs confirmation; existing saved locations are preserved. Reuse offline city results and App's location/reminder saving boundary.
4. Give denied, dismissed, unsupported and iOS browser sessions accurate recovery. Browser closure and suspension limits remain explicit; no push backend or delivery guarantee is introduced.
5. Move explicit storage protection into Account & data beside saving/backup, without changing ordinary saving.
6. Update unit/browser regressions, collect real responsive screenshots and run targeted tests, full non-browser check and Pages build. Preserve keyboard, enlarged-text, protected surfaces and both motion preferences.

No religious text, scheduler, state schema, dependency, server, deployment or synchronization change is authorized.
