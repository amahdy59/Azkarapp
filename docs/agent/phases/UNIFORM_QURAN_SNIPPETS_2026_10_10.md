# Phase Report — Uniform Quran snippets

## Objective

Correct the owner-reported mismatch between the before-sleep Baqarah passage and its expanded audio rendering. Apply consistent Quran typography across application snippets without editing reviewed content, audio cues, persisted state, or full printed Mushaf pages.

## Scope completed

The reader previously scaled short Quran passages by length, while the player fitted canonical printed lines independently. Short excerpt lines could therefore appear larger than adjacent lines. Secondary surfaces and share images also used different font families, weights, and leading.

One shared rule now supplies bundled Amiri Quran, native weight 400, no synthetic weight, normal tracking, 1.85 leading, and small/medium/large sizes of 22/24/28 CSS pixels at the corresponding application root size. Relative units preserve user text enlargement. Canonical audio excerpts flow at this same size without line fitting; cue highlighting preserves text geometry. Full printed Mushaf pages retain their fifteen slots, fitter, and page magnification contract.

## Files changed

- Shared presentation: `src/app/quranTypography.ts`, `theme.ts`, `src/styles/theme/tokens.css`, `components/AyahMarker.tsx`, `QuranVerseText.tsx`, `MushafPageViewer.tsx`, `MushafExcerpt.test.tsx`, `ListeningWordText.tsx`, `QuranWordText.tsx`, and `FloatingAudioPlayer.tsx`.
- Reader and discovery: `screens/ReaderScreen.tsx`, `readingTypography.ts`, `AzkarLibraryScreen.tsx`, `SearchScreen.tsx`, `BenefitsScreen.tsx`, and `WirdBenefitsScreen.tsx`.
- Other snippet surfaces: `components/AzkarListItem.tsx`, `HomeCards.tsx`, `QuranChrome.tsx`, `QuranBilingualStreamView.tsx`, `QuranListeningReader.tsx`, `QuranWordPopover.tsx`, `QuranWordMeaningSheet.tsx`, `AyahInteractionSheet.tsx`, `AyahShareStudio.tsx`, and `CollectionShareModal.tsx`.
- Sharing: `share/shareLayout.ts`, `collectionShareCard.ts`, and relevant tests.
- Release remediation: `hooks/useAppStatePersistence.ts` and its test, `screens/settings/SettingsScreen.tsx`, plus the excerpt font-loading option in `hooks/useListeningMushafPage.ts` and `MushafExcerpt.tsx`.
- Regression evidence: `e2e/quran-snippet-typography.spec.ts`, typography, theme, marker, excerpt, and player unit tests.

## Components added or modified

Extracted the existing ayah marker into a lightweight shared component. Added QuranVerseText to render numeric verse markers consistently while retaining original marker text for assistive technology. Reused the shared typography policy across Quran text roles; UI titles, prose, translations, and ordinary dhikr retain their distinct roles.

## User-visible changes

Uniform Quran font, scale, weight, and leading in reading, playback, home evidence, list previews, saved verses, search, benefits, selected verses, word meanings, bilingual stream, and accessible sharing text. Quran share images use Amiri Quran consistently for both layout measurement and drawing while preserving fixed export sizes and complete-text overflow checks.

## Accessibility work

Relative font sizing supports text resizing. Verse markers preserve accessible source text. Keyboard controls and audio cue offsets are unchanged. Browser assertions cover horizontal containment through 320/390/820/1440 CSS pixels and 200% text enlargement. Automated checks do not establish complete WCAG compliance; real Android and assistive-technology review remains necessary.

## Tests added or updated

Added six canonical-passage checks in both languages across three browser engines, comparing reader and player computed typography, preventing line transforms, and verifying resizing. Added source-marker preservation, Quran length-independent sizing, appearance/font independence, and share font-measurement assertions. Corrected two unit fixtures that had incorrectly classified ordinary dhikr as Quran. Existing browser focus and export assertions remain intact.

## Commands run

| Command                                                  | Result                                                                                                                                                       |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Initial targeted component suite                         | 93 tests passed in 10 files.                                                                                                                                 |
| `pnpm typecheck`                                         | Passed after correcting the saved-library presentation type.                                                                                                 |
| Share layout, collection export, and theme unit suite    | 42 tests passed in 3 files.                                                                                                                                  |
| Initial three-engine typography/player browser suite     | 32 passed, 11 failed; failures recorded and investigated rather than suppressed.                                                                             |
| WebKit player containment/focus reproduction             | Both language cases passed; no speculative production focus change.                                                                                          |
| Final three-engine typography/player/ayah-image suite    | 48 passed, 1 WebKit zoom-style timing failure; repaired without relaxing the expected doubled size. Both Baqarah language reproductions then passed (26.0s). |
| Required pre-push quality, fast browser, and Pages gates | Pending normal hook execution.                                                                                                                               |

Release-remediation browser suite: 28 passed (5.7 minutes), including immediate counter reload in all engines, desktop settings keyboard navigation, reader benefits, and single-verse image sharing. The three-engine snippet/export matrix took 9.3 minutes; its 48 successful cases plus the two corrected Baqarah reproductions cover every canonical passage and language. Final full CI remains required.

## Visual/manual evidence

Additional results: `pnpm check` passed all stages in 182.5 seconds on the typography snapshot. Subsequent changes require the final hook gate again. Immediate-leaving-page persistence and excerpt regressions passed 7 tests in 2 files. Excerpts now skip the unused external QCF font request, reducing delay while retaining the canonical data and bundled Amiri font.

Owner screenshots show the original inconsistency. Browser screenshots are retained under ignored `output/quran-snippet-final/`. A Chromium before-sleep Baqarah screenshot at 200% text enlargement was visually inspected: Arabic glyphs retain uniform size and the passage remains scrollable above the controls.

Normal phone screenshots were also captured and visually inspected at `output/quran-reader-baqarah-390.png` and `output/quran-player-baqarah-390.png`.

## Documentation updated

Architecture and design system record the shared rule and preserved full-page contract. Decision log records the owner's correction superseding the earlier printed-line excerpt presentation. Agent index points to this phase. Bilingual release notes describe the current deployment range.

## Decisions recorded

Use native Arabic shaping and flowing Quran snippets instead of per-line fitting. Preserve canonical token order, source text, recitation mapping, and full Mushaf layout. No runtime dependencies added.

## Known limitations or remaining risks

Production deployment and exact-SHA smoke verification remain pending. Physical Android rendering and assistive-technology testing cannot be claimed from desktop browser automation. A broad local suite interrupted in the preceding phase is not passing evidence; the full CI suite remains the release gate.

## Out-of-scope findings

The preceding release's Quality run 38074595239 completed with four failures, six flaky cases, 947 passes, and one skip. Logs were inspected. Its canonical excerpt overflow is addressed by this phase. Desktop keyboard navigation into the already mounted accessibility panel now explicitly focuses its heading. Persistence now publishes the pending snapshot during layout commit so a reload started after paint cannot race a deferred passive effect; a regression verifies immediate pagehide from another layout effect. The normalization boundary, debounce, storage format, and merge behavior are unchanged. Separate targeted browser reproductions retain the existing counting/reload and focus assertions.

Breakpoint changes remount the player. The new regression waits for the actual reader layout before checking its newly mounted player, preserving all typography assertions. Unused legacy sharing components were not refactored.

## Recommended next step

Complete the normal push gates and CI deployment, verify the live SHA and production snippet rendering, then review the actual Android device shown in the owner's screenshots.
