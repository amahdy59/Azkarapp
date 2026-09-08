# Phase Report — Prayer Context and Home Glass (Phase 21C)

## Objective

Keep the five daily prayers continuously available on Home, make the current-prayer journey timely rather than persistent, restore the time-of-day photograph, and refine glass, focus, and RTL behavior without changing devotional content.

## Scope completed

- Moved the existing five-prayer summary above Home's changing contextual row.
- Limited the contextual prayer to the existing approach period and thirty minutes after the adhan.
- Added a five-minute confirmation grace after recording congregation before the routine reclaims the space.
- Consolidated the prayer hero, virtue, journey, and action into one glass surface with hairline sections.
- Restored the time-of-day image to Home's visible stacking context.
- Replaced the invisible full-row checkbox outline with a circular keyboard focus indicator.
- Placed journey copy at logical start and check indicators at logical end in both reading directions.

## Files changed

- `src/app/screens/HomeScreen.tsx`
- `src/app/prayerMoment.ts`
- `src/app/prayerMoment.test.ts`
- `src/app/components/PrayerMomentPanel.tsx`
- `src/app/components/PrayerTrackerCards.tsx`
- `src/app/components/TimeOfDayBackground.tsx`
- `src/app/components/AzkarHeroBackground.test.tsx`
- `src/styles/theme/surfaces.css`
- `e2e/home-prayer-moment.spec.ts`
- `e2e/manual-checklist.spec.ts`
- `docs/DESIGN_SYSTEM.md`
- `docs/agent/DECISION_LOG.md`
- `public/release-notes.json`

## Components added or modified

- `HomeScreen`: stable prayer-summary layer, visible image stacking context, and single prayer-glass owner.
- `PrayerMomentPanel`: sectioned glass anatomy and direction-safe journey rows.
- `PrayerTrackerCards`: on-media countdown color and circular composite focus support.
- `TimeOfDayBackground`: visible `z-0` scene layer inside the isolated Home screen.
- `getLeadingPrayerMoment`: thirty-minute hard window and five-minute recorded grace.

## User-visible changes

- All five prayers remain visible at the top of Home regardless of the current contextual recommendation.
- The current-prayer journey yields to the timely zikr after five minutes when recorded, or thirty minutes after the adhan when left unrecorded.
- The Home photograph is visible below and between cards again.
- Prayer details read as one calm glass card instead of several nested glass boxes.
- Selecting a prayer step no longer paints a large rectangular outline.

## Accessibility work

- Native checkbox semantics and full-row 44px+ hit areas remain intact.
- Keyboard focus is visible on the corresponding circular indicator; pointer focus does not create the reported rectangle.
- Arabic journey rows keep copy at logical start and state at logical end.
- Light, Midnight, Dark/OLED, high-contrast, and deuteranopia contrast checks pass.
- Reduced transparency switches glass to an opaque surface without animating through a translucent intermediate state.
- Automated axe, forced-colors, text-resize, text-spacing, narrow-screen, touch-target, and keyboard checks pass.

## Tests added or updated

- Added pure boundary coverage for recorded grace and the thirty-minute prayer window.
- Added Home coverage for stable prayer order, one glass owner, timed dismissal, circular focus, and RTL geometry.
- Added a regression assertion that the time-of-day scene cannot return to the hidden negative stacking layer.
- Updated the keyboard checklist to inspect a composite control's visible focus target.

## Commands run

| Command                                                          | Result                                    |
| ---------------------------------------------------------------- | ----------------------------------------- |
| Focused Vitest (`prayerMoment`, `AzkarHeroBackground`)           | PASS — 22 tests                           |
| Focused Vitest (`PrayerTrackerCards`)                            | PASS — 6 tests                            |
| Focused Playwright (`home-prayer-moment`, `reduce-transparency`) | PASS — 9 tests                            |
| Focused light-theme contrast analyzer                            | PASS — 1 test                             |
| Focused keyboard walk                                            | PASS — 1 test                             |
| `pnpm install --frozen-lockfile`                                 | PASS — lockfile already current           |
| `pnpm check`                                                     | PASS — all repository checks              |
| `pnpm test:e2e`                                                  | PASS — 362 passed, 1 skipped              |
| `pnpm build:pages`                                               | PASS — Pages build and both bundle checks |
| `pnpm run check:release-notes`                                   | PASS                                      |

## Visual/manual evidence

- `docs/agent/evidence/phase-21c/desktop-home-ar-midnight.png`
- `docs/agent/evidence/phase-21c/mobile-home-ar-midnight.png`
- Visual inspection confirms the restored photograph, stable prayer strip, single prayer surface, RTL trailing indicators, and responsive carousel behavior.

## Documentation updated

- The design system now defines stable prayer navigation, bounded contextual timing, functional glass safeguards, and the Home/focused-prayer scene distinction.
- DEC-161 records the user-approved override of DEC-160's removed strip and the new timing, glass, focus, RTL, and image contracts.

## Decisions recorded

- Keep the five prayer items continuously available.
- Use automatic contextual collapse rather than adding another expand/collapse control; every summary card remains the explicit route to full prayer detail.
- Preserve the intentional hero glass with one surface owner and an opaque reduced-transparency fallback.

## Known limitations or remaining risks

- Automated checks do not replace NVDA, VoiceOver, TalkBack, physical touch-device, or changing ambient-light review.
- Legacy records without a timestamp do not reopen a stale contextual prayer card; they remain available in prayer history and focused views.

## Out-of-scope findings

- No devotional text, prayer calculation method, synchronization contract, or persistence shape was changed.

## Recommended next step

Complete manual assistive-technology and physical-device validation as release evidence; no further Home restructuring is required for this request.
