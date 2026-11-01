# Phase Report — Progress calendar, charts and release, 2026-11-01

## Objective

Apply the owner's approved Progress visual/UX review, integrate all pending changes and publish through the complete main/Quality/Pages release process. Authority: `../phases/PROGRESS_HEATMAP_REFINEMENT_2026_11_01.md` and the owner's explicit “apply all recommendations and push all changes.”

## Scope completed

The implementation replaces the presence strip/latest-day duplication with a practice recording calendar and selected-date details, compacts the retained four independent metric cards, aligns dates/tabs where space permits, defaults unqualified visits to Last 30 days, adds routine bars and an optional valid routine-composition doughnut, and adds columns alongside the existing line chart. The same applied range owns all views and JSON export. Explicit period links, unknown goals, civil/devotional boundaries and complete-day comparisons remain intact.

The working-tree baseline already contained Progress vNext visual/header, exact-data, export, test and build refinements. Those are integrated under the owner's all-changes release instruction. The reviewed native-reminder fixture pins Date at noon to avoid a next-hour fixture wrapping at midnight. Vite shortens opaque lazy, generated-font and stylesheet names while preserving App/audio diagnostics, the main stylesheet role, public font paths and the four intentionally excluded low-traffic precache routes. Unused former-toolbar copy and obsolete header machinery are removed; no chunk boundary, test, inventory, coverage or budget ceiling is weakened.

## Files changed

- Progress range/facts and routing: progressDashboard.ts, routing.ts, useAppRouting.ts and their relevant tests.
- Presentation: ProgressScreen.tsx, progress-screen.css, ProgressDashboard, ProgressRangeToolbar, ProgressSelectField, RecordingTimeline and ProgressRecordsTable, including retained pending refinements and tests.
- Added progressHeatmap.ts with pure cell/grid rules, ProgressHeatmap and ProgressRoutineComparison, with domain/component tests. Removed the superseded ProgressRecordingPattern presentation; its earlier tested domain helper remains available.
- Browser evidence/regressions: new progress-heatmap.spec.ts and updated Progress, navigation, accessibility, compact-filter, read-only-statistics, quiet-garden and manual-checklist contracts. Snapshot-specific cases explicitly request Day rather than depending on the former default.
- Architecture, Design System, Quality Checklist, active phase/index/decision log, this report, the earlier review/vNext report, release manifest/offline history, Vite configuration and measured bundle baseline.

## Components added or modified

ProgressHeatmap renders fixed-scale practice cells with 44px native date actions, localized months/week starts, roving physical-arrow/Home/End keyboard selection and exact date details. Year/long custom selections explore a bounded month instead of mounting an unbounded history. Unknown goal data remains unavailable; absence is a saved-record statement, never a claim of missed worship. Page bands stay fixed at 0, 1–4, 5–10, 11–20, 21+.

ProgressRoutineComparison uses matching elapsed-date denominators for morning/evening/bedtime bars. Its disclosed doughnut partitions actual saved completions only, with direct counts/shares and an accessible description. Empty totals have an honest empty state. RecordingTimeline's column/line display retains its value units, 0–100% rate/count-zero axes, missing-data gaps, slider, pointer/RTL keys and exact bucket table. Month/Last30 use daily points; long custom/year buckets remain bounded.

ProgressDetails mounts the existing optional domain calculations only while disclosed; the selected topic remains visit-local in its screen owner. ProgressScreen retains its clock identity until a civil/devotional date or boundary setting changes. Memoized calendar/comparison components reuse stable data through unrelated minute/header updates.

## User-visible changes

Last 30 days and its exact dates are visible on arrival, with existing explicit Day/Week/Month/Year links retained. Tablet/desktop controls share a row in logical language order; narrow/enlarged layouts stack and preserve reachable tabs. Four approved summary metrics retain their meaning and 2×2 grouping with quieter denominators. A primary heatmap shows practice-specific records and date details; routine bars/composition and one subordinate factual insight support it. Details, exact records and exports continue to use the same dates.

## Accessibility work

Native controls, semantic heading/tab structure, exact values independent of colour, selected/focus states, 44px dates, labelled horizontal-scroll recovery, future/out-of-range action handling and keyboard exploration are retained or added. The initial browser pass exposed invalid nested definition-list markup in routine bars and an unnecessarily long narrow English heading; both were corrected without reducing checks. SVG charts have descriptive equivalents and direct exact labels/tables. Protected select portals and app/OS motion preferences remain in use.

Automated checks and screenshots do not establish complete WCAG compliance or physical-device/screen-reader acceptance.

## Tests added or updated

Meaningful regressions cover rolling windows across leap/year/DST boundaries, explicit route round-trips, fixed page bands, unknown/zero/future/outside distinctions, bounded long calendars, weekday/RTL keys, month exploration, equal-denominator bars, valid/empty composition, column gaps and exact data, deferred reflection work and date-boundary invalidation. Browser tests exercise default range/scope, adjacent toolbar geometry, calendar keyboard/pointer selection, composition, columns/line choice, 320px/200% recovery, native read-only records and automated accessibility.

## Commands run

