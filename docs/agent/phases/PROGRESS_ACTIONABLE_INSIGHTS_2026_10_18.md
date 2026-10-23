# Phase Report — Actionable Progress insights

## Objective

Replace dense progress tables, ambiguous aggregate bars and oversized dropdowns with interpretable prayer/routine patterns and practical next steps. Apply locally only; no commit, push or deployment.

## Plan before implementation

Inspect available saved history, replace exact tables with explicit JSON downloads, compare each prayer/routine using one labelled complete-day measure, highlight strongest and least-recorded practices without inventing rankings for ties or sparse history, and use separate routine trend lines with shared scales. Preserve daily read-only records, Quran, weekly intentions, calendars, persistence and all unrelated pending work. Verify deterministic calculations, downloads, Arabic/English, theme contrast, keyboard/focus, narrow/enlarged text and offline reload, then run the complete non-browser gate.

## Scope completed

Completed locally. All 65 final selected browser cases pass, and the full combined quality gate passes in 155.5 seconds with enforced coverage and unchanged bundle limits. Exact terminal results are preserved in output/progress-insights-combined-quality.log. No publication is authorized for these insights.

## Files changed

- New src/app/progressInsights.ts and tests.
- New src/app/components/RecordingInsights.tsx and RoutineInsights.tsx with tests.
- PrayerTrackerStats and PrayerProgressSummary with updated tests.
- ProgressScreen and its routing/render tests; deferred Arabic/English src/app/i18n/progressInsights.ts with the existing interpolation extracted in i18n/index.ts. Root Arabic/English dictionaries retain concurrent mosque/card work.
- src/app/gardenViews.test.ts preserves deterministic unfinished-today coverage independently of the removed screen table; src/test/isolatedSuites.ts registers the export mocks under the existing isolation contract.
- Progress browser specs, Settings/Progress clarity and relevant quiet-garden assertions.
- README, architecture, design system, prayer contract, decision log, agent index and this report.

Concurrent edits to unrelated Home/material/prayer/sharing code are preserved and excluded from this phase's ownership.

## Components added or modified

RecordingInsights; RecordingTrend; RoutineInsights; PrayerTrackerStats; PrayerProgressSummary; ProgressScreen.

## User-visible changes

- Most consistently recorded and needs-attention summaries, with ties preserved and gentle reminder-setting links.
- Explicit percentage-of-recorded-days comparisons and approximate weekly rhythm instead of prominent annual fractions.
- Three independently labelled trend lines for morning/evening/bedtime, shared 0–100% scale, chronological time and explained buckets.
- Three visible prayer practice buttons instead of a large dropdown; no in-page data tables.
- Five daily read-only prayer status rows; recording stays on Home.
- Exact selected-period routine/prayer data available as JSON files; success/error feedback.
- Historical rankings exclude the unfinished day; prayer analysis preserves civil-day dates, while routines preserve the configured devotional-day rollover. Missing records never establish missed worship. All complete days in the selected calendar period, including unrecorded days, stay in the denominator.
- Honest history limitation: collection completions include abbreviated routines and cannot identify an individual zikr skipped within a routine.

Quran and configured weekly intentions remain independent. No religious content, schema, normalization or synchronization changes.

## Accessibility work

Native lists, description lists, buttons, links and pressed states with checkmarks; visible keyboard focus, 44px targets, wrapping Arabic/English labels, explicit graphic names/descriptions, root-size-safe DOM labels, shared theme tokens and quiet export status announcements. No color-only meaning, tooltip-only data, chart animation or runtime chart dependency. Human assistive-technology and physical-device checks remain outstanding.

## Tests added or updated

Model tests cover configured progress-day rollover, complete versus future days, Gregorian/Hijri boundaries, duplicate/core completions, unrelated categories, trend bucket sizes, ties and sparse/empty/equal data. Component tests cover independent practices, legacy locations, Arabic percentages, Asr exclusion, JSON save/error feedback and reminder links. Browser regressions replace obsolete matrix/selector assertions with equivalent exact chart/export/calendar-range tests; retain responsive, focus, theme, data-mutation and offline coverage.

## Commands run

