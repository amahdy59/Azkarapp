# Phase Report — Reader desktop and tablet refinement

## Objective

Refine the Reader experience on desktop and tablet using the supplied references as selective evidence while preserving Azkarapp's established controls, icons, reading measure, accessibility behavior, and devotional focus.

## Scope completed

- Repositioned the existing keyboard guidance beside session progress instead of leaving it detached at the bottom of the reading surface.
- Kept the established desktop Reader hero, 184px repetition counter, 600px reading measure, action buttons, and icon system.
- Centered the action group at tablet widths and retained the current responsive Reader structure.
- Added concise bilingual release notes for the major user-visible improvements.

## Files changed

- `src/app/screens/ReaderScreen.tsx`
- `src/app/i18n/ar.ts`
- `src/app/i18n/en.ts`
- `e2e/reader-microinteractions.spec.ts`
- `public/release-notes.json`
- `docs/DESIGN_SYSTEM.md`
- `docs/agent/DECISION_LOG.md`
- This report

## Components added or modified

- Modified `ReaderScreen` session chrome, action alignment, and keyboard-shortcut guide.
- Added localized accessible shortcut labels without adding a component or runtime dependency.

## User-visible changes

- Desktop keyboard guidance now sits in the session hero beneath progress.
- Tablet keyboard guidance now sits immediately below session progress and before the reading content.
- Tablet Reader actions are centered for a more balanced and predictable layout.
- Update notices describe the major changes in four concise Arabic or English bullets.

## Accessibility work

- Preserved semantic buttons, existing icons, keyboard interactions, focus behavior, and minimum target sizing.
- Added a localized accessible name to the keyboard-shortcut group.
- Kept the guidance hidden at compact widths where it would compete with reading space.
- Full WCAG 2.2 AA compliance is not claimed from automation; manual screen-reader and physical-device safe-area checks remain required by the quality checklist.

## Tests added or updated

- Added desktop and tablet assertions for shortcut placement, accessible naming, reading order, and centered tablet actions.
- Re-ran the complete configured Playwright inventory across all projects.

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

- Direct browser review at 1440×900 and 1024×768 in both Arabic and English.
- Confirmed that the desktop guide remains within the hero, the tablet guide precedes the reading content, actions remain visible, and the devotional text stays visually dominant.
- Confirmed that the supplied references were used selectively: no alternate icon set, duplicated progress, detached edge navigation, oversized empty canvas, or reduced counter was introduced.

## Documentation updated

- Updated the Reader contract in `docs/DESIGN_SYSTEM.md`.
- Recorded the approved evidence-led refinement as DEC-047 in `docs/agent/DECISION_LOG.md`.
- Added this phase report.

## Decisions recorded

- DEC-047 preserves the established Reader controls and proportions while relocating keyboard guidance by breakpoint.

## Known limitations or remaining risks

- The aggregate `pnpm test:e2e` process exceeded its outer execution window after leaving Playwright browser processes alive. Every configured project was subsequently run to completion and passed, totaling 316/316 tests.
- Manual screen-reader and physical-device safe-area checks remain pending and are not represented as automated compliance evidence.

## Out-of-scope findings

- No devotional content, routing contract, persistence model, icon system, or runtime dependency was changed.
- Phase 09 work remains outside this refinement.

## Recommended next step

Publish and verify this refinement in production, then begin the Phase 09 analysis gate.
