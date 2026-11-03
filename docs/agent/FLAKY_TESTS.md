# Browser retry and flake ownership

A product defect is a reproducible behavior failure. A flake is an inconsistent result on the same exact candidate and environment; a passing retry does not establish its cause. Keep both in release evidence, and never skip, weaken or remove an assertion to silence either.

For each incident record: exact commit, Quality run/job, project/test, every attempt and duration, trace/screenshot, reproduction command, suspected cause, owner and follow-up status. Do not label an uninvestigated failure “flaky”. Confirmed product regressions belong in the active phase’s defect list; unresolved intermittent failures remain here even when CI retries pass.

Current intake: inspect the browser timing reports from successful Quality 41335950799 (4b620316) during this phase. The phase report records discovered retry identities separately from current application defects. CI remains responsible for the complete inventory and exact-commit release gate. Refresh Linux scheduling weights from all nine successful reports, including retry cost; do not mix local Windows timings.

Physical-device accessibility and notification-delivery acceptance are separate missing evidence, not flaky tests.

## 2026-11-02 final-touch local diagnostics

The initial diagnostic candidate (HEAD 44b56ec0 plus the recorded local work) timed out in Firefox `offline-downloads.spec.ts` Arabic/820/1 waiting for the compact audio region, and WebKit `navigation-motion.spec.ts` English/OS reduced motion waiting for stable sidebar actionability. Preserve `output/final-touch-quality/browser-checkpoint.json` and its traces. Later candidate attempts/results are recorded in `browser-final.json` and the generated phase report; a later pass alone does not establish the cause. Do not skip, weaken or add automatic retries for either identity. The chart/form/focus failures alongside these were distinct reproducible development defects with focused corrections, retained in the same evidence history.

## Successful-run retry intake

2 retried test identities were found in the nine reports (including any passing retry). These are investigation records, not assumed product defects.

| Project             | Test                                                                                                             | Attempts                                             | Status                                                     |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------- |
| mobile-webkit-smoke | reading-preference-polish.spec.ts:190 — short Reader recovers every action at 320x480 and 2x text @cross-browser | failed (18368ms), passed (3277ms)                    | Uninvestigated CI retry; retain trace in the run artifacts |
| mobile-webkit-smoke | audio-control-lock.spec.ts:4 — audio control lock en @cross-browser                                              | failed (22691ms), failed (23070ms), passed (12486ms) | Uninvestigated CI retry; retain trace in the run artifacts |

## 2026-11-02 audio pre-release review

Quality 41351970594 / 44b56ec0 repeated the existing WebKit short-Reader 320×480/200% identity: the full-viewport counter assertion reported a viewport ratio of 0.176 after focus recovery; the retry passed. This is a visibility/focus-recovery failure, not a counter-click failure (corrects the abbreviated generated release summary). Keep the original full-viewport assertion; do not treat the green retry as a root-cause repair. Current audio work does not change the Reader shell. Include a targeted mobile-WebKit reproduction and retain its result in the audio phase report. Physical keyboard/assistive-technology acceptance remains separate.

## 2026-11-03 combined release diagnostics

Exact commit ba6277fb, [Quality 41543882687](https://github.com/amahdy59/Azkarapp/actions/runs/41543882687). Full results and failed-job logs are preserved locally in output/narrow-tabs-release/ci-timings, ci-retries.json and ci-*.log; the run retains traces/screenshots in each browser-failure-evidence artifact. All nine failing browser jobs and the aggregate verify failure were inspected.

| Project               | Identity                                                                                                                              | Every attempt                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| desktop-firefox-smoke | audio-control-lock.spec.ts:4 — audio control lock ar @cross-browser                                                                   | failed (26119ms), passed (12092ms)                |
| mobile-chromium       | accessibility.spec.ts:194 — search results expose concise accessible names                                                            | timedOut (90784ms), passed (3754ms)               |
| mobile-chromium       | accessibility.spec.ts:212 — library filtering announces the collection result count                                                   | timedOut (91238ms), passed (4816ms)               |
| mobile-webkit-smoke   | audio-continuity.spec.ts:12 — listening controls, queue and saved position ar-1440 @cross-browser                                     | failed (44049ms), passed (40605ms)                |
| mobile-webkit-smoke   | home-clarity.spec.ts:77 — @cross-browser bounded prayer hierarchy ar at 320px                                                         | failed (5654ms), failed (4728ms), passed (8997ms) |
| mobile-webkit-smoke   | sharing-board-layout.spec.ts:44 — sharing board layout keeps real previews, optional design and precise feedback in ar @cross-browser | timedOut (91232ms), passed (87645ms)              |

Owner: current release agent. Library search probes now await the compact trigger instead of racing mount. Prayer footer checks await measured content fit after font reflow before retaining the same complete containment checks. Audio hold timing previously installed a clock that kept advancing during runner/screenshot work: the repair pauses it and advances only explicit hold intervals, retaining exact halfway/cancellation assertions. WebKit Arabic audio-lock also failed cancellation on the original run (job 125615843545); local Firefox/WebKit AR/EN reproductions passed before this timer correction. Queue Escape and the sharing-board timeout remain unproven causes: a passing retry is not a repair. Retain their unchanged interactions/assertions and exact-commit CI results. Local commands and durations are recorded in the phase report/evidence logs.
