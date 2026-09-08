# Phase Report — Home Secondary Density (Phase 21B)

## Objective completed

Reduce Home's secondary-section density and make prayer continuation points easier to scan without duplicating recording actions.

## Files changed

- `src/app/components/PrayerTrackerCards.tsx`
- `src/app/components/PrayerTrackerCards.test.tsx`
- `src/app/screens/HomeScreen.tsx`
- `src/app/utils/viewTransitions.test.ts`
- `e2e/counter-feedback.spec.ts`
- `docs/DESIGN_SYSTEM.md`
- `docs/agent/phases/PHASE_21A_HOME_LAYOUT_STABILIZATION.md`
- `docs/agent/phases/PHASE_21B_HOME_DENSITY.md`
- `public/release-notes.json`

## Components added or modified

- `PrayerTrackerCards`: added a summary-only presentation while retaining the existing full variant.
- `HomeScreen`: uses the summary variant; Progress continues to use the full tracker.

## User-visible behavior changed

- Home now shows each prayer's identity, time, temporal state, and route to its focused screen without repeating fifteen tracking controls.
- Prayer, sunnah, and adhkar recording remain available in the prayer and daily Progress views.
- All five prayers remain visible in the same semantic order and keep their existing responsive carousel/grid behavior.

## Accessibility work completed

- Every summary card remains a natively keyboard-operable button with a prayer-specific accessible name.
- State remains visible as text rather than color alone.
- The focused Progress tracker retains native checkboxes, 44px targets, labels, and prayer-scoped fieldsets.
- Axe, forced-colors, reduced-motion, RTL, text resizing, narrow-layout, and touch-target checks remain green.

## Tests added or updated

- Added a component test proving summary cards remain navigable and contain no duplicate checkboxes.
- Extended the desktop Home regression to require five summary cards and zero tracking checkboxes.
- Re-ran the full Progress prayer-recording suite to verify the detailed controls remain unchanged.

## Commands run and exact results

| Command                                                                     | Result                                       |
| --------------------------------------------------------------------------- | -------------------------------------------- |
| Focused Vitest (`PrayerTrackerCards`, `HomeScreen`)                         | PASS — 12 tests                              |
| Focused Playwright (`counter-feedback`, `prayer-tracking`, `accessibility`) | PASS — 26 tests                              |
| `pnpm install --frozen-lockfile`                                            | PASS — lockfile already current              |
| `pnpm check`                                                                | PASS — all repository checks                 |
| `pnpm test:e2e`                                                             | PASS — 359 passed, 1 skipped, 1 retry-pass   |
| `pnpm build:pages`                                                          | PASS — bundle and CSS utility budgets passed |
| `pnpm run check:release-notes`                                              | PASS                                         |

## Screenshots and evidence produced

- Refreshed the automated Arabic Midnight Home, responsive core-screen, and theme captures in `test-results/`.
- Browser geometry verifies five `data-density="summary"` prayer cards and no Home prayer checkboxes.

## Remaining risks or known limitations

- Automated accessibility checks do not replace NVDA, VoiceOver, TalkBack, physical touch-device, or ambient-light glass review.
- One unrelated full-surah reader test exceeded its first 90-second limit under local load and passed on the configured retry.
- The first push attempt exposed an order-dependent shared-test leak: a view-transition suite restored `window.matchMedia` as read-only. The helper now preserves writability; product code was unaffected.

## Documentation updated

- `docs/DESIGN_SYSTEM.md` now separates Home's prayer-summary anatomy from the full recording anatomy in focused views.

## Recommended next phase

Complete the remaining manual assistive-technology and physical-device evidence. Run a performance trace when the Chrome DevTools tracing service is available.
