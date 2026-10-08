# Phase 88 — Mushaf listening and reviewed timing support

Owner approved applying the three listening recommendations and explicitly chose “No timestamps—build the review-ready system”.

## Scope and plan

Reuse the existing page canvas for read-only listening to Al-Baqarah, Al-Kahf, As-Sajdah and Al-Mulk. Carry reviewed page boundaries and recording identity through playback. Use Amiri Quran for explicitly identified Unicode Qur'an passages. Add checksum-bound, reviewed verse/word timing validation, quiet highlighting and optional following with manual browsing control. Ship no invented timings and keep unavailable alignment clearly explained. Preserve the single audio controller, reviewed text, reading progress and offline fallback.

Validate metadata and alignment rejection, seeking and gaps, page navigation and keyboard controls; run repository quality and browser gates, record visual evidence, update release notes and complete the authorized main release.

Owner screenshot follow-up: supersede the pending release with compact page controls and on-demand alignment information. Remove the scrolling viewport's top padding for Mushaf playback so text cannot appear above its toolbar. Reuse existing icons/Popover and preserve 44px keyboard targets, truthful unavailable alignment, exact text, audio and progress. Verify RTL/LTR, 320px, scrolling hit tests, popover focus/escape and page browsing; rerun affected browser/quality/Pages gates and complete final exact-commit CI and production checks.

## Objective

Apply the three approved Quran listening recommendations while respecting the owner's choice to build a review-ready system without timestamps.

## Scope completed

Reuse the shared Mushaf canvas inside expanded Baqarah, Kahf, Sajdah and Mulk playback. Carry reviewed ranges, page boundaries and exact recording checksums through the existing audio plan. Give explicitly identified Quran passages dedicated typography. Implement validated verse cues, optional word emphasis and optional following, with an empty production timing catalog and clear unavailable state.

## Files changed

- Audio: `audioTypes`, `buildPlaybackPlan`, `resolveAudioAsset`, `audioAssetsCore`, `AudioProvider`, new `quranTimings` and regression tests.
- Presentation: `FloatingAudioPlayer`, `MushafPageViewer`, new `QuranListeningReader`, `ReaderScreen`, `App`, content presentation metadata, types and Arabic/English i18n.
- Hooks: new `useListeningMushafPage` and `useQuranPlaybackCue` with cue regression tests.
- Validation: `scripts/validate-quran-timings.mjs`, `scripts/run-checks.mjs`, isolated test registration and `e2e/quran-listening.spec.ts`.
- Documentation: architecture, design system, content authoring, agent index/decisions, this phase, original synchronization proposal and new timing authoring guide.
- Release: three parallel Arabic/English entries in `public/release-notes.json`, stamp `2026-10-08.4`.

## Components added or modified

Added QuranListeningReader and the read-only MushafListeningPage adapter. Modified the existing page canvas and floating player without adding a runtime dependency or another audio element. Page loading goes through the existing content/font domain loaders.

## User-visible changes

The four full-surah recordings can display printed Mushaf pages, browse manually and recover from an offline page-data failure using the unchanged reviewed Unicode text. Matching QCF glyphs/fonts use the existing bounded Unicode fallback. Quran passages use Amiri Quran independently of the selected zikr font. Paper honors Mushaf theme and text scale; selected surah boundaries start in view. A compact 44px toolbar gives more space to the Quran; unavailable-following guidance opens from its information button. Scroll clipping prevents text appearing above the toolbar. Following controls appear only when independently reviewed exact-recording annotations exist.

## Accessibility work

Native controls retain 44px targets, visible focus and localized labels. Arabic paper declares RTL direction and Arabic language independently of interface direction. Visual paper is accompanied by semantic Arabic verse text. Reviewed cues use a margin marker, quiet aria-current and optional word underline/outline; text is never a word-by-word live region. Following starts off, never moves focus, uses instant scrolling and pauses for manual page browsing, wheel/touch or keyboard scrolling. Loading and retry errors are announced separately from sacred text. Automated scans and emulated keyboard evidence do not establish complete WCAG conformance or physical assistive-technology results.

## Tests added or updated

