# Progress: one date range, chosen metrics

Status: owner approved implementation on 2026-10-20; implemented locally and under verification. No commit/push is authorized. See [active phase](phases/PROGRESS_FOCUSED_DASHBOARD_2026_10_20.md). The original proposal below records design intent; preferences remain visit-local and schema/sync are unchanged.

## Follow-up review — 2026-10-20

The owner requests another review of these improvements alongside performance, stability and header rendering. Retain the proposed four independent overview metrics, one chosen trend, optional comparisons/exact records and explicit selected period. Implement that composition with the existing four verified periods first. Expose Custom only after range-domain acceptance proves civil/devotional boundaries, Hijri month lengths, partial/future exclusions and equal complete-day comparisons. Keep metric choice visit-local initially; saving preferences requires the existing normalization/backup/sync tests. Preserve exact values, keyboard/pointer exploration, exports, honest unavailable history and free-reading behavior.

Measured immediate issue: a down/up header-elevation cycle recomputed unchanged garden history twice because selected dates and empty defaults changed identity. Stabilizing these inputs removes those two recomputations without changing records or totals. Regressions require changed records and the configured devotional-day boundary to invalidate the result. The larger dashboard redesign is still proposed. See [review findings](reports/PERFORMANCE_PROGRESS_REVIEW_2026_10_20.md).

## What the implementation shows

ProgressScreen already shares Day/Week/Month/Year and period navigation, but changes composition between daily records and historical analytics. PrayerTrackerStats and RoutineInsights each expand into a timeline, comparisons, explanations and export actions. Friday and reflective context follow them. The result is a long page even though the underlying date selection is shared. The remedy is a compact overview with a consistent hierarchy, rather than compressing every existing chart.

The previous approved contracts remain: Progress reviews saved statistics; Home owns recording. Prominent inspectable historical lines, exact exports and meaningful comparisons must remain available. No combined worship score, invented historical opportunities or backfilled individual-zikr records.

## Recommended experience

1. **One range toolbar.** A labelled rectangular Period select: Day, Week, Month, Year, Custom. Show the actual date range beside it, with Previous/Next and Today. All metrics, charts, details and exports follow this selection. On phones the select fills one row; navigation and date description use the next row. Do not add five cramped tabs. Keep only these controls sticky, with a short-height/enlarged-text recovery that cannot cover records.
2. **A small overview first.** Four chosen metrics initially: recorded prayers, completed azkar routines, Quran pages read and Quran-goal days. Each presents its own numerator/denominator or explicit count and selected dates. A day shows counts rather than a meaningless one-point trend. Longer periods show rates only with an honest denominator and recorded coverage. Distinguish zero records from unavailable history.
3. **Customize through one disclosure.** “Choose metrics” opens native checkboxes for the existing independent metrics: prayers, congregation/location, Rawatib, after-prayer azkar, Morning/Evening/Sleep routines, Quran pages and goal days. Initially show four; permit fewer or more with a visible count and Reset defaults. Move up/down buttons provide keyboard ordering; drag cannot be the only method. Apply/Cancel keeps exploration reversible. Remember presentation preferences through the existing validated settings boundary only after that implementation is separately approved; never write storage in the visual component.
4. **One chosen trend at a time.** A visible Metric dropdown changes the large accessible timeline below the overview. Keep the existing series and keyboard/pointer readout, full dated values and matching elapsed-period comparison. All charts remain discoverable through the selector. Expand “Comparisons” for categorical bars and item-level observations. Keep exact saved records in a separate native disclosure; preserve the full data and export, rather than hiding a loss of functionality behind a shorter page.
5. **Secondary context below.** Friday summaries remain tied to the chosen cycle/period. Reflection/garden and explanations stay optional. One Export menu chooses the existing relevant data export and clearly names the selected period; sharing remains available in the header.

## Custom ranges and calculation rules

Use labelled Start/End inputs with editable dates and a calendar affordance, explicit calendar selection/format, inline errors and Apply/Cancel. Do not apply a partial range while a user is still typing. Reject reversed/invalid dates; future days must not become missed opportunities. Preserve Gregorian/Hijri navigation and actual calendar boundaries. A custom range is inclusive in its displayed labels, converted into consistent domain boundaries before calculation.

Prayer keeps civil dates; azkar keeps the configured devotional rollover. Quran completion uses recorded daily goals, including repeating-plan/manual completion rules. Friday uses its existing cycle. Explain these boundaries once in About these statistics. Reuse progressInsights, prayer statistics and normalization rather than duplicating calculations in cards.

Bucket by actual duration: daily points for short ranges, suitable multi-day buckets for medium ranges and calendar months for long ranges. Preserve exact start/end labels and expose the underlying values. The default comparison for Custom should be the immediately preceding equal-length complete-day window, explicitly labelled; current periods use the existing matched elapsed complete days. Never compare a partial current month to a whole prior month. Individual-zikr history is limited to observed records and its existing retention window; missing older data stays unavailable.

## Responsive design and accessibility

- Phones: full-width period field, 2-column metric grid only where labels/counts fit; fall back to one column with large text. Overview precedes one chart; optional details do not occupy the initial viewport.
- Tablets: 2–3 metric columns with overview and chart below; no fixed-height empty cards.
- Desktops: up to four metric columns; use wide chart space and a secondary detail column when useful. Keep semantic DOM order identical to phones.
- Native controls, 44px targets, visible focus, explicit labels, non-color selection, RTL/LTR, reduced motion and narrow/200% text. Announce a short applied-range status, not the whole dashboard. Preserve table captions/headers and named horizontal-scroll recovery for exact records.

## Safe implementation sequence

A. Add and test a shared range model and custom bounds without changing saved record schemas. Cover leap days, Hijri boundaries, devotional rollover, DST, future/partial periods and equal-length comparisons.

B. Compose the consistent overview from existing read-only selectors. Reconcile displayed totals against current fixtures and exports before replacing any page composition.

C. Add reversible metric selection/order, the single timeline selector and optional records/comparison sections. If settings persistence is added, separately test normalization, backup, sync and migration compatibility.

D. Verify seeded/empty/legacy data, offline use, all calendars, Arabic/English, keyboard/focus, axe plus manual assistive-technology checks. Capture 320/390/834/1280px and 200% text. At 390×844 the four default metric answers should appear before long charts; measure height against a captured baseline rather than promise zero scrolling. Run the intact local and exact-commit release gates.

## Evidence and research

Implementation reviewed: ProgressScreen, PrayerProgressSummary, PrayerTrackerStats, RoutineInsights, RecordingTimeline, PeriodComparison and current Progress domain/phase contracts. The owner's mobile sharing screenshots concern sharing layout, not proof of a specific Progress layout.

The [GOV.UK select guidance](https://design-system.service.gov.uk/components/select/) supports carefully limited selects and visible labels; [GOV.UK checkboxes](https://design-system.service.gov.uk/components/checkboxes/) supports independent metric choices. [Carbon date-picker specifications](https://www.carbondesignsystem.com/building-blocks/core/components/date-picker/specifications) distinguishes single-date and range selection. These inform the controls; the unified overview and hierarchy above are a design recommendation based on this app's current composition and the owner's scrolling problem, not a claim that one layout is universally best.

## Decision requested for the next phase

The owner subsequently explicitly approved implementation of the layout and date-range redesign, including focused analytics, accessible charts and smart tables. The active local phase implements the shared Period/Custom model, independent overview and selected trend. Publication remains withheld at the owner's request.
