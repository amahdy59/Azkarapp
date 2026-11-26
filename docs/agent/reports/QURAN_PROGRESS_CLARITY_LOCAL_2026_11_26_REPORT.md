# Quran and Progress clarity — local implementation, 2026-11-26

## Objective

Implement the approved responsive concepts and Progress feature cleanup locally. Application changes are implemented; release-wide browser migration/verification remains outstanding. No commit, push, deployment or release-note changes.

## Scope completed and user-visible changes

Quran gives continuation the primary surface, with side artwork on wide screens, a compact plan showing the daily target, cumulative completion track and one weekly view. All existing plan modes, draft editor, Continue and eligible Undo callbacks remain.

Progress Overview contains four fixed summaries and one recording calendar. Trends contains six clear activity choices: the four core metrics, individual azkar and Friday. It chooses chart presentation automatically, retains exact chart data and matched comparisons, and attaches prayer/routine breakdowns to their relevant activity. Removed visit-only metric customization, routine doughnut, duplicate overview chart/insight panels and Progress-only garden/reflection/streak/sharing presentation. Settings exports and normalized records remain intact.

## Files changed and components

- ProgressDashboard, ProgressPrayerBreakdown and ProgressRoutineComparison, their tests and progressDashboard bilingual copy.
- ProgressScreen, its screen/goal tests and scoped stylesheet.
- QuranWirdScreen, its tests and scoped stylesheet.
- New progress-clarity browser journey; migrated progress-dashboard, progress-heatmap, progress-zikr-history, modal-card-feedback and progress helper paths.
- Phase brief, decision log, architecture, design and quality guidance. Concurrent onboarding, Settings, App and other browser edits belong to independent work and were preserved.

## Accessibility work

Shared semantic tabs, protected selectors/modal surfaces, visible keyboard focus, date/filter recovery, exact chart tables and existing 44px date targets retained. Checked RTL/LTR responsive journeys at 1440/834/390/320px, calendar day detail/focus, enlarged protected menus, forced-color-related existing coverage and automated axe. Actual screenshots were visually inspected. No physical-device or human screen-reader compliance claim.

## Tests and commands

| Command                                                         | Exact result                                                                                                                      |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Focused 7-file Vitest run                                       | 56 passed in 46.05s before the final cumulative-track addition                                                                    |
| Final QuranWirdScreen Vitest run                                | 23 passed in 16.04s; RTL assertion now scopes to the Arabic content owner instead of a global progress-bar index                  |
| `pnpm check` final run                                          | Passed in 194.8s; complete unit suite, format, lint, types, content/audio/timing, motion/type-scale, build, CSS and bundle checks |
| `pnpm build:pages`                                              | Passed; startup 523701 gzip bytes, unchanged ceilings                                                                             |
| progress-clarity + modal-card-feedback, Chromium/Firefox/WebKit | 12 passed in 6.0m                                                                                                                 |
| progress-dashboard + heatmap + individual-zikr Chromium         | Initially 17 passed / 6 failed, solely stale detail-picker and activity-inventory expectations                                    |
| All six repaired dashboard cases                                | 6 passed in 1.0m, retaining date/export/keyboard/menu/geometry assertions                                                         |
| `git diff --check`                                              | Passed                                                                                                                            |

Earlier complete checks exposed formatting drift and the global-index RTL test; both were repaired. No checks, thresholds, assertions or bundle ceilings were bypassed. Logs are under output/progress-clarity-*.log.

## Visual/manual evidence

Actual Arabic/English Quran and Progress screenshots at 1440/834/390/320px are in output/playwright/progress-clarity/. Generated concepts from the preceding review are references, not implementation screenshots. Engine runs share screenshot filenames; final files can reflect the last engine to finish.

## Documentation and decisions

See phases/QURAN_PROGRESS_CLARITY_LOCAL_2026_11_26.md and the owner decision dated 2026-11-26. The independent notification-first phase remains the index's active pointer; this phase is a parallel local handoff.

## Known limitations and remaining work

The complete browser inventory was not run. Other older browser specs still reference intentionally removed metric customization or garden/detail-context UI, including button-family, quiet-garden and progress-trends. Their behavior assertions must be migrated to retained activity/date/chart paths before a combined release; do not add compatibility UI or skip tests to make them pass. The selected green cases do not establish a green full CI inventory. Physical-device, assistive-technology and real motion acceptance remain separate. No persisted data, religious content or synchronization schema changes.

## Recommended next step

Review the local visuals, finish the remaining legacy-browser migrations, run the complete affected browser inventory and refresh combined quality evidence before any separately authorized release.
