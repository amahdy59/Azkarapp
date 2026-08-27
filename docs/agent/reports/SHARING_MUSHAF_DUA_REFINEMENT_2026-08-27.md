# Phase Report — Sharing, Mushaf opening, and last-third dua refinement

## Objective

Make sharing accessible, themed, and RTL-safe; improve Bismillah legibility without changing canonical Mushaf geometry; and replace the Home sleep recommendation with a focused dua card during the calculated last third of the night.

## Scope completed

- Corrected both the progress-sharing dialog and generated zikr share image.
- Preserved the existing Surah heading because it already uses semantic Arabic text and an offline, theme-aware ornament inside one canonical slot.
- Increased the shared, fitter-independent Bismillah size.
- Added a prayer-time-derived final-third boundary and reused the reviewed comprehensive-dua route.

## Files changed

- `src/app/components/ShareableCardModal.tsx`
- `src/app/share/zikrShareCard.ts`
- `src/app/screens/HomeScreen.tsx`
- `src/app/components/HomeCards.tsx`
- `src/app/components/MushafPageViewer.tsx`
- `src/app/App.tsx`
- Arabic and English i18n, focused tests, release notes, and this decision/report.

## Components added or modified

- Modified `ShareableCardModal`, `PrayerRoutineCard`, `HomeScreen`, and `MushafPageViewer`.
- Added no runtime dependency or image asset.

## User-visible changes

- Arabic share content now follows RTL reading order and right alignment.
- The share dialog follows the selected semantic theme and presents statistics with explicit labels.
- Home shows a concise dua recommendation from the beginning of the last third until Fajr.
- The Bismillah is larger and consistent across ordinary and combined Surah openings.

## Accessibility work

- Logical close-button placement, visible focus, named dialog, live share status, semantic `dl`/`dt`/`dd`, and decorative emoji hidden from assistive technology.
- Dua-only state removes an inapplicable routine-mode radio group while retaining the labelled progress and 44px-plus CTA.
- Information is not conveyed by color alone.

## Tests added or updated

- Final-third boundary and recommendation coverage.
- Home dua-card rendering and action coverage.
- Arabic share-dialog direction and labelled-statistics coverage.
- Existing share-image, Mushaf fifteen-slot, combined opening, At-Tawbah, and share error/recovery tests retained.

## Commands run

| Command                          | Result                                                                                   |
| -------------------------------- | ---------------------------------------------------------------------------------------- |
| Focused Home timing tests        | 6 passed                                                                                 |
| Focused Home render tests        | 5 passed                                                                                 |
| Focused sharing and Mushaf tests | 22 passed                                                                                |
| `tsc --noEmit`                   | Passed                                                                                   |
| `pnpm install --frozen-lockfile` | Already up to date                                                                       |
| `pnpm check`                     | Passed: 632 unit tests plus format, lint, typecheck, build, audio, bundle, and CSS gates |
| `pnpm test:e2e`                  | 321 passed across desktop, mobile, tablet, Firefox smoke, and WebKit smoke               |
| `pnpm build:pages`               | Passed: Pages build, PWA generation, and bundle budget                                   |

## Visual/manual evidence

The full browser matrix verified 320px mobile, 390px mobile, OnePlus-class mobile, tablet, and desktop reflow; Arabic RTL; all app themes and forced colours; dialog accessibility; and the canonical Mushaf opening on desktop, mobile, and tablet. The baseline and evidence capture suites also completed successfully.

## Documentation updated

- `docs/agent/DECISION_LOG.md`
- `public/release-notes.json`
- This report.

## Decisions recorded

- DEC-107.

## Known limitations or remaining risks

- The generated PNG is visual media; accessible fallback text remains the share payload/alt-text contract rather than embedded image semantics.
- Exact real-Mushaf ornamental replication was intentionally avoided because the existing frame better preserves theme, offline use, and fixed geometry.

## Out-of-scope findings

- None currently.

## Recommended next step

Publish and verify the production release.
