# Phase Report — Home Layout Stabilization (Phase 21A)

## Objective

Stabilize the redesigned Home hero composition without removing its intentional glass treatment, restore a clear visual hierarchy, and prevent desktop card and text collisions.

## Scope completed

- Replaced the unconstrained wrapping row with a deterministic responsive grid.
- Gave the primary contextual card two-thirds of the desktop row and one contextual companion one-third.
- Removed the unreachable duplicate post-prayer companion; the existing prayer hero remains the single interactive journey.
- Moved Today's Wird to a full-width row so its three routine tiles receive usable container width.
- Preserved semantic DOM order and stacked behavior below the desktop component tier.

## Files changed

- `src/app/screens/HomeScreen.tsx`
- `src/app/components/PostPrayerJourneyCard.tsx` (removed)
- `e2e/counter-feedback.spec.ts`
- `scripts/check-type-scale.mjs`
- `docs/DESIGN_SYSTEM.md`
- `docs/agent/phases/PHASE_21_HOME_LAYOUT_REPORT.md`
- `docs/agent/phases/PHASE_21A_HOME_LAYOUT_STABILIZATION.md`

## Components added or modified

- `HomeScreen`: contextual grid composition and stable test hooks.
- `PostPrayerJourneyCard`: removed because its rendering condition was impossible and its workflow duplicated `PrayerMomentPanel`.
- `openReturningGuest`: optional settings overrides for accessibility regression states.
- Type-scale check: ignores tracked paths deleted in the current working tree.

## User-visible changes

- The Home primary action is visibly dominant on desktop.
- The contextual companion aligns to the primary card's top and bottom edges.
- Today's Wird no longer compresses into a narrow desktop column or overlaps its own labels.
- Mobile and tablet keep the existing single-column reading order.

## Accessibility work

- Kept all over-image cards on the shared `hero-glass` surface and on-media text tokens.
- Verified the opaque fallback when reduced transparency is requested.
- Verified Home contrast in Light, Midnight, Dark/OLED, high-contrast, and deuteranopia modes.
- Verified the layout with the largest app text setting, 200% zoom, 400% reflow, custom text spacing, RTL, and keyboard/touch-target checks.
- Automated checks supplement rather than replace manual screen-reader and physical-device review.

## Tests added or updated

- Added a desktop Home regression that checks:
  - the 2:1 contextual row geometry;
  - equal visible card height;
  - the visible glass surface filling the primary layout slot;
  - Today's Wird occupying its own row;
  - non-overlapping Arabic routine tiles with large text;
  - absence of horizontal overflow.
- Extended the shared Home test setup to seed accessibility settings without duplicating setup code.

## Commands run

| Command                                                                                                                     | Result                                     |
| --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `pnpm typecheck`                                                                                                            | PASS                                       |
| `pnpm lint`                                                                                                                 | PASS                                       |
| Focused Home contrast, text-resize, reflow, and text-spacing Playwright checks                                              | PASS — 9 tests                             |
| `pnpm check`                                                                                                                | PASS — all repository checks               |
| `pnpm test:e2e`                                                                                                             | PASS — 357 passed, 1 skipped, 3 retry-pass |
| `pnpm exec playwright test e2e/counter-feedback.spec.ts e2e/home-prayer-moment.spec.ts e2e/reduce-transparency.spec.ts ...` | PASS — 14 tests after duplicate removal    |
| Desktop Home visible-surface geometry regression                                                                            | PASS                                       |
| Arabic Midnight Home evidence capture                                                                                       | PASS — refreshed local visual evidence     |

## Visual/manual evidence

- Inspected the refreshed 1280×900 Arabic Midnight Home capture at `test-results/evidence-capture-home-in-Arabic-midnight-desktop-chromium/desktop-home-ar-midnight.png`.
- The capture confirms the visible primary glass surface fills the two-column area, the companion aligns beside it, and Today's Wird occupies the next full row.

## Documentation updated

- Updated the Home responsive-layout contract in `docs/DESIGN_SYSTEM.md` to record the 2:1 contextual row, single-companion rule, and full-width Wird row.

## Decisions recorded

- Glass remains an intentional Home material.
- Daily evidence is the only context companion; the prayer hero owns the post-prayer journey.
- Component width is tested at the visible surface, not only at an invisible grid wrapper.

## Known limitations or remaining risks

- Automated contrast and accessibility checks cannot certify screen-reader output or glass readability against every possible display and ambient-light condition; those remain manual release checks.
- The prayer hero's existing journey remains the canonical localized and interactive implementation.

## Out-of-scope findings

- The removed duplicate was unreachable because `getLeadingPrayerMoment` only returns phases already handled by the prayer hero.
- The final full browser run had three unrelated setup/viewport timeouts under severe local contention; each passed on its configured retry, while all changed Home and prayer tests passed first attempt.

## Recommended next step

Continue with the next Home improvement phase: reduce secondary-section density and make continuation points easier to scan without duplicating actions.
