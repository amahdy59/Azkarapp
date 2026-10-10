# Phase Report — Offline downloads and coordinated release (2026-10-10)

## Objective

Apply the owner-approved qualified download-screen recommendations, review the supplied test report and all pending application changes, repair demonstrated regressions, and release the verified combined application to main and GitHub Pages. The current owner request explicitly supersedes earlier local publication holds.

## Scope completed

Plan before editing: inspect the cache/services and responsive shell; preserve reviewed content and cancellation; expose independent resources with clear essentials scope and verified statuses; use shared native accessible presentation; verify pending Reader changes and CI failures; run local/CI gates; publish and smoke-test the exact deployed commit.

The essentials bundle still excludes Al-Baqarah. Mushaf, Al-Baqarah, Al-Kahf and the three daily audio groups have independent controls. Removal asks for confirmation, explains that reading state is kept and discloses shared daily recordings. Remaining recording sizes use registry metadata and decimal MB, not fixed illustrations. The top summary separates included adhkar, app offline loading and downloaded Mushaf/fonts. Origin storage is clearly estimated and is never labelled device free space.

## Files changed

- DownloadsPanel and its tests; Arabic and English dictionaries; audioOfflineCache and its resume tests.
- New shared DownloadProgress, progress CSS, OfflineResourceRow and scrollViewport presentation utility; new offline-downloads browser spec and QuranChrome regression tests; updated practical-devotional-access copy assertions.
- SettingsPrimitives, SettingsScreen and SettingsSection focus regression coverage; devotional-footer and reader-options viewport case separation; khatmah-reader late-font/resize regression coverage; measured bundle baseline with unchanged ceilings.
- Previously pending AzkarListItem, CounterGuidance/hook/tests, FloatingAudioPlayer, HomeCards, MushafPageViewer, QuranListeningReader, ReaderFooterTools tests, reader-footer CSS, ReaderScreen and audio tests.
- Release manifest/history and architecture, design-system, audio-cache, decision/index documents and this report.

## Components added or modified

DownloadProgress styles native progress and limits active live announcements to quarter milestones. OfflineResourceRow owns layout and shared alert-dialog semantics, with localized action names and focus restoration after removal. DownloadsPanel owns operations; services own cache/network/state. No runtime dependency or persistence migration.

## User-visible changes

Compact overview, explicit essentials contents, a grouped resource manager and technical disclosure replace competing download cards. Partial verified readiness stays visible. Actions wrap with enlarged text. Player clearance uses its measured actual overlap, without double-counting navigation or safe areas. Keyboard scrolling respects the wide Settings outer viewport as well as the phone's inner viewport.

Pending Reader changes restore the three support actions/tools disclosure, stable spacing, manual counting-guidance recovery, compact audio controls, long-recording time formatting, waveform contrast and current-word/ayah feedback. Quran excerpts retain reviewed prelude flags; the proposed blanket basmalah additions were removed. Mushaf fitting resets the previous fitted measure before remeasurement, preventing iterative shrinkage and fallback overflow while preserving magnification and all canonical lines.

The full local run exposed a tablet short-landscape fit failure and a Firefox Settings heading-focus race. The fitter now normalizes measured lines against their actual rendered font size during mobile container-unit updates, with delayed-font and repeated-resize coverage. Settings headings receive focus when their own panel mounts after the outgoing transition, rather than querying a heading that is about to unmount.

## Accessibility work

Native progress/buttons/details and shared modal confirmation; 44px targets; theme tokens; stable labels; Arabic isolated size tokens; visible focus; keyboard recovery; scoped status/error live regions; reduced-motion-safe progress with no layout animation; 200% text and narrow-window reflow. Automated scans supplement, and do not replace, physical-device and assistive-technology testing.

## Tests added or updated

Independent Baqarah/Kahf selection and confirmed removal; persisted readiness across reopening; Arabic size isolation; storage gating; cancellation and partial bundle failure. Cache tests verify deduplicated checksums, scoped deletion without a registry, unrelated-file preservation, deletion failures, cancellation during verification and quota rollback. QuranPrelude tests preserve explicit reviewed flags. Browser scenarios cover Arabic/English, all themes, 320/390/820/1440px, landscape, 200% text, keyboard targets and player expand/collapse clearance. Existing fallback and magnification assertions stay intact.

The added late-font/repeated-landscape check passes across all five browser/device projects; the original short-landscape assertion also passes across Chromium desktop, mobile and tablet. Settings mount-focus and Mushaf unit checks: 2 files, 27 tests passed, exit 0 (9.06s).

