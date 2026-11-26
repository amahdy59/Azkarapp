# Phase Report — English book samples with paired Qur'an

## Objective

Prepare the owner-approved English review samples from the three books, preserving Arabic Qur'an beside attributed English meanings in HTML and PDF. This is the selected sample checkpoint before full-book translation.

## Scope completed

- Al-Mukhtar: source p.32, supplications 103–104, with Qur'an 17:24 (corresponding excerpt), 14:40 and 14:41.
- The Umrah Guide: source p.8, five tawaf guidance points, original photograph and Qur'an 2:201 (corresponding excerpt), 109:1 and 112:1.
- The Prophetic Wird: source p.34, the selected bedtime hadith, its three repetitions and Qur'an 112:1, 113:1 and 114:1. The continuing glossary is explicitly outside this sample.
- Three self-contained HTML files and three tagged PDFs from one authoring source. All nine Qur'an occurrences have exact selected source Arabic and the matching English meaning, verse reference and Saheeh International attribution. Partial verses and surah-opening identifiers are labelled accurately.
- Original Arabic books, live Learn catalogue, existing application state and all independent Home/Settings work are unchanged by this checkpoint. The new English prose/hadith remains a visible draft for independent review.

## Files changed

`docs/learning/english-samples.json`, `english-samples.css`, the English-edition contract in `docs/learning/README.md`, `scripts/english-book-samples.mjs`, its test, browser/PDF verification scripts, agent index/decision log, the sample phase and this report. Deliverables are under `output/pdf/english-book-samples-2026-11-25/`; generated files remain outside the app deployment bundle.

## Components added or modified

No application component changed. The standalone renderer reuses the existing BookOpen, Info, Repeat and Download icon exports and embedded publication fonts. A structured Quran pair always renders independent Arabic/RTL and English/LTR semantic blocks. English text comes from the existing offline corpus, with recorded contiguous substring boundaries where the book quotes only an excerpt.

## User-visible changes

Review samples have English prose, source references, prominent draft status, Arabic-plus-English Qur'an, selectable/searchable text, internal contents, 100–200% reading controls, Light/Dark/Navy HTML appearances and a link to the matching PDF. PDFs use compact A5 pagination with source-page/page-count footers: two pages for Al-Mukhtar, three for the Umrah Guide and two for the Prophetic Wird. The Umrah photograph is retained; the bedtime repetition remains three times. These files do not advertise a complete English edition.

## Accessibility work

Native main/header/nav/section/heading/paragraph/figure semantics, keyboard skip-to-reading, labelled text-size/radio controls, visible focus, 44px actions, full text reflow, explicit Arabic and English language/direction and attributed translations. Arabic uses the source Qur'an font without synthetic bold. PDF checks require marked structure, heading/link roles, outline, `en` document language, `ar` spans and intact English text extraction. Every final PDF page was rendered and visually inspected. These checks do not establish PDF/UA or complete WCAG compliance; real screen-reader acceptance remains pending.

## Tests added or updated

Four tooling tests verify all nine Arabic/English pairs, exact existing English corpus values/digests and excerpt boundaries, source identities/digests, internal links, draft status, surah-opening scope, source references, five tawaf points and the unchanged three repetitions. The saved-PDF verifier checks the actual English meanings in extracted text, not only the source DOM.

## Commands run

| Command                                                            | Result                                                                                                                                                                                      |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node scripts/english-book-samples.mjs` with bundled `BOOK_PYTHON` | Passed: three HTML/PDF pairs; nine paired Qur'an occurrences.                                                                                                                               |
| `pnpm exec vitest run scripts/english-book-samples.test.mjs`       | Passed: four tests in one file, 3.44 seconds in the final run.                                                                                                                              |
| Targeted ESLint on the three new JavaScript scripts                | Passed, zero warnings.                                                                                                                                                                      |
| Bundled Python `scripts/verify-english-book-pdfs.py`               | Passed: 2/3/2 A5 pages, English/Arabic tags, outlines, heading/link structure, all English Qur'anic meanings and valid text layers; all seven pages rendered through Poppler.               |
| `node scripts/verify-english-book-samples.mjs`                     | Passed: 81 cases across Chromium/Firefox/WebKit, three widths (320px at 200% text) and three themes; zero axe violations/overflow. Keyboard and size controls passed for every book/engine. |
| Targeted Prettier and `git diff --check`                           | Passed; final report entries independently formatted afterward.                                                                                                                             |

The initial visual pass had avoidable notes-only last pages in two samples; concise notes removed these without shrinking the reading text. Initial browser harness runs exposed axe's explicit-context requirement and reload restoring a previously focused control. The corrected harness creates a real browser context and a fresh document for entry keyboard order. WebKit then exposed its default skipping of ordinary links during Tab navigation; explicit native tab stops fixed the actual sample links, and the complete final matrix passed with unchanged assertions. Application quality/build gates are not rerun for this isolated authoring/output checkpoint; no runtime code or install payload changed.

## Visual/manual evidence

`output/pdf/english-book-samples-2026-11-25/evidence/` contains every final saved-PDF page rendered by Poppler, desktop/light and 320px/enlarged/navy HTML captures, and the PDF/browser verification JSON. The generator writes `source-comparison.json` with exact source selections, English values, source hashes and matching primary links. A deliverable manifest records final file hashes. The review index passed a separate browser check with six valid local links and zero axe violations. Source comparison references include [Qur'an 17:24](https://quran.com/17/24), [14:40–41](https://quran.com/14/40-41), [2:201](https://quran.com/2/201), [Sahih Muslim 1218a](https://sunnah.com/muslim:1218a) and [Sahih al-Bukhari 5017](https://sunnah.com/bukhari:5017). Modern website English translations were not copied into draft prose.

## Documentation updated

English-edition contract, owner decision, active sample phase, index and this report. The output package includes an explanation of review scope and HTML/PDF use.

## Decisions recorded

Arabic Qur'an remains visible with attributed English meanings in the English version, including embedded passages. Preserve source excerpts and repetition counts; distinguish surah-opening citations from complete surahs. Translate once for both formats, then review representative samples before full editions/app language integration. Keep publication held.

## Known limitations or remaining risks

These are selected draft samples, not complete English translations. Religious/language review, terminology/transliteration choices, real assistive-technology acceptance and final full-book QA remain separate. The existing English corpus sometimes retains punctuation from a quotation spanning multiple verses; samples preserve it and explain that policy. No Arabic text has been silently corrected. The continuing glossary on Wird p.34 is omitted explicitly rather than translated as an incomplete definition.

## Out-of-scope findings

Independent Home/Settings/application and source-document changes remain local and untouched. No commits, push, deployment, release-note changes, new runtime dependencies, remote schemas or synchronization changes.

## Recommended next step

Review translation style and the Arabic/English pairing in these concrete files. After sample/style approval, translate complete source units with independent review, validate every embedded Qur'an span, then implement explicit book-language selection and language-specific offline assets/PDFs under the existing Learn contracts.
