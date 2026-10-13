# Phase Report — Canonical Surah magnification and recovery

## Objective

Apply the owner's screenshot correction: magnification grows Quran letters rather than merely spreading lines; Al-Kahf, As-Sajdah and Al-Mulk preserve canonical page and line identity in reading and listening. Complete the approved reliability recommendations through scoped verification and the existing release authority.

## Plan and scope

Stage 1: repair proportional printed-page magnification, reuse the canonical fifteen-slot page in continuous surah listening, exclude adjacent surahs without changing source tokens, and verify font growth, line identity, native panning, following, offline fallback and responsive screenshots.

Stage 2, after Stage 1 verification: inspect cold-start loading and chunk-failure recovery; make only evidence-supported loading/recovery changes. Add a bounded deployment-candidate retry retaining successful exact-current-main Quality. Exercise long-session navigation/counting/playback and large-history persistence; record measured findings rather than speculative refactoring. Expand the physical-device accessibility/comfort checklist without claiming unavailable human/device evidence.

Keep these stages reviewable. No dependency, source wording, timing, prayer calculation, persistence schema, sync or budget replacement. Existing user authorization supersedes the earlier flowing long-surah and height-only magnification presentation. A canonical enlarged line needs horizontal panning; fitting it to the same narrow width would cancel its letter growth.

## Files changed

MushafPageViewer, QuranSurahListeningReader and QuranListeningReader tests; scoped magnification/listening CSS; ScreenFallback and new tests; Arabic/English copy; audio-surah-stream, mushaf-magnification, quran-translation, startup-performance and new long-session browser coverage; verify-pages-candidate script/tests and Pages workflow; architecture/design/audio contracts, decision log/index/device checklist, release notes/history and this report.

## Components added or modified

MushafPageCanvas, MushafListeningPage, QuranSurahListeningReader and scoped magnification CSS. No new rendering system.

## User-visible changes

Proportional enlarged pages preserve canonical lines and permit native panning. Continuous listening retains its complete surah, independent playback controls and manual-browse recovery. Al-Kahf opens at its own heading; paired English and enlarged Arabic retain independent bounded scrolling. A sustained loading screen offers localized safe refresh after 15 seconds without automatically reloading or resetting state. Deployment retries delayed Quality visibility while retaining exact-current-main enforcement, including a final SHA recheck after approval.

## Accessibility work

Keyboard-reachable enlargement regions, retained explicit sizing/reset, original semantic verse text, RTL/LTR and reduced motion. Physical Android/iOS and TalkBack/VoiceOver verification remains pending human access.

## Tests added or updated

Canonical slots and selected-surah isolation in units; restored real font-growth assertions, unchanged line content and native horizontal/vertical scrolling in browser checks. Sustained loading/Arabic announcements/timer cancellation; bounded deployment wait and changed-main/API-failure rejection; 20 repeated count/navigation cycles, single reading-node ownership and reload durability with 505 input history entries normalized to the newest 500. Heap/node samples are diagnostics, not a physical-session leak certificate.

## Commands run

| Command                                                             | Result                                                                                   |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Focused QuranListeningReader/MushafPageViewer/MushafPageFrame units | 45 passed, 4.50s                                                                         |
| Initial typecheck                                                   | Passed                                                                                   |
| Recovery/history/listening unit subset                              | 60 passed, 13.89s                                                                        |
| Final recovery/listening unit subset and typecheck                  | 22 passed, 7.11s; typecheck passed                                                       |
| Deployment candidate units                                          | Final 5 passed, 359ms                                                                    |
| Initial corrected magnification/listening cross-browser matrix      | 24 passed / 6 WebKit post-reset geometry diagnostics; 10.5m                              |
| WebKit Al-Mulk reproduction after settling geometry                 | Passed, 1.2m; unchanged geometry limits                                                  |
| Actual QCF-font screenshot capture                                  | 3 passed, 1.6m                                                                           |
| Browser inventory                                                   | 1,354 cases; 194/193/193/156/155/104/104/103/152; no omission/duplication                |
| Release archive/freshness                                           | Passed; 2026-10-13, three fresh bilingual notes                                          |
| Final browser geometry, quality and release                         | Recorded on completion in output/playwright/canonical-surah-zoom/RELEASE_VERIFICATION.md |

