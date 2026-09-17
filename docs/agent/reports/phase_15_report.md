# Phase Report — CSS Delivery Repair

## Objective

Restore the design-system primitives to the compiled stylesheet, repair the user-visible
overlay defects that followed from their absence, and add the regression coverage that
would have caught them. Findings F01–F05 and F32 from
`docs/audits/DESIGN_CONSISTENCY_AUDIT.md`.

## Scope completed

All four steps of `docs/agent/phases/PHASE_15_CSS_DELIVERY_REPAIR.md`. No scope was
deferred.

## Files changed

- `src/styles/tailwind.css` — removed the `@source not` exclusion and its inert re-include
- `src/styles/theme.css` — removed the two compensating dropdown-item rules
- `scripts/check-css-utilities.mjs` — new build assertion
- `scripts/check-css-utilities.test.mjs` — new unit tests for it
- `scripts/check-bundle-budget.mjs` — CSS limits raised per DEC-065
- `package.json` — canary wired into `check` and `build:pages`
- `e2e/overlay-geometry.spec.ts` — new geometry regression spec
- `docs/agent/evidence/phase-15/CSS_DELIVERY_EVIDENCE.md` — measurements

## Components added or modified

No component source changed. Every repair came from making the existing class lists in
`src/app/components/ui/*` actually compile.

## User-visible changes

All re-measured in the running application:

- **Destructive-action confirm dialog.** Was rendering at the shell's top-left at full
  width behind a fully transparent scrim. Now centres exactly (offset dx 0, dy 0), honours
  `max-w-[calc(100%-2rem)]` at 320px, and its scrim dims the background.
- **Modal and drawer scrims** render instead of being transparent. This affects
  `ResponsiveSheet`'s compact drawer path, which renders `ui/drawer`'s overlay.
- **Menu items** regain radius (0px → 8px), indicator gutter, minimum width (auto → 128px),
  the Radix available-height clamp (`none` → clamped, so long menus scroll internally
  instead of overflowing), and a transform-origin at the trigger rather than the element
  centre.
- **Menu open/close animations** now run at all. `data-[state=open]:animate-in`,
  `zoom-in-95`, `fade-in-0` and all four `slide-in-from-*` were also never compiling —
  this was not in the original audit and was found during the built-CSS diff.
- **OTP field** in the auth flow regains its slot separators, field background and caret.

## Accessibility work

The dialog and scrim repairs are accessibility fixes that automated scanning cannot see:
axe reports no violations on these surfaces in either the broken or the repaired state,
because roles, labels and contrast were always correct and only geometry was wrong. This
is the concrete instance of F32, and `e2e/overlay-geometry.spec.ts` closes it.

Menu item target size was verified at 44px after the change; the pre-fix 44px came from a
call site's own padding rather than the primitive, so items in menus without that override
were relying on nothing. Radio-item indicator placement was verified at 32px gutter and
8px inset in both LTR and RTL after the `theme.css` workaround removal.

## Tests added or updated

- `scripts/check-css-utilities.test.mjs` — 6 tests covering merged rules, pseudo-class
  suffixes, prefix collisions and CSS-escaped selectors
- `e2e/overlay-geometry.spec.ts` — 3 tests: dialog centring and scrim alpha, menu viewport
  bounds and item geometry at 320px, RTL indicator gutter

The build assertion was verified to fail by deliberately reintroducing the exclusion, then
reverted.

## Commands run

| Command                                | Result                                 |
| -------------------------------------- | -------------------------------------- |
| `pnpm install --frozen-lockfile`       | Pass — required first, see limitations |
| `pnpm check`                           | Pass (exit 0), bundle budget passed    |
| `pnpm test:e2e`                        | 420 passed, 0 failed, 4 skipped (9.5m) |
| `pnpm exec vitest run`                 | 450 passed across 91 files             |
| `node scripts/check-css-utilities.mjs` | Pass; fails on reintroduced exclusion  |

Base commit `54b2b14` was run under identical idle conditions as a control: 411 passed, 0
failed (9.1m). The branch's 420 is that 411 plus the 9 new tests.

## Visual/manual evidence

`docs/agent/evidence/phase-15/CSS_DELIVERY_EVIDENCE.md` records the built-CSS diff (126
selectors added, 0 removed), before/after computed values for every repaired surface, the
LTR/RTL equivalence check for the removed workaround, and the discarded-failure
investigation.

Screenshots were not captured: the browser pane available in this session does not
composite frames, so `computer{action:"screenshot"}` times out. Computed-geometry
measurements were recorded in their place, and they are what the new Playwright assertions
check. Screenshot evidence remains outstanding.

## Documentation updated

- `docs/audits/DESIGN_CONSISTENCY_AUDIT.md` — F15 marked resolved by DEC-065
- `docs/agent/phases/PHASE_16_ELEVATION_AND_SURFACES.md` — blocking decision resolved
- `docs/agent/INDEX.md` — phases 14–20 added to the table
- `DECISION_LOG.md` — DEC-064 (program), DEC-065 (budget and counter radius)

## Decisions recorded

- **DEC-064** — the audit and the Phase 15–20 program
- **DEC-065** — CSS budget raised to 150 kB / 26 kB; counter radius resolved in favour of
  the document (24px everywhere), unblocking Phase 16

## Known limitations or remaining risks

- **No screenshot evidence.** See above. The phase brief asked for before/after captures;
  computed-geometry measurements were substituted.
- **The e2e suite is sensitive to local load.** Two intermediate runs failed three tests
  each, with different specs each time, all with the application failing to mount rather
  than an assertion failing. Both specs passed in isolation, and both the branch and the
  base commit pass clean when nothing else is running. This is a pre-existing property of
  the suite worth addressing separately — it is the same class of problem Phase 14 fixed
  for `reader-microinteractions` in CI.
- **The CSS budget increase is real.** 140.55 kB raw against a 150 kB limit leaves less
  headroom than before. Phase 18 and Phase 20 both remove CSS and should recover some.
- **The OTP field was verified only by the utilities now compiling**, not by an
  interactive pass through the auth flow, which needs a live Supabase session. It has no
  e2e coverage.

## Out-of-scope findings

- The menu open/close animations were never compiling either — a fifth consequence of F01,
  not recorded in the original audit. Repaired here because the same one-line fix covers
  it; noted so the audit stays accurate.
- `scroll-area.tsx` is imported by nothing (F36). Removing it was measured as a possible
  budget offset and recovers only 0.47 kB. Left for Phase 20.
- The local `node_modules` was installed by pnpm 9.15.0 against a `packageManager` pin of
  11.19.0, so `pnpm test:e2e` could not start its web server at all. Fixed by
  `pnpm install --frozen-lockfile`. Unrelated to this phase, but it means the e2e gate was
  not runnable in this working copy beforehand.

## Recommended next step

Phase 16 (Elevation and Surface Integrity), now unblocked by DEC-065. It is the natural
follow-on: F11 and F12 are both small, self-contained, and immediately visible, and F12
removes a duplicate rule that this phase's built-CSS diff confirmed is still live.

Phase 18 (Build Weight) is independent of everything else and could run in parallel — it
is the largest user-facing performance win in the program, at roughly 24 MB per deployment.