| Command                                          | Result                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focused seven-file Vitest run                    | 27 passed, exit 0; 66.79s under concurrent local verification.                                                                                                                                                                                                                                                                                     |
| pnpm typecheck                                   | Passed, exit 0.                                                                                                                                                                                                                                                                                                                                    |
| Initial three-spec desktop Chromium run          | 21 passed, one new test failed because it expected Western year digits in Arabic. Corrected to assert the localized year; no application defect or weakened assertion.                                                                                                                                                                             |
| Broad affected-feature browsers                  | 111 passed / 4 failed across Chromium, Firefox and WebKit, 15.4m. Two obsolete daily-button selectors are corrected; two Firefox setup/initial-layout timeouts require isolated verification. Log: output/progress-insights-final-browser.log.                                                                                                     |
| Focused repair units, including earlier timeouts | 77 passed in 12 files, exit 0, 10.67s. Log: output/progress-insights-repair-units.log.                                                                                                                                                                                                                                                             |
| Calendar-domain repair                           | 17 passed, exit 0, 2.44s. Log: output/progress-insights-calendar-repair.log.                                                                                                                                                                                                                                                                       |
| Full quality before domain repair                | All 2044 assertions passed; the gate correctly rejected 99.4% gardenViews branch coverage. A deterministic unfinished-day test now covers that branch. Remaining build/types/lint/format/content/bundle/CSS stages passed.                                                                                                                         |
| Full quality during concurrent card editing      | 2042 passed / 3 transient card/i18n failures, 246.1s, exit 1. The component used readAdhkar/readAdhkarAria before its translations were saved; those keys are now present. Every other stage passed. Log: output/progress-insights-quality-complete.log.                                                                                           |
| Deferred-copy bundle measurement                 | Budget passed unchanged: initialRouteGzip 174617 bytes against recorded 171382 within the existing 2% guard; Progress screen gzip 13765 bytes. No budget or baseline changed.                                                                                                                                                                      |
| Final selected browsers                          | 65 passed, exit 0, 3.8m. Chromium, Firefox and WebKit cover changed Progress specs plus the 320px Arabic prayer-card integration. Corrected prior failures all pass; no retry, timeout, assertion or threshold relaxation. Log: output/progress-insights-verified-browser.log; structured results: output/progress-insights-verified-browser.json. |
| Final combined quality gate                      | pnpm check:serial passed, exit 0, 155.5s. Unit tests with enforced coverage 86.3s; build 11.7s; typecheck 11.4s; lint 10.7s; format/content/timings/type-scale/motion/bundle/CSS checks all passed. Exact log: output/progress-insights-combined-quality.log.                                                                                      |

## Visual/manual evidence

Final screenshots are under output/playwright/progress-insights and output/playwright/progress-statistics, with subdirectories for Chromium, Firefox and WebKit, plus browser project test artifacts. Inspected Arabic/English phone and desktop views: readable strongest/attention summary, reminder action, weekly averages and visible fixed-scale chart labels. The controls stay above the scrolled card without hiding its heading. Evidence uses explicit seeded fixtures, not the owner's private records.

Design choices follow the Government Analysis Function's [chart guidance](https://analysisfunction.civilservice.gov.uk/policy-store/data-visualisation-charts/): direct labels, simple comparisons, clear measures, sparse decoration and explicit machine-readable data downloads. Application contracts determine the actual measures and handling of missing records.

## Documentation updated

README, architecture, design system, prayer contract, decision log, index and this phase report. Deferred feature copy avoids increasing every reader's initial dictionary payload.

## Decisions recorded

The user's current request supersedes earlier numeric-table and historical dropdown/chart presentation contracts. Local only. No fabricated individual-zikr history, tracking-start date or worship score.

## Known limitations or remaining risks

Individual zikr histories are not stored; reliable patterns currently apply to saved daily routines and individual prayers. Weekly equivalents are averages across complete days, not a forecast. Calendar periods may include days before the person began recording; no start date is inferred. Unfinished today stays in the daily view. Manual screen-reader/device checks remain separate.

## Out-of-scope findings

Other local chats are actively modifying Home, prayer presentation, material and sharing files; preserve them. No release notes changed because no publication is authorized.

The owner's explicit inter-session coordination instruction was verified in the Simplify the progress card chat. That session owns an isolated chrome/mosque release; this session's Progress work and the Review card design improvements session's new prayer actions remain local. Heavy verification slots are coordinated to avoid overlapping full gates. No commit, push, release notes, baseline or unrelated source changes were made on their behalf.

The final quality runner recorded a pass for its exact input snapshot. Subsequent report updates and the other session's newly requested prayer-card spacing follow-up invalidate reuse when their contents change; no exact-current-checkout receipt is claimed for that later work. The card session owns its new targeted verification. A future release must use the intact hook against its actual release snapshot. Progress source remains unchanged after its successful final browser/quality runs.

## Recommended next step

Review the local Month view with real records, then choose any further individual-zikr tracking design as a separate persistence phase.
