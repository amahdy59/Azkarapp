# Phase Report — Android system-bar safe areas, local 2026-11-27

## Objective

Apply all owner-approved recommendations from the Vivo Y500 installed-APK / Android 16 investigation, locally: consistent edge-to-edge initialization, reliable shared safe-area values, protected chrome/overlays, debug diagnostics, regression evidence and a rebuilt test APK. Implementation and local verification are complete within the limitations below. No device installation, commit, push, release-note rewrite or deployment was performed.

## Scope completed

- MainActivity initializes `EdgeToEdge.enable` once. Focus, resume and configuration recovery request fresh insets through Capacitor's listener; appearance changes do not reset window-layout policy. Conflicting legacy fit-system-window/UI flags were removed.
- Explicit SystemBars `css` handling and initial `cover` viewport hint use the already bundled Capacitor support. Shared four-edge CSS tokens prefer supplied native values, including intentional zeros, and preserve browser environment fallbacks.
- Existing shell, bottom-navigation, immersive, reader/footer, audio, sharing and portalled-sheet owners consume normalized values. Content footers do not add the bottom inset a second time when navigation owns it. Contextual popups share live safe collision padding; Quran word explanations and wide index dialogs respect the same safe rectangle.
- Debug-only event-driven `AzkarInsets` diagnostics record APK/Android/WebView identity and native/web geometry at launch, page/focus/resume and changed geometry, including keyboard/rotation. Captures coalesce, stop in background and clean up on destruction. No page text, route/URL, storage, location, account or credential reads/reporting. Release source sets omit the script and use an inert diagnostic class.
- Native versionCode advances from 3 to 4 so the existing native-upgrade boundary resets an old selected web bundle. Saved progress/settings remain owned by their existing boundaries; no migration or erasure was added.

## Files changed

The shared checkout already contained independent books/audio/Quran work. This phase preserves that work and confines its edits to inset consumers, native host/diagnostics, verification and documentation. Mechanical substitutions change direct safe-area environment uses to shared tokens; they do not rewrite reviewed text or presentation anatomy. This phase's file inventory is listed below; pre-existing changes within those files remain independent.

