# Phase Report — Combined owner refinements release

## Objective

Review, verify and publish all completed local owner changes. The owner's 2026-10-14 instruction to check and push all changes supersedes the historical local-only publication holds for this workspace.

## Scope completed

Review plan: inspect the combined diff and domain contracts; preserve the owner changes; repair integration defects with regression coverage; restore the five supplied JPGs unchanged; verify affected browser flows and complete local release gates; publish to main through intact hooks; verify exact-commit Quality, Pages and production.

The review repairs retain old audio caches after a failed migration, reject missing or non-image curated exports, clear obsolete curated files, recover to the interactive studio, prevent a swipe's synthetic click from counting, and keep completed Salawat round totals independent of later target changes. Interactive sharing remains the default so content/scope/customization choices apply normally; supplied artwork is an explicit alternate.

## Files changed

The combined change spans audio cache/archive services; PWA recovery; Reader, Masbaha and Salawat; Benefits/sharing; Progress/prayer/Friday statistics; responsive browse screens and Settings; bilingual copy; supplied public artwork; release notes/history; Vite precaching; related tests and phase documentation. The committed diff is the authoritative complete inventory.

## Components added or modified

AppearanceMenu, SalawatFormulaPicker, ReadingScreenChrome, StandaloneCounterFooter, CollectionShareModal, BenefitsScreen, DownloadProgress, ProgressBar, ProgressTrendChart, PrayerTrackerCards, PrayerTrackerStats, FridayProgressStats and affected screen compositions.

## User-visible changes

Preserved devotional downloads across updates; readable audio archive folders; shared counter controls and sharing; supplied morning/evening card packs; Benefits image/text sharing; clearer progress statistics and common page alignment. Source images are owner-supplied and copied unchanged; reviewed application content is not rewritten.

## Accessibility work

Retained native menus, radio choices, progress semantics, localized direction, focus controls and polite status feedback. Browser checks include axe and responsive/footer checks. Automated checks do not establish complete manual accessibility compliance.

## Tests added or updated

Regression tests for failed cache migration, missing/HTML image responses, generated-card recovery, synthetic clicks following swipes, and changing targets after completed rounds. New sharing-curated browser coverage checks decoded image dimensions, exact deployed image bytes in saved ZIPs, modal axe, screenshots and first-visit offline image availability.

## Commands run

| Command                                                                | Result                                                                                                                                 |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `git fetch origin`                                                     | Passed; candidate initially matched origin/main                                                                                        |
| Focused audio cache, curated service and sharing unit suites           | 39 passed                                                                                                                              |
| Focused counter, controls, audio archive/cache and PWA suites          | 73 passed before final round/default-sharing regressions                                                                               |
| Final focused screen, counter, prayer, chart and PWA suites            | 87 passed across 9 files                                                                                                               |
| Curated/footer browser regressions across Chromium, Firefox and WebKit | 31 passed                                                                                                                              |
| Initial affected Chromium browser run                                  | 18 passed; 4 failed because the old counter selector matched the new navigation buttons; selector repaired without changing assertions |
| `pnpm check`                                                           | 13 stages passed; bundle stage failed: 12,071,639 bytes exceeds the fixed 11,534,336-byte total-output limit                           |
| `pnpm audit:prod`                                                      | No known vulnerabilities                                                                                                               |
| `pnpm test:e2e:inventory`                                              | 1,415 tests assigned exactly once across nine shards                                                                                   |
| `git diff --check`                                                     | Passed                                                                                                                                 |
| Final combined `pnpm check` before d28aba18                            | All 14 stages passed in 96.3 seconds; exact-snapshot receipt recorded                                                                  |
| d28aba18 pre-push hook                                                 | Frozen install, receipt reuse, 26 core browser tests and Pages build passed                                                            |
| Optimized curated-card regressions                                     | 7 passed across Chromium, Firefox and WebKit, including first offline visit                                                            |
| Header reproduction after repair                                       | 6 passed across desktop, phone and tablet Chromium                                                                                     |
| Header/prayer/Benefits remediation browser checks                      | 19 passed across Chromium, Firefox and WebKit                                                                                          |
| Narrow counter/footer checks after repair                              | 13 passed across Chromium, Firefox and WebKit                                                                                          |

The owner explicitly approved local conversion of image copies. All five original JPGs remain tracked unchanged in design-sources/curated-routines, with SHA-256 identities in manifest.json. Deployed WebP copies retain 900×1600 resolution and total 271,726 bytes (550,174 bytes smaller). All five decoded copies were visually inspected for Arabic text legibility; background textures are lossy. No budget ceiling changes. Final exact-candidate hook and CI outcomes are reported with the release result.

## Visual/manual evidence

Affected browser suites save screenshots and failure traces under Playwright output. Physical device, real screen-reader and native share-sheet review remain human checks.

## Documentation updated

This report, existing pending architecture/decision/phase documents, current bilingual release notes and archived release history.

## Decisions recorded

Owner approval to publish all combined changes now. No hooks, assertions, coverage thresholds, browser inventory or bundle ceilings are weakened.

### CI remediation

Commit d28aba18 passed local gates and GitHub non-browser checks, but the responsive shard exposed four mobile/tablet header regressions: the nested ordinary-page header retained an 8px screen-padding strip. The existing no-padding selector now recognizes any immediate ordinary-page wrapper containing the shared header, preserving sticky coverage without changing user-approved page widths or Mushaf geometry. Existing browser assertions remain unchanged. Final exact-commit CI and production outcomes accompany the release report.

All eight failed browser-job logs were inspected. Other failures were the corresponding desktop/Firefox/WebKit header cases, obsolete expectations for WhatsApp sharing and Home's former 70rem frame, and a 172px Masbaha counter on a 320px phone. The Benefits browser test now verifies complete evidence/citation text and exact downloaded payload; the former URL encoder unit test remains. Home tests reflect the owner's approved 80rem Library-aligned frame and add exact header/content width and origin assertions while retaining the existing 40rem prayer-panel bound. A narrowly scoped footer rule preserves the counter's existing 200px minimum while retaining 44px navigation targets within the phone viewport; the browser regression now explicitly measures those targets. No assertion is removed to hide an application defect.

## Known limitations or remaining risks

Browser storage eviction and private-mode limits remain outside the application's control. Supplied infographic text is retained as supplied; this release does not claim new independent religious-source review. Native clipboard/share support varies by device.

## Out-of-scope findings

None requiring an architecture or dependency replacement.

## Recommended next step

Complete exact-commit CI and production verification, then stop the release monitor.
