# Phase Report — Measured testing efficiency, 2026-10-11

## Objective

The owner asks why browser verification takes so long and requests faster, more efficient testing. The application release at `1e94e83e` already passed full Quality, Pages build/deploy and exact-commit live/offline smoke. Stop redundant local reconfirmation and improve scheduling without lowering quality.

## Plan before editing

Inspect actual timings and release contracts; add explicit feature selection and browser/file timing totals; distribute the complete CI inventory across parallel Linux runners; prove an exact disjoint inventory; exercise real report splitting/merging; run the unchanged tracked push gates; measure full CI and verify deployment.

## Scope completed

The prior full CI browser run took 37.9 minutes. Its 220 WebKit cases consumed 2,606.7 seconds of test time, Chromium 2,246.0 seconds and Firefox 1,289.7 seconds. Windows WebKit uses one worker under the existing contention contract. The redundant final local rerun was stopped at case 983 after the owner requested efficiency. It had one 90-second English listening timeout at final re-expansion; the same exact-commit case passed CI. Its trace remains diagnostic evidence, not a full-suite pass.

Four generic shards put every WebKit case in the last shard. Instead use six partitions defined once in `scripts/browser-partitions.mjs`: Chromium 244/243, Firefox 220, WebKit 110/110 and responsive Chromium 148. The union is exactly all 1,075 existing cases, without omissions, additions or duplicates. The workflow obtains its matrix from that same validated schedule.

## Files changed

Quality workflow and setup composite; package scripts; ignored blob reports; feature selection, inventory verification and timing scripts/tests; README, quality checklist, test strategy, decision log, index and this report. No application implementation, reviewed content, dependency graph or browser runtime configuration changes.

## Components added or modified

Developer tooling only. Existing Playwright projects, workers, retries, test/assertion timeouts, scenarios, accessibility assertions, coverage thresholds and bundle ceilings remain unchanged.

## User-visible changes

Named development commands select reader, Quran, audio, Settings, sharing, offline or persistence specs, with ordinary Playwright filters. CI performs non-browser quality once, then runs six browser jobs. The final `Quality / verify` job requires every job and report, merges results and preserves timing/failure evidence. Pages still requires successful exact-current-main Quality.

## Accessibility work

All existing keyboard, axe, target-size, theme, direction and enlarged-text checks remain in the inventory. No complete manual accessibility claim.

## Tests added or updated

Inventory tests reject omissions, substitutions, duplicates, empty and malformed identities. Feature selection tests cover explicit scope, forwarded filters and invalid/prototype names. Timing tests cover per-browser/per-file aggregation and retained retry cost. Real browser shards test serialization and merged results with existing persistence assertions.

## Commands run

| Command                               | Result                                                                                               |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Targeted tooling units                | 10 passed in 0.869s.                                                                                 |
| `pnpm test:e2e:inventory`             | Passed: 1,075 cases; partitions 244, 243, 220, 110, 110, 148. No browsers or preview builds started. |
| Feature persistence Firefox inventory | Passed: 18 cases in two applicable cross-browser files.                                              |
| `actionlint`                          | Passed on Quality workflow.                                                                          |
| Scoped ESLint                         | Passed.                                                                                              |
| Browser split/merge and release gates | Final results retained in `output/TESTING_EFFICIENCY_REPORT_2026_10_11.md`.                          |

## Visual/manual evidence

Real split/merge regression: the existing forced-no-lifecycle counter cases passed in Chromium/Firefox (two cases, 1.0m) and WebKit (one case, 41.6s). GitHub/JSON reporters merge all three correctly, with zero run errors. Separate sequential local runs validate serialization; they are not a parallel speed benchmark. The merged CI inventory must also match every required test identity exactly once.

Tooling-only change; production screenshots from the completed application release remain in `output/playwright/consolidated-production-*.png`. Baseline CI JSON is in `output/testing-efficiency-ci-baseline/`. Keep timing comparisons as observed results rather than guaranteed runtimes.

## Documentation updated

README, quality checklist, test strategy, index, decisions and this phase report explain explicit feature selection, the complete parallel CI gate and avoidance of repeated unchanged full local matrices.

## Decisions recorded

The owner requests efficiency while preserving the completed release. The existing autonomous main release authority applies. CI-only scheduling/reporting changes use exact inventory and real split/merge validation locally, plus the complete CI suite; broad application/browser-runtime changes still warrant full local verification. Tooling-only deployment has no new reader-facing release notes.

## Known limitations or remaining risks

Parallel runners trade additional setup/artifact overhead and runner minutes for lower elapsed time. Queueing, network and runner load vary. Explicit feature selection is not an automatic dependency-coverage guarantee. Three baseline CI cases passed on retry; traces and retry costs stay visible. Physical-device and human screen-reader checks remain separate.

## Out-of-scope findings

No replacement test framework, runtime dependencies, weakened tests, content edits or arbitrary process termination.

## Recommended next step

Use merged timings to prioritize the most expensive scenarios and investigate repeat flakes. Optimize measured setup/rendering work rather than removing useful assertions.