- `README.md`
- `android/app/build.gradle`
- `android/app/src/debug/assets/insets-diagnostics.js`
- `android/app/src/debug/java/m/azkar/com/WindowInsetsDiagnostics.java`
- `android/app/src/main/java/m/azkar/com/MainActivity.java`
- `android/app/src/release/java/m/azkar/com/WindowInsetsDiagnostics.java`
- `capacitor.config.ts`
- `docs/ANDROID.md`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/QUALITY_CHECKLIST.md`
- `docs/agent/DECISION_LOG.md`
- `docs/agent/DEVICE_ACCEPTANCE.md`
- `docs/agent/INDEX.md`
- `docs/agent/phases/ANDROID_SAFE_AREAS_LOCAL_2026_11_27.md`
- `e2e/android-safe-areas.spec.ts`
- `e2e/seamless-system-bars.spec.ts`
- `scripts/android-insets-diagnostics.test.mjs`
- `src/app/App.tsx`
- `src/app/components/AccessibleCombobox.tsx`
- `src/app/components/AudioControlLock.tsx`
- `src/app/components/AudioOptionsSurface.tsx`
- `src/app/components/AudioQueueSheet.tsx`
- `src/app/components/AudioVolumeControl.tsx`
- `src/app/components/CollectionShareModal.tsx`
- `src/app/components/LayoutShells.tsx`
- `src/app/components/MushafPageViewer.tsx`
- `src/app/components/QuranWordPopover.test.tsx`
- `src/app/components/QuranWordPopover.tsx`
- `src/app/components/ResponsiveSheet.test.tsx`
- `src/app/components/ResponsiveSheet.tsx`
- `src/app/components/ScreenContainer.tsx`
- `src/app/components/ayah-share-studio.css`
- `src/app/components/floating-audio-player.css`
- `src/app/components/layout-shells.css`
- `src/app/components/masbaha.css`
- `src/app/components/mushaf-navigation-modal.css`
- `src/app/components/overlay-surfaces.css`
- `src/app/components/quran-bilingual-stream.css`
- `src/app/components/quran-reading-zoom.css`
- `src/app/components/sharing-steps.css`
- `src/app/components/ui/dropdown-menu.tsx`
- `src/app/components/ui/select.tsx`
- `src/app/hooks/useSafeAreaCollisionPadding.test.tsx`
- `src/app/hooks/useSafeAreaCollisionPadding.ts`
- `src/app/screens/CompletionScreen.tsx`
- `src/app/screens/CustomCounterScreen.tsx`
- `src/app/screens/FridaySalawatScreen.tsx`
- `src/app/screens/ReaderScreen.css`
- `src/app/screens/learn.css`
- `src/app/screens/progress-screen.css`
- `src/styles/index.css`
- `src/styles/safe-area.css`
- `src/styles/theme/layout.css`
- `src/styles/theme/surfaces.css`
- `src/styles/theme/tokens.css`
- `src/styles/theme/wordPopover.css`
- `docs/agent/reports/ANDROID_SAFE_AREAS_LOCAL_2026_11_27_REPORT.md`
- `docs/agent/evidence/android-safe-areas/README.md` and its three labelled PNGs

## Components added or modified

Added shared `useSafeAreaCollisionPadding`, `styles/safe-area.css`, debug/release `WindowInsetsDiagnostics` variants and the debug-only capture script. Modified MainActivity plus existing shell/navigation/reading/shared-sheet/Select/DropdownMenu/Combobox/audio/word-gloss/index consumers. No runtime dependency, native plugin or permission was added.

## User-visible changes

The supported layout reserves the actual top, bottom and side safe regions while preserving ordinary zero-inset browser geometry. Headers, navigation actions, reading controls and protected overlays stay in the usable rectangle as native values change. The intended device outcome is unobscured dates/actions under Android system bars; actual Vivo acceptance remains pending. The debug APK bundles the current shared local checkout, including pre-existing unpublished books/audio/Quran changes, and is a debug-signed review artifact.

## Accessibility work

Browser assertions cover 44px navigation targets, actual center-point hit testing, 320px/200% text, Arabic/English, asymmetric landscape cutouts, protected opaque menus, live collision changes and Escape/close focus recovery. Existing Mushaf index axe/keyboard cases and overlay geometry checks remain intact. Real TalkBack, native system-icon contrast and physical startup/keyboard/navigation behavior remain separate acceptance checks; no full accessibility compliance is claimed.

## Tests added or updated

- `e2e/android-safe-areas.spec.ts`: eight bilingual scenarios (24 cases across three engines) cover ordinary screens, native zero recovery, live top/bottom/side changes, contained navigation and reader footers, menus, Mushaf bars, wide index/word explanations, enlarged-text dialogs and landscape.
- `e2e/seamless-system-bars.spec.ts`: preserves existing assertions while supplying real Capacitor custom properties instead of rewriting CSS rules.
- Hook tests cover ordinary zero margins, all edges, dynamic changes, shared subscription lifetime and malformed dimensions. Debug-script tests verify geometry/startup behavior and absence of private text/routes/storage. QuranWordPopover gains a near-edge native-safe geometry regression. Existing ResponsiveSheet assertions now use normalized tokens.

## Commands run

All commands ran from the repository root unless noted. Browser previews used isolated output directories and loopback test APIs, never the production backend. Exact logs/JSON are in ignored `output/android-safe-area/`.

| Command                                                                                                                                                                                                                                                                                                                                    | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node --version`, `pnpm --version`                                                                                                                                                                                                                                                                                                         | v24.15.0 / 11.19.0                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `pnpm typecheck`                                                                                                                                                                                                                                                                                                                           | Passed, exit 0; final repeat after overlay changes also passed                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `pnpm test:run src/app/hooks/useSafeAreaCollisionPadding.test.tsx scripts/android-insets-diagnostics.test.mjs src/app/native/systemBars.test.ts src/app/components/ResponsiveSheet.test.tsx`                                                                                                                                               | 4 files / 27 tests passed, exit 0, 12.90s                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Targeted units including those above plus AccessibleCombobox, AudioOptionsSurface and HomeScreen.render                                                                                                                                                                                                                                    | 7 files / 57 tests passed, exit 0, 21.17s; `targeted-unit.log`                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `pnpm test:run src/app/components/QuranWordPopover.test.tsx src/app/hooks/useSafeAreaCollisionPadding.test.tsx scripts/android-insets-diagnostics.test.mjs`                                                                                                                                                                                | 3 files / 13 tests passed, exit 0, 30.08s; `gloss-unit.log`                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Initial new-spec Chromium run                                                                                                                                                                                                                                                                                                              | 4 passed / 2 failed because the new test incorrectly expected navigation in the deliberately full-screen phone Reader. Corrected test ownership; no product assertion or timeout was weakened                                                                                                                                                                                                                                                                                                                              |
| New safe-area + seamless-system-bars specs, Chromium/Firefox/WebKit, two workers                                                                                                                                                                                                                                                           | All 57 passed in 3.7m, exit 0; `browser-three-engine.json`                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Initial final-overlay run against port 4294                                                                                                                                                                                                                                                                                                | Started before isolated preview readiness and hit connection-refused failures. Stopped only that runner and its descendants; preserved traces. No timeout/assertion changes                                                                                                                                                                                                                                                                                                                                                |
| Final `pnpm test:e2e e2e/android-safe-areas.spec.ts e2e/mushaf-phone-index.spec.ts e2e/overlay-geometry.spec.ts --project=desktop-chromium --project=desktop-firefox-smoke --project=mobile-webkit-smoke --workers=2 --output=output/android-safe-area/browser-final-ready` with `E2E_BASE_URL=http://127.0.0.1:4294` after HTTP readiness | All 38 passed in 5.6m, exit 0; `browser-final-ready.json`                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Initial native unit compilation                                                                                                                                                                                                                                                                                                            | Found a diagnostics-only unavailable app-level AndroidX WebView import; replaced it with guarded platform API. Then corrected JSONArray construction for native compilation                                                                                                                                                                                                                                                                                                                                                |
| `node scripts/build-android.mjs testDebugUnitTest`                                                                                                                                                                                                                                                                                         | Passed, exit 0, 44s; 101 tasks (6 executed / 95 up-to-date); `native-unit-pass.log`                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `pnpm android:sync`                                                                                                                                                                                                                                                                                                                        | Passed twice, exit 0; final Android-mode assets copied after overlay changes, `android-sync-final.log`                                                                                                                                                                                                                                                                                                                                                                                                                     |
| From `android/`: `gradlew.bat assembleDebug lintDebug bundleRelease --no-daemon` through existing workflow tasks                                                                                                                                                                                                                           | Passed, exit 0, 4m24s; 479 tasks (254 executed / 225 up-to-date). Native lint: 0 errors / 34 warnings, no suppression/baseline change; `native-final.log`                                                                                                                                                                                                                                                                                                                                                                  |
| Final `pnpm android:debug`                                                                                                                                                                                                                                                                                                                 | Passed, exit 0, 54s; 183 tasks (27 executed / 156 up-to-date); `android-debug-final.log`                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Debug/release archive and release-class inspection                                                                                                                                                                                                                                                                                         | Passed: debug-only script present in APK, absent from AAB; release diagnostic class has no evaluator/logging/layout-listener references. Final APK contains normalized tokens and explicit SystemBars config                                                                                                                                                                                                                                                                                                               |
| Initial and final `pnpm build:pages`                                                                                                                                                                                                                                                                                                       | Passed, exit 0, bundle/CSS checks intact. Final Home startup: 535,142 gzip bytes; no budget/baseline increase; `pages-build-final.log`                                                                                                                                                                                                                                                                                                                                                                                     |
| `pnpm check`                                                                                                                                                                                                                                                                                                                               | Exit 1 after 459.8s: 402 unit files / 2,839 tests passed, 3 failed in 2 files. Build/typecheck, audio/Quran/listening/owner timings, type scale, motion, bundle and CSS stages passed. Initial diagnostics JS browser globals caused lint failures, fixed through explicit globals; final full `pnpm lint` passes. Format and one assertion fail in independently edited `scripts/devotional-documents.test.mjs`; two unchanged Mushaf-cache cases time out at 45s. See limitations; no complete-gate pass/receipt claimed |
| `pnpm test:run src/app/content/mushafOfflineCache.test.ts` after broad-run timeouts                                                                                                                                                                                                                                                        | All 7 passed unchanged, exit 0, 28.99s; `cache-isolated.log`. No cache source/test/timeout change                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Final `pnpm lint`                                                                                                                                                                                                                                                                                                                          | Passed, exit 0; `lint-final.log`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Scoped Prettier and `git diff --check`                                                                                                                                                                                                                                                                                                     | Passed; final documentation check recorded below                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Configured SDK `adb.exe devices -l`                                                                                                                                                                                                                                                                                                        | Empty device list; no installation or physical acceptance                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

