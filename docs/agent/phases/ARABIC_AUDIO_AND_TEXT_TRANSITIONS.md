# Phase Report — Arabic audio and reading-text transitions

## Objective

Review the pending sheet, reader-menu and audio changes, repair the approved findings, and make Arabic listening and zikr navigation follow right-to-left reading order. Add a restrained slide of the reading text between entries, preserving stable controls and reduced-motion preferences.

## Scope completed

The initial review found clipped custom-target controls at 200% text size, obsolete Arabic audio-menu selectors, a conflict with the previous physical-LTR audio contract, excessive expanded-player spacing and an overbroad reciter restriction. The user approved repairs and explicitly replaced the audio-direction contract with Arabic RTL. The existing sheet/menu refinements and test-diagnostics changes are included in this release; devotional content and persistence boundaries are unchanged.

## Files changed

- Shared presentation: `ResponsiveSheet`, the new `ReadingTextTransition`, `FloatingAudioPlayer` and its stylesheet, plus the existing sheets for references, Quran word meanings, Mushaf navigation/settings/quick actions, ayah actions, authentic zikr selection, counter keyboard help/targets and prayer actions/virtues.
- Screens: `ReaderScreen`, `CustomCounterScreen`, `FridaySalawatScreen` and the audio settings panel.
- Audio availability: `audioVoices` and its tests. Existing approved Al-Kahf audio remains selectable in the player.
- Regression coverage: component/audio-provider/reader/settings tests; audio, audio layout, counter feedback and reader microinteraction browser specs.
- Existing test-diagnostics work: navigation and practical devotional browser specs, Quality artifact retention, test strategy and its separate phase report.
- Documentation: architecture, design, motion, audio contracts, decision log, phase index, this report and the bilingual release manifest.

## Components added or modified

`ReadingTextTransition` owns only entry-text presence and motion. `SheetHeader` standardizes the existing pending sheet headers. Reader and audio screens continue to own behavior and state.

## User-visible changes

Arabic progress and audio seek fill start at the right. Previous is on the right and Next on the left; skip icons and horizontal seek keys match this direction. English remains LTR. Entry text slides in the navigation direction with a short departure and a decelerating arrival; headers, counter, transport and other controls stay still. Expanded audio begins each new entry at the top. Sheet titles wrap, and enlarged-text custom-target forms scroll instead of clipping their input or Apply action. Unavailable adhkar voices remain unavailable without hiding an approved Quran recording.

## Accessibility work

Respect both app and system reduced-motion settings; preserve canonical Mushaf behavior. Outgoing animated text becomes inert and hidden from assistive technology so old word actions or taps cannot affect the new entry. Preserve keyboard focus and native range semantics, localized names, visible focus rings and 48px sheet close targets. Browser checks cover physical RTL/LTR order, horizontal seek behavior, enlarged text and stable controls. Automated checks and emulated browsers do not establish complete WCAG compliance or replace a physical-device/screen-reader review.

## Tests added or updated

Unit coverage checks direction, reduced motion, inactive departing text, waveform fill, localized seeking, approved reciter availability and resetting the expanded reading region without remounting it. Browser coverage exercises Arabic and English pointer seeking, physical button order, measured text movement, unchanged counter positions, reduced motion, expanded layout and 200% text on a short phone. Arabic reader listening tests now use its permanent dock rather than a removed menu item.

## Commands run

| Command                                                 | Result                                                                                                                                                                     |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Initial review `pnpm check`                             | Passed all 10 stages, 146.2s.                                                                                                                                              |
| Initial focused browser review                          | Failed: 9 passed, 8 failed; five obsolete Arabic menu selectors and three expanded-text gap violations.                                                                    |
| Initial post-repair `pnpm check`                        | Failed: one obsolete physical-LTR audio-provider expectation; 187 files and 1378 tests passed, one test failed. Updated the expectation to the user-approved RTL contract. |
| Intermediate `pnpm check`                               | Passed all 10 stages, 82.1s; superseded by the final snapshot validation.                                                                                                  |
| Focused feature browser run                             | 15 Chromium cases passed, 1.1m, before the final inactive-text/scroll-reset safeguards.                                                                                    |
| Final targeted unit run                                 | Three files, 48 tests passed, exit 0, 8.14s.                                                                                                                               |
| `pnpm install --frozen-lockfile`                        | Passed; dependency graph unchanged.                                                                                                                                        |
| `pnpm audit:prod`                                       | Passed; no known vulnerabilities.                                                                                                                                          |
| Full candidate browser attempts before final safeguards | Intentionally interrupted; these are not successful full-suite results.                                                                                                    |

