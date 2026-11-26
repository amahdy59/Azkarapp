# Phase Report — English reader polish, 2026-11-25

## Objective

Apply all eight owner-approved UX, accessibility, visual-design and maintainability recommendations to the current complete English Umrah adaptation and shared publication workflow. Keep every devotional/source block, the nine Arabic/English Quran pairs, the existing Learn organization and the local publication hold.

## Scope completed

1. All ordinary standalone controls have 44px minimum targets, including Contents and Download PDF.
2. A compact sticky Contents/Reading options bar replaces the tall settings toolbar. Opaque native modal dialogs are bounded to the viewport, support keyboard wrapping, Escape/close/backdrop dismissal and focus recovery, and keep focused controls visible below the sticky dialog heading.
3. A normalized, versioned standalone preference adapter remembers Light/Dark/Navy and 100–200% reading size. Corrupt/denied storage falls back safely and explicit save failures are announced. It never writes application progress or synchronization data.
4. Desktop prose has a narrower measure: the tested first line contains 66 characters in Chromium/WebKit and 73 in Firefox, compared with approximately 100 before this change.
5. The title/compiler appear once. A short draft/coverage notice remains visible; full source coverage, credits and relocated source publication details remain in About this edition and always expand in print.
6. Two source-bound vector diagrams illustrate anticlockwise tawaf and the seven alternating sa'i passages, with accessible SVG title/description, visible equivalent captions and unchanged full textual instructions. Physical direction stays fixed under RTL/LTR. Existing stage icons and four photographs remain.
7. PDF contents now show the actual English physical page alongside the Arabic source reference. Export repeats until the page map stabilizes, records a sidecar, and the saved-artifact verifier independently checks the same map in all three appearances.
8. Samples and full editions reuse publication fonts/styles/assets. Validated resource/cover/compiler/contents metadata preserves the existing `book`, `guide` and `hadith-collection` taxonomy without adding unfinished modules or changing app navigation.

The resulting Umrah HTML retains all 16 Arabic source units. Light, Dark and Navy PDFs have **27 A5 pages each**. This is the current 16-page adaptation, not a translation of the inaccessible 138-page original. The two other full English books remain a separate unfinished content checkpoint.

## Files changed

- `docs/learning/publication-base.css`, `publication-reader.mjs`, `publication-preferences.mjs`: shared presentation and standalone interactions/storage boundary.
- `docs/learning/english-editions.css`, `english-samples.css`, `english-umrah.json`: variant layout and source-bound diagram/presentation metadata; devotional and Quran wording preserved.
- `scripts/publication-assets.mjs`, `publication-diagrams.mjs`, `read-publication-pagination.py`: shared assets, native vector diagrams and saved-PDF page discovery.
- `scripts/english-book-editions.mjs`, `english-book-samples.mjs`: shared foundations, validated metadata, consolidated publication details, dialog/controller embedding and stable PDF pagination/export.
- `scripts/english-book-editions.test.mjs`, `verify-english-book-editions.mjs`, `verify-english-edition-pdfs.py`: authoring/preference/browser/saved-PDF regressions.
- `docs/learning/README.md`, `docs/CONTENT_AUTHORING.md`, `docs/agent/INDEX.md`, `docs/agent/DECISION_LOG.md`, the phase brief and this report.
- Regenerated standalone review artifacts in `output/pdf/english-book-editions-2026-11-25/` and samples in `output/pdf/english-book-samples-2026-11-25/`.

No runtime app component, original Arabic publication, Learn pack, dependency, deployment file or release-note manifest was changed by this polish phase. Preserve all independent pending Home/Settings/Learn edits in the shared checkout.

## Components added or modified

Shared publication asset loader/base styles; standalone reader controller and preference adapter; native Contents/options dialogs; source-bound SVG diagram renderer; per-book presentation validator; stable pagination discovery/export and saved-file verification. The app's existing reader, settings, icon export layer and resource kinds remain the integration boundaries.

## User-visible changes

