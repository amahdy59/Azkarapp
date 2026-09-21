# Phase Report — Qibla opt-in and iOS shell safe area

## Objective

Preserve the owner's Qibla permission edit and remove the duplicate bottom inset beneath compact navigation on iOS.

## Scope completed

- The live compass activates only from its named control and requests absolute orientation permission where supported.
- The fixed shell no longer adds bottom safe-area padding on top of the navigation or reading chrome.

## Files changed

- `src/app/screens/QiblaScreen.tsx`, `src/app/screens/QiblaScreen.test.tsx`
- `src/styles/theme/surfaces.css`, `e2e/responsive.spec.ts`
- `docs/ARCHITECTURE.md`, `docs/DESIGN_SYSTEM.md`, `docs/agent/DECISION_LOG.md`, `docs/agent/INDEX.md`, this report, and `public/release-notes.json`

## Components added or modified

- Qibla screen sensor opt-in and app shell safe-area ownership; no new component or dependency.

## User-visible changes

- Live compass starts on request; compact navigation no longer leaves an extra blank strip underneath on safe-area devices.

## Accessibility work

- Kept the named native permission button, status fallback, text bearing, and bottom-navigation targets; no automatic sensor request.

## Tests added or updated

- Qibla unit expectation for absolute permission; browser geometry and shell padding regression.

## Commands run

| Command                                | Result                               |
| -------------------------------------- | ------------------------------------ |
| Focused Qibla unit                     | 7 passed                             |
| Focused Chromium responsive regression | 1 passed                             |
| `pnpm install --frozen-lockfile`       | Passed; lockfile current             |
| `pnpm check`                           | Passed all repository checks         |
| `pnpm test:e2e`                        | 380 passed, 1 intentionally skipped  |
| `pnpm build:pages`                     | Passed; PWA and bundle checks passed |

The final release handoff records push and production deployment results.

## Visual/manual evidence

- Desktop browser verified shell/nav boundary at 390px; physical iOS Safari/standalone verification remains needed.

## Documentation updated

- Updated the Qibla contract, responsive safe-area ownership, decision log, phase index, and bilingual deployment notes.

## Decisions recorded

- DEC-190.

## Known limitations or remaining risks

- Physical device sensor permission and safe-area behavior cannot be fully simulated in desktop browsers.

## Out-of-scope findings

- No bearing calculation, religious content, or persisted state changed.

## Recommended next step

- Verify installed and browser iOS layouts and compass behavior on a physical iPhone.