Native builds used existing Java 21 / SDK 36 and `JAVA_TOOL_OPTIONS=-Djdk.net.unixdomain.tmpdir=C:/Users/AhmedMahdy/.cache/azkar-android/sockets`, as documented for this Windows host. No environment/credential file was committed. All existing quality assertions, browser projects, coverage and budget ceilings remain intact.

## Visual/manual evidence

[Three-image gallery](../evidence/android-safe-areas/README.md): Arabic Home, Arabic Quran word explanation and English landscape. These are actual app renders with labelled simulated Capacitor insets; no Android icons were fabricated. Browser geometry, keyboard and hit-testing assertions supplement visual inspection. Wide/zero-inset evidence remains in the original seamless-system-bars suite.

Local APK: `output/android-safe-area/azkar-safe-area-v4-debug.apk`, 12,382,731 bytes, versionCode 4. SHA-256: `51cd2122677b9724b634732314871cec6841959ed522ba7a5034414fc616e9b9`. `apk-evidence.json` records script/token/config presence. No APK installation was attempted. The release AAB compile check is local and is not a signed/approved store release.

## Documentation updated

README, architecture, design-system safe-area ownership, quality/device acceptance, Android host/diagnostic collection guide, phase brief, working index, decision log, report and labelled evidence gallery. Reviewed devotional content and source-review decisions were not changed by this phase.

