# Phase Report — Stable Quran snippets and complete Al-Imran

## Objective

Apply the owner's screenshot-based repair recommendations locally. Rare-word help must preserve all text geometry, and the waking-up passage must include 3:190–200. No commit, push, deployment or release-note changes are authorized.

## Plan before editing

1. Inspect the approved Quran typography/content contracts and preserve concurrent Library/sharing/page work.
2. Keep one ordered word renderer in both help states; decorate individual words without phrase boxes, padding or conditional line breaks.
3. Complete the waking passage from shipped Mushaf pages 75–76, preserve its item ID/count, and resolve both page-specific fonts atomically.
4. Verify source/transcript boundaries, add daily offline assets and explicit Home Quran identities.
5. Add exact geometry/content/end-marker regressions, run quality/browser/build gates and inspect screenshots.

## Scope completed

Implementation complete. Final WebKit and broad browser verification remain in progress; exact completed results are below.

## Files changed

QuranVerseText, QuranWordText, ReaderScreen and its stylesheet; useQuranSnippet/useListeningMushafPage; MushafExcerpt and its canvas; canonical excerpt registry; contentReview and the generated QuranImranPassage; dailyEvidence/HomeCards; QCF URLs, two page fonts/manifest and precaching; audio assignment; generator; colocated tests and quran-word-layout browser spec. Also aligned one exact toolbar-padding expectation in MushafPageViewer.test.tsx with its concurrent CSS-variable contract. Concurrent changes outside this inventory belong to other sessions.

## Components added or modified

Existing shared word, passage, excerpt and Home components. No new runtime dependency, state schema or full-page fitting algorithm.

## User-visible changes

Help paints individual existing word boxes. Snippets wrap naturally in both reading/playback, with unchanged shared Quran size. Al-Imran continues through verse 200, including all eleven verses beginning at 190. The explicit passage title shows 190–200. Home's eighteen reviewed Quran sources carry explicit display identities. Daily fonts/data now include pages 75–76.

## Accessibility work

Original Arabic and markers remain semantic, while page glyphs remain hidden from assistive technology. Inline help preserves Enter/Space, prevents accidental counting and retains visible focus; this documents the inline-text target exception. Full explanation controls retain ordinary target sizes. Highlight ink blends primary and foreground for contrast. Closing help removes its keyboard actions without moving words. Actual device/screen-reader review is not claimed.

## Tests added or updated

Stable node identity in QCF/Unicode; page-specific words and final-marker fonts; exact complete Arabic/English/transliteration verse coverage; unchanged item identity/count; all eighteen Home source mappings; safe multipage image fallback; browser exact per-word rectangles/typography and scrolling under repeated toggles, responsive widths and 200% text, plus last-marker reachability.

## Commands run

| Command                                    | Result                                                                                                                                                                                                                                                                       |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm verify:toolchain`                    | Passed: Node 24.x / pnpm 11.19.0.                                                                                                                                                                                                                                            |
| First targeted renderer/mapping/hook suite | 5 files, 34 tests passed.                                                                                                                                                                                                                                                    |
| Expanded targeted content/renderer suite   | 5 files, 34 tests passed.                                                                                                                                                                                                                                                    |
| Latest targeted renderer/content suite     | 6 files, 28 tests passed, including the sourced Al-Imran meanings.                                                                                                                                                                                                           |
| Initial `pnpm check`                       | 1,716 tests passed; one concurrent full-page padding assertion failed. Owned generator lint and formatting errors corrected.                                                                                                                                                 |
| Initial `pnpm budget`                      | CSS 28,772 gzip bytes exceeded the unchanged 28,672 ceiling. Removed redundant annotation CSS; the fresh isolated build now passes the unchanged budget.                                                                                                                     |
| Resumed `pnpm check`                       | All code, full unit/coverage, content/timing and budget stages passed. Failed only on formatting of the concurrent Mushaf compact-translation report; 610.8 seconds.                                                                                                         |
| Geometry browser suite                     | Original Chromium and Firefox suites: 14/14 each passed. WebKit after settling resize/scroll: first 15 split cases passed, including every QCF passage. Additional An-Nas normal-size recovery: 2/2 passed. Full final suite includes every split case in all three engines. |
| Full browser suite                         | Earlier runs interrupted during diagnostics. Final run: 1,227 tests, isolated current preview on port 4288 and copied test/source inputs in ignored output/quran-browser-snapshot; in progress.                                                                              |
| pnpm build:pages                           | Passed, including service worker precaching, unchanged bundle budgets and CSS utility checks.                                                                                                                                                                                |
| pnpm format:check                          | Failed only on two concurrently edited reports: AUDIO_DOWNLOAD_RECOVERY and MUSHAF_COMPACT_TRANSLATION. No unrelated files formatted.                                                                                                                                        |

## Visual/manual evidence

Inspected Chromium Al-Imran and An-Nas screenshots in `output/playwright/quran-geometry-final/`, and the final WebKit An-Nas recovery screenshot in `output/playwright/quran-nas-webkit-recovery/`. Final full-suite evidence is retained in `output/playwright/quran-snippets-full-current/`. Owner screenshots are the baseline. Automated assertions do not establish complete accessibility compliance.

## Documentation updated

This phase, content authoring, architecture, design system and decision log describe the completed contract and source/audio boundaries.

## Decisions recorded

The owner explicitly authorizes completing the incomplete text from Mushaf and applying recommendations locally, with no push. Arabic is copied verbatim from the existing reviewed page words. Translation/transliteration use the existing Pickthall/alQuran.cloud editions. Muslim 763b supports the existing narration's “ten concluding verses” wording; that quote is not rewritten to “eleven.” Remove the inconsistent parenthetical 190–200 from the English benefit while the actual displayed passage separately labels its eleven-verse range. Sources: https://sunnah.com/muslim:763b and https://quran.com/ali-imran/190-200.

## Known limitations or remaining risks

The owner has not verified the exact 4:42 audio range. Its approved catalog transcript is only 190–191. Retain all original recording bytes, provenance, transcript hashes and cues, but remove its mismatched assignment to the completed reading entry. Audio for that entry remains unavailable until exact-recording scope/transcript/timings are verified; no resolver/hash/timing gate is weakened. Multipage image export deliberately uses complete Amiri Quran Unicode rather than painting page-76 codes in page-75's font. Other Home fonts retain remote/cache loading with readable offline fallback. Concurrent edits mean whole-repository results describe the shared candidate at the time of execution.

## Out-of-scope findings

No persistence, synchronization, reciter substitution, generated timing activation, dependencies or publication changes.

## Recommended next step

Owner Android review of the local candidate; independently verify the Al-Imran recording before reassignment. Publication requires renewed authorization.
