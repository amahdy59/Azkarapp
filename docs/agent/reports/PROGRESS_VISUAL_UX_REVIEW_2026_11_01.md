# Phase Report — Progress visual and UX review, 2026-11-01

## Objective

Assess the current Progress page, the feasibility of restoring a heatmap, appropriate bar/pie charts, a useful default range, and the owner's proposal to put view tabs beside the date selector on tablet and desktop.

This is a review and implementation proposal. It does not approve a new phase, change application behavior, or establish release readiness.

## Scope completed

Inspected the current working tree on `main`, observed HEAD `27fb5303`, existing pending Progress changes, the active Progress vNext brief, current owner decisions, architecture/design/quality/content/motion guidance and earlier optional-chart phase. Inspected ProgressScreen, ProgressDashboard, ProgressRangeToolbar, ProgressRecordingPattern, RecordingTimeline, date/aggregation helpers, route defaults, relevant browser fixtures and the retained ProgressMonthView calendar.

Captured the current local page with synthetic, sparse records at 390×844, 834×1112 and 1440×1000. The fixture clock was 2026-10-20 at noon in Cairo; screenshot dates are fixture dates, not today's date or the owner's records. Previewed the proposed toolbar with temporary browser CSS, including English tablet/desktop, Arabic tablet and English 320px/200% text. No preview styles were written into application source.

### Findings

| Priority | Observed issue                                                                                                                                                                              | Recommended change                                                                                                                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| High     | Bare Progress defaults to Day in routing and the screen. Day Trends replaces the chart with explanatory text and a Week action.                                                             | Default a fresh, unqualified visit to Last 30 days. Preserve explicit Day/Week/Month/Year links and selected scope while switching views.                                                                       |
| High     | At 390px the four summary cards and introductory text occupy most of the first viewport. The recording pattern is below them and there is no substantial history visualization in Overview. | Keep all four approved metrics and their grouped 2×2 composition, but reduce internal whitespace, subordinate denominators, and make a heatmap the principal history section immediately below them.            |
| High     | At tablet/desktop the date selector occupies a partial row above three stretched tabs. The controls and dashboard also have different maximum widths.                                       | Put the date selector and Overview/Trends/Records tabs on one aligned row when content fits. Match the dashboard width. Use content-based wrapping for narrow/enlarged layouts.                                 |
| Medium   | Overview stacks a summary container, an insight, seven recording tiles and a large latest-day list, all with similar card emphasis.                                                         | Give the heatmap the strongest visual emphasis. Use a quieter supporting comparison area. Turn latest-day details into the selected-date detail associated with the heatmap. Keep additional context disclosed. |
| Medium   | Seven-day presence tiles discard variation: one saved action and many saved actions have the same activity symbol. For Day, the strip can reduce to one stretched tile.                     | Replace this strip with a selected-practice heatmap for longer ranges; use a compact factual snapshot for Day. Do not add the heatmap below the strip as another full-width duplicate.                          |
| Medium   | The inspected Month Trends chart reduces the available history to three weekly buckets. Sparse all-zero history is a long flat line despite its steady-value explanation.                   | Use daily columns for short-range discrete counts, weekly/monthly aggregation for longer ranges, and keep a line option for rate trends. Preserve a compact honest flat/empty state.                            |
| Medium   | The date trigger shows dates but does not visibly identify the selected preset. Month includes future dates while its summary stops at elapsed dates.                                       | Show the preset name and exact dates together. Make the actual included/complete-day scope explicit once near the relevant visualization. Keep incomplete today distinct from complete-day comparisons.         |

These are design judgments based on the inspected rendering and source, not usability-study results or measured conversion improvements.

### Recommended arrangement

Maintain the three existing views and one shared range. Keep the semantic hidden title and the owner's single-dropdown contract.

1. Date selector and tabs share one row on tablet/desktop when they fit. The selector stays at logical start: right in Arabic, left in English. Preserve DOM/focus order and shared tab keyboard behavior. Phones stack the controls; enlarged labels retain native wrapping or the existing scrollable-tab recovery.
2. Overview retains the four independent metrics in a more compact 2×2 group. Emphasize the recorded count, then its label; make the opportunity denominator secondary but accessible. Retain the owner's established metric meanings and theme tokens.
3. A dominant recording heatmap follows. On desktop, put its selected-date details in a narrower adjacent column. Stack these on phones and when tablet space is insufficient. Use actual available width rather than a device-name breakpoint.
4. A small horizontal comparison of morning/evening/bedtime recording rates provides supporting detail. Keep all bars on the same 0–100% scale and label their exact counts/denominators.
5. Show at most one factual insight near the relevant chart. Keep calculation Help and deeper reflection below in disclosures. Avoid repeated panels that restate the same numbers.

Trends owns detailed time-series exploration and the previous matched-period comparison. Records retains the native sortable/paginated table and full selected-range JSON export. Heatmap selection changes its detail readout, not the shared date filter or the export range.

### Heatmap feasibility and meaning