| Command/check                                      | Recorded result before final release gates                                                                                                                                                                                                                                   |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Toolchain                                          | Node v24.15.0 and pnpm 11.19.0 match the repository.                                                                                                                                                                                                                         |
| `pnpm install --frozen-lockfile`                   | Passed, exit 0. No dependency changes.                                                                                                                                                                                                                                       |
| Focused ten-file unit run                          | Initial ten-file runs passed 82/83 tests. The final twelve-file run passed all 97 tests, including explicit Day/Quran and default-route integration cases, exit 0.                                                                                                           |
| Follow-up screen/timeline tests                    | 2 files, 21 tests passed, exit 0, including default/deferred calculations.                                                                                                                                                                                                   |
| Scoped ESLint, Prettier and diff whitespace checks | Passed after fixing a hook dependency and correctly locating the native-scroll lint annotation.                                                                                                                                                                              |
| Focused Chromium browser pass                      | 22 passed; two new cases selected an all-zero prayer line and incorrectly used a nonzero SVG bounding-box visibility assertion. The cases now select recorded routine history and retain the column/line behavior assertion. Earlier semantic/reflow failures were repaired. |
| `pnpm build:pages`                                 | Passed all build, utility and unchanged bundle ceilings, exit 0.                                                                                                                                                                                                             |
| `pnpm audit:prod`                                  | No known vulnerabilities, exit 0.                                                                                                                                                                                                                                            |

Final local `pnpm check`, complete affected Chromium checks, selected Firefox/WebKit checks, hook-enforced fast browser/Pages gates and exact-commit CI/deployment results are supplied in the final release response and Actions logs. They are not inferred from the earlier checkpoints in this report. Failed or superseded development attempts remain in ignored `output/progress-heatmap-*.log` files; no assertion, test or gate was skipped to turn them green.

## Visual/manual evidence

The review's before/toolbar-preview images are in `output/playwright/progress-review-2026-11-01-*.png`. New browser tests produce Arabic/English 834/1440 Overview, phone composition and 320px/200% images under their Playwright output directories. VNext/read-only/responsive tests retain additional language/theme/layout captures. These use deterministic synthetic history, not personal records. Fresh implemented screenshots with dense sample records are in output/progress-implemented-2026-11-01/ (desktop-ar.png, heatmap-ar.png, phone-heatmap-ar.png and phone-bars-doughnut-ar.png), and were shared with the owner. Release evidence is retained under ignored output paths and CI artifacts.

Additional integration verification: the broad Chromium pass completed 95 cases successfully and identified five menu/count/clock expectation failures, subsequently repaired. A 121-case cross-engine pass completed 118 successfully and exposed two WebKit selected-tab contrast cases plus the weekly clock fixture. Both WebKit contrast reproductions then passed. The clock test now resynchronizes visibility and proves the actual partial-week counts, including the real morning record and its exact table value. The first complete check passed 333 of 335 unit files and found six Day-default assumptions plus one route expectation, repaired in the final focused unit pass. Its total-output budget failure was repaired through repeated-name/dead-code/copy reduction, with every ceiling retained. The final targeted browser run then passed all 18 cases across Chromium, Firefox and WebKit (4.2m), including the corrected weekly values. A configuration type guard was added for unnamed emitted assets. Final complete gates remain required.

## Performance evidence

Final measured Pages build: main stylesheet 165,523 bytes / 28,435 gzip; initial route graph 174,185 gzip; deferred Progress stylesheet 13,379 bytes / 3,077 gzip; total output 12,576,679 bytes. Compared with the recorded baseline, initial-route gzip falls by 648 bytes, main CSS rises by 1,911 raw while its gzip falls by 20 bytes. The deliberate baseline refresh records those values; every ceiling remains unchanged. Calendar rendering is bounded, history indexing is reused and closed reflection work is unmounted. No field INP or representative-device speedup is claimed from these structural/build measurements.

## Documentation updated

Architecture, Design System and Quality Checklist explain the new typed default/range, responsive toolbar, calendar/chart semantics and verification requirements. The active phase/index/decision log record approval and supersession. Three fresh bilingual release-note entries describe only changes since the last deployed notes; the matching offline archive is regenerated. The earlier review remains historical proposal evidence, now approved by the subsequent decision.

## Decisions recorded

The owner explicitly approves all review recommendations and publication of all pending changes. This includes the new rolling preset and replacement of the old recording strip/latest-day composition. The optional doughnut is implemented as secondary disclosed detail and never combines incompatible metrics. No new persisted preference, schema, religious interpretation or runtime dependency is introduced.

## Known limitations or remaining risks

Manual physical-device and assistive-technology acceptance remain outstanding. At 320px/200% an interactive seven-column calendar uses labelled horizontal scrolling to preserve full-size targets/text. Long history is explored by month; the selected page/export range remains unchanged. Synthetic browser data is not user research, and build/structural improvements do not establish field performance.

## Out-of-scope findings

No reviewed devotional content, saved progress, synchronization schema, audio bytes or native runtime behavior was changed by the Progress refinement.

## Recommended next step

After verified deployment, complete physical-device and human screen-reader acceptance with the published release. Further visual changes should follow observed usage and explicit owner feedback.
