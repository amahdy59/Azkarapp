# Phase Report — Installed audio recovery and prayer notch

## Objective

Ensure installed readers receive the deployed Al-Kahf audio repair promptly and make the selected Home prayer expand into the requested responsive notched card.

## Scope completed

- Added an immediate service-worker update check at application startup while retaining the reader-controlled refresh prompt.
- Kept all five prayer summaries permanently available and changed selection to an in-place disclosure.
- Reused the existing prayer moment panel for time, virtue, congregation and after-prayer actions.
- Anchored the decorative notch to the selected prayer card so geometry follows real responsive tracks and RTL order.

## Files changed

The phase commit contains the exact list. Scope is limited to startup update discovery, Home prayer disclosure/notch behavior, focused tests, release notes and their contracts.

## Components added or modified

- `HomeScreen`
- `PrayerTrackerCards`
- PWA registration lifecycle

No new component or runtime dependency was added.

## User-visible changes

- An installed PWA checks for a waiting update as soon as it starts instead of waiting for a later visibility, online or hourly event.
- Selecting Fajr, Dhuhr, Asr, Maghrib or Isha expands that prayer directly below the five-prayer strip without changing route.
- The selected summary and responsive notch clearly identify which prayer owns the expanded panel.

## Accessibility work

- Preserved native buttons, prayer-specific accessible names and visible keyboard focus.
- Added disclosure state and ownership through `aria-expanded` and `aria-controls`.
- Kept the notch decorative and absent from the accessibility tree.
- Verified selection geometry in Arabic RTL and English LTR.

Automated checks support the result but do not constitute a claim of complete WCAG conformance.

## Tests added or updated

- Updated Home prayer browser coverage to assert in-place expansion and shared detail content.
- Added exact selected-card/notch centre checks in LTR and RTL.
- Re-ran focused delayed/recoverable Al-Kahf playback coverage.

## Commands run

| Command                          | Result                                                                                                            |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile` | Passed; lockfile already current                                                                                  |
| Focused TypeScript and Vitest    | Passed; 29 focused unit tests                                                                                     |
| Focused browser regressions      | Passed for prayer, audio, Mushaf and overlay behavior                                                             |
| `pnpm check`                     | Passed; 950 unit tests and all static gates                                                                       |
| `pnpm test:e2e`                  | Passed; 366 passed, 1 intentional skip, and 3 environment stalls passed on retry and again in an isolated 3/3 run |
| `pnpm build:pages`               | Passed, including bundle and CSS utility budgets                                                                  |

## Visual/manual evidence

- Inspected the live local Arabic glass composition at desktop width: the selected prayer remains in the stable strip, the centred notch bridges to the full-width expanded panel, and the panel uses a balanced two-column desktop anatomy.
- The complete browser gate covered 320px, 390px, OnePlus-class mobile, tablet and desktop reflow; glass/solid surfaces; Arabic RTL; English LTR; forced colors; text resizing; and automated WCAG A/AA scans.

## Documentation updated

- `docs/ARCHITECTURE.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/agent/DECISION_LOG.md` (DEC-166)
- `docs/agent/INDEX.md`
- This phase report

## Decisions recorded

- DEC-166

## Known limitations or remaining risks

- A reader still running an older installed build must accept its existing refresh prompt once; the new startup check governs launches after this release is installed.
- Playback remains dependent on browser media support and the published audio origin, with existing recoverable error controls retained.

## Out-of-scope findings

- No audio asset, Quran text, prayer calculation, religious source or persisted tracking schema changed.

## Recommended next step

Begin Phase 25 as a separately controlled notification-delivery architecture phase after this remediation is production verified.
