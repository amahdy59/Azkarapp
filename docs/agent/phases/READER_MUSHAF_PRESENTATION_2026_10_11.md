# Phase Report — Reader Mushaf presentation

## Objective

Apply the owner's approved presentation recommendations locally: first-use-only Reader guidance, Mushaf lettering for verified Quran content, calmer short-surah presentation and preserved offline reading.

## Scope completed

Reader guidance unmounts entirely after learning. Verified daily passages and existing cited Quran quotations share the Mushaf QCF loader, with original semantic content preserved and a bounded readable fallback. Daily fonts and page data are precached. Basmalah and headings reuse existing artwork, entry tools align with the text, and footer tools use quieter surfaces. Image export uses verified drawing data while keeping raw text intact.

## Files changed

Scoped changes span CounterGuidance and its hook; QuranVerseText, QuranWordText and QuranChrome; MushafExcerpt and the excerpt canvas; useQuranSnippet and useListeningMushafPage; canonical mapping and QCF URL resolution; Reader, library and benefits presentation; collection sharing; Sources attribution and bilingual copy; PWA precaching; the daily-font preparation script and four dated font assets. Existing unrelated edits from concurrent work are preserved.

| Area             | Scoped files                                                                                                                                                                                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Guidance         | `src/app/components/CounterGuidance.tsx`, its test, `src/app/hooks/useCounterGuidance.ts`, `e2e/review-reliability.spec.ts`, `e2e/devotional-footer.spec.ts`                                                                                                |
| Lettering        | `src/app/components/QuranVerseText.tsx`, its test, `QuranWordText.tsx`, `QuranChrome.tsx`, `MushafExcerpt.tsx`, its test, the excerpt-only section of `MushafPageViewer.tsx`, `src/app/hooks/useQuranSnippet.ts`, `useListeningMushafPage.ts`, its new test |
| Data/assets      | `src/app/content/mushafExcerpts.ts`, its test, `qcfMushaf.ts`, its test, `scripts/prepare-daily-quran-fonts.mjs`, `public/fonts/qcf-v2/2026-10-11/`, `vite.config.ts`                                                                                       |
| Screens          | `src/app/screens/ReaderScreen.tsx`, `ReaderScreen.css`, `AzkarLibraryScreen.tsx`, `BenefitsScreen.tsx`, `WirdBenefitsScreen.tsx`, `src/app/components/AzkarListItem.tsx`, `reader-footer.css`                                                               |
| Sharing          | `src/app/share/quranGlyphs.ts`, its new test, `shareLayout.ts`, `collectionShareCard.ts`, `src/app/components/CollectionShareModal.tsx`                                                                                                                     |
| Attribution      | `src/app/screens/settings/SourcesPanel.tsx`, `src/app/i18n/ar.ts`, `en.ts`                                                                                                                                                                                  |
| Browser coverage | `e2e/reader-mushaf-lettering.spec.ts`, `quran-snippet-typography.spec.ts`, `offline-core.spec.ts`, `khatmah-reader.spec.ts`                                                                                                                                 |
| Isolation/docs   | `src/test/isolatedSuites.ts`, architecture, design system, decision log, agent index and this report                                                                                                                                                        |

## Components added or modified

Added QuranGlyphSlice and useQuranSnippet. Modified the existing guidance, Quran text, short-surah chrome and excerpt components; no runtime dependency added.

## User-visible changes

Returning readers have no counting strip or hand button. Daily Quran passages use authentic page glyphs online and offline after installation. Rare-word help keeps the same lettering. Missing/unverified glyph data remains readable. Sharing measures and draws its chosen font consistently.

## Accessibility work

Original Arabic words and numeric markers remain semantic text; painted QCF codes are hidden from assistive technology. Existing word-help names, keyboard controls, focus and reduced-motion behavior remain. Responsive widths, enlarged text and axe checks are part of verification; physical device and screen-reader review are still required.

## Tests added or updated

Guidance absence and persistence; explicit quotation mapping and rejection; late-font upgrades; QCF/fallback rendering and semantic preservation; image-only drawing data; same-origin font/data URLs; Reader/playback typography, glossary, enlarged text, responsive layout and first-offline-use coverage.

