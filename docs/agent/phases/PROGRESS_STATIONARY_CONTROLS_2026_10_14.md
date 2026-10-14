# Phase Report — Stationary Progress controls and enlarged chart labels

## Objective

Apply the owner's screenshot request to keep the Progress header and relevant period filters visible while records scroll. Complete the verified enlarged-axis readability repair.

## Plan before implementation

Retain the shared Header, tabs and date navigation in one opaque sticky owner. Keep the supporting reviewed quotation unchanged in the scrolling content. Measure the control height for native scroll padding and protect focused content from being obscured. Preserve records, normalized state, calendar/progress boundaries and all prior charts. Cap controls against the actual reading viewport on short screens with independent native control scrolling and a sticky title. Verify Arabic/English, 320px/200% text, phones, tablets, desktop, keyboard/pointer and portal menus; update release notes for only this follow-up; publish through intact hooks and verify exact-commit CI/Pages/production.

## Scope completed

ProgressScreen groups the title, Day/Week/Month/Year tabs and period navigation in a stationary surface. Its content wrapper cannot shrink below its intrinsic records, preserving sticky bounds. Geometry observes the controls and actual screen scrollport; short-screen controls use at most 60% of that reading viewport. Main scrolling does not move the controls. Their title remains sticky when the independently scrollable filters need space. Scroll padding and descendant-only focus recovery prevent obscured reading actions without moving portaled menu options.

ProgressTrendChart reserves a minimum text-scaled plot span so endpoint range labels cannot overlap at 200% text. The existing named keyboard-scrollable region contains that span without document overflow; no text is shrunk and no period is removed.

PrayerTrackerStats now explains partial-month elapsed days against the actual calendar month length. On day three, it shows three of the month's 29/30/31 calendar days; recording rates still use three days (15 prayer opportunities), excluding future days. Completed months retain their actual full-month denominator. Calendar boundaries, records and rates are unchanged.

## Files changed

src/app/screens/ProgressScreen.tsx; new screens/progress-screen.css; components/ProgressTrendChart.tsx; e2e/progress-trends.spec.ts; design/architecture/decision/index documents; this report; fresh public release notes and archived bilingual history.

## Components added or modified

ProgressScreen, ProgressTrendChart and PrayerTrackerStats, with bilingual i18n copy and prayer coverage regression tests. Existing Header, TabList and ProgressPeriodNavigation remain reusable and unchanged. Geometry is transient; no persisted setting, dependency or reviewed-content edit.

## User-visible changes

Header and global period filters remain available while records scroll. Past periods can be changed in place. Enlarged endpoint labels remain distinct; internal scrolling preserves large text. Supporting reflection scrolls with content so it does not occupy the fixed task area.

## Accessibility work

Native controls, visible focus and semantic DOM order retained. Actual reading viewport bounds leave room for records on short/zoomed screens; native internal scrolling keeps the controls reachable. Screen focus recovery ignores portal descendants and active pointer presses to preserve dropdown positioning, click delivery and keyboard semantics. Existing opaque theme tokens, RTL/LTR, safe-area spacing and reduced-motion contracts apply. Human assistive-technology/cutout checks remain separate.

## Tests added or updated

Axis geometry tests first reproduced overlapping month labels at 320px/200% text in both languages; after repair, 18 responsive cases passed across Chromium, Firefox and WebKit. New stationary-control tests retain exact before/after scroll coordinates, visible title, period changes, viewport-height bound, focus clearance, no document overflow and axe scans at four widths in both languages.

## Commands run

- Chart endpoint geometry: first candidate 2 failed; repaired candidate 18 passed across three engines, exit 0.
- Initial stationary Chromium suite: 6 passed, 2 short-screen bounds failures; fixed content shrink and actual-viewport cap.
- Fixed 320px/200% text stationary checks: 2 passed, exit 0.
- Focused screen/routing/chart units: 11 passed across three files, exit 0; typecheck and scoped ESLint passed.
- Broader header/chart browser run exposed portal focus propagation; interrupted after diagnosis, not reported as green. Descendant-only recovery fixes the cause; final complete affected suite recorded with release evidence.
- WebKit additionally exposed canceled pointer clicks when focus recovery moved a pressed button. Recovery now excludes active pointer presses, with pointer-up/cancel and keyboard resets. The final cross-engine flow verifies the original month drilldown and popup interactions without changed assertions or timeouts.
- Browser inventory: 1,463 tests assigned exactly once across nine shards.
- Complete affected browser suite: 85 passed across Chromium, Firefox and WebKit in 8.4 minutes, exit 0.
- Partial and completed Gregorian/Hijri month tests protect actual month lengths and unchanged elapsed-day denominators. The first test candidate had two ambiguous text queries (visible count and screen-reader status); scoped visible-count queries resolve this without changing product assertions.
- Prior application release a64b84c5: exact Quality/verify and Pages build/deploy succeeded. Production smoke returned expected SHA/release, ten historical months, two monthly columns, five prayer rows and no page errors.
- Final affected suite, hook gates, CI/Pages and production outcomes accompany the delivery; failed/interrupted candidates remain in output/progress-history-*.log.

## Visual/manual evidence

Stationary-control screenshots at four widths and both languages are produced by progress-trends specs. Axis and prayer captures are retained in output/playwright/progress-history and the existing per-engine evidence folders. Synthetic fixtures are used. No complete manual WCAG compliance claim.

## Documentation updated

Architecture, design system, decision log, active index, this report and release notes/history. Release 2026-10-14-4 describes only stationary controls, enlarged labels and clarified monthly elapsed-day coverage since deployed a64b84c5.

## Decisions recorded

The owner explicitly requests stationary header and relevant filters from the attached Progress screenshot while the original chart release is completing. This is a focused continuation of the approved Progress work. Earlier header-only stickiness is superseded on Progress only; unrelated screens retain their contracts.

## Known limitations or remaining risks

On short screens with enlarged text, the control region scrolls independently to retain space for reading. Physical assistive technology and safe-area acceptance require human evidence. All existing offline/persistence/content/prayer boundaries remain unchanged.

## Out-of-scope findings

None requiring unrelated application changes.

## Recommended next step

Complete exact-snapshot release verification, then human keyboard/screen-reader and physical short-screen acceptance.

## Final local feature verification

- Targeted month coverage, screen and chart units: 17 passed across three files (6.47s), exit 0.
- Updated month-label, historical-range and prayer-stack browser scenarios: 6 passed across Chromium, Firefox and WebKit (34.5s), exit 0.
- Full stationary controls and affected Settings/Progress browser suite: 85 passed (8.4m), exit 0.
- Exact release gate, CI and production results are retained in output/progress-history-release-report.md and output/progress-history-*.log.
