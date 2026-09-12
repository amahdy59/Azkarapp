# Phase Report — Production Visual Audit Remediation

## Objective

Make Phase 27 evidence accurately distinguish local and production verification, cover every expanded prayer across the responsive matrix, and remove excessive desktop Home whitespace.

## Scope completed

- Added an explicit deployed-origin mode to the existing Playwright configuration.
- Added Arabic expanded-prayer capture for all five prayers at compact, tablet, and desktop widths.
- Added an English light-theme expanded-prayer capture.
- Gave each prayer a fixed actionable clock state so disabled future controls are never forced.
- Stopped the desktop context grid from stretching the compact daily reminder to the routine card's height.
- Repaired UTF-8 punctuation and malformed Markdown introduced by the original Phase 27 report.

## Files changed

- `playwright.config.ts`
- `e2e/evidence-capture.spec.ts`
- `e2e/counter-feedback.spec.ts`
- `src/app/screens/HomeScreen.tsx`
- `public/release-notes.json`
- `docs/agent/INDEX.md`
- `docs/agent/phases/PHASE_27_PRODUCTION_VISUAL_AUDIT.md`
- `docs/agent/phases/PHASE_27_PRODUCTION_VISUAL_AUDIT_REPORT.md`

## Components added or modified

- `HomeScreen`: desktop context cards now retain their natural heights.
- Playwright configuration: `E2E_BASE_URL` selects an external deployment and disables the local preview server.

## User-visible behavior changed

- Desktop Home no longer stretches the shorter daily reminder card to match the main routine card, reducing empty space while preserving the existing content and navigation.

## Accessibility work completed

- Preserved semantic card order, RTL/LTR behavior, keyboard controls, focus treatment, and the four-item navigation.
- The expanded-prayer matrix asserts the selected prayer and its matching notch before every capture.

## Tests added or updated

- Added sixteen expanded-prayer evidence cases: five prayers at three responsive widths plus one English light-theme state.
- Added a desktop geometry assertion proving the companion card remains shorter than the primary routine card.

## Commands run and exact results

| Command                          | Result                                                          |
| -------------------------------- | --------------------------------------------------------------- |
| `pnpm install --frozen-lockfile` | Passed; lockfile already current                                |
| `pnpm check`                     | Passed, including 955 unit tests                                |
| `pnpm test:e2e`                  | Passed: 385 passed, 1 skipped                                   |
| `pnpm build:pages`               | Passed; 1,954 modules transformed and 163 PWA entries precached |

## Screenshots/evidence produced

- Local capture coverage passed. These captures validate the test and layout changes but are not represented as production evidence.
- Production screenshots and deployed-commit verification remain pending until this remediation commit is deployed.

## Remaining risks or known limitations

- The four manual-only accessibility checklist rows remain pending as documented in `docs/QUALITY_CHECKLIST.md`.
- Production verification must be completed against the deployed URL before this phase is closed.

## Documentation updated

- Corrected Phase 27 paths, commands, punctuation, scope, and evidence claims.
- Replaced the stale recommendation to repeat Phase 06 with production verification as the immediate next step.

## Recommended next phase

Deploy this remediation, capture the production matrix, visually inspect representative results, record the deployed commit, and then close Phase 27.
