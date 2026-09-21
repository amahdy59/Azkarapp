# Phase Report — Qibla compatibility and Progress clarity

## Objective

Restore live-compass permission compatibility and make dense Progress periods easier to scan on compact screens.

## Scope completed

- Added a compatibility fallback for Safari's earlier no-argument orientation permission method.
- Kept Week, Month, and Year prayer totals visible while moving the five-prayer matrix behind a named disclosure.
- Removed the repeated supporting quotation from compact Progress layouts.

## Files changed

- Qibla screen and tests
- Progress screen, prayer statistics, localization, and tests
- Responsive browser coverage, architecture, design-system guidance, decision log, phase index, this report, and release notes

## Components added or modified

- `QiblaScreen`, `ProgressScreen`, and `PrayerTrackerStats`; no new runtime dependency.

## User-visible changes

- Compatible Safari versions can retry the established sensor permission path when the newer absolute request is rejected.
- Longer Progress periods open with concise totals and reveal detailed prayer rows only when requested.

## Accessibility work

- Preserved explicit permission activation, status feedback, native disclosure semantics, keyboard use, textual totals, RTL/LTR order, and 44px targets.

## Tests added or updated

- Added permission fallback plus live-heading wiring coverage and unit/browser disclosure coverage.

## Commands run

| Command                                                   | Result                                                                 |
| --------------------------------------------------------- | ---------------------------------------------------------------------- |
| Focused Qibla, Progress, and prayer-statistics unit tests | 13 passed                                                              |
| Focused 375px Progress browser suite                      | 5 passed                                                               |
| `pnpm install --frozen-lockfile`                          | Passed; lockfile current                                               |
| `pnpm check`                                              | Passed all repository checks                                           |
| `pnpm test:e2e`                                           | Passed all 384 tests; one unrelated Home geometry case passed on retry |
| `pnpm build:pages`                                        | Passed; PWA and bundle checks passed                                   |

The final release handoff records push and production deployment results.

## Visual/manual evidence

- Audited Day, Week, and Month at 390×844 and wide desktop; verified the updated Week layout at 390×844 in the in-app browser.

## Documentation updated

- Updated the Qibla compatibility contract, Progress hierarchy guidance, decision log, and phase index.

## Decisions recorded

- DEC-191.

## Known limitations or remaining risks

- Desktop emulation cannot prove physical compass accuracy or every Safari/iOS permission implementation.

## Out-of-scope findings

- No prayer, devotional, bearing, or persisted content changed.

## Recommended next step

- Verify permission and heading updates on a current iPhone and Android device.
