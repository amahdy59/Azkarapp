# Phase 88 — Mushaf listening and reviewed timing support

Owner approved applying the three listening recommendations and explicitly chose “No timestamps—build the review-ready system”.

## Scope and plan

Reuse the existing page canvas for read-only listening to Al-Baqarah, Al-Kahf, As-Sajdah and Al-Mulk. Carry reviewed page boundaries and recording identity through playback. Use Amiri Quran for explicitly identified Unicode Qur'an passages. Add checksum-bound, reviewed verse/word timing validation, quiet highlighting and optional following with manual browsing control. Ship no invented timings and keep unavailable alignment clearly explained. Preserve the single audio controller, reviewed text, reading progress and offline fallback.

Validate metadata and alignment rejection, seeking and gaps, page navigation and keyboard controls; run repository quality and browser gates, record visual evidence, update release notes and complete the authorized main release.

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
- Release: three parallel Arabic/English entries in `public/release-notes.json`, stamp `2026-10-08.2`.

## Components added or modified

Added QuranListeningReader and the read-only MushafListeningPage adapter. Modified the existing page canvas and floating player without adding a runtime dependency or another audio element. Page loading goes through the existing content/font domain loaders.

## User-visible changes

The four full-surah recordings can display printed Mushaf pages, browse manually and recover from an offline page-data failure using the unchanged reviewed Unicode text. Matching QCF glyphs/fonts use the existing bounded Unicode fallback. Quran passages use Amiri Quran independently of the selected zikr font. Paper honors Mushaf theme and text scale; selected surah boundaries start in view. Following is visibly unavailable until independently reviewed exact-recording annotations exist.

## Accessibility work

Native controls retain 44px targets, visible focus and localized labels. Arabic paper declares RTL direction and Arabic language independently of interface direction. Visual paper is accompanied by semantic Arabic verse text. Reviewed cues use a margin marker, quiet aria-current and optional word underline/outline; text is never a word-by-word live region. Following starts off, never moves focus, uses instant scrolling and pauses for manual page browsing, wheel/touch or keyboard scrolling. Loading and retry errors are announced separately from sacred text. Automated scans and emulated keyboard evidence do not establish complete WCAG conformance or physical assistive-technology results.

## Tests added or updated

Synthetic test-only annotations cover exact recording identity, independent review, complete ordered verses, gaps, end-exclusive boundaries, seeking, word bounds and duplicate rejection. Cue tests cover native clock sampling and hidden-tab cancellation. Component tests cover manual control, optional words, following, focus preservation, source replacement and offline recovery. Twelve browser checks cover all four surahs across Chromium, Firefox and WebKit: English-interface RTL word positions, font fallback, sticky controls, initial boundary visibility, offline retry, one audio controller, unchanged reading progress, collapse/reopen and axe scans. Existing Mushaf and player regressions retain their assertions.

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

## Visual/manual evidence

Browser screenshots in `output/playwright/quran88/final-browser/` cover all four pages at 390px and 320px across Chromium, Firefox and WebKit. `output/playwright/quran88/controls-qcf-final.png` records the loaded Al-Kahf QCF page and retained unavailable-alignment explanation. Manual browser inspection confirmed `qcf-v2-page-293`, RTL direction and the Next control's actual pointer target. Visual review corrected the paper's stacking over sticky controls and retained the unavailable explanation in that area; regressions check positions and pointer hit testing. The complete local run passed. Hook, CI and production results are recorded after the authorized push in `output/phase88-release-verification.md`. Human screen-reader and physical-device checks remain outstanding; no such results are claimed.

## Documentation updated

The timing guide defines exact-byte matching, source provenance, a different human reviewer, semantic word positions, complete verse coverage, silence gaps and release evidence. Architecture/design contracts document one native media clock, lazy read-only paper, explicit Quran typography, quiet cues and offline recovery. The original proposal now links to implementation and preserves the timestamp review boundary.

## Decisions recorded

DECISION_LOG records approval of all three recommendations and the owner's explicit choice to ship a review-ready system without timestamp data. Mulk gains its missing structural 67:1–30 range from the already reviewed complete-surah asset. Text, source attribution, reciter and recording bytes remain unchanged.

## Known limitations or remaining risks

No production recording has reviewed verse/word timestamps. The annotation catalog intentionally remains empty, so automatic following and learner word emphasis are not yet enabled. Phrase looping requires separately reviewed phrase boundaries and is outside this phase. Collapsing/reopening resets manual page browsing while audio continues. Printed pages may include adjacent-surah text. Structural validation cannot replace listening review. Manual assistive-technology checks remain necessary.

## Out-of-scope findings

The prior hand-icon/search fixes shipped separately in phase 87. No persisted schema, progress, prayer behavior, reviewed religious text or audio bytes changed. Four unrelated owner text files remain untouched and untracked.

## Recommended next step

Annotate and independently review verse intervals for one exact approved recording, exercise the authoring validator and real-recitation browser/assistive-technology checks, then enable verse following. Optional word alignment follows a complete semantic-word review; phrase practice remains a separate approved step.