Final-built feature verification: 91 browser tests passed, exit 0 (11.4m), covering the complete Khatmah reader/device matrix plus fallback, magnification, paired translation, independent downloads and Settings focus across desktop Chromium and Firefox. The previously failing English 390px Firefox heading-focus assertion passed with its original expectation intact. Final WebKit fallback/magnification verification: 8 tests passed (1.9m). The final player-clearance fix passes all 42 footer/downloads scenarios across Chromium, Firefox and WebKit (6.4m), including wide WebKit collapse, and all 24 Reader contextual-menu scenarios pass (4.0m). Footer and menu multi-viewport cases now run independently per viewport, retaining every assertion rather than raising timeouts. A focused player/Downloads unit run passes 46 tests (38.46s), including clearance retention through expansion and cleanup after playback closes. Isolated Home image decoding in WebKit passes (8.4s). The broad local run was interrupted after reaching test 885/917, with documented failures subsequently repaired or passing isolated checks. It did not produce a completed-run report; The owner subsequently requested immediate publication through the mandatory pre-push gates, with further full testing after push. The restarted full run was stopped at the owner request; it is not claimed as passing. Exact-commit CI still runs the complete suite before deployment. Reader-scene checks that timed out in the interrupted run pass in isolation (2 tests, 38.8s).

## Commands run

| Command                                        | Result                                                                                                                                                                                                                               |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Supplied external report                       | Claimed green targeted checks; reviewed as supporting evidence, not a substitute for exact-snapshot verification. Latest prior CI failed in footer, guidance and fallback flows.                                                     |
| Focused Reader/player/content unit run         | 7 files, 91 tests passed; exit 0.                                                                                                                                                                                                    |
| Final focused Downloads/cache/prelude run      | 3 files, 19 tests passed; exit 0.                                                                                                                                                                                                    |
| Downloads responsive browser scenarios         | 6 passed, exit 0, 45.8s; earlier passes exposed 200% overflow and wrong desktop scroll ownership and were repaired.                                                                                                                  |
| Fallback and magnification browser checks      | All 8 passed within the combined run; original page 599 desktop fallback failure repaired without weakening assertions.                                                                                                              |
| Initial pnpm check                             | All 14 stages passed, exit 0, 197.8s.                                                                                                                                                                                                |
| pnpm install --frozen-lockfile                 | Already current; exit 0, pnpm 11.19.0.                                                                                                                                                                                               |
| pnpm audit:prod                                | No known vulnerabilities; exit 0.                                                                                                                                                                                                    |
| pnpm check:release-notes                       | Fresh 2026-10-10.4 manifest/history validated; exit 0.                                                                                                                                                                               |
| Final combined pnpm check / full pnpm test:e2e | Latest exact-snapshot quality run is in progress; the tracked pre-push hook enforces all local release gates. Broad local runs were interrupted and are not claimed green.                                                           |
| Pre-push / exact-commit CI / production        | Owner requested push now and further testing afterward. Normal pre-push gates remain mandatory; exact-commit CI and production verification follow the push. No hook bypass, fabricated receipt, lowered assertion or raised budget. |

## Visual/manual evidence

Browser screenshots and traces are generated through the existing test output paths. Successful responsive evidence is retained under output/playwright/offline-downloads-release; test-results contains per-test artifacts while the suite runs. Native keyboard focus and target geometry are asserted; real-device/screen-reader review remains pending.

## Documentation updated

ARCHITECTURE, DESIGN_SYSTEM, audio/offline-caching, agent DECISION_LOG and INDEX; this phase report. Release notes rewrite all four entries per language to cover the ten commits since production f947416 plus this working tree. Production was still release 2026-10-09.3 at inspection.

## Decisions recorded

Owner requested all qualified recommendations and push of all changes after test review. Preserve existing essentials, reviewed content, voice eligibility, checksums, cache rollback, single-job isolation, public persistence and deployment gates.

## Known limitations or remaining risks

Storage estimates are advisory; browser/device cache eviction remains possible. Audio progress advances after complete verified files and does not promise byte-range resume. Shared daily recordings affect all referencing collections when removed. Large recordings still require complete-file checksum buffers, bounded to one verification at a time. Human listening, physical phone and assistive-technology checks remain follow-up work.

The final Pages initial-route gzip baseline intentionally increased from 158,039 to 159,119 bytes (1,080 bytes) with the download copy and behavior; stylesheet gzip fell from 28,650 to 28,649 bytes. Budget ceilings remain unchanged. The final Pages build and CSS utility checks passed, exit 0 (Vite build 24.82s).

## Out-of-scope findings

The already-deployed application was older than the supplied local report because Quality blocked later deployments. Preserve all normal CI and content checks; publication must wait for exact-commit Quality and Pages success.

## Recommended next step

Physical-device and assistive-technology review of the deployed downloads and Reader flows, followed by the previously requested listening review.
