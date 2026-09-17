# Phase Report — Elevation and Surface Integrity

## Objective

Make the elevation contract work in every theme, and give every shared surface exactly one
definition. Findings F11, F12, F15 and F22.

## Scope completed

All three steps. F15 was resolved by DEC-065 before the phase began, unblocking Step 3.

## Files changed

- `src/styles/theme.css` — per-theme elevation tokens; duplicate counter/ripple rules removed
- `src/app/components/ZikrComponents.css` — sole owner of the counter; 24px radius
- `src/app/components/ZikrComponents.tsx` — pulse-ring timing moved into CSS
- `src/app/App.tsx` — dead `shadow-2xl` removed
- Eleven further call sites retired onto the elevation tokens

## Components added or modified

No component behaviour changed. `ZikrComponents.tsx` keeps only measured geometry inline.

## User-visible changes

- **Cards visibly separate from the ground in Midnight and Dark for the first time.** An 11x
  increase in shadow alpha, intended to be noticeable.
- **The counter is a 24px rounded rectangle at every breakpoint**, previously a pill at
  38/44/52/72px. Dimensions unchanged. Previous/Next follow it from 20px to 24px.

A visual before/after was produced and reviewed before this shipped.

## Accessibility work

None in scope. Elevation is decorative; every surface keeps the border that carries its
boundary contrast, and `--border-control` remains the 3:1 control boundary. Reduced-motion
behaviour is unchanged — the ripple's reduced-motion rule moved file but not effect.

## Tests added or updated

None added. Existing counter, reader and responsive coverage exercises these surfaces;
`e2e/responsive.spec.ts` asserts the app-shell radius, which the dead-shadow removal does
not affect.

## Commands run

| Command                                | Result    |
| -------------------------------------- | --------- |
| `pnpm check`                           | see below |
| `pnpm test:e2e`                        | see below |
| `node scripts/check-bundle-budget.mjs` | Pass      |
| `node scripts/check-css-utilities.mjs` | Pass      |

## Visual/manual evidence

`docs/agent/evidence/phase-16/ELEVATION_AND_SURFACES.md` records resolved shadow alpha per
theme before and after, the counter's measured radius and `backdrop-filter`, the definition
count per stylesheet, and the full list of retired shadows.

## Documentation updated

- `DECISION_LOG.md` — DEC-067
- `docs/audits/DESIGN_CONSISTENCY_AUDIT.md` — F11, F12, F15, F22 marked resolved

## Decisions recorded

**DEC-067** — per-theme elevation and single ownership of the counter surface.

## Known limitations or remaining risks

- **Smaller shadow utilities remain.** `shadow-sm` (17), `shadow-xs` (17), `shadow-2xs` (10)
  and `shadow-md` (13) are still in use. The brief scoped this step to `xl`/`2xl`/`lg`.
  Whether the contract needs a fourth subtle role, or these should collapse onto raised, is
  an open question recorded rather than decided.
- **Light-theme elevation is a judgement call.** 0.12 was chosen to stay clearly subordinate
  to the dark themes. If cards read as too flat in Light, that number is the one to move.

## Out-of-scope findings

- `shadow-2xl` on `.app-shell` never rendered at any viewport width — dead, removed.
- `.counter-ring-stage` was referenced by nothing and was removed with the duplicate block.
- The `!important` on the pulse ring's breakpoint sizing cannot be removed: the component
  sets width and height inline from the measured counter size, and inline beats a class.
  Documented in place rather than left unexplained.

## Recommended next step

Phase 17 (Menu Unification) — F06 to F10 and F31.
