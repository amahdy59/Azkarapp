# Phase Report — Reader desktop and tablet refinement

## Objective

Refine the Reader experience on desktop and tablet using the supplied references as selective evidence while preserving Azkarapp's established controls, icons, reading measure, accessibility behavior, and devotional focus.

## Scope completed

- Moved Previous and Next to the card's vertically centered side edges on tablet and desktop.
- Removed the redundant desktop zikr-position strip.
- Replaced the circular/compact variants with one shared rectangular Reader and custom counter.
- Moved keyboard guidance below the counter with at least 20px clearance.
- Added concise bilingual release notes for the major user-visible improvements.

## Files changed

- `src/app/screens/ReaderScreen.tsx`
- `src/app/screens/CustomCounterScreen.tsx`
- `src/app/components/ZikrComponents.tsx`
- `src/styles/theme.css`
- `src/app/i18n/ar.ts`
- `src/app/i18n/en.ts`
- `e2e/reader-microinteractions.spec.ts`
- `e2e/counter-feedback.spec.ts`
- `public/release-notes.json`
- `docs/DESIGN_SYSTEM.md`
- `docs/agent/DECISION_LOG.md`
- This report

## Components added or modified

- Modified `ReaderScreen` navigation placement, card chrome, counter placement, and keyboard-shortcut guide.
- Modified the shared `ZikrCounterSurface` used by Reader and Custom Counter.
- Added localized accessible shortcut labels without adding a component or runtime dependency.

## User-visible changes

- Tablet and desktop navigation arrows sit at the card sides instead of beside the counter.
- The desktop card opens directly into the zikr without a duplicate position bar.
- Keyboard guidance sits below the counter, separated by at least 20px.
- Reader and custom counting use the same rectangular ratio-and-progress treatment.
- Update notices describe the major changes in four concise Arabic or English bullets.

## Accessibility work

- Preserved semantic buttons, existing icons, keyboard interactions, focus behavior, and minimum target sizing.
- Added a localized accessible name to the keyboard-shortcut group.
- Kept the guidance hidden at compact widths where it would compete with reading space.
- Full WCAG 2.2 AA compliance is not claimed from automation; manual screen-reader and physical-device safe-area checks remain required by the quality checklist.

## Tests added or updated

- Added focused assertions for the shared rectangular counter, side-arrow placement, removed position strip, accessible shortcut naming, and counter-to-guide spacing.

## Commands run

| Command                                                                                   | Result                                                                                                                              |
| ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm test:run -- ReaderScreen.audio` plus i18n parity, key-integrity, and encoding tests | Passed — 4 files / 11 tests                                                                                                         |
| Reader desktop and tablet E2E subset                                                      | Passed — 34/34                                                                                                                      |
| Affected timeout-sensitive E2E specs, serial                                              | Passed — 30/30                                                                                                                      |
| `pnpm check`                                                                              | Passed — formatting, lint, typecheck, audio validation, 68 Vitest files / 364 tests, coverage, production build, and bundle budgets |
| Desktop Chromium project                                                                  | Passed — 104/104                                                                                                                    |
| Mobile Chromium project                                                                   | Passed — 104/104                                                                                                                    |
| Tablet Chromium project                                                                   | Passed — 104/104                                                                                                                    |
| Firefox and WebKit smoke projects                                                         | Passed — 4/4                                                                                                                        |
| `pnpm install --frozen-lockfile`                                                          | Passed                                                                                                                              |
| `pnpm build:pages`                                                                        | Passed — 1,890 modules built, 127-entry PWA precache generated, and bundle budget passed                                            |

## Visual/manual evidence

- Direct Arabic browser review at 1440×900 and 1024×768.
- Confirmed that arrows align to the card sides, the duplicate strip is absent, the counter is rectangular, and keyboard guidance clears the counter.

## Documentation updated

- Updated the Reader contract in `docs/DESIGN_SYSTEM.md`.
- Recorded the final approved counter and Reader-card refinement as DEC-048 in `docs/agent/DECISION_LOG.md`.
- Added this phase report.

## Decisions recorded

- DEC-048 supersedes DEC-043's circular-counter geometry and DEC-047's keyboard-guide placement.

## Known limitations or remaining risks

- The aggregate `pnpm test:e2e` process exceeded its outer execution window after leaving Playwright browser processes alive. Every configured project was subsequently run to completion and passed, totaling 316/316 tests.
- Manual screen-reader and physical-device safe-area checks remain pending and are not represented as automated compliance evidence.

## Out-of-scope findings

- No devotional content, routing contract, persistence model, icon system, or runtime dependency was changed.
- Phase 09 work remains outside this refinement.

## Recommended next step

Publish and verify this refinement in production, then begin the Phase 09 analysis gate.
