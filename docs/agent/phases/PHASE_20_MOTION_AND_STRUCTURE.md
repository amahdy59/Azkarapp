# Phase 20 — Motion System and Structural Cleanup

## Objective

Make the motion contract real — one timing scale, one easing set, no dead animations — and
leave the stylesheets in a state where the next person can find things.

## Scope

`src/styles/theme.css`, `src/styles/animations/ZikrAnimations.css`,
`src/app/components/ZikrComponents.css`, the `transition-all` call sites, and the
documentation files carrying drift.

## Findings addressed

F18, F19, F20, F21, F23, F28, F30, F35, F36 — see
`docs/audits/DESIGN_CONSISTENCY_AUDIT.md`.

## Depends on

Phase 16, which de-duplicates the counter and ripple rules this phase then tunes.

## Required reading

- `docs/audits/DESIGN_CONSISTENCY_AUDIT.md`
- `docs/DESIGN_SYSTEM.md` — motion and microinteraction contract, timing table, screen audit
- `docs/MOTION_SYSTEM.md`
- `src/app/motionPreferences.ts` and the `.reduce-motion` rules

## Step 1 — The missing microinteraction (F18)

The contract requires "save heart pops once." No `@keyframes favorite-pop` and no
`.favorite-pop` rule exist, so the class applied in `ReaderScreen` (twice),
`ReaderReferenceSheet` and — via `.element-pop` — `ThemeModeSelector` does nothing.

Define it once, at the timing table's "small state change" band (160–220ms), restrained
scale only. Both class names should resolve to the same animation. Confirm it collapses
under `.reduce-motion` and `prefers-reduced-motion`.

## Step 2 — Wire the motion tokens (F19)

`--motion-duration-press/fast/standard/emphasis` and the three easing tokens exist but are
not exposed to Tailwind, so components use raw `duration-*` utilities and CSS files use 18
distinct hardcoded durations.

Add `--transition-duration-*` and `--ease-*` entries to the `@theme inline` block so
`duration-standard` and `ease-enter` become real utilities, then migrate both the utilities
and the CSS literals onto them.

Every remaining literal duration after this step must have a reason.

## Step 3 — Timing corrections (F20, F21)

- `.fade-in` (500ms) and `.slide-up` (400ms) exceed the documented 240–300ms entrance band
  and use the wrong easing. Bring both to the standard entrance timing and
  `cubic-bezier(0.22, 1, 0.36, 1)`. `.fade-in` is on all four Progress views, so this is the
  most-felt change in the phase.
- `.slide-up` animates opacity only. Either give it the translate its name promises, or
  delete it and use `.fade-in`.
- The 500ms completion acknowledgement is semantic and stays exactly as it is, including
  under reduced motion.

## Step 4 — Property discipline (F23)

Replace `transition-all` across 19 files with explicit property lists. `.interactive-elem`
and `SelectTrigger` already do this correctly — follow that pattern.

## Step 5 — Breakpoint reconciliation (F30)

The scrollbar treatment, `.app-shell`'s desktop border, the Home grid and the counter size
steps key off 768px and 1024px, outside the documented four tiers. Move them to tier
boundaries, or document 768/1024 as deliberate sub-steps with a stated reason in
`DESIGN_SYSTEM.md`. The responsive-shell table is precise enough elsewhere that these read
as drift.

`useLayoutMode` and the CSS queries must continue to agree, per the existing contract note.

## Step 6 — Split `theme.css` (F35)

1,296 lines holding tokens, accessibility modes, the Tailwind bridge, base resets,
component classes, nine keyframe sets, scrollbars, the shell grid, navigation, glass cards
and the noise overlay. Split along those seams: `tokens.css`, `base.css`, `shell.css`,
`navigation.css`, `motion.css`.

Pure file moves, no value changes. Verify by diffing the built CSS before and after — it
should be identical modulo rule ordering, and any ordering change must be shown not to
alter the cascade.

## Step 7 — Documentation and leftovers (F36)

- `DESIGN_SYSTEM.md` says three elevation levels; the `theme.css` token comment says two.
  Reconcile with whatever Phase 16 established.
- Remove the Figma Make scaffold comment in `vite.config.ts` claiming Tailwind is not
  actively used.
- `scroll-area` is in the `@source` allow-list but imported by nothing — remove the
  component or the entry.

## Step 8 — Performance, measured (F28)

No `React.memo` exists in `src/app/components`, and the counter path re-renders through
`App.tsx` (1,433 lines), `ReaderScreen.tsx` (1,078) and `ProgressViews.tsx` (1,212).

**Profile a counting session before changing anything.** Memoise only what the profile
shows, and record before/after measurements. Speculative memoisation adds complexity and
bug surface for no benefit; if the profile is clean, say so and change nothing.

## Acceptance criteria

- The save microinteraction animates, and collapses under reduced motion
- Motion tokens are consumable as Tailwind utilities and are what components use
- Entrance animations are within the documented band with the documented easing
- No `transition-all` outside a documented exception
- No dead or duplicate keyframes
- Breakpoints match the documented tiers or the tiers document the exceptions
- `theme.css` is split with a verified-identical built CSS
- Documentation drift and scaffolding leftovers removed
- Any memoisation is backed by a recorded profile

## Required tests and evidence

```bash
pnpm check
pnpm test:e2e
```

Evidence: the built-CSS diff proving the split changed nothing; a reduced-motion pass
across Reader, Home, Progress and Settings; the counter-session profile before and after.

## Prohibited changes

- No change to the 500ms completion acknowledgement
- No new looping, autoplaying, flashing or parallax motion — the contract prohibits it
- No motion added to a surface the screen audit does not list
- No memoisation without a profile
- No behaviour change during the `theme.css` split

## Completion output

Use `docs/agent/templates/PHASE_REPORT.md`.
