# Phase Report — Quran reader polish

## Objective

Make Al-Kahf audio dependable on slow starts and make Quran reading faster,
cleaner, and better aligned without changing reviewed Quran or audio content.

## Scope completed

- Hardened the approved Al-Kahf recitation's lazy-controller readiness path.
- Warmed the nearest Mushaf pages and QCF fonts before a reader turns.
- Removed the unusable non-CORS legacy font fallback.
- Reduced page-turn travel to the documented crisp transition.
- Removed ornamental outlines from opening pages and short-surah passages.
- Made opening-page line spacing deterministic.
- Aligned the ayah action sheet in RTL and LTR.
- Made word meanings opt-in by default for short surahs.

## Files changed

See the phase commit for the exact list. The change is limited to the app audio
orchestration, Quran reader components/styles/tests, release notes and these
contracts.

## Components added or modified

- `AppContent`
- `AyahInteractionSheet`
- `MushafPageViewer`
- `KhatmahReaderScreen`
- `ReaderScreen`

The unused `MushafOpeningFrameArt` component was removed.

## User-visible changes

- Al-Kahf's listen action no longer appears unavailable while audio initializes.
- The Mushaf warms likely page turns sooner and settles with less lateral motion.
- Ayah actions are compact and aligned beside their icons.
- Short surahs show clean canonical Quran text without a double outline.
- Word meanings begin switched off.
- Pages 1–2 have consistent vertical line spacing and no ornamental frame.

## Accessibility work

- Preserved explicit user initiation for audio; no autoplay was added.
- Preserved semantic button/switch behavior, keyboard order and visible focus.
- Used logical-start alignment for Arabic and English layouts.
- Preserved reduced-motion and Save Data behavior.

Automated checks support the result but do not constitute a claim of complete
WCAG conformance.

## Tests added or updated

- Delayed audio-controller regression for Al-Kahf.
- Preparing-audio control state regression.
- Ayah-sheet logical alignment regression.
- Canonical short-surah/no-outline and meanings-default regression.
- Opening-page spacing/no-outline and page-transition contract regressions.

## Commands run

| Command                          | Result                         |
| -------------------------------- | ------------------------------ |
| Focused Quran/font Vitest        | 57 passed                      |
| `pnpm install --frozen-lockfile` | Passed; lockfile unchanged     |
| `pnpm check`                     | Passed in 75.2s                |
| `pnpm test:e2e`                  | 364 passed, 1 skipped in 13.9m |
| `pnpm build:pages`               | Passed; bundle budgets passed  |

The release commit, workflow and production results are recorded after this
report's local gate is complete.

## Visual/manual evidence

- 390×844 opening-page screenshot: seven equal 98.08px line tracks, 0px border,
  no outline.
- 390×844 ayah-sheet screenshot: Arabic text and icon-label actions aligned to
  logical start.
- 390×844 short-surah screenshot: one canonical passage, zero ornamental
  passage frames, meanings switch off.
- Warmed page turn measured at 167ms in the built app.

## Documentation updated

- `docs/DESIGN_SYSTEM.md`
- `docs/agent/DECISION_LOG.md` (DEC-163)
- This phase report

## Decisions recorded

- DEC-163

## Known limitations or remaining risks

- Chrome performance tracing is unavailable in this environment, so performance
  evidence uses repository tests and built-app Playwright timing instead.
- The remote QCF font host still determines the first cold render of a page that
  has never been cached; nearby turns are now warmed earlier.

## Out-of-scope findings

- None.

## Recommended next step

Deploy the verified artifact, then verify the exact production commit and
Quran/audio smoke paths.
