# Phase Report — Latest changes and testing release review

## Objective

Review and release all pending application and testing changes with essential local verification, preserving useful coverage and obtaining approval before altering owner edits.

## Scope completed

Inspect the combined diff and contracts, validate the sources, obtain the required owner decisions, apply approved corrections, verify targeted tests and the full browser matrix, refresh release notes, and publish through the tracked release hook and mandatory CI. Local review and repairs are complete. Push/deployment results are reported with exact commit and workflow links in the task's final release response.

## Files changed

Application: AuthenticZikrPicker, ReferenceCard/ReferenceCopyButton, ReaderReferenceSheet, FloatingAudioPlayer/AudioVolumeControl/styles, audio voice labels/tests, authenticAzkar, bilingual UI copy, Category/Reader/Masbaha/Salawat screens and affected tests.

Testing: package scripts, Vitest/Playwright configuration, pre-push hook, setup-and-test composite, Quality artifact retention, Node audio/port/timing helpers and regressions, browser server/PWA fixture ownership, isolation guard, accessibility/search/reader/picker/footer readiness tests. Remove cleanup-test-server, which terminated arbitrary port listeners.

Documentation: README, architecture/design/quality contracts, audio QA/architecture, agent decision log/index/test strategy/fidelity checklist and phase reports. Release notes use four parallel Arabic/English entries and stamp 2026-10-04e.

## Components added or modified

ReferenceCard unifies existing devotional reference presentation. AuthenticZikrPicker uses the existing shared radio-item menu. No runtime dependencies or toolchain replacement. Existing normalization, persistence, offline reading and audio ownership remain.

## User-visible changes

Concise Masbaha labels retain full text and existing save/reset switching confirmation. Reference cards share presentation, retain source-only citations and expose corrected supporting references. Shorter sharing/playback labels preserve accessible descriptions. English audio displays English Translation; source metadata retains the original narrator identity. The header shows queue position; current/total repetition progress remains in the footer, including embedded counts.

## Accessibility work

Preserve keyboard, axe, contrast, geometry and target-size assertions. Picker tests cover arrow focus, activation, Escape cancellation and focus restoration. Arabic fallback narration and English citations have independent accurate language/direction. Scoped copy feedback remains. Review narrow/enlarged player screenshots and Arabic enlarged Reader captures. Automated checks do not certify physical-device or assistive-technology compliance.

## Tests added or updated

Add source-only citation, independent citation language and two reviewed-reference regressions. Preserve repetition/completion assertions and verify repetition progress is outside header identity. Add real-catalog no-fetch CLI coverage and unknown-option rejection. Tooling regressions retain network concurrency, timeout/retry, deduplication, MIME, timing diagnostics and validated ports. Full hosted recording checks remain required in Quality CI; local pnpm check now validates metadata without network access.

## Commands run

| Command                                   | Result                                                                                                                                               |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| git fetch origin                          | Passed; pre-release main and origin/main match c6effdeb.                                                                                             |
| pnpm install --frozen-lockfile            | Passed; dependency graph unchanged.                                                                                                                  |
| Initial pnpm check                        | Failed in 78.9s: 1360 unit passes, three stale/missing player assertions. All other stages passed.                                                   |
| Targeted approved runtime/tooling suites  | Six files, 63 passed in 6.89s, exit 0.                                                                                                               |
| ReferenceCard language regression suite   | Six passed in 3.44s, exit 0.                                                                                                                         |
| Picker browser coverage                   | Chromium, Firefox and WebKit: three passed in 40.9s, exit 0.                                                                                         |
| pnpm check after approved repairs         | All stages passed in 81.0s, exit 0; enforced coverage and budgets retained.                                                                          |
| pnpm validate:audio                       | Full hosted validation passed: 254 zikr instances, 165 assets, 196 approved mappings.                                                                |
| pnpm audit:prod                           | Passed; no known vulnerabilities found.                                                                                                              |
| pnpm check:release-notes                  | Passed, refreshed four bilingual notes.                                                                                                              |
| actionlint Quality workflow               | Passed.                                                                                                                                              |
| Affected-file Prettier / git diff --check | Passed.                                                                                                                                              |
| Full browser matrix                       | 496 passed, one existing skip, two failed in 25.4m. Both failures read a previous rendered state; fixes and affected-spec verification follow below. |

The initial browser investigation was stopped after approved runtime fixes made its preview stale; it is not a passing run. The subsequent full matrix completed. Search captured desktop input bounds before mobile controls settled: now wait for the responsive controls and read both bounds in one browser task, with the same assertions and a bounded retry. WebKit captured the old 49% counter immediately after clicking to 50%: now assert rendered count and fill ratio before the unchanged geometry measurement. No tolerance or timeout ceiling was raised. Every matrix case remains enabled; only the existing intentional skip remains.

## Visual/manual evidence

Evidence under output/release-review includes reviewed narrow/enlarged player captures and failure traces. Full final-candidate timing JSON is output/e2e-final-release.json; affected readiness verification is output/e2e-readiness-repair.json. The earlier isolated tooling report is historical; this release review verifies the combined application checkout.

## Documentation updated

Contracts describe menu selection, footer repetition position, accurate source metadata and deterministic local audio validation with mandatory live CI probes. Essential local testing report retains its historical results and explicitly records the later publication/split approval.

## Decisions recorded

The owner authorizes pushing all pending changes, superseding local-only scope. The owner explicitly approved footer repetition progress separate from header queue position, the two source-reference corrections, Reader citation fallback, voice label/test/source metadata and documentation fixes, and offline local validation with mandatory hosted CI verification. Retain all useful assertions, coverage thresholds, bundle budgets and reviewed wording/counts.

## Known limitations or remaining risks

Network and machine timings vary; observed speed differences are not controlled benchmarks. Manual assistive-technology and physical-device checks remain separate. CI always verifies the complete matrix for the exact release commit; it does not reuse local receipts. The hook only reuses a recent identical input snapshot and reruns quality when final report/test inputs change.

## Out-of-scope findings

The forgiveness narration matches [Bukhari 6405](https://sunnah.com/bukhari:6405), whereas its new link originally opened [Muslim 2692](https://sunnah.com/muslim:2692), a different morning/evening report. The four beloved phrases and Samurah narration match [Muslim 2137a](https://sunnah.com/muslim:2137a), whereas the proposed citation/link used [Muslim 2695](https://sunnah.com/muslim:2695), a different report. Both references are corrected with owner approval. Arabic/English wording and counts are preserved.

Other supporting meanings were compared against their linked [Bukhari 6682](https://sunnah.com/bukhari:6682), [3293](https://sunnah.com/bukhari:3293), [6384](https://sunnah.com/bukhari:6384), [6307](https://sunnah.com/bukhari:6307), [6306](https://sunnah.com/bukhari:6306), [Muslim 408](https://sunnah.com/muslim:408) and [2726a](https://sunnah.com/muslim:2726a). These are supporting excerpts/English meanings, not a claim to reproduce each full report verbatim.

## Recommended next step

Use focused unit/browser checks during development and the 24-case smoke for release preparation. Keep one mandatory complete CI verification per application release, and inspect timing artifacts before adjusting concurrency or matrix allocation.

### Readiness repair verification

The complete affected search/footer specs passed all 23 tests in 2.7 minutes, exit 0, across their existing Chromium/Firefox/WebKit allocation. The full-matrix failures and their traces remain recorded; CI will run every case against the final commit. No runtime changes followed the full browser sweep.
