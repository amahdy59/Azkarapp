# Phase Report — Mobile Reader surface and release

## Objective

Fix the owner's marked mobile Reader progress area, inspect similar compact controls and publish all pending changes with necessary verification only.

## Scope completed

Plan before editing: inspect screen/material ownership, reuse existing compact chrome and progress tokens, move compact Reader protection to one surface, extend existing header regressions and inspect bilingual phone captures. Preserve and verify the pending CI repairs; refresh release notes, run the intact release hook, push main and monitor exact-commit Quality/Pages plus production smoke.

Implementation removes the separate tinted body boundary below progress. Related Masbaha/Salawat tracks use the same visible muted token. Existing pending prayer label/Read action and standalone keyboard help repairs are included under the owner's all-changes authorization.

## Files changed

ReaderScreen.tsx/CSS; ReadingScreenChrome.tsx; reader-header-refinement.spec.ts and home-glass-parity.spec.ts. Pending release scope also includes PrayerActionsCard/test, StandaloneCounterFooter, CustomCounterScreen, FridaySalawatScreen, compact-prayer, counter-feedback, prayer-actions-responsive, scroll-performance and sharing-curated browser specs. Bilingual release notes/archive and architecture/design/agent documentation are updated. The commit diff is authoritative.

## Components added or modified

Existing ReaderScreen, ReadingScreenChrome, shared standalone footer and PrayerActionsCard. No runtime dependency, state schema or content edit.

## User-visible changes

Continuous compact Reader background, visible full progress track, readable responsive after-prayer labels, quiet adjacent Read action and restored standalone keyboard help. Pending sharing regressions verify approved attributed exports without changing original artwork.

## Accessibility work

Retain native progress semantics, 44px actions, keyboard recovery, RTL/LTR, focus mode and protected reading contrast. Responsive assertions cover 320–767px and 200% text; automated axe remains separate from physical-device/human screen-reader acceptance.

## Tests added or updated

Extended the existing Reader header spec with compact Reader/Masbaha/Salawat full-track geometry, single material ownership, bilingual text enlargement, no horizontal overflow and scoped axe. Existing solid/wide-header checks are retained. Pending CI assertion repairs keep actual image pixels, exported footer, labels and counts measurable. Counter fit measures the visible tally rather than a clipped invisible halo. Prayer controls retain disjoint rectangles and the exact 8px gap when wrapping. Wheel movement is bounded by the actual native scroll end. Prayer geometry blocks service-worker update notices; dedicated update/offline suites retain real workers.

## Commands run

| Command                                                                                                     | Result                                                                                |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| git fetch origin; git rev-list --left-right --count HEAD...origin/main                                      | Pass; 0/0 before release.                                                             |
| gh run view 39139603244 --log-failed                                                                        | Previous failed jobs inspected; evidence output/mobile-release-prior-ci.log.          |
| pnpm test:e2e e2e/reader-header-refinement.spec.ts --project=desktop-chromium --project=mobile-webkit-smoke | Pass: all 8 cases, exit 0, 2.7m. Chromium/WebKit, Arabic/English; captures inspected. |
| pnpm archive:release-notes                                                                                  | Archives new bilingual 2026-10-18.6 notes.                                            |

Final necessary affected-check, intact push-hook, exact-commit CI/Pages and production results are recorded in the release evidence under output/mobile-reader-* and the coordinating chat's final report. Historical successful checks are not rerun without changed inputs or an unresolved failure. No receipt is fabricated or hook bypassed.

Initial related-feature verification: 31 cases passed, three failed (visible-tally measurement, a wheel already at its native end, and a waiting-worker notice interrupting the Firefox information sheet). Evidence and failures are retained in output/mobile-reader-release-repairs.log/.json. Targeted follow-up reruns cover the diagnosed cases and responsive prayer controls; obsolete same-row English assertions were corrected to require non-overlap and the same 8px gap in either orientation.

Follow-up verification: output/mobile-reader-final-repairs.log records all three prior failures passing, plus the Arabic prayer controls across engines (11 passed; six English same-row assertions failed). Those six are corrected for the approved wrap contract. Final wrap/material verification uses existing prayer-actions-responsive and home-glass-parity specs across Chromium, Firefox and WebKit; all 12 cases passed, exit 0, 1.7m; results are retained in output/mobile-reader-wrap-material.log/.json. Material assertions retain the exact protected tint/frost on the owning surface and transparency of the inner compact body.

## Visual/manual evidence

output/playwright/mobile-reader-seam contains Arabic/English Reader, Masbaha and Salawat captures by engine. Inspected the Arabic evening An-Nas Reader: title/progress/text share continuous protection and the full track is visible. Inspected English Masbaha for related compact geometry.

## Documentation updated

Architecture, design-system contract, decision log, index, this report and bilingual current/offline release notes.

## Decisions recorded

Owner explicitly authorizes all pending changes and publication. Preserve reading content and existing data boundaries. Necessary release gates remain mandatory; unchanged successful results are reused where applicable.

## Known limitations or remaining risks

Physical Android rendering and human assistive-technology acceptance remain separate. Complete exact-commit CI and production verification before declaring the release complete.

## Out-of-scope findings

Prior release CI failures require the pending focused fixes and exact-commit verification; they are included in the authorized release scope. No religious content, database, provider or dependency change.

## Recommended next step

Verify Quality / verify, Pages build/deploy and production behavior for the pushed commit, then review on the original physical device.

## Exact-commit CI footer assertion remediation

Quality run 39144257848 exposed a stale four-control centering assertion in standalone-counter-footer.spec.ts after the pending restoration of desktop keyboard help added a fifth tool. The actual row remains centered. Replace the fixed fourth-index edge with the real last control; retain the exact one-pixel tolerance, focus/count recovery, viewport bounds and axe checks. No application or content change is required, so this tests/documentation-only remediation does not require new release notes.

Inspected failed Chromium-3 and Firefox-2 logs: all reported failures point to that same assertion (four cases per engine). Logs are retained in output/mobile-reader-ci-chromium3.log and output/mobile-reader-ci-firefox2.log. Targeted 1440px standalone-footer verification passed all 12 cases across Chromium, Firefox and WebKit, exit 0, 1.4m; output/mobile-reader-footer-ci-repair.log/.json. Remaining first-run CI results and final exact-commit publication results are preserved in output/MOBILE_READER_RELEASE_REPORT.md. The intact push hook still requires a fresh exact-tree pass for this tracked test change; no receipt reuse is fabricated.