Controls remain available while scrolling, settings take less reading space, device-local options survive reopening where browser policy permits, desktop paragraphs are easier to scan, and cover information is less repetitive. Readers can use labelled teaching diagrams and navigate printed/PDF English pages without confusing them with Arabic source pagination. The updated review index and READ-ME describe exact draft coverage and file organization.

## Accessibility work

- Native buttons, radio groups, dialog semantics, labelled controls, skip link and visible focus.
- Keyboard containment/recovery, destination focus after Contents navigation, no focused action hidden behind the toolbar/dialog header, and polite save/denial feedback.
- 44px targets, 320px/200% text reflow, text-spacing overrides, bounded opaque top-layer surfaces, hit-testing and forced-colors checks across three engines.
- Arabic and attributed English Quran meanings stay paired; language metadata, source references and physical diagram direction are retained.
- Saved PDFs retain PDF 1.7, marked structure, headings, links, outlines, English document language and Arabic language spans. Every English source/prose/list/quotation/Quran meaning remains searchable in saved extraction, with no replacement/NUL/PUA text.
- Continuous themed paper/margins and footer raster contrast pass: Light 9.74:1, Dark 11.74:1, Navy 12.26:1 on representative page 8.

Automated/browser/PDF evidence does **not** establish complete WCAG or PDF-UA conformance. Real-device TalkBack/VoiceOver and PDF-reader assistive-technology acceptance remain pending; no connected physical device or NVDA installation was available for that acceptance.

## Tests added or updated

Fifteen tests across two files cover existing exact source coverage/Quran bindings, unchanged source text, retained illustrations/lists, cover/About completeness, validated metadata and future resource kinds, source-bound diagram geometry, normalized preferences, corrupt/denied storage and existing original-based Wird boundary corrections.

The full-edition browser verifier covers 27 reader configurations (three engines × three widths × three appearances), scanning both reader and options surfaces, plus three Contents/interaction journeys and three enlarged review-index cases. It asserts target geometry, no horizontal overflow, opaque bounded top-layer surfaces, theme-correct PDF links, focus containment/recovery/visibility, reload persistence, denied-storage recovery, spacing overrides, forced colors and fixed diagram direction. Each journey includes keyboard skip/navigation checks. The shared sample regression retains all 81 existing responsive/theme cases and keyboard/text-control checks.

The PDF verifier checks all 81 full-edition saved pages, source-to-English pagination in each appearance, complete translated extraction, source captions, Quran meanings, A5 geometry, tags/languages/outlines, paper colors and footer contrast. All 27 Light pages plus Dark/Navy page 8 are rendered. The three sample PDFs retain their previous 2/3/2-page pagination and pass their saved text/language/tag checks.

## Commands run

