# Phase Report — Collapsed player waveform and edge controls

## Objective

Apply the owner's collapsed-player design review while retaining a shorter waveform, preventing text collisions and preserving keyboard, pointer, RTL/LTR and enlarged-text access. Keep all changes local and unpushed.

## Scope completed

Plan: inspect existing player/Reader contracts and pending work; reserve equal outer action slots; simplify the surface; reuse verified waveform rendering with a compact variant; preserve expanded edge/focus continuity; add geometry/interaction coverage; verify screenshots and required gates; update contracts.

Implementation and final browser verification are complete. Repository quality results and the shared-menu guard blocker are recorded below. This continues the audio refinement without changing persistence, audio sources, religious text or unrelated concurrent work.

## Files changed

- src/app/components/FloatingAudioPlayer.tsx, FloatingAudioPlayer.test.tsx, floating-audio-player.css and AudioPlayerSurface.tsx; src/app/screens/ReaderScreen.tsx.
- e2e/audio-expanded-layout.spec.ts and e2e/audio.spec.ts.
- docs/DESIGN_SYSTEM.md, docs/audio/architecture.md, docs/audio/testing-and-qa.md, docs/agent/DECISION_LOG.md, docs/agent/INDEX.md and this report.
- Screenshot evidence in docs/agent/evidence/audio-compact-waveform.

No runtime dependency, manifest, waveform-source data, lockfile or persisted/synchronized state changed in this follow-up. Earlier waveform/controller changes and concurrent counter/sharing/menu changes remain uncommitted and preserved.

## Components added or modified

FloatingAudioPlayer shares its waveform renderer between passive compact progress and expanded seeking. Compact uses 48 averaged verified peak pairs, 26px maximum height and 3px rounded bars, averaging adjacent verified bins with a monotonic fourth-power display scale to reveal quieter passages. Its grid reserves Close 44px, flexible context, Play 48px and Expand 44px, with matching DOM/visual order. AudioPlayerSurface selects the explicitly marked collapse action for initial focus rather than assuming the first button.

## User-visible changes

- Close and Expand occupy opposite outer edges; expanded Close/collapse keep those same logical positions. Arabic mirrors the textual/action layout; media transport and progress retain physical LTR time.
- The waveform replaces the old separate compact line and shows current-recording progress. Missing verified data retains a truthful line fallback. Only expanded mode offers scrubbing.
- Bottom-docked Reader surface with no exterior gap: audio-only footer padding and desktop bottom margin are removed; safe-area padding is inside the panel, whose bottom edge is flat. Manual counter spacing is preserved.
- Softer border/shadow, no glow or divider. Title wraps to two lines within its reserved column; full identity remains in the accessible description. Reciter/time reflow, and the decorative headset yields space on narrow containers.
- Three dedicated actions only. Tapping context/body also expands; Play/Pause and Close remain independent. Keyboard expansion is available through the labelled chevron; Escape/collapse restores focus to it.

## Accessibility work

44px outer targets, 48px primary target, visible focus rings and full accessible context. Icon-only targets retain physical dimensions when text is enlarged, protecting neighboring text columns. Semantic progressbar announces current time/duration without creating another seek control or live-announcing every tick. No simulated wave animation; reduced-motion behavior remains intact. Initial focus stays on Collapse, not Close. Covered reading controls remain inert until collapse.

## Tests added or updated

Two unit tests verify one real compact waveform, current-recording versus queue progress, 48 bins, no compact slider, three actions, body expansion and independent playback/focus. Existing tests retain fallback, stop recovery and expanded accessibility coverage. Browser tests measure fixed action alignment, text containment, collision avoidance, RTL/LTR edges and overflow at all responsive tiers. The 200% scenario now enlarges text before testing compact as well as expanded mode. Compact axe scans cover narrow and enlarged layouts; expansion uses Enter. Manual-navigation tests expand through context and retain click-and-drag seeking across all engines.

## Commands run

| Command                                                                                                                                | Result                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| pnpm test:run src/app/components/FloatingAudioPlayer.test.tsx src/app/audio/AudioProvider.test.tsx src/app/audio/audioWaveform.test.ts | Passed: 43 tests across 3 suites, exit 0, 5.48 seconds.                                |
| pnpm typecheck                                                                                                                         | Passed, exit 0.                                                                        |
| Targeted ESLint                                                                                                                        | Passed player, unit, surface and browser files, exit 0.                                |
| Vite isolated preview build                                                                                                            | Passed, exit 0; output/player-compact-bottom-preview.                                  |
| 200% text Chromium check                                                                                                               | Passed, exit 0, 7.6 seconds, including compact/expanded geometry, keyboard and axe.    |
| Full affected audio browser matrix                                                                                                     | Passed: 42 cases across Chromium, Firefox and WebKit, exit 0, 3.7 minutes, no retries. |
| pnpm check                                                                                                                             | Exit 1, 142.0 seconds: 9 stages passed; shared-menu CSS utility guard failed.          |
| pnpm build:pages                                                                                                                       | Exit 1, 9.6 seconds: Pages build and bundle budget passed; same CSS guard failed.      |

An initial unit run caught first-button focus landing on Close after the header order changed; the marked initial-focus action fixes it without weakening the expectation. Inspection removed a legacy two-column CSS rule that would override the new grid. The enlarged-text test was strengthened to scale before compact checks; fixed icon-action dimensions keep the reserved columns honest at 200%. Intermediate browser runs were stopped before final evidence to incorporate these corrections; no unrelated processes were stopped.

Targeted Prettier checks and git diff --check also passed, exit 0, after the final documentation update.

## Visual/manual evidence

Evidence in ../evidence/audio-compact-waveform covers Arabic phone, English 320px, English 200% text, desktop and expanded-header continuity. Final docking captures replaced the initial ones. Arabic phone, desktop and an actual 200% screenshot were inspected: title remains clamped within its column, metadata reflows and controls remain separated. Preview is available at http://127.0.0.1:4286/#/azkar/evening/1. Deterministic browser media is test-only; production playback continues through the existing audio controller.

## Documentation updated

Design-system compact anatomy and edge contract; audio architecture progress semantics; QA checklist; owner decision log; agent index and this phase report. Prior phase reports retain historical results rather than being rewritten as current evidence.

## Decisions recorded

The owner approves edge-positioned chevrons, quiet surface and retained waveform, with explicit collision prevention and accessibility. Follow-up requests bottom docking without the awkward gap and a taller, fuller audio-app-style waveform. Compact has one passive media-progress representation; expanded has one seek waveform. Do not push. No commit or deployment has been made.

## Known limitations or remaining risks

Long titles are deliberately clamped to two lines, with complete title/reciter/queue identity available to assistive technology and through expansion. Existing two hosted recordings without verified peak data retain the line fallback documented by the earlier phase. Manual screen-reader and physical-device confirmation remains required before claiming complete accessibility compliance. Whole-repository release readiness depends on concurrent owner edits settling and the complete gates passing.

## Out-of-scope findings

Unrelated counter, sharing, picker and shared-menu changes were preserved. The current repository gate passes build, typecheck, lint, format, toolchain, type scale, unit/coverage, audio manifest and bundle budget. The remaining CSS utility guard still requires .ps-8, .pe-2 and .start-2 after concurrent shared-menu changes removed them. Pages build also passes compilation and bundle budget, then fails the same guard. No guard, assertion or concurrent menu implementation was weakened or altered to obtain a pass.

## Recommended next step

Owner review of the local player, including the new collapsed waveform and both edge positions. Coordinate remaining concurrent work before authorizing any commit/push and release verification.
