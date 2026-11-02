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
