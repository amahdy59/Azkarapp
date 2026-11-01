# Phase Report — Test execution refresh

## Objective

Reduce avoidable test time, update coverage guidance for the new behavior and preserve complete release validation.

## Scope completed

Updated development feature selection and CI scheduling measurements. The existing content-bound quality receipt, frozen install, core smoke, full CI inventory, engine coverage, budgets and deployment dependency remain unchanged. The earlier final check was stopped before editing so it cannot be reused for changed inputs.

## Files changed

scripts/run-feature-browser-tests.mjs and its tests; new update-browser-timing-baseline.mjs and its tests; browser-timing-baseline.json; README, QUALITY_CHECKLIST, agent TEST_STRATEGY/INDEX/DECISION_LOG, phase brief and this report.

## Components added or modified

No application component changes. The refresh utility consumes all nine successful shard reports with exact commit/run provenance, validates completeness/projects/duplicates and includes retry costs. The scheduler still preserves each project/file and every test identity.

## User-visible changes

Development commands now explicitly select Home and reminders, including their new regressions. Shared controls include first-use and compact feedback. CI uses measurements from deployed f496cdf026571e29a4e53e003b6aae24f12bf765, Quality 41307567707, covering 2,615 cases instead of the old 2,098-case baseline.

## Accessibility work

No assertions, accessibility checks, text-size cases, themes, device projects or engine coverage were removed. The behavior-to-test table now distinguishes daily tallies from weekly Al-Kahf/history and optional permissions from browser grants.

## Tests added or updated

Tooling tests prove deterministic aggregation/retry costs and rejection of failed, incomplete, empty, duplicate and missing-project reports. Feature tests prove current Home/reminder/control coverage and argument forwarding. Existing quality-receipt and scheduler/inventory regressions remain.

## Commands run

| Command                                                                                        | Result                                                                                                                                                                                                  |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Download all browser-timings artifacts from Quality 41307567707 and refresh with exact SHA/run | 9 reports accepted; 2,615 measured cases.                                                                                                                                                               |
| Targeted feature/baseline/scheduler/inventory/receipt tooling Vitest suites                    | 24 passed in 5 files.                                                                                                                                                                                   |
| pnpm test:e2e:inventory                                                                        | Passed: 2,675 current identities, each scheduled exactly once across all 9 jobs.                                                                                                                        |
| pnpm test:e2e:feature reminders --list --project=desktop-chromium                              | 26 tests in 4 files selected; no execution or coverage claim inferred from listing.                                                                                                                     |
| Recompute old/new schedules against the refreshed per-file costs                               | Maximum estimated test work reduced from 2,935 to 2,845 seconds for Chromium; 3,429 to 3,357 for Firefox; 4,364 to 4,183 for WebKit. These are modeled work totals, not measured CI wall-time promises. |
| Targeted Prettier and git diff --check                                                         | Passed.                                                                                                                                                                                                 |

Exact-tree final local/CI/production results are retained in the release execution logs. Scheduling data never substitutes for those gates.

## Visual/manual evidence

Not applicable to tooling. Machine-readable proof/schedules are in output/browser-inventory and output/browser-schedule; logs in output/testing-refresh-*. The previous CI source artifacts retain provenance in output/ci-timings-f496cdf0.

## Documentation updated

README and TEST_STRATEGY explain targeted selection, complete CI, honest timing analysis, isolated failure reproduction, bounded local resource use, final source freeze and exact-content receipt reuse. QUALITY_CHECKLIST and phase/decision/index guidance match the current behavior.

## Decisions recorded

Optimize scheduling and duplication, never acceptance. Keep all release gates, assertions, coverage and budgets. Avoid mixing resource-constrained Windows measurements into Linux CI scheduling.

## Known limitations or remaining risks

CI duration depends on runner capacity, network and tests; refreshed estimates cannot promise a fixed speedup. New tests use the scheduler's project-average fallback until a later successful complete CI run supplies measurements. Full physical-device/manual acceptance remains separate from automation.

## Out-of-scope findings

No dependency, workflow matrix, timeout, coverage threshold or bundle ceiling was changed. No successful receipt was fabricated or bypassed.

## Recommended next step

Run the complete final local gate once on the frozen tree, then let exact-commit CI prove the full inventory and deployment. Use the refresh utility after future successful release runs when scheduling data drifts.
