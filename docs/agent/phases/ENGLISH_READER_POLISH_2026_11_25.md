# English document reader polish — 2026-11-25, local

## Approved objective

The owner requests applying all eight recommendations from the final UX/accessibility/visual/maintainability review. Improve the current complete English Umrah adaptation and shared authoring/export workflow. Preserve all devotional text, Quran pairings, source references and stable source-unit identities. Keep the existing More → Learn placement and Azkar shortcut; retain book, guide and hadith-collection kinds without adding unfinished modules.

## Plan before editing

1. Reuse the existing source-verified authoring, fonts, icon layer and browser/PDF tooling. Extract shared document styles/assets and validate per-book kind, cover, author and contents metadata instead of hardcoding page 2 or Umrah-specific layout behavior.
2. Add a compact sticky bar with Contents and Reading options. Use native top-layer dialogs for standalone files with opaque surfaces, bounded geometry, keyboard/Escape/close recovery and 44px targets. Persist normalized standalone preferences through a dedicated storage adapter; app integration continues to use existing app state and reader components.
3. Narrow desktop prose, present title/compiler once, retain a visible short draft notice and consolidate full coverage/publication details into accessible About this edition. Ensure print exports always include those details.
4. Add two source-bound labelled vector diagrams for tawaf and the seven sa'i passages. Preserve physical direction under RTL/LTR and provide equivalent text. Do not introduce new rulings or alter any prayer/verse wording.
5. Generate actual English PDF contents page numbers alongside Arabic source references using a verified stable pagination pass. Preserve existing tags, outlines, language metadata and full source text.
6. Update targeted content/controller/browser/PDF regressions. Verify storage denial, keyboard/focus recovery, 44px geometry, enlarged text, spacing overrides, forced colors, all themes and three engines; render and inspect the saved PDFs. Package the final files and record a structured report.

## Boundaries and evidence

No runtime app navigation, source-Arabic edits, account/persistence migration, new dependency, commit/push/deployment or release-note changes. Existing Arabic/English source reconciliation and the two unfinished full translations remain in the [full-English phase](ENGLISH_BOOK_EDITIONS_2026_11_25.md); styling cannot certify them. Real-device TalkBack/VoiceOver and independent language/religious-source acceptance require separate evidence and must not be claimed from browser/PDF automation. Preserve concurrent Home/Settings/Learn work.

## Completed checkpoint

All eight presentation/tooling recommendations are implemented locally. The complete current English Umrah adaptation retains all 16 source units and nine Quran pairs, with 27-page Light/Dark/Navy exports. Fifteen authoring/preference tests, 27 reader cases, three interaction journeys and three enlarged review-index cases pass; the shared sample foundation also passes its 81 browser cases and three saved-PDF checks. See [the structured report](../reports/ENGLISH_READER_POLISH_2026_11_25_REPORT.md) for exact commands, final artifact inventory and remaining independent acceptance. The next content checkpoint remains original-source reconciliation and complete Al-Mukhtar/Wird authoring.