## Decisions recorded

The owner explicitly authorizes applying all recommendations locally after the investigation. No commit, push, deployment, release-note edit or unrelated content repair is included. Device acceptance cannot be substituted by browser or native compilation results.

## Known limitations or remaining risks

- The exact original APK/WebView, actual Vivo native/CSS inset values and intermittent trigger remain unknown. The affected phone was not connected. Android 14/15/16 physical startup, focus return, lock/unlock, keyboard, cutouts, gesture/three-button navigation and TalkBack still need the documented device run.
- Full repository gate is not green: independent book source-line assertion/formatting work remains. That test/source work was already modified before this phase, and no safe-area file influences its source-data assertion. It is preserved untouched. The two broad-run cache timeouts pass alone unchanged. Final lint/typecheck/build and all feature checks pass, but these do not establish a full exact-snapshot quality pass or release readiness.
- No whole browser matrix was duplicated locally. Two three-engine affected-feature matrices were run; normal full exact-commit CI remains mandatory before a future deployment.
- The test APK includes the current shared checkout and uses debug signing. OTA alone cannot supply Java changes. VersionCode 4 invokes the existing native-upgrade bundle reset without clearing progress/settings; actual reinstall/relaunch and bundle recovery still require device evidence.

## Out-of-scope findings

Independent devotional-book source repairs/formatting remain in the shared checkout. They were not altered to force a passing gate. No religious text, attribution, repetition count, persisted/synchronized schema, permission, dependency, CI workflow or production configuration was changed by this phase.

## Recommended next step

Install the debug APK on a compatible connected test phone and collect `AzkarInsets` Logcat/screenshot evidence for the reported transitions in both navigation modes. Complete Vivo/Android 16 and TalkBack acceptance, then reconcile the independent book gate failures before any owner-authorized release.