## Commands run

| Command                                                                                               | Result                                                                                                                                                                                                                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm verify:toolchain`                                                                               | Passed: Node 24 and pnpm 11.19.0.                                                                                                                                                                                                                                                                                                                |
| Focused component suite                                                                               | 41 tests passed; later expanded component/share suite: 52 passed.                                                                                                                                                                                                                                                                                |
| Font notification and image drawing tests                                                             | 4 passed in 2 files.                                                                                                                                                                                                                                                                                                                             |
| Initial targeted Chromium browser suite                                                               | 37 passed, 7 failed; investigated test seeding, persistence assertions and enlarged text before rerunning.                                                                                                                                                                                                                                       |
| `pnpm check`                                                                                          | Build, typecheck, bundle/CSS budgets, toolchain and all content/timing/motion checks passed. Unit gate: 1689 passed, 4 failed because new mock suites were not yet isolated. Lint found seven new-script/mapper issues; format found the concurrently edited coordinated-release report. The owned unit/lint issues were subsequently corrected. |
| Isolation policy and corrected mock suites                                                            | 17 tests passed in 5 files.                                                                                                                                                                                                                                                                                                                      |
| Final renderer/guidance/excerpt/mapping/share unit suite                                              | 76 tests passed in 9 files.                                                                                                                                                                                                                                                                                                                      |
| Scoped ESLint, Prettier and `git diff --check`                                                        | Passed after repairs.                                                                                                                                                                                                                                                                                                                            |
| Offline and returning-reader browser rerun                                                            | 8 passed; both glyph cases still failed and were investigated. First offline QCF use, counting persistence and all four learned-guidance cases passed.                                                                                                                                                                                           |
| `pnpm test:e2e e2e/reader-mushaf-lettering.spec.ts --output=output/playwright/reader-mushaf-verified` | 36 passed in 5.3 minutes on a fresh production build: all six daily passages in Arabic and English across Chromium, Firefox and WebKit. Independent passage cases retain every responsive, font, playback and cleanup assertion; layout geometry waits for settling without changing thresholds.                                                 |
| Final pause-sign renderer/share/mapping suite                                                         | 14 tests passed in 3 files; scoped ESLint passed. Original pause signs remain semantic; canonical QCF signs paint once.                                                                                                                                                                                                                          |

## Visual/manual evidence

English and Arabic Al-Ikhlas QCF screenshots were visually inspected. Authentic lettering, shared basmalah artwork and absence of the learned guidance strip are visible. Arabic phone and desktop evidence is in `output/playwright/reader-mushaf-ar-390.png` and `output/playwright/reader-mushaf-ar-1440.png`. Responsive widths 320, 390, 820 and 1440px, rare-word controls, axe and 200% text are asserted in the focused browser cases. Original owner screenshot defines the requested change. Fresh browser evidence lives under ignored `output/playwright/reader-mushaf-verified/`.

## Documentation updated

Architecture, design system, decision log, agent index and this report record the superseding local contract. Font manifest records sources, sizes and SHA-256 hashes.

## Decisions recorded

Account confirmed by owner; public font assets require no API secret. Reviewed religious content and counts remain unchanged. First-use offline bundle covers four daily pages; other page fonts use the existing remote/cache path.

## Known limitations or remaining risks

The owner explicitly resolved the conflicting publication instructions by selecting “Keep the release on hold”. No commit, push or deployment has occurred in this phase; publication requires renewed authorization. Other pages need a prior cached font for QCF while offline; readable fallback remains. Automated accessibility evidence does not establish complete WCAG compliance. Concurrent repository changes mean whole-repository checks cover the combined workspace. The coordinated release chat will rerun the final combined quality and full browser suites once all owners finish; this report does not claim those have passed.

## Out-of-scope findings

No credentials, reviewed source text, persistence schema, full-page Mushaf fitter or deployment settings changed.

## Recommended next step

Hand off the settled scope and evidence to the coordinated release for combined local gates. Keep publication on hold until renewed authorization; review the presentation on the owner's Android device and with assistive technology.
