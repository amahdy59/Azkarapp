# Phase Report — Optional Progress charts, 2026-10-12

## Objective

Apply the owner's approved Month heatmap switch and optional Week routine comparison with clear data and restrained presentation.

## Scope completed

Month offers Trend and Calendar/daily-record display choices; only one main visualization is visible. The calendar distinguishes 1/3, 2/3 and complete records through counts/checkmarks and themed surfaces. Future dates remain neutral and disabled. Date selection preserves the existing independent routine records. Week keeps the checkmark table primary and places three equal-scale horizontal routine bars in a closed native disclosure. All calculations exclude future days, deduplicate completion records and include today among elapsed days. Day continuation and Year monthly trends retain their approved presentation.

## Files changed

src/app/components/ProgressPeriodViews.tsx, ProgressViews.test.tsx, src/app/i18n/ar.ts and en.ts, e2e/progress-trends.spec.ts and quiet-garden.spec.ts, src/test/isolatedSuites.ts; design system, decision log, phase index and phase reports.

## Components added or modified

ProgressMonthView: native pressed-button display switch, calendar heatmap, wrapping day-detail heading and tighter calendar gaps. ProgressWeekView: optional static comparison bars. Existing selectors, semantic tokens and native controls are reused; no dependencies or persistence changes.

## User-visible changes

Readers can inspect trends or individual days without seeing both simultaneously. They can optionally compare their morning, evening and sleep recording frequency. Missing records say Not recorded; future weeks say Upcoming rather than 0/0. Quran and prayer remain independent.

## Accessibility work

Keyboard-operable native buttons with pressed states, native disclosure, localized chart labels and visible exact values; heatmap count/checkmark information supplements color. Future dates are disabled and explicitly named. Focus rings, 44px date/control targets, RTL/LTR and text enlargement are preserved. Physical screen-reader and cutout-device checks remain manual; automated scans do not establish complete compliance.

## Tests added or updated

Unit regression covers mutually exclusive Month views, return to Trend and Week duplicate/future exclusion. Browser specs cover view switching, accessible heatmap scans, expanded routine comparisons, offline navigation, dense history and Arabic/English responsive evidence. Old calendar-disclosure browser steps now use the display switch.

## Commands run

- Targeted unit/i18n suite: 7 files, 29 tests passed; exit 0 (11.41s).
- Scoped ESLint, targeted Prettier and git diff --check: passed.
- First pnpm check: build, typecheck, lint, formatting, content/audio, CSS and other structural checks passed. It found the missing routing-test isolation entry (repaired) and a key-integrity race while localized copy changed during the running suite (current focused key integrity/parity pass). Bundle remained above baseline at 163420 gzip bytes versus 159119. Final stable-input pnpm check passed unit tests with enforced coverage and every other stage except the existing bundle baseline: 163437 gzip bytes versus 159119; exit 1, 123.8s. No baseline/budget changes.
- Affected browser suite: 46 passed across Chromium, Firefox and WebKit; exit 0 (8.5m). This verifies optional charts, Settings/Progress clarity and existing quiet-garden contracts. Final focused browser run after calendar-gap and localized-number refinements: 13 passed, exit 0 (1.3m), including the installed Chromium offline reload and all three engines.
- Final full-calendar evidence capture: 2 Chromium feature cases passed, exit 0 (20.5s).
- Logs: output/progress-review-2026-10-12/additional-charts-*.log.

## Visual/manual evidence

Arabic/English month-heatmap and week-comparison captures join the existing per-engine evidence under output/progress-review-2026-10-12/after. Evidence uses deterministic test history, not the owner's personal records.

## Documentation updated

Design-system optional comparison contract, explicit owner approval, phase index and this report. Earlier Progress report links this follow-up.

## Decisions recorded

The owner approved the recommendations with “I agree to these recommendations. go ahead.” This replaces the earlier Month calendar disclosure with mutually exclusive display choices. Existing unrelated local publication holds remain intact.

## Known limitations or remaining risks

Calendar requires horizontal scrolling at narrow widths/large text to retain 44px targets. Recorded frequency is not a measure of worship quality. Existing repository bundle-baseline failure and concurrent publication holds prevent deployment; no budget or coverage threshold is weakened.

## Out-of-scope findings

Concurrent audio, content, Mushaf and sharing changes are preserved and are not part of this focused phase.

## Recommended next step

Physical-device and screen-reader acceptance, followed by coordinated release once existing publication holds and repository quality blockers are resolved.
