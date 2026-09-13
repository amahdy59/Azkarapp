# Phase Report — Adaptive audio player

## Objective

Make the shared player modern, focused, accessible, direction-aware, and appropriately sized for reading, tablet, and desktop contexts.

## Scope completed

- Keep one controller and one player rather than screen-specific playback implementations.
- Start compact and adapt dock/panel geometry to the app shell and available viewport.
- Add persisted SoundCloud-style volume and mute interaction for pointer, touch, and keyboard input.
- Make timeline fill, transport flow, and seeking direction follow Arabic RTL and English LTR.
- Remove redundant replay and generic attribution while preserving the exact reviewed source attribution.
- Update unit and browser coverage for responsive layout, input modes, persistence, recovery, and RTL progress.

## Decision

DEC-172 records the approved player behavior.

## Files changed

- `src/app/audio/AudioProvider.tsx`
- `src/app/audio/audioPreferences.ts`
- `src/app/audio/audioTypes.ts`
- `src/app/components/FloatingAudioPlayer.tsx`
- `src/styles/theme/layout.css`
- `src/app/audio/AudioProvider.test.tsx`
- `e2e/audio.spec.ts`
- `docs/audio/architecture.md`
- `docs/audio/testing-and-qa.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/agent/DECISION_LOG.md`
- `docs/agent/INDEX.md`
- `public/release-notes.json`

## Components added or modified

- Extended the existing audio controller with persisted volume and mute state.
- Reworked the one shared floating player into compact and expanded responsive variants.
- Added a shared vertical volume control without a new dependency.

## User-visible changes

- Playback starts in a focused compact dock and expands on demand.
- Desktop volume appears on hover or keyboard focus; touch devices reveal it on tap.
- Arabic progress fills and seeks from the right, while English remains left-to-right.
- Redundant replay and generic attribution were removed; exact reviewed source attribution remains.
- Playback errors automatically reveal Retry, Skip, and Stop instead of hiding recovery in compact mode.

## Accessibility work

- Used a native range input with a vertical orientation and localized percentage value text.
- Preserved 44px controls, focus indicators, keyboard seeking, Escape behavior, live status, and explicit error recovery.
- Named the volume control group as a toolbar and retained native button and slider semantics.

## Tests added or updated

- Added controller integration coverage for volume persistence, mute behavior, compact-first expansion, error recovery, and Arabic progress direction.
- Added browser coverage for touch volume disclosure, vertical semantics, RTL progress, hover disclosure, and desktop canvas bounds.

## Commands run

| Command                                                                      | Result                                                             |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `pnpm exec vitest run src/app/audio/AudioProvider.test.tsx --coverage=false` | Passed; 7 tests passed.                                            |
| `pnpm exec eslint src/app/components/FloatingAudioPlayer.tsx`                | Passed after adding toolbar semantics.                             |
| `pnpm check`                                                                 | Passed; 961 unit tests and all repository checks passed.           |
| `pnpm test:e2e`                                                              | Passed; 386 passed and 1 intentionally skipped.                    |
| `pnpm build:pages`                                                           | Passed; Pages build, bundle budget, and CSS utility checks passed. |

## Visual/manual evidence

- Full Playwright coverage verified the compact and expanded player at mobile and desktop viewports, including hover and touch volume behavior.

## Documentation updated

- Updated the design-system, audio architecture, audio QA contract, decision log, phase index, phase report, and bilingual release notes.

## Known limitations or remaining risks

- Media Session behavior remains browser-dependent and is unchanged by this phase.

## Recommended next step

- Verify the pushed Pages build and exercise playback, volume, and RTL seeking on the production origin.
