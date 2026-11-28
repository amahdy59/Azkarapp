# Android system-bar safe areas — local 2026-11-27

## Owner authority and objective

Following investigation of the supplied Vivo Y500 APK screenshot and reported Android 16, the owner requests applying all recommendations locally. Correct the shared native/web safe-area boundary, add debug-only diagnostics and regression evidence, and rebuild a test APK. No commit, push, deployment, release-note rewrite or device installation is authorized by this local checkpoint. Preserve all independent book, audio and Quran work in the shared checkout.

## Plan before editing

1. Initialize supported edge-to-edge window behavior once. Remove the conflicting legacy layout flags; focus/theme recovery only reapplies appearance and requests current insets through Capacitor's existing listener.
2. Explicitly configure the bundled Capacitor SystemBars CSS inset handling and initial viewport-fit hint. Normalize its four injected inset values with browser environment fallbacks in shared theme tokens. Preserve one top inset in the shell, bottom ownership in navigation or the immersive host, and protected portalled overlays.
3. Add Android debug-only local diagnostics for APK/OS/WebView versions, native geometry/insets and computed web geometry/padding, using bounded event-driven capture for launch, focus/resume, keyboard and configuration changes. Do not record devotional text, routes, user state, credentials or location, or transmit diagnostics.
4. Add meaningful browser regressions for injected top/bottom/side values, dynamic changes and zero-inset recovery across Home, readers, Settings and overlays, RTL/LTR, enlarged text and landscape. Preserve existing browser and native assertions.
5. Run targeted units/browser checks, the complete non-browser gate, Pages build and native compile/lint/unit checks; rebuild a local Android-mode debug APK. Document exact results, screenshots, diagnostics collection and pending real-device acceptance. Native changes require installation of the rebuilt APK; web OTA cannot replace Java.

## Acceptance boundary

The screenshot establishes system-bar overlap, but the exact installed APK/WebView and native inset values are unavailable. No connected-device or Vivo-specific fix acceptance is inferred from browser/native compilation. Physical Android 14/15/16 gesture/three-button, launch, background return, lock/unlock, keyboard and rotation checks remain explicitly separate until a device is connected.

## Completed local checkpoint

Implementation, debug APK versionCode 4 and labelled evidence are complete locally. The final three-engine feature matrix passes all 38 cases; the preceding system-bar matrix passes 57. Final lint, typecheck, Pages budgets, native unit/compile/lint and debug/release diagnostics isolation pass. The full gate retains an independent book assertion/formatting failure and two broad-run cache timeouts; the unchanged cache suite passes all seven cases alone. No complete-gate or physical-device pass is claimed. See the [structured report](../reports/ANDROID_SAFE_AREAS_LOCAL_2026_11_27_REPORT.md) and [gallery](../evidence/android-safe-areas/README.md). No commit, push, deployment or installation.
