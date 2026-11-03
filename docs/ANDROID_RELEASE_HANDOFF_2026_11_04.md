# Android release handoff · 2026-11-04

This batch changes the shared React app packaged by Capacitor. It includes a change to the native live-update adapter in TypeScript. The Android host, Gradle configuration, and native plugins have no changes in this batch. See the [full Android developer handoff](ANDROID_DEVELOPER_HANDOFF.md) for build and architecture details.

## What changed since the last release

- **Updates and reminders.** The app prepares and verifies an update in the background. On Android, it selects the new bundle only when the reader taps Update. Later keeps the current bundle active. Reminder titles identify the prayer or reading, and prayer copy distinguishes a due reminder from an advance one.
- **Audio.** Queue, repeat, autoplay, Focus and lock controls share a compact row above the waveform. Lock and unlock work within Focus mode. Audio options use a flatter layout and dismiss on an outside tap. Routine buffering no longer shifts the zikr text.
- **Quran and offline reading.** Downloaded Mushaf pages and fonts are reused, and size figures use measured data for all 604 pages. Reading takes priority over background downloads. On a slow first visit the reader waits briefly for the exact font, then keeps the chosen font stable until navigation. Mobile controls reserve their own space above and below the page. Short surahs inside zikr groups show the basmalah and verses without the decorative heading.
- **Mobile layout and polish.** Masbaha phrase and target settings live behind one button. The Progress header stays visible while scrolling. Dark paper texture is more visible, and shared pointer effects are gentler with keyboard focus and reduced-motion support.

## Build and device check

1. From the agreed release commit, use the pinned Node and pnpm versions, Java 21 and Android SDK 36. Run `pnpm install --frozen-lockfile`, `pnpm android:sync`, then `pnpm android:debug` for a test APK.
2. Test an in-place upgrade over the prior build with the matching application ID and signing certificate. Check that settings, progress, bookmarks and downloaded content survive. Use the signed internal testing build for a Play-to-Play upgrade check.
3. On a phone and tablet, try Update and Later from an older eligible bundle. Relaunch after deferring. Check one-tap application, offline launch and downloaded Quran/audio, Focus lock and unlock, and scheduled reminder delivery with the screen locked. Spot-check RTL, large system text, cutouts and Android Back.
4. For Play distribution, confirm the highest uploaded version code before setting the next one. The source currently uses `versionCode 1`. Build a signed AAB with the configured upload key and test it on the internal track.

The local web quality gate, Pages build and 63 targeted browser checks passed for the application changes. The Android device and signed upgrade checks above remain to be done.
