# Phase report — Resumed prayer-card release verification

## Objective

Complete the interrupted Concept A release, repair the remaining exact-commit browser failures and verify the expected production application.

## Scope completed

Inspected all four failed browser jobs and aggregate verify from Quality 45482870944 at 375de474. The complete report records 14 failed, six retried, 3,557 passed, zero skipped and zero run errors. The application batch remains intact. The resumed repair uses an isolated checkout to preserve newer external-source document authoring that arrived after the previously frozen release.

## Files changed

HomeScreen.tsx; compact-prayer, home-prayer-moment, home-prayer-overview and first-use-calm-controls browser specs; architecture, active phase, index, retry intake and this report; current release notes and their existing archive.

## Components added or modified

HomeScreen's existing ResizeObserver reconnects when the compact prayer row mounts or unmounts. No component, dependency, state schema or calculation is added.

## User-visible changes

Home retains its content position after switching between desktop and phone widths and folding the prayer header. The approved Concept A checklist, complete inline sources and recording date remain unchanged. The release includes the preceding approved Home, downloads, Qibla, prayer-settings and surah-entry work.

## Accessibility work

The regression preserves native Read-button access in the 643×275 landscape viewport and 390×844 phone layout, in Arabic and English. Existing focus, checkbox, 44px targets, text reflow and material assertions remain intact. Automated results do not establish complete WCAG compliance; physical Android, TalkBack/VoiceOver and sensor acceptance retain their prior documented limits.

## Tests added or updated

- Added a bilingual desktop-to-phone regression measuring the content's document position across folding and checking Read access. Both old-code cases fail with a 190.17px displacement; the repair reconnects current compact-row measurements.
- Updated exact checklist-gap expectations for the approved desktop spacing. Header alignment is checked against the inset's outer edges; checklist/date alignment and the padded content measure are checked separately.
- Daily-reset testing now waits for the mounted Home screen before advancing time and after reload before hash navigation. Every daily/weekly reset, saved-history, page-position and count assertion is retained.

## Commands run

| Command / evidence                                                                  | Exact result                                                                                                                     |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Frozen dependency install, isolated checkout                                        | PASS, pnpm 11.19.0 / Node 24.15.0, 30.8s                                                                                         |
| Targeted Home/card/prayer-screen unit tests                                         | PASS, 55 tests / 3 files, 17.95s                                                                                                 |
| New resize regression against the old compiled application                          | EXPECTED FAIL, 2/2 languages, 190.17px displacement                                                                              |
| Pre-repair geometry and retry diagnostics across three engines                      | 42 passed, 1 failed: reproduced the WebKit reload/readiness race; full log retained                                              |
| Fresh targeted fixed-build browser tests and repeated reset tests                   | Exact results retained in output/resume-fixed-browser.log and output/resume-reset-repeated.log                                   |
| Final complete quality, intact pre-push gates, exact-commit CI and production smoke | Exact outcomes are recorded in output/PRAYER_RELEASE_RESUME_RESULTS.md as they finish; pending results are not claimed as passed |

The initial local diagnostic used an older dev server whose embedded stamp disagreed with the current notes and showed an update modal. That result is excluded. Subsequent tests use a fresh compiled snapshot. No receipt, hook, assertion, inventory, timeout, coverage threshold or budget ceiling is bypassed or weakened.

The first complete check passed all stages except the total-output budget: 12,583,128 bytes, 216 above the unchanged 12,582,912-byte ceiling. Shortened only the newly authored release-summary copy and regenerated its existing archive; no devotional content or budget rule changed. The final check runs against that new exact snapshot.

## Visual/manual evidence

Original CI short-screen trace and frame captures are retained under the original checkout's output/release-resume-range-artifacts and output/playwright/prayer-card-polish. The current full English desktop card was inspected and shared with the owner. Final production identity and actual Arabic desktop/phone captures are recorded in the output results report after deployment.

## Documentation updated

Architecture describes breakpoint measurement ownership. The active phase records this exact-commit repair. Retry intake preserves all six CI retry identities and separates the reproduced reset-test race from unresolved intermittent cases. Current bilingual notes use a new 2026-11-24-3 stamp and four replaced entries covering the complete batch since the last deployment.

## Decisions recorded

The owner requested continuation of the interrupted release. The existing explicit coordinated all-changes release authority supersedes the earlier publication hold for the frozen application batch. New ongoing document authoring remains preserved independently; no unreviewed religious-content changes are imported.

## Known limitations or remaining risks

The five independent CI retry identities are retained for follow-up; passing isolated checks or retries are not claimed as repairs. Complete exact-commit Quality and Pages build/deploy remain mandatory. Physical-device and assistive-technology acceptance remains separate.

## Out-of-scope findings

New source-document generators, HTML/PDF outputs and inspection scripts continue changing in the shared main checkout. They are not application inputs for this resumed remediation, and are neither regenerated nor overwritten by it.

## Recommended next step

Finish exact-commit Quality, Pages build/deploy and production SHA/UI checks; retain their actual outcomes in the output results report and owner handoff. Complete the separately documented physical-device and assistive-technology acceptance.