The application snapshot before the final keyboard-help correction passed `pnpm check`: all 10 stages, exit 0, 225.8s while the browser suite also ran. The combined browser attempt then exposed an obsolete `h2:not(.sr-only)` keyboard-help selector; its trace confirms it waited for a replaced heading. That run was interrupted rather than reported as a pass. The replacement assertion checks the shared title's bounds and non-overlap with Close, preserving all scrolling/focus checks. Keyboard help uses the same constrained flex body as the corrected target forms. The corrected case passed Chromium, Firefox and WebKit: three cases, exit 0, 39.8s. Original failure evidence is preserved under `output/review-keyboard-header-failure`.

The next combined browser attempt exposed three sharing failures waiting for the removed Reader menu action. Ordinary zikr and recipient-link tests now use the permanent share dock, preserving image/download, exact-link and recipient-progress assertions. Long-surah pages have no dock: the focused rerun exposed that genuine access regression, so their menu Share action is restored and covered by unit/browser assertions. The combined attempt was interrupted and is not a passing full-suite result. Traces are preserved under `output/review-share-menu-failure`.

After the final keyboard-help correction, four targeted unit files passed all 56 tests, exit 0, 8.44s. The long-surah access fix passed all 16 reader unit tests, exit 0, 6.49s, and the five focused sharing cases passed, exit 0, 48.5s, including Chromium, Firefox and WebKit single-zikr sharing.

The completed combined `pnpm test:e2e` run failed, exit 1: 525 passed, one existing skip, one mobile WebKit failure, 27.3m. All new/changed feature cases passed across their configured profiles. The unchanged Arabic counter-restoration case failed its immediate geometry measurement after reload: expected 50% visible fill, measured zero. Trace DOM shows the restored 50/100 accessible value and `--progress-ratio: 0.5`; its last painted frame is still Loading. The counter component, fill helper/CSS and failing spec have no diff. This suggests startup/render timing but does not establish the root cause or a passing suite. Preserve complete results, trace and error context under `output/review-webkit-progress-failure`; do not replace the full failure with targeted results. Push/deployment is held for the user decision required by the repository stop condition for an ambiguous pre-existing failure.

Final application-snapshot `pnpm check` passed all 10 stages, exit 0, 79.5s. No commit or push was made. This report-only result annotation follows that gate; a later push must validate its exact final snapshot through the tracked hook.

The owner then authorized diagnosing and repairing the WebKit failure. A standalone WebKit probe measured the correct restored 50% fill on 24 reloads. The unchanged failing case passed five isolated repeats, exit 0, 34.9s. These results support timing sensitivity rather than a persistently wrong restored value; they do not prove the precise engine mechanism. The assertion now checks the restored CSS ratio and polls the same 50% geometry requirement at precision 2, reading both rectangles in one browser evaluation under the existing 15-second assertion timeout. No application state, persistence or counter rendering code changed for this repair. The synchronized Arabic/English cases passed three repeats each in Chromium, Firefox and WebKit: 18 passed, exit 0, 1.9m. Full-suite verification is repeated on the combined final candidate.

The final combined `pnpm test:e2e` run passed, exit 0: **526 passed, one existing skip, no failures, 25.3m**. All five configured profiles completed without retries. This complete run resolves the earlier failed candidate; the earlier trace remains preserved. `git diff --check` and release-note freshness checks passed. The tracked pre-push hook validates the exact committed snapshot with frozen install, complete non-browser checks, the fast browser suite and Pages build. Commit/push, CI and production verification are reported in the release handoff in chat so this report does not claim future workflow results.

## Visual/manual evidence

### CI verification follow-up

The first pushed candidate, `97597028`, passed the tracked hook: frozen install, all 10 `pnpm check` stages (82.7s), 26 fast browser tests (1.2m), and Pages build. Quality run `37227314886` subsequently reported 524 passed, one flaky, one failed and one existing skip (19.5m). Deployment correctly did not proceed. Failure logs, all-attempt traces and the timing report were downloaded under `output/release-rtl-ci-failure` and `output/release-rtl-ci-timings`.

The failed prayer-info screenshot ran immediately after a desktop-to-phone resize. `ResponsiveSheet` switches between Radix modal and Vaul drawer at 600px; the old desktop node detached during screenshot capture on all three CI attempts. The browser test now waits for the expected drawer/modal branch before measuring each viewport and capturing the returned phone surface. Overflow, keyboard disclosure, screenshot and focus-restoration assertions remain intact.

