# Phase Report — Qibla permission recovery

## Objective

Diagnose the installed Android app's unmoving Qibla arrow and denied sensor access, make the limitation recoverable, and correct live-dial interpretation.

## Scope completed

- Kept explicit, absolute-first sensor permission; never bypassed a denied result.
- Limited Safari's legacy permission retry to a compatibility `TypeError`.
- Added actionable browser motion-sensor permission guidance and a clear static-bearing label.
- Rejected invalid negative WebKit compass headings and rotated north marks with the live arrow.

## Files changed

- Qibla screen, bilingual copy, unit and browser tests, architecture/design contracts, phase and decision documentation, and release notes.

## Components added or modified

- Modified `QiblaScreen`; no dependency or persisted-state change.

## User-visible changes

- Denied sensor access now explains the browser setting to check instead of leaving a frozen, unexplained arrow.
- A north-based fallback is labelled as static, while the live dial's north marks follow valid headings.

## Accessibility work

- Retained the 44px native permission control, polite status, text bearing, RTL/LTR reading order, reduced-motion option, and no announcement for every heading sample.

## Tests added or updated

- Added invalid-heading, denied-permission, static-bearing, and dial-rotation unit assertions, plus an Android-sized browser denial regression.

## Commands run

| Command                          | Result                                                                                    |
| -------------------------------- | ----------------------------------------------------------------------------------------- |
| Focused Qibla Vitest             | 13 passed                                                                                 |
| Focused Qibla denial Playwright  | 3 passed                                                                                  |
| `pnpm install --frozen-lockfile` | Passed; lockfile current                                                                  |
| `pnpm check`                     | Passed all repository checks                                                              |
| `pnpm test:e2e`                  | 385 passed, 1 skipped; one unrelated custom-counter case passed on automatic retry        |
| `pnpm build:pages`               | Passed; PWA generation, bundle-budget check, and CSS-utility check completed successfully |

The final release handoff records push and production deployment results.

## Visual/manual evidence

- User-supplied installed Android screenshot: no permission prompt, denied status, static 136° Cairo bearing.
- Physical retest is required after changing the site's motion-sensor permission; no desktop emulator can grant hardware access for that device.

## Documentation updated

- Architecture, design system, decision log, phase index, this report, and release notes.

## Decisions recorded

- DEC-193.

## Known limitations or remaining risks

- A browser or device that denies motion-sensor permission cannot be overridden by a webpage. Physical-device permission and heading accuracy remain unverified until the reader retests.

## Out-of-scope findings

- The default location is Cairo until the reader selects or detects another location; this release does not change prayer-location persistence.

## Recommended next step

- Retest in Chrome and the installed app after confirming motion sensors are allowed for this origin; compare live direction with a physical compass.
