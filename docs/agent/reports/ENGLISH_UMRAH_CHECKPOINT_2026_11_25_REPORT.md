# Phase report — English Umrah and original-source checkpoint

## Objective

Complete the first full-book authoring checkpoint after owner acceptance of the three English samples: translate the available 16-source-page Umrah adaptation, retain Arabic/English Quran pairings, generate accessible review formats and establish original-source correction records. **This does not complete all three English books.** The [full English phase](../phases/ENGLISH_BOOK_EDITIONS_2026_11_25.md) remains ongoing.

## Scope completed

- Complete English draft of all 16 source-page units in the current Umrah adaptation, including its two continuation sheets; 24 saved A5 pages in each PDF appearance.
- Nine Quran pairings retain source Arabic and exact corresponding Saheeh International full verses/excerpts/opening identifiers. Input HTML and corpus hashes are recorded.
- Six illustrated stages, four photograph placements, five miqats, nine prohibitions, six mistake/correction pairs, sixteen bibliography entries and source publication statements remain represented.
- Prepared original-based English corrections for the Wird p18 narrator chain and complete pp125–126 travel supplication, return wording, glossary and following Jabir report.
- Recorded confirmed Al-Mukhtar verse substitutions and missing/merged numbered-card diagnostics against rendered original pages.
- Recorded the owner's authoritative-originals decision for both languages and instruction to continue with available files/working links after the Umrah URL expired.

## Files changed

- Authoring/presentation: `docs/learning/english-umrah.json`, `english-editions.css`, `english-wird-source-overrides.json`, `SOURCE_REVIEW_2026_11_25.md`.
- Generation: `scripts/english-book-editions.mjs`, `scripts/finalize-english-edition-pdf.py`.
- Verification: `scripts/english-book-editions.test.mjs`, `scripts/verify-english-book-editions.mjs`, `scripts/verify-english-edition-pdfs.py`.
- Contracts/status: `docs/learning/README.md`, `docs/CONTENT_AUTHORING.md`, `docs/agent/INDEX.md`, `docs/agent/DECISION_LOG.md`, `docs/agent/phases/ENGLISH_BOOK_EDITIONS_2026_11_25.md`, this report.
- Generated review outputs are under `output/pdf/english-book-editions-2026-11-25/`; they are outside the app bundle and installation cache.
- `Azkarapp-English-Umrah-review-2026-11-25.zip` packages 13 reading/source/verification files, 4,610,684 bytes; expected file inventory and ZIP CRC verification pass.

## Components added or modified

No runtime application components changed in this checkpoint. The standalone renderer reuses the existing icon export, source stage artwork/photographs, embedded fonts, English sample styles and verified font-map finalizer. No runtime dependency was added.

## User-visible changes

The Umrah draft provides self-contained HTML with linked contents, 100–200% reading-size controls, Light/Dark/Navy appearances and appearance-matched PDF download links. Its review index links only to the available draft. Three PDF appearances share the same complete draft text. Light suits printing; Dark/Navy use continuous page color, including margins and readable footers.

Coverage is explicit: this translates the current 16-page adaptation, **not all 138 pages of its inaccessible earlier original**. Source-edition claims of approval/free distribution are identified as original statements; they do not imply approval of the new English draft. The al-Safa abbreviation remains explicitly identified rather than invented into a complete recitation.

## Accessibility work

- Native links/buttons/radios/fieldset, semantic headings/lists/quotations and keyboard skip-to-reading focus.
- Explicit Arabic RTL and English LTR language boundaries; decorative stage artwork is hidden from assistive technology and photographs retain English alternatives.
- Responsive reflow, enlarged text, visible focus and bounded text-size control states; no horizontal overflow or selected WCAG-tagged axe violations in the tested matrix.
- Saved PDFs have PDF 1.7 headers, English document language, Arabic language tags, marked structure, headings, links and outlines. Every English prose/list/quotation text and Quran meaning is found in saved extraction. No NUL, replacement glyph or PUA text is found.
- The full-page paper fill is a PDF artifact beneath the untouched reading streams. Saved margin pixels and footer contrast are checked. Representative p8 raster contrast is 9.74:1 Light, 11.74:1 Dark and 12.26:1 Navy.
- These checks do **not** establish full WCAG/PDF-UA compliance. Real assistive-technology and independent language/religious-source acceptance remain pending.

## Tests added or updated

Six complete-edition tests cover exact source-page coverage, continuation inclusion, nine Quran pairs, unchanged corpus/excerpt bindings, contents/stage targets, retained visual/list inventory, complete original-based travel text/count/glossary and corrected narrator boundaries. The four accepted-sample tests continue to pass.

The PDF verifier checks all 72 saved pages for searchable text/metadata/geometry and renders all 24 Light pages plus representative Dark/Navy p8. It compares every translated reading string and Quran meaning with saved extraction; removes only the exact generated pagination footer when joining continued paragraphs. Index checks verify all four local file links.

## Commands run

