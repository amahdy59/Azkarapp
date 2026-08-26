# Phase Report — Quran Mushaf chrome and monthly progress

## Objective

Make the standalone Mushaf controls visually cohesive and operable, repair Word meanings, add a restrained page-turn transition, and simplify monthly Quran plans around the current named month and its progress.

## Scope completed

- Standardized top and bottom Mushaf action geometry within the existing chrome.
- Added the desktop Settings label while retaining compact icon-only controls.
- Repaired complete chapter loading and reviewed/sourced Word-meaning merging.
- Added a compositor-only directional page entrance with reduced-motion gating.
- Replaced redundant monthly overview panels with one named-month progress summary.
- Corrected Hijri and Gregorian plans to finish at the end of the current month.

## Files changed

- `src/app/App.tsx`
- `src/app/components/MushafPageViewer.tsx`
- `src/app/content/quranWordMeanings.ts`
- `src/app/screens/KhatmahReaderScreen.tsx`
- `src/app/screens/QuranWirdScreen.tsx`
- `src/app/screens/quranWirdGoal.ts`
- Arabic and English i18n, unit tests, browser tests, design-system documentation, decision log, and release notes.

## Components added or modified

- `MushafPageViewer`
- `KhatmahReaderScreen`
- `QuranWirdScreen`
- Quran Word-meaning content loader
- Quran month-duration resolver

## User-visible changes

- Header and footer actions use a consistent 44px height, compact padding, radius, border, surface, focus, and selected treatment.
- Settings is labelled on desktop and remains icon-only on smaller screens.
- Word meanings can be enabled on previously unresponsive Al-Baqarah pages and do not claim to be ready before the visible chapter data loads.
- Page buttons and keyboard turns settle with a fast directional fade; direct drag behavior is unchanged.
- Hijri and Gregorian plans show the current month name and one monthly page-progress bar.
- Monthly/free plans omit duplicate Mushaf-position and weekly summaries; daily plans retain the useful weekly view.

## Accessibility work

- Preserved semantic switch, button, progressbar, and radio-group behavior.
- Kept ordinary targets at 44 CSS px.
- Added a non-colour selected cue to Word meanings.
- Awaited study data before changing the switch state and exposed its busy state.
- Honoured both system and in-app reduced-motion preferences.
- Preserved Arabic RTL alignment and physical Mushaf navigation order.

## Tests added or updated

- Complete sourced chapter plus reviewed override merge.
- Async Word-meaning switch readiness.
- Mushaf transition direction hook.
- Desktop/mobile Settings-label visibility and toolbar geometry.
- Uncached Al-Baqarah Word-meaning activation.
- Gregorian and Hijri current-month boundaries.
- Named month progress and monthly clutter removal.

## Commands run

| Command                          | Result                                        |
| -------------------------------- | --------------------------------------------- |
| `pnpm install --frozen-lockfile` | Passed; lockfile already current              |
| `pnpm check`                     | Passed all stages in 52.6s                    |
| `pnpm test:e2e`                  | 321 passed in 8.4m                            |
| `pnpm build:pages`               | Passed; bundle and CSS utility budgets passed |
| `pnpm run check:release-notes`   | Passed; manifest describes pending deployment |

The first standard and Pages builds correctly rejected added transition CSS at the fixed CSS budget. The final implementation reuses the native Web Animations compositor path; no budget was raised and the final gates pass.

## Visual/manual evidence

- In-app Browser: Arabic midnight overview at 1440×900 confirmed the named Hijri month, single progress summary, correct RTL alignment, and removed duplicate panels.
- In-app Browser: standalone Mushaf at 1440×900 confirmed labelled Settings and balanced top/bottom control padding.
- In-app Browser: standalone Mushaf at 390×844 confirmed compact controls, hidden Settings text, correct RTL layout, and reachable footer actions.
- Word meanings were manually enabled and rendered as clickable, non-reflowing highlights on the live local Mushaf.

## Documentation updated

- `docs/DESIGN_SYSTEM.md`
- `docs/agent/DECISION_LOG.md`
- `public/release-notes.json`

## Decisions recorded

- DEC-104 now defines month plans by the remaining days to the current calendar boundary.
- DEC-105 records cohesive Mushaf chrome, complete Word-meaning merging, directional compositor motion, and the simplified monthly overview.

## Known limitations or remaining risks

No known functional limitation remains in the implemented scope. Automated accessibility results supplement, but do not replace, the recorded keyboard and responsive visual checks.

## Out-of-scope findings

None.

## Recommended next step

Deploy the verified commit, confirm both GitHub workflows, and repeat the focused Quran overview and Mushaf smoke checks against production assets.
