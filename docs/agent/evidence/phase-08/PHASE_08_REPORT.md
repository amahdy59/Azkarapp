# Phase Report — Phase 08 Progress and Quiet Garden

## Objective

Make Progress a useful, accessible, gentle reflection area whose period metrics are supported by recorded data.

## Scope completed

- Removed every hard-coded metric fallback and unsupported comparison from Week, Month, and Year views.
- Corrected selectors to count exactly the four `MAIN_CATEGORY_IDS` and ignore unrelated collections.
- Added after-prayer to weekly text equivalents, routine summaries, monthly fractions, selected-day details, best-routine calculations, and annual consistency calculations.
- Made best routine, most missed routine, best month, and most consistent routine neutral when no activity is recorded.
- Prevented future dates from resetting the current-year streak.
- Replaced unsupported praise/comparison claims with factual, localized empty and activity summaries.
- Completed the previously deferred `RoutineGarden` split under DEC-040; it is now 418 lines with extracted marks and date-label helpers.

## Files changed

- `src/app/gardenViews.ts`
- `src/app/gardenViews.test.ts`
- `src/app/components/ProgressViews.tsx`
- `src/app/components/ProgressViews.test.tsx`
- `src/app/components/RoutineGarden.tsx`
- `src/app/i18n/en.ts`
- `src/app/i18n/ar.ts`
- `e2e/quiet-garden.spec.ts`
- `docs/agent/DECISION_LOG.md`
- `docs/agent/evidence/phase-08/PHASE_08_REPORT.md`
- `docs/agent/evidence/phase-08/*.png`

## Components added or modified

- `ProgressWeekView`: four-routine matrix and summaries; recorded zero values; neutral empty state.
- `ProgressMonthView`: four-routine calendar fractions/details; recorded statistics; factual monthly summary.
- `ProgressYearView`: recorded chart values and totals; nullable best-period labels; neutral annual guidance.
- `TodayRoutineGarden`: removed an obsolete summary prop from the Week view call.
- Garden view selectors: main-routine filtering, nullable empty-state leaders, after-prayer coverage, and elapsed-date streak logic.

## User-visible changes

- New users see zero rather than example numbers such as 74%, 214 active days, or 14,367 completions.
- Progress no longer claims improvement without prior-period evidence.
- Week and Month now visibly account for Post-Prayer Azkar and use a denominator of four.
- Empty periods explain that no routine activity is recorded and how to begin.

## Accessibility work

- Weekly chart/list equivalence now exposes 28 labelled status cells across four routine columns.
- Every week header retains `scope="col"`; every status keeps readable completed/not-completed text.
- Month calendar accessible names now announce partial completion out of four.
- Selected-day details expose the fourth routine in text, not only through aggregate color or marks.
- Automated evidence does not replace the outstanding manual screen-reader walkthrough.

## Tests added or updated

- Selector tests cover empty periods, non-main-category exclusion, after-prayer as the strongest routine, and current-year streak preservation.
- Component tests reject fabricated zero-data values and unsupported comparison copy.
- Playwright weekly-grid coverage now expects and checks all 28 labelled cells, including Post-Prayer.

## Commands run

| Command                                                                                      | Result                                                           |
| -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `pnpm exec vitest run src/app/gardenViews.test.ts src/app/components/ProgressViews.test.tsx` | Passed — 14 tests                                                |
| `pnpm typecheck`                                                                             | Passed                                                           |
| `pnpm lint`                                                                                  | Passed                                                           |
| `pnpm install --frozen-lockfile`                                                             | Passed — lockfile current                                        |
| `pnpm check`                                                                                 | Passed — 56 files, 296 tests, coverage/build/bundle budget green |
| `pnpm test:e2e`                                                                              | Passed — 256 tests                                               |
| `pnpm build:pages`                                                                           | Passed — Pages artifact and bundle budget green                  |

## Visual/manual evidence

- `empty-week-mobile.png` — 390×844, recorded zeros and four-routine matrix.
- `empty-month-mobile.png` — 390×844, four-routine legend/details and factual empty summary.
- `empty-year-mobile.png` — 390×844, zero-height bars and neutral annual guidance.
- `empty-week-desktop.png` — 1440×900, all five table headers visible with no viewport overflow.
- Browser DOM review confirmed Week, Month, and Year semantics; mobile and desktop document widths matched their viewports.

## Documentation updated

- DEC-042 records the supported-metric and four-routine read-model contract.
- This report corrects the stale DEC-037-era claims about fabricated metrics and the since-completed `RoutineGarden` split.

## Decisions recorded

- DEC-042 — Phase 08 progress metrics must reflect only recorded main-routine data.

## Known limitations or remaining risks

- The required manual screen-reader walkthrough of the chart/summary reading order still needs a human VoiceOver, NVDA, or TalkBack session. Automated labels cannot prove that experience is coherent.
- `ProgressViews.tsx` remains large; splitting it is separate technical debt and was intentionally not mixed into this integrity correction.
- When the Hijri calendar preference is selected, the visible period label is Hijri while persisted progress buckets and month/year calculations remain Gregorian. Resolving that calendar-display contract needs a separate product decision; this release does not reinterpret or migrate stored dates.

## Out-of-scope findings

- Local browser review reproduced the existing React warning for `fetchPriority` in `AzkarHeroBackground`; it is unrelated to Progress and belongs in the next P0 defect release.

## Recommended next step

Deploy and verify this Phase 08 integrity release, then address the P0 UI defect backlog as the next isolated release.
