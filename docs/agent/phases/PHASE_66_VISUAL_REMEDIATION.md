# Phase Report — Phase 66: Visual remediation

## Objective

Close the screenshot-confirmed gaps left after Phase 65: app-themed dropdown overlays, rounded compact completion labels, and readable Qibla/Masbaha Home utilities in Light mode.

## Scope completed

- Replaced every remaining application JSX native select with the existing shared Radix Select primitive.
- Rounded the last shared radio-menu item and preserved overlay/item radius tokens across every dropdown family.
- Made compact Progress status labels retain the same full pill radius and padding as wider variants.
- Scoped the Home Qibla and Masbaha cards to the fixed on-media palette when they sit over photography.
- Audited remaining small or zero radii and retained only deliberate full-bleed shell geometry and inline Mushaf word/verse highlights.

## Files changed

Shared select/dropdown primitives, audio and notification settings, floating audio controls, development audio review, Progress views, Home, focused tests, the design-system contract, decision log, index, phase report, and release notes.

## Components added or modified

Modified `AudioSettingsPanel`, `NotificationsPanel`, `FloatingAudioPlayer`, `AudioContentReviewScreen`, `DropdownMenuRadioItem`, `MainDhikrGroupCard`, and the Home Qibla/Masbaha utility cards. No runtime dependency was added.

## User-visible changes

- Reciter and settings choices now open in a rounded, theme-matched app menu instead of an Android/browser-native dark sheet.
- Completed status labels remain rounded pills on compact Progress cards.
- Qibla and Masbaha titles, descriptions, icons, and actions remain readable on the Home photograph in Light mode.

## Accessibility work

- Preserved labelled combobox/listbox semantics, direction, keyboard selection, visible focus, selected indicators, and 44 px targets through the existing Radix primitive.
- Restored fixed on-media foreground and muted tokens for the two Light-theme Home utilities.
- Added browser checks for Light Home computed colors, menu geometry, and WCAG A/AA scans after the overlay closes.

## Tests added or updated

- Audio settings persistence now exercises the app-owned combobox and option flow.
- Progress asserts full compact pill geometry.
- Home asserts both devotional tools consume the on-media token scope.
- Playwright verifies Light Home utility colors, themed menu radii, absence of native selects, and the existing Masbaha/Qibla accessibility sweeps.

## Commands run

| Command                                                             | Result                                                                                    |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`                                    | Passed; lockfile already current                                                          |
| `pnpm check`                                                        | Passed in 62.8 s; 156 unit files / 1,104 tests passed                                     |
| Focused Vitest: Audio Settings, Notifications, Progress Views, Home | Passed                                                                                    |
| Focused Playwright Light/Home/menu/Masbaha/Qibla sweep              | Passed: 4 desktop and 4 mobile tests                                                      |
| `pnpm test:e2e`                                                     | Passed: 397 passed, 1 skipped; offline service-worker test passed on its configured retry |
| `pnpm build:pages`                                                  | Passed; bundle and CSS utility budgets passed                                             |
| `pnpm audit:prod`                                                   | Passed; no known vulnerabilities                                                          |

## Visual/manual evidence

Focused browser assertions use computed Light-theme colors and rendered overlay radius, so they cover the cascade and portal behavior that source-only checks missed. The complete desktop/mobile/tablet matrix and Firefox/WebKit smoke projects passed. Production smoke evidence is recorded after deployment.

## Documentation updated

Updated `docs/DESIGN_SYSTEM.md`, `docs/agent/INDEX.md`, `docs/agent/DECISION_LOG.md`, this phase report, and `public/release-notes.json`.

## Decisions recorded

DEC-207 records app-owned choice menus, invariant pill geometry, and semantic on-media token scoping.

## Known limitations or remaining risks

The operating system may still style native browser chrome outside the app, but application choice menus no longer delegate their visual surface to native select UI. Real TalkBack/VoiceOver and physical safe-area checks remain manual release-checklist items.

## Out-of-scope findings

Small-radius inline Mushaf highlights are intentionally text-shaped rather than pills, and compact full-bleed shell edges remain square by design. Reviewed devotional content and persistence formats were not changed.

## Recommended next step

Run the full local release gates, deploy to `main`, monitor Quality and Pages, then verify the new release stamp and the three remediated production surfaces.
