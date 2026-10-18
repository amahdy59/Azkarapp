# Phase Report — Prominent Progress time series

## Objective

The owner requests prominent line charts for change over time alongside useful comparisons, without removing relevant information or adding clutter. Apply locally only.

## Plan before implementation

Inspect the previous insights implementation and existing calendar/prayer contracts. Put one large, inspectable line chart first in each historical routine/prayer section, with direct series buttons and dated values. Retain strongest/attention summaries, comparison bars, period navigation and JSON downloads. Share calendar-aware buckets while preserving independent prayer/routine day boundaries. Verify calculations, keyboard exploration, Arabic/English, narrow/enlarged text, contrast and offline rendering; run the complete non-browser gate.

## Scope completed

Completed locally. The full quality gate passes with all 2,051 unit tests and enforced coverage. Affected browser cases pass across the broad and final focused runs described below. No commit, push or deployment.

## Files changed

- src/app/progressInsights.ts and its tests: shared time buckets, prayer time series and adjacent-rate comparison.
- src/app/components/RecordingTimeline.tsx and its tests: prominent interactive chart.
- RoutineInsights, PrayerTrackerStats, RecordingInsights and their affected tests: compose temporal charts before existing comparisons.
- src/app/i18n/progressInsights.ts: deferred Arabic/English measurement, point exploration and change descriptions.
- e2e/progress-trends.spec.ts, progress-responsive.spec.ts and quiet-garden.spec.ts: retained data/export/responsive assertions plus temporal exploration.
- Design system, architecture, decision log, agent index and this report.

## Components added or modified

RecordingTimeline added; RoutineInsights and PrayerTrackerStats compose it. The former small RecordingTrend presentation is consolidated into the prominent chart's directly selectable series; all three routine histories remain available. RecordingInsights retains its comparison bars and strongest/attention summaries.

## User-visible changes

- A large line chart precedes routine comparisons; focus All routines, Morning, Evening or Sleep.
- Prayer has its own time chart for obligatory prayer, Rawatib and after-prayer remembrance; focus all applicable prayers or an individual prayer.
- Week uses complete daily points, Month uses up-to-seven-day ranges and Year uses actual calendar months. Future dates are omitted. Single points and empty periods have honest explanatory states.
- Fixed 0–100% scale, explained measures, short axis dates and a full dated readout clarify what each line measures. A native slider explores points by pointer or keyboard.
- Adjacent rates display their percentage-point change only when both buckets contain at least three complete days. Partial buckets are explicitly qualified; this is a descriptive comparison, not a prediction or statistical claim.
- All routines weight the three daily routines equally; prayer metrics stay independent. Rawatib has four applicable prayers and explicitly excludes Asr. No combined worship score.
- Existing attention summaries, reminders, labelled comparison bars, period navigation, independent Quran/weekly intentions and JSON exports remain.

## Accessibility work

Native pressed buttons and labelled 44px range control, visible focus, SVG title/description enumerating values, dated status readout, non-color selected guide, wrapping root-relative labels and no animation. Chronology is explicitly left-to-right in either language. No hover-only information or new dependency. Manual assistive-technology/device checks remain separate.

## Tests added or updated

Prayer buckets preserve civil dates, home/legacy locations and independent optional practices; routine rollover and Gregorian/Hijri boundaries remain covered. Change tests cover rise, fall, equality, missing/zero denominators and short samples. Component tests exercise series selection, dated readout, partial periods, keyboard-equivalent range changes, single-point and empty states. Browsers exercise Arabic/English, exports, prayer/routine selection, range keyboard exploration, narrow/enlarged layouts, contrast, focus and offline recovery.

## Commands run

| Command                                       | Result                                                                                                     |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Focused six-file Vitest run                   | 24 passed, exit 0, 9.18s before the short-axis-label refinement. output/progress-timeline-units-final.log. |
| pnpm typecheck                                | Passed, exit 0 before the short-axis-label refinement. output/progress-timeline-types.log.                 |
| Initial desktop Chromium trend/responsive run | 16 passed, exit 0, 1.1m. output/progress-timeline-browser.log.                                             |

Additional final verification:

| Command                                              | Result                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Broad affected-feature browser run                   | 62 passed / 1 failed, 6.8m, exit 1. Chromium, Firefox and WebKit cover trend/responsive/daily-read-only/quiet-garden behavior. The new flat-line assertion used Playwright visibility on a zero-height SVG geometry box; the stroke and values were present. Corrected to assert the visible SVG plus all seven exact zero points. output/progress-timeline-verified-browser.log. |
| Final focused browsers after layout/test refinements | 13 passed, exit 0, 1.6m. Arabic/English pattern and export cases plus 320px enlarged-text/contrast/keyboard checks across Chromium, Firefox and WebKit; corrected weekly flat-line case passes. Added exact plot/scale geometry assertions. output/progress-timeline-final-browser.log and .json.                                                                                 |
| pnpm check:serial                                    | Passed, exit 0, 188.6s. All 291 test files / 2,051 tests passed with enforced coverage (unit stage 91.5s), build, typecheck, lint, format, content/timing/type-scale/motion/bundle/CSS checks passed. Existing layout.css overscroll warning remains; no new motion errors. output/progress-timeline-quality.log.                                                                 |
| git diff --check                                     | Passed, exit 0.                                                                                                                                                                                                                                                                                                                                                                   |

## Visual/manual evidence

Seeded Arabic/English phone and desktop screenshots: output/playwright/progress-timeline, separated by browser project. Initial visual review identified crowded full date ranges on phone axes; shortened axis dates preserve full ranges in the readout and accessible description. The fixed-height scale now aligns with the plot independently of wrapped date labels. Inspected final Arabic phone prayer-chart and remembrance views plus the English desktop year view. Final prayer-chart-phone captures show the full line and dated readout. No private user records accessed.

## Documentation updated

Design system and architecture define temporal chart/comparison responsibilities and independent measures. Decision log records the owner's correction. This report supersedes the previous report's small-chart presentation, while preserving its complete-day/data-integrity contracts.

## Decisions recorded

Time trends are primary, categorical comparison bars remain secondary. Consolidate repeated miniature routine plots into one selectable large plot; add prayer trends. No historical data or capability is removed. Local only.

## Known limitations or remaining risks

History records routine completion, not each individual zikr. Missing records never prove missed worship. Complete-day denominators can include days before recording began because no start date is stored. Small/partial periods remain descriptive and explicitly qualified. Full manual screen-reader/device validation remains outstanding.

## Out-of-scope findings

Preserve all unrelated local changes, especially concurrent prayer-card, material and sharing work. No schema, persistence, synchronization, reviewed content, budget baseline or release manifest changes.

The full gate passed its input snapshot before this final documentation-only results update. The existing release hook remains responsible for any future exact release snapshot; no release or reusable receipt is claimed for later changes.

## Recommended next step

Review the local charts with normal recording history. Any individual-zikr persistence design remains a separate phase.
