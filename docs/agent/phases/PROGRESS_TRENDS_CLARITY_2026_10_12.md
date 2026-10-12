# Phase report — Progress trends and clarity, 2026-10-12

## Objective

Apply the owner's approved less-is-more Progress review: clear trends, useful checkmark tracking, coherent spacing, accessible detail and preserved offline records.

## Scope completed

- Day removes Progress-only fruit badges and explanatory duplication; the garden, rhythm and lifetime statistics share one closed reflection disclosure. Home's photograph/routine presentation is unchanged.
- Week retains its semantic checkmark matrix and optional saved intention below the table; redundant best-routine, streak, full-day panels, insight and routine bars are removed. Future cells say Upcoming rather than implying non-completion.
- Month leads with one weekly-bucket azkar trend. The existing seven-column, 44px-target calendar and day records remain in a native disclosure. Future calendar dates cannot be selected as historical records.
- Year uses one monthly trend with native selection, exact records, an optional equivalent data table and navigation to the selected month. Repeated yearly statistic cards, mini calendars and quick-glance panel are removed.
- Prayer retains first position and one factual recording overview. Supporting totals and per-prayer records remain in detail, with wrapping labels and no repeated decorative bars. Friday retains exact independent records without duplicate bars.
- Gregorian month navigation clamps month-end dates to the destination month's final day.

## Files changed

ProgressScreen, ProgressViews, RoutineGarden, PrayerTrackerStats, FridayProgressStats, calendarPeriods, gardenViews, bilingual dictionaries and their relevant existing tests; new progressTrend selector, ProgressTrendChart, colocated tests and progress-trends browser spec. Existing quiet-garden/settings-progress browser tests now open optional calendar detail before checking it. Design system, decision log, phase index and this report document the approved contract.

## Components added or modified

ProgressTrendChart is a shared presentation-only component receiving derived points, language and a navigation callback. It owns only selection and measured chart width. Existing visual primitives, icons, semantic theme tokens and React/SVG are reused; no runtime dependency is added.

## User-visible changes

Recorded morning/evening/sleep completion is plotted by selected-calendar month or contiguous seven-day buckets within the month. Counts are deduplicated; the denominator is three routines per elapsed progress day, including all of the current day. Future buckets have no rate and are not plotted as zero. Current incomplete buckets explicitly say So far. Quran and prayer records remain independent; no combined worship score is introduced. Exact values appear only when requested. Sparse history receives calm guidance.

## Accessibility work

Named chart description; native labelled period selector and detail disclosures; equivalent table with row/column headers; localized values and bidirectional isolation; scoped selection status; theme-token strokes and hollow point markers; 44px control targets, visible focus and static charts respecting reduced motion. Axis-label size follows root text resizing with measured room. Arabic chronological order follows application direction while keeping DOM/control order stable. Automated evidence does not establish complete accessibility compliance.

## Tests added or updated

Trend tests cover duplicate completion records, unrelated practices, future records, today, custom day boundaries, leap-year and Hijri lengths, empty buckets and full completion. Chart tests cover named descriptions, exact selected values, future neutrality, optional table equivalence, Arabic formatting, selection recovery and month navigation callbacks. Existing tests retain Home, offline progress, Quran goal and prayer coverage contracts while asserting the approved simplified presentation. Browser tests add dense histories, both languages, phone/desktop evidence, axe scans, month exploration and offline reload.

## Commands run

- Targeted `pnpm test:run` across 14 Progress/calendar/i18n files: 84 passed, exit 0 (6.68s). See output/progress-review-2026-10-12/verified-unit.log.
- `pnpm exec playwright test e2e/progress-trends.spec.ts`: 13 passed, exit 0 (1.7m), across Chromium, Firefox and WebKit. Arabic/English, 320px/200% text, exact chart data, month navigation and offline navigation are covered. Installed offline reload is verified in Chromium; Windows WebKit reload previously produced an internal browser error, so cross-engine reload is not claimed.
- Existing affected responsive/settings/quiet-garden browser assertions passed during the broader run. Its two failures were the earlier WebKit offline-reload test arrangement, subsequently separated from cross-browser offline navigation.
- `pnpm typecheck`: passed. Scoped ESLint: passed after removing an unused import and a noninteractive tab stop. `git diff --check`: passed.
- `pnpm check`: failed overall. Unit suite with coverage, typecheck, content/audio checks, formatting and CSS checks passed; the run reported lint errors subsequently repaired and an initial-route bundle-baseline failure. This is not a green merge gate.
- `pnpm build:pages`: Vite/PWA build succeeded; bundle guard failed at 163375 gzip bytes versus recorded 159119. An isolated in-memory build restoring Progress runtime to HEAD still measured 162716 bytes, confirming existing concurrent growth already exceeds the baseline. Budgets/baseline were not changed.
- Full `pnpm test:e2e` was started and interrupted after the release blocker was established; it is incomplete and not reported as passing. No commit, push or production deployment was performed.

## Visual/manual evidence

Before: owner's Arabic phone attachment and captured Week/Month screens in output/progress-review-2026-10-12. After: browser artifacts in that folder's after subdirectory and existing responsive-evidence folder. Physical VoiceOver/TalkBack and device safe-area checks remain manual.

## Documentation updated

Design-system Progress contract, owner approval in decision log, active phase index and this report.

## Decisions recorded

The owner approved the review on 2026-10-12 with “apply recomendations and create beautiful charts.” This supersedes the previous always-visible Month calendar and Year bars/mini-calendar presentation only. Prayer-first ordering, independent Quran, elapsed-day recording semantics, content integrity and offline persistence remain binding. Other sessions' explicit publication holds and unrelated edits remain intact; no combined publication is performed by this phase.

## Known limitations or remaining risks

Recording gaps do not prove missed worship. Month trends aggregate into seven-day buckets starting at the selected calendar month's first day; they are labelled by calendar day ranges, not ISO week numbers. Current partial periods are labelled and no misleading improvement comparison is generated. Physical assistive technology and performance claims require separate evidence.

## Out-of-scope findings

Concurrent audio, Mushaf, content and sharing edits are not part of this phase and must not be committed or released as Progress work.

## Recommended next step

Review the completed Progress evidence and conduct physical-device/screen-reader acceptance before coordinating any combined release.

## Screenshot follow-up refinement

The owner requested less top crowding and clearer period text. The header now uses the shared safe-area spacing, equal 44px arrows and separate primary/secondary date lines. Week labels show the actual locale week boundaries and individual dates. Month-end navigation clamps correctly; exploring a historical month survives controlled route updates and focuses the Month tab. Period views load lazily. Native table scrolling remains; physical-device keyboard scrolling and assistive technology acceptance are still required.

The owner subsequently approved alternate Month calendar heatmap and optional Week routine bars. Implementation and verification are recorded in [the focused follow-up report](PROGRESS_OPTIONAL_CHARTS_2026_10_12.md).
