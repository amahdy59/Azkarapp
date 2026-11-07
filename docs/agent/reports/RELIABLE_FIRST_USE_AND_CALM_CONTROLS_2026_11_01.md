# Phase Report — Reliable first use and calm controls

## Objective

Resolve repeated web update attempts, provide optional first-use permission setup and requested reminder presets, restart reading tallies daily except Al-Kahf, simplify the palm summary, unify compact choices and improve Library filters. Verify resilient responsive display of “تذكير لك الآن.”

## Scope completed

The implementation preserves the verified Progress release, offline core, saved/history data, reviewed devotional content and existing toolchain. User follow-ups supersede the initial Comprehensive-only reset scope. The separately planned interaction review is documented in INTERACTION_REVIEW_2026_11_01.md.

## Files changed

- Update lifecycle: src/main.tsx, src/app/pwaUpdate.ts, its unit suite, e2e/pwa-update-flow.spec.ts and public/_headers.
- First use/reminders: App.tsx, types.ts, state.ts, notifications.ts, contextReminders.ts, useForegroundReminders.ts, native/reminderPlan.ts, NotificationsPanel.tsx, FirstUseSetup.tsx and bilingual i18n dictionaries, with matching tests.
- Daily reading: progress.ts, state.ts, fridayProgress.ts and App.tsx, with unit/browser regressions. Friday's dated reading tally is separate from preserved weekly activity.
- Presentation: ResponsiveFilters and its stylesheet, shared Tabs/SegmentedControl/controlStyles/pill CSS, TodaysPathSheet, HomeCards, HomeScreen and AzkarLibraryScreen/CSS.
- Browser fixtures dismiss the new optional setup after onboarding; prior route/reading assertions remain. New first-use-calm-controls and reminder-responsive specs supplement existing contextual/offline coverage.
- Release manifest/history and the architecture/design/prayer/quality/agent documents.

## Components added or modified

FirstUseSetup composes existing permission/storage services and shared Modal/SheetHeader. DailyEvidenceCard retains presentation only. Shared pill paint preserves tab/radio semantics; ResponsiveFilters retains native details/summary. No runtime dependency or second icon/motion system was added.

## User-visible changes

- Updates allow a bounded 120-second download/install and observe activation before messaging the actual waiting worker; expired/superseded attempts cannot later activate/reload. The four-second handover remains separate. Custom-domain worker/release-manifest cache directives require revalidation.
- New installations preselect prayer, four main routines, Friday reading, Friday dua and pre-Fajr dua. Existing choices remain. Notification/storage requests require separate reader actions; denial does not prevent reading/saving. Location and reminder settings remain accessible.
- All collection completion/partial/page tallies restart daily, including situational and Friday dua reading. Al-Kahf remains weekly. Saved items, bookmarks, sessions, historical activity and main Mushaf position remain intact. Same-day New session remains available.
- Palm details emphasize today's three rows and collapse secondary growth explanations. Library filters show a full label, wrapping context chip and one chevron; similar choices share rounded tracks.
- Relevant now retries a failed initial verified-catalogue request on online/visible recovery without polling or overlapping requests. Long content reflows; source/meaning/refresh and focus-pinned reading are retained.

## Accessibility work

Native disclosure, radio/tab/dialog semantics, visible focus, localized action names, 44px targets, denial/unsupported recovery and announced permission/error states are preserved. Phone, tablet, desktop and 320px/200% text checks cover Arabic/English, themes/materials, high contrast and reduced transparency. Automated axe results supplement geometry, keyboard and screenshots; they do not certify physical devices or human assistive-technology acceptance.

## Tests added or updated

Regressions cover worker activation ordering/cancellation and real delayed upgrade; explicit permission requests and fresh-only presets; timezone/context/native alarm cancellation and foreground deduplication; daily/weekly tally separation; lazy Al-Kahf identity; history/bookmark preservation; calm disclosures, shared choices, query/focus retention; verified catalogue recovery, source/meaning/full-text/refresh, offline fallback and no minute-by-minute refetch.

## Commands run

| Command                                                                                                                | Result                                                                                                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Targeted state/progress/ResponsiveFilters Vitest suites                                                                | 74 passed in 3 files.                                                                                                                                                                                                     |
| Targeted HomeCards/reminderPlan/HomeScreen/reminderReadings/progress.reset suites                                      | 53 passed in 5 files.                                                                                                                                                                                                     |
| Targeted fridayProgress/state/progress suites                                                                          | 91 passed in 3 files.                                                                                                                                                                                                     |
| pnpm test:e2e first-use-calm-controls/reminder-responsive/pre-phase-nine with relevant grep, three engines, one worker | 36 passed; one WebKit light-English case timed out during local resource contention.                                                                                                                                      |
| Same WebKit light-English reminder case on a fresh run                                                                 | 1 passed in 43.2 seconds; all four widths, keyboard actions and axe retained.                                                                                                                                             |
| First-use/filter/palm scenarios, three engines                                                                         | All scenarios passed across the recorded targeted runs; initially found enlarged-sheet reachability, theme-fixture races and update-notice interference were diagnosed and corrected without removing product assertions. |
| Real pwa-update-flow browser regression                                                                                | Both tests passed; one-click replacement with a 20-second worker download completed in 24.4 seconds.                                                                                                                      |
| pnpm install --frozen-lockfile                                                                                         | Passed, pinned graph unchanged.                                                                                                                                                                                           |
| Targeted Prettier and git diff --check                                                                                 | Passed.                                                                                                                                                                                                                   |

The final exact-tree check, pre-push browser/build gates, exact-commit CI and production execution results are recorded in output/release-first-use-final.log and output/release-first-use-production.log. Publication is complete only after those gates pass; this report does not substitute for their results.

## Visual/manual evidence

Screenshots in the browser output include bilingual filter/palm/permission layouts and Relevant now across 390/320-enlarged/834/1440px, light/dark/midnight, Solid/Glass and fallbacks. Representative Arabic phone and enlarged captures were visually inspected. Reminder evidence is generated from the exact checked-in package through real checksum/decompression, not substitute religious text. Evidence/logs remain under output and test-results rather than shipping with the app.

## Documentation updated

ARCHITECTURE, DESIGN_SYSTEM, PRAYER_TIMES, QUALITY_CHECKLIST, agent INDEX/DECISION_LOG and the phase brief record final contracts, owner clarifications, verification and browser-closed reminder limits. Release 2026-11-01.6 has four fresh matching Arabic/English outcomes and archived history.

## Decisions recorded

All collections restart daily; Al-Kahf keeps its weekly cycle. Permission grants remain device-controlled. Existing reminder opt-outs and historical activity remain intact. Standing direct-main release authority supersedes older local-only holds.

## Known limitations or remaining risks

Web notifications require an active/resumable browser; dependable delivery after full closure needs a separately approved push service. Native alarm/OEM policy and human assistive-technology acceptance require device checks. Custom-domain headers and exact live release must be verified after publication. No complete accessibility or universal frame-rate claim is made from automation.

## Out-of-scope findings

No religious-source content was changed. Existing main Mushaf and recorded history contracts remain authoritative. No schema, dependency, router or state-system migration was needed.

## Recommended next step

Complete the separately recorded interaction review and intact release cycle; retain physical Android/TalkBack/VoiceOver checks as device acceptance.
