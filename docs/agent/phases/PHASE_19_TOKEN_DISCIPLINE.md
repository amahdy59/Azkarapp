# Phase 19 — Token Discipline

## Objective

Bring colour, radius and spacing back onto the documented scales, and add the lint rules
that keep them there.

## Scope

All of `src/app`, plus a new rule set in `scripts/eslint-rules.mjs`.

This is the largest and most mechanical phase. It changes many files and should change no
behaviour. Split it into reviewable commits — one per concern, not one per file.

## Findings addressed

F13, F14, F17 — see `docs/audits/DESIGN_CONSISTENCY_AUDIT.md`.

## Depends on

Phases 15–17. Migrating colours before the menus are unified means migrating call-site
overrides that Phase 17 deletes.

## Required reading

- `docs/audits/DESIGN_CONSISTENCY_AUDIT.md`
- `docs/DESIGN_SYSTEM.md` — geometry contract (spacing grid, radius roles) and colour roles
- The four accessibility-mode blocks in `src/styles/theme.css`
- `scripts/eslint-rules.mjs` — the existing `azkar/*` rule pattern to follow

## Step 1 — Colour (F17)

251 raw palette classes across 17 files, plus raw hex in four components. The reason this
matters beyond consistency: `high-contrast`, `deuteranopia`, `protanopia` and `tritanopia`
work by redefining `--primary`, `--accent` and `--ring`. Every hardcoded `amber-500` is a
place those modes do not reach.

Mapping:

| Current                  | Target                                     |
| ------------------------ | ------------------------------------------ |
| `amber-*`                | `primary` / `accent` and their foregrounds |
| `emerald-*`              | `success` and its foreground               |
| `slate-950` on media     | `on-media` / `card`                        |
| raw hex in `GardenMarks` | named decorative tokens, defined per theme |

`GardenMarks`, `CompletionScreen` and `TranquilityCompletionCard` use colour decoratively
rather than semantically. Do not force them onto `--primary`; give them named decorative
tokens so they still respond to theme and to reduced-transparency.

Verify every changed surface against F16's contrast table after migration. Re-measure; do
not assume the token substitution preserves the ratio.

## Step 2 — Radius (F13)

Map every `rounded-[…px]` onto the scale. Note `rounded-3xl` already resolves to exactly
24px, so the four `rounded-[24px]` sites are hardcoding a value the token would supply.

Where a genuinely new role exists — the pill counter, whatever Phase 16 decided — add a
named token rather than a literal. If a value maps to no role and no new role is justified,
that is a design question; record it rather than silently rounding.

## Step 3 — Spacing (F14)

`p-4.5` (18px), `p-3.5` (14px), `p-2.5` (10px), `px-1.5` (6px), `py-0.5` (2px) are off the
4px grid. They cluster in chips and badges, which suggests one missing compact-chip spacing
role rather than 40 independent mistakes. Define that role first, then migrate onto it.

## Step 4 — Enforcement

Add ESLint rules alongside the existing `azkar/no-inline-bilingual-copy` and
`azkar/no-roleless-aria-label`:

- `azkar/no-raw-palette-color` — rejects `(bg|text|border|ring|from|to|via|fill|stroke)-<palette>-<number>` in `src/app`
- `azkar/no-arbitrary-radius` — rejects `rounded-[…]` except `rounded-[var(--…)]`
- `azkar/no-offgrid-spacing` — rejects half-step spacing utilities

Each rule needs an escape hatch for genuinely justified exceptions, and every exception in
the codebase after this phase must carry a comment explaining itself.

Land the rules in the same change as the migration they enforce. A cleanup without a rule
regresses.

## Acceptance criteria

- No raw palette colour classes in `src/app` outside documented exceptions
- No raw hex in components outside named decorative tokens
- All four accessibility modes visibly affect every themed surface
- No arbitrary radius values outside token references
- Spacing is on the 4px grid, with the compact-chip role defined once
- Contrast ratios re-measured and still meeting F16's table
- The three lint rules are active and `pnpm lint` passes with `--max-warnings 0`
- No visual change beyond the intended token corrections

## Required tests and evidence

```bash
pnpm check
pnpm test:e2e
```

Evidence: every core screen captured in Light, Midnight, Dark, high-contrast and each
colour-blind mode, before and after. A re-measured contrast table. Confirmation that the
lint rules fail on a deliberately introduced violation.

## Prohibited changes

- No adjustment of the token _values_ in F16's table — this phase changes what consumes
  them, not what they are
- No restyling under cover of migration; a token swap that changes the look is a finding
- No disabling of a new lint rule to make an existing file pass — fix the file or document
  the exception
- No changes to reviewed content, copy, or evidence text

## Completion output

Use `docs/agent/templates/PHASE_REPORT.md`.