| Command                                                                                                                              | Result                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node scripts/english-book-editions.mjs` with bundled Python in `BOOK_PYTHON`                                                        | PASS: 16 source units, 9 Quran pairs; HTML, 3 × 27-page PDFs, stable pagination sidecar, comparison records, index and READ-ME generated.                               |
| `node scripts/english-book-samples.mjs` with the same Python                                                                         | PASS: all 3 samples, each with 3 Quran pairs, regenerated using shared foundations.                                                                                     |
| `pnpm exec vitest run scripts/english-book-editions.test.mjs scripts/english-book-samples.test.mjs`                                  | PASS: 2 files, 15 tests; final run 7.00 s.                                                                                                                              |
| Targeted `pnpm exec eslint` for the preference/controller, asset/diagram, edition/sample generator/test and browser-verifier scripts | PASS, exit 0.                                                                                                                                                           |
| Targeted `pnpm exec prettier --check` for the affected JS/CSS/authoring JSON and phase/documentation files                           | PASS: all matched files use Prettier style.                                                                                                                             |
| `node scripts/verify-english-book-editions.mjs`                                                                                      | PASS: 27 reader configurations, 3 interaction journeys and 3 enlarged index cases across Chromium/Firefox/WebKit; 0 selected axe violations and no horizontal overflow. |
| `node scripts/verify-english-book-samples.mjs`                                                                                       | PASS: 81 cases across 3 engines; keyboard skip and reading-size controls pass.                                                                                          |
| Bundled Python `scripts/verify-english-edition-pdfs.py`                                                                              | PASS: all 3 saved PDFs, 27 pages each, exact source/English page map, complete English/Quran text, tags/languages/outlines, paper and footer regressions.               |
| Bundled Python `scripts/verify-english-book-pdfs.py`                                                                                 | PASS: 3 sample PDFs, 7 total pages, existing pagination/text/Quran/language/tag checks.                                                                                 |
| Final review ZIP inventory/CRC and byte-for-byte source comparison                                                                   | PASS: explicit packaged file list, all entries readable and identical to the verified source files.                                                                     |

Intermediate checks caught native Tab escape, an asynchronous WebKit close-event assertion, partially hidden keyboard focus at the lower dialog edge, a browser default dialog width that split words at 320px/200%, and dark print-canvas interference. The controller, surface styles, print appearance handling and readiness assertion were corrected. No assertion, contrast threshold, coverage requirement or budget was weakened. Final evidence supersedes earlier diagnostic screenshots/results.

Full app release gates (`pnpm check`, release browser suite, Pages build, audit and CI/deploy) are not claimed for this standalone publication polish. No application release was requested; the local publication hold remains in force.

## Visual/manual evidence

`output/pdf/english-book-editions-2026-11-25/evidence/` contains:

- `browser-verification.json`, `reader-interaction-verification.json`, `review-index-verification.json` and `pdf-verification.json`.
- Final desktop/phone reader, enlarged Navy reading-options and enlarged review-index screenshots.
- Tawaf and sa'i desktop screenshots.
- All 27 Light page PNGs, Dark/Navy page 8 and five Light contact sheets inspected for cover/contents, headings, photos, diagrams, bilingual passages and full About details. Later controller/dialog-only refinements do not change printed reading geometry.

The final narrow-screen options screenshot was inspected directly after correcting the word splitting; the heading now wraps by complete words, size controls remain compact, and Download Navy PDF remains readable. Earlier diagnostic captures in `output/playwright/english-reader-polish/` are not release acceptance evidence.

The review package contains the self-contained HTML/index, three themed PDFs, pagination/source records, source-review notes, this report and compact JSON verification evidence. Keep the PDFs beside the HTML for its download controls.

## Documentation updated

The phase, working index, owner decision log, content-authoring contract and Learn delivery contract describe the shared renderer, standalone storage key, source-bound diagram requirements, stable pagination and exact translation/review boundaries. Generated READ-ME and this report replace the previous review package's 24-page checkpoint description; the historical checkpoint report is preserved in the repository.

## Decisions recorded

All eight polish recommendations are approved locally. More → Learn with an Azkar shortcut and future resource kinds remain unchanged. Arabic/English Quran pairings and all source text are preserved. Independent language/religious-source and physical-device/screen-reader acceptance remain separate. No commit, push, deployment or release-note edit is authorized for this checkpoint.

## Known limitations or remaining risks

- Full Al-Mukhtar and Wird English translations remain unfinished; the existing samples and prepared source corrections are not complete editions.
- Separately recorded Arabic original-source corrections have not been applied by this visual phase.
- The Umrah draft covers the current 16-page adaptation only. The inaccessible 138-page original has not been verified in full.
- Independent terminology/language/religious-source review, real-device assistive-technology testing and PDF reading-order acceptance remain pending.
- Local-file preference persistence follows browser policy; storage denial is handled without blocking reading.
- No runtime English catalogue option is added by generating review artifacts.

## Out-of-scope findings

The shared checkout contains independent Home, Settings, Learn and prior document work. It is preserved. No new source interpretation, app persistence migration or dependency is part of this change.

## Recommended next step

Continue the original-source reconciliation and complete English Al-Mukhtar/Wird authoring in reviewable batches, then perform independent language/religious-source and real-device/PDF-reader acceptance before language-specific Learn integration or publication.
