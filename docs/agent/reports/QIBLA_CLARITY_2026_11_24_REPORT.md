# Phase Report — Qibla clarity, 2026-11-24

## Objective

Implemented the approved Qibla essentials and optional details/recovery locally. Home, More, shell navigation, prayer settings and reviewed religious content remain unchanged by this phase. Explore, automatic city switching, comparison timers and learning modules were not implemented.

## Scope completed

- Location/source and complete upright-labelled dial precede one clear instruction. Ordinary phone essentials fit without scrolling; enlarged/narrow content keeps scroll access.
- Distance, true bearing, coordinates, fix accuracy/time and help live in the shared opaque responsive sheet, with Close/Escape/focus recovery.
- Fresh geolocation explicitly bypasses cached positions and stays transient. It never borrows the saved city label or changes prayer settings/reminders. Unknown city is honestly Device location; no online geocoder.
- A local WMM2025 evaluator corrects supported magnetic headings to true north. Invalid/relative/steeply tilted, poor and stale readings fall back safely. Hidden listeners and expiry work pause.
- Confirmed alignment requires known acceptable sensor accuracy, raw and smoothed turns within three degrees for 350ms. Unknown accuracy remains approximate; no false confirmed haptic.

## Files changed

Qibla-owned implementation: src/app/screens/QiblaScreen.tsx, qibla-screen.css; src/app/components/QiblaCompassDial.tsx; src/app/hooks/useQiblaCompass.ts; src/app/content/geomagnetic.ts, wmm2025.ts, wmm2025.fixtures.json; prayerCalculation.ts optional metadata/freshness parameter; Arabic/English qibla translation entries. Related tests are colocated, with e2e/qibla-clarity.spec.ts and the affected navigation assertions updated.

Documentation: README.md, ARCHITECTURE.md, DESIGN_SYSTEM.md, PRAYER_TIMES.md, QUALITY_CHECKLIST.md, MOTION_SYSTEM.md, agent decision/index/phase/report and third-party/GEOMAGNETIC_LICENSE.txt. Concurrent downloads/document work was preserved, not claimed as Qibla work.

## Components added or modified

Added presentation-only QiblaCompassDial and focused useQiblaCompass; composed existing Header/Button/ResponsiveSheet/SheetHeader and icon exports. No runtime dependency or persisted schema added.

## User-visible changes

Complete compass and visible location/source; secondary details on request; clear static/live/unknown-accuracy/poor/stale statuses; on-device true-north correction. Refresh is Qibla-only. Saved city detection remains a future separately scoped feature.

## Accessibility work

44px targets, upright north/Kaaba labels, localized text equivalents, direction/state announcements without every degree tick, opaque material fallback and close/focus recovery. Automated scans and measured phone/enlarged geometry passed. Real TalkBack/VoiceOver and physical handset tests remain outstanding; no complete WCAG or absolute accuracy claim.

## Tests added or updated

- NOAA's 100 independent WMM2025 reference cases verify declination and all four field components.
- Model bounds/caution regions/poles, heading correction/seam/accuracy, stale/hidden/unmounted lifecycle and permissions.
- Existing bilingual Qibla, permission, dial transform and dwell/haptic tests adapted to true-north correction and details disclosure.
- Fresh-fix metadata/invalid coordinates; browser proof prayer profile remains unchanged and saved-city label is not reused.
- Phone fit, 320px/200%, tablet/desktop, RTL/LTR, themes/Glass/contrast/transparency, sheet opacity/hit testing/keyboard recovery and axe.

## Commands run

