# Phase Report — Prayer settings clarity, local only

## Objective

Apply the owner-approved prayer-location and calculation-picker recommendations, repair the reproduced visual glitches, and verify the focused behavior without publishing.

## Scope completed

- Separated the used location, calculation method and advanced settings into shared cards; removed the repeated location heading.
- Kept saved city/country or honest device-location/coordinate context visible. Retained the IANA zone and UTC offset, with seasonal/device explanations in a disclosure.
- Added a protected city picker with search outside the independently scrolling bounded results and explicit empty-state recovery.
- Added a protected phone method sheet with all five complete authority names, selected check, Close, immediate application and focus recovery. Wider layouts retain the shared anchored Select.
- Used concise localized closed values with the full authority name immediately below; allowed enlarged values/options to reflow instead of clipping.
- Removed the text-bearing popup fade/zoom and protected the ground from its first visible frame. Preserved the existing drawer transition, shared control cues and app/OS reduced-motion handling.
- Moved explicit GPS/manual-save results into a closable protected modal. City/method changes use updated visible values and scoped announcements without inserting a banner.
- Kept pending GPS cancellation and added cancellation when starting manual city selection, preventing a late result from interrupting the picker. Retained selected method and minute adjustments across location changes.
- Reused the existing visible/foreground clock and memoized timezone status by selected zone and civil date. Search typing and method selection no longer rebuild the annual timezone sample; date/foreground/zone changes still refresh it.

## Files changed

Application files owned by this phase:

- `src/app/screens/settings/PrayerLocationPanel.tsx`
- `src/app/screens/settings/PrayerLocationPanel.test.tsx`
- `src/app/components/PrayerCalculationPicker.tsx` (new)
- `src/app/components/PrayerCalculationPicker.test.tsx` (new)
- `src/app/components/prayer-settings.css` (new)
- `src/app/components/ResponsiveSheet.tsx`
- `src/app/i18n/ar.ts` and `src/app/i18n/en.ts` — the new `prayerLocation` namespace only; concurrent additions preserved.
- `e2e/settings-prayer-location.spec.ts` (new)
- `e2e/settings-experience.spec.ts` — assert the retained page heading after removing the redundant inner heading.
- `e2e/settings-progress-clarity.spec.ts` — open/close the city picker before checking its search field.

Documentation additions are listed below. Existing Home, Qibla, Downloads, content-authoring, imagery and build-tool edits from other work were preserved. No dependency, prayer parameter, religious content, reminder, persistence schema or remote-state change was made by this phase.

## Components added or modified

- `PrayerCalculationPicker`: presentation-only responsive selection and transient overlay state; method changes still go through the screen's existing callback.
- `PrayerLocationPanel`: revised screen composition, city/result surfaces, cancellation and stable timezone status.
- `ResponsiveSheet`/`Modal`: opt-in `protectedSurface` applies the existing `data-dropdown-surface` contract to the actual surface. Compact Escape distinguishes its protected root from a nested popup; existing callers retain their default treatment.
- Reused Card, Button, FormField, ChoiceRadioItem, Select, SheetHeader and existing icon exports. No global Select styling change.

## User-visible changes

Readers can see the saved location and method without scrolling past the long timezone explanation. City search opens when requested. Choosing a method applies immediately, works offline, retains the location/offset adjustments and survives reload. Complete names remain available beside the compact value and inside the picker. Location-result notices do not move the settings underneath.

## Accessibility work

- Native button, disclosure, combobox, dialog and radio-group semantics; visible Close and selected check, logical RTL/LTR and isolated Latin timezone/coordinate text.
- Keyboard selection, Escape, native overlay ownership and explicit focus return, including resizing an open phone sheet into a wider dialog.
- Complete short/full method labels at 320px/200%, minimum 44px options, bounded opaque surfaces, independently scrolling options and stable city search.
- Scoped city/method/detection status; result-dialog descriptions and existing attached invalid-coordinate messages.
- Actual geometry, ancestor opacity, hit-testing and axe checks across Arabic/English, phone/tablet/desktop, Glass/solid, high contrast, reduced transparency, unavailable-filter and forced-color fallbacks. Light-theme Glass received a separate contrast/opacity scan.

Automated results do not establish complete WCAG compliance, TalkBack/VoiceOver acceptance or physical handset performance.

## Tests added or updated

