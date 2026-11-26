# Phase Report — Seamless light system bars, local 2026-11-25

## Objective

Apply the owner's selected Seamless light concept locally. Preserve the warm continuous phone reader and correct faint native system icons without adding a header container or divider. No commit, push, deployment or APK installation.

## Scope completed

- Reused the existing shared Header, compact reader surface and ProgressBar. The light solid track has a restrained visible neutral extent; fill, labels, counts and reading actions are preserved.
- Added a dependency-free custom Android appearance bridge, loaded only when native Android needs it. Browser/PWA startup does not need to acquire the plugin runtime for this feature.
- Resolved one opaque system-bar ground from the actual CSS theme/material/accessibility tokens, including the enabled paper palette. Browser theme-color and native appearance receive that same value.
- Protected the existing native top safe area with an opaque, pointer-transparent surface. No second inset, reader position correction or shell-tier change.
- Selected native icon polarity by relative luminance, updated legacy native grounds, retained the last appearance on focus return and stored only its color for subsequent launches. Android 7 keeps a dark navigation ground because its navigation buttons cannot use dark ink.
- Regenerated stale Capacitor plugin paths through the normal Android sync command.

## Files changed

Phase-owned application changes:

- src/app/theme.ts
- src/app/native/systemBars.ts
- src/app/native/systemBarsBridge.ts
- src/app/native/systemBars.browser.ts
- src/app/native/systemBars.test.ts
- src/app/screens/ReaderScreen.tsx
- src/app/App.tsx — update appearance when Forced Colors changes while mounted
- src/app/screens/ReaderScreen.css
- src/styles/theme/surfaces.css — only the system-bar token/protected-inset block; independent motion edits were preserved
- src/test/isolatedSuites.ts — new mocked suite registration only
- vite.config.ts, vitest.config.ts, tsconfig.json — explicit platform adapter alias
- android/app/src/main/java/m/azkar/com/MainActivity.java
- android/app/src/main/java/m/azkar/com/AzkarSystemBarsPlugin.java
- android/app/src/main/java/m/azkar/com/SystemBarAppearance.java
- android/app/src/main/res/values/styles.xml
- android/app/src/test/java/m/azkar/com/SystemBarAppearanceTest.java
- android/capacitor.settings.gradle — normal sync regenerated the installed live-update plugin path
- e2e/seamless-system-bars.spec.ts

Documentation: docs/ANDROID.md, docs/ARCHITECTURE.md, docs/DESIGN_SYSTEM.md, docs/QUALITY_CHECKLIST.md, docs/agent/INDEX.md, docs/agent/DECISION_LOG.md, the phase brief, this report and the evidence gallery. Existing independent Home/Settings/Learn/reading work was preserved.

## Components added or modified

ReaderScreen's existing ProgressBar configuration and its light track token changed. Shared Header, ProgressBar implementation, counting/text/toolbar components and public props remain intact. New code is a platform adapter, custom native plugin and native contrast policy, not a replacement visual component.

## User-visible changes

- Dark Android status icons over light paper; light icons over dark, Midnight, protected Glass and high-contrast grounds.
- System appearance follows actual theme/material changes and native focus recovery.
- Light solid reading progress has a clearer full track while the devotional reading surface remains seamless.
- The wider reader's existing artwork/header/navigation remains unchanged.

## Accessibility work

Feature browser checks cover 32px single-inset ownership, opaque top protection, 44px header actions, RTL/LTR, 320px/200% text without reader horizontal overflow, protected menu bounds/opacity and Escape/focus recovery. Native tests cover all shipped ground colors, luminance rather than theme-name assumptions, invalid/transparent input and older Android navigation contrast.

Six actual-app phone/tablet/desktop screenshots were captured. Phone captures simulate Android's 32px status inset; corrected ordinary tablet/desktop captures use real zero-inset browser geometry. Arabic phone/tablet and English desktop images were visually inspected. No claim of full WCAG compliance, real-phone status-icon acceptance or completed TalkBack/VoiceOver review is made.

## Tests added or updated

- 8 native-adapter/appearance cases, including unavailable older APKs and repeated theme changes; registered with the existing isolation boundary.
- 5 Java contrast/validation/legacy navigation tests.
- 10 browser cases across three existing engines check normal phone and narrow enlarged presentation. One additional case checks Forced Colors changes without leaving the reading item; final results are below.
- Existing theme/font/isolation suites retained and passed with the new adapter.

## Commands run

