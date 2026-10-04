# Phase Report — Essential local testing and quality

## Objective

Improve essential local testing speed, reliability and diagnostics while preserving concurrent application work and every required release gate.

## Scope completed

Plan: inspect the release contracts, configurations, timings and regressions; verify tooling on an isolated checkout of released commit c6effdeb; remove unnecessary setup and duplicate requests; preserve useful coverage; run targeted tooling tests, the complete quality gate, browser matrix and Pages build; transfer only the testing/documentation diff to the primary checkout.

Implementation is local only. Final verification results are recorded below.

## Files changed

- Configuration: package.json, vitest.config.ts, playwright.config.ts, .githooks/pre-push and .github/workflows/quality.yml.
- Tooling: browser-test-port and tests, serve-browser-tests, probe-audio-variants and tests, report-browser-timings and tests, validate-audio-manifest; remove cleanup-test-server.
- Isolation contract: src/test/isolatedSuites.ts and its regression tests.
- Browser regressions: accessibility-new-surfaces, accessibility, settings-experience, search, reader-microinteractions and pwa-update-flow.
- Documentation: README, quality checklist, agent index/test strategy/decision log, Mushaf fidelity checklist, audio QA and this report.

## Components added or modified

No application components. Tooling suites use an isolated Node project without React/jsdom initialization. Existing application isolation and coverage thresholds remain.

## User-visible changes

Developer workflow only: the local smoke covers 24 tests including offline reading/counting; normal bounded workers replace the forced four-worker override. Local browser failures surface immediately, CI rejects focused tests, and all browser attempts appear in diagnostic JSON. CI retains timing artifacts for seven days.

Tests never terminate arbitrary port listeners. E2E_PORT selects a validated unused port with the existing Vite build/preview, launched through Node without shell interpolation. E2E_BASE_URL remains available for an independently managed exact-candidate preview.

The real service-worker update fixture owns a process-specific build directory and an automatically assigned server port. Windows WebKit uses one project worker to limit measured rendering contention; Linux CI keeps its worker allocation. All scenarios and timeouts remain.

Audio validation retains all 251 approved variants and probes their 242 unique URLs once each per run, with four bounded workers. Every variant checks its own expected MIME. HTTP requirements, network retry/backoff and request timeout remain; response bodies are released. No cache carries success across runs, and the full-byte checksum audit remains separate.

## Accessibility work

Preserve all axe, keyboard, contrast, target-size, RTL/LTR and responsive assertions. Replace selected fixed readiness delays with font readiness, visibility or retrying geometry assertions. A missing recordable prayer in the fixed evening fixture now fails rather than silently skipping its scan. No complete accessibility compliance claim.

## Tests added or updated

Seven network-probe regressions cover bounded concurrency, complete request coverage, failures, retries, timeout cleanup, shared-URL deduplication and conflicting metadata. Seven port cases cover defaults, dedicated ports and invalid/shell-like inputs. Three timing-report cases cover nested projects, retry cost, malformed reports and global runner errors. Extend the application registry guard to dynamic mocking, hoisting, unmocking and module resets. Existing offline browser coverage joins the fast gate without duplicating its test.

## Commands run

