# Phase 15 — CSS Delivery Repair

## Objective

Restore the design-system primitives to the compiled stylesheet, repair the user-visible
overlay defects that followed from their absence, and add the regression coverage that
would have caught them.

## Scope

`src/styles/tailwind.css`, `src/styles/theme.css` (removal of compensating patches),
`src/app/components/ui/*`, and Playwright coverage for overlay geometry.

Repair only. No restyling, no token changes, no new visual design. Findings F06–F36 are
explicitly out of scope for this phase.

## Findings addressed

F01, F02, F03, F04, F05, F32 — see `docs/audits/DESIGN_CONSISTENCY_AUDIT.md`.

## Required reading

- `docs/audits/DESIGN_CONSISTENCY_AUDIT.md`
- `docs/DESIGN_SYSTEM.md` — focus/elevation/geometry contracts and the Benefit sheet contract
- `src/styles/tailwind.css`
- `src/app/components/ui/{alert-dialog,drawer,dropdown-menu,select,input-otp,scroll-area}.tsx`
- The `[data-slot="dropdown-menu-*"]` block in `src/styles/theme.css`

## Step 1 — Repair the source scan

1. Remove the `@source not '../app/components/ui/**'` exclusion and its inert re-include.
2. Rebuild and confirm the 41 classes listed in F01 now appear in `dist/assets/*.css`.
3. Diff the built CSS before and after. Every change must be an _addition_. If any existing
   rule changed or disappeared, stop and report.

## Step 2 — Remove the compensating workarounds

The `[data-slot="dropdown-menu-radio-item"]` / `[data-slot="dropdown-menu-checkbox-item"]`
padding and indicator-position rules in `theme.css` exist only because `ps-8` and `start-2`
never compiled. Remove the padding and inset overrides; keep the `[data-state="checked"]`
color treatment, which is a deliberate theme decision.

Verify in the browser that radio and checkbox items keep their logical-start checkmark
gutter in both LTR and RTL before deleting anything.

## Step 3 — Verify the repaired surfaces

Inspect each of the following in the running app, in Light and Midnight, LTR and RTL:

| Surface                    | Expected after repair                                           |
| -------------------------- | --------------------------------------------------------------- |
| Confirm dialog (F02)       | Centred in the shell; scrim visibly dims the background         |
| Drawer / sheet scrim (F03) | Visibly dims the background                                     |
| Dropdown items (F04)       | Rounded, correct padding, indicator gutter, no UA focus outline |
| Long menu, short viewport  | Clamps to available height and scrolls internally               |
| Menu open animation        | Zoom originates from the trigger, not the element centre        |
| OTP field (F05)            | Slot separators, field background and blinking caret all render |

Anything still wrong after Step 1 is a genuine component defect, not an F01 consequence —
record it as a new finding rather than fixing it opportunistically.

## Step 4 — Regression coverage

Add tests so this class of failure cannot recur silently:

1. **Build assertion** — extend `scripts/check-bundle-budget.mjs`, or add a sibling script
   in the `pnpm check` chain, that fails when a known primitive-only class
   (`.rounded-sm`) is absent from the built CSS.
2. **Overlay geometry (Playwright)** — assert the confirm dialog's centre is within a small
   tolerance of the shell centre, and that the overlay's computed `background-color` has
   non-zero alpha. This is the specific gap in F32: axe passes these surfaces.
3. **Menu bounds** — assert an opened menu stays within the viewport on a 320px-wide
   profile.

Use `AlertDialog`'s real trigger path (Settings → Account & data → Erase local data), not a
synthetic mount, and do not let the test actually erase state.

## Acceptance criteria

- The 41 classes in F01 are present in the built CSS
- The confirm dialog is centred and its scrim dims the background
- Drawer and sheet scrims dim the background
- Menu items render with radius, padding and indicator gutter in LTR and RTL
- Menus clamp to available height and stay within the viewport at 320px
- The OTP field renders separators, background and caret
- The compensating `theme.css` patches are removed with no visual regression
- A build check fails if primitive-only utilities stop compiling
- Playwright asserts dialog centring and scrim opacity

## Required tests and evidence

```bash
pnpm check
pnpm test:e2e
```

Evidence: before/after screenshots of the confirm dialog and one dropdown, in Light and
Midnight, LTR and RTL, at 320px and 1280px. Record the before/after built-CSS diff summary.

## Prohibited changes

- No restyling of any primitive beyond restoring what the classes already specify
- No token value changes — those belong to Phase 16 and 19
- No unification of the menu recipes — that is Phase 17
- No widening of the `@source` scan to directories outside `src/app`
- No suppression of a newly visible focus outline; if one appears, it was always intended

## Completion output

Use `docs/agent/templates/PHASE_REPORT.md`.