| Command                                                                                 | Exact result                                                                                                                                                       |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Focused Vitest: prayerCalculation, geomagnetic, useQiblaCompass, QiblaScreen, taskFirst | PASS: 5 files, 35 tests.                                                                                                                                           |
| pnpm typecheck                                                                          | PASS (also passed in pnpm check).                                                                                                                                  |
| pnpm lint                                                                               | PASS (also passed in pnpm check).                                                                                                                                  |
| Prettier check of all Qibla implementation/tests and affected navigation spec           | PASS: all matched files use Prettier style.                                                                                                                        |
| Qibla + affected navigation browser selection, Chromium/Firefox/WebKit                  | 48 passed, 1 failed: WebKit 834px Home-to-Qibla navigation reached the section-load error boundary. All 36 new Qibla cases passed.                                 |
| Targeted WebKit 834px navigation reproduction                                           | PASS: 1 test, 1.9m. Original transient lazy-section-load failure remains recorded; no retry/timeout/assertion was weakened.                                        |
| pnpm test:e2e:fast                                                                      | PASS: 28 tests, 1.2m.                                                                                                                                              |
| pnpm check                                                                              | FAIL overall: format and total output budget. PASS: toolchain/build/typecheck/lint/unit+coverage/audio/Quran/listening/owner previews/type scale/motion/CSS gates. |
| pnpm build:pages                                                                        | Build generated successfully; command FAIL at unchanged 12 MiB output ceiling: 12,588,557 bytes vs 12,582,912 (5,645 bytes over). No ceiling raised.               |
| pnpm audit:prod                                                                         | PASS: no known vulnerabilities.                                                                                                                                    |

The full-check format failure names concurrent docs/external-sources/al_mukhtar_extracted.md, al_wird_an_nabawi_extracted.md and README.md. These are outside this phase and were left intact. The shared checkout contains substantial concurrent downloads work; current output-budget results describe the combined snapshot, not an isolated Qibla measurement. The first check recorded 12,591,699 bytes; final Pages measurement above is retained separately. No successful complete quality receipt or release readiness is claimed.

## Visual/manual evidence

Actual UI screenshots: output/playwright/qibla-clarity/, with project/language/width-labelled phone and details states. Visually inspected Arabic phone and Glass details; the first opaque-sheet check caught transparency and was repaired before the successful matrix. Example reference files: desktop-chromium-ar-phone.png, desktop-chromium-ar-390-details.png and 320px enlarged details.

Logs: output/qibla-check.log, qibla-pages-build.log, qibla-audit.log, qibla-fast-smoke.log, qibla-webkit-repro.log. Browser trace for the initial 834px load failure was produced in test-results; retain any available trace before subsequent runs replace it.

## Documentation updated

The relevant contracts record progressive details, transient metadata, sensor ownership, model expiry and privacy. The official coefficient archive is at https://www.ncei.noaa.gov/sites/default/files/2024-12/WMM2025COF.zip (download SHA-256 2E76569370D081F2CD7919490218BD094CA9AFDE347B198EFF5621E0AF460D03). All 90 coefficient rows and 100 reference vectors were imported without model substitution. Apache adaptation attribution and full license are retained. WMM coefficient data is public-domain US Government material.

## Decisions recorded

The owner approved only Qibla implementation and rejected changing Home's look. The separately recorded 2026-11-24 global publication hold applies: no commit, push, deployment or release-note rewrite was performed.

## Known limitations or remaining risks

- Physical magnetic interference/calibration, actual sensor north references and TalkBack/VoiceOver still require real-device acceptance. Model tests are numerical, not hardware validation.
- WMM2025 is intentionally unavailable outside 2025–2029 and in weak-horizontal-field regions; update model and rerun official tests before 2030.
- A fresh fix has no guaranteed city name; coordinates power Qibla while Device location remains the label. No unapproved network geocoding or city-profile switch.
- Browser APIs may not expose heading uncertainty; approximate guidance cannot guarantee alignment. Compass-enabled permission alone is not a valid heading.
- Combined-checkout format/output gates remain unresolved, so release is not ready. Unrelated concurrent changes were preserved. The single WebKit section-load incident passed isolated reproduction and remains a reliability finding.

## Out-of-scope findings

Concurrent downloads/source-document changes remain owned by their existing phase. No Home/navigation redesign, religious-content interpretation or city timers were introduced.

## Recommended next step

Review actual Qibla screenshots and perform physical Android/iOS comparison against a trusted true-north/local reference. Resolve combined output-budget and concurrent document-format findings in final consolidation, rerun full gates for the final exact snapshot and release only in the owner-selected release chat.

## Compass material refinement — 2026-11-24