Synthetic test-only annotations cover exact recording identity, independent review, complete ordered verses, gaps, end-exclusive boundaries, seeking, word bounds and duplicate rejection. Cue tests cover native clock sampling and hidden-tab cancellation. Component tests cover manual control, optional words, following, focus preservation, source replacement and offline recovery. Twenty-four browser checks cover Arabic and English interfaces for all four surahs across Chromium, Firefox and WebKit: English-interface RTL word positions, font fallback, sticky controls, initial boundary visibility, offline retry, one audio controller, unchanged reading progress, collapse/reopen and axe scans. Existing Mushaf and player regressions retain their assertions.

## Commands run

| Command                                         | Result                                                                                                                                                   |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focused seven-file unit run                     | 113 passed, 22.31 seconds; additional clock/reader rerun passed after native-clock refinement                                                            |
| `pnpm check`                                    | Passed all stages, coverage and unchanged bundle ceilings on the final implementation; 173.6 seconds, exit 0 (`output/phase88-check-final-snapshot.log`) |
| Targeted existing/new browser specs             | 39 passed across three engines, 2.5 minutes (`output/phase88-targeted-browser-final.log`)                                                                |
| Final feature browser run                       | 12 passed across Chromium, Firefox and WebKit at 390px and 320px, 1.3 minutes, exit 0 (`output/phase88-final-feature.log`)                               |
| Isolated investigation of four earlier failures | Eight checks passed, 41.8 seconds (`output/phase88-failure-diagnosis.log`)                                                                               |
| `pnpm audit:prod`                               | Passed: no known vulnerabilities                                                                                                                         |
| Complete `pnpm test:e2e`                        | 735 passed, one existing skip, zero failures, 36.7 minutes, exit 0 (`output/phase88-full-release.json`)                                                  |

The earlier full run produced 731 passes, one existing skip and four failures. Concurrent browser invocations rebuild the same `.playwright-dist`, and three failures showed missing lazy-loaded sections or root loading errors. All four scenarios passed in isolation. That run and interrupted intermediate snapshots are superseded by the successful final isolated full run; it is not recorded as a pass. No assertion, retry policy, timeout, coverage threshold or bundle ceiling was weakened.

The first push was blocked before transmission: Pages CSS measured 28,676 gzip bytes against the unchanged 28,672-byte ceiling. Reusing the existing 4px margin-marker width utility removed the new width rule; `pnpm build:pages` then passed at 28,672 gzip bytes. The affected three-engine suite passed again: 12 tests, 1.3 minutes (`output/phase88-budget-feature.log`). The full run above precedes this isolated marker-width adjustment; CI exercises the final exact commit. No budget or baseline was raised. The next attempt was correctly blocked by release-note freshness after the remediation commit; all three entries were rewritten for the complete still-undeployed phase and the stamp advanced to `2026-10-08.4`. Neither blocked push reached origin. The pre-push hook passed frozen install, the full check in 60.7 seconds and 26 smoke tests in 1.0 minute before identifying the Pages failure.

Owner screenshot follow-up: 37 component tests passed (4.92 seconds, `output/phase88-compact-units.log`); all 24 Arabic/English listening browser tests passed across three engines (2.4 minutes, `output/phase88-compact-feature.log`). Tests cover a 48px maximum default toolbar, on-demand guidance, focus restoration, Escape, scrolling hit tests, 320px and axe scans. Screenshots were copied to `output/playwright/quran88/compact-browser/`. Prior full-suite results precede this scoped follow-up; final exact-commit CI must pass before deployment. The previously pushed Quality run 37781666055 was cancelled to supersede that layout before deployment.

Timestamp investigation checked QUD v3.2.0's 69-recitation catalog without finding either current reciter. Exact semantic transcript/reference preparation for four variants is saved under `output/quran-alignment-preparation/`. The timing guide records a Mulk-first forced-alignment workflow and the machine's missing inference stack; no model inference or timestamp review is claimed.

The additional expanded-player layout and Baqarah audio regressions passed: 19 checks across three engines (`output/phase88-compact-regressions.log`). The first invocation stopped before executing tests because the owned manual preview occupied its port; the isolated 4174 rerun is the recorded result.

The compact snapshot also passed `pnpm check` in 69.8 seconds (`output/phase88-compact-check.log`) and `pnpm build:pages` (`output/phase88-compact-pages.log`), retaining every existing gate and budget. Actual Arabic QCF screenshots at 390px are `compact-ar.png`, `compact-ar-scrolled.png` and `compact-ar-info.png` under `output/playwright/quran88/`. These confirm the compact toolbar, scrolled clipping and disclosed explanation with the real recording.

