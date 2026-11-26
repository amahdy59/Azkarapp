# Coordinated release: CI remediation — 2026-11-26

## Objective

Complete the exact-commit browser, Pages and production release cycle after the first pushed batch. This supplements the [coordinated report](COORDINATED_RELEASE_2026_11_25_REPORT.md), preserving its source-review and physical-device boundaries.

## Scope completed

The complete local non-browser gate passed in **153.2s**, including enforced coverage and unchanged budgets. The tracked pre-push hook verified notes/toolchain, frozen installation, a genuine exact-input receipt, **28 core browser cases in 1.5m** and the Pages build. Home startup was **524,890 gzip bytes**. Production isolation found zero pilot leaks across **1,163 files / 11 markers**. No hook was bypassed.

Source evidence commit **37492b06** and application commit **974cb93d** were pushed normally to main. The approximately 99 MiB evidence/source batch uploaded slowly but continuously. The checkout was clean and matched origin afterward.

[Quality run 45751800367](https://github.com/amahdy59/Azkarapp/actions/runs/45751800367) passed Android compilation/lint/unit/release-bundle verification, the complete non-browser gate in 135.3s, hosted audio validation (257 instances, 166 assets, 200 approved mappings), Pages build and production audit. Its **3,992-test inventory across nine shards** retains every assertion. Its first browser matrix correctly blocks Pages; each failed job's logs is inspected under `output/coordinated-ci-*.log` before remediation.

## Files changed

Remediation is confined to Masbaha presentation, Quran portion fitting/short-surah spacing, Home accessibility-material/texture rules, the affected browser journeys/helpers, bilingual release notes/archive and reports. No runtime dependency, workflow bypass, coverage threshold or budget ceiling changes.

## Components added or modified

Existing Masbaha actions/tally, QuranReadingZoom/ReaderScreen, grouped Home prayer rail/material rules and the tests exercising their approved shared overlay behavior.

## User-visible changes

- Disabled Undo retains readable semantic foreground; the circular Masbaha tally no longer inherits an expanding rectangular ready pulse that created horizontal scroll overflow.
- Quran enlargement validates actual rendered candidate portions, including browser font metrics, before presentation. Exponential candidate growth and bounded refinement avoid repeatedly cloning the remaining surah. Every reviewed word identity and canonical Mushaf return remain intact. Short-surah content reclaims extra 16px padding while preserving the visible 44px enlargement action.
- Home accessibility fallbacks remove inherited Glass shadows; solid grouped phone timings regain grain on their shared rail. Phone items retain no duplicate texture/blur, and Glass sheen stays under the original material contract.

## Accessibility work

Tests enter the approved single prayer tracking dialog and disclose its evidence. Salawat supplies active dropdown fixtures for fallback/menu keyboard assertions. Progress preset tests wait for owner teardown, then verify value and focus on the surviving opener. Ordinary and enlarged date opening asserts the named container, Tab-to-Close, field access, axe and return focus. Shared modal motion checks retain positive duration and both app/OS reduced-motion assertions. Prepared-first sharing explicitly enters custom design before disclosure keyboard checks. Retired Benefits formats remain outside deployment while active mosque formats stay verified. No genuine contrast, opacity, geometry, hit-target, content or focus assertion is discarded.

## Tests added or updated

Quran tests retain exact glyph/word geometry and now finish options teardown before changing OS motion preferences. Phone Mushaf tools are bounded between stationary reachable bars under the approved panel design. Translation alignment measures the printed reading surface separately from its enlargement action. Enlarged Quran coverage waits for its measured ready state and adds a strict top-bound assertion to the existing bottom/overflow/ink checks.

## Commands run

| Check                                         | Result                                                                                                 |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| First complete local gate                     | Passed in 153.2s with an exact-input receipt                                                           |
| Normal pre-push gates                         | Passed; core browser 28/28 in 1.5m, Pages and budget/CSS checks pass                                   |
| First exact-commit CI non-browser and Android | Passed; browser failures correctly block Pages                                                         |
| Repaired Chromium reading cases               | 12/12 pass, including tablet fit, all-word identity, short-surah fit, translation alignment and return |
| Repaired Chromium dropdown/overlay/motion     | 11/11 pass                                                                                             |
| Bilingual custom-date journeys                | 2/2 pass in 31.1s, including enlarged input/axe/focus recovery                                         |
| Menu focus across three engines               | 9/9 pass in 2.2m                                                                                       |
| Press feedback across three engines           | 3/3 pass in 35.3s                                                                                      |
| Archived image regression                     | Pass in 4.6s                                                                                           |

Further affected-engine/Home results and final aggregate/CI/Pages identity remain in execution logs until verification finishes. No failed required gate is accepted for publication.

## Visual/manual evidence

Actual initial integration captures remain in the [coordinated gallery](../evidence/coordinated-release-2026-11-25/README.md); subsequent traces/screenshots use `output/coordinated-*`. Real assistive-technology/device acceptance remains separate.

An isolated guest browser saved **1 / 100** on the existing production release, reloaded it and acquired its service worker with a clean console. This profile is retained for the actual deployed upgrade check; it does not access the owner's signed-in state. A separate verifier checks exact deployed SHA, current notes, PWA/entry assets and every production Umrah pack/image/PDF byte count and SHA-256 after deployment.

## Documentation updated

The final atomic WebKit follow-up passed all six primary motion endpoints and all five English Glass prayer-source cases (11 passing cases in the run). Its one failure was the pre-extraction combined 90-second Home footer journey; scroll stability and disclosure/footer recovery now run independently with all original assertions. The five Arabic Glass prayer cases passed in the earlier bounded run. Repeated rendering contention from other projects on the same machine was observed; no unrelated process was stopped. All source owners are frozen before the next full gate. Subsequent exact local/CI results are recorded in execution logs and the final release handoff.

This report supplements the coordinated phase/report. Fresh **2026-11-26.1** notes contain four newly written entries per language covering the complete not-yet-deployed batch since the successful baseline, with the required archive.

## Decisions recorded

Root owns combined verification, commit and publication. Original Home/reading owners performed explicitly assigned repairs in disjoint files and froze without tests/builds or competing commits. Source-conflicted Learn editions and unreviewed audio remain withheld; no religious source text is changed.

## Known limitations or remaining risks

Release is not accepted until exact-commit Quality/verify, Pages build/deploy and production smoke succeed. Browser results do not establish complete accessibility compliance. Native Java changes require a compatible new Android binary; Pages/OTA cannot update the older host itself.

## Out-of-scope findings

The separate source-audit worktree, original-source reconciliation, unfinished translations, independent named Arabic listening review and physical TalkBack/VoiceOver acceptance remain outside this deployment.

## Recommended next step

Final focused follow-up: all 87 Home Chromium cases are covered by passing results (83 initial passes plus four corrected protected-reference surface cases in 25.8s). All 12 Firefox/WebKit Home follow-ups pass in 5.4m. All 12 Chromium reading cases pass; the wider two-engine run passed 22 cases, then the remaining WebKit short-surah and two panel journeys pass 3/3 in 2.7m. WebKit's intrinsic Arabic-button IntersectionObserver ratio rounded by 1/64px; the regression now checks strict full rectangle containment inside the scrollport, 44px size, actual center hit-testing and keyboard focus alongside unchanged zero-overflow/content assertions. Three focused unit files pass 35 tests. Scoped typecheck and lint pass.

The long bilingual custom-date scenario was extracted into an independent enlarged Custom→Apply→Edit dates test, preserving normal pointer clicks, field access, container→Tab→Close, axe, Escape and opener recovery. Its isolated English WebKit case passes in 19.4s. The preceding long flow exhausted its unchanged 90-second budget before reaching that step. Each prayer's complete source/geometry/checklist assertions now has an independent test, with axe checked for every prayer; all 20 Chromium prayer cases pass in 1.9m. Every endpoint in the motion audit now has an independent fresh page and unchanged deadline/error/probe checks, avoiding intermediate hash-route work immediately aborted by reload. All 36 routes in four language/motion configurations remain. Home scroll coordinate measurement waits for actual re-expansion animations and the exact original document position before comparing the footer. No original assertion, threshold or timeout was weakened. Final inventory and aggregate/CI execution remain required after these final test-only extractions.

Finish affected verification, run the unchanged local gate/hook, push the smallest remediation and follow the complete CI/Pages/production cycle through success.
