# Phase Report — Progress alignment and themed controls, 2026-10-12

## Objective

Align Progress charts/cards and match period dropdowns to the application's look and feel while keeping recorded trends clear.

## Scope completed

Week/Month inherit the screen's single 66rem measure without a nested 44rem restriction. Prayer, chart and display-switch edges align at each breakpoint. Month choices use short Trend/Calendar labels. The shared themed Select replaces the chart's native dropdown. Chart descriptions explicitly distinguish seven-day Month ranges from monthly Year points; the redundant eyebrow is removed.

## Files changed

ProgressPeriodViews.tsx, ProgressTrendChart.tsx, bilingual dictionaries, chart/view/routing unit tests, progress-trends/settings-progress-clarity/quiet-garden browser specs, design system, decision log, phase index and this report.

## Components added or modified

ProgressWeekView and ProgressMonthView use parent-owned width. ProgressTrendChart reuses ui/select components, existing theme/control tokens, portal placement, selection checkmark and focus handling. No dependency, persistence or tracking change.

## User-visible changes

Cards share aligned outer edges on phones, tablets and desktop. Trend/Calendar is concise. Period menus use the same surfaces, corners, text, focus and selected indicators as other application dropdowns. Charts state their time grouping, retain neutral future data and optional exact records.

## Accessibility work

Shared labelled combobox, explicit RTL/LTR, 44px options, Escape recovery and keyboard selection. The Progress menu has explicit viewport width and collision padding; a 14px English overflow found at 320px/200% text was corrected without shrinking text or targets. Native Month display buttons retain pressed states. Browser assertions check matching card edges and menu bounds at 320px/200% text. Manual physical assistive-technology acceptance remains outstanding; automated tests do not establish complete compliance.

## Tests added or updated

Chart/routing tests exercise the themed options. Browser tests select accessible options instead of using native selectOption. Responsive assertions compare prayer/chart edges within one CSS pixel and verify popover visibility, Escape focus return and enlarged-menu viewport bounds. Existing exact-data and offline checks remain.

## Commands run

- Final targeted unit/i18n suite: 5 files, 21 passed, exit 0 (11.05s).
- pnpm typecheck and scoped ESLint: passed.
- pnpm check: unit coverage, build, types, lint, formatting, content/audio, accessibility-related structural checks and CSS checks passed. Bundle baseline alone failed: 163526 gzip bytes against 159119; exit 1 (286.3s), final source. Full unit coverage passed (276.1s); baseline and ceilings were not changed. Baseline and ceilings remain unchanged.
- Final 320px/200% text and themed-menu bounds suite: 6 passed across Chromium, Firefox and WebKit, exit 0 (4.7m). Candidate wider-screen assertions passed in Chromium/Firefox at 390, 900 and 1440px; exact prayer/chart edges match within one CSS pixel. Candidate broad run was interrupted for the menu-overflow repair and is not reported as a passing full suite. Earlier candidate runs exposed the partial-January option suffix and a real English dropdown overflow at doubled text. Both were corrected; exact selected-data and viewport-bound assertions remain intact.

## Visual/manual evidence

Arabic/English charts, calendars and themed period menus in output/progress-review-2026-10-12/after and output/playwright/settings-progress-clarity. Test histories are illustrative data, not the owner's records.

## Documentation updated

Design-system alignment/select contract, decision log, phase index and this report.

## Decisions recorded

The owner requests perfect alignment, relevant chart/card trends and application-consistent dropdowns. The change follows that approved scope and preserves existing unrelated local publication holds.

## Known limitations or remaining risks

The repository bundle-baseline blocker remains; no commit, push or release performed. Calendar scrolling is retained where enlarged text and 44px targets require it. Physical-device/screen-reader review remains manual.

## Out-of-scope findings

Concurrent content, audio, Mushaf and sharing changes remain untouched.

## Recommended next step

Review local alignment/menu evidence, complete physical-device acceptance and coordinate release after existing holds and quality blockers are resolved.
