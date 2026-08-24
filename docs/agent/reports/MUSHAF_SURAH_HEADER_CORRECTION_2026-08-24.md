# Phase Report — Mushaf Surah header correction

## Objective

Replace the under-detailed Surah heading with the approved compact curved treatment and make Bismillah sizing consistent without altering the canonical fifteen-line page geometry.

## Scope completed

- Implemented the reference's modern-curved option as code-native ornamentation.
- Unified ordinary and one-slot Bismillah rendering through one fitter-independent size rule.
- Preserved all canonical line slots, Quran text, page fitting, and At-Tawbah behavior.

## Files changed

- `src/app/components/MushafPageViewer.tsx`
- `src/app/components/MushafPageViewer.test.tsx`
- `e2e/khatmah-reader.spec.ts`
- `docs/DESIGN_SYSTEM.md`
- `docs/agent/DECISION_LOG.md`
- `docs/agent/reports/MUSHAF_SURAH_HEADER_CORRECTION_2026-08-24.md`
- `public/release-notes.json`

## Components added or modified

- Added the shared `MushafSurahHeader`, `CurvedHeaderRosette`, and `BismillahText` presentation boundaries inside the page viewer.
- Updated ordinary, combined one-slot, and no-Bismillah Surah-opening paths to use the same heading contract.

## User-visible changes

- Surah names now sit inside a thin curved gold frame with balanced rosettes and real Arabic text.
- The Bismillah has the same compact size on every page at the same viewport.
- The ornament adapts through theme tokens and remains restrained on short phones and facing-page spreads.

## Accessibility work

- The Surah name is a semantic level-two heading.
- Decorative SVGs are hidden from assistive technology and cannot receive focus.
- The heading text remains real selectable Arabic rather than text embedded in an image.

## Tests added or updated

- Unit coverage verifies the curved variant, semantic heading, decorative SVG attributes, and shared Bismillah size.
- Browser coverage compares computed Bismillah size on ordinary and combined openings at 320×568, confirms fifteen slots, and checks clipping, overlap, horizontal overflow, and At-Tawbah's exception.

## Commands run

| Command                               | Result                                                              |
| ------------------------------------- | ------------------------------------------------------------------- |
| Focused `MushafPageViewer` unit test  | 10 passed                                                           |
| Focused `khatmah-reader` browser test | 2 passed                                                            |
| TypeScript typecheck                  | Passed                                                              |
| `pnpm install --frozen-lockfile`      | Passed; lockfile already up to date                                 |
| `pnpm check`                          | Passed in 145.8s                                                    |
| `pnpm test:e2e`                       | 315 passed in 14.8m                                                 |
| `pnpm build:pages`                    | Passed; 1,932 modules, 155-entry PWA precache, bundle budget passed |
| `pnpm audit:prod`                     | Passed; no known vulnerabilities                                    |

## Visual/manual evidence

- 390×844: pages 2 and 77 render the Bismillah at the same computed `15.972px` size with zero horizontal overflow.
- 320×568: the combined opening renders an 11px title and 13px Bismillah without overlap; all fifteen slots remain present.
- Page 587: multiple headings and the long `سورة المطففين` title fit without clipping.
- Page 187: At-Tawbah shows its Surah heading and no Bismillah.
- Light, Dark, Midnight, and OLED themes retain readable ink and semantic gold ornament colour.
- 1440×900: a desktop facing-page spread retains a 43.2px center gutter and zero overflow.

## Documentation updated

- Clarified the immutable line-slot geometry and fitter-independent Bismillah rule in the design system.
- Recorded DEC-103.
- Replaced the deployed release-note manifest with this release's user-visible outcomes.

## Decisions recorded

- DEC-103 selects the modern-curved option and prohibits image assets, filters, extra line slots, and page-fitting changes for this treatment.

## Known limitations or remaining risks

- Browser screenshots were inspected live and are not committed as repository assets.
- The compact one-slot heading necessarily has less ornament height than a full-slot heading, while the Bismillah remains identical in size.

## Out-of-scope findings

- None included; unrelated user scratch files in the worktree were left untouched.

## Recommended next step

Deploy to GitHub Pages and repeat the ordinary/combined/At-Tawbah production smoke check.
