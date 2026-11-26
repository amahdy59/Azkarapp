# Phase Report — Audio choices and complete book access

## Objective

Extend the consolidated release with responsive audio options, Mushaf listening, automatically verified dua coverage and all three Arabic books/PDFs. The owner explicitly removes another confirmation/human-review gate for this phase; deferred listening is never represented as completed.

## Scope completed

Implemented locally: three-book availability and direct PDF discovery, responsive audio options, complete-surah playback through the existing single controller, explicit source/byte/range/decode evidence and lossless metadata/waveform packing. Exact-commit publication verification remains required; this checkpoint does not claim deployment success.

## Files changed

App/AudioProvider/Mushaf composition; Mushaf audio integrity/registry/pack modules; additive audio assets/assignments and common verification metadata; exact waveforms and byte packing; Learn catalogue/cards/i18n; source evidence, unit/browser regressions, release notes/history and manual ingestion workflow. Source media stays outside installation assets.

## Components added or modified

FloatingAudioPlayer, KhatmahReaderScreen, LearnScreen/BookPdfDownload and AudioProvider. Shared Select/Popover, themes, icons, state normalization and download boundaries are retained.

## User-visible changes

All three Arabic books/PDFs are available with source/draft notices and preserved positions/bookmarks. Unfinished English publication stays gated. Reading preferences are expandable; speed is explicit; long reciter names wrap; a single reciter has no meaningless dropdown. Mushaf offers available complete-surah recordings. Existing defaults and exact reviewed timings remain. Unsupported wording is never attached to similar audio.

## Accessibility work

Protected opaque portalled menus, bounded scrolling, 44px controls, RTL/LTR, 320px/200% reflow, native disclosures, download status, keyboard focus recovery and axe. Physical assistive-technology acceptance remains separate.

## Tests added or updated

Complete Quran semantic word/verse rejection boundaries; exact source transcripts/bytes/ranges; lossless registry/waveform round trips; source-correct assignment identities; menu geometry/opacity/keyboard; native full-surah playback/reciter changes; production book discovery/direct links/offline removal/saved records and exact PDFs.

Surah identity is preserved separately from the page when choosing from the existing index. This keeps Al-Ikhlas, Al-Falaq and An-Nas independently selectable even though all start on page 604; the header, index state and requested recording remain consistent. Unit and connected browser regressions cover all three choices.

Starting complete-surah audio from a later page opens that surah's first page, keeping the displayed starting point consistent with the recording. New recordings do not invent automatic verse tracking. A separate cross-engine regression starts An-Nisa from page 100 and verifies its pinned recording and displayed page 77.

## Commands run

| Check                                        | Result at checkpoint                                                                                                                                                                                   |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Source inventory/full FFmpeg decode          | 459 retained; four Quran candidates rejected. Other candidates cover all 114 surahs.                                                                                                                   |
| Local manifest validation                    | Passed: 257 content instances, 196 assets, 223 assignments.                                                                                                                                            |
| Targeted integration                         | 10 passed; later scope/availability/waveform repair suites: 57 passed.                                                                                                                                 |
| Production Learn/PDF browser tests           | Six passed, including exact PDF bytes and 320px/200% reflow.                                                                                                                                           |
| New menu Chromium cases                      | Eight passed.                                                                                                                                                                                          |
| Menu/split Progress journeys, Firefox/WebKit | 32 passed; prior assertions retained in bounded independent journeys.                                                                                                                                  |
| Existing audio Chromium regressions          | 27 passed.                                                                                                                                                                                             |
| Pages build/budgets                          | Passed after lossless packing; ceilings unchanged.                                                                                                                                                     |
| First complete quality attempt               | Exposed outdated assertions, lint errors and bundle overrun; repaired without skipping checks. Final exact-content gates remain required.                                                              |
| Native Mushaf playback                       | Chromium/Firefox passed; both WebKit languages now pass with an explicit pause, reciter change and native-clock resume.                                                                                |
| Independent speech diagnostic                | 264 recordings transcribed at checkpoint, including all 121 dua recordings in full; remaining long-surah samples are supplementary.                                                                    |
| TypeScript after compact metadata repair     | Passed, with explicit compact input types rather than a double assertion.                                                                                                                              |
| Complete local quality / first push hook     | `pnpm check:serial` passed all stages in 499.9s; the hook passed 28 browser cases, frozen installation, fresh release notes and Pages build. The starting-page correction receives its own fresh gate. |
| Hosted recording ingestion                   | Run 45909262261 succeeded: 459/459 exact source/public SHA-256 identities, sizes, MIME, production CORS and byte ranges verified. Temporary upload secret removed and absence confirmed.               |
| Final Mushaf feature browser suite           | 18 passed across Chromium, Firefox and WebKit: native playback/voice changes, shared-page surah choices and matching starting-page navigation, in both languages.                                      |

Final correction hook, exact-commit Quality/Pages and production results remain required and are recorded in the release session and `output/consolidation-20261126/`. The early automatic Quality run was superseded while the media was being published; all final CI assertions still run against the completed hosted library.

## Visual/manual evidence

Inspected actual desktop RTL Glass and 320px/200% RTL solid screenshots. Menus obscure underlying text; enlarged reciter names reflow in bounded scrolling. Cross-engine artifacts retain both languages and responsive scenarios. Local copies: `output/consolidation-20261126/options-evidence/`.

## Documentation updated

Owner decision/index/phase, expanded source/permission documentation, source-review ledger for 31 audio-assignment identities only, domain contracts and release manifest/history. The ledger updater first proves all other reviewed text/count/source/bilingual fields unchanged.

## Decisions recorded

Automation is the current release gate. No listening or scholarly approval is fabricated. Four failed Quran candidates stay excluded. Changed-text suspended recordings are never restored under their old identity.

## Known limitations or remaining risks

Source/identity/coverage/decode checks establish the tested mapping and media integrity, not perfect pronunciation. Independent unprompted transcription is diagnostic and makes mistakes on accepted controls. Long-recording transcription samples opening/closing windows; decoding covers whole files. New recordings have no inferred word highlighting. Unsupported exact wording has no invented audio. Physical OS/background and assistive-technology acceptance remains separate.

223 of 257 registry entries have explicit recording assignments; 138 offer Muhammad Jumah. The remaining 34 include non-recited introductions and wording without an exact verified recording. Source coverage is reported rather than attaching similar wording or claiming every dua has every voice.

## Out-of-scope findings

Large local uploads repeatedly stalled/reset. A manual runner ingestion workflow completed with encrypted temporary configuration and full public-file verification. Its temporary repository secret was then removed; 49 task-owned incomplete multipart upload identities were also cleaned up without deleting objects. An attempted temporary Cloudflare importer was denied by an invalid local token before deployment; the production Worker and Pages configuration were untouched.

## Recommended next step

Complete the correction's intact local hook, exact-commit full Quality matrix, Pages build/deploy and production audio/books/menu smoke. Media ingestion is complete. Further exact-source coverage and translation work stays phase-scoped.
