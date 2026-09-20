# Phase Report — Mobile Qibla reliability

## Objective

Make the live Qibla direction reliable on supported mobile browsers by ensuring the dial follows only an earth-referenced compass heading.

## Scope completed

- Preserved Safari's WebKit compass-heading path and the existing user-activated iOS permission request.
- Accepted Android readings delivered through `deviceorientationabsolute` or an orientation event marked absolute.
- Rejected relative gyroscope alpha readings that can otherwise overwrite a valid compass heading.
- Kept the offline degree bearing and all existing sensor-denied or unavailable fallbacks.

## Files changed

- `src/app/screens/QiblaScreen.tsx`
- `src/app/screens/QiblaScreen.test.tsx`
- `docs/ARCHITECTURE.md`
- `docs/agent/DECISION_LOG.md`
- `docs/agent/INDEX.md`
- `docs/agent/phases/PHASE_44_MOBILE_QIBLA_RELIABILITY.md`
- `public/release-notes.json`

## Components added or modified

- `QiblaScreen` mobile orientation-event filtering.

## User-visible changes

- Supported Android phones no longer let a relative orientation stream pull the live Qibla dial away from magnetic north.
- iPhone and iPad compass behavior remains available through the browser's permission-gated WebKit heading.
- Phones without an absolute compass reading continue to show the usable degree bearing from north.

## Accessibility work

- Preserved the named permission control, polite status messages, reduced-motion behavior, text-equivalent bearing, and non-live decorative dial updates.

## Tests added or updated

- Added focused cases for the iOS WebKit heading, both Android absolute event paths, and rejection of relative orientation.

## Commands run

| Command                          | Result                                                                                  |
| -------------------------------- | --------------------------------------------------------------------------------------- |
| Focused Qibla Vitest suites      | Passed: 2 files, 11 tests                                                               |
| `pnpm install --frozen-lockfile` | Passed; dependencies already current                                                    |
| `pnpm check`                     | Passed in 68.3s; 1,030 unit tests and all quality/build budgets passed                  |
| `pnpm test:e2e`                  | Passed: 378 tests, 1 skipped, 1 unrelated Home geometry check passed on automatic retry |
| `pnpm build:pages`               | Passed; Pages build, PWA generation, bundle budget, and CSS utility checks passed       |
| `pnpm run check:release-notes`   | Passed; release notes describe the pending deployment                                   |

## Visual/manual evidence

- Automated event-source coverage verifies the compatibility paths. Real-device calibration remains required because desktop emulation cannot establish physical compass accuracy.

## Documentation updated

- Clarified the sensor-source contract in the architecture guide and recorded DEC-187.

## Decisions recorded

- DEC-187: mobile Qibla consumes only earth-referenced headings.

## Known limitations or remaining risks

- Browser sensor support, permission policy, hardware calibration, and magnetic interference remain device-dependent.

## Out-of-scope findings

- No bearing formula, location storage, navigation, devotional content, or desktop guidance changed.

## Recommended next step

- Verify the deployed build on one current Android device and one current iPhone before making a real-device accuracy claim.
