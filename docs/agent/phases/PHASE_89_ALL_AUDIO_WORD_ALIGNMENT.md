# Phase 89 — Arabic and English listening word alignment

Owner instruction on 2026-10-08: generate timestamp support for all audio, not only Quran, including English narration, so listeners can see the words being read. This is a separate phase after the compact Quran listening release in phase 88. No additional planning gate was requested.

## Scope and plan

1. Inventory every approved recording and its actual transcript source. Deduplicate exact SHA-256 identities, preserve existing reciters, recording bytes, source attribution, repetitions and Arabic/English playback isolation. Initial inventory: 253 approved variants, 243 unique recording checksums, approximately 4.70 hours before deduplication. Check English shared-wording differences and orphan/duplicate catalog records explicitly.
2. Build repeatable offline authoring utilities that verify exact bytes and transcript identities, reuse cached audio/model results, and generate draft word intervals with uncertainty and coverage reports. Use an isolated local Python inference environment outside the app dependency graph. Reuse the existing development Chromium decoder when possible. No cloud upload or runtime speech/alignment service.
3. Pilot a short Arabic zikr, an English narration and Al-Mulk before running the complete inventory. Align supplied text rather than replacing reviewed text with recognition output. Long recordings need bounded overlapping acoustic windows and trustworthy anchors; never divide duration evenly. Embedded repetitions map repeated spoken occurrences to stable display-word identities.
4. Extend exact-recording timing validation and lazy loading to ordinary Arabic and English text. Bind annotations to both recording SHA and the displayed transcript identity. Keep Quran semantic word coordinates/QCF rendering; preserve exact ordinary text, punctuation, spacing, language and direction. Unreviewed, partial, mismatched or unavailable annotations must not create false highlights.
5. Add calm word emphasis with a non-color indicator, optional following that yields to manual scrolling, no focus movement or word-by-word live announcements, and the same single native audio clock. Preserve offline reading, text resizing, keyboard use, theme contrast and reduced motion.
6. Provide a concrete review package for every processed recording, including failed/uncertain cases, audio provenance, raw model evidence and editable draft boundaries. A different qualified human reviewer signs off timings before registering approved production annotations. Existing content review and phase 88 independent timing review remain authoritative; generated model output cannot approve itself.
7. Test recording/transcript rejection, gaps, seeking, repetitions, queue/voice changes, Arabic/English word rendering, manual scrolling and offline data failure. Run targeted tests, full local browser verification for the expanded scope, repository quality/Pages gates, release notes, then the authorized exact-commit CI/deployment/production cycle.

## Affected implementation

Audio timing domain and validators, existing recording/content registries as read-only authoring sources, playback identity propagation, existing media-clock hook, expanded player and reusable listening text presentation, localization, authoring scripts/tests, domain contracts and phase evidence. No prayer, persistence, reviewed religious wording, router or runtime dependency changes are planned.

## Known review boundaries

English source metadata currently stores the Arabic canonical segment transcript rather than a dedicated English spoken transcript. Some shared Arabic identities have multiple reviewed English renderings; do not silently choose or rewrite them. Model/recording comparison and explicit review are needed to identify which displayed wording is actually spoken. Approved catalog records with no current assignment are inventory findings, not inferred playback assignments. Opening letters, introductions, basmalah, omissions, repetitions and phrase grouping need explicit review. Phrase ranges may be derived only from reviewed groupings of reviewed word intervals.

## Progress

Implementation and the isolated authoring environment are complete. All 243 unique recordings (253 approved variants) have checksum-verified local originals; three additional URLs sharing recording identities were verified separately. Corrected PCM duration metadata totals approximately 3.90 hours of unique audio. Pipeline version 3 generation is running; final coverage is recorded separately in `output/phase89-alignment/coverage.json`. No generated annotation has been independently approved or registered.

## Objective

Provide exact-recording Arabic/English word highlighting and an efficient, reviewable timestamp authoring pipeline for the entire approved audio inventory, retaining the Quran font/layout and existing offline experience.

## Scope completed

Shared timing validation, lazy annotation loading, the native playback clock, exact displayed-word rendering, optional highlighting, spoken-language presentation, immutable optional offline timing cache, inventory/download/alignment/review/registration/reporting utilities. Original recordings, reviewed content, playback assignments and persisted data are unchanged. Twenty-three evening WAV duration fields now match PCM frames and browser decoding; the audio manifest cache version remains 8 to preserve saved downloads.

## Files changed

