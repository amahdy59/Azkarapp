# Phase 81 — Header contrast and progressive counter guidance

## Objective

Keep reader headers legible across themes and device sizes, and reduce repeated counting help after the user has learned the interaction without hiding a recovery path.

## Scope completed

- Strengthened the shared compact header with an opaque semantic background, backdrop treatment and scroll-state border/shadow.
- Added device-local first-use guidance state. The full hint is shown until the first count, then collapses to a compact hand button.
- Added a 44px hand-button restore action that reopens the explanation without changing counter state.
- The hand control is a real toggle, so users can hide and restore the explanation deliberately.
- Added a page-shaped 15-line Mushaf placeholder that reserves one or two equal leaves before the first page pair resolves.
- Applied the behavior consistently to Reader, Custom Counter and Friday Salawat.

## Files changed

- Shared header, guidance component, Mushaf placeholder, guidance hook and reader/counter screens.
- Arabic and English reader translations.

## User-visible behavior changed

Headers remain readable over optional artwork and high-contrast themes. Counting guidance teaches new users once per device, then leaves a small hand control in the same area for reopening or hiding. Mushaf first paint reserves the final page geometry rather than showing a generic spinner.

## Accessibility work

The restore affordance is a native button with a localized accessible name, title and visible focus ring. It retains a 44px target and does not rely on color alone.

## Tests added or updated

Added coverage for automatic collapse, device-local dismissal, explicit toggle, reopening and equal Mushaf placeholder leaves. Existing shared-header assertions remain intact.

## Commands run

| Command                    | Result                                                           |
| -------------------------- | ---------------------------------------------------------------- |
| `pnpm typecheck`           | Passed                                                           |
| `pnpm check`               | Passed (1,479 tests; coverage, lint, content and bundle budgets) |
| Focused Vitest             | 11 passed                                                        |
| Mushaf parity/surah Vitest | 48 passed                                                        |
| `pnpm test:e2e:fast`       | Passed (26 tests)                                                |
| Focused browser suite      | Passed (41 tests, desktop Chromium)                              |
| `pnpm build:pages`         | Passed                                                           |

## Visual/manual evidence

The focused browser suite passed across the existing reader micro-interaction and Khatmah flows. It includes phone, tablet and desktop geometry checks, keyboard counting, reduced-motion behavior and the loading/resolved Mushaf spread. A physical OLED and enlarged-text pass remains recommended.

## Documentation updated

Architecture and agent index entries added.

## Known limitations or remaining risks

Manual physical-device verification is still recommended for OLED, enlarged-text and browser safe-area combinations. The placeholder reserves equal leaf space; final QCF page fitting can still vary slightly by font metrics after the font becomes available.

## Recommended next step

Capture visual snapshots on a light theme, OLED theme, 320px viewport and 200% text size, then add those snapshots to the visual regression set if the project adopts one.