- Panel regressions cover successful fix provenance and settings preservation, denied detection, stale GPS after city/adjustment/unmount, manual validation, bilingual city persistence and timezone-sampling stability/foreground DST refresh.
- Picker unit tests cover full names, immediate callback, selecting the current method, cancel and focus return. JSDOM's absent CSS animation default is explicitly modeled so Radix Presence can finish closing; browser tests verify real CSS behavior.
- The new browser file contains 16 cases per engine: eight RTL/LTR viewport cases, five accessibility/material fallbacks, offline/persistence, wide keyboard/responsive handoff and location-denial geometry/focus.
- Existing settings and protected-dropdown regressions were retained. The obsolete duplicate-heading/search expectations were updated to the approved interaction, with a missing helper import corrected during verification.

## Commands run

Commands used the already-installed pinned pnpm entry point:
`node C:/Users/AhmedMahdy/AppData/Local/Volta/tools/image/packages/pnpm/node_modules/pnpm/bin/pnpm.cjs`.
The initial environment reported Node 24.22.1; after the session interruption it reported the repository-pinned 24.15.0. pnpm is 11.19.0. No toolchain installation/change was made by this phase.

| Command                                                                                                                                                                                 | Result                                                                                                                                                                                                                                                                                                                                                                                |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm typecheck`                                                                                                                                                                        | PASS, exit 0; full `pnpm check` also passed typecheck.                                                                                                                                                                                                                                                                                                                                |
| `pnpm test:run` with PrayerLocationPanel, PrayerCalculationPicker, ResponsiveSheet, prayerCalculation and prayerLocations files                                                         | PASS: 5 files / 43 tests, 9.20s at that checkpoint. A subsequent successful-GPS panel test was then added.                                                                                                                                                                                                                                                                            |
| `pnpm test:run src/app/screens/settings/PrayerLocationPanel.test.tsx src/app/components/PrayerCalculationPicker.test.tsx scripts/compact-audio-literals.test.mjs`                       | Final targeted run PASS: 3 files / 21 tests, exit 0, 7.03s; includes all 13 final panel/picker tests and eight compaction-tool tests. Log: `output/prayer-settings-implementation/final-targeted-unit.log`.                                                                                                                                                                           |
| `pnpm test:e2e e2e/settings-prayer-location.spec.ts --project=desktop-chromium`                                                                                                         | Initial feature run PASS: 14 tests, 56.7s before adding responsive-handoff coverage.                                                                                                                                                                                                                                                                                                  |
| New prayer-settings browser file across desktop Chromium, desktop Firefox and mobile WebKit                                                                                             | Initial expanded matrix: 43 passed / 2 failed, 6.9m. Firefox exposed a real enlarged English word overflow; fixed with wrapping on the portalled surface. The WebKit unavailable-filter case received HTTP 404 for the root document while concurrent work replaced `.playwright-dist`; no application loaded. Original results/traces preserved.                                     |
| Same new file, `--grep '320/2\|accessibility fallback'`, all three engines, isolated preview                                                                                            | PASS: 21 tests, exit 0, 1.8m. This proves both failed cases after the wrapping fix/preview isolation and adds light-Glass coverage. There are 48 unique successful feature cases across the recorded runs, not one claimed 48-case single run. Log: `output/prayer-settings-implementation/e2e-final-layout.json`.                                                                    |
| Existing settings-experience, settings-progress-clarity, manual-checklist and dropdown-protection, selected by `prayer\|settings and progress\|Settings\|dropdown\|time zone`, Chromium | 29 passed / 10 failed, 2.1m. Nineteen dropdown fallback/theme checks passed. Nine failures were the affected heading expectation and missing `t` test import, corrected here. One unrelated Home test still expects five old `article[data-density="summary"]` prayer cards.                                                                                                          |
| `pnpm test:e2e e2e/settings-experience.spec.ts e2e/settings-progress-clarity.spec.ts --grep 'launch-critical\|Settings and Progress' --project=desktop-chromium`, isolated preview      | PASS: all 9 affected existing tests, exit 0, 40.1s. Log: `output/prayer-settings-implementation/e2e-settings-corrected.json`.                                                                                                                                                                                                                                                         |
| Targeted ESLint for all phase application/test/i18n/browser files                                                                                                                       | PASS, exit 0.                                                                                                                                                                                                                                                                                                                                                                         |
| Targeted Prettier check for phase files                                                                                                                                                 | PASS: all matched files use Prettier style.                                                                                                                                                                                                                                                                                                                                           |
| `git -c core.fsmonitor=false diff --check`                                                                                                                                              | PASS, exit 0; unrelated line-ending warnings may be emitted.                                                                                                                                                                                                                                                                                                                          |
| `pnpm check`                                                                                                                                                                            | FAIL overall, 179.4s: toolchain, build, typecheck, audio/Quran/listening/owner timing validation, type scale, motion rules and CSS utilities passed. Full-unit result was 364 files / 2620 tests passed, two concurrent translation-compaction tests failed. Lint/format and bundle budget failed as detailed below. Complete log: `output/prayer-settings-implementation/check.log`. |

The dedicated preview was built using `browserTestEnvironment(4203)` to `output/prayer-settings-implementation/preview`, served with `vite preview --host 127.0.0.1 --port 4203 --strictPort`, and tested using `E2E_BASE_URL=http://127.0.0.1:4203`. It retains the isolated loopback browser backend. It avoids concurrent builds replacing the default browser-output directory. No test used production state/services for successful writes.

