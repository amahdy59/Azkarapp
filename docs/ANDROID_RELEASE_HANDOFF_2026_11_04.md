# Android release handoff · 2026-11-04

This batch changes the shared React app packaged by Capacitor. It includes a change to the native live-update adapter in TypeScript. The Android host, Gradle configuration, and native plugins have no changes in this batch. See the [full Android developer handoff](ANDROID_DEVELOPER_HANDOFF.md) for build and architecture details.

## What changed since the last release

- **Surah artwork.** Al-Kahf, As-Sajdah and Al-Mulk reading cards use optimized responsive images hosted on R2. Their existing bundled Quran image appears when the artwork is unavailable. Include an offline first-open check for these cards.

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

## Reader and material follow-up · 2026-11-04

Quran Wird now scrolls below a stationary title. The three surah cards use taller artwork and a gold heading. Reader options can change the existing App-owned vibration preference beside sound. Verify that this setting persists after relaunch and triggers the existing native haptic adapter on a counting tap. Shared hover feedback keeps text and Glass scenery stable.

The stronger dark paper tile retains its resolution and compressed size. Device/browser haptic support and the native vibration adapter still need physical-device acceptance. Soft header edges are visual presentation and should be checked on the target WebView while scrolling with large system text.

## Final listening, Progress and shared-button follow-up

Mushaf listening removes the folio row from the main view, keeps page browsing inside Audio options, puts current-ayah recovery beside Focus/Lock and emphasizes only the timed word. The utility auto-play pill sizes to content. Progress uses shared header material and matched view/filter outer frames, with compact/enlarged recovery and non-shrinking icons. Choose metrics, Quran plan editing and relevant Settings configuration navigation share neutral pill actions; primary Apply/Save remains distinct.

These are compatible web UI changes; no native permission/storage/schema, signing/version or recording/timing change is included. Test Android WebView with large system text in RTL/LTR: header tools, Choose metrics dialog focus, Focus/Lock recovery, word outlines and shared button contrast. Browser screenshots and full gates are recorded in the phase reports; they do not replace device delivery/vibration/TalkBack acceptance.
