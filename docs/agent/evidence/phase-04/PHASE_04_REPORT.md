# Phase 04 — Responsive shell and navigation

## Summary

The Phase 04 analysis expected a build-out and found one instead already largely in place: the DEC-001 hybrid shell, typed `View` state, real History API usage, the four-tier CSS grid, three navigation variants, `aria-current` throughout, the settings two-pane and a DEC-004-compliant reader column were all working. The phase therefore became a **defect-fix pass**, not new construction.

Three of the defects were real bugs rather than polish.

## Defects fixed

| #   | Defect                                                                                                                                                                                                     | Why it mattered                                                                                                                                                                          |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `BottomNav`'s active state was colour-only — icon and label differed only in hue, both `font-semibold`, and the sole non-colour cue was a 220 ms entrance animation that `prefers-reduced-motion` disables | Failed an explicit Phase 04 acceptance criterion _and_ WCAG "use of colour", on the navigation variant most users see                                                                    |
| 2   | **No navigation rendered at all** at ≥900 px wide × <500 px tall                                                                                                                                           | The rail's media query carried `and (min-height: 31.25rem)`; `useLayoutMode` is width-only. JS chose `expanded` and dropped `BottomNav` while CSS hid the rail                           |
| 3   | Focus never moved on view change                                                                                                                                                                           | `useScreenFocus` guarded on a per-instance `isFirstMount` ref, but screens are lazily mounted fresh on every navigation, so the guard was always true and the hook always returned early |
| 4   | Two `main` landmarks                                                                                                                                                                                       | `App.tsx` rendered `#main-content`; `ScreenContainer` nested another inside it                                                                                                           |
| 5   | Rail and sidebar both announced as "Bottom Navigation"                                                                                                                                                     | Misleading accessible name on two of three variants                                                                                                                                      |
| 6   | Rail/sidebar rendered during splash, onboarding and auth                                                                                                                                                   | Only `BottomNav` respected the view whitelist                                                                                                                                            |
| 7   | Sidebar theme toggle was binary dark↔light in a three-theme app                                                                                                                                            | Stranded Midnight users in Light with no way back                                                                                                                                        |
| 8   | `window.history.length > 1` back-guard                                                                                                                                                                     | Counted the whole tab session, so arriving from another site made Back navigate _out of the app_                                                                                         |
| 9   | 431–599 px rendered a letterboxed 390 px phone card                                                                                                                                                        | Belonged to no documented tier                                                                                                                                                           |
| 10  | `NetworkStatus`/`SyncStatus` were unplaced grid children                                                                                                                                                   | Auto-placed into an implicit row _inside the rail column_ on the expanded and large tiers                                                                                                |
| 11  | Dead CSS: `.active-sidebar-link` referenced but never defined; `.app-context` + `data-context-open` defined but never set anywhere in `src/`                                                               | Misleading surface area                                                                                                                                                                  |

## Decisions

Recorded as **DEC-027**. Three points were the user's call:

- Keep the sidebar quick-controls (rather than remove them per Step 3 item 4) and fix the theme toggle to cycle midnight → dark → light.
- Extend full-bleed to 599 px, aligning CSS with `useLayoutMode`'s own compact boundary, rather than teaching the hook a height term.
- Scope the history fix narrowly; the mixed `push`/`replaceState`/bare-`setView` pattern across onboarding is recorded but untouched.

## Notable course corrections

- **`screenName` was not simply "missing" on six screens.** Passing it revealed that `ScreenContainer` rendered an sr-only live region with the same text as each screen's visible `Header` title — a duplicate announcement, and with Phase 04's `useViewFocus` now moving focus on every view change, a third redundancy. The live region was removed; `screenName` was kept for `document.title`, which genuinely was missing on those screens.
- **Renaming the nav labels broke three shared e2e helpers** that waited on `getByRole("navigation", { name: "Bottom Navigation" })`. On desktop those had been resolving against the _sidebar_. Helpers are now tier-agnostic. Same drift class as DEC-022; it failed loudly rather than silently.

## Verification

- Full `pnpm check` and `pnpm test:e2e` green: **249 unit, 172 e2e**.
- Eight new e2e tests: tier matrix across 320/599/600/899/900/1199/1200 px, the short-landscape dead-zone regression, the 431–599 px band, onboarding nav suppression, `aria-current` + non-colour cue, single-`main` + focus-on-navigation, and the status-banner grid area.
- New `useLayoutMode.test.ts` covering every tier boundary, width-only behaviour, `matchMedia` subscribe/unsubscribe, and the no-`matchMedia` fallback.
- Two fixes were verified by **deliberately reverting them and confirming the new test fails**: the dead-zone media query, and the status-banner grid area. A third (the `useLayoutMode` boundary suite) was verified by introducing an off-by-one at 900 px.

## Documentation corrected

`DESIGN_SYSTEM.md` claimed 500 px/1200 px breakpoints and described a navigation drawer that does not exist; replaced with a tier table matching the implementation. `ARCHITECTURE.md` gained the adaptive-shell section it never had.

## Known limitations

- **No before/after screenshots.** This is the largest evidence gap and is shared with Phases 02, 03 and 05.
- The onboarding navigation pattern (mixed `push`/`replaceState`/bare `setView`) remains inconsistent by explicit decision.
- `ProgressViews.tsx` and `RoutineGarden.tsx` remain unsplit; still scheduled for Phase 08.