Diagnostic corrections: the first width/height change still restarted fitting against a fitted frame; retaining the normal fit across zoom restored actual proportional font growth (Al-Kahf 17.3386px to 26.2156px at 150%). Initial standalone mobile reproduction then passed all steps through 200%. Screenshot inspection found Al-Kahf's preceding empty slots; revealing its own heading repaired entry without changing slots. WebKit required settling post-reset and target-page fitting before comparing paint-only word-highlight geometry; the same 0.05px comparison remains. A broader diagnostic found translation displaced by outer opening scroll: paired/enlarged reading now uses the bounded Arabic pane. That stale-build diagnostic was stopped after the failure was understood; retained traces are under final. The updated proportional-page contract replaces the old requirement that an entire enlarged heading/line fit simultaneously with measured horizontal panning and unchanged content. An English pane fixture initially used only RTL-negative scroll offsets; it now verifies panning for either actual direction. No clipping, accessibility, coverage, content or bundle limit was relaxed.

## Visual/manual evidence

Owner's three screenshots inspected. Real QCF captures are under output/playwright/canonical-surah-zoom/primary-font-verified for each surah at 100%/150%; all three page fonts were verified qcf-v2 before capture. Al-Mulk normal-size reference was displayed in chat. The initial optional capture bound localhost differently from 127.0.0.1; connection-refused diagnostics under primary-font are invalid product evidence, corrected by explicitly binding the preview. Browser matrix screenshots retain Unicode fallback, 320px, desktop, English and 200% text evidence. Final production references are recorded after deployment.

## Documentation updated

This report, architecture, design system, audio architecture, decision log, agent index and expanded physical-device/accessibility checklist. Current rendering requirements supersede the older flowing-surah/extra-leading descriptions. Release notes/history describe only this release.

## Decisions recorded

Owner explicitly requests actual font enlargement and invariant page line counts and approves the five follow-up recommendations. Complete main/Pages release authority remains.

## Known limitations or remaining risks

Canonical lines require panning at large magnification. Unicode preserves token and line placement but cannot reproduce page-specific QCF artwork. Automated browser results do not establish physical-device comfort, thermal performance or screen-reader speech.

## Out-of-scope findings

No reviewed religious content or recording changes. History was already capped at 500 and chunk rejection already had safe retry; these protections are verified rather than replaced. No broad startup speedup is claimed: a concurrent six-times CPU/200kB/s diagnostic measured the first Home frame at 7,330ms; contention makes comparison to the prior 5,757ms run unsuitable for a causal performance claim. Recovery is improved; initial loading graph optimization and physical long-session profiling require separate evidence. Human device/screen-reader rows remain pending because no physical-device session is available here.

## Recommended next step

Finish each scoped stage and verification, then complete exact-commit Quality/Pages and production smoke.

## Exact-commit CI remediation

Commit 56f214f0 passed its complete local quality gate and hook but did not deploy. Quality run 38311846248 completed with three Al-Kahf combined-scenario timeouts (Chromium English; WebKit Arabic/English), two flaky results and one existing skip. Failed browser jobs and verify logs were inspected; Pages correctly skipped deployment. The full archive/trace evidence lives under output/playwright/canonical-surah-zoom. Trace action timings show widespread 5–10-second operation delays in the overlong combined geometry, zoom, following, offline, axe and resize scenario. Split that sequence into separately verified playback, magnification and responsive cases, keeping all languages/engines, assertions and the 90-second timeout. Batch the same per-page fifteen-slot checks to avoid repeated browser round trips. New magnification fixtures wait for all canonical columns before capturing source lines; the first draft captured an empty array before page data resolved and is retained as a failed diagnostic.

The CI flake on stopping surah playback exposed the existing fixed 50ms focus-return guess. ReaderScreen now restores focus after audioModeActive commits false and a frame clears expanded-player inert containment, canceling on unmount; a delayed-commit regression passes with the Reader audio suite, 22/22 in 8.83s. An unrelated Home reminder assertion compared decorative QCF glyphs before/after a late font load; compare the same complete semantic source/citation while excluding aria-hidden artwork. The narration equality assertion remains exact. Neither change edits content, timing, persistence or reviewed sources. Expanded browser inventory has 1,390 cases, with unchanged complete-engine release enforcement. Fresh release notes include safe audio-stop focus recovery. Final remediation/local/CI/production outcomes are recorded in the linked verification artifact; none of these pending outcomes is claimed passed here.
