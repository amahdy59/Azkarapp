# Phase Report — Audio dock refinement

## Objective

Make audio playback feel anchored, predictable, informative, and visually integrated with reading.

## Scope completed

- Kept Expand/Minimize and Stop/Close on stable logical edges in both player sizes.
- Docked the reading player directly to the bottom safe area.
- Removed the false mobile-navigation reservation from every Reader audio state.
- Added named overall listening progress to compact and expanded forms.
- Included queue or repetition position in compact metadata.
- Consolidated expanded title, reciter, state, and progress into one tonal information surface.
- Preserved the single existing manual/audio completion path.
- Replaced the compact vertical volume tower with a shallow horizontal control.
- Added a restrained decorative Mushaf image and tightened the long-surah action hierarchy.

## Files changed

- `src/app/components/FloatingAudioPlayer.tsx`
- `src/app/screens/ReaderScreen.tsx`
- `src/app/App.tsx`
- `src/styles/theme/layout.css`
- `src/app/audio/AudioProvider.test.tsx`
- `e2e/audio.spec.ts`
- `docs/audio/architecture.md`
- `docs/agent/DECISION_LOG.md`
- `docs/agent/INDEX.md`
- `docs/agent/phases/PHASE_40_AUDIO_DOCK_REFINEMENT.md`

## Components added or modified

- `FloatingAudioPlayer`

## User-visible changes

- Expanding the player no longer swaps collapse and close positions.
- Compact and expanded players sit at the reading surface's bottom edge.
- The compact volume panel opens inward and no longer obscures a tall strip of reading content.
- Listening progress is visible in both forms, including queue/repetition context.
- The expanded hierarchy is calmer and gives title, progress, transport, and secondary settings distinct priorities.
- Long-surah choices now begin nearer the heading and use existing Quran imagery without placing action text over it.

## Accessibility work

- Added named progress bars with numeric values.
- Preserved native timeline and volume sliders, localized names, keyboard shortcuts, focus rings, 44px targets, RTL direction, error recovery, and polite announcements.

## Tests added or updated

- Added unit coverage for listening progress in both forms.
- Added browser geometry coverage that player actions retain their relative edges.
- Updated unit and browser coverage for the horizontal compact volume control.

## Commands run

| Command                                               | Result                                             |
| ----------------------------------------------------- | -------------------------------------------------- |
| Focused audio, Reader, and Progress Vitest suites     | Passed: 31 tests                                   |
| Focused audio and Progress responsive Chromium suites | Passed: 9 tests                                    |
| Focused final audio and Reader Vitest suites          | Passed: 25 tests                                   |
| Focused compact-volume mobile Chromium flow           | Passed: 1 test                                     |
| `pnpm install --frozen-lockfile`                      | Passed                                             |
| `pnpm check`                                          | Passed in 54.7s                                    |
| `pnpm test:e2e`                                       | 371 passed, 2 flaky retries passed, 1 skipped      |
| `pnpm build:pages`                                    | Passed; bundle and CSS utility budgets also passed |

## Visual/manual evidence

- Compact and expanded English midnight player reviewed at mobile width in the local browser. Both forms remain bottom-docked and keep Expand/Minimize opposite Stop/Close.
- Existing Mushaf loading was audited: in-flight page and font requests are deduplicated, memory is bounded, Cache API storage is reused, neighbouring pages are prefetched, and remote origins are preconnected.

## Documentation updated

- Updated audio architecture, decision log, phase index, and this report.

## Decisions recorded

- DEC-182.

## Known limitations or remaining risks

- Media Session behavior remains browser-dependent.
- Real-device safe-area and mobile screen-reader checks remain release evidence, not claims made from desktop automation.
- Two Reader focus-timing checks needed their configured first retry on mobile and tablet, then passed; no final browser failure remained.

## Out-of-scope findings

- No recording, reviewed content, playback-plan identity, persistence schema, or audio asset changed.

## Recommended next step

- Review the local player on the target phone, then approve or revise the proposed Settings information architecture before implementation.
