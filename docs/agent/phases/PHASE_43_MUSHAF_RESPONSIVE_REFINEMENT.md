# Phase Report — Mushaf responsive refinement

## Objective

Make the Mushaf calmer and more page-like across desktop and mobile: remove app-added page framing, focus desktop navigation, restore an optional comfortable facing-page view, and improve the opening-page rhythm.

## Scope completed

- Removed app-level page cards, shadows, page backgrounds, opening-page outlines, and the bordered Surah selector.
- Reduced the standalone desktop rail to primary reading actions plus one secondary-action disclosure.
- Restored Automatic, Single Page, and Two Pages settings on physically qualifying landscape screens.
- Kept Automatic conservative when two technically fitting pages would be cramped.
- Unified the mobile word-meanings glyph with the desktop Translate glyph.
- Tightened the centered line rhythm on Mushaf pages 1–2 without editing Qur'an content or canonical line assignments.

## Files changed

- `src/app/screens/KhatmahReaderScreen.tsx`
- `src/app/components/MushafPageViewer.tsx`
- `src/app/components/MushafToolRail.tsx`
- `src/styles/theme/layout.css`
- `src/app/screens/KhatmahReaderScreen.test.tsx`
- `e2e/khatmah-reader.spec.ts`
- `docs/DESIGN_SYSTEM.md`
- `docs/agent/DECISION_LOG.md`
- `docs/agent/INDEX.md`
- `public/release-notes.json`

## Components added or modified

- `KhatmahReaderScreen`
- `MushafPageViewer`
- `MushafToolRail`

## User-visible changes

- Desktop readers can choose one or two pages when the viewport safely fits both.
- Automatic layout avoids cramped spreads.
- Desktop tools are easier to scan, while secondary choices remain available through More.
- Mushaf pages and the Surah selector no longer look like nested cards.
- Opening pages use a denser, more familiar printed-page rhythm.

## Accessibility work

- Preserved native button, switch, and radio semantics, 44px targets, visible focus, semantic page regions, RTL/LTR behavior, and keyboard page movement.
- Kept word-meanings state available visually and through `aria-checked` while unifying its icon.

## Tests added or updated

- Responsive component coverage for conservative Automatic layout and explicit wide-screen spreads.
- Browser coverage for two-page desktop rendering, collapse to one page in portrait, focused rail disclosure, desktop document containment, and accessibility.

## Commands run

| Command                               | Result                                                |
| ------------------------------------- | ----------------------------------------------------- |
| Focused Mushaf Vitest suites          | Passed: 82 tests                                      |
| Focused desktop Chromium Mushaf suite | Passed: 8 tests                                       |
| `pnpm install --frozen-lockfile`      | Passed; lockfile already current                      |
| `pnpm check`                          | Passed in 45.9s; 1,027 unit tests passed              |
| `pnpm test:e2e`                       | Passed: 376 passed, 1 skipped, 3 flaky retries passed |
| `pnpm build:pages`                    | Passed; bundle and CSS budgets passed                 |

## Visual/manual evidence

Responsive browser geometry verifies a facing desktop spread, one-page portrait collapse, permanent 44px mobile corner controls, no document scroll at a normal desktop height, and no automated WCAG A/AA violations in the desktop rail. Production smoke evidence is recorded after release.

## Documentation updated

- Updated the Mushaf design contract, decision log, phase index, and this report.

## Decisions recorded

- DEC-186.

## Known limitations or remaining risks

- Real-device safe-area and screen-reader behavior remain manual release evidence.
- Very short landscape windows intentionally scroll the paper internally to preserve legibility.
- Three unrelated browser checks timed out or lost focus on their first attempt under full-suite load; all passed on automatic retry and the required command exited successfully.

## Out-of-scope findings

- No Qur'an text, translation, source, page data, persistence shape, or progress behavior changed.

## Recommended next step

- Complete all release gates, deploy, and verify the responsive Mushaf on production.
