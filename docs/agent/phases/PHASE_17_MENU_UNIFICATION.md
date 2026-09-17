# Phase 17 — Menu Unification

## Objective

Make every menu in the app one component with one appearance, one item anatomy and one
direction-aware positioning rule.

## Scope

`src/app/components/ui/dropdown-menu.tsx`, `src/app/components/ui/select.tsx`, the eight
`DropdownMenuContent` call sites, and the app-level direction provider.

## Findings addressed

F06, F07, F08, F09, F10, F31 — see `docs/audits/DESIGN_CONSISTENCY_AUDIT.md`.

## Depends on

Phase 15. The item radius and padding differences in F06 are partly F01 fallout, and the
measurements below will change once the primitives compile. **Re-measure before designing
the fix.**

## Required reading

- `docs/audits/DESIGN_CONSISTENCY_AUDIT.md`
- `docs/DESIGN_SYSTEM.md` — geometry contract, elevation contract, and the rule that a
  selected menu item uses a logical-start checkmark
- Radix `DirectionProvider` documentation

## Step 1 — One menu surface

Put the correct values in `DropdownMenuContent` so no call site needs to restyle it:

| Property           | Value                                      |
| ------------------ | ------------------------------------------ |
| radius             | `--ds-radius-overlay` (menus are overlays) |
| padding            | one value, applied in the primitive        |
| border             | `border-border-control`                    |
| elevation          | `shadow-overlay`                           |
| `sideOffset`       | one value                                  |
| `collisionPadding` | `8`                                        |

Then strip `className` overrides from all eight call sites. Keep only genuinely per-menu
props: `align`, and `min-w` where a specific menu needs a wider measure.

Apply the same surface to `DropdownMenuSubContent`, which currently uses a third elevation.

## Step 2 — Align Select with DropdownMenu

`SelectContent` and `DropdownMenuContent` are the same pattern and must share radius,
border, elevation and item anatomy.

Move `SelectItem`'s check indicator to **logical start**, matching the documented contract
and `DropdownMenuRadioItem`. This is the one user-visible behaviour change in this phase:
in RTL the two controls currently place the checkmark on opposite sides.

## Step 3 — Item anatomy

Add `min-h-11` to `DropdownMenuCheckboxItem`, `DropdownMenuRadioItem` and
`DropdownMenuSubTrigger` so the 44px target does not depend on a call site. Confirm
`SelectItem` and `DropdownMenuItem` retain theirs.

Measure every item variant at 320px after the change; the design system's target-size rule
has no menu exception.

## Step 4 — Direction

Mount Radix's `DirectionProvider` at the app root, fed from the existing language/direction
state. Then remove the manual flip at `CustomCounterScreen.tsx:203` and use logical
`align` everywhere.

Verify in Arabic that every menu opens against the trigger's logical-start edge and that
DOM and tab order are unchanged, per the typography contract's rule against encoding
direction by reordering.

## Step 5 — Accessible names (F31)

The sidebar theme control exposes `aria-label="Theme: Midnight"`; the language control
beside it has none, so it announces as `"LanguageEnglish"`. Add the matching localized
label through the i18n system.

## Acceptance criteria

- One menu surface definition; no call site restyles radius, padding, border or elevation
- `SelectContent` and `DropdownMenuContent` are visually identical surfaces
- Selected items in both use a logical-start checkmark
- Every menu item variant measures at least 44px
- Every menu uses logical alignment via `DirectionProvider`; no manual RTL flips remain
- Menus stay within the viewport at 320px with collision padding applied
- The language and theme sidebar controls announce in the same format
- DOM and tab order unchanged in both languages

## Required tests and evidence

```bash
pnpm check
pnpm test:e2e
```

Add: an RTL test asserting a menu aligns to the trigger's logical-start edge; a test
asserting every item variant is at least 44px; a test asserting the selected item's
indicator sits at logical start in both directions.

Evidence: all five menus captured in Arabic and English, Light and Midnight, at 320px and
1280px.

## Prohibited changes

- No change to menu contents, options, or ordering
- No replacement of a radio menu with another control type
- No `rtl:` physical transforms — direction comes from the provider and logical properties
- No removal of `aria-current`, radio roles or checked state

## Completion output

Use `docs/agent/templates/PHASE_REPORT.md`.