| Command                                               | Result                                                                                              |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| pnpm install --frozen-lockfile                        | Passed, exit 0; unchanged dependency graph.                                                         |
| pnpm test:run scripts                                 | Initial tooling project: 51 passed in 8.21s, no DOM setup.                                          |
| pnpm test:run scripts src/test/isolatedSuites.test.ts | Intermediate targeted run: 59 passed, exit 0.                                                       |
| pnpm test:run scripts/probe-audio-variants.test.mjs   | Final probe regression suite: 7 passed in 0.592s, exit 0.                                           |
| pnpm test:run scripts/browser-test-port.test.mjs      | 7 passed in 1.08s, exit 0.                                                                          |
| pnpm validate:audio                                   | Bounded probes passed live-host validation, exit 0; repeated as part of final check.                |
| pnpm check                                            | Initial pass: 336.4s, exit 0; serial audio stage took 187.9s.                                       |
| pnpm check:serial                                     | Final implementation: all stages passed, exit 0, 199.7s; unit tests 107.2s, live audio 25.6s.       |
| pnpm test:run scripts/report-browser-timings.test.mjs | Final three cases passed, exit 0, 2.21s.                                                            |
| pnpm test:e2e                                         | Dedicated-port full matrix: 498 passed, one existing skip, exit 0, 38.0m; no retries/flaky results. |
| Targeted Windows WebKit expanded-layout suite         | Final one-worker allocation: three passed, exit 0, 1.4m.                                            |
| Targeted final PWA update-flow suite                  | Two passed, exit 0, 1.3m; real service-worker handover and prompt behavior retained.                |
| pnpm test:e2e:fast                                    | Final command: 24 passed, exit 0, 1.2m, including offline reading/counting/settings.                |
| pnpm build:pages                                      | Passed, exit 0; Pages build, bundle budget and CSS utility checks.                                  |
| pnpm test:e2e --list                                  | 499 tests in 38 files; no scenarios removed.                                                        |
| Fast selection --list                                 | 24 tests in 4 files.                                                                                |
| actionlint .github/workflows/quality.yml              | Passed, exit 0.                                                                                     |
| Affected-file ESLint/Prettier and git diff --check    | Passed, exit 0.                                                                                     |

## Visual/manual evidence

After transfer, targeted tooling/isolation verification in the primary checkout passed: ten files, 68 tests, exit 0, 3.89s. This confirms the tooling and registry guard against the current local checkout; it does not replace application release verification.

Tooling-only change; product screenshots are not required. Browser matrix retains its ordinary captures and automated accessibility evidence. The first full run lost its port-4173 preview: traces identified page.goto connection refusals rather than application assertion failures. Stop that invalid run, retain its error context, and rerun the full matrix on dedicated port 4197. This interruption is not counted as a successful run.

A concurrent quality attempt was stopped after resource contention with browser verification and another session's gate; it is not a pass. The final serial gate ran separately and passed. Full-matrix evidence precedes the final PWA fixture and Windows WebKit allocation changes, which were each verified with their complete affected suites afterward. Timing JSON and WebKit traces are retained under output/testing-quality in the primary checkout. Compared with the initial live audio stage, the final probe stage fell from 187.9s to 25.6s; differing network and machine load mean this is an observed result, not a controlled benchmark.

## Documentation updated

README, quality checklist, test strategy, decision log, agent index, audio QA and this report describe essential change-based checks, timing diagnostics, concurrency and separate-session previews.

## Decisions recorded

Owner requests local testing improvements while editing the application elsewhere. Preserve all useful assertions and gates; remove redundant network work and the unsafe process-killing helper. No application feature removal, dependency change, commit, push or deployment.

## Known limitations or remaining risks

Verification uses the isolated released application plus this tooling diff. Concurrent application edits in the primary checkout are preserved and need their own affected-feature and release verification. The primary checkout does not inherit a quality receipt from the isolated tree. Network timings vary; measured improvements must not be presented as guarantees. Physical-device and human assistive-technology checks remain separate.

Pending owner decision: architecture requires a network-independent local check, while the existing check includes live audio probes. Recommended resolution is deterministic metadata checks locally with all live probes required in Quality CI. This gate-boundary split has not been implemented while that decision is pending; existing live validation remains mandatory.

## Out-of-scope findings

No application changes or reviewed religious content changes. Existing intentionally skipped legacy browser cases are retained; no additional tests are skipped and no assertions or budgets are weakened.

## Recommended next step

Use focused tests while developing, the 24-test smoke and content-bound quality gate before release, and one complete CI release verification. Investigate future timing artifacts before changing test matrix allocation or concurrency.

### Approved release follow-up (2026-10-04)

The owner now authorizes publication and approves resolving the pending local/network contract: pnpm check uses metadata-only validation, and Quality CI requires full hosted probes separately. This supersedes the earlier local-only scope and pending audio-boundary decision in this historical report. See LATEST_CHANGES_RELEASE_REVIEW.md for integrated application verification and deployment results.
