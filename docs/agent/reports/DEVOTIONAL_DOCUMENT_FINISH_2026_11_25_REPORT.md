# Phase Report - Devotional document finish

## Objective

Complete the approved document-only readability, visual, navigation and accessibility improvements for the three existing external-source booklets. Preserve application behavior and the separately owned application release.

## Scope completed

- Regenerated nine PDF editions and nine self-contained HTML companions, in light, dark and navy.
- Final lengths: al-Mukhtar **73** sheets, Umrah **18**, Wird **138**. There are **229** distinct light-edition sheets and **687** across all themes. Source-page anchors and contents numbering remain stable; added sheets explicitly identify continuation of a source page.
- Resolved every contents destination, added actual PDF outlines, Arabic language metadata and semantic headings, paragraphs, lists and links.
- Increased devotional type, separated sources from readings, removed oversized stretched panels, balanced short continuations and tightened contents spacing.
- Added six labelled, linked Umrah vector illustrations, retained the existing photographs, and obtained line icons from the app's existing icon export layer.
- Added responsive HTML reading, a contents shortcut, PDF download, native keyboard controls, visible focus and 100-200% reading-size controls.
- Replaced keyword-generated benefit summaries/count instructions with eight repetition annotations and four virtue annotations that quote exact source text and retain conditions/alternatives. No ten-repeat instruction is derived from a tenfold reward, no four-repeat instruction from thirty-four, and no fixed three-repeat instruction from twice-or-three-times.

## Files changed

- Existing `docs/external-sources/generate_book{1,2,3}_*.mjs`, their nine HTML exports and nine PDFs.
- Added `book-content.mjs`, `book-presentation.mjs`, `book-presentation.css`, `finalize-book-pdf.py`, `prepare-book-font-map.py`, `verify-books.mjs`, `verify-book-pdfs.py` in `docs/external-sources/`.
- Added checked source-font Unicode evidence and byte-identical existing photo assets under `docs/external-sources/assets/`.
- Added `scripts/devotional-documents.test.mjs`, this report and the controlled phase brief. Updated the external-source README and asset documentation.
- Repaired lint/format errors in the earlier document-only `apply_*`, `check_status`, `crop_headers`, `find_b3_patterns`, `inspect_b2_p3_header`, `inspect_b3_end`, `inspect_b3_toc_lines` and `inspect_header_line` helpers. They remain historical utilities, not build steps. No old patcher was executed.

## Components added or modified

Shared book export/pagination, content-height reading panels, citation treatment, source-excerpt notes, semantic contents lists, six-stage Umrah artwork, reading toolbar and checked PDF text-mapping finalizer. No application component, dependency, route, persisted state, localization or deployment configuration was changed by this phase.

## User-visible changes

Readable Arabic at a stable reading position; calmer panels and clearer references; working contents and reader bookmarks; consistent icons; illustrated Umrah steps; responsive offline HTML; text enlargement; and PDF copy/search metadata with combined Arabic marks preserved. PDF artwork and text remain vectors rather than screenshots of devotional text.

## Accessibility work

All nine PDFs have `/Lang=ar`, marked structure trees, heading/paragraph/list/link tags, actual outlines and resolved annotations. Normal text contrast uses the shared checked palette. Synthetic font bolding is disabled, and the Unicode map repairs combined Arabic marks without changing painted glyph IDs or authored wording. The final PDF text checks reject empty layers, private-use/replacement characters and U+0000 composite-mark failures.

HTML uses native controls, landmarks, ordered contents, labelled links and decorative SVGs hidden from assistive technology. Reading size works at 100-200%; 320, 390, 834 and 1440px layouts are checked in each theme. The static editions remain Arabic RTL; no translated religious text was invented.

Automated tags/axe checks do not establish PDF-UA or complete WCAG conformance. Real Arabic screen-reader reading order/pronunciation and device/PDF-reader acceptance remain pending.

## Tests added or updated

`scripts/devotional-documents.test.mjs`: **13 passed**. Covers exact source-range restorations, unchanged source records outside the four identified pages, font-map provenance, absence of reward/count inference, fail-closed annotation matching, all fragment IDs, semantic companion structure, exact note excerpts, source images and absence of number-only readings.

`verify-books.mjs`: **9 editions passed**, **72 responsive/text-size cases**, **zero axe violations** in the selected WCAG A/AA rules, print/footer bounds, real text-size control interaction and contents navigation. Final print counts match the saved PDFs. The affected al-Mukhtar editions were checked again after the last citation-style correction; the retained JSON combines those exact results with the unchanged editions.

`verify-book-pdfs.py`: **9 passed**, with **24 / 40 / 100** bookmarks and **91 / 33 / 177** resolved PDF links respectively for al-Mukhtar / Umrah / Wird, identically across themes. All light-edition pages have a nonempty text layer with no PUA/replacement/NUL characters. Heading, paragraph, link and list tags survive the PDF metadata repair.

An additional before/after text-field comparison against the preserved HTML baseline found zero unexpected changes to the existing narration, guide, dua, vocabulary and roadmap fields. The 19 restored al-Mukhtar excerpts are recorded separately below.

## Commands run