The English WebKit counter test briefly measured 49% immediately after count 50, before its painted transform caught up with the CSS ratio. Its post-click geometry now samples both rectangles in one browser evaluation and waits under the existing 15-second assertion timeout. The same 50% precision and starting-edge checks remain intact. The already-synchronized reload check is retained. No application code, prayer calculations, persistence, dependencies or test coverage changed in this follow-up.

The repaired cases passed three repetitions: 21 passed, exit 0, 2.8m across Chromium, Firefox and WebKit. A full combined browser run is required before the remediation push; its result and subsequent CI/deployment verification are recorded in the chat release handoff. The release notes still describe the application changes awaiting their first successful deployment; this test-only remediation adds no reader-facing notes.

The first follow-up full run exposed a timing gap in the new Arabic animation probe: its frame recording began after the click and two assertion round trips, which could miss the complete short slide under suite load. That failed run was stopped after the failure was identified. The probe now records frames before input, requires an actual transform greater than one pixel, waits for the final resting transform, and cleans up its frame callback. Control-position, RTL direction, keyboard focus and reduced-motion assertions are retained. Ten Arabic/English repetitions passed, exit 0, 1.1m. The complete suite is restarted on the final test snapshot; earlier failed/interrupted results are not counted as a passing gate.

A restarted shared-checkout run hit two page-load timeouts before reading controls appeared and was stopped. Inspection found a separate active audio browser-test process and preview using the same `.playwright-dist`; its run also replaced `test-results` before the failure evidence could be copied. Concurrent audio implementation edits remained uncommitted. Release verification was moved to the managed `rtl-release-verification` worktree, based on `97597028`, with only these three browser-test repairs and this report applied. Its build/output directories and frozen dependency install are independent. No concurrent edits or tests were overwritten, and the interrupted shared-checkout run is not a passing gate. Final results and release outcomes are recorded in the chat handoff.

The final isolated `pnpm test:e2e` completed successfully: 526 passed, one existing skip, no failures, exit 0, 28.9m. The report is `output/ci-repair-isolated-full-results.json` in the release worktree. `git diff --check` and release-note freshness checks passed. This final report annotation is followed by the tracked hook's exact-snapshot gates; the successful unchanged browser suite does not need to run again solely because the verified changes are committed.

The first remediation push was stopped by six quality-receipt unit-test failures: the temporary Git fixture inherited the worktree push hook's `GIT_DIR`, so its `git init` targeted the parent repository instead of its temporary directory. A direct run passed six tests; reproducing with the hook Git directory failed all six. The unsafe fixture changed the shared repository's `core.bare` setting to true; it was restored to false immediately, and status/history remained available in both checkouts. The fixture now clears the repository-local variables listed by `git rev-parse --local-env-vars` with reversible Vitest environment stubs. A regression verifies the temporary repository's actual root and that the parent stays non-bare. This changes only tooling tests; the application and browser-test inputs remain unchanged from the successful full suite. The tracked push hook is rerun without bypassing or fabricating any receipt.

Ignored artifacts under `output/playwright/`: the initial and corrected custom-target 200% screenshots, plus `review-text-slide-ar.png` and `review-text-slide-en.png`. The full candidate browser JSON report is `output/release-rtl-e2e-results.json`. Browser motion checks sample actual frame transforms and compare control positions; screenshots alone do not verify animation.

## Documentation updated

Current audio architecture and QA instructions now use the approved locale-aware timeline contract. The design system and motion document record the text-only animation, direction and reduced-motion behavior. Architecture records component ownership; the agent index links both phase reports. Release notes contain four corresponding user outcomes in Arabic and English, with a new release stamp.

## Decisions recorded

`DECISION_LOG.md`: Arabic listening direction and reading-text transitions, 2026-10-04. This explicitly supersedes the earlier physical-LTR audio decision and records the user's approval to repair and release the reviewed changes.

## Known limitations or remaining risks

The separate navigation-timing report preserves its isolated baseline/startup failures and does not substitute targeted reruns for a successful combined full suite. No thresholds, browser coverage, assertions, bundle budgets or dependencies were weakened. Physical iOS/Android testing and a fresh screen-reader session are outside the available local evidence.

## Out-of-scope findings

None added to application scope. Existing test timing and first-attempt trace retention work is documented in `NAVIGATION_FLAKE_AND_BROWSER_TIMINGS.md`.

## Recommended next step

Review RTL listening and the restrained text transition on a physical phone with Arabic text sizing and assistive technology, and inspect the next CI timing report for any retained retry traces.
