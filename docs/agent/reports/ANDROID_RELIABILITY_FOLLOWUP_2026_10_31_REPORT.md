# Phase Report — Android reliability follow-up, 2026-10-31

## Objective

Repair the confirmed implementation-review defects and investigate adjacent failures, preserving the owner's production hold. Local implementation and web validation are complete. Native compilation and physical Nord 4 acceptance remain unverified because Java and a connected device are unavailable.

`git fetch origin` confirmed main f59f27f1db3e6d341f8f3df61e81867e0c6a9c0d has zero ahead/behind commits against origin/main. The pending application changes remain local. This does not identify the installed phone's native/OTA build.

## Scope completed

- Feedback now takes one platform path per action. Native waveform conversion prepends Android's initial off interval, short taps respect device policy, longer feedback uses interaction audio attributes, and lifecycle exit cancels vibration. App-disabled feedback remains silent.
- Progress no longer adds the shell's system top inset a second time. Existing Home/Mushaf repairs and portalled inset protection were retained and exercised.
- Play all explicitly restores automatic continuation, survives the module/provider mount interval and belongs to its originating reading context. Navigation, item, routine or language changes discard obsolete intent. Related single-item/Baqarah pending loads also avoid the provider handshake race and stale context.
- A genuine audio-module failure announces an error and provides an explicit Reload app action. A browser can cache a failed dynamic import; repeating the same import was experimentally ineffective. Reload recovery is tested, and playback remains a fresh user choice after reloading.
- The index includes exact intermediate pages alongside existing shortcuts, reveals the current quarter within its own scroll region, restores its physical/keyboard opener and reflows headings/tabs/quarters at enlarged text. Expand and search actions meet the 44px baseline.
- Visual inspection exposed Quran text bleeding through the index in WebKit Glass. The existing protected opaque-surface contract now covers the dialog, retaining its bounded width. Browser assertions cover opaque paint and actual hit testing.
- The complete build exceeded the unchanged 12 MiB ceiling by 529 bytes during development. Removing redundant unreferenced font/binary manifest lookup records resolved this; actual files, referenced records and entry/CSS/import graph remain. No budget or test threshold was increased.

## Files changed

- Playback: `src/app/App.tsx`, `src/app/hooks/useQueuedAudioAction.ts`, `src/app/audio/lazyAudio.ts`, `src/app/i18n/ar.ts`, `src/app/i18n/en.ts`.
- Feedback: `src/app/motionPreferences.ts`, `src/app/native/haptics.ts`, `src/app/native/haptics.browser.ts`, `android/app/src/main/java/m/azkar/com/AzkarHapticsPlugin.java`, `android/app/src/main/java/m/azkar/com/HapticPattern.java`.
- Presentation: `src/app/components/MushafNavigationModal.tsx`, `src/app/screens/progress-screen.css`.
- Tests/tooling: the haptics, queued-action and index unit suites; `e2e/android-reliability.spec.ts`; `android/app/src/test/java/m/azkar/com/HapticPatternTest.java`; `scripts/compact-build-manifest.ts` and its test suite.
- Documentation: architecture, design and motion contracts, agent index/decision log, current phase brief, clarification of the initial Android report, and this report. Prior download/layout changes and the unrelated Android brief were preserved.

## Components added or modified

Added `useQueuedAudioAction` and native `HapticPattern`; modified App audio composition, the native haptics adapter/plugin, MushafNavigationModal and Progress sticky controls. Home's existing touch-focus release was validated without further motion timing changes.

## User-visible changes

Continuous Play all, truthful cold-load/recovery feedback, cancellation after leaving a collection, corrected top spacing, current reading-position reveal, readable enlarged index controls and reliable keyboard/touch focus recovery. Haptics implementation requires a new native binary before phone acceptance.

## Accessibility work

Localized status/error announcements; 44px close/search/expand targets; current-page/part/quarter semantics; keyboard and pointer opener recovery; Arabic/English 320px at 200% text; clipping, panel visibility, opaque paint and hit-testing assertions. Existing Home axe checks passed within the regression sweep. Automated results do not establish complete accessibility conformance or physical-device assistive-technology acceptance.

## Tests added or updated

Exclusive native/browser feedback, disabled/cancel/error paths, waveform conversion, context-owned queued actions, provider-ready timing, exact page boundaries and intermediate positions. Browser regressions exercise a real CDP touch drag after prayer-button focus, nonzero inset ownership, delayed Play all from saved manual-next preferences, stale-intent cancellation, failed import recovery, current-quarter reveal, enlarged text, Escape focus recovery and protected Glass paint. Java tests are written but not executed.

## Commands run

Browser commands used a fresh locally built preview at `http://127.0.0.1:4201`; logs, JSON and screenshots are under `output/playwright/android-followup/`.