| Command                                                                 | Exact result                                                                                                                                                                                                                                             |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node docs/external-sources/generate_book1_al_mukhtar.mjs`              | PASS; 3 editions, 73 sheets each; 229 composite mapping repairs per PDF                                                                                                                                                                                  |
| `node docs/external-sources/generate_book2_dalil_al_mutamir.mjs`        | PASS; 3 editions, 18 sheets each; 55 composite mapping repairs per PDF                                                                                                                                                                                   |
| `node docs/external-sources/generate_book3_al_wird_an_nabawi.mjs`       | PASS; 3 editions, 138 sheets each; 237 composite mapping repairs per PDF                                                                                                                                                                                 |
| `pnpm test:run --project tooling scripts/devotional-documents.test.mjs` | PASS; 1 file, 13 tests                                                                                                                                                                                                                                   |
| `node docs/external-sources/verify-books.mjs`                           | PASS; 9 editions, 72 screen cases, 9 automated accessibility scans                                                                                                                                                                                       |
| `node docs/external-sources/verify-books.mjs book1`                     | PASS; 3 affected final editions after citation styling                                                                                                                                                                                                   |
| Bundled Python: `docs/external-sources/verify-book-pdfs.py`             | PASS; all 9 saved PDFs and their link/tag/text checks                                                                                                                                                                                                    |
| `pnpm check` during implementation                                      | FAIL after 301.4s: existing document-helper lint (22 errors) and formatting (20 files); all other 12 stages passed, including full unit/coverage, build, typecheck and budgets. These two failures were repaired and rerun separately as recorded below. |
| `pnpm lint` after helper repairs                                        | PASS, zero errors/warnings                                                                                                                                                                                                                               |
| `pnpm format:check` after deterministic HTML formatting                 | PASS; all matched files use Prettier code style                                                                                                                                                                                                          |
| `git diff --check`                                                      | PASS                                                                                                                                                                                                                                                     |
| Poppler `pdftoppm`                                                      | Rendered final light editions and selected detailed light/dark/navy pages for visual inspection                                                                                                                                                          |

Final `pnpm check`: **PASS in 130.4s**, all 14 stages, including enforced unit coverage, build, types, lint, formatting, content/audio timing checks and bundle/CSS budgets. The gate recorded its own receipt for the exact tested snapshot.

`BOOK_PYTHON` selected the bundled pypdf-capable Python. FontTools/brotli were used only in the ignored output directory to derive the checked font evidence; no application dependency or lockfile changed. Early failed regression/export attempts were corrected and rerun; only final saved artifacts belong to acceptance.

The final aggregate check passed after the helper errors were repaired. Independent application edits arrived in the shared checkout during this document task and were preserved. This report records the successful tested code snapshot; any later changed input invalidates receipt reuse normally. Final consolidation, the release browser matrix, exact-commit CI and publication remain with the release owner. No commit, push or deployment was performed by this document phase.

## Visual/manual evidence

Evidence root: `output/pdf/book-improvements-2026-11-25/`.

- `accepted/`: whole-book contact sheets, detailed source restoration, illustrated Umrah, Quran and dark source-note samples; final light-edition renders.
- `evidence/browser-verification.json`, per-edition axe JSON and `pdf-verification.json`: final machine-readable acceptance.
- `evidence/preserved-reading-content.json`: unchanged existing source-field comparison.
- `sources/`: preserved pre-change HTML/generators, original al-Mukhtar PDF and rendered original pages 32-35.
- Final deliverable package contains the nine PDFs, nine standalone HTML readers and a reading guide. The paired HTML/PDF names stay together so download links work after extracting the ZIP.

Contact sheets provide whole-book layout inspection; enlarged samples provide glyph, spacing and reference inspection. They are not a claim of manual screen-reader acceptance or a complete independent content audit.

## Documentation updated

The approved phase brief, external-source README, asset provenance and this report explain build commands, source-page continuation semantics, typography/contrast, source-excerpt rules, metadata repair and remaining review limits. Application contracts and release notes were not changed by this phase.

## Decisions recorded

The owner's “do required improvments” approves the preceding document review's implementation. The work is scoped to standalone documents and their reproducible exports. App library integration is a separate future phase.

Al-Mukhtar source comparison used the 12th-edition, 64-page original linked by the existing inventory, SHA-256 `bad86e98b231009379cf29c3b19d2cfba04ff6145af5d32fd47b5cebed0e9e51`. The agent visually compared printed pages 32-35, identified missing/mismatched entries and restored **19** Quran excerpts (100-107 and 111-121). The unaffected narrations 108-110 and the remainder of 122 stay unchanged. Every restored passage has explicit reviewed Mushaf verse/word ranges in `book-content.mjs`; excerpts are not expanded into full verses and the raw extraction JSON remains untouched.

## Known limitations or remaining risks

- Independent Arabic/religious-content review is still required for these external-source drafts. Other inherited transcription/order issues remain outside the 19 identified restorations; for example the existing Wird extraction has awkwardly ordered fragments and an already abbreviated travel supplication. The design phase preserves those passages rather than inventing corrections or claiming the whole corpus is reviewed.
- Real Arabic screen-reader, physical-device, printer and multiple PDF-reader search/copy checks remain pending. Automated source/font/tag checks substantially improve the baseline but do not replace that acceptance.
- Printed source-page boundaries remain meaningful, so short source pages retain whitespace. The HTML reader flows naturally and allows larger text.

## Out-of-scope findings

The proposed in-app digital library, application release and concurrent Settings/prayer edits were not implemented or published by this document phase.

## Recommended next step

Independent source/Arabic screen-reader acceptance, followed by a separately scoped app-library integration using these self-contained readers and downloads. Retain the same reviewed content boundaries and explicit offline acquisition behavior.
