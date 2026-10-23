# Duration-balanced browser scheduling

Quality keeps nine jobs and all five existing device/engine projects. `scripts/browser-timing-baseline.json` records per-project/file totals from the clean 2,098-case report for run 39146690337 (commit e84435b0). Durations include every recorded attempt; that baseline has no retries.

`pnpm test:e2e:inventory` collects the current complete inventory, estimates each file's cost from its recorded mean per test and current case count, and assigns descending costs to the least-loaded eligible job. Whole files remain together, preserving serial suites and shared hooks. New files receive their project's mean per-test cost (5 seconds if no project history exists). Unknown projects and empty selections fail closed. Removed files in the baseline cannot enter a selection.

Generated lists live in `output/browser-schedule/`; summary.json records estimated aggregate durations and counts. Actual Playwright `--list --test-list=...` selections must match the full inventory exactly once. This uses the [documented test-list CLI](https://playwright.dev/docs/test-cli#test-list), with project/file selectors independent of source line numbers. No test is skipped to improve scheduling.

Checks uploads the verified lists and full inventory together. Each browser job downloads its exact list, installs only its existing engines and runs all selected cases with unchanged assertions, workers and retries. Verify still requires every blob report and an exact merged inventory match before deployment. The local full-suite command remains unchanged.

Refresh the baseline only from a complete, successful merged CI report: use `summarizeBrowserTimings` from `scripts/report-browser-timings.mjs`, aggregate its test durations and counts by project/file, and retain the source commit/run. Confirm every baseline case is represented, run scheduler tests and the inventory gate, and review the estimated per-engine spread. Historical aggregate estimates do not prove elapsed speedup; runner provisioning, worker contention and browser startup remain separate costs.
