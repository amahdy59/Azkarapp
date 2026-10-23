# Phase Report — Phase 81: Android share and save

## Objective

Repair the Android share-sheet actions shown in the supplied screenshot while preserving the browser/PWA behavior.

## Scope completed

- Added an app-registered Capacitor bridge that opens Android's native share chooser for image files, collections, text, and links.
- Routed Android image exports through FileProvider-backed cache URIs and save actions through MediaStore Downloads on Android 10+, with the system document picker on earlier supported versions.
- Kept PWA sharing and downloads on their existing Web Share and browser-download paths.
- Added native-path dispatcher tests and updated modal tests to check the new save abstraction.

## Files changed

- `src/app/share/nativeSharing.ts`
- `src/app/share/shareDispatcher.ts`
- `src/app/share/shareDispatcher.test.ts`
- `src/app/components/CollectionShareModal.tsx`
- `src/app/components/CollectionShareModal.test.tsx`
- `android/app/src/main/java/com/azkarapp/app/MainActivity.java`
- `android/app/src/main/java/com/azkarapp/app/NativeSharingPlugin.java`
- `docs/ARCHITECTURE.md`
- `docs/agent/INDEX.md`
- `docs/agent/DECISION_LOG.md`
- This phase report

## Components added or modified

- Added the Android `NativeSharing` Capacitor plugin and typed TypeScript adapter.
- Updated `shareDispatcher` and `CollectionShareModal` to use native Android handoff and save behavior.

## User-visible behavior changed

- Android Share opens the system chooser with the selected export; text and link modes also use the chooser.
- Android Save writes to `Downloads/AzkarApp` on Android 10+ and opens the system location picker on older Android.
- Browser/PWA Save and Share behavior is unchanged.

## Accessibility work

- Retained the existing button labels, focus behavior, busy state, and live success/error announcements. Android system UI supplies its native chooser and file-picker accessibility behavior.
- Automated/browser evidence does not establish complete accessibility conformance.

## Tests added or updated

- Added coverage that Android multi-file sharing, text sharing, and saving route through the native bridge.
- Updated modal assertions to await the explicit save action.

## Commands run

| Command                                                                            | Result                                                                                         |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Focused Vitest suites (`shareDispatcher.test.ts`, `CollectionShareModal.test.tsx`) | Passed: 36 tests.                                                                              |
| TypeScript compiler (`tsc --noEmit`, Node 24.21.0)                                 | Passed.                                                                                        |
| Focused ESLint                                                                     | Passed with zero warnings.                                                                     |
| Prettier check for changed TS/MD files                                             | Passed.                                                                                        |
| Vite production build                                                              | Passed.                                                                                        |
| Capacitor sync for Android                                                         | Passed; web assets and plugin metadata synchronized.                                           |
| Android `:app:assembleDebug`                                                       | Passed; native bridge compiled into the debug APK.                                             |
| Android emulator UI smoke (ADB + WebView)                                          | Passed: Save produced a 718 KB image under public Downloads; Share launched Android's chooser. |

## Visual/manual evidence

- Installed the final debug APK on an Android emulator, opened the share studio, and tapped Save. Android displayed the success status and MediaStore contained `azkar-story-001-of-10-m-hm-77m.png` in `Download/AzkarApp` (718 KB).
- Tapped Share in the image-card dialog and confirmed Android's `ChooserActivityLauncher` became the top resumed activity. The first run exposed and fixed JSONArray parsing in the native file payload. The target-app handoff was not completed.
- These checks are emulator evidence; physical-device/OEM behavior remains unverified.

## Documentation updated

- Architecture now describes Android's native chooser, MediaStore Downloads, and older-version save picker.
- Phase index and decision log updated; DEC-220 records the no-extra-runtime-dependency approach.

## Decisions recorded

- DEC-220

## Known limitations or remaining risks

- Physical Android chooser and saved-file inspection remain a device smoke test; only one image save and chooser launch were exercised in the emulator.
- On Android 10+, successful save targets the public `Downloads/AzkarApp` folder. On older Android, users choose a save location.
- The PWA continues to depend on browser support for its existing share/download mechanisms.

## Out-of-scope findings

- No PWA push work, notification changes, reviewed devotional content, or share-card rendering/layout changes.
- No commit, push, or deployment was performed.

## Recommended next step

Install the debug APK on an Android device, share one image and one multi-card ZIP, then confirm that a saved image/ZIP appears in Downloads (or the chosen location on older Android).