**Recommended.** The earlier calendar remains in `ProgressPeriodViews.tsx`, with period generation, future-date handling, selected-date details and native date controls. Reuse the calendar helpers and useful interaction patterns. Its routine-specific statistics and older layout are not a drop-in replacement for the dashboard's four metric domains.

- Default the heatmap to Daily azkar: each date shows 0–3 saved morning/evening/bedtime routines. Use a restrained sequential palette with exact count/symbol information, a legend and a selected-date readout. Zero means no saved completion in that practice, never proof that worship was missed.
- A practice selector can show prayers recorded, Quran pages or known Quran-goal status using that practice's units and day boundary. Do not create a combined activity/worship score. Page-count colour bins need explicit page thresholds; do not silently rescale them whenever the date filter changes.
- Unknown historical Quran goals, dates outside the chosen range, future dates and no saved activity need distinguishable labels and treatments. Do not infer historical goals from the current plan or invent explicit-zero provenance.
- A rolling 30-day selection can span two months. Show month labels and retain calendar placement, with dates outside the selection inactive. This remains one applied range.
- For Year, avoid a dense field of tiny interactive targets on phones. Use a compact monthly overview with accessible selection into a readable month/detail view; an annual visual must have a usable exact-data alternative.
- Date actions need the repository's 44px targets, visible focus and keyboard recovery. At 320px/200% text, allow a labelled horizontally scrollable calendar or a list alternative rather than shrinking dates/text. A seven-column interactive calendar cannot always fit those constraints without scrolling.

### Chart choices

| Question                                                               | Suitable visual              | Important constraint                                                                                                                   |
| ---------------------------------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Which dates have saved records?                                        | Calendar heatmap             | Select one practice; show exact values and neutral absence/unknown states.                                                             |
| How many prayers/routines/pages were recorded over time?               | Vertical columns             | Zero baseline; use appropriate daily, weekly or monthly buckets.                                                                       |
| How do morning/evening/bedtime recording rates compare?                | Horizontal bars              | Same denominator policy and 0–100% scale; direct labels.                                                                               |
| How has a recording rate changed?                                      | Line chart                   | Preserve 0–100%, real gaps, exact readouts and language-directed chronology.                                                           |
| What share of recorded routine completions is morning/evening/bedtime? | Optional three-part doughnut | Categories partition one total; label it as the composition of saved records, with counts and shares. Empty total gets an empty state. |

