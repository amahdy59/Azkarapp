# Phase Report — Reading, update and sharing reliability

## Objective

Apply all six owner-approved recommendations: rapid navigation, counting feedback, update dismissal, sharing geometry, encouraging progress copy and device/accessibility verification.

## Scope completed

Plan before edits: preserve approved 100ms exit/240ms arrival and counting timings; test interruption and burst input; defer the same release for 24 hours; retain manual update review; investigate strict sharing geometry; revise Arabic/English interface copy; verify responsive browsers and release gates. Religious content, prayer calculations, synchronization and progress schema remain unchanged.

## Files changed

ReadingTextTransition/tests; useZikrCounter/tests; usePwaLifecycle/tests; updateDeferral/tests; App; PwaNotice/tests; shared Button; Settings screen/types; About panel/tests; CollectionShareModal; translations; ProgressScreen and RoutineGarden tests; reading-reliability and sharing browser specs; architecture/design/motion/quality docs; decision log/index; release notes.

## Components added or modified

Interrupted reading motion displays the latest selection immediately. Counters handle input before rendering, clamp at the target, emit one completion vibration and cancel delayed advance on reset/restore. About offers manual update review. Sharing uses definite viewport sizing.

## User-visible changes

Latest-selection navigation and per-zikr counts remain consistent. Ordinary taps retain the subtle 15ms cue; completion retains its stronger pattern. Later defers the same release across navigation/reload for 24 hours; another release is independently eligible. Settings → About reopens the update without applying it. Progress invites continuation with factual totals intact. Sharing keeps its footer within the viewport through resize/enlarged text.

## Accessibility work

Outgoing text remains inert and hidden from assistive technology. Reduced motion keeps immediate text with identity-isolated child controls. Manual update review focuses Refresh and dismissal returns to the About trigger, including Safari pointer activation; automatic discovery leaves focus untouched. About support actions retain a 56px minimum and grow with enlarged labels. Progress subtitles use actual three/four-item plan totals. Browser checks include Arabic/English landscape geometry and axe. Physical speech, vibration, touch comfort and cutouts require human evidence.

## Tests added or updated

Interruption/reversal, burst counting, completion/reset, deferral expiry, repeated events/remounts, new releases, stale async responses, storage denial and manual review. Browser checks add rapid input/count restoration, landscape geometry/accessibility, actual update navigation/reload and sharing resize/font reflow. Existing exact geometry and motion assertions remain.

## Commands run

| Command                                       | Result                                                                                                                                               |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Initial focused units                         | 24 passed / 1 failed: prior test expected discarded update notes. New release-specific deferral retains notes for later review; expectation updated. |
| Navigation/counter/update units               | 5 files / 35 tests passed; exit 0.                                                                                                                   |
| Progress/sharing/settings/update units        | 6 files / 53 tests passed; exit 0.                                                                                                                   |
| Unchanged sharing diagnostic, six repetitions | 6 passed; exit 0; 40.5s. Historical overflow not reproduced.                                                                                         |
| `pnpm typecheck`                              | Passed; exit 0.                                                                                                                                      |

| Further command                          | Result                                                                                                                                                      |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First `pnpm check`                       | Passed; exit 0, 212.2s, before final review refinements.                                                                                                    |
| Subsequent `pnpm check` diagnostic       | Exit 1, 232.4s: English translation formatting only; all other stages passed. Formatted the affected file.                                                  |
| Dynamic Progress copy regressions        | 2 files / 25 tests passed; exit 0.                                                                                                                          |
| Reduced-motion reading-control isolation | 1 file / 6 tests passed; exit 0.                                                                                                                            |
| About manual-review pointer focus        | 1 file / 3 tests passed; exit 0.                                                                                                                            |
| PwaNotice/App composition                | 2 files / 7 tests passed; exit 0.                                                                                                                           |
| Initial focused browser matrix           | 22 passed / 1 failed; new WebKit test measured a responsive replacement before the counter mounted. Added a visibility wait, retaining geometry assertions. |
| `pnpm audit:prod`                        | Passed; exit 0, no known vulnerabilities.                                                                                                                   |
| Initial `pnpm build:pages`               | Passed; exit 0; Vite 51.47s; bundle/CSS gates passed. Final hook rebuild remains required.                                                                  |

Development full browser runs were interrupted while interruption, copy and focus refinements were being completed; they are not gate passes. The subsequent complete diagnostic run finished with 564 passed, 1 existing skip and 9 failures (44.4m): six manual-focus failures from missing React 18 ref forwarding, two WebKit responsive measurement races, and one unchanged Home startup timeout at the splash screen. Failure traces and JSON are preserved in `output/reading-reliability-2026-10-05/full-diagnostic-artifacts/` and `full-diagnostic-results.json`.

Three new unit regressions first reproduced missing action refs, motion preference changes during exit and unavailable-notes deferral loss (17 passed / 3 failed). After repairs, all 20 tests in those three files passed; typecheck passed. Shared Button now forwards native refs, toggling reduced motion cancels the old presence boundary, and unavailable notes retain the known deferral identity.

The next focused browser run finished 22 passed / 2 failed (3.3m). Focus and WebKit geometry were repaired; the new unavailable-notes simulation sent its synthetic event before Chromium mounted the reloaded listener. The test now waits for the About heading before dispatch, without weakening any product assertion. The unchanged Home case passed in this run; its earlier startup timeout remains recorded rather than dismissed as a passing retry.

Final gates, deployment and production evidence are recorded in `output/reading-reliability-2026-10-05/RELEASE_VERIFICATION.md` with separate browser JSON reports. Final source and test inputs are frozen during verification; required hooks and CI remain intact.

Final affected browser matrix: **24 passed, exit 0, 3.0m, no retries**. This includes Arabic/English rapid input with both motion settings on Chromium/Firefox/WebKit, update deferral through unavailable notes/navigation/reload/manual focus, strict sharing bounds, ordinary-motion recovery and the unchanged Home startup case. The intermediate readiness-only run failed two cases because its heading selector existed only on compact layouts; replacing it with the semantic About heading made the setup portable. No assertions, thresholds or product timings were weakened. Earlier completed non-browser check passed in 325.9s; the final exact-snapshot check and pre-push/CI outcomes are in the companion release evidence.

## Visual/manual evidence

Playwright test artifacts include screenshots. Inspected Arabic landscape Reader at 1180×820 and English About/update prompt; controls, latest text and deferral explanation remain visible. Human checks: `docs/agent/evidence/reading-reliability/DEVICE_CHECKLIST.md`.

## Documentation updated

Architecture, design/motion contracts, quality checklist, decision log and phase index.

## Decisions recorded

2026-10-05 owner instruction to apply all six recommendations, including proposed 24-hour release-specific deferral. Existing main-branch release authority applies.

## Known limitations or remaining risks

Historical sharing geometry (701px edge in a 700px viewport) did not reproduce in six unchanged runs. Definite sizing hardens the boundary but does not establish the original root cause. Physical-device/human screen-reader checks remain pending; no physical performance or complete accessibility claim.

## Out-of-scope findings

The separate performance audit's debounce, precache, timezone and audio-startup proposals are outside these six recommendations.

## Recommended next step

Record physical-device and human assistive-technology results; address any demonstrated device-specific defect without changing approved timings solely from emulation.
