# Phase 16 — Elevation and Surface Integrity

## Objective

Make the elevation contract work in every theme, and give every shared surface exactly one
definition.

## Scope

`src/styles/theme.css`, `src/app/components/ZikrComponents.css`, and the ad-hoc
`shadow-xl` / `shadow-2xl` / `shadow-lg` call sites that exist to compensate.

## Findings addressed

F11, F12, F15, F22 — see `docs/audits/DESIGN_CONSISTENCY_AUDIT.md`.

## F15 decision — resolved

Recorded as **DEC-065**: the document is authoritative. The counter becomes a 24px rounded
rectangle at every breakpoint, restoring DEC-003's stable-surface intent.

This changes the shape of the app's most-used control in Reader, Masbaha and Friday
Salawat. Implement it by keeping the `ZikrComponents.css` definition and replacing the
38 / 44 / 52 / 72px literals so radius follows the geometry scale. The documented
_dimensions_ do not change — only the corner radius. `DESIGN_SYSTEM.md` needs no
counter-radius edit because the implementation is moving to match it; re-verify its
responsive size table and the Reader contract against the result in the same change.

## Required reading

- `docs/audits/DESIGN_CONSISTENCY_AUDIT.md`
- `docs/DESIGN_SYSTEM.md` — elevation contract, Reader contract, counter geometry
- `DECISION_LOG.md` DEC-003 (opaque surfaces for functional/devotional content)
- Both definitions of `.adaptive-counter-surface`

## Step 1 — Per-theme elevation tokens

`--ds-shadow-raised` is currently one light-theme value used by all themes, invisible on
the dark grounds. Move `--ds-shadow-raised` and `--ds-shadow-overlay` into each theme block
(`:root`, `.dark`/`.theme-dark`, `.light-mode`/`.theme-light`, `.theme-midnight`,
`.high-contrast`), with alpha appropriate to that ground.

Verify by measuring the rendered shadow against the card background in each theme — a card
must read as raised without relying on its border.

## Step 2 — Retire the compensating shadows

With Raised working, the ad-hoc `shadow-2xl` (5 sites), `shadow-xl` (4) and `shadow-lg` (5)
usages should collapse onto `shadow-raised` / `shadow-overlay`. Where a call site genuinely
needs a third value, that is a gap in the contract — report it rather than inventing one.

`.glass-card` / `.wird-card` carry their own duplicated shadow literals; point them at the
tokens.

## Step 3 — One definition per surface

1. Delete the duplicate `.adaptive-counter-surface` block. `ZikrComponents.css` matches the
   documented opaque contract and is the one to keep. Confirm the orphaned
   `backdrop-filter: blur(24px)` is gone from the computed style.
2. Apply the F15 decision to the surviving definition and its breakpoint steps.
3. De-duplicate `@keyframes tap-ripple-expand`, `.tap-ripple` and `.pulse-ring`. Counter and
   zikr animation belongs in `ZikrComponents.css`.
4. Give `.pulse-ring` an explicit duration and easing instead of `animation-name` alone, and
   remove the `!important` sizing overrides if the specificity allows it. If they cannot be
   removed without restructuring, leave them and note it.

## Acceptance criteria

- Cards read as raised in Light, Midnight, Dark and high-contrast without relying on borders
- No `shadow-xl` / `shadow-2xl` / `shadow-lg` remain outside a documented exception
- `.adaptive-counter-surface` has exactly one definition
- The counter's computed `backdrop-filter` is `none`
- No keyframe or shared class is declared in two stylesheets
- Counter geometry, `DESIGN_SYSTEM.md` and the regression tests agree
- Reduced-motion behaviour is unchanged

## Required tests and evidence

```bash
pnpm check
pnpm test:e2e
```

Add a test asserting the counter's computed `backdrop-filter` is `none` and its radius
matches the decided contract. Evidence: counter and one card surface captured in all four
themes, before and after.

## Prohibited changes

- No change to counter dimensions, only radius, unless the F15 decision says otherwise
- No reintroduction of glass treatment on functional or devotional surfaces (DEC-003)
- No change to the completion, ripple or press timings — Phase 20 owns motion values
- No colour token changes

## Completion output

Use `docs/agent/templates/PHASE_REPORT.md`.