The owner finds the initial compass cartoonish and requests a robust, slightly photorealistic treatment. Refine only QiblaCompassDial artwork: a slim shaded metallic bezel, 5-degree engraved-style graduation marks, quieter crosshairs, slender faceted two-ended needle, machined centre cap and shaded architectural Kaaba faces. Keep all live/static rotation, upright labels/target, text alternatives, confirmation and reduced-motion behavior. SVG gradient identifiers are instance-unique. Materials derive from existing semantic tokens; the Kaaba’s physical black/gold material uses local artwork colors. No bitmap/network asset, runtime dependency, Home/navigation change or new animation is added.

Validation for this visual follow-up: focused Qibla unit suites PASS (12 tests); qibla-clarity Chromium browser suite PASS (12 tests, 47.2s), covering both languages, phone fit, enlarged/Glass/fallback sheet geometry, axe, fresh location and poor readings; pnpm typecheck PASS; targeted ESLint PASS. Inspected the updated Arabic phone screenshot. No full quality/build gate rerun is claimed for this artwork revision; earlier combined-checkout format and bundle failures remain release blockers. Existing performance approach stays local SVG: 72 simple ticks, four small gradients, no filters/raster assets/network/animation loops. The owner publication hold remains in force.

## Final recommendations completion — 2026-11-24

### Objective and scope completed

Implemented the owner's approved final recommendations locally: explicit Using saved location beneath the city with a visible Use my location action; fixed forward marker plus Top of phone / أعلى الهاتف during live guidance; direct Retry for stale/unavailable/denied/unsupported states and Calibration help for poor readings; an approximate-location warning when reported uncertainty exceeds 100m; central MAGNETIC_MODEL validity/review metadata and an ordinary unit-test maintenance gate from 2029-07-01.

Retry restarts the enabled sensor effect with cleanup and does not request permission again unnecessarily. Denied permission still requires a new explicit action. A browser regression exposed a pending no-sample/stale timer overwriting poor accuracy while the calibration sheet was open: invalid/poor/reference-unavailable paths now clear that timer, preserving the meaningful status/action and focus return. At narrow/enlarged widths Details retains its accessible name and info icon while its visual label hides to prevent header overflow. No Home, navigation or release-note change. No commit, push or deployment.

Physical Android/iPhone and TalkBack/VoiceOver acceptance remains **Pending**: no adb executable or connected handset capability was available in the checked PATH/standard SDK paths. The complete device matrix, required metadata, independent-reference procedure, magnetic-case/interference, portrait/landscape, permission recovery, background/offline and assistive-technology checks are recorded in DEVICE_ACCEPTANCE.md. Browser emulation is not handset acceptance.

### Files/components and documentation

Modified QiblaScreen, useQiblaCompass and its tests, qibla-screen.css, geomagnetic model metadata/tests, Arabic/English Qibla copy and qibla-clarity browser regressions. Updated phase/decision/design/architecture/prayer/quality/device-acceptance documents and this report. Reused the same shared sheet, Button, icon layer and instrument dial; no runtime dependency or persisted settings field.

### Verification and exact outcomes

| Command/check                                                                                            | Result                                                                                                                                         |
| -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Focused Qibla/sensor/model Vitest suites                                                                 | PASS: 4 files, 26 tests; includes 100 independent NOAA reference vectors and direct retry/denial/poor-status regression.                       |
| Final qibla-clarity browser suite across desktop-chromium, desktop-firefox-smoke and mobile-webkit-smoke | PASS: 42 tests, 2.6m; output/qibla-final-verified.log.                                                                                         |
| pnpm typecheck after the final code changes                                                              | PASS.                                                                                                                                          |
| Targeted ESLint on QiblaScreen, useQiblaCompass and geomagnetic                                          | PASS.                                                                                                                                          |
| Targeted Prettier check of changed Qibla implementation/tests/translations/browser spec                  | PASS: all matched files use Prettier style.                                                                                                    |
| pnpm check, combined concurrent checkout                                                                 | FAIL overall after 855.4s: lint, format and total output budget. Build/typecheck/unit+coverage and content/type/motion/CSS validations passed. |

