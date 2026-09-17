# Phase Report — Menu Unification

## Objective

Make every menu one component with one appearance, one item anatomy and one direction-aware
positioning rule. Findings F06–F10 and F31.

## Scope completed

All five steps.

## Files changed

- `src/app/components/ui/dropdown-menu.tsx` — shared `menuSurface`; item anatomy; logical utilities
- `src/app/components/ui/select.tsx` — same surface; indicator moved to logical start
- `src/app/components/LayoutShells.tsx` — language control name and focus ring
- Six menu call sites and three item call sites — overrides stripped
- `e2e/overlay-geometry.spec.ts` — mirroring, surface and target-size assertions

## User-visible changes

- **`Select`'s checkmark moves from the trailing to the leading edge**, which is what
  `DESIGN_SYSTEM.md` always specified and what `DropdownMenuRadioItem` already did.
- Menu radius becomes 24px everywhere: from 20px on the four menus that overrode it, and
  from 8px on the two that did not.
- The Masbaha target menu no longer double-flips in Arabic.

## Accessibility work

`min-h-11` moved into the checkbox, radio and sub-trigger items so the 44px target comes
from the primitive rather than a call site remembering. Physical utilities in the primitive
(`data-[inset]:pl-8`, `ml-auto`) became logical, and the sub-trigger chevron now mirrors via
`data-rtl-flip`. The sidebar language control gained the localized `aria-label` and focus
ring its theme sibling already had.

## Tests added or updated

Three assertions in `e2e/overlay-geometry.spec.ts`: LTR/RTL mirroring at desktop width,
surface consistency (radius, padding, elevation), and every item at 44px or more.

## Commands run

| Command         | Result                          |
| --------------- | ------------------------------- |
| `pnpm check`    | Pass (exit 0)                   |
| `pnpm test:e2e` | 426 passed, 0 failed, 4 skipped |

## Decisions recorded

**DEC-068**, including a correction to the audit's F09 reasoning.

## Known limitations or remaining risks

- **The audit misidentified F09's culprit and I repeated it before testing.** Every
  `DropdownMenu` root already passed `dir`, so the manual flip was the double-flip, not the
  fix. Caught by writing the mirroring test instead of trusting inspection. The lesson is
  recorded because the same inference could recur.
- Hand measurement in a non-compositing browser pane produced two contradictory readings
  before the Playwright assertion settled it. Geometry claims in this environment should go
  through Playwright.

## Recommended next step

Phase 19 (Token Discipline).
