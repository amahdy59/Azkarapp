# Progress heatmap refinement and release — 2026-11-01

## Authority and scope

The owner approves all recommendations in `../reports/PROGRESS_VISUAL_UX_REVIEW_2026_11_01.md` and explicitly requests pushing all changes. This supersedes the proposal-only status of that review and the previous Progress presentation where the accepted recommendations differ. Preserve the four approved independent metrics and 2×2 grouping, the single range dropdown, hidden semantic title, settings-owned calendar, protected menus, offline records and civil/devotional boundaries. No content, persistence/schema or runtime dependency changes.

## Inspection and implementation plan

The inspected baseline is local main `27fb5303`, two commits ahead of origin/main with pending Progress vNext changes. Integrate and verify all pending changes as requested; never overwrite them or bypass release hooks.

1. Extend the typed Progress range/route contract with Last 30 days and default unqualified visits to it; preserve explicit period links and one selected range across views/export. Display both preset and exact dates. Align range/tabs in one row when content fits, with phone/enlarged recovery.
2. Compact the retained four summaries and replace recording-presence/latest-day duplication with a selected-practice calendar heatmap and associated exact-date details. Use the existing daily index/calendar helpers; preserve unknown targets, unavailable/future/out-of-range states and 44px keyboard-operable date actions. Bound long ranges with monthly exploration rather than mounting every date.
3. Add compact same-scale routine bars and optional factual routine-composition doughnut with direct exact labels. Add column rendering to the existing accessible timeline while retaining line charts, missing-data gaps, slider/pointer/RTL semantics and exact bucket tables. Keep insights subordinate and disclosures useful.
4. Avoid hidden reflection work by mounting its calculations with the requested detail view. Reuse historical derivations until records, range or domain date changes. Measure production-build interactions and bundle size; preserve purposeful motion with app/OS calmer alternatives.
5. Update meaningful unit/routing/browser tests and capture sparse/dense/empty states at phone/tablet/desktop, RTL/LTR and 320px/200% text. Verify protected menus, geometry, hit-testing, themes/material fallbacks and cross-engine behavior. Update architecture/design/quality guidance, paired i18n and newest-only release notes/history.
6. Run targeted tests and complete local hook gates. Commit all verified changes, push main through the intact hook, monitor exact-commit Quality/verify and Pages/build/deploy, diagnose every failure and verify production identity plus core Progress/reading behavior. Report exact outcomes and remaining physical-device/assistive-technology acceptance.

## Owner mobile and scrolling correction — 2026-11-01

The owner reports content bleeding through the header and an unclear, poorly fitting mobile heatmap. Before release, replace the frost-only Progress header with an opaque, full-scrollport-width theme surface in every material; retain adjacent controls inside a centred inner row. Reflow narrow/enlarged heatmaps into weekday-labelled date tiles without horizontal overflow, preserve the seven-column calendar where it fits, and open tapped phone dates in the shared accessible details sheet. Add a visible fixed colour scale, explicit date-details guidance, pointer/keyboard/focus recovery checks and scrolling screenshots. This supersedes the earlier transparent-Glass Progress and horizontal-calendar recovery decisions for this screen only. Preserve dates, counts, shared ranges, data integrity, other screens and all gates.

## Acceptance

No combined worship score or incompatible-unit pie; unknown historical goals remain unknown. Default heatmap is Daily azkar with exact 0–3 saved-routine counts. Quran-page bins have fixed explained thresholds. Calendar drill-down never changes the page's shared export range. Complete-day analytics never silently include today's partial records. One-day/custom/year and Hijri behavior remain usable and accurate. Existing test coverage and bundle ceilings stay intact.
