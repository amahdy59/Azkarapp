# Phase Report — Approved offline downloads overview

## Objective

Implemented the owner-reviewed Arabic download concepts locally, with clearer all/selected downloads, concise transfer feedback, safe recovery and responsive accessibility evidence. Owner publication hold applies: **no commit, push, deployment or release-note rewrite**. A new owner-selected chat will own final release.

## Scope completed

- One shared overview leads with Download all and actual estimated remaining size.
- Selected voices are visible before transfer; Change voices links to existing audio settings.
- Native disclosure/checkbox choices cover adhkar/duas, Kahf/Baqarah recitations and Mushaf pages. The existing protected page/juz picker remains available.
- Individual downloads/removal, filesystem export/ZIP and storage/help/technical details live in secondary management.
- A sequential coordinator runs independent selected groups, attempts later groups after failure and retains successful files. Retry skips verified-ready groups; the existing services reverify/reuse valid complete files within a partial group.
- One overview owns live progress and cancellation, including ZIP preparation. The current category and group number distinguish units; no fabricated overall byte/page percentage is used.
- Cancellation remains busy until owned work drains. A start double-click cannot immediately trigger the newly displayed Cancel action.
- Returning to the open app shows actual current progress immediately. Selected page-range recovery retains the exact original range.
- Removed the full-height active gold line. Existing transform-based progress transitions, reduced-motion alternatives, 80ms update coalescing, hidden notification pause and verification boundaries remain.

## Files changed

Application:

- src/app/components/DownloadOverview.tsx (new reusable presentation)
- src/app/components/DownloadProgress.tsx
- src/app/components/OfflineResourceRow.tsx
- src/app/components/ProgressBar.tsx
- src/app/components/action-feedback.css
- src/app/downloads/downloadBatch.ts (new)
- src/app/downloads/downloadBatch.test.ts (new)
- src/app/downloads/downloadSession.ts
- src/app/screens/settings/DownloadsPanel.tsx
- src/app/screens/settings/DownloadsPanel.test.tsx
- src/app/i18n/ar.ts and en.ts (Downloads changes only; concurrent Qibla changes also exist in these files)

Browser evidence/tests:

- e2e/helpers/downloads.ts (new)
- e2e/offline-overview.spec.ts (new)
- e2e/audio-download-recovery.spec.ts
- e2e/audio-file-export.spec.ts
- e2e/final-touch-quality.spec.ts
- e2e/offline-downloads.spec.ts
- e2e/practical-devotional-access.spec.ts
- e2e/settings-simplification.spec.ts

Documentation:

- docs/ARCHITECTURE.md
- docs/DESIGN_SYSTEM.md
- docs/MOTION_SYSTEM.md
- docs/QUALITY_CHECKLIST.md
- docs/audio/offline-caching.md
- docs/agent/DECISION_LOG.md
- docs/agent/INDEX.md
- docs/agent/phases/DOWNLOADS_OVERVIEW_2026_11_24.md
- This report.

Other Qibla, Home or source-review changes in the shared checkout belong to concurrent owner work. They were preserved, not included as Downloads implementation.

## Components added or modified

DownloadOverview presents phase/title/description, selected-voice and selection disclosures, primary action and current resource progress. It has no storage/network service calls. ProgressBar gains an opt-out of initial zero-fill animation, used by DownloadProgress only. OfflineResourceRow can defer progress/cancel to the authoritative overview.

## User-visible changes

The initial screen is substantially shorter. Details remain discoverable without competing with the primary action. Saved text/icon states, explicit incomplete groups and retry copy make actual readiness clearer. Cancelling or retrying preserves verified files. Download all includes only supported approved selected-voice material; it does not claim complete-Quran audio or downloads after app closure.

## Accessibility work

Native checkboxes, labels, details/summary, button/link semantics and keyboard operation; visible focus; shared protected picker; words plus icons; one accessible progressbar with scoped announcements; enlarged text wrapping; direction-isolated sizes; measured dock clearance and 44px control/label targets. Tests exercise RTL/LTR at 320px/200%, ordinary phone, tablet/desktop, themes/materials and reduced-transparency fallback. Existing tests cover app/OS still modes and protected dropdown opacity/hit testing. Real TalkBack/VoiceOver and physical Android acceptance remain pending; no complete WCAG or perfect-performance claim is made.

## Tests added or updated

Unit coverage adds default disclosure behavior, all/selected coordination, independent failure/retry, rapid-start double-click protection, route-return ratio, cancellation draining and exact page-range resumption. Existing archive focus, actionable errors, removal confirmation and selected-voice integrity assertions remain.

Browser coverage adds primary selection/default layout, native keyboard checkbox actions, no-selection disabling, responsive overflow and axe, one transfer/request and one Cancel action, continued progress on return, absence of the active line and selective/management disclosure geometry. Existing offline file export, ZIP cancellation, protected page/juz hit testing and dock-clearance assertions remain.

## Commands run

All paths below are local logs under output/; these are evidence, not cached passing receipts.

