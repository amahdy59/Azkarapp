# Phase Report — Download final refinements

## Objective

Implement the owner's approved final download-screen recommendations locally. Preserve the global no-commit/no-push/no-release hold and all concurrent work.

## Scope completed

- Derive Resume from verified saved resources, including after panel remount and full page reload. The remaining-size line accompanies the primary action. No new persisted download-history data is introduced.
- Always show compact per-category readiness: checking, incomplete, partly downloaded, downloaded or unavailable. Stale hints do not paint a verified check while a fresh status scan is running.
- Explicitly label current-group progress in visible percentages, accessible values and milestone announcements. The existing current category and group-number context remain.
- Show concise open-app guidance: users may browse within the app and must keep it open until transfer completes.
- Provide specific connection/server/storage/verification recovery wording in Arabic and English. Mushaf acquisition now uses typed DOM errors for server and invalid-file failures so the existing screen can map them without exposing internal messages. Complete verified files remain untouched.
- Fix the real desktop disclosure interaction found during verification: custom focus scrolling could move management between pointerdown and pointerup. Apply custom dock-clearance scrolling to focus-visible keyboard interaction; preserve normal pointer activation.
- Check physical Android availability and record the exact remaining acceptance checklist.

## Files changed

This follow-up modifies:

- src/app/screens/settings/DownloadsPanel.tsx and DownloadsPanel.test.tsx
- src/app/components/DownloadOverview.tsx
- src/app/components/DownloadProgress.tsx and DownloadProgress.test.tsx
- src/app/content/mushafOfflineCache.ts (two error classifications only)
- src/app/i18n/ar.ts and en.ts (Downloads copy only)
- e2e/offline-overview.spec.ts
- docs/ARCHITECTURE.md, docs/DESIGN_SYSTEM.md, docs/QUALITY_CHECKLIST.md
- docs/agent/DECISION_LOG.md, docs/agent/DEVICE_ACCEPTANCE.md
- docs/agent/phases/DOWNLOADS_OVERVIEW_2026_11_24.md
- This report.

The earlier overview implementation and unrelated Qibla/source-review edits remain pending in the shared checkout. No unrelated edits were reverted or reformatted.

## Components added or modified

Existing DownloadOverview and DownloadProgress gain truthful open-app and group-context presentation. DownloadsPanel derives resume/readiness from the existing verified status services, retains one authoritative action and scoped status regions, and preserves pointer/keyboard interaction. No new component or dependency is introduced.

## User-visible changes

Readers can recognize partial saved downloads immediately after reopening, see what remains available without expanding management, understand percentage changes between groups and choose a concrete recovery after a failure. Downloads still require connectivity for missing files, complete-file verification and explicit restart after document closure.

## Accessibility work

Current-group context is included in progressbar aria-valuetext and milestone announcements. Existing native checkbox/disclosure semantics, visible focus and 44px targets remain. The pointer fix retains keyboard dock clearance. Browser coverage includes RTL/LTR, 320px/200% text, phone/tablet/desktop, audio-dock clearance, Glass/Solid/accessibility fallbacks and axe.

Physical Android/TalkBack acceptance is pending: the configured SDK's adb devices -l returned an empty attached-device list. No physical slow-network, lock/suspension/termination or screen-reader pass is claimed. The detailed step sequence is in docs/agent/DEVICE_ACCEPTANCE.md.

## Tests added or updated

- Unit: verified partial status derives Resume after remount without a session result; specific network/timeout/server/invalid-file recovery; current-group visible and spoken progress.
- Browser: place an existing approved checksum-verified audio fixture in the normal cache, reload the document, assert Resume plus partial readiness and no audio request; assert default readiness visibility, current-group labeling and open-app guidance.
- Existing desktop audio-dock management test reproduced the click defect and passed after the product fix. Geometry, focus and accessibility assertions were retained.

## Commands run