Audio domain: `listeningTimings`, `listeningTimingLoader`, `reviewedTimingFiles`, recording duration metadata. Presentation: `FloatingAudioPlayer`, `QuranListeningReader`, `ListeningWordText`; hooks: `useReviewedListeningTiming`, `useListeningWordCue`. Build: `vite.config.ts`, timing validators and quality orchestration. Authoring: inventory, verified recording cache/aliases, Python alignment and its isolated requirements/tests, local review UI/server, proposed registration and coverage reporting. Documentation: decision log, index, audio architecture and word alignment guide; current-release notes.

## Components added or modified

`ListeningWordText` preserves exact text and stable word nodes. Existing players consume reviewed annotations through the shared timing hooks. A separate localhost authoring UI supports transcript selection, editable boundaries, explicit omissions and independent review export.

## User-visible changes

Reviewed recordings can highlight their spoken words in Arabic or English; listeners can turn emphasis off without interrupting playback. English narration presents English first. Reviewed Arabic narration can reveal Arabic automatically while respecting explicit hide/show choices. Evening recording duration displays are corrected. The deployed initial catalog contains no reviewed timings, so these controls remain conditional; generation alone does not activate highlights.

## Accessibility work

Underline/outline supplement color; current words use `aria-current`. No per-word live announcement or playback-driven focus movement. Stable DOM word nodes preserve reading position. Existing font roles, direction, text resizing and reduced-motion behavior remain intact. Highlight actions retain ordinary target sizes and pressed state. Review words support a roving keyboard target and bounded scrolling. Automated and manual evidence does not establish complete WCAG compliance.

## Tests added or updated

Exact recording/transcript/reviewer/date/coverage checks; interval gaps and ends; repetitions and reviewed omissions; byte-digest and offline rejection; stale load/voice handling; native-clock updates; exact Arabic/English text and stable DOM; spoken-language ordering and explicit Arabic visibility; Quran emphasis defaults and opt-out. Inventory tests reject inconsistent deduplication metadata. Standard-library authoring tests cover CTC collapse and Arabic/English anchor normalization.

## Commands run

| Command                                        | Result                                                                                               |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `pnpm test:e2e`                                | 747 passed, 1 existing skipped; 41.0 minutes before final refinements                                |
| Five affected audio browser specs, all engines | 82 passed; 5.4 minutes after duration/presentation refinements                                       |
| Word rendering/player unit tests               | 36 passed after stable DOM refinement                                                                |
| Timing/loader/clock/Quran/input targeted tests | Passed; individual logs retained under `output/phase89-*`                                            |
| Isolated Python authoring helper tests         | 3 passed; no inference dependencies needed for these tests                                           |
| Local review browser smoke                     | Passed: exact English, Arabic RTL, invalid interval and approval rejection, no page errors           |
| `pnpm check`                                   | Final snapshot passed in 188.1 seconds, including coverage, format, lint, types, content and budgets |
| `pnpm build:pages`                             | Passed including unchanged bundle ceilings; final hook gate follows                                  |
| `pnpm check:release-notes`                     | Passed for release 2026-10-08.5                                                                      |

## Visual/manual evidence

`output/playwright/phase89/review-ar-mobile.png` and `review-en-desktop.png`; complete browser results/logs, exact WAV duration verification, alias verification and draft coverage in `output/`. Phase 88 compact Mushaf screenshots and production evidence remain available.

## Documentation updated

`docs/audio/WORD_ALIGNMENT.md` defines generation, uncertainty, independent review, registration and playback contracts. Architecture records optional annotation loading and duration correction. Decision log/index record the authorized all-audio phase.

## Decisions recorded

All approved Arabic and English audio is inventoried. Model output is draft evidence, never review approval. An annotation must match the exact recording and actual displayed/spoken wording. No runtime inference service or dependency was added.

## Known limitations or remaining risks

Independent qualified review is still required for every recording. Some English display candidates differ from actual narration; Quran opening letters, introductions and omitted words require careful listening. Partial intervals and possible extra speech remain explicit findings. Optional timings become available offline after loading, while core reading remains offline regardless. Batch generation and final exact-commit release results will be recorded when complete.

## Out-of-scope findings

Recognition for `evening-e-hm-75a` suggests substantially more speech than its supplied short transcript. This is a possible recording/content mapping mismatch requiring qualified content review, not a basis for changing reviewed wording or assignment. Phase 88 remediation commit `1a634f9933b530044bf3d3f24693269566a248cd` passed Quality run 37802345245 (747 browser tests passed, 1 skipped), Pages run 37807294730 build/deploy/production verification, and HTTP production smoke.

## Recommended next step

Review the generated package in the local timestamp tool, resolve source discrepancies through content review, export independently approved annotations, validate proposed registrations and release those exact files. No misleading temporary or evenly divided timings are substituted.
