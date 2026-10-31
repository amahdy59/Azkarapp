# Android Reliability Repair — 2026-10-31

## Objective completed

Initial implementation of the five-stage Android reliability plan. The subsequent review found duplicate haptic dispatch, reversed native waveform timing, a remaining Progress inset, incomplete exact-page markers and stale queued playback. This report describes the initial changes, not certified Nord 4 acceptance. See [the follow-up phase](ANDROID_RELIABILITY_FOLLOWUP_2026_10_31.md) for corrections and measured validation. The installed Android/OxygenOS version is unverified.

## Files changed

- `android/app/src/main/AndroidManifest.xml`: Declared `android.permission.VIBRATE`.
- `android/app/src/main/java/m/azkar/com/AzkarHapticsPlugin.java`: Native Capacitor plugin implementation supporting tap click feedback and waveform vibration patterns.
- `android/app/src/main/java/m/azkar/com/MainActivity.java`: Registered `AzkarHapticsPlugin.class`.
- `src/app/native/haptics.ts`: Native bridge wrapper dispatching haptics commands.
- `src/app/native/haptics.browser.ts`: Browser fallback stub ensuring zero web runtime overhead.
- `src/app/native/haptics.test.ts`: Isolated unit test suite for native haptics bridge dispatch and error handling.
- `src/test/isolatedSuites.ts`: Registered `src/app/native/haptics.test.ts` into isolated test suites.
- `vite.config.ts`: Configured path alias mapping `haptics.ts` to `haptics.browser.ts` in browser mode.
- `src/app/motionPreferences.ts`: Dispatched non-blocking native haptic feedback when haptic feedback setting is enabled.
- `src/app/components/MushafNavigationModal.tsx`:
  - Added safe area clearance `top-[max(0.5rem,env(safe-area-inset-top))] bottom-[max(0.5rem,env(safe-area-inset-bottom))] left-[max(0.5rem,env(safe-area-inset-left))] right-[max(0.5rem,env(safe-area-inset-right))]` for compact dialog viewport protection.
  - Added auto-scrolling to active reading quarter/page/juz on open and tab switches.
  - Added `aria-current="true"` to active Juz header button and `data-current-quarter="true"` to active quarter button.
  - Enlarged close button and search clear button to 44×44px minimum target sizes with appropriate padding.
- `src/app/components/MushafNavigationModal.test.tsx`: Added class-level coverage for close/clear target sizes and juz `aria-current`. Actual reveal geometry and focus recovery are covered in the follow-up browser tests.
- `src/app/components/ResponsiveSheet.tsx`: Added `pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]` to `SidePanel` container to protect portalled collection drawers and settings panels from status and navigation bar overlaps.
- `src/app/components/ResponsiveSheet.test.tsx`: Verified safe-area inset preservation on portalled side panels.
- `src/app/screens/HomeScreen.tsx`:
  - Replaced duplicate `pt-[max(0.5rem,env(safe-area-inset-top))]` with standard `pt-2 sm:pt-3` inside `.app-shell`.
  - Added `onTouchStart` handler to `.home-content-scroll` container to blur active element upon touch scroll, preventing lingering focus from locking prayer geometry open.
- `src/app/screens/KhatmahReaderScreen.tsx`: Removed duplicate `env(safe-area-inset-top)` from translation toolbar header inside protected app shell.
- `src/app/components/MushafPageViewer.tsx`: Aligned header control positioning and top clearance to use `--mushaf-top-clearance` CSS variable without redundant system inset reservations.
- `src/app/components/MushafPageViewer.test.tsx`: Verified page viewer toolbar and top clearance rendering.
- `src/app/App.tsx`:
  - Ensured `startPlayAllAudio` explicitly enables and persists `autoAdvance: true` and dispatches session playback plan.
  - Added `queuedPlayAll` state to gracefully queue cold-start play intent while loading lazy audio module without silent failures.
- `scripts/compact-build-manifest.ts`: Interned `src/app/` keys in `.vite/manifest.json` post-bundle, preserving complete import graph traversal while keeping `dist` total output within the 12 MiB bundle ceiling.
- `docs/agent/DECISION_LOG.md`: Documented owner decision for 2026-10-31 Android reliability repair.

## User-visible behavior changed

1. **System Inset & Top Spacing**: Eliminates the excessive blank top gap on Android devices (e.g. OnePlus Nord 4) across Home and Mushaf reading screens, while ensuring portalled drawers (Reader Collection Drawer, Mushaf Navigation Index, Settings) never collide with system status icons or gesture bars.
2. **Audio Continuity**: Tapping "Play All" immediately activates and retains continuous playback across all playable zikrs in the collection. Cold-start taps before the audio module is resident in memory queue playback and proceed seamlessly once loaded.
3. **Android Counting Haptics**: Vibration and tap feedback on Android devices now trigger dependable native device haptics when enabled in Settings, backed by the manifest `VIBRATE` permission and native plugin.
4. **Home Motion Stability**: Touching to scroll the Home feed automatically releases lingering pointer button focus, allowing expanded prayer cards to collapse cleanly without getting stuck in an interaction hold.
5. **Mushaf Index Position**: Opening the navigation modal automatically scrolls to the reader's current page/quarter in the Quran, with distinct `aria-current` indicators and 44×44px touch targets for close and clear buttons.

## Accessibility work completed

- Ensured Mushaf Navigation Modal close button and search clear button strictly meet WCAG 2.2 AA target size requirements (minimum 44×44 CSS px).
- Added `aria-current="true"` to active Juz header button for assistive technology recognition of current location.
- Retained full keyboard navigation, visible focus rings, and screen reader announcements.

## Tests added or updated

- `src/app/native/haptics.test.ts`: Added unit tests verifying native Capacitor haptics dispatch, method routing, and error isolation.
- `src/app/components/MushafNavigationModal.test.tsx`: Added tests verifying 44px close target dimensions, current Juz `aria-current`, and quarter element discovery.
- `src/app/components/ResponsiveSheet.test.tsx`: Verified safe-area padding attributes on drawer containers.
- `scripts/compact-build-manifest.test.mjs`: Verified manifest compaction preservation of graph edges and entry chunks.

## Commands run and exact results

```bash
$ pnpm check
──── PASS  toolchain  (0.1s)
──── PASS  build  (14.4s)
──── PASS  typecheck  (17.4s)
──── PASS  lint  (17.7s)
──── PASS  audio manifest  (1.0s)
──── PASS  Quran timings  (1.0s)
──── PASS  listening timings  (1.0s)
──── PASS  owner timing previews  (1.2s)
──── PASS  type scale  (0.4s)
──── PASS  motion rules  (1.4s)
──── PASS  format  (51.2s)
──── PASS  unit tests  (97.7s)
──── PASS  bundle budget  (1.9s)
──── PASS  css utilities  (0.1s)
════ check passed in 100.6s

$ pnpm test:e2e:fast
  28 passed (1.1m)

$ pnpm build:pages
✓ built in 5.18s
Bundle budget passed.

$ pnpm audit:prod
No known vulnerabilities found

$ pnpm run check:release-notes
public/release-notes.json describes the commits waiting to deploy.
```

## Remaining risks or known limitations

- **Native Binary Build**: The Java native plugin (`AzkarHapticsPlugin.java`) and `AndroidManifest.xml` permission change require building and installing a fresh Android APK/AAB on the physical device. Web live-updates cannot modify native Java classes or Android permissions.

## Production hold reminder

Per owner instruction dated 2026-10-31, production hold remains strictly active: **no commit, push, or deployment** has been performed. All changes remain safely in the local working tree.
