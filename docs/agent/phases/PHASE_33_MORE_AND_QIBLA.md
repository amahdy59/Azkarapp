# Phase Report — More and Qibla

## Objective

Keep primary navigation uncluttered while making Qibla, Masbaha, and Settings easy to find, then provide honest offline Qibla guidance with an optional live compass.

## Scope completed

- Replaced the Settings primary tab with More while retaining four labelled primary destinations.
- Added a responsive More screen for Qibla, Masbaha, and Settings.
- Added local great-circle Qibla bearing calculation from saved or current coordinates.
- Added a vector compass dial and a permission-gated live orientation enhancement.
- Preserved a usable north-based bearing for unsupported, denied, or silent sensors.

## Files changed

- Typed routing, app composition, navigation shells, icons, and bilingual copy.
- New Qibla calculation and More/Qibla screens.
- Focused unit, composition, routing, and browser coverage.
- Architecture, design-system, IA, decision, phase, and release documentation.

## Components added or modified

- Added `MoreScreen` and `QiblaScreen`.
- Modified all three responsive navigation variants through their shared tab definition.
- Added the existing icon system's vector compass export.

## User-visible changes

- Home, Azkar, Progress, and More remain the only primary destinations.
- Qibla, Masbaha, and Settings are one tap from More.
- Qibla shows a local degree/cardinal bearing immediately when saved coordinates exist.
- Supported mobile devices can enable a live compass; every failure keeps the static bearing usable.

## Accessibility work

- Preserved native buttons, 44px targets, visible focus, `aria-current`, route focus management, RTL DOM order, and reduced motion.
- Kept sensor updates out of live regions while announcing permission and fallback status changes.
- Paired the decorative SVG dial with visible numeric, cardinal, and turn guidance.

## Tests added or updated

- Added pure bearing, normalization, and shortest-turn tests.
- Added More action, Qibla fallback, routing, composition, and narrow browser coverage.
- Updated Settings navigation tests to traverse More.

## Commands run

| Command                                                    | Result                                        |
| ---------------------------------------------------------- | --------------------------------------------- |
| `pnpm format:check`                                        | Passed.                                       |
| `pnpm lint`                                                | Passed.                                       |
| `pnpm typecheck`                                           | Passed.                                       |
| `pnpm build:pages`                                         | Passed; bundle and CSS utility checks passed. |
| `pnpm install --frozen-lockfile`                           | Passed; lockfile already current.             |
| `pnpm check`                                               | Passed; complete repository check.            |
| `pnpm test:e2e`                                            | Passed; 397 tests, 1 intentionally skipped.   |
| `pnpm audit:prod`                                          | Passed; no known production vulnerabilities.  |
| Focused Vitest suites                                      | Passed; 37 tests.                             |
| Focused Playwright navigation, keyboard, and accessibility | Passed; 3 tests.                              |

## Visual/manual evidence

- Built-app browser checks passed at 320px, 834px, and 1440px with no horizontal overflow. Arabic mobile and desktop captures verified RTL order, readable navigation labels, vector dial geometry, and balanced card height.

## Documentation updated

- Architecture, design system, information architecture, decision log, phase index, and this report.

## Decisions recorded

- DEC-175.

## Known limitations or remaining risks

- Browser sensor APIs remain hardware- and browser-dependent. A real-device field check is required before claiming live-compass accuracy.

## Out-of-scope findings

- None.

## Recommended next step

- Commit the verified local result. Run a real-device compass calibration check before claiming live sensor accuracy.
