# Phase Report — Phase 02: Design and Accessibility Foundations

## Objective

Establish the approved global tokens and interaction foundations before
screen redesign, per `docs/agent/phases/PHASE_02_DESIGN_FOUNDATIONS.md`.

## Scope completed

Step 1 analysis (token inventory, contrast risk check, focus-ring audit,
radius/shadow/spacing drift, wide-screen shell confirmation, test-coverage
gap check) followed by an approved Step 3 implementation of the smallest
token delta identified. Full findings and rationale are in
`docs/agent/DESIGN_SYSTEM_DELTA.md`; decisions are DEC-006 through DEC-013
in `docs/agent/DECISION_LOG.md`.

Notable Step 1 finding that reshaped scope: the hybrid responsive shell
(DEC-001/DEC-004) was already substantially implemented, not a gap — so this
phase focused on token/contrast/surface-treatment debt instead.

## Files changed

- `src/styles/theme.css` — theme-aware `--success`/`--warning`/`--info` (+
  foreground pairs) per theme incl. high-contrast; `--ds-shadow-raised`/
  `--ds-shadow-overlay` tokens; `--ds-focus-offset` token; `@theme inline`
  mappings for all of the above; `.bg-card` no longer carries
  `backdrop-filter` (opaque by default); removed the orphaned
  `.word-meaning-dialog`/`.word-meaning-dialog-positioner` rule; documented
  the `--border`/`--border-subtle` and `--input`/`--border-control` aliasing.
- `src/styles/tailwind.css` — removed unused `--radius-card`/`--radius-sheet`;
  `--radius-btn` now aliases `--ds-radius-control` instead of an unmatched
  0.75rem value.
- `src/app/theme.ts` — removed the dead duplicate `T` color palette (24 of
  26 properties unused); `theme-color` meta-tag values now inlined with a
  pointer back to `theme.css`.
- `src/app/components/QuranWordMeaningSheet.tsx`,
  `src/app/components/ReaderReferenceSheet.tsx` — desktop dialog width
  `max-w-2xl` (672px) → `max-w-[var(--content-reading)]` (600px), closing a
  DEC-004 compliance gap.
- `src/app/screens/HomeScreen.tsx`, `src/app/components/TasbeehCounterButton.tsx`,
  `src/app/components/ProgressViews.tsx`, `src/app/components/RoutineGarden.tsx`
  — focus-ring color fixed from raw hex (`#fbbf24`) / raw Tailwind palette
  (`amber-500`) to the `--ring` token (7 call sites), restoring colorblind-mode
  coverage on those controls.
- `docs/DESIGN_SYSTEM.md` — documented the adopted token contracts (shadow
  tokens, `bg-card` opacity default, status-token foreground pairs).
- `docs/agent/DESIGN_SYSTEM_DELTA.md` — new; the delta doc Phase 02 itself
  requires as reading but which never existed.
- `docs/agent/DECISION_LOG.md` — DEC-006 through DEC-013 recorded.
- `src/styles/theme.tokens.test.ts` — new; static assertions guarding the
  token additions/removals against silent regression.

## Components added or modified

No new components. Modified: `QuranWordMeaningSheet`, `ReaderReferenceSheet`,
`HomeScreen`, `TasbeehCounterButton`, `ProgressViews`, `RoutineGarden` (all
class-name-level changes only, no structural/behavioral changes).

## User-visible changes

- Cards using `bg-card` (the large majority of cards app-wide) lose the
  default backdrop blur/translucency; `.glass-card`/`.wird-card` keep it as
  an explicit opt-in.
- Word-meaning and reader-reference desktop dialogs are narrower (600px vs.
  672px).
- Focus rings on the Home reminder toggle/CTA, Tasbeeh counter, and the
  Progress/Quiet Garden day-selector and period-nav controls now render in
  the theme's ring color instead of a fixed gold hex — most visible in
  colorblind-support modes, where the ring now actually changes color.
- `CategoryScreen.tsx`'s 5 `rounded-btn` buttons get a 2px larger radius
  (12px → 14px) to match the rest of the control scale.

## Accessibility work

- Fixed the most consequential conflict from the Phase 02 analysis: four
  controls' focus rings bypassed the `--ring` token entirely, so
  `data-color-blind-support` remapping (deuteranopia/protanopia/tritanopia)
  had no effect on them. Now token-driven like the rest of the app.