## Visual/manual evidence

Browser screenshots in `output/playwright/quran88/final-browser/` cover all four pages at 390px and 320px across Chromium, Firefox and WebKit. The original `output/playwright/quran88/controls-qcf-final.png` prompted the owner screenshot correction; compact-layout evidence supersedes its bulky guidance. Manual browser inspection confirmed `qcf-v2-page-293`, RTL direction and the Next control's actual pointer target. The screenshot follow-up moves guidance into a keyboard-accessible popover and removes the viewport top slit; regressions check positions and pointer hit testing. The complete local run passed. Hook, CI and production results are recorded after the authorized push in `output/phase88-release-verification.md`. Human screen-reader and physical-device checks remain outstanding; no such results are claimed.

## Documentation updated

The timing guide defines exact-byte matching, source provenance, a different human reviewer, semantic word positions, complete verse coverage, silence gaps and release evidence. Architecture/design contracts document one native media clock, lazy read-only paper, explicit Quran typography, quiet cues and offline recovery. The original proposal now links to implementation and preserves the timestamp review boundary.

## Decisions recorded

DECISION_LOG records approval of all three recommendations and the owner's explicit choice to ship a review-ready system without timestamp data. Mulk gains its missing structural 67:1–30 range from the already reviewed complete-surah asset. Text, source attribution, reciter and recording bytes remain unchanged.

## Known limitations or remaining risks

No production recording has reviewed verse/word timestamps. The annotation catalog intentionally remains empty, so automatic following and learner word emphasis are not yet enabled. Phrase looping requires separately reviewed phrase boundaries and is outside this phase. Collapsing/reopening resets manual page browsing while audio continues. Printed pages may include adjacent-surah text. Structural validation cannot replace listening review. Pages CSS is at the existing gzip ceiling; further styling must reuse or simplify existing rules. Manual assistive-technology checks remain necessary.

## Out-of-scope findings

The prior hand-icon/search fixes shipped separately in phase 87. No persisted schema, progress, prayer behavior, reviewed religious text or audio bytes changed. Four unrelated owner text files remain untouched and untracked.

## Recommended next step

Annotate and independently review verse intervals for one exact approved recording, exercise the authoring validator and real-recitation browser/assistive-technology checks, then enable verse following. Optional word alignment follows a complete semantic-word review; phrase practice remains a separate approved step.

## Exact-commit CI follow-up

Quality run 37786730447: 746 browser tests passed, one existing skip and one failed Linux/WebKit synthetic update-deferral test after all retries (33.4 minutes). Trace responses show the mocked future-release-a/503 manifest was replaced after reload by the real 2026-10-08.4 manifest. A controlling service worker bypassed page.route, as documented by Playwright. Scope: block workers only in the synthetic manifest describe group and explicitly await the simulated 503 response. Preserve every original deferral, navigation, focus and new-release assertion; run the separate real service-worker update-flow and offline specs as evidence. No production update-deferral logic is changed. This test-only repair is isolated from the newly authorized phase 89 authoring work. The release remains pending exact-commit CI and production verification.

The corrected synthetic-manifest cases passed all six Arabic/English cases across Chromium, Firefox and WebKit (1.0 minute). A fresh complete local browser suite, including real service-worker update handover and offline reading, is required before the test-only remediation push. Its final results and exact-commit CI/Pages/production checks are recorded in the release verification evidence.

### Remediation verification

The unchanged full browser sweep completed with 744 passed, one existing skip and three Windows WebKit screenshot timeouts (compact-prayer English theme sweep and the two situational-material screenshots). All three retained their assertions and passed on an isolated rerun after local model inference was stopped: `3 passed (2.7m)`. The six synthetic update-manifest cases passed in all three engines; `pnpm check` passed in 115.6 seconds. No screenshot/test timeout, assertion, coverage threshold or bundle ceiling was changed. The full sweep and failed artifacts are retained under `output/phase88-remediation-full.*`; isolated recovery is `output/phase88-remediation-resource-recheck.log`. Exact-commit CI remains the final full-suite release gate. The fixture repair changes only synthetic network interception; real service-worker update coverage is unchanged.
