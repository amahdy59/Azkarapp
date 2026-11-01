# Browser retry and flake ownership

A product defect is a reproducible behavior failure. A flake is an inconsistent result on the same exact candidate and environment; a passing retry does not establish its cause. Keep both in release evidence, and never skip, weaken or remove an assertion to silence either.

For each incident record: exact commit, Quality run/job, project/test, every attempt and duration, trace/screenshot, reproduction command, suspected cause, owner and follow-up status. Do not label an uninvestigated failure “flaky”. Confirmed product regressions belong in the active phase’s defect list; unresolved intermittent failures remain here even when CI retries pass.

Current intake: inspect the browser timing reports from successful Quality 41335950799 (4b620316) during this phase. The phase report records discovered retry identities separately from current application defects. CI remains responsible for the complete inventory and exact-commit release gate. Refresh Linux scheduling weights from all nine successful reports, including retry cost; do not mix local Windows timings.

Physical-device accessibility and notification-delivery acceptance are separate missing evidence, not flaky tests.

## Successful-run retry intake

2 retried test identities were found in the nine reports (including any passing retry). These are investigation records, not assumed product defects.

| Project             | Test                                                                                                             | Attempts                                             | Status                                                     |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------- |
| mobile-webkit-smoke | reading-preference-polish.spec.ts:190 — short Reader recovers every action at 320x480 and 2x text @cross-browser | failed (18368ms), passed (3277ms)                    | Uninvestigated CI retry; retain trace in the run artifacts |
| mobile-webkit-smoke | audio-control-lock.spec.ts:4 — audio control lock en @cross-browser                                              | failed (22691ms), failed (23070ms), passed (12486ms) | Uninvestigated CI retry; retain trace in the run artifacts |
