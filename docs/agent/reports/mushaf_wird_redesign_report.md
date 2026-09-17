# Phase Report — Quran Wird and QCF Mushaf refinement

## Objective

Make Quran Wird consistent with Home and the design system, then turn the standalone reader into a calm, self-contained Mushaf page with accurate Madani typography, accessible difficult-word meanings, and controls that recede while reading.

## Scope completed

- Renamed the destination to Quran Wird in Arabic and English and exposed the normal application navigation on its overview.
- Replaced the native reading-plan dropdown with the shared, RTL-aware Select component.
- Removed the separate application header and footer from the reader.
- Moved back, surah/juz navigation, meanings, theme, bookmark, page number, and previous/next actions into the Mushaf page chrome.
- Added automatic chrome hiding after reading begins, with pointer, keyboard, and explicit reveal paths.
- Added an off-by-default difficult-word toggle backed by the app's reviewed meaning catalogue.
- Integrated Quran Foundation QCF V2 page glyphs and per-page Madani fonts while preserving the reviewed local Quran text as semantic assistive-technology content.
- Kept the complete local 604-page Unicode/Amiri reader as the immediate offline fallback, and cached recently used QCF page data and fonts.

## Files changed

- `src/app/screens/KhatmahReaderScreen.tsx`
- `src/app/components/MushafPageViewer.tsx`
- `src/app/screens/QuranWirdScreen.tsx`
- `src/app/content/qcfMushaf.ts`
- `src/app/App.tsx`
- `src/app/i18n/ar.ts`
- `src/app/i18n/en.ts`
- `vite.config.ts`
- `src/app/content/qcfMushaf.test.ts`
- `src/app/components/MushafPageViewer.test.tsx`
- `src/app/screens/QuranWirdScreen.test.tsx`
- `e2e/khatmah-reader.spec.ts`
- `docs/DESIGN_SYSTEM.md`
- `docs/agent/DECISION_LOG.md`
- `docs/agent/reports/mushaf_wird_redesign_report.md`
- `public/release-notes.json`

## Components added or modified

- Added the QCF page-data parser, URL helpers, semantic merge boundary, and fetch helper.
- Modified `KhatmahReaderScreen`, `MushafPageViewer`, and `QuranWirdScreen`.
- Added no runtime dependency and changed no reviewed Quran wording, difficult-word meaning, page boundary, persistence shape, or synchronization contract.

## User-visible changes

- Home and the destination now use the same `ورد القرآن` / `Quran Wird` title.
- Quran Wird keeps the regular bottom or side navigation and uses the app's standard reading-plan selector.
- The reader presents one Mushaf surface instead of nested top and bottom bars.
- Its page chrome shows the required context and navigation, then hides after 3.5 seconds of reading inactivity without reflowing the 15-line page.
- QCF V2 uses the official page font and native verse-end glyphs, improving glyph shapes, line alignment, and verse-number placement.
- Difficult words remain visually clean until the reader enables meanings; enabled words use a color-independent underline and open the reviewed Arabic gloss.
- Swipe/drag, physical arrow keys, and visible previous/next controls remain equivalent page-navigation paths.

## Accessibility work

- The meaning preference is a labelled toggle with a pressed state; each enabled difficult word is a keyboard-operable button with a localized accessible name, visible focus, tint, and dotted underline.
- The integrated controls use native button semantics, localized labels, 44-pixel targets, and visible focus indicators.
- Keyboard focus prevents automatic chrome dismissal; pointer use can still allow the controls to recede.
- A persistent reveal control restores hidden chrome without requiring a gesture.
- QCF glyph spans are hidden from assistive technology while the byte-preserved local Quran verse remains available as semantic screen-reader text.
- Reduced-motion users receive the same page changes without lateral animation, and button/key alternatives remain available for swipe.

## Tests added or updated

- Unit tests cover official page/font URLs, defensive QCF parsing, semantic merging, Unicode fallback, QCF glyph rendering, the meanings toggle, and the shared Select interaction.
- Browser tests cover overview navigation, shell isolation in the reader, meaning visibility and activation, auto-hide/reveal, focus protection, swipe, arrow keys, and button navigation on desktop, mobile, and tablet.

## Commands run

| Command                                    | Result                                                                                                              |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`           | Passed; lockfile already current                                                                                    |
| `pnpm typecheck`                           | Passed                                                                                                              |
| `pnpm lint`                                | Passed                                                                                                              |
| Focused Vitest files                       | Passed; 3 files and 15 tests                                                                                        |
| Focused `khatmah-reader.spec.ts`           | Passed on desktop, mobile, and tablet Chromium                                                                      |
| `pnpm format:check`                        | Passed                                                                                                              |
| `pnpm run check:release-notes`             | Passed                                                                                                              |
| `pnpm check`                               | Passed; 104 files and 548 tests, coverage, production build, and bundle budget                                      |
| `pnpm test:e2e -- --workers=1 --retries=1` | Passed; 509 passed, 4 intentionally skipped, and one unrelated Settings test passed on retry                        |
| `pnpm build:pages`                         | Passed after rerunning outside the sandbox for a OneDrive `spawn EPERM`; PWA, bundle, and CSS utility checks passed |

## Visual/manual evidence

- Treated the supplied screenshots as visual references only and inspected the live implementation in the in-app browser.
- Verified the Arabic overview at 390×844: matching title, visible app navigation, shared Select trigger, compliant overlay, RTL selection state, and no document overflow.
- Verified live QCF V2 rendering, integrated visible and hidden chrome states, the page-42 meanings toggle, three reviewed difficult-word controls, and the inline gloss.
- At 320×700, 390×844, 768×1024, and 1110×835: 15 source lines, zero document overflow, zero page overflow, zero overflowing lines, and QCF V2 rendering active.
- Verified that hiding or restoring controls does not change the 15-line composition and that the browser console remains free of errors and warnings.

## Documentation updated

- Updated the Reader and Quran Wird contracts in `docs/DESIGN_SYSTEM.md`.
- Updated this phase report and replaced the release-note manifest with four matched Arabic and English outcomes for this release.

## Decisions recorded

- Recorded DEC-087: Quran Wird owns the application shell and progress; the reader owns its contextual chrome; meanings are explicitly enabled; QCF V2 is preferred with a semantic local fallback.

## Known limitations or remaining risks

- Exact QCF V2 typography requires network access on first use of a page. Recently opened QCF pages and fonts are cached, while every page remains immediately readable offline using the local Unicode/Amiri fallback.
- Automated accessibility, keyboard, and responsive evidence does not replace a manual TalkBack/VoiceOver session or a real-device safe-area check.

## Out-of-scope findings

- No Quran wording, page boundary, translation, attribution, difficult-word definition, reading-plan calculation, or saved-progress data was changed.
- The unrelated untracked audit-remediation checklist was preserved and excluded from this phase.

## Recommended next step

Run a brief real-device Arabic smoke pass with TalkBack and VoiceOver, including first-load offline fallback and a cached QCF page, after the production deployment is live.