| Command                                                                                 | Result / evidence                                                                                                                                                                                                                                                                                                                                                   |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Targeted pnpm test:run for DownloadsPanel, DownloadProgress, downloads and Mushaf cache | 5 files, 51 tests passed; output/download-polish-final-unit.log.                                                                                                                                                                                                                                                                                                    |
| Targeted ESLint for modified components/screen/tests/cache/browser spec                 | Exit 0; output/download-polish-final-lint.log.                                                                                                                                                                                                                                                                                                                      |
| Targeted Prettier check                                                                 | Exit 0; output/download-polish-format.log.                                                                                                                                                                                                                                                                                                                          |
| pnpm typecheck                                                                          | Exit 0; output/download-polish-types.log. Also passed in the full serial gate.                                                                                                                                                                                                                                                                                      |
| First three-engine browser run                                                          | 53 passed, 1 desktop management failure, plus 2 worker-shutdown errors; output/download-polish-browser.log/.json. Preserved as failed evidence.                                                                                                                                                                                                                     |
| Isolated desktop management reproduction                                                | Failed before fix; output/download-polish-management-repro.log. Passed after fix: 1 passed; output/download-polish-management-fixed.log/.json.                                                                                                                                                                                                                      |
| Final three-engine browser run                                                          | **54 passed (6.6m)** across Chromium, Firefox and WebKit, exit 0; output/download-polish-final-browser.log/.json. Dedicated screenshots/traces under output/download-polish-final-browser-artifacts.                                                                                                                                                                |
| pnpm check:serial                                                                       | Failed mixed-checkout gate: 359 test files / 2,594 tests passed; 3 timeouts in CategoryScreen/Mushaf cache; lint and formatting failures under docs/external-sources; total output 12,596,347 vs 12,582,912 bytes. Build/typecheck and audio/timing/type/motion/CSS checks passed. output/download-polish-check.log. No timeout, assertion or ceiling was weakened. |
| pnpm build:pages                                                                        | Build generated; bundle gate failed at 12,593,516 vs 12,582,912 bytes, 10,604 over. output/download-polish-pages.log. Shared inputs were evolving, so this is a separate snapshot from the serial gate.                                                                                                                                                             |
| pnpm test:e2e:inventory                                                                 | Exit 0; 3,404 cases accounted for. output/download-polish-inventory.log.                                                                                                                                                                                                                                                                                            |
| Configured Android SDK adb devices -l                                                   | Empty attached-device list. Device acceptance not executable here.                                                                                                                                                                                                                                                                                                  |
| git diff --check                                                                        | Exit 0.                                                                                                                                                                                                                                                                                                                                                             |
| Commit/push/deployment/release-note edits                                               | None, per owner hold.                                                                                                                                                                                                                                                                                                                                               |

## Visual/manual evidence

The full-reload Resume screenshot was inspected. It shows a primary Resume action, actual estimated remaining size, partial adhkar readiness and incomplete other categories with management closed. The title outline is the existing navigation focus indicator.

Final screenshots use output/download-polish-final-browser-artifacts, including resume-after-reload.png, overview.png, selection.png, active.png and cancelled.png across supported engines. Initial/reproduction logs and traces remain in their separately named output directories.

## Documentation updated

Phase, decision log, architecture, design system and quality checklist record the new resume/readiness/error/group/pointer contracts. Physical acceptance includes an explicit unexecuted Android/TalkBack sequence. Earlier evidence remains in DOWNLOADS_OVERVIEW_2026_11_24_REPORT.md.

## Decisions recorded

Owner approved all final recommendations locally. The existing global publication hold remains in force.

## Known limitations or remaining risks

- Full repository quality and Pages bundle gate remain red; feature-specific passing evidence is not a release pass.
- No connected Android device; native performance/closure/lock/offline playback and human TalkBack checks remain pending.
- Initial broad browser run included worker-shutdown errors; it is not counted as a passing run. Final rerun results are recorded separately.
- Verified readiness scans use existing cache services and do not guarantee persistence after clearing app/browser data.
- No claim of perfect performance or complete accessibility compliance.

## Out-of-scope findings

The source-review lint/format failures, CategoryScreen/full-suite Mushaf timeouts and total-output budget remain shared consolidation findings. They were not concealed, weakened or repaired through unrelated edits.

## Recommended next step

Owner review of local refinements and connected Android/TalkBack acceptance when hardware is available. A separate final-release chat must resolve shared gate failures, verify exact final inputs and perform the intact release cycle. No publication from this chat.