Full local e2e, Pages deployment build/audit and CI/deployment were not run for this local-only patch. Successful unchanged checks were not repeated as a release gate. No green full-check receipt is claimed.

## Visual/manual evidence

Actual local-render screenshots, distinct from the earlier generated concepts:

- [Arabic phone page](../../../output/prayer-settings-implementation/prayer-settings-ar-phone.png)
- [Arabic phone method picker](../../../output/prayer-settings-implementation/prayer-method-picker-ar-phone.png)
- [Arabic desktop page](../../../output/prayer-settings-implementation/prayer-settings-ar-desktop.png)
- `output/prayer-settings-implementation/browser/`: initial Arabic/English phone/tablet/desktop page, method and city screenshots and diagnostic traces.
- `output/prayer-settings-implementation/final-layout/`: corrected 320px/200% evidence in all three engines, including Firefox English.
- `output/prayer-settings-implementation/settings-corrected/`: existing Settings regression evidence.

The heading focus ring in page evidence is intentional keyboard-focus evidence. Screenshots were visually inspected for complete text, stable hierarchy and opaque overlays. At 200% text, bounded inner scrolling is necessary and labels wrap; ordinary phone controls fit above navigation. No physical-device or assistive-technology session was performed.

## Documentation updated

- `docs/ARCHITECTURE.md`, `docs/DESIGN_SYSTEM.md`, `docs/MOTION_SYSTEM.md`, `docs/PRAYER_TIMES.md`, `docs/QUALITY_CHECKLIST.md` — phase-specific additions only, preserving concurrent work.
- `docs/agent/INDEX.md`, `docs/agent/DECISION_LOG.md` — current scoped phase and owner approval/publication hold.
- `docs/agent/phases/PRAYER_SETTINGS_CLARITY_LOCAL_2026_11_24.md` — approved plan/scope.
- This report. No release-note rewrite.

## Decisions recorded

The owner's request approves implementation of the reviewed recommendations and explicitly prohibits pushing. This chat made no commit, push or deployment. Existing no-release authority remains. No method is automatically endorsed from a city, no city is inferred from coordinates and no prayer setting is changed outside the existing callbacks.

## Known limitations or remaining risks

- The recorded full gate is not green. Its failures include 33 lint errors in concurrent external-book/prototype files and 17 formatting warnings in unrelated reports/generated sources. These were not changed here.
- The recorded build total was 12,593,538 bytes against the unchanged 12,582,912-byte ceiling; initial-route gzip was 189,053 bytes against the recorded 185,270 baseline. No ceiling/baseline was raised. Concurrent build changes mean these measurements are a checkpoint, not a final consolidated-release measurement.
- Concurrent translation-compaction changes initially failed two full-unit tests. A later read-only diagnostic found the updated plugin reducing both dictionaries with and without this phase's namespace; the final targeted eight compaction tests passed. That concurrent repair is not claimed as this phase's work and does not turn the historical full-check failure into a green gate.
- The unrelated Home prayer-summary browser assertion remains a separate integration finding. This phase did not alter its assertion or Home implementation.
- Active concurrent edits mean the checkout has no single frozen release candidate. Final consolidation must run the intact quality/release gates after all work is settled.
- Physical Android touch/GPS, TalkBack/VoiceOver, real-device responsiveness and OS reminder delivery remain pending. Browser/axe/unit evidence does not prove them.

## Out-of-scope findings

Concurrent Home/Qibla/Downloads/imagery/tooling changes, external book prototypes, overall output-budget recovery and release integration were deliberately preserved. No authentication/database/migration changes, network coordinate calls, new images/fonts or runtime dependency were introduced.

## Recommended next step

Review the actual local screenshots, then complete physical-device/assistive-technology acceptance. Keep this phase local. Consolidate concurrent work and resolve the recorded unrelated gate findings in the owner-selected release/integration chat before running a fresh exact-input release gate; do not publish from this chat.
