# Phase Report — Focused Progress dashboard and app-matched menus

## Objective

Implement the owner-authorized focused Progress layout, shared date ranges, meaningful independent analytics and polished app-matched dropdowns. Correct independently scrolling header overlap while keeping supported Glass background colors unchanged. All work remains local, uncommitted and unpushed; the owner will publish later.

## Scope completed

Four default overview metrics, optional metric choice/reordering, one primary trend, optional comparisons, exact searchable/sortable/paged records and a full-period JSON export. Day uses a snapshot; other periods show complete-day trends. Existing garden, per-prayer/routine/item/Friday insights and reflection remain under detailed context rather than dominating the first screen. Secondary charts and exact records mount on demand. Sparse daily facts are indexed per actual input revision and reused during header scrolling.

Day/Week/Month/Year/Custom share inclusive, validated ranges. Gregorian/Hijri calendar periods use existing date contracts. Custom date drafts apply only after validation, retain the applied data on Cancel, reject invalid/reversed/future ranges and restore focus. Civil prayer and devotional routine/Quran cutoffs stay independent, including before the configured day boundary. Unknown historic Quran goals remain unavailable, never reconstructed from today's plan. Count charts start at zero; rates retain their defined opportunities and unavailable data breaks the line. Comparisons match complete-day windows and show their denominators. No combined worship score.

## Files changed

- Domain and copy: `src/app/progressDashboard.ts`, its test, `src/app/i18n/progressDashboard.ts`.
- Composition and surfaces: `src/app/screens/ProgressScreen.tsx`, its existing screen/navigation/goal tests, `src/app/screens/progress-screen.css`, `src/styles/theme/materials.css`.
- New components and tests: `ProgressDashboard`, `ProgressRangeToolbar`, `ProgressRecordsTable`, `ProgressPrayerBreakdown`; new `ProgressSelectField` uses existing Select primitives.
- Reused presentation: `RecordingTimeline.tsx` and test, `PrayerTrackerStats.tsx` and test, `RoutineInsights.tsx` and test, `i18n/progressInsights.ts`, `FridayProgressStats.tsx`, `ui/select.tsx` (optional viewport props only). Presentation recipe reuse also touches `ZikrInsights.tsx`, `RecordingInsights.tsx`, `ProgressTrendChart.tsx` and `ProgressPeriodViews.tsx`.
- Browser coverage: `progress-dashboard`, `progress-internal-header`, `progress-trends`, `progress-responsive`, `progress-readonly-statistics`, `progress-zikr-history`, `settings-progress-clarity`, `navigation`, `quiet-garden`, `prayer-tracking`, `glass-refinement`; `e2e/helpers/progress.ts` and `src/test/progressSelect.ts` adapt the new semantic selectors without removing original mathematical assertions.
- Documentation listed below. Concurrent account, persistence, Reader, sharing and Home edits belong to their respective local phases and were preserved.

## Components added or modified

`ProgressSelectField` gives Period, Calendar, Trend and custom per-prayer comparisons and legacy detail filters one field anatomy: visible app label, logical context icon, single-line localized value, trailing disclosure, selected checkmark, app control/overlay radii and state tokens. The shared portal escapes the sticky scroll container; menus match the trigger width and respect viewport collision margins. An explicit Popper offset replaces the extra CSS translation that could violate the viewport margin at 200% text. The scrollable option group has keyboard access and visible focus alongside Radix option navigation. Existing consumers retain their default viewport behavior.

The owner's subsequent screenshot correction removes the nine prayer-chart buttons: Practice and Prayer become two labelled app selectors in one responsive row, with All prayers selected by default. Routine detail gets one Routine selector. Flat series use a smaller plot and a plain-language steady-value summary. Circular screen-space markers replace stretched SVG circles; thinner lines reduce visual weight. Plot positions retain unrounded rates, and only exactly equal counts/opportunity ratios qualify as unchanged. Missing goals cannot create a false flat summary. Changing practice preserves the live trigger and compatible series selection so menu focus returns correctly.

