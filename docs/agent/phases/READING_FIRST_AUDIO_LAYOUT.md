# Phase Report — Reading-first audio layout

## Objective

Give devotional text more space while keeping playback controls accessible and consistent. Owner approved all recommendations on 2026-10-09.

## Scope completed

Plan before editing: inspect current player and shared Mushaf sizing; compress desktop dock and mobile utility area; disclose secondary listening settings; preserve visible mode/progress; make compact title expansion keyboard accessible; add layout/focus coverage; run full quality/browser gates. The owner subsequently requested no push while releasing elsewhere; leave this phase local and uncommitted.

## Files changed

FloatingAudioPlayer.tsx and tests, AudioProvider.test.tsx, floating-audio-player.css, MushafPageViewer.tsx, Arabic/English i18n, audio and expanded-layout browser specs, design/audio contracts, decision log/index and this report.

## Components added or modified

FloatingAudioPlayer and read-only MushafListeningPage. Existing Radix Popover reused without dependencies.

## User-visible changes

Responsive listening page, shallower wide controls, compact mobile utility row, secondary listening options with visible active-mode summary, consistent header controls, explicit ten-second labels and native compact-title expansion.

## Accessibility work

Native title button; keyboard options and focus return; 44px targets; retained native seeking, direction, reduced motion, opaque surfaces and full overflow recovery.

## Tests added or updated

Player unit checks include compact title semantics and disclosed repeat/continuation. Browser checks cover options Escape, focus restoration, axe and responsive geometry while preserving existing assertions.

## Commands run

| Command                                                                                            | Exact result                                                                                                                                             |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pnpm install --frozen-lockfile                                                                     | Passed, exit 0; Node 24.21.0, pnpm 11.19.0.                                                                                                              |
| pnpm test:run src/app/audio/AudioProvider.test.tsx src/app/components/FloatingAudioPlayer.test.tsx | 51 passed, exit 0, 38.06s.                                                                                                                               |
| pnpm check                                                                                         | Passed, exit 0, 167.5s; all 1,552 unit tests, coverage, formatting, lint, types, content/timing validators, motion, build and bundle/CSS gates.          |
| pnpm build:pages                                                                                   | Passed, exit 0; existing bundle ceilings unchanged.                                                                                                      |
| pnpm audit:prod                                                                                    | Passed, exit 0; no known vulnerabilities.                                                                                                                |
| pnpm test:e2e                                                                                      | Full 754-case run in progress; output/player-layout/full.log and full-results.json.                                                                      |
| Reader failure rerun against the exact running preview                                             | 2 passed, exit 0, 10.8s. Original two Chromium cases showed ERR_NETWORK_CHANGED during local asset loads; traces retained, no test/code/retry weakening. |
| git diff --check                                                                                   | Passed, exit 0.                                                                                                                                          |

## Visual/manual evidence

Screenshots saved in output/player-layout/evidence, including Arabic/English responsive player, enlarged text and desktop Mushaf captures. Desktop expanded zikr, Arabic phone and desktop Al-Baqarah/Al-Kahf were visually inspected. Desktop tests verify a page taller than the previous 576px minimum when the reading canvas permits, and a dock at most 150px high with available wide control space. Across shell breakpoint changes the test reopens the existing compact state before measuring the expanded layout. Real screen-reader, cutout hardware and subjective reading comfort remain human checks; automation does not establish full accessibility conformance.

## Documentation updated

Design system, audio architecture, decision log, index and this report.

## Decisions recorded

Owner explicitly approved all recommendations; phase 91 timing/automatic following remains authoritative.

## Known limitations or remaining risks

Minimum page height intentionally scrolls on short windows rather than reducing canonical text. Human device evidence remains pending.

## Out-of-scope findings

Personal untracked text files excluded from release.

## Recommended next step

Verify the deployed player on physical phones and with assistive technology.
