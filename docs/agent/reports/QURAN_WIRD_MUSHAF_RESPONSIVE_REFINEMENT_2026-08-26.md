# Phase Report — Quran Wird and Mushaf responsive refinement

## Objective

Apply the approved non-feature recommendations from the Quran Wird and Mushaf UX audit across mobile, tablet, and desktop while preserving canonical Mushaf pagination and reviewed Quran content.

## Scope completed

- Unified the complete-Mushaf downloader with the reader's current versioned page and font caches.
- Made a complete offline download fail honestly when any required page or QCF font fails.
- Settled each page atomically on a ready QCF font or a stable Unicode fallback.
- Clarified the single continue-reading place versus the separate page-bookmark collection.
- Corrected actions and labels to use the page actually visible while a requested page is resolving.
- Refined the Wird overview hierarchy, target calculation, weekly states, form labels, and wide-screen layout.
- Made Arabic Quran summary and tracker alignment explicitly right-aligned instead of relying on inherited logical alignment.
- Improved direct pointer response during page turns without adding page-curl effects.
- Refined the Mushaf index and settings density, Arabic-only metadata, rendering cost, descriptions, and transitions.
- Added focus containment, reduced-motion behavior, consistent physical navigation, and 44 px header controls to immersive Mushaf mode.

## Files changed

- `src/app/content/qcfMushaf.ts`
- `src/app/content/mushafOfflineCache.ts`
- `src/app/content/mushafOfflineCache.test.ts`
- `src/app/screens/KhatmahReaderScreen.tsx`
- `src/app/screens/KhatmahReaderScreen.test.tsx`
- `src/app/screens/QuranWirdScreen.tsx`
- `src/app/screens/QuranWirdScreen.test.tsx`
- `src/app/screens/ReaderScreen.tsx`
- `src/app/components/MushafImmersiveReader.tsx`
- `src/app/components/MushafNavigationModal.tsx`
- `src/app/components/MushafNavigationModal.test.tsx`
- `src/app/components/MushafSettingsSheet.tsx`
- `src/app/i18n/ar.ts`
- `src/app/i18n/en.ts`
- `e2e/khatmah-reader.spec.ts`
- `e2e/mushaf-immersive.spec.ts`
- `public/release-notes.json`

## Components added or modified

No new component or runtime dependency was added. The existing Wird screen, Mushaf reader, immersive reader, navigation dialog, settings sheet, QCF loader, and offline download boundary were modified in place.

## User-visible changes

- Complete offline downloads now cache exactly the assets used by the live reader and no longer claim success with missing fonts.
- QCF private glyphs are never mounted before their page font is usable; a stable readable fallback is used when necessary.
- The continue-reading pin is visibly and verbally distinct from page bookmarks.
- Today's target skips pages already credited today, and past zero-reading days show `0 / goal` while future days remain neutral.
- Wide Wird layouts use two balanced columns without stretching short cards into empty panels.
- Arabic tracker and Home Quran-card copy is explicitly right-aligned; English remains explicitly left-aligned.
- Mushaf paper follows the pointer directly, index rows avoid English leakage in Arabic, and the page tab remains one line on phones.
- Immersive controls follow the same physical direction as the main Mushaf reader.

## Accessibility work

- Added proper label-to-control relationships for plan type and numeric plan inputs.
- Added direction-specific text alignment and retained RTL direction for mixed Arabic Quran metadata.
- Added an informative index dialog description instead of repeating its title.
- Replaced the hand-built immersive dialog with the existing Radix focus-containment primitive.
- Raised immersive meaning and close controls from 40 px to the 44 px product baseline.
- Applied the saved reduced-motion preference to paper settling and progress animation.
- Kept dynamic page announcements scoped and preserved canonical semantic ayah text for QCF pages.

## Tests added or updated

- Added offline cache-name, versioned-URL, removal, and required-font failure regressions.
- Added Wird unread-target and form-label regressions.
- Added continue-place versus page-bookmark wording coverage.
- Added unit and responsive browser regressions for explicit Arabic right alignment.
- Added immersive focus-containment and 44 px browser assertions.
- Updated index and responsive browser expectations for the refined labels.

## Commands run

| Command                             | Result                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------ |
| `pnpm install --frozen-lockfile`    | Passed; lockfile already current                                                           |
| Focused Vitest suite                | 48/48 tests passed across 6 files                                                          |
| Focused responsive Playwright suite | 6/6 current RTL and reader checks passed across desktop, mobile, and tablet Chromium       |
| `pnpm check`                        | Passed in 33.2 s after formatting the focused RTL assertion                                |
| `pnpm test:e2e`                     | 315/315 passed in 8.0 min across Chromium tiers, Firefox smoke, and mobile WebKit smoke    |
| `pnpm build:pages`                  | Passed; 1,932 modules transformed, service worker generated, bundle and CSS budgets passed |
| `pnpm run check:release-notes`      | Passed                                                                                     |

## Visual/manual evidence

- Inspected the live local Arabic flow at 390 × 844, 820 × 1180, 1,440 × 900, and 1,440 × 1,000.
- Confirmed a clear single-column mobile Wird view, balanced two-column desktop overview, full-screen phone Mushaf, single portrait-tablet page, and authoritative 187/188 desktop spread.
- Inspected settled mobile index and settings surfaces for opacity, density, wrapping, and Arabic metadata.
- Confirmed no horizontal overflow in DOM geometry. Development-only duplicate-root warnings occurred during hot reload after source edits; the production browser suite was clean.

## Documentation updated

- Added this phase report.
- Replaced `public/release-notes.json` with release-only Arabic and English outcomes for `2026-08-26a`.

## Decisions recorded

- No new product feature was introduced.
- Canonical 604-page pagination, 15-line geometry, reviewed Quran text, and existing reader state contracts were preserved.
- Feature proposals remain gated on explicit owner approval.

## Known limitations or remaining risks

- Large-text/reflow reading would require a separate non-canonical presentation mode and owner approval.
- Suggested plan shortcuts, a first-use gesture hint, and a persistent wide-screen side panel remain unimplemented feature proposals.
- The five existing Mushaf themes were retained; reducing or merging them would remove existing user choice and needs a product decision.

## Out-of-scope findings

None discovered that blocks this release.

## Recommended next step

Obtain explicit owner decisions on the four feature proposals, then implement each approved item as its own tested batch.