| Command / check                                                                                                                                                                                                                     | Exact result                                                                                                                                                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Node / pnpm inspection                                                                                                                                                                                                              | Node v24.15.0; pnpm 11.19.0                                                                                                                                                                                                                                 |
| pnpm test:run src/app/native/systemBars.test.ts src/app/theme.test.ts src/app/zikrFont.test.ts src/test/isolatedSuites.test.ts                                                                                                      | Final adapter: 4 files, 28 tests passed; exit 0                                                                                                                                                                                                             |
| pnpm typecheck                                                                                                                                                                                                                      | Passed; exit 0                                                                                                                                                                                                                                              |
| Targeted ESLint                                                                                                                                                                                                                     | Passed; exit 0; final deferred bridge is covered by the final scoped checks                                                                                                                                                                                 |
| Initial Gradle test/lint attempt                                                                                                                                                                                                    | Failed on a pre-existing stale generated live-update plugin path; repaired through pnpm android:sync                                                                                                                                                        |
| pnpm android:sync                                                                                                                                                                                                                   | Passed; Android-mode web build and existing plugin synchronization completed                                                                                                                                                                                |
| gradlew.bat assembleDebug testDebugUnitTest lintDebug --no-daemon                                                                                                                                                                   | Passed; 278 tasks, 79 executed/199 up-to-date; 3m20s; native app tests include 5/5 new policy tests                                                                                                                                                         |
| Initial three feature browser cases                                                                                                                                                                                                 | 3 passed; exit 0                                                                                                                                                                                                                                            |
| Broad browser launch                                                                                                                                                                                                                | Windows runner exited before tests, code 3221226505; reran with one worker                                                                                                                                                                                  |
| Shared-directory browser run                                                                                                                                                                                                        | Aborted after trace confirmed module 404/MIME failures while another job replaced .playwright-dist; assertions/timeouts were not weakened                                                                                                                   |
| Private preview build with loopback browser-test API                                                                                                                                                                                | Passed; no production backend fixture traffic                                                                                                                                                                                                               |
| E2E_BASE_URL=http://127.0.0.1:4281, pnpm test:e2e e2e/seamless-system-bars.spec.ts --project=desktop-chromium --project=desktop-firefox-smoke --project=mobile-webkit-smoke --workers=1 --output=output/system-bars-browser-results | 30 passed in 3.8m; exit 0                                                                                                                                                                                                                                   |
| Isolated-context actual-app capture                                                                                                                                                                                                 | Passed: six RTL/LTR phone/tablet/desktop measurements/screenshots and plain/reduced-transparency/forced-colors/CSS-support fallback checks                                                                                                                  |
| pnpm check, first combined working-tree run                                                                                                                                                                                         | Failed in 647.7s: format, unit tests, bundle baseline. Typecheck, lint, production build, content/audio/timing/type-scale/motion checks and CSS utilities passed                                                                                            |
| Combined unit result                                                                                                                                                                                                                | 377 files/2720 tests passed; 2 existing Mushaf cache cases timed out at unchanged 45s under concurrent work                                                                                                                                                 |
| pnpm test:run src/app/content/mushafOfflineCache.test.ts                                                                                                                                                                            | All 7 passed in 23.60s; exit 0; no cache source/test change                                                                                                                                                                                                 |
| Format findings in combined gate                                                                                                                                                                                                    | README.md and e2e/completion-reflection.spec.ts, independently edited by other local work; not formatted by this phase                                                                                                                                      |
| Bundle investigation                                                                                                                                                                                                                | Read-only transform-time comparison excluded only this phase's web edits without changing the shared checkout or baseline. The comparison passed. The appearance adapter was then changed to defer native registration rather than accepting startup growth |
| pnpm build:pages                                                                                                                                                                                                                    | Final result recorded below                                                                                                                                                                                                                                 |
| Final Android web sync/debug assembly                                                                                                                                                                                               | Final result recorded below                                                                                                                                                                                                                                 |
| ADB inventory                                                                                                                                                                                                                       | No connected device                                                                                                                                                                                                                                         |

Full logs remain in ignored output/system-bars-*.log. No coverage threshold, assertion, timeout, bundle ceiling or baseline was weakened or increased. The combined gate's failures are disclosed; no reusable full quality pass or release readiness is claimed from the targeted checks.

## Visual/manual evidence

