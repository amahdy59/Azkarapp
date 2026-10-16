# Phase Report — Sticky Home prayer cards

## Objective

Keep the existing prayer cards visible while Home scrolls. Local only: no commit, push or deployment. The owner superseded the replacement bar with the original cards, then approved abbreviated original cards whenever away from the top: hide footers while keeping the next countdown visible.

## Scope completed

Plan before edits: reuse the five existing PrayerTrackerCards inside Home's existing sticky header boundary, preserve card layout and actions, retain responsive horizontal scrolling, measure sticky clearance for native keyboard scrolling, and verify Arabic/English phone/desktop layouts. Preserve all concurrent Home/audio/sharing work.

## Files changed

- src/app/screens/HomeScreen.tsx
- src/app/screens/HomeScreen.render.test.tsx
- src/app/components/PrayerTrackerCards.tsx and home-wird.css
- e2e/sticky-prayer-cards.spec.ts
- This report and docs/DESIGN_SYSTEM.md.

## Components added or modified

HomeScreen composes the sticky block and transient condensation. PrayerTrackerCards supplies a visually conditional next countdown; home-wird.css hides footers only under the Home condensed boundary. No new runtime dependency, persistence, timing, religious content or translation changes.

## User-visible changes

The original five cards remain beneath the date/path header while scrolling in either direction. After 96px of scrolling, hide footers and show the next countdown beneath its time; restore the full cards within 8px of the top. Separate thresholds prevent height changes from repeatedly toggling the row. A solid theme-aware backing keeps scrolled content from interfering with the cards. Very short or enlarged-text viewports restore ordinary scrolling if a 44px action cannot fit below the sticky block.

## Accessibility work

Existing native actions, keyboard order, focus indicators and horizontal-scroll semantics are retained. ResizeObserver measures the sticky block and updates the Home scroll region's scroll-padding-top, including after viewport or text-size changes. No duplicated cards, added announcements or automatic motion. Human assistive-technology acceptance is not claimed.

## Tests added or updated

Home render coverage verifies that all five original cards share the sticky boundary. A dedicated browser regression checks downward/upward scrolling, original card content, native keyboard actions, Arabic/English at 320/1440px, enlarged text, measured scroll clearance, overflow and automated accessibility; it captures screenshots and is tagged for the existing Firefox/WebKit smoke projects.

## Commands run

| Command                                                                                                                                    | Result                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| pnpm test:run src/app/screens/HomeScreen.test.ts src/app/screens/HomeScreen.render.test.tsx src/app/components/PrayerTrackerCards.test.tsx | Passed: 3 files, 41 tests                                                                                                                                                                                                                                                                                                                                                                                                                  |
| pnpm test:e2e e2e/sticky-prayer-cards.spec.ts --project=desktop-chromium --project=desktop-firefox-smoke --project=mobile-webkit-smoke     | Passed: 12 tests (2.3m)                                                                                                                                                                                                                                                                                                                                                                                                                    |
| pnpm test:e2e e2e/compact-prayer.spec.ts --project=desktop-chromium --grep 'compact prayer panels reflow across .* 390 view'               | Passed: 2 tests (1.9m)                                                                                                                                                                                                                                                                                                                                                                                                                     |
| pnpm check                                                                                                                                 | Initial run: formatting failed during in-flight edits; formatting corrected. Final run: every stage passed except one concurrent quick-share i18n-integrity test; 277 unit files/1,969 tests passed, 1 file/test failed (213.0s). Missing keys subsequently restored by the concurrent session; targeted integrity/Home render recheck passed: 2 files, 14 tests (8.96s). The full gate was not repeated after this unrelated copy update. |
| git diff --check                                                                                                                           | Passed                                                                                                                                                                                                                                                                                                                                                                                                                                     |

## Visual/manual evidence

Arabic phone/desktop screenshots were inspected and copied to output/playwright/sticky-prayers/sticky-prayers-ar-320.png and sticky-prayers-ar-1440.png. English captures are retained alongside them. Original cards remain visible with scrolling content below; narrow layouts retain the horizontal card strip.

## Documentation updated

This phase report and the Home sticky-card design contract.

## Decisions recorded

Owner explicitly requested original cards instead of the replacement bar, then selected abbreviation whenever away from the top, and prohibited pushing. This phase records those superseding decisions.

## Known limitations or remaining risks

Full-height cards deliberately occupy more vertical space than a compact bar, as requested. Other sessions are editing the same checkout, so broad gate results describe a shared working-tree snapshot. No release verification or deployment is performed.

## Out-of-scope findings

Existing concurrent modifications are retained and are not part of this phase. The final full gate observed missing home.quickShareError/home.quickShareCards in the other session's in-progress share hook. Both language entries were restored in that session before the final integrity recheck. No unrelated implementation repair was made here.

## Recommended next step

Owner review of the local sticky cards; coordinate the eventual release with the other session.
