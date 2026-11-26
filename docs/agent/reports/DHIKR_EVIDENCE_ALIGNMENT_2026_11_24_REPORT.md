# Phase Report — Dhikr evidence alignment

## Objective

Review dhikr wording, repetitions, benefits, context and supporting narrations. Implement demonstrated mismatches under the owner's explicit exact-source decision.

## Scope completed

Screened all 257 collection records, nine Masbaha entries and the separate Benefits evidence/derived-benefit catalogue. Corrected 37 collection identities, including paired morning/evening entries. The audit ledger identifies every effective bilingual record and its fingerprint, findings, source-probe provenance and suspended audio assignments. Screening is not a claim that every narration has received independent scholarly approval.

## Files changed

Content: azkarCore, azkarIds, comprehensiveDuas, fastingRamadan, contentReview, reviewedCollectionCitations and attributionArabic. Audio: audioAssignments, ownerTimingPreviews and its content-addressed preview pack. Tests: content evidence/citations/localization, counter restoration, playback, sharing totals and browser evidence/audio integrity. Documentation: content authoring, decision log, phase/index, predecessor audit and new audit ledger. Release notes describe this release only.

## Components added or modified

No visual component added or changed. Existing reader, reference sheet, counter, state normalization and strict recording-matching boundaries remain authoritative.

## User-visible changes

- Hundredfold tahlil stays at 100. Its morning evidence now includes the omitted hundred-good-deeds and hundred-sins clauses. Ten freed slaves is its reward, not its recitation count.
- The day/night dominion dua shows Abu Dawud 5084 instead of the unrelated Ibn Masud narration.
- Exact selected routes replace mixed quotations and narrator/citation pairs. Benefits retain meal, night-waking, morning/evening and other source conditions.
- Unsupported numerical prescriptions are removed; repentance uses the reported hundredfold target. The doubled fasting response is counted as one phrase twice.
- The evening-only threefold refuge step leaves the morning routine. Its legacy ID remains resolvable; history is not rewritten.
- Eight changed-text recording assignments are suspended pending independent recording review. Nine stale estimated timing candidates are removed; all remaining 276 retain their original intervals and provenance. The three-recitation repentance recording is play-once because it cannot reach exactly 100.

## Accessibility work

Arabic grading translations remain complete. Bilingual evidence retains existing scrolling, dismissal and keyboard focus return. Automated browser evidence does not establish human assistive-technology acceptance.

## Tests added or updated

Added full-inventory fingerprints and explicit source/count/condition assertions, legacy partial/completed-count restoration tests and twelve bilingual, three-engine browser cases. Updated historical citation invariants to require a documented successor correction. Recording tests explicitly verify suspensions and exact-count playback behavior. Audio integrity verifies that the changed dua remains readable without stale recording/cues.

## Commands run

| Command                                         | Result                                                                                                                                                                                   |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pnpm install --frozen-lockfile                  | Passed; 756 packages, pinned pnpm 11.19.0                                                                                                                                                |
| Targeted content/counter/audio/sharing units    | 81 passed in 9 files                                                                                                                                                                     |
| Targeted grading/Home reading units             | 37 passed in 3 files                                                                                                                                                                     |
| Historical audit tooling test                   | 2 passed                                                                                                                                                                                 |
| pnpm typecheck                                  | Passed                                                                                                                                                                                   |
| pnpm validate:audio:local                       | Passed: 257 instances, 166 assets, 192 mappings                                                                                                                                          |
| node scripts/validate-owner-timing-previews.mjs | Passed: 276 candidates, 234 recordings, 88,527 compressed bytes                                                                                                                          |
| Three-engine evidence browser spec              | 12 passed                                                                                                                                                                                |
| Corrected Friday audio suspension browser case  | 1 passed in Chromium                                                                                                                                                                     |
| Initial pnpm check                              | Failed on stale timing previews, formatting, grading translations and historical reference checks; targeted remediations above pass. Subsequent full pnpm check passed in 265.4 seconds. |

| Final pnpm check | Passed: all stages, including enforced coverage and bundle budgets |
| Audio integrity and offline browser specs | 14 passed in Chromium |
| pnpm test:e2e:inventory | Passed: 3,350 cases, each assigned once |
| pnpm audit:prod | Passed: no known vulnerabilities |

## Visual/manual evidence

Fresh screenshots retained under output/playwright/dhikr-evidence were visually inspected. Browser tests capture both evidence sheets in Arabic and English and verify Escape focus recovery in all three engines. Physical device, full recording listening and human screen-reader review remain outstanding.

## Documentation updated

Phase brief, content-authoring contract, decision log, active index and traceable audit ledger. Prior October findings and hashes are retained as history rather than presented as current approval.

## Decisions recorded

Owner chose exact sourced wording/counts with audio/progress checks. Grading disagreement remains distinct from source mismatch. Permanent identities and recorded history remain stable.

## Known limitations or remaining risks

This is a coding-agent comparison, not independent scholarly endorsement or a guarantee of perfect religious accuracy. Some remote source downloads were rate-limited; the ledger distinguishes available dated snapshots from unverified probes. Contextual variants and interpretation still benefit from qualified human review. Suspended recordings need independent review or replacement before reactivation. No new approved recording or timing was fabricated. Local quality and selected browser checks pass. Exact-commit CI, deployment and production checks remain pending at this pre-push checkpoint.

## Out-of-scope findings

Unrelated Qibla/download changes in the original shared checkout were preserved. This phase uses an isolated worktree.

## Recommended next step

Integrate the local branch with the owner’s concurrent changes; obtain qualified content/recording review for remaining contextual variants and suspended audio. The owner controls publication.

## Pre-push environment remediation

The first push was correctly blocked by find-unused-css.test.mjs: inherited Git hook variables pointed its temporary fixture at the parent repository. The fixture now clears Git-reported repository-local variables for every child command and runs both ordinary and simulated-hook cases. Targeted result: 2 passed. No application assertions or quality thresholds were removed. The next push must pass the complete hook again.

## Owner publication hold

The owner explicitly prohibits pushing this batch on 2026-11-24 while other elements are being modified. Neither attempted push reached the remote: origin/main remains be3146ac. Continue local verification only. The inherited-hook fixture had also set the shared Git core.bare option to true through git init; restored it to false after confirming this ordinary worktree configuration. The isolated fixture fix prevents that mutation. Final proofreading also corrects the crescent supplication’s imperative vocalization and transliteration to the selected Tirmidhi wording.

## Final local handoff

- Final pnpm check passed in 216.6 seconds, including unit coverage, formatting, lint, types, content/audio/timing checks, build and budgets. Log: output/content-audit/final-check.log.
- Final pnpm build:pages passed; Home startup measured 520,058 gzip bytes against the unchanged ceiling (2,414 bytes above the recorded baseline).
- Core smoke: 27 passed; the remaining reset case exposed its obsolete 25-item expectation. Updated to the source-correct 24 steps, preserving the exact zero-total and modal assertions. Its targeted rerun passed (1 test); formatting and ESLint for that spec also passed.
- Prior feature verification: 12 bilingual evidence cases across three engines, 14 Chromium audio/offline cases and 4 retained screenshot captures passed. Screenshots were visually inspected.
- No changes were pushed and no CI/deployment or production acceptance is claimed. The owner will integrate this isolated local branch with concurrent work and publish later. Refresh combined release notes before that publication.
- Eight changed-text recording assignments remain deliberately unavailable pending independent review. Remaining source-probe limitations are recorded in the audit; do not describe this screening as independent scholarly approval or guaranteed perfection.
