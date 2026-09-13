# Phase Report — Home glass and prayer width

## Objective

Make Home's shared glass material visibly read as glass and bound expanded prayer detail to half of the available tablet and desktop width.

## Scope completed

- Refine the existing shared `hero-glass` material without adding another card variant.
- Keep expanded prayer detail full-width on phones and use one of two equal logical tracks from tablet width.
- Align the detail track with the selected prayer while preserving prayer DOM order and RTL mirroring.
- Verify normal and reduced-transparency behavior, responsive geometry, and the release pipeline.

## Decision

DEC-171 records the approved material and responsive composition.

## Files changed

- `src/app/screens/HomeScreen.tsx`
- `src/styles/theme/layout.css`
- `e2e/counter-feedback.spec.ts`
- `e2e/reduce-transparency.spec.ts`
- `docs/DESIGN_SYSTEM.md`
- `docs/agent/DECISION_LOG.md`
- `docs/agent/INDEX.md`
- `public/release-notes.json`

## Components added or modified

- Modified the Home prayer-detail composition and the shared `hero-glass` material.

## User-visible changes

- Home cards retain visible background depth, edge light, blur, and saturation on tablet and desktop.
- Expanded prayer detail occupies one of two equal tracks from 768px upward and stays full-width on phones.

## Accessibility work

- Preserved prayer DOM order, RTL mirroring, keyboard behavior, reduced transparency, and forced-color behavior.

## Tests added or updated

- Added exact tablet and desktop half-width geometry coverage.
- Added shared glass-material and opaque reduced-transparency fallback assertions.

## Commands run

| Command                          | Result                                                             |
| -------------------------------- | ------------------------------------------------------------------ |
| `pnpm install --frozen-lockfile` | Passed; lockfile already current.                                  |
| `pnpm check`                     | Passed; 961 unit tests and all repository checks passed.           |
| `pnpm test:e2e`                  | Passed; 386 passed and 1 intentionally skipped.                    |
| `pnpm build:pages`               | Passed; Pages build, bundle budget, and CSS utility checks passed. |

## Visual/manual evidence

- The Home prayer state was visually inspected at 834px and 1280px before release validation.
- Playwright evidence capture covered Arabic midnight Home and every expanded prayer at compact, tablet, and desktop widths.

## Documentation updated

- Updated the design-system contract, decision log, phase index, phase report, and bilingual release notes.

## Known limitations or remaining risks

- Native backdrop-filter rendering can vary slightly by browser and GPU; the solid reduced-transparency fallback remains available.

## Recommended next step

- Verify the pushed Pages build and production Home scene after deployment completes.