| Command                                                                                                                              | Result                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm exec vitest run scripts/english-book-editions.test.mjs scripts/english-book-samples.test.mjs`                                  | PASS: 2 files, 10 tests; final run 4.33 s.                                                                                                                                                                               |
| `pnpm exec eslint scripts/english-book-editions.mjs scripts/english-book-editions.test.mjs scripts/verify-english-book-editions.mjs` | PASS, exit 0.                                                                                                                                                                                                            |
| Targeted `pnpm exec prettier --check` for those scripts, authoring JSON/CSS, source-review/learning docs and phase brief             | PASS: all matched files use Prettier style.                                                                                                                                                                              |
| `node scripts/english-book-editions.mjs`, with bundled Python in `BOOK_PYTHON`                                                       | PASS: 16 source units, 9 Quran pairs; self-contained HTML, index, source records and 3 PDFs generated.                                                                                                                   |
| `node scripts/verify-english-book-editions.mjs`                                                                                      | PASS: 27 reader cases across Chromium/Firefox/WebKit, widths 320/768/1280, three themes; 320px at 200% text. Keyboard skip and size controls pass in each engine.                                                        |
| `node scripts/verify-english-book-editions.mjs --index-only`                                                                         | PASS: Chromium/Firefox/WebKit at 320px/200%, 0 selected axe violations, 0 horizontal overflow; all 4 file links resolve.                                                                                                 |
| Bundled Python `scripts/verify-english-edition-pdfs.py`                                                                              | PASS: all 3 PDFs, 24 pages each, tags/languages/outlines/full English extraction/Quran meanings and paper/footer regressions.                                                                                            |
| Original-source download/comparison                                                                                                  | Wird author-linked PDF downloaded and visually inspected; cached Al-Mukhtar original inspected. Signed Umrah URL returns AccessDenied; unsigned URL returns MissingKey. Owner directs proceeding with available sources. |

Intermediate verification caught and corrected a split heading/list item, a lint global, footer interruption in the cross-page extraction check, clipped dark paper margins and inadequate rasterized Light footer contrast. Assertions and thresholds were retained. A one-off index harness initially used `browser.newPage()`; its corrected reusable check uses explicit browser contexts. Final commands above pass.

No application release is performed. Full application `pnpm check`, browser release matrix, Pages build and deployment gates are not rerun for this standalone authoring checkpoint; their earlier local Learn results remain in the Learn report and are not represented as validation of a new release.

## Visual/manual evidence

Under `output/pdf/english-book-editions-2026-11-25/evidence/`:

- `browser-verification.json`: 27 reader cases.
- `review-index-verification.json`: 3 enlarged index cases.
- `pdf-verification.json`: saved-PDF structural/text/paper/footer results.
- Reader screenshots at desktop/light and phone/navy, plus `review-index-320-200.png`.
- All 24 Light page renders and Dark/Navy p8 renders. All Light sheets were visually inspected in four contact sheets; representative dark paper, footers, headings, photos and Arabic typesetting were also inspected directly. Later footer/paper-only corrections preserve the same body layout and text.

Original comparison renders are in `output/english-editions/`; the [source ledger](../../learning/SOURCE_REVIEW_2026_11_25.md) identifies what was confirmed and what remains diagnostic.

## Documentation updated

The phase, decision log, active index, authoring contract, Learn contract and source ledger record current coverage, original-source authority, review status and next work. Generated `READ-ME.txt` and the review index identify draft scope and file organization.

## Decisions recorded

- Approved sample style scales to full editions, retaining Arabic/English Quran.
- Authoritative original PDFs govern both languages; changes require traceable source comparison.
- Use available files/working links for now. Do not request the expired Umrah link again at this checkpoint or imply access to its full original.
- Retain the local publication hold and independent Home/Settings/Learn work.

## Known limitations or remaining risks

- **Full Al-Mukhtar and Wird English translations are not complete.** Only the specified original-based Wird passages are prepared in the new ledger; the earlier bedtime sample remains a sample.
- Arabic source corrections identified here have not yet been applied to existing books, PDFs or Learn packs. Existing Arabic exports must not be treated as fully original-verified merely because their visual/integrity checks pass.
- Some Al-Mukhtar cards substitute other verses or omit/merge item identities. The source ledger distinguishes confirmed cases from the remaining numbered-card diagnostics. Restore original content before completing/announcing English coverage, preserving the already verified p32–35 restorations.
- The Umrah adaptation omits material from its earlier 138-page original. Its source counts/wording, including its abbreviation, define this draft's limited scope.
- Independent terminology, language/religious-source review and real screen-reader/PDF-reader acceptance are pending. Full PDF-UA or complete WCAG conformance is not claimed.

## Out-of-scope findings

The shared checkout contains independent Home, Settings and earlier Learn/document work. It remains untouched by this authoring checkpoint. No commit, push, deployment, release-note change, runtime language option or persistence/synchronization change was made.

## Recommended next step

Continue the active phase with a traceable original-source correction batch for Al-Mukhtar and Wird, then complete their English authoring and saved-artifact checks. Keep current Umrah coverage explicit. Language-specific Learn/offline resources follow completed content review; the approved More → Learn and Azkar shortcut organization remains.
