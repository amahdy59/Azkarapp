# Phase Report — Navigation flake and browser timings

## Objective

Investigate the retry-success mobile WebKit navigation case and the slowest browser tests, preserving application edits, meaningful assertions and engine coverage.

## Scope completed

Inspected release CI timing evidence, reproduced the slow cases with retained traces, separated independent navigation scenarios, removed repeated non-asserting visual captures, and retained retry-failure traces. Compared affected cases and ran the complete local browser and non-browser gates. Verification used an isolated checkout at released commit 97558839 while the owner edited application files in the primary checkout. Transfer only these six testing/documentation files; no commit, push or deployment while the full browser failure remains unresolved.

## Files changed

e2e/navigation.spec.ts, e2e/practical-devotional-access.spec.ts, .github/workflows/quality.yml, agent test strategy/index and this report.

## Components added or modified

None. No application, content, persistence, localization, dependency or browser matrix configuration changes.

## User-visible changes

None. Navigation tests use returning-guest setup for navigation-specific cases; existing onboarding flows remain exercised separately.

## Accessibility work

Retain every axe, overflow, keyboard/focus, native navigation and sensor disclosure assertion. Chromium retains the twelve language/viewport Home/focus captures; Firefox and WebKit retain all assertions and diagnostic traces.

## Tests added or updated

Separate the original three-viewport navigation test into two independent utility flows and one compact-to-wide/Settings flow. Wait for the sidebar and Quran title before Settings; additionally assert the Settings URL. Separate each language/viewport focus flow after the isolated English baseline also exhausts its cumulative deadline. The same assertions run with independent contexts; remove the now-redundant initial Home activation after returning-guest setup. No timeout, retry, coverage, worker, tolerance or budget changes. Restrict non-asserting duplicate Home/focus screenshot writes to Chromium, removing 24 repeated writes per full run. CI preserves the complete existing test-results artifact even when a retry succeeds, with seven-day retention. Discovery increases from 499 to 521 independent cases in the same 38 files; fast smoke changes from 24 to 26 cases in the same four files. No additional product scenarios or engine allocations are introduced.

## Commands run

| Command                                             | Result                                                                                                                                                                                      |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Download Quality run 37209884747 browser-timings    | Passed; 1202.6s browser wall time, 497 direct passes, one retry-success, one existing skip.                                                                                                 |
| Initial three-case WebKit reproduction with traces  | Three passed, no retries, 213.4s wall time. Navigation 54.1s; Arabic focus 66.7s; English focus 67.3s. Primary checkout became concurrently edited, so comparison is repeated in isolation. |
| pnpm install --frozen-lockfile in isolated checkout | Passed; pinned graph unchanged.                                                                                                                                                             |
| Isolated released-baseline WebKit run               | Failed, exit 1: one passed, two total-deadline timeouts, 295.6s wall time. Navigation 91.2s, Arabic focus 68.1s, English focus 91.5s.                                                       |
| Isolated candidate WebKit run                       | Nine independent cases passed, exit 0, no retries, 194.2s wall time. Navigation total 73.1s; Arabic focus total 42.8s; English focus total 50.7s. Slowest case 37.3s.                       |
| Full local matrix                                   | Exit 1: 519 passed, one existing skip, one untouched Chromium footer startup failure, 36.3m. All changed navigation/focus cases passed across the configured engines; zero retries.         |
| Unchanged failing footer case, repeat-each=3        | Three passed, exit 0, no retries, 1.4m. Case times 11.3s, 10.2s and 7.9s. No footer edits.                                                                                                  |
| pnpm check                                          | Passed, exit 0, 86.5s; build, typecheck, lint, offline audio, format, units with coverage, bundle and CSS gates.                                                                            |
| actionlint Quality workflow / git diff --check      | Passed, exit 0.                                                                                                                                                                             |

## Visual/manual evidence

Ignored JSON reports, trace archives and step summaries live under output/navigation-timing-review. Existing Chromium captures stay under output/playwright/phase78. Test-only work does not establish new manual accessibility or physical-device evidence.

## Documentation updated

This report and the testing strategy describe the diagnosis, capture ownership and retry evidence retention.

## Decisions recorded

The owner authorizes investigating recommendations 1 and 2. Preserve concurrently edited application files and ask before changing them. Changes are limited to testing and diagnostic evidence. Concurrent primary-checkout application edits are excluded from this verification; isolated gate receipts are not transferred or reused for the combined checkout.

## Known limitations or remaining risks

CI's failed attempt exhausted the 90-second total deadline while checking the Settings title; its successful retry took 81.6 seconds. The title mismatch alone is not proof of an application navigation defect. Its trace was not uploaded because the job succeeded. The isolated unchanged baseline reproduced deadline exhaustion at the Settings click and also during the third English focus viewport. Home utility clicks spent 17.1s and 22.3s waiting for visibility/stability checks; they did not spend that time waiting on routing completion. Do not claim a product routing bug was fixed. Timings vary with machine and load; a controlled input comparison still cannot guarantee CI speed.

The full candidate run had one untouched desktop Chromium counter-label test fail at its initial Reader visibility check. The snapshot showed only Loading; its trace records service-worker script requests lasting 15.3–16.2s. The identical case then passed three times without retries or changes. This supports investigating startup/load sensitivity separately, but does not prove its root cause. The full run is explicitly a failure, not replaced by those targeted successes. Preserve its trace/error context under output/navigation-timing-review/full-failure. No application or footer-test remediation is included in this phase.

## Out-of-scope findings

CI aggregate attempt work: desktop Chromium 1683.5s/295 cases; mobile Chromium 346.8s/68; tablet Chromium 387.2s/68; Firefox 261.7s/34; WebKit 787.6s/34. Sum-of-attempt work is not wall time. Largest files: navigation 372.6s, sharing refinement 330.8s, practical devotional access 325.7s, accessibility 306.3s, responsive 247.2s. Distinct engine, theme and responsive assertions remain useful and are not removed based on duration alone.

The isolated targeted comparison is 295.6s (two failing baseline cases) versus 194.2s (nine passing candidate cases), about 34% lower observed wall time. The original primary-checkout reproduction passed in 213.4s, illustrating variability. The full local run lasted 36.3m and must not be compared directly to Linux CI's 20.0m as a speed regression/guarantee. Its slowest remaining case was WebKit offline sharing at 49.3s, followed by tablet-width WebKit utility navigation at 47.2s. No worker or matrix changes are justified by this comparison alone.

## Recommended next step

Use the next complete CI timing report to assess the independent navigation cases. If a retry still occurs, inspect the retained first-attempt trace before proposing an application fix or changing worker allocation.
