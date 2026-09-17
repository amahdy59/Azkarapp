# Phase Report — Token Discipline

## Objective

Bring colour, radius and spacing back onto the documented scales, and add the lint rules
that keep them there. Findings F13, F14 and F17.

## Scope completed

All four steps, with F14 closed by amending the contract rather than the code — see below.

## Files changed

- 17 component and screen files — 252 palette usages migrated
- `src/app/screens/ReaderScreen.tsx` — 32 hex literals removed with the inline category switch
- `src/app/components/GardenMarks.tsx`, `TranquilityCompletionCard.tsx`, `CompletionScreen.tsx`
- `src/styles/theme.css` — new tokens; category accents; `.app-shell` radius
- `scripts/eslint-rules.mjs` + `scripts/eslint-rules.test.mjs` — two new rules, 17 tests
- `eslint.config.js`, `docs/DESIGN_SYSTEM.md`

## User-visible changes

None intended. Every mapping preserves the rendered colour in the default themes; what
changes is that the accessibility modes now reach them.

## Accessibility work

This is the substance of the phase. `high-contrast`, `deuteranopia`, `protanopia` and
`tritanopia` work by redefining `--primary`, `--accent` and `--ring`, so every hardcoded
`amber-500` was a place those modes could not reach. Measured on an element that was
`bg-amber-500`:

```
default        rgb(212,160,32)
protanopia     rgb(43,127,255)
high-contrast  rgb(255,215,94)
```

Contrast re-measured against the card in all three themes, floor 4.77:

```
primary 6.24-7.55  success 7.01-8.63  info 6.44-7.10
warning 4.77-5.92  sleep 5.23-7.10    evening 5.18-7.92
```

## Tests added or updated

`scripts/eslint-rules.test.mjs` — 17 tests over both rule patterns, including that a token
whose name contains a palette word (`bg-sleep`) is not flagged, and that
`rounded-[var(--token)]` and `rounded-[inherit]` are allowed.

## Commands run

| Command         | Result                          |
| --------------- | ------------------------------- |
| `pnpm check`    | Pass (exit 0)                   |
| `pnpm test:e2e` | 426 passed, 0 failed, 4 skipped |

## Decisions recorded

**DEC-069**, including the F14 contract amendment.

## Known limitations or remaining risks

- **F14 was closed by changing the contract, not the code.** The 175 half-step spacings are
  coherent and deliberate; rewriting them risked the 320px overflow guarantee and the 44px
  target rule for differences of 2px. `DESIGN_SYSTEM.md` now documents a compact sub-scale
  for spacing inside a component. If that reading is wrong, the fix is to migrate the
  spacings and revert the doc — the reasoning is recorded so the choice is reviewable.
- **The Reader's category accents still override `--primary`**, so a colour-blind user
  reading a collection sees that collection's accent rather than their mode's palette.
  Moving them into CSS makes that fixable in one place; it was not changed here because it
  is a design decision, not a migration.

## Out-of-scope findings

- The migration regex omitted the `accent` utility, leaving one `accent-amber-500`. The new
  lint rule caught it immediately — which is the argument for the rule.
- A first attempt at the collapse regex backreferenced the wrong capture group and produced
  41 malformed classes such as `text-primary-primary`. Caught by inspecting the diff,
  reverted from a backup, and redone. Nothing malformed reached a commit.
- `theme.tokens.test.ts` anchors on the literal `:root {\n  --sleep`, so a comment inserted
  above that declaration broke it. The block now carries a note explaining the constraint.

## Recommended next step

Phase 20 (Motion System and Structural Cleanup) — the last phase.
