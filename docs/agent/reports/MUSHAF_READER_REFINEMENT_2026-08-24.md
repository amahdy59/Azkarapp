# Phase Report — Mushaf reader refinement

## Objective

Refine the canonical Mushaf experience so its Surah openings are compact and dignified, navigation is physically predictable, desktop spreads are spacious and responsive, and reader settings expose only relevant controls.

## Scope completed

- Added a compact, code-native arabesque Surah heading band and reduced Bismillah size without altering the reviewed 15-line page geometry.
- Kept reader navigation and progress controls permanently visible.
- Standardized physical navigation: rightward swipe, Right Arrow, Page Down, and Next move forward; their opposites move backward.
- Restricted two-page layout to desktop widths that can safely fit both pages.
- Increased the desktop spread gutter and loaded both pages concurrently before swapping the visible spread.
- Removed the alternate Comfort presentation and its persisted preferences so Surah navigation always remains in the canonical Mushaf view.
- Reduced the root settings menu to contextual theme, desktop-only layout, and bookmark actions.

## Files changed

- `src/app/components/MushafPageViewer.tsx`
- `src/app/screens/KhatmahReaderScreen.tsx`
- `src/app/components/MushafImmersiveReader.tsx`
- `src/app/App.tsx`
- `src/app/state.ts`
- `src/app/types.ts`
- `src/app/i18n/ar.ts`
- `src/app/i18n/en.ts`
- `src/styles/theme/layout.css`
- Related unit and end-to-end tests
- `docs/DESIGN_SYSTEM.md`
- `docs/agent/DECISION_LOG.md`
- `public/release-notes.json`

## Components added or modified

- `MushafPageViewer`: compact ornament, smaller Mushaf-font Bismillah, and explicit spread gutter.
- `KhatmahReaderScreen`: permanent chrome, contextual settings, canonical-only reading, corrected physical navigation, and concurrent spread resolution.
- `MushafImmersiveReader`: matching physical keyboard and button placement.
- App state and persistence normalization: obsolete Comfort-mode preferences are safely ignored.

## User-visible changes

- Surah openings use less vertical room while preserving the Quran text and page line structure.
- The top location controls and bottom progress/navigation controls remain available.
- Desktop spreads have a 24–48 px visual gutter and turn as one resolved pair.
- Phones always use a single page and no longer show an irrelevant layout setting.
- Selecting a Surah no longer exposes the old reflowed reading view.

## Accessibility work

- Preserved native buttons, menu semantics, keyboard focus, and 44 px product targets.
- Kept semantic Previous and Next labels while aligning physical placement, arrows, keyboard keys, and swipe direction.
- Added English-UI RTL/LTR seam coverage and keyboard-operated settings-submenu coverage.
- Permanent controls remove the need to discover or recover hidden navigation.

## Tests added or updated

- Ornament and Bismillah font/size assertions.
- Mobile single-page enforcement despite a legacy forced-spread preference.
- Mobile settings relevance and desktop nested layout-menu behavior.
- English UI direction/order regression coverage.
- Concurrent two-page request regression coverage.
- Permanent-control, swipe, keyboard, and button direction end-to-end coverage.
- Legacy preference normalization coverage.

## Commands run

| Command                          | Result                                                                                                                          |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile` | Passed; lockfile and dependencies were current.                                                                                 |
| Focused Vitest suite             | Passed; 65 tests.                                                                                                               |
| Focused Playwright reader suite  | Passed; 5 tests.                                                                                                                |
| `pnpm check`                     | Passed.                                                                                                                         |
| `pnpm test:e2e`                  | First launcher attempt exited with Windows code 3221226505 before running a test; clean rerun passed, 312 tests in 7.2 minutes. |
| `pnpm build:pages`               | Passed; 1,932 modules, 155 precache entries.                                                                                    |
| `pnpm audit:prod`                | Passed; no known production vulnerabilities.                                                                                    |
| `pnpm run check:release-notes`   | Passed.                                                                                                                         |
| `git diff --check`               | Passed.                                                                                                                         |

## Visual/manual evidence

- Mobile 390 × 844: inspected the compact ornament, reduced Bismillah, permanent controls, and absence of horizontal overflow.
- Desktop 1440 × 900: inspected a two-page spread with a measured 43 px gutter and both chrome regions visible.
- Desktop settings: inspected the compact three-row root menu and nested theme/layout choices.
- Browser console: no errors or warnings during the inspected reader flows.

## Documentation updated

- Updated the canonical Mushaf contract in `docs/DESIGN_SYSTEM.md`.
- Added the release-specific bilingual update summary in `public/release-notes.json`.

## Decisions recorded

- DEC-102 records permanent reader chrome, physical navigation direction, canonical-only Khatmah reading, desktop fit gating, compact Surah openings, and concurrent spread resolution.

## Known limitations or remaining risks

- Automated and desktop-browser evidence does not replace a real-device screen-reader pass.
- First-time QCF font availability still depends on the established download/cache path; fallback behavior is unchanged.

## Out-of-scope findings

- The separate long-Surah immersive reader retains its established presentation modes; only its physical navigation direction was aligned.

## Recommended next step

After deployment, verify the production release stamp, service-worker manifest, both reader viewports, console health, and responsive behavior before accepting the release.
