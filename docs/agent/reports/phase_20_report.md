# Phase Report — Motion System and Structural Cleanup

## Objective

Make the motion contract real, reconcile the breakpoints and documentation, and leave the
stylesheets navigable. Findings F18–F23, F27, F28, F30, F35, F36.

## Scope completed

Steps 1–4, 5 and 7 completed. **Steps 6 and 8 deliberately not done** — see below.

## Files changed

- `src/styles/theme.css` — `favorite-pop` keyframes; entrance token; motion scale exposed to
  Tailwind; `slide-up` fixed; `scroll-area` rules removed
- 12 component files — 17 raw `duration-*` utilities moved onto tokens; 7 `transition-all`
  sites narrowed
- `src/app/components/ui/scroll-area.tsx` — removed, imported by nothing
- `vite.config.ts`, `src/styles/tailwind.css`, `docs/DESIGN_SYSTEM.md`
- `e2e/overlay-geometry.spec.ts` — CI failure fix, see below

## User-visible changes

- **The save microinteraction animates for the first time.** `@keyframes favorite-pop` did
  not exist, so the contract's "save heart pops once" did nothing in three components.
- **Entrance animations shorten** from 500ms and 400ms to 260ms on the documented enter
  easing, most noticeably on the four Progress views.
- `slide-up` now translates, which its name always implied.

## Accessibility work

Reduced motion continues to collapse every one of these — verified live, where this
environment's forced reduced-motion setting resolved the animations to 0.01ms. The 500ms
completion acknowledgement is untouched.

## Tests added or updated

No new tests. One existing test **fixed**: the mirroring assertion added in Phase 17 used
`[aria-haspopup="menu"]`.first(), which resolved to a different trigger on the mobile device
profile. It passed locally on every run, including the pre-push gate, and failed in CI with
a 1052px delta. It now pins `data-testid="library-section-filter"` and asserts the library
screen is reached first. Verified across all three Chromium projects rather than just
desktop, which is the gap that let it through.

## Commands run

| Command                                      | Result                     |
| -------------------------------------------- | -------------------------- |
| `pnpm exec playwright test overlay-geometry` | 15 passed (all 3 projects) |
| `pnpm check`                                 | see gate below             |
| `pnpm test:e2e`                              | see gate below             |

## Decisions recorded

**DEC-070**, including everything deferred and why.

## Known limitations or remaining risks

- **F27 and F28 remain unmeasured.** `requestAnimationFrame` delivers zero frames here
  because the browser pane does not composite, so neither the noise overlay's paint cost nor
  a counting-session profile can be produced. Both briefs require measurement rather than
  assumption. They need real hardware.
- **F23 is 7 of 33.** The rest need per-site verification of animated properties.
- **F35 not attempted.** A 1,400-line file move belongs in its own commit, verified by
  diffing the built CSS, not mixed with behavioural motion changes.
- **`--motion-duration-emphasis` (360ms) contradicts the contract's 440–600ms emphasis
  band.** The `duration-500`/`700` sites that belong in that band were left alone rather
  than sped up to satisfy a token that disagrees with the documentation. Someone should
  decide which is right.

## Out-of-scope findings

- `ui/scroll-area.tsx` was imported by nothing; removed with its four `[data-slot]` rules.
- The `vite.config.ts` comment claiming Tailwind "is not being actively used" was a Figma
  Make scaffold leftover; corrected.

## Recommended next step

The audit's 37 findings are closed or explicitly deferred with reasons. The remaining work
is small and independent: the `theme.css` split (F35), the `transition-all` tail (F23), and
two measurements that need a real device (F27, F28). None blocks a release.