The combined check reports 76 lint errors in five concurrent docs/external-sources/*.cjs generation scripts, and formatting issues in external source documents/scripts plus qibla-clarity.spec.ts as it was being refined. The Qibla spec was subsequently formatted and its targeted check passed. The measured combined dist output was 12,596,325 bytes against the unchanged 12,582,912-byte ceiling (13,413 bytes over). These results do not establish final release readiness; do not reuse the earlier successful stages as an exact-final-snapshot complete quality pass. Concurrent files were retained intact. No assertions/coverage/budgets were weakened.

The initial browser launch exited with Windows process code 3221226505 before tests; a separate preview port allowed testing. Earlier test failures exposed null desktop sensor interference in the fixture (fixture now explicitly owns sensor samples), the real poor-status expiry bug and narrow header overflow. All were diagnosed before the final 42-case pass. No retries, timeouts or assertions were relaxed.

### Actual screenshot evidence

All final captures are under output/playwright/qibla-final/. For each engine and Arabic/English there are seven states: saved-location, live-turn-simulated, stale-retry-simulated, aligned-simulated, poor-calibration-simulated, calibration-details and approximate-location-simulated. These are screenshots of the actual local implementation, not generated design proposals. Sensor headings, GPS position/accuracy and fixed capture time are deterministic test inputs. They prove rendered UI/state/recovery only.

Reviewed Arabic saved-location, live-turn, stale-retry and approximate-location screenshots visually. The final suite also proves ordinary-phone no-scroll geometry, 320px/200% reflow/reachability, tablet/desktop details geometry, solid/Glass/contrast/transparency, meaningful action labels, opacity, hit testing, focus recovery, permission/retry, unchanged prayer profile and axe checks.

Useful current files:

- output/playwright/qibla-final/desktop-chromium-ar-saved-location.png
- output/playwright/qibla-final/desktop-chromium-ar-live-turn-simulated.png
- output/playwright/qibla-final/desktop-chromium-ar-stale-retry-simulated.png
- output/playwright/qibla-final/desktop-chromium-ar-aligned-simulated.png
- output/playwright/qibla-final/desktop-chromium-ar-poor-calibration-simulated.png
- output/playwright/qibla-final/desktop-chromium-ar-calibration-details.png
- output/playwright/qibla-final/desktop-chromium-ar-approximate-location-simulated.png

### Remaining risks and next step

Physical-device accuracy/interference/screen-reader acceptance is still pending. The 100m location warning is an explicit product threshold, not a guaranteed Qibla angular-accuracy claim. The model review gate needs the official successor plus independent reference and device revalidation before 2029-07-01. Combined-checkout lint/format/bundle blockers remain for final consolidation. Owner visual review of these actual screenshots is next; keep the global publication hold and use the designated later release chat.

## Location notifications without layout movement — 2026-11-24

The owner requests the location-update result and approximate-location warning in a notification modal with Close, without moving page elements. Both messages now use the existing portalled Modal with an opaque Qibla surface, localized Location update title, visible X and Close button, bounded scrollable text, Escape dismissal and explicit focus return to the location action. No result/warning paragraphs remain in the main layout. Fresh coordinates and accuracy continue to update transiently; prayer settings remain unchanged. Each result opens once after the user-requested lookup, including actionable failure messages; an earlier inaccurate fix's warning is not repeated after a later lookup failure.

Scope/files: QiblaScreen modal composition/result warning state, bilingual locationNoticeTitle, QiblaScreen unit test and qibla-clarity browser regressions; phase/design/decision/report updated. No new component, dependency, raw network call or persistence. No commit/push/deployment/release-note change. Concurrent changes elsewhere (including Home) are preserved and are not part of this Qibla correction.

Validation: 13 Qibla unit tests PASS; pnpm typecheck PASS; targeted ESLint PASS; targeted Prettier PASS. Chromium qibla-clarity: 16 passed, 30.7s. Firefox/WebKit: 32 passed, 3.1m. Results and screenshot evidence are in output/qibla-notice-cross-browser.log and output/playwright/qibla-final/. Browser assertions compare the complete dial bounding box before, during and after the modal, verify opaque Glass surface, modal focus containment, close hit testing, X/Escape recovery and axe. Final-recommendation tests also exercise the modal at 320px/200% text. All GPS/accuracy values in screenshots are simulated deterministic inputs, not physical accuracy evidence.

Visually inspected actual Arabic notification screenshot desktop-chromium-ar-location-notification.png. It shows one centered opaque Location update modal with both the successful update message and approximate-location warning, visible X/Close actions and the app underneath. Main compass geometry stays fixed; the overlay has no in-flow height. Real-device/assistive-technology and earlier combined-checkout release blockers remain pending. No full quality/build rerun is claimed for this scoped notification change.

## Local acceptance and combined-gate repairs — 2026-11-24

### Objective, files and behavior

The owner approved the final acceptance recommendations locally. Added eight bilingual Light/Midnight/high-contrast/forced-colors browser cases in e2e/qibla-clarity.spec.ts. In qibla-screen.css, outlined the Kaaba in app contrast mode and mapped the instrument and mounted Qibla shell to native system colors in forced colors. These modes preserve the main layout and modal behavior. No ordinary-theme Home/navigation change belongs to this refinement.

The existing build-only scripts/compact-audio-literals.ts now shares frequently repeated short property strings when the estimated emitted saving is positive. Its original reviewed long-string behavior remains; scripts/compact-audio-literals.test.mjs adds short-metadata/non-profitable-value coverage alongside full catalogue export/freeze and exact reviewed-value comparisons. No reviewed source text, URL, checksum, asset, dependency, baseline or ceiling changes.

The nine docs/external-sources generators were migrated from CommonJS .cjs to ESM .mjs for the existing lint configuration. Changes use built-in ESM imports, import.meta.dirname and explicit browser globals, remove unused helpers/parameters and equivalent unnecessary regular-expression escapes. Latest concurrently recreated Book 1/2/3 versions were preserved. Generated Markdown/JSON/HTML formatting was normalized; generators were not executed and PDFs were not regenerated. Syntax and exact TypeScript-AST template-segment comparisons passed for all nine latest generators. Backups and the comparison script are under ignored output/. No lint exclusions or rule changes.

### Accessibility and evidence

Light and app high-contrast Arabic captures were visually inspected. The forced-colors test exposed author theme colors remaining in shared header/navigation computed styles; mounted-screen semantic system colors fixed the finding, and both language cases passed without excluding axe rules. These browser checks do not prove full accessibility compliance. Actual handset interference, absolute sensor reference and TalkBack/VoiceOver remain Pending in DEVICE_ACCEPTANCE.md because no connected device interface is available. GPS/sensor screenshots remain simulated UI evidence.

### Validation record

The short-metadata compactor suite passed: one file, seven tests. Repository lint passed. All nine latest generators passed syntax and template preservation. The initial direct node --test invocation was unsuitable for this Vitest suite (extensionless TypeScript import); the repository pnpm test:run command passed. Final combined gates and browser results are recorded below after completion. The publication hold remains in force.

Manual review of the first forced-colors screenshot caught a missing primary-button label that axe did not flag. The Qibla primary actions now explicitly use Canvas/CanvasText with a visible system border, and browser tests compare their computed colors against native system-color probes. This finding reinforces why automated scans alone are insufficient.

The first consolidation pnpm check passed build, typecheck, lint, all unit/coverage tests, bundle budget, CSS utilities and content/motion validators, but failed formatting after a concurrent root clean_quotes.cjs was added. That helper was retained as clean_quotes.mjs with built-in ESM imports, equivalent regex escapes and formatting; it was syntax-checked and never executed. Its source backup is output/clean_quotes-before.cjs.txt. This adds a tenth utility migration beyond the nine generators above. No religious-text cleanup was run by this phase.

The configured Android SDK was subsequently found via android/local.properties. Its actual adb devices -l returned an empty list. DEVICE_ACCEPTANCE.md now records this stronger evidence; physical Android/iPhone and assistive-technology remain Pending.

The final button-color regression initially passed Chromium/Firefox but caught WebKit's ButtonFace/ButtonText mismatch (1.81:1). Using the matched Canvas/CanvasText pair repaired both rendered and axe contrast; all six forced-colors language/engine cases then passed in 1.2m without rule exclusions. The corrected Chromium forced-colors screenshot was visually reviewed and its primary action is readable.

The complete Qibla matrix passed 72 cases in 5.3m before the final forced-color button adjustment; the six affected cases were then rerun successfully after that adjustment. Production Pages build and dependency audit passed; bundle ceilings and baseline remain unchanged. That build measured 12,579,113 total bytes against 12,582,912, with 517,720 gzip bytes for Home startup. The second combined check again passed all other stages but formatting failed on a concurrently rewritten book1_al_mukhtar_pages.json; its formatting was subsequently normalized without changing JSON values. This is not a complete-gate pass; the final rerun is recorded below.

### Final verification results and handoff

| Command / evidence                                                             | Exact result                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pnpm check                                                                     | PASS, every stage, 202.5s; output/qibla-acceptance-check-complete.log. Includes unit coverage, build, typecheck, lint, format, local audio/content/timing, type-scale/motion, unchanged bundle and CSS gates. |
| pnpm test:e2e e2e/qibla-clarity.spec.ts across Chromium/Firefox/WebKit         | PASS, 72 tests, 5.3m; output/qibla-acceptance-browser-final.log.                                                                                                                                              |
| Forced-colors affected cases after final button correction, same three engines | PASS, 6 tests, 1.2m; output/qibla-acceptance-forced-pair-final.log.                                                                                                                                           |
| pnpm test:e2e:fast                                                             | PASS, 28 tests, 1.6m; output/qibla-acceptance-fast-final.log.                                                                                                                                                 |
| pnpm test:run scripts/compact-audio-literals.test.mjs                          | PASS, 7 tests, 1.65s; output/qibla-acceptance-compactor.log.                                                                                                                                                  |
| pnpm build:pages after final CSS correction                                    | PASS; output/qibla-acceptance-pages-verified.log. Home startup 517,739 gzip bytes; original bundle ceilings and baseline unchanged.                                                                           |
| pnpm audit:prod                                                                | PASS, no known vulnerabilities; output/qibla-acceptance-audit-final.log.                                                                                                                                      |
| Generator preservation                                                         | PASS, nine latest generators: exact template segments and node --check; output/verify-qibla-generator-preservation.mjs and original-source backups.                                                           |
| Configured Android adb devices -l                                              | Empty device list; physical acceptance Pending.                                                                                                                                                               |
| git diff --check                                                               | PASS.                                                                                                                                                                                                         |

The complete quality command passed all stages but did not record a reusable exact-snapshot receipt: concurrent checkout inputs changed during the run. No release-ready exact-final-snapshot claim is made. This final report is also written after testing. The designated release chat must verify its final combined snapshot and run the intact publication gates; no receipt was fabricated or bypassed. No full repository-wide browser matrix or CI/deployment run is claimed by this local-only pass.

Evidence: output/playwright/qibla-acceptance/ contains the three-engine bilingual Light, Midnight, app contrast and forced-colors captures. output/playwright/qibla-final/ retains the modal, saved/live/stale/aligned/poor/calibration and approximate-location captures. Reviewed the Arabic Midnight composition and location modal plus corrected English forced-colors primary action. Modal captures use deterministic simulated GPS/uncertainty, and sensor-state captures use simulated headings; these prove rendered behavior, not field accuracy.

Documentation updated: Qibla phase, this report, decision log and physical-device acceptance. No dependency, content source, bundle baseline, ceiling, release manifest or deployed artifact was changed for publication. No commit, push or deployment. Preserve the concurrent Home/downloads/prayer-settings/surah/document work.

Remaining risk and recommended next phase: physical Android/iPhone accuracy, interference, landscape/background and TalkBack/VoiceOver acceptance, followed by owner review of the actual screenshots. Keep the publication hold. The model maintenance/expiry and honest no-confirmation fallbacks remain as documented. Bundle headroom remains small and future combined changes require measurement rather than raising ceilings.
