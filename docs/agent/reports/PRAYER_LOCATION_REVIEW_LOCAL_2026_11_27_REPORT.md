# Phase Report — Prayer-location simplicity, local only

## Objective

Apply the owner's screenshot review and subsequent simplicity instruction locally: make GPS or selecting a city sufficient, remove manual-entry clutter and preserve offline prayer behavior. No commit, push or publication.

## Scope completed

- Two compact groups replace the long default page. Location leads with one primary current-location action and one secondary city choice. Calculation remains immediately selectable.
- Removed manual city name, latitude, longitude, timezone text, number entry and Save. No manual-data validation UI remains; the preliminary validation work was superseded by the owner's later instruction.
- City selection exposes the whole existing offline catalogue for browsing without typing. Optional search filters those options; empty results point to current location. Reopening resets the filter.
- More settings starts closed and contains timezone selection, seasonal status and optional minute corrections. Timezone options use familiar catalogue city/country names with date-specific UTC offsets. Existing custom zones remain selected even outside catalogue coverage.
- Earlier/Later controls retain ±120 minutes, exact signed values, individual prayer ownership and explicit Reset adjustments. Controls remain 44px when text grows; labels and rows reflow.
- Removed repeated country, default coordinates, always-visible timezone/seasonal prose and duplicated visible method-provider/hint text. Full authority names remain in the picker and trigger description.
- Preserved custom saved data, method and other adjustments, GPS consent, denial recovery, offline calculations, normalization, stale-GPS cancellation and focus return. No new dependency or remote request.

## Files changed

Application and tests owned by this phase:

- `src/app/screens/settings/PrayerLocationPanel.tsx` and its test.
- New `src/app/components/PrayerMinuteAdjustments.tsx` and its test.
- `src/app/components/PrayerCalculationPicker.tsx` and its test.
- `src/app/components/PrayerCitySearch.tsx`, `SelectField.tsx`, `prayer-settings.css`.
- `src/app/i18n/ar.ts`, `en.ts`: prayerLocation additions only; independent edits preserved.
- `e2e/settings-prayer-location.spec.ts`, `settings-simplification.spec.ts`, `settings-progress-clarity.spec.ts`.
- Domain/design/quality/agent documentation and the gallery listed below.

Existing unrelated book, Quran, completion, sharing, native, player and deployment work was preserved. Release notes were not changed.

## Components added or modified

PrayerLocationPanel owns orchestration; PrayerMinuteAdjustments is presentation-only and exposes callbacks. PrayerCitySearch accepts optional labels without changing its other callers. SelectField accepts an optional popup class so this timezone menu reuses the calculation popup's first-frame opaque treatment. Shared portal, keyboard, collision and focus behavior remains authoritative.

## User-visible changes

Readers can use their current location or browse cities without entering anything. The short default page exposes calculation choice and one optional disclosure. Fine tuning requires selecting a timezone or tapping Earlier/Later; everything saves through existing callbacks without another Save transaction.

## Accessibility work

Native buttons, labelled selection, native disclosure, grouped correction controls, accessible signed-value descriptions and scoped status announcements. Fixed 44px targets, complete enlarged labels, RTL/LTR, keyboard activation, selected-state cues, focus recovery, protected opacity, hit-testing and no horizontal overflow. Calculation authorities remain accessible without repeated visible prose. Browser axe checks do not establish complete WCAG compliance or physical-device/screen-reader acceptance.

## Tests added or updated

Focused units cover custom saved-value retention, selecting Sydney without typing/GPS, per-prayer adjustments/reset, bounds, Arabic labels, GPS success/denial/unmount/races, timezone-selection cancellation and stable timezone work across foreground/date refresh.

Browser regressions cover no manual fields, browsing without typing, selected timezone with preserved coordinates/method/offsets, keyboard minute correction, Reset, reload durability, signed-value/44px geometry, opaque timezone menu, existing method/city selection, phone/tablet/desktop, 320px/200%, both languages and material/accessibility fallbacks. Existing Settings integration assertions now exercise the replacement controls.

## Commands run

Node 24.15.0 and pnpm 11.19.0. Browser previews use `browserTestEnvironment` with loopback API namespaces on isolated ports; successful state traffic never targets production.

