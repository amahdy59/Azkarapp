# Phase Report — Qibla responsive relevance

## Objective

Keep every Qibla control and explanation reachable on short mobile screens, and make the existing bearing practically useful on desktop without adding maps, services, or a second calculation.

## Scope completed

- Made the Qibla screen the vertical scroll owner inside the fixed application shell.
- Preserved the fixed compact bottom navigation while allowing the Qibla content above it to scroll.
- Replaced the normally unsupported live-sensor action on fine-pointer large screens with a three-step prayer-space alignment guide.
- Kept touch-first tablets and phones on the existing optional live-compass experience.
- Reused the existing local Qibla bearing, responsive tokens, icon layer, and Arabic/English localization system.

## Files changed

- `src/app/screens/QiblaScreen.tsx`
- `src/app/screens/QiblaScreen.test.tsx`
- `src/app/i18n/ar.ts`
- `src/app/i18n/en.ts`
- `e2e/navigation.spec.ts`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/agent/DECISION_LOG.md`
- `docs/agent/INDEX.md`
- `docs/agent/phases/PHASE_38_QIBLA_RESPONSIVE_RELEVANCE.md`
- `public/release-notes.json`

## Components added or modified

- `QiblaScreen`: screen-owned scrolling and input-aware desktop guidance.
- Qibla unit and navigation browser tests.
- Arabic and English Qibla guidance copy.

## User-visible changes

- Phone users can scroll from the dial through location, live compass, privacy, and calibration content without the bottom navigation covering the end of the page.
- Fine-pointer desktop users see the current degree bearing translated into three practical steps for aligning a prayer space.
- Touch-first devices retain the permission-gated live compass even at wider viewport sizes.

## Accessibility work

- Preserved one semantic heading hierarchy, native controls, visible focus, 44px targets, text-equivalent bearing, and non-live sensor movement.
- Desktop instructions use an ordered list with visible localized numbers.
- Screen scrolling uses the existing overscroll containment and momentum-scrolling contract.
- No content is exposed only by color or sensor capability.

## Tests added or updated

- Added unit coverage for Qibla screen scroll ownership and fine-pointer desktop guidance.
- Added browser coverage proving a 320px-wide Qibla view can scroll to its lower guidance.
- Added browser coverage for desktop guidance while preserving touch-device behavior.

## Commands run

| Command                                         | Result                                                                       |
| ----------------------------------------------- | ---------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`                | Passed; lockfile already current                                             |
| Focused Qibla Vitest suites                     | Passed: 2 files, 8 tests                                                     |
| Focused Qibla desktop and mobile browser checks | Passed                                                                       |
| `pnpm check`                                    | Passed all repository checks in 169.9s                                       |
| `pnpm test:e2e`                                 | Passed: 404 tests, 1 intentionally skipped                                   |
| `pnpm build:pages`                              | Passed; Pages build, PWA generation, bundle budget, and CSS utilities passed |

## Visual/manual evidence

- Before, the 320×700 Qibla surface had a 619px viewport and 989px of content with `overflow-y: visible`; the overflow-hidden parent made the lower content unreachable.
- After, Arabic mobile scrolling reached location privacy, live-compass action, and calibration content while bottom navigation remained fixed.
- Arabic desktop displayed the existing 136° bearing beside a compact three-step alignment guide and retained the established two-column composition.

## Documentation updated

- Updated Qibla behavior in the architecture and design-system contracts.
- Recorded DEC-179 and indexed this phase.
- Rewrote the bilingual release notes for the complete release batch.

## Decisions recorded

- DEC-179: Qibla owns compact scrolling and reuses the same bearing as desktop alignment guidance.

## Known limitations or remaining risks

- Live-compass accuracy still depends on real device sensors, browser permission, calibration, and magnetic interference.
- The desktop method assumes the reader has access to a phone or physical compass; no third-party map or geolocation visualization was introduced.

## Out-of-scope findings

- No Qibla formula, saved coordinates, location permission behavior, navigation hierarchy, map integration, or religious content changed.

## Recommended next step

- Verify the pushed commit in production at a short mobile viewport and a fine-pointer desktop viewport, then record workflow and live evidence.
