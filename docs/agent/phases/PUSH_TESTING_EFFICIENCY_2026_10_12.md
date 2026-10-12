# Phase Report — Faster push verification, 2026-10-12

## Objective

Make owner-requested push verification faster using actual timings, while preserving all release checks. The preceding application release is deployed and verified at 134a59fd.

## Scope completed

Plan before editing: inspect existing scheduling, local quality receipts, focused selection and complete CI timings; split the measured bottleneck groups, install only required runtimes, fix the focused sharing inventory, prove the complete union, validate serialization/merge and the tracked hook, then measure exact-commit CI and verify Pages.

The preceding complete CI browser run took 832.9 seconds (13.9 minutes), compared with the recorded 37.9-minute older baseline. All 1293 cases remain: zero failures/flakes/run errors and one existing skip. Including setup/artifacts, Firefox's single group took 15m02s, the slower WebKit group 13m54s and Chromium group 13m33s. Native Playwright partitions now schedule Chromium/WebKit three ways, Firefox two ways and responsive Chromium once. Engine installation follows the selected projects. Browser runtime settings, workers, retries, scenarios and timeouts remain unchanged.

Local follow-up: the long-running development server reached 3.3–4.7GiB working set while generated verification outputs changed. Its watcher now excludes the generated root directories without excluding source, public assets, test/tooling files or unrelated projects. A real Vite server watches 73 directories, indexes zero generated-output directories, observes a source-file probe and emits no event for a generated-output probe. Fresh-process RSS was 180MiB; this startup observation is not a steady-state speed guarantee. Build/browser production behavior is unchanged.

## Files changed

scripts/browser-partitions.mjs; browser-engines.mjs and its tests; generated-watch-paths.ts and its tests; development watcher settings in vite.config.ts; focused browser selector and tests; the setup-and-test composite; README, quality checklist, test strategy, decision log/index, this report and the preceding completed release report. No application, religious content, dependency or budget changes.

## Components added or modified

Developer tooling: strict browser-project-to-engine selection; nine complete CI partitions; focused sharing patterns include offline ayah recovery.

## User-visible changes

Shorter complete CI scheduling is the intended outcome. Ordinary local pushes still run frozen install, full quality or the exact-content 24-hour receipt, core smoke and Pages build. Finish documentation before the final quality pass so the hook can reuse it; use affected feature tests during development rather than repeating an unchanged successful full CI matrix.

## Accessibility work

All existing accessibility assertions and projects remain. No new compliance claim.

## Tests added or updated

Engine selection covers the full default, every scheduled runtime, deduplication/mixed projects and rejection of unknown/empty/inherited/injected project names. Focused sharing checks image, offline and refinement inclusion without unrelated settings. Existing inventory guards reject missing/extra/duplicate cases.

Generated-path regression tests cover Unix and both Windows separator forms, directory roots/descendants, source/public/test/tooling preservation and similarly named neighboring project boundaries. A real watcher validates actual event delivery and pruning; no tracked source is modified by its temporary probes.

## Commands run

| Command                                     | Result                                                                                                                                      |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Targeted tooling unit suites                | 11 passed in 0.984s                                                                                                                         |
| pnpm test:e2e:inventory                     | 1293 cases; partitions 187/186/186/146/145/97/97/97/152; no omissions or duplicates                                                         |
| Real split/merge                            | Three native shards passed 1/1 each; actual blob merge passed exact 3-case identity proof, zero failures/flakes/run errors, 18.5s wall time |
| Action syntax / scoped ESLint / diff checks | Passed                                                                                                                                      |
| Tracked release hook                        | Full unchanged hook is required for this tooling commit; final results are retained with release evidence                                   |
| Complete exact-commit CI and Pages          | Required before completion; local receipts are never accepted by CI                                                                         |

## Visual/manual evidence

Watcher follow-up tooling units passed 14/14 in 0.819s, including all prior selection/inventory tests. Actual watcher proof is output/watch-generated-proof.mjs and its captured result; the complete release hook and exact-commit CI remain required. The first scheduling commit ec7001d0 passed the full local hook (check 153.5s, core smoke 26/26, Pages build/budgets); its successor includes the evidence-backed local watcher fix.

Scheduling-only work. Actual mobile/desktop production reader, sharing dialog and complete PNG for the preceding application release are retained under output/production-sharing-review, with metadata proof. Prior merged timing JSON remains in output/testing-efficiency-current.

## Documentation updated

README and quality/test strategy describe the nine-group gate, engine-specific setup and correct use of local receipts. Owner authority is recorded in the decision log/index.

## Decisions recorded

Improve elapsed time through scheduling/setup, not by deleting tests, weakening assertions, increasing timeouts, lowering coverage or replacing the toolchain. This tooling-only release does not need new reader-facing release notes.

## Known limitations or remaining risks

More groups incur additional runner and setup overhead. GitHub queueing, network and load vary, so measured results are not guarantees. Every exact-commit job/report remains mandatory. Physical-device and human assistive-technology review stays separate.

## Out-of-scope findings

The production capture initially used Playwright's standalone 5-second assertion default on a cold network load. It was rerun with the repository's existing 15-second wait and passed the actual reader/dialog/export assertions; no application or test-suite timeout changed.

The split/merge diagnostic initially targeted the development server; its delayed-audio regression intercepts production bundle assets and therefore cannot exercise that boundary on unbundled development modules. All three cases were rerun on the verified production preview and passed unchanged, including delayed loading. Report collection was corrected to copy the three actual blob archives before merging; no test result was fabricated.

## Recommended next step

Use final timings to assess the improvement, then optimize measured expensive scenarios in a separately scoped change if needed.