| Command                                                                                                                           | Result                                                                                                                                                                                                                                                 |
| --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm test:run` with PrayerLocationPanel, PrayerCalculationPicker, PrayerMinuteAdjustments, prayerLocations and prayerCalculation | PASS: 5 files, 37 tests, 7.52s. `output/playwright/prayer-location-review/unit-simple-final.log`.                                                                                                                                                      |
| `pnpm typecheck` during implementation                                                                                            | PASS, exit 0 at that checkpoint. Later combined-gate result below supersedes aggregate readiness.                                                                                                                                                      |
| Targeted `pnpm exec eslint` on phase implementation/tests/i18n/browser files                                                      | PASS, exit 0.                                                                                                                                                                                                                                          |
| Targeted `pnpm exec prettier --check` on all phase implementation/test/i18n/browser files, including SelectField                  | PASS. `format-final.log`.                                                                                                                                                                                                                              |
| `git diff --check`                                                                                                                | PASS, exit 0.                                                                                                                                                                                                                                          |
| Feature browser file across desktop Chromium, desktop Firefox and mobile WebKit, one worker                                       | 48 passed, 12 failed, 7.1m. New timezone checks exposed real entrance opacity; corrected with opt-in existing protected popup treatment. Assertions/timeouts retained. `simple-final-browser-results.json`.                                            |
| Same feature, `--grep 'no manual entry'`, all three engines, corrected isolated preview                                           | PASS: all 12 affected cases, 3.5m. `simple-corrected-browser-results.json`. Together with the preceding 48 passes, all 60 feature cases have successful results; no single 60-case green run is claimed.                                               |
| Settings simplification/progress clarity, `--grep 'Settings preference summaries\|Settings and Progress'`, Chromium               | PASS: 15 tests, 1.0m. `settings-integration-results.json`.                                                                                                                                                                                             |
| `pnpm check` after final simplification                                                                                           | FAIL overall, 147.6s. 403 unit files/2,852 tests passed; six files failed, with 11 failed tests and one suite import failure. Typecheck, lint, format and bundle also failed in independently changing files; details below. `check-simple-final.log`. |
| `pnpm build:pages`                                                                                                                | Vite/PWA generation PASS; command FAIL at unchanged total bundle ceiling: 12,596,614 bytes against 12,582,912. Home startup gzip 537,629 bytes. `pages-final.log`.                                                                                     |

Logs and browser artifacts live under `output/playwright/prayer-location-review/`. Earlier manual-validation runs, including their failures and correction logs, remain historical diagnostics and are not evidence for the simplified page. No full release browser matrix, audit, CI, deployment, APK installation or push was performed.

## Visual/manual evidence

[Eight-image actual-app gallery](../evidence/prayer-location-simple/README.md): Arabic/English phone, Arabic desktop/tablet, protected method/city choices, Firefox narrow enlarged page and final fixed-target optional corrections. Images were visually inspected alongside geometry, hit-testing, focus and axe checks.

The default page is materially shorter than the supplied screenshot. At 200% text the header/navigation retain existing enlarged reflow and optional controls remain scrollable. No native inset/device behavior is inferred from these zero-inset browser captures.

## Documentation updated

`docs/PRAYER_TIMES.md`, `ARCHITECTURE.md`, `DESIGN_SYSTEM.md`, `QUALITY_CHECKLIST.md`; agent index, decision log, phase brief, this report and screenshot gallery. The owner decision explicitly supersedes old manual-entry and default-timezone-detail presentation contracts.

## Decisions recorded

The owner asks for simplicity, selecting options/current location and removal of clutter; implementation follows that instruction over the preliminary validation approach. Optional city search filters existing choices and is never required for selecting a place. Existing custom saved coordinates/names/zones are preserved. No commit, push, deployment or release-note rewrite.

## Known limitations or remaining risks

- The full repository gate is not green. Typecheck fails in `LearningDiagram.tsx:88`. Lint reports 11 errors across CollectionShareModal, InlineQuranReading and LearningDiagram. Formatting reports ten independent book/Quran/diagram files.
- Full-unit failures concern learning export/source reconciliation, book audit/immutable assets, MushafSettingsSheet, KhatmahReaderScreen and QuranListeningReader. No prayer-location/selection tests failed in the complete run. Earlier full runs also showed unchanged Mushaf-cache timeouts; the latest run did not.
- Generic-build budget is 12,599,773 bytes against 12,582,912; Pages is 12,596,614. No budget, baseline, coverage, assertion or timeout was weakened. Independent changes continued during this phase, so no exact-input release receipt or repository-wide readiness is claimed.
- Offline city and timezone choices use the existing finite catalogue; outside city coverage, current location supplies exact coordinates. Existing custom zones remain selectable, but this phase introduces no worldwide geographic dataset or remote geocoder.
- Real Android GPS/keyboard/system bars and TalkBack/VoiceOver remain unverified; no complete accessibility compliance claim.

## Out-of-scope findings

Independent content/source reconciliation and Quran sizing/player changes own the current combined-gate failures. They were not altered to obtain a green prayer-settings result.

## Recommended next step

Review the simplified local page and perform physical Android/screen-reader acceptance. Reconcile the independent combined-gate failures before a separately authorized release.