| Command                                                                                                                                                                                                    | Exact result                                                                                                                                                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| git fetch origin; git pull --ff-only                                                                                                                                                                       | Advanced clean initial checkout from a5fae217 to be3146ac, preserving subsequent concurrent work.                                                                                                                                                                          |
| pnpm typecheck                                                                                                                                                                                             | Passed during implementation and both full check runs.                                                                                                                                                                                                                     |
| pnpm test:run with DownloadsPanel, downloads, DownloadProgress, ProgressBar, MushafDownloadSelection, audioOfflineCache, audioOfflineCache.resume, mushafOfflineCache and audioDownloadTransfer test paths | **10 files, 86 tests passed**; output/downloads-unit-final-all.log.                                                                                                                                                                                                        |
| Targeted ESLint for changed Downloads components/session/batch/screen/tests/browser files                                                                                                                  | Exit 0.                                                                                                                                                                                                                                                                    |
| Targeted Prettier check for changed Downloads implementation/browser files                                                                                                                                 | Exit 0; output/downloads-format-scoped.log.                                                                                                                                                                                                                                |
| pnpm test:e2e with offline-overview, settings-simplification, offline-downloads, audio-download-recovery, audio-file-export, final-touch-quality and practical-devotional-access, desktop-chromium         | **56 passed**; output/downloads-browser-final.log and .json.                                                                                                                                                                                                               |
| Targeted Firefox/WebKit: offline-overview, final-touch-quality, audio-download-recovery, audio-file-export, filtered to selection/transfer/export/return journeys                                          | **28 passed**; output/downloads-browser-cross.log and .json. The final page-range resume correction is covered by the later unit/Chromium results.                                                                                                                         |
| Narrow Chromium reproduction after geometry repair                                                                                                                                                         | **9 passed**; output/downloads-browser-narrow.log and .json. Initial broad run was 28 passed / 5 failed due to enlarged geometry; original evidence retained under output/downloads-verification/first-run.                                                                |
| pnpm test:e2e:fast --output output/downloads-implementation-2026-11-24/core-smoke-retry (port 4198)                                                                                                        | **28 passed**; output/downloads-core-smoke-retry.log and .json. First invocation terminated before tests with native exit 3221226505; output/downloads-core-smoke.log retained.                                                                                            |
| pnpm audit:prod                                                                                                                                                                                            | Exit 0, **No known vulnerabilities found**; output/downloads-audit.log.                                                                                                                                                                                                    |
| pnpm test:e2e:inventory                                                                                                                                                                                    | Exit 0; **3,395 cases accounted for**, shard counts [392,434,479,506,461,321,328,318,156]; output/downloads-inventory.log.                                                                                                                                                 |
| pnpm check                                                                                                                                                                                                 | Failed mixed-checkout gate: Qibla lint/format at that snapshot, two 45-second Mushaf cache timeouts, output total over ceiling; output/downloads-check.log. 360 test files/2,583 tests passed; two tests failed.                                                           |
| pnpm check:serial                                                                                                                                                                                          | Failed mixed-checkout gate: source-review lint/format, one 45-second Mushaf cache timeout, output total over ceiling; output/downloads-check-serial.log. 360 files/2,587 tests passed; one failed. Build/typecheck, manifest/timing/type/motion/CSS utility stages passed. |
| pnpm build:pages                                                                                                                                                                                           | Build generated, budget failed: **12,588,557 bytes vs 12,582,912 ceiling** (5,645 over) in that snapshot; output/downloads-pages.log.                                                                                                                                      |
| git diff --check                                                                                                                                                                                           | Exit 0.                                                                                                                                                                                                                                                                    |
| Commit/push/deploy/release notes                                                                                                                                                                           | Not performed, per owner hold.                                                                                                                                                                                                                                             |

The check:serial build measured a different evolving shared snapshot: 12,591,699 bytes (8,787 over). These are separate observations, not a stable release baseline. No ceiling, assertion, timeout, coverage threshold or hook was relaxed. The unchanged Mushaf cache file passes in the focused final 86-test run; its full-suite timeout remains unresolved and must not be silently classified as harmless. The global lint/format snapshots also changed as concurrent work progressed; latest serial findings identify docs/external-sources/generate_specimens.cjs and its extracted Markdown/README.

## Visual/manual evidence

Actual browser screenshots were inspected; the enlarged overflow found in the first run was repaired by flattening management surfaces, reducing nested selection padding and allowing heading/labels to reflow.

Stable local preview copies:

- output/downloads-implementation-2026-11-24/downloads-ar.png
- output/downloads-implementation-2026-11-24/selection-ar.png
- output/downloads-implementation-2026-11-24/active-en.png

Broader cross-engine artifacts are preserved under output/downloads-verification/cross/browser-artifacts. Some shared default test-results directories were removed by concurrent test runs before they could be copied; the explicitly preserved cross-engine artifacts, unique JSON reports and logs remain available. The final core-smoke artifacts use a dedicated output directory.

The title outline visible in some captures is the existing keyboard focus indicator after navigation; it is independent of the removed active-download line.

## Documentation updated

Added approved phase, recorded the superseded top-level-card rule and the owner's no-release instruction, and documented presentation/session/coordinator/accessibility/motion/cache contracts. Reviewed religious content, attribution, counts, storage formats, sync and prayer behavior were not changed by Downloads work.

## Decisions recorded

The owner approved implementation after image review. Later explicitly prohibited release from all current chats, reserving release for a new chat. No publication action was attempted after that instruction.

## Known limitations or remaining risks

- Full repository quality is **not green**. Resolve the shared lint/format inputs, investigate the full-suite Mushaf timeout and reduce output within the unchanged ceiling before final release.
- Current shared input contents continued changing; these results do not establish an exact-commit release pass.
- Real Android/process closure, device storage eviction, physical transfer performance and human assistive-technology checks remain pending.
- Browser downloads continue during navigation within the open document; closure/reload requires explicit recovery.
- Progress is truthful current-resource progress with group context, not an aggregate mixed-unit percentage.
- Future final release must write fresh bilingual release notes for the then-current deployed commit range and run intact hook/CI gates.

## Out-of-scope findings

Concurrent Qibla and source-review work was visible during testing. No unrelated edits were rolled back, reformatted or released.

## Recommended next step

Owner review of the local Downloads implementation and continued feature improvements. The new final-release chat should reconcile all pending work, address the documented shared gate failures, rerun final exact-input quality/complete CI and collect native/assistive-technology evidence as applicable. Publication remains on hold.
