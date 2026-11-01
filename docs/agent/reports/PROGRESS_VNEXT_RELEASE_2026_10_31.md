# Phase Report — Progress vNext and compact header

## Objective

Finish the owner-approved Progress visual improvements and compact header; publish after required checks and exact-commit deployment verification.

## Scope completed

Grouped metric cards, separate recording insight and seven-day pattern, latest recorded day, shaded timeline with exact bucket data, rate comparison bars, styled records and guarded JSON export feedback. Remove the visible title/share row; retain a semantic screen-reader title. One date dropdown and view tabs remain available. Use one date-range dropdown at every width. Calendar type comes from Settings; no arrows, Today link, filter disclosure or local calendar selector. Custom dates retains validated start/end fields.

## Files changed

ProgressDashboard, ProgressRecordingPattern, RecordingTimeline, ProgressRecordsTable, ProgressRangeToolbar, ProgressScreen, scoped CSS, paired dashboard copy, focused tests, phase brief, design contract and release manifest/archive.

## Components added or modified

Existing shared Progress components only; no dependencies or storage/schema changes.

## User-visible changes

Clearer grouping and accurate recording language, readable dates and records, less fixed title chrome, accessible date filtering and honest save feedback. Preserve four default metric meanings and one shared range.

## Accessibility work

Native headings, date controls, disclosure, chart table and keyboard slider retained. Protected portalled selectors and shared sheet focus recovery retained. Missing history remains neutral. Responsive and automated scans are under verification; no complete compliance claim.

## Tests added or updated

Dashboard export/status coverage; browser header expectations assert the single semantic screen-reader title and reachable controls rather than a pinned visible title. Mobile heading checks retain visible content-heading geometry while checking the new hidden-title contract. Existing filter, chart, records, range and export assertions are retained.

## Commands run

| Command                                       | Result                                                                                                                               |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm check` (before final visual refinement) | Passed all stages, 332 test files / 2,369 tests, coverage and unchanged bundle ceilings.                                             |
| Targeted Progress toolbar tests               | 8 passed.                                                                                                                            |
| Targeted screen/navigation tests              | 13 passed.                                                                                                                           |
| Progress Chromium browser run                 | 33 passed; four failures diagnosed as inline date geometry and old preset-only historical chart expectations. Follow-up run pending. |
| `pnpm build:pages`                            | Passed unchanged bundle budget and CSS utility checks after shortening opaque chunk names.                                           |

The final visual refinement passed 19 Chromium cases, including offline reload, both languages, date reflow and reference captures. The cross-engine run passed 46 cases and found six WebKit selected-tab contrast failures; explicit semantic selected ink repairs that issue. A time-dependent native reminder test now pins its Date clock at noon so a next-hour fixture cannot wrap past midnight. Exact-commit CI/deployment results follow in the final chat report. Earlier failing attempts were repaired without skipping assertions or raising limits.

Release review on 2026-11-01: frozen install passed; the focused seven-file unit run passed all 45 tests (exit 0); `pnpm audit:prod` reported no known vulnerabilities (exit 0). The three-engine Progress run exposed obsolete visible-h1 geometry checks; they now assert one semantic hidden title, no visible header, and the unchanged content-heading geometry. The fresh release stamp is `2026-11-01`, with all three bilingual entries limited to changes since deployed `7f61f55d` and the matching offline archive regenerated. Architecture and Quality Checklist now explicitly supersede older date-toolbar requirements.

Final gate output is retained in ignored `output/release-*.log` files and exact-commit GitHub Actions. Publication remains conditional on successful local hook gates, full Quality/verify, Pages build/deploy and production verification; the final chat report supplies their outcomes without editing the tested snapshot afterward.

## Visual/manual evidence

Inspected actual Arabic 390px, 320px/200% and desktop Overview screenshots, plus light English Overview/Trends/Records. The reference comparison led to compact recording dates, larger plot markers, narrower readable record columns and a single range dropdown. Progress browser specs capture Arabic/English screenshots at phone, tablet and desktop widths, including 200% text and Glass.

## Documentation updated

Active phase, decision log, Design System, Architecture and Quality Checklist document the owner-requested hidden title and single-range-selector contract. The bilingual release manifest and offline release history cover only this release.

## Decisions recorded

Latest owner request supersedes pinning the visible title; retain a semantic screen-reader heading. Use one shared date-range dropdown across layouts, as explicitly corrected by the owner. The 2026-11-01 instruction renews authority to review, check and push all pending changes.

## Known limitations or remaining risks

Physical-device and human screen-reader acceptance remain separate. Screenshots validate composition; no numerical visual-fidelity or complete accessibility certification is claimed. Final exact-commit release results are recorded in the chat.

## Out-of-scope findings

No reviewed religious content changed.

## Recommended next step

Physical-device and assistive-technology acceptance after verified deployment.