Pie/doughnut charts are optional, secondary and not needed in the first refinement. A pie of prayers, routines, Quran pages and goal days would combine incompatible units and overlapping concepts. Likewise, three routine completion rates do not form slices of one whole. Their comparison belongs in bars. ONS guidance recommends bars for category comparison and restricts pies to suitable parts of a single total: [bar charts](https://service-manual.ons.gov.uk/data-visualisation/chart-types/bar-charts), [pie and doughnut charts](https://service-manual.ons.gov.uk/data-visualisation/chart-types/pie-and-doughnut-charts).

### Default range

Recommend **Last 30 days**, selected visibly on a fresh unqualified Progress visit. This is a product recommendation, not a universal standards requirement. A rolling window avoids the near-empty overview at the beginning of a calendar month and is a useful size for a recording pattern. Keep Today, This week, This month, This year and Custom in the same dropdown; no additional filter toolbar.

Explicit routes and the user's active selection take precedence over the default. Retain the selection across Overview/Trends/Records. Initially keep it visit-local, consistent with current preference contracts; remembering it across launches would be a separate device-preference decision.

Last 30 days would be a deliberate extension of the current Day/Week/Month/Year/Custom contract. Implement it explicitly with route/range/i18n tests, not as a silently labelled Custom selection. Overview can include today to date under the existing domain boundaries. Historical charts/comparisons retain complete-day rules and show their actual endpoints. Do not compare a partial current bucket with a full previous bucket.

### Performance and implementation plan

1. Add a bounded refinement brief and record approved changes before application edits. Preserve unrelated pending work and the current four metrics, 2×2 grouping, shell, themes, content and persistence.
2. Refine the existing toolbar composition and range label; implement/test the new default and explicit range semantics. Reuse ProgressRangeToolbar, ProgressSelectField, TabList and ResponsiveSheet.
3. Add a reusable heatmap presentation backed by `indexProgressDashboard` and existing domain range/calendar helpers. Derive daily cells once per relevant record/range/day-boundary change. Reuse selected-date details rather than maintaining a duplicate latest-day panel.
4. Add compact bars with existing SVG/CSS and theme tokens. Retain RecordingTimeline's accessible exploration and exact plotted-bucket table. No new chart dependency, network endpoint or storage migration is indicated.
5. Keep hidden view content unmounted. Inspect the current screen's unconditional garden/day/week derivations before moving expensive detail-only work into mounted detail components. Avoid rebuilding historical aggregates on minute-clock changes unless a domain day boundary or relevant data changed. These are source-based optimization candidates; no runtime speedup is claimed without profiling.
6. Measure release-build navigation/range changes with representative sparse and long histories. Check layout shifts, input response and bundle changes against the current baseline. Use bounded visible-state transitions and both reduced-motion alternatives; no ambient chart animation or animated blur.

## Files changed

Only this review report was added by this review. Existing application/test/release/documentation changes were present before inspection and were preserved. Screenshots are ignored local evidence under `output/playwright/`.

## Components added or modified

None. Temporary CSS in the isolated review browser demonstrated toolbar placement only.

## User-visible changes

None in the application. Default range, heatmap and chart/layout recommendations remain proposed.

## Accessibility work

Reviewed existing semantic heading, shared select/tab controls, chart slider/readout/table and responsive recovery. Recommendations retain non-colour values, 44px actions, focus, RTL chronology, keyboard access, readable enlarged text and opaque protected menus. Charts need both an identifying description and an accessible account of their essential data/relationships; preserve the exact-data table and add a concise factual summary as appropriate. See [W3C complex-image guidance](https://www.w3.org/WAI/tutorials/images/complex/).

The toolbar preview at 320px/200% text stacks its rows and retains the existing horizontally scrollable tabs. It is not a full keyboard, hit-testing, contrast or assistive-technology acceptance result. No complete accessibility compliance is claimed.

## Tests added or updated

None; application source was unchanged. The eventual phase needs meaningful range/aggregation tests plus browser coverage for heatmap selection, keyboard/date detail, unavailable/future data, complete-day comparisons, same-range export and control geometry. Include RTL/LTR, 320px/200%, phone/tablet/desktop, Glass/solid/high-contrast/fallbacks and Chromium/Firefox/WebKit. Preserve all release gates and bundle ceilings.

## Commands run

| Command/action                                                    | Result                                                                                                                                                                                               |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git status --short`, `git log -1`, scoped `rg` and `Get-Content` | Inspected source/contracts/history and identified the pre-existing dirty working tree.                                                                                                               |
| Chrome DevTools `new_page`                                        | Unavailable: the tool could not find Google Chrome. Switched to the available Edge channel through Playwright CLI.                                                                                   |
| Playwright CLI navigation to existing port 5189                   | Failed with `ERR_EMPTY_RESPONSE`; no process on that port was stopped.                                                                                                                               |
| `pnpm dev --host 127.0.0.1 --port 5197 --strictPort`              | Vite ready on a separate review port.                                                                                                                                                                |
| Playwright CLI `open`, `run-code`, `snapshot`, `screenshot`       | Current Overview/Trends rendering and responsive screenshots captured in an isolated session. One multiline CLI invocation failed parsing; the same code passed after flattening its shell argument. |
| Browser-only CSS preview and screenshots                          | Captured same-row English desktop/tablet and Arabic tablet controls, plus stacked English 320px/200% recovery.                                                                                       |

External HTTP requests were blocked in the seeded review session. Console resource failures include the deliberately blocked visitor endpoint and injected antivirus resource, not evidence of a Progress rendering failure. No production user records were read or changed. No quality/build/release gates were run for this documentation-only review; successful screenshots are not a test-suite result.

Report validation: scoped `pnpm exec prettier --write` completed, scoped `pnpm exec prettier --check` reported all matched files use Prettier style, and scoped `git diff --check` returned exit 0. The review browser was closed and the review-owned Vite server stopped after capture.

## Visual/manual evidence

All paths below are relative to the repository:

- `output/playwright/progress-review-2026-11-01-desktop.png`
- `output/playwright/progress-review-2026-11-01-tablet.png`
- `output/playwright/progress-review-2026-11-01-phone.png`
- `output/playwright/progress-review-2026-11-01-trends.png`
- `output/playwright/progress-review-2026-11-01-toolbar-proposal-desktop.png`
- `output/playwright/progress-review-2026-11-01-toolbar-proposal-tablet.png`
- `output/playwright/progress-review-2026-11-01-toolbar-proposal-ar-tablet.png`
- `output/playwright/progress-review-2026-11-01-toolbar-proposal-320-200.png`

The first four show existing local behavior. The last four show a toolbar-only proposal applied temporarily in the browser; they do not depict an implemented redesign.

## Documentation updated

This report only. Existing approved contracts and decision log were not rewritten to present recommendations as accepted decisions.

## Decisions recorded

The owner proposed adjacent tablet/desktop date filtering and view tabs during this review. The recommendation supports this with responsive wrapping and language-aware ordering. Broader chart/range changes remain recommendations.

## Known limitations or remaining risks

The local tree includes pending work, so these captures describe that tree rather than a verified production release. Synthetic sparse fixtures expose layout/data-state issues but are not representative-user research. Runtime performance has not been profiled in a production build. Physical-device and human screen-reader acceptance remain outstanding. A new rolling-range preset needs explicit calendar/day-boundary and navigation coverage before implementation can be called complete.

## Out-of-scope findings

No reviewed religious content, persisted records, synchronization boundaries, native code or deployment configuration changed.

## Recommended next step

Implement one bounded Progress refinement phase: compact shared-row toolbar, visible default range, compact retained summaries, primary heatmap with selected-date detail and supporting bars. Treat the doughnut as optional later scope, subject to a useful factual question and available data. Run targeted checks and the repository's complete release process for any resulting application release.
