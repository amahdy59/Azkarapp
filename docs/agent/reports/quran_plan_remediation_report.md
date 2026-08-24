# Phase Report — Quran plan remediation

## Objective

Audit the inherited Quran/Khatmah work against the approved plan, repair incomplete or unreliable behavior, complete the functional study interactions, and preserve the Mushaf's canonical reading contract.

## Scope completed

- Separated current reading position, reading bookmark, page bookmarks, verse bookmarks, completed pages, daily snapshots, and the last reversible reading event.
- Made daily progress event-based and duplicate-safe for single pages and facing-page spreads.
- Added deterministic adaptive goals with inclusive ranges, explicit expiry, editable plans, quantitative weekly progress, completion, and full-event undo.
- Added first-time and returning Home states with a direct continuation action and distinct plan/progress access.
- Completed canonical ayah copy, native share, verse bookmarking, bookmark navigation, and verse highlighting.
- Added a reflowing Comfort mode while preserving the canonical 15-line facsimile as fixed data.
- Stabilized reader direction, physical page order, keyboard navigation, screen-reader output, and focus behavior across Arabic and English UI directions.
- Replaced placeholder study surfaces with only the locally supported, offline-capable actions.

## Files changed

- `src/app/state.ts`, `src/app/types.ts`, and their tests
- `src/app/App.tsx` and the Arabic/English i18n catalogs
- `src/app/screens/KhatmahReaderScreen.tsx`, `QuranWirdScreen.tsx`, `quranWirdGoal.ts`, and their tests
- `src/app/components/MushafPageViewer.tsx`, `MushafNavigationModal.tsx`, `ResponsiveSheet.tsx`, and their tests
- New `AyahInteractionSheet` and `QuranHomeCard` components with tests
- `src/app/content/qcfMushaf.ts` and its tests
- `e2e/khatmah-reader.spec.ts`
- Architecture, design-system, decision-log, and release-note documentation

## Components added or modified

- Added `AyahInteractionSheet` for canonical ayah actions.
- Added `QuranHomeCard` for first-time, continuation, daily-goal, and Khatmah orientation states.
- Expanded `MushafPageViewer` with canonical and Comfort rendering, stable facing pages, accessible verse actions, and page-level screen-reader regions.
- Expanded `MushafNavigationModal` with APG tabs and navigable verse bookmarks.
- Refined `KhatmahReaderScreen` and `QuranWirdScreen` around explicit progress, planning, recovery, and reading-mode boundaries.

## User-visible changes

- Readers can copy or share correct canonical Uthmani text even when the visible page uses QCF private-use glyphs.
- Readers can save an ayah and return to it from the Index; whole-page bookmarks and the current reading place remain separate.
- Home and the Wird overview show exact daily progress and Khatmah orientation without streaks.
- A Comfort mode reflows Quran text using the app text-size setting; Page mode retains the exact 15-line facsimile.
- Facing pages and navigation controls keep the same physical meaning in Arabic and English interfaces.
- Readers can complete a daily portion and undo the entire most recent page-turn event.

## Accessibility work

- Preserved cohesive page/verse text for assistive technology while keeping visual QCF glyphs out of canonical copy paths.
- Added scoped Arrow, Page Up/Down, Home, End, and Escape handling with stable focus and 44 px controls.
- Added position announcements, labelled page regions, correct progress/status semantics, and APG tab keyboard behavior.
- Added missing sheet descriptions and retained visible 3 px focus indicators.
- Verified automatic WCAG A/AA scans and responsive/touch-target checks as part of the full browser matrix; this does not replace real assistive-technology testing.

## Tests added or updated

- Persistence normalization, merge, adaptive-plan, daily snapshot, bookmark, and reversible-event tests.
- Exact devotional-day acceptance test for a 01:30 event with `progressDayStartHour = 3`.
- Canonical cross-page ayah reconstruction and QCF private-use exclusion tests.
- Ayah copy/bookmark sheet, Index tabs/bookmark navigation, Home states, Comfort mode, direction seams, page endpoints, spread loading, and keyboard tests.
- End-to-end canonical ayah action, 15-line geometry, progress, direction, swipe, keyboard, and chrome-focus coverage.

## Commands run

| Command                          | Result                                                                                                          |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile` | Passed; lockfile installation already up to date                                                                |
| `pnpm check`                     | Passed; toolchain, typecheck, unit tests, build, lint, format, audio manifest, bundle budget, and CSS utilities |
| `pnpm test:e2e`                  | Passed: 312/312 after replacing a stale-DOM focus race with semantic page-transition waits                      |
| Focused reader Vitest suites     | Passed: 38/38                                                                                                   |
| Focused Khatmah Playwright suite | Passed: 3/3 across desktop, mobile, and tablet Chromium                                                         |
| `pnpm build:pages`               | Passed, including the unchanged 160 KiB CSS budget and CSS utility check                                        |
| `pnpm audit:prod`                | Passed: no known production vulnerabilities                                                                     |

## Visual/manual evidence

- Inspected Arabic mobile overview and canonical page at 390 × 844.
- Inspected ayah 2:255 actions, saved-bookmark feedback, Index navigation, and post-navigation highlight.
- Inspected Comfort reflow with large text.
- Inspected the 1440 × 900 facing-page layout: lower page on the physical right, higher page on the physical left, with invariant forward/back controls.

## Documentation updated

- `docs/ARCHITECTURE.md` documents the separated Quran state and merge boundary.
- `docs/DESIGN_SYSTEM.md` records that the 15-line page is a facsimile whose geometry is data, not styling.
- `docs/agent/DECISION_LOG.md` records progress/event state, canonical copy behavior, Comfort mode, study deferrals, direction seams, and accessibility rules.

## Decisions recorded

- Khatmah percentage is orientation, not gamification; no streak was added.
- Translation, Tafsir, and Quran-wide search remain deferred until reviewed local data and an offline index exist.
- Selection-copy is not a supported QCF path because visible glyphs are private-use codepoints; ayah actions always resolve canonical Unicode text.

## Known limitations or remaining risks

- Translation, Tafsir, and Quran-wide search are intentionally absent pending reviewed offline sources.
- Automated accessibility evidence and keyboard review are complete, but named screen-reader/device sessions remain a manual release activity.
- Clipboard correctness is covered with an exact unit assertion because the visual-review browser session did not grant reliable clipboard readback.

## Out-of-scope findings

- No unrelated content, dependency, router, synchronization provider, or religious-source change was made.

## Recommended next step

Proceed to the next separately approved Quran phase only after production verification; retain the same verify-before-build and acceptance-criteria pattern.