`RecordingTimeline` supports count scales and honest gaps, retaining keyboard/pointer inspection and exact text alternatives. Progress keyboard focus reveals the complete chart context when it fits; small screens reveal the target individually. Deferred native focus scrolling is reconciled once while the same control still owns focus, with cancellation on replacement/unmount.

## Language direction and one-line correction

The owner's next review explicitly supersedes the historical forced-LTR timeline contract. Arabic time now runs from earliest on the right to latest on the left, with English left to right. Source arrays and exports stay ascending. Mirrored x coordinates, ticks, axis placement, physical arrows, pointer normalization and range direction share the same language decision; Home/End still mean earliest/latest. Adjacent comparison bars fill from their language start edge. Updated explanatory copy and design contracts remove the earlier contradiction.

On phones all Progress fields/actions use their full available width. Context labels allow concise localized values without truncation, ellipsis or smaller text; decorative leading field icons disappear at narrow widths. Native table header actions stay single-line in the keyboard-scroll region, and pagination stacks when needed. Full metric definitions and export scope remain visible in accompanying cards/help. Root-relative typography is preserved; outer phone gutters and inner card padding stay compact to leave room at 200% text. Nested legacy garden and prayer-card gutters also use compact phone padding; enlarged English Rawatib labels now fit at 320px without smaller text or truncation.

The other active sessions were inspected and explicitly messaged under the owner's coordination authorization. Shared popup opacity/stacking belongs to “Prevent layout and color mode issues”; prayer seconds and motion belong to “Preview animated prayer timer”. Their implementations are preserved and are not duplicated here. The completed reliability phase's work and checks were also reviewed.

## Performance and coordination closeout

One `createDailyPathIndex` closure now serves the garden summary, selected day and seven-day rhythm. All callers still use the original day-policy evaluator; source records and historical awards stay unchanged. Regression assertions verify one index for unchanged records across scroll renders and a new index when records change. Shared Progress focus, supporting-copy, disclosure and export styles replace repeated utility lists, including an explicit forced-color focus outline. Unused proposal-era dictionary entries and overridden CSS are removed. No chart, export, religious content, font coverage or feature was removed to fit a budget.

The combined preview initially exceeded the intact 12MiB ceiling by 3,250 bytes. The final Progress artifact is **12,582,773 bytes**, 139 bytes under the unchanged ceiling; its bundle and CSS utility checks pass. The prayer session's subsequent stable Home repair reports a combined artifact of **12,582,849 bytes**, 63 bytes under the same ceiling. This tight remaining headroom is disclosed; no budget or baseline was raised. Their source-specific verification belongs to that session.

“Prevent layout and color mode issues” reports 72 passing dropdown/form/sharing browser cases and 31 component tests; those cases were not repeated here. “Preview animated prayer timer” owns its countdown and newly owner-approved Home sticky-restoration repair. “Improve app robustness and speed” was contacted about its existing startup-hydration unit test failure, also observed by the dropdown session. No shared-module ownership was silently reassigned.

## User-visible changes

A quieter first view answers what was recorded in the selected period. Readers can choose/reorder the metrics they care about, inspect one trend, compare practices and open exact records when needed. The record table preserves semantic headers, numeric sorting, localized/ISO date search and ten rows per page. Export includes every selected-period metric and source record regardless of table search, pagination or visible metric choices. Save failures have a retry path and changing ranges clears stale success feedback.

Supported Glass uses increased frost on scroll without changing the header/canvas tint or adding a dark fill. Solid, high-contrast and unavailable-backdrop fallbacks retain protected surfaces. Arabic and English menu alignment, labels and keyboard focus follow application direction.

## Accessibility work

Visible associated labels; native Custom date fields and validation alerts; semantic tables, named keyboard-scroll regions and sort state; chart descriptions, exact values and keyboard readouts; announced export/filter feedback; selected checkmarks and text independent of color. Ordinary targets remain at least 44px. Browser checks cover narrow/tablet/desktop widths, 200% root text, RTL/LTR, keyboard focus clearance, long menu scrolling and Escape recovery. Axe scans include open portalled menus. These automated and manual visual/keyboard checks do not constitute complete accessibility certification or a screen-reader audit.