| Command                                                                                                                                                                                                                                                                                                      | Exact result                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git fetch origin` and `git rev-list --left-right --count HEAD...origin/main`                                                                                                                                                                                                                                | Succeeded; `0 0`.                                                                                                                                 |
| `pnpm test:run src/app/components/MushafNavigationModal.test.tsx src/app/hooks/useQueuedAudioAction.test.ts src/app/native/haptics.test.ts src/app/App.composition.test.tsx`                                                                                                                                 | 4 files, 43 tests passed.                                                                                                                         |
| `pnpm test:run scripts/compact-build-manifest.test.mjs`                                                                                                                                                                                                                                                      | 1 file, 7 tests passed.                                                                                                                           |
| `pnpm test:e2e e2e/android-reliability.spec.ts e2e/audio.spec.ts e2e/home-prayer-motion.spec.ts e2e/home-prayer-scroll.spec.ts e2e/mushaf-immersive.spec.ts e2e/offline-downloads.spec.ts e2e/overlay-geometry.spec.ts --project=desktop-chromium --output=output/playwright/android-followup/final-browser` | 43 passed, 4.5 minutes.                                                                                                                           |
| `pnpm test:e2e e2e/android-reliability.spec.ts --project=desktop-chromium --project=desktop-firefox-smoke --project=mobile-webkit-smoke --output=output/playwright/android-followup/opaque-browser`                                                                                                          | Final opaque-surface revision: 11 passed, 1.2 minutes.                                                                                            |
| `pnpm check` with `CHECK_VERBOSE=1`                                                                                                                                                                                                                                                                          | Final application revision: all stages passed in 180.2s; 328 unit files, 2,347 tests passed with enforced coverage. See `release-hold-check.log`. |
| `pnpm build:pages`                                                                                                                                                                                                                                                                                           | Final application revision built in 14.46s; bundle budget and CSS utilities passed. See `production-artifact.log`.                                |
| `pnpm test:e2e:inventory`                                                                                                                                                                                                                                                                                    | 2,517 test identities preserved across all 9 partitions; zero missing/extra identities.                                                           |
| `pnpm audit:prod`                                                                                                                                                                                                                                                                                            | No known vulnerabilities found.                                                                                                                   |
| `git diff --check`                                                                                                                                                                                                                                                                                           | Passed.                                                                                                                                           |
| `pnpm exec node scripts/build-android.mjs testDebugUnitTest lintDebug`                                                                                                                                                                                                                                       | Could not execute Gradle tasks: `JAVA_HOME is not set and no 'java' command could be found in your PATH`. No native test/build pass is claimed.   |

Development failures were retained: decision-log formatting was repaired; early browser locators/expectations were corrected against actual UI; genuine focus, cached-import recovery, clipping, Glass bleed and bundle failures were repaired without weakening existing assertions. The motion checker retains one existing `overscroll-behavior: none` warning at `layout.css:511`, with zero errors.

## Visual/manual evidence

Final `opaque-browser/` includes current-quarter screenshots in Arabic/English for Chromium, Firefox and WebKit, plus `home-touch-recovery.png`. The enlarged Arabic Chromium and English WebKit images were visually inspected. The WebKit before/after images in `final-layout-browser/` and `opaque-browser/` document the repaired text bleed. Touch events are real browser input; audio events are deterministic test doubles; the 32px safe area is a CSSOM simulation, not a real Android window.

## Documentation updated

The phase brief records the approved plan before editing. Architecture/design/motion documents describe inset ownership, native feedback, queued playback, explicit reload recovery and index behavior. The initial Android report and decision log no longer imply certified phone/OS acceptance.

## Decisions recorded

Continue locally under the existing owner approval; no commit, push, deployment, reviewed content edit, persistence/schema change, runtime dependency, motion-duration change or gate relaxation. Release notes remain a pending draft from the prior work, not a published release.

## Known limitations or remaining risks

- Physical Nord 4 haptic strength, OxygenOS/system-bar behavior and the installed native/OTA build remain unverified. Native plugin/permission changes cannot arrive through web live updates.
- Native Java compilation, lint and the new JUnit tests require a configured JDK/Android toolchain. Browser mocks do not substitute for these checks.
- The final normal build is 12,582,753 bytes, only 159 bytes below the unchanged 12 MiB ceiling; Pages is 12,577,914 bytes. A later scoped size-reduction pass would give future fixes more room.
- Exact-commit CI, deployment and production smoke were deliberately not run while production is on hold. The complete browser inventory was verified; the full browser matrix was not rerun locally.

## Out-of-scope findings

No further confirmed functional defects remain in the exercised web flows. Broader device acceptance and further bundle reduction remain separate work; the unrelated Android integration brief was not modified.

## Recommended next step

Build and install a fresh test APK with a configured Android toolchain, then validate counting/completion feedback, system/app haptic-off behavior, Home scrolling, top spacing, downloads and continuous playback on the Nord 4. Preserve the production hold until the owner finishes validation and explicitly releases it.
