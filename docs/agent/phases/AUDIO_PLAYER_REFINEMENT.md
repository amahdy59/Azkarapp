# Phase Report — Audio player refinement

## Objective

Apply the owner-approved audio review recommendations locally. No commit, push or deployment.

## Scope completed

Plan before editing: repair dock offsets and short-height text constraints; show reciter names only; prioritize compact metadata; reuse Reader reading sizing; wrap metadata adaptively; offer explicit speed selection and prescribed-count repeat wording; add initial-containment/visibility checks; update contracts and verify.

Implementation and local verification complete. No commit, push or deployment.

Owner follow-ups remove attribution from the player and active guidelines, reduce the reciter-to-text gap, and move Speed/Volume below the main transport with matching keyboard order. Historical decisions are superseded explicitly; verification metadata remains intact.

## Files changed

FloatingAudioPlayer.tsx and its CSS/tests; App.tsx passes the text-size preference; readingTypography.ts and tests; AudioProvider integration tests; Reader audio-menu test; Arabic/English audio copy; audio browser specs; design/audio contracts (including recording guidelines), decision log, agent index and this report. Unrelated concurrent changes are excluded from this phase.

## Components added or modified

FloatingAudioPlayer reuses shared Select, native ranges, existing icons and the audio controller. No dependencies added.

## User-visible changes

Dock stays in the Reader canvas; compact timelines depend on container width; elapsed time has reserved space; expanded text shares Reader sizing; reciter/position metadata wraps; speed offers all five existing choices; repeat names its reviewed count; reciter menu omits recording attribution; short-phone text yields space to transport. Text starts close beneath the metadata, and Speed/Volume follow the main controls. Audio menu highlights use the muted theme surface for readable, restrained selection states.

## Accessibility work

Native labelled controls, explicit rate selection, nested Escape and focus restoration, compact full-context description, accurate reciter identification, scalable type, single visible progress control, preserved targets and independently keyboard-scrollable text. A WebKit axe check exposed poor highlighted-reciter contrast; the audio menus now pair the muted surface with foreground text. Automation supplements physical-device and screen-reader review.

## Tests added or updated

Direct speed selection, all text-size settings, shared typography sizing, accurate reciter identification and prescribed-repeat wording. Browser checks assert initial dock containment with desktop navigator open/closed, initial Play visibility, single progress control, rate selection and nested Escape. Responsive matrix includes 320, 390, 599, 768, 844 landscape, 900, 1024, 1200, 1440px and 200% root text across Arabic/English and all three themes.

## Commands run

| Command                                                 | Result                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Targeted player/reading typography unit tests           | 2 files, 28 tests passed.                                                                                                                                                                                                                                                                                                        |
| `pnpm exec vitest run src/app/App.composition.test.tsx` | 1 file, 5 tests passed unchanged after the cold-import timeout.                                                                                                                                                                                                                                                                  |
| `pnpm check`                                            | Initial runs exposed stale speed/source assertions and a menu-reopen race, then one reader-route timeout under concurrent load. Other stages passed. Repairs and final sequential verification are recorded below.                                                                                                               |
| `pnpm check:serial`                                     | Passed, exit 0: toolchain, formatting, lint, typecheck, audio manifest, all 176 unit files / 1,300 tests with coverage thresholds, production build, bundle budget and CSS utility checks.                                                                                                                                       |
| `pnpm check:type-scale`                                 | Passed, exit 0: 6 arbitrary font sizes, below the existing ceiling of 8.                                                                                                                                                                                                                                                         |
| `pnpm exec vite build --outDir output/audio-preview`    | Passed, exit 0. Dedicated preview serves on port 4286; port 4173 belonged to another local session.                                                                                                                                                                                                                              |
| `pnpm build:pages`                                      | Passed on the final source, exit 0, including PWA generation, bundle budget and CSS utilities.                                                                                                                                                                                                                                   |
| `git diff --check`                                      | Passed, exit 0.                                                                                                                                                                                                                                                                                                                  |
| Audio browser matrix                                    | Final layout matrix passed: all 30 cases across Chromium, Firefox and WebKit, with 30 expanded captures and `.last-run.json` reporting `passed` and no failures. The nine playback behavior cases also passed in the preceding run. Initial contrast, timing and measurement failures were repaired without relaxing assertions. |

## Visual/manual evidence

Saved and visually inspected responsive captures in `docs/agent/evidence/audio-refinement/`: `phone-ar.png`, `narrow-en.png`, `landscape-ar.png` and `desktop-dock-ar.png`. Browser artifacts and failure traces remain under ignored `output/` directories.

## Documentation updated

Design system, audio architecture/QA, licensing/source runbook and recording guidelines, decision log, historical phase-75 supersession note, index and this report. Source registry and reviewed content remain intact.

## Decisions recorded

Owner authorized recommendations on 2026-10-04 and explicitly prohibited pushing.

## Known limitations or remaining risks

Real screen-reader, safe-area hardware and actual audio listening checks remain manual. The full application browser suite remains a future publication gate; this phase verifies the audio-specific browser matrix. Unrelated concurrent edits remain present.

## Out-of-scope findings

The Reader audio-menu regression test now waits for the closing menu to unmount before reopening it. Initial full-quality verification found a cold reader-route loading timeout; its five-test suite passed in isolation without weakening assertions, and all 1,300 tests passed in the final sequential gate. A browser gap check now reads metadata and text rectangles atomically so a disappearing loading label cannot mix coordinates from different frames. Trace inspection showed WebKit timing out during scanner injection after many individual geometry calls. Browser checks now batch those reads and native scrolling, retaining the original assertions and adding full vertical visibility for every button. No timeouts, retries, accessibility rules, coverage thresholds or bundle ceilings were relaxed.

## Recommended next step

Owner review on physical phones after local verification. Refresh release notes and full release gates only before a future authorized publication.