## Tests added or updated

Pure date/math/export fixtures cover leap dates, date validation, DST-safe day counts, Hijri periods, civil/devotional boundaries, future exclusion, normalization/deduplication, unknown/free/repeating/manual Quran goals, bounded Custom bins and equal complete-day comparisons. Component tests cover reversible selection/order, empty-state prevention, deferred detail mounting, sorting/search/paging, export errors and scope, stale-success prevention, count axes, missing data and unchanged-record reuse on scroll. Browser assertions retain the existing exact historical counts, export data, offline behavior and read-only recording boundary.

## Commands run

| Command                                                                                                                                                                                                                     | Result                                                                                                                                                                                                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm test:run` with nine focused Progress domain/component/screen specs                                                                                                                                                    | 52 tests passed in 47.41s before the final shared viewport/focus refinements.                                                                                                                                                                                                                                               |
| `pnpm test:run` for toolbar/dashboard/prayer breakdown/shared share selector/Quran wird screen                                                                                                                              | 39 tests passed in 49.50s after the optional shared viewport extension.                                                                                                                                                                                                                                                     |
| `pnpm test:run src/app/screens/ProgressScreen.test.tsx src/app/components/RecordingTimeline.test.tsx`                                                                                                                       | 14 tests passed in 23.59s after chart-context focus recovery.                                                                                                                                                                                                                                                               |
| `pnpm check`                                                                                                                                                                                                                | Passed in 462.0s: coverage, build, types, lint, format, audio/timing integrity, type/motion rules, bundle and CSS budgets. Inputs were concurrently edited; no exact-snapshot release receipt is claimed.                                                                                                                   |
| Final `pnpm typecheck` and scoped component ESLint                                                                                                                                                                          | Passed; logs: `output/progress-final-types.log`, `output/progress-final-lint.log`.                                                                                                                                                                                                                                          |
| Final isolated loopback-API production build to `output/progress-final-preview`; `node scripts/check-bundle-budget.mjs output/progress-final-preview`; `node scripts/check-css-utilities.mjs output/progress-final-preview` | Passed; 12,582,773 total bytes. `output/progress-final-build.log`.                                                                                                                                                                                                                                                          |
| Final Playwright selection: `progress-dashboard`, `progress-trends`, `progress-internal-header`; Custom dates, menus, 320px insight controls and unchanged header background; all three engines, one worker                 | **30 passed in 5.1m**, no retries/skips; `output/progress-final-browsers.log` and JSON.                                                                                                                                                                                                                                     |
| Wide chart Playwright cases in both languages, desktop Chromium                                                                                                                                                             | **2 passed in 34.1s**; `output/progress-final-wide.log` and JSON.                                                                                                                                                                                                                                                           |
| Final seven focused Progress unit/component/screen specs                                                                                                                                                                    | **40 passed in 22.73s**; `output/progress-final-units.log`.                                                                                                                                                                                                                                                                 |
| Latest combined `pnpm check`                                                                                                                                                                                                | **Failed in 251.8s**: 2,249 unit tests passed, one startup-hydration test failed; concurrent sticky-spec formatting also failed. Build, types, lint, content/timings, type scale, motion, bundle and CSS stages passed. `output/progress-final-check.log`. No clean final full-gate pass or coverage completion is claimed. |
| Final scoped `pnpm exec prettier --check e2e/sticky-prayer-cards.spec.ts`                                                                                                                                                   | Passed after its owning session finished formatting; no source edit by Progress.                                                                                                                                                                                                                                            |

The chart follow-up also passed `pnpm check` in 289.9s (`output/progress-chart-check.log`), 28 focused chart/screen tests in 12.94s and 12 final chart/routine/prayer tests in 19.01s. The final tests cover fractional rates that round to the same label, equal rates with different opportunities, zero count series and practice-menu focus continuity. Final browser verification completed on the isolated artifact; earlier diagnostic failures remain retained.

Earlier full checks found a formatting issue and an unused test import; both were repaired. Browser diagnostics exposed short-window focus clearance, menu double-offset, keyboard access to the enlarged options viewport, and partially obscured wide-chart controls. Assertions, coverage thresholds and budgets remain intact; fixes address those causes. No test is skipped or weakened to obtain a pass.

The language/one-line follow-up passed 33 tests across seven focused specs in 11.81s (`output/progress-direction-units.log`), including mirrored pointer/physical-arrow/range selection and exact chronology. The earlier complete-gate attempt in `output/progress-rtl-check.log` was interrupted and is not claimed as a pass. Its older 85-case browser run (`output/progress-rtl-browser.log`) was explicitly superseded after 27 Chromium passes and two diagnostics: a JSON-download timeout and 320px/200% English Rawatib overflow. The final serial reproduction (`output/progress-rtl-final-targeted.log`) passes all five affected Custom/export/mobile cases in 2.8m. The final 30-case matrix and two wide cases above use the repaired artifact.

## Visual/manual evidence

Final PNGs and JSON live in `output/progress-final-browsers/` and `output/progress-final-wide/`. Inspected Arabic phone overview, exact Custom records, tablet app menu, 320px/200% options and wide RTL chart with round markers. Curated actual screenshots (copied without image editing) are:

- `output/progress-design-evidence/progress-overview-ar.png`
- `output/progress-design-evidence/progress-records-ar.png`
- `output/progress-design-evidence/progress-menu-ar.png`
- `output/progress-design-evidence/progress-menu-en-200.png`
- `output/progress-design-evidence/progress-header-ar-frost.png`
- `output/progress-design-evidence/progress-chart-focus-ar.png`

The final matrix passes ten cases per engine, including real pointer/range/arrow selection in both language directions, Custom validation and exact exported values, trigger/menu one-line fit, 320px/200% keyboard clearance, open-menu axe scans and unchanged header background color. Two additional wide chart cases pass in Chromium. Earlier diagnostic traces remain available in their original output folders.

## Documentation updated

`docs/ARCHITECTURE.md`, `docs/DESIGN_SYSTEM.md`, `docs/QUALITY_CHECKLIST.md`, `docs/agent/INDEX.md`, `docs/agent/DECISION_LOG.md`, `docs/agent/PROGRESS_UNIFIED_RANGE_PLAN_2026_10_19.md`, the active focused-dashboard brief and the earlier internal-header local report. Primary design criteria are linked in the phase brief (W3C tables/complex images and GOV.UK date input guidance).

## Decisions recorded

The owner explicitly authorizes full redesign, superseding proposal-only status; rejects darkened Progress headers, allowing stronger frost; requests app-matched polished menus; reserves publication for themselves. Selection preferences remain visit-local. Reviewed devotional content, persisted schemas, recording ownership, optional synchronization and dependencies are unchanged by this phase.

## Known limitations or remaining risks

Progress feature verification is complete. The final combined non-browser gate remains unclean because the existing first cold-load startup-hydration composition test times out awaiting navigation in the coverage suite; its owning reliability session is coordinating the fix. The other formatting failure has a passing final scoped recheck. No exact-snapshot release receipt or current all-green full gate is claimed. Custom inputs deliberately accept Gregorian ISO dates while the selected display calendar is labelled separately. Historic unknown Quran goals and untracked older per-item history cannot be reconstructed. Optional legacy detailed context is preserved for continuity. A human screen-reader/device review remains appropriate before release. Concurrent source changes invalidate exact-snapshot receipts; the owner's later push must run the intact hook gates and exact-commit CI. Release notes are not rewritten for an unshipped local phase.

## Out-of-scope findings

Concurrent reliability, Reader preferences, sharing and account changes are preserved and have separate reports. No remote configuration, data migration, content editing, dependency installation, commit, push or deployment was performed.

## Recommended next step

Review the local screenshots and redesigned Progress flow, then let the owner finish their other edits before a separately authorized release. Refresh release notes and run the repository's normal publication gates at that time.