- `--success`/`--warning`/`--info` are now theme-aware, including a
  light-theme variant darkened for text/badge contrast (previously a single
  global pair that would have failed AA if ever used as text on light
  theme).
- `bg-card` opacity-by-default reconciles DEC-003 (opaque functional
  surfaces) with the CSS, which previously made translucency the default.

Full width/opacity normalization of the ~30-file focus-ring inconsistency is
explicitly **not** part of this phase — see Known limitations.

## Tests added or updated

- `src/styles/theme.tokens.test.ts` (new, 6 tests): per-theme status-token
  presence, absence of the old non-theme-aware pair, `@theme inline`
  mappings, shadow-token presence, `.bg-card` opacity regression guard,
  orphaned-CSS regression guard.
- No existing tests were modified.

## Commands run

| Command                                                                                                                                                  | Result                                                           |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `pnpm exec vitest run src/styles/theme.tokens.test.ts src/app/theme.test.ts`                                                                             | Pass (12/12)                                                     |
| `pnpm run check` (prettier, eslint --max-warnings 0, tsc --noEmit, audio manifest validation, full unit/coverage suite, vite build, bundle-budget check) | Pass — 196/196 unit tests; build succeeded; bundle budget passed |
| `pnpm run test:e2e` (Playwright, full cross-browser/viewport matrix)                                                                                     | Pass — 142/142                                                   |

## Visual/manual evidence

Not captured in this pass — no screenshot tooling was run beyond the
existing Playwright baseline-capture spec (which passed unchanged). Per
`docs/agent/DEFINITION_OF_DONE.md`, before/after screenshots across
Light/Dark/Midnight are still owed, particularly for the `bg-card` opacity
change (the most visually significant change in this phase) and the two
narrowed dialogs.

## Documentation updated

`docs/DESIGN_SYSTEM.md`, `docs/agent/DESIGN_SYSTEM_DELTA.md` (new),
`docs/agent/DECISION_LOG.md`.

## Decisions recorded

DEC-006 (status token scope), DEC-007 (`bg-card` opaque by default —
reconciles DEC-003), DEC-008 (shadow/elevation token set), DEC-009
(focus-ring color-token bypass fix), DEC-010 (reader/modal max-width
compliance fix), DEC-011 (remove duplicate `theme.ts` palette), DEC-012
(border-token aliasing documented, not collapsed), DEC-013 (focus-ring
width/opacity normalization — Proposed, deferred, not implemented).

## Known limitations or remaining risks

- **New light-theme `--success`/`--warning`/`--info` hex values were hand-computed
  against the WCAG luminance formula, not verified with an automated contrast
  tool.** Verify with a real tool before treating this as contrast-compliant;
  this is flagged in both `DESIGN_SYSTEM_DELTA.md` and DEC-006.
- **DEC-013 (focus-ring width/opacity normalization) is unresolved.** ~30
  files still have inconsistent `focus-visible:ring-*` width/opacity. This
  was deliberately excluded from this phase's diff as the analysis's own
  highest-blast-radius item; color-token bypasses (the accessibility-breaking
  part) are fixed, but visual consistency is not yet complete.
- **No before/after screenshots captured** for the `bg-card` opacity change
  or the two narrowed dialogs — recommend capturing before Phase 03 begins,
  since Phase 03 will touch many of the same card surfaces.
- The 131 raw Tailwind-palette color occurrences and 564 arbitrary-bracket
  values found in the Phase 02 analysis are unmigrated by design — tokens
  now exist for new code; retroactive migration is Phase 03/03B scope,
  concentrated in `ProgressViews.tsx`/`RoutineGarden.tsx` (already flagged
  for structural splitting).

## Out-of-scope findings

Carried forward from the Phase 02 analysis, unchanged:

- `ProgressViews.tsx` (905 ln) / `RoutineGarden.tsx` (781 ln) split →
  Phase 03B / Phase 08 (originally flagged in Phase 00).
- Settings sub-panel code-splitting → Phase 09 (originally flagged in
  Phase 01).
- Typography scale documentation (informal 13/15/17px one-offs) — treated
  as documentation debt, not a token gap.

## Recommended next step

Proceed to **Phase 03 — Shared Components**, per the roadmap's numerical
ordering. Before or alongside it: capture the missing before/after
screenshots for this phase's visual changes, and decide DEC-013 (focus-ring
mechanism) as its own scoped change, ideally before Phase 03 introduces more
shared interactive components that would otherwise inherit the same
inconsistency.
