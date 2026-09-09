# Phase Report — Home Final Stabilization (Phase 21D)

## Objective completed

Restore the large-screen navigation, make Home use available desktop space without overflow, and apply one accessible glass treatment to every top-level Home card.

## Files changed

- `src/app/screens/HomeScreen.tsx`
- `src/app/components/TimeOfDayBackground.tsx`
- `src/app/components/PrayerTrackerCards.tsx`
- `src/app/components/HomeCards.tsx`
- `src/app/components/QuranHomeCard.tsx`
- `src/app/components/TasbeehCounterButton.tsx`
- `src/app/components/AzkarHeroBackground.test.tsx`
- `src/app/components/HomeCards.test.tsx`
- `src/app/components/QuranHomeCard.test.tsx`
- `src/styles/theme/layout.css`
- `e2e/counter-feedback.spec.ts`
- `docs/DESIGN_SYSTEM.md`
- `docs/agent/DECISION_LOG.md`
- `public/release-notes.json`

## Components added or modified

- `TimeOfDayBackground`: contained the scene inside Home instead of the browser viewport.
- `HomeScreen`: adopted the dashboard measure and an equal two-track desktop context grid.
- `PrayerTrackerCards`: added a summary-only fluid five-column desktop mode while preserving the full Progress tracker carousel contract.
- `SavedZikrCard`, `FridayHomeCard`, `QuranHomeCard`, and `TasbeehCounterButton`: added explicit Home glass opt-ins.
- `hero-glass`: gained the `home-glass-surface` token companion for existing card anatomy.

## User-visible behavior changed

- The labeled sidebar remains visible at large desktop widths.
- The primary and evidence cards each receive half of the usable row after the single gap.
- Five prayer summaries fit without a desktop horizontal scrollbar; phone and tablet retain a discoverable snap carousel.
- Prayer, context, Wird, Masbaha, Quran, Saved, Benefits, and Friday cards share one glass material.
- Home can use up to the shared 90rem dashboard measure instead of stopping at 64rem.

## Accessibility work completed

- Existing semantic and keyboard order remains unchanged in RTL and LTR.
- Functional glass remaps existing card text, muted text, borders, and nested surfaces to on-media tokens.
- The shared opaque reduced-transparency fallback applies to every Home glass surface.
- Automated Home WCAG A/AA, contrast, forced-colors, focus, text-resize, and touch-target checks passed.

## Tests added or updated

- Added exact 1885×982 coverage for sidebar visibility and non-intersecting scene/main geometry.
- Added 50/50 contextual-track and desktop prayer-overflow assertions.
- Added an inventory assertion covering every top-level Home glass surface.
- Added component tests for contained image positioning and Home glass opt-ins.

## Commands run and exact results

| Command                                | Result                               |
| -------------------------------------- | ------------------------------------ |
| Focused Vitest                         | PASS — 22 tests                      |
| Focused Playwright layout/transparency | PASS — 24 tests                      |
| Focused prayer/Home regression         | PASS — 12 tests                      |
| `pnpm install --frozen-lockfile`       | PASS — already up to date            |
| `pnpm check`                           | PASS — all repository checks         |
| `pnpm test:e2e`                        | PASS — 363 passed, 1 skipped         |
| `pnpm build:pages`                     | PASS — Pages build and bundle checks |
| `pnpm run check:release-notes`         | PASS                                 |

## Screenshots/evidence produced

- `docs/agent/evidence/phase-21d/desktop-home-ar-midnight.png` — 1885×982
- `docs/agent/evidence/phase-21d/tablet-home-ar-midnight.png` — 834×900
- `docs/agent/evidence/phase-21d/mobile-home-ar-midnight.png` — 390×844

## Remaining risks or known limitations

- Automated checks do not replace a physical Android/iOS device or NVDA/VoiceOver review.
- Browser zoom can intentionally move the shell into a narrower responsive tier; exactly one navigation variant remains available at every tier.

## Documentation updated

- `docs/DESIGN_SYSTEM.md` records the scene containment, equal-width calculation, dashboard measure, prayer-summary breakpoints, and Home glass contract.
- DEC-162 records the final approved Home stabilization decisions and evidence.

## Recommended next phase

Treat the newly requested Quran/Mushaf and Surah Al-Kahf audio work as a separate focused phase so its performance, content-source, audio, and reader contracts receive independent evidence.