[Actual-app gallery](../evidence/seamless-system-bars/README.md): six 390px/768px/1440px Arabic/English screenshots. Only phone captures simulate a native 32px inset; ordinary tablet/desktop captures have zero top padding and start the reader/hero at y=0. No Android icons were fabricated.

Feature screenshots and traces are preserved under output/system-bars-browser-results. Exact successful JSON: output/system-bars-private-results.json. Native reports: android/app/build/reports/lint-results-debug.html and android/app/build/test-results/testDebugUnitTest/.

The earlier two capture attempts used shared browsing storage; another open review tab reapplied its paper setting. They failed the plain-paper assertion safely. Final capture uses independent browser contexts and passes. Application persistence behavior was not changed as a workaround.

## Documentation updated

Native/platform ownership, seamless appearance contract, acceptance requirements, active scoped phase, owner selection and actual evidence are recorded in the files listed above. Religious-content documentation and reviewed records were not changed by this phase.

## Decisions recorded

The owner selected Seamless light and explicitly requested applying locally. The tonal header/divider alternative is not implemented. No commit, push, release-note edit or publication.

## Known limitations or remaining risks

- Real-device status/navigation icons, cold launch, process death, Android 15/16 edge-to-edge, OEM cutouts, gesture/three-button navigation and TalkBack remain pending. Mocked/browser/native unit evidence does not replace these.
- Existing installed APKs require rebuilding/installing this native host; OTA web assets alone cannot add the Java plugin. Older binaries fail the optional appearance call harmlessly.
- Native presentation stores only a color. Progress, settings snapshots, content, prayer behavior, audio and synchronization retain their existing normalization and persistence boundaries.
- Independent shared-checkout formatting and full-gate verification remain release concerns; no publication was attempted. The explicit browser adapter removes this feature's browser-startup native import; final Pages budget passed with the unchanged baseline.

## Out-of-scope findings

Concurrent unrelated work edits the same checkout and uses the default browser output directory. This phase isolated its preview and artifacts after diagnosing that collision. No shared test configuration or other job was stopped or modified.

## Recommended next step

Install the rebuilt local debug APK on a representative phone and verify light/dark/Glass switching, background return and system navigation. Reconcile the combined pending batch and rerun full release gates only when its owners request publication.

## Final verification addendum

- Pages production build and bundle/CSS checks passed after applying the explicit browser adapter alias: exit 0; Home startup 524,749 gzip bytes. No budget/baseline change.
- Scoped Prettier, targeted ESLint and TypeScript passed. Appearance/font/isolation suites still pass all 28 cases.
- Final Chromium: all 11 cases passed, including mounted Forced Colors switching. The runner then stalled during browser cleanup; only that runner and its browser descendants were terminated. No assertion/timeout changed. Firefox/WebKit were checked separately: all 22 cases passed in 4.3m, exit 0. This is not represented as a clean exit of the stalled combined runner.
- Final complete pnpm check: exit 1 after 593.7s. All stages except unit tests passed, including format, lint, typecheck, build, bundle budget, content/audio/timing/motion/type-scale and CSS checks. Units: 374 files/2,713 cases passed; 12 cases failed across four suites. Seven counter and two sharing assertions relate to independently edited Counter/CollectionShareModal files; one Mushaf layout assertion concerns the independently edited MushafPageViewer; two existing Mushaf cache cases exceeded the unchanged 45s timeout. Those modules/tests were not changed to force this phase green. The cache suite's earlier isolated recheck passed all seven cases. No full quality receipt or release readiness is claimed.
- Final APK: Android-mode sync and debug assembly passed, 183 tasks (27 executed/156 up-to-date), 2m40s. The copied local artifact is output/android/azkar-seamless-light-debug.apk (12,318,055 bytes), SHA-256 84629100b8e439aefd037a458451f029026f811a075123f9f8641f9a9ecf65b7. Archive inspection confirms native AzkarSystemBarsPlugin, bundled web bridge and root Android asset URLs. No installation or publication.
- Owner follow-up: the desktop blank strip came from the capture script applying a 32px Android inset to ordinary browser screenshots. Corrected wide captures use the actual zero inset; no mobile/physical-device safe-area support was removed. Six new RTL/LTR wide-browser cases passed across Chromium, Firefox and WebKit in 1.3m (exit 0), covering 768px and 1440px, y=0 hero/reader, zero shell top padding and no native marker/overflow. JSON: output/system-bars-desktop-gap.json; screenshots: output/system-bars-desktop-gap. Corrected Chromium images replace the earlier simulated wide captures in the gallery.
