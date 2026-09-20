# Phase Report — Responsive Mushaf desktop rail

## Objective

Restore the important right-side Mushaf navigation on wide screens without changing the canonical one-page reading experience or the approved mobile corner controls.

## Scope completed

- Re-enabled the existing physical-fit rail gate for desktop and landscape tablet viewports.
- Kept one canonical Mushaf page and retained compact/portrait corner actions.
- Removed the Focus Mode entry from the standalone rail so the reader keeps one visible interaction model.

## Files changed

- `src/app/screens/KhatmahReaderScreen.tsx`
- `src/app/components/MushafToolRail.tsx`
- `src/app/screens/KhatmahReaderScreen.test.tsx`
- `e2e/khatmah-reader.spec.ts`
- `docs/DESIGN_SYSTEM.md`
- `docs/agent/DECISION_LOG.md`
- `docs/agent/INDEX.md`
- `docs/agent/phases/PHASE_42_MUSHAF_DESKTOP_RAIL.md`
- `public/release-notes.json`

## Components added or modified

- Modified `KhatmahReaderScreen` to use the shared responsive Mushaf shell measurement.
- Made the `MushafToolRail` Focus Mode action optional.

## User-visible changes

- Desktop and qualifying landscape tablets show the Mushaf tools in a right-side rail.
- Mobile and portrait tablets retain the four corner controls.
- The sacred page remains a single full-screen canonical page at every width.

## Accessibility work

- Preserved labelled native buttons, visible focus, minimum target sizes, and the rail's labelled group semantics.
- Kept direct access to common tools on wide screens and removed the alternate hidden-controls mode.
- Preserved direction-independent physical page movement and the outward Back action.

## Tests added or updated

- Updated component coverage for responsive rail/corner switching and the absence of Focus Mode.
- Updated browser coverage for the right rail in landscape and corner controls after portrait resize.

## Commands run

| Command                                     | Result                                        |
| ------------------------------------------- | --------------------------------------------- |
| `pnpm install --frozen-lockfile`            | Passed; lockfile already current              |
| `pnpm check`                                | Passed in 62.6s                               |
| Focused `KhatmahReaderScreen` Vitest suite  | 29 passed                                     |
| Focused responsive Mushaf Playwright test   | 1 passed                                      |
| Focused desktop rail accessibility/settings | 2 passed                                      |
| Focused mobile Saved-flow regression tests  | 2 passed                                      |
| `pnpm test:e2e`                             | 377 passed, 1 skipped, 2 flaky retries passed |
| `pnpm build:pages`                          | Passed, including bundle and CSS budgets      |

## Visual/manual evidence

- Playwright verified one-page rendering, the right-side rail at 1280×720, the four corner controls after resizing to 320×700, and no automated WCAG A/AA violations in the desktop rail.

## Documentation updated

- Updated the authoritative Mushaf design contract and recorded DEC-185.

## Decisions recorded

- DEC-185 restores the right-side wide-screen rail while preserving one-page rendering and mobile controls.

## Known limitations or remaining risks

- Real-device safe-area and screen-reader behavior remain manual release evidence.
- Two existing immersive-reader interactions timed out on their first desktop Chromium attempts during the full suite; both passed on automatic retry and the required command exited successfully.

## Out-of-scope findings

- No Qur'an content, pagination, progress, or persistence behavior changed.

## Recommended next step

- Complete the release gates, deploy, and verify the responsive reader on production.
