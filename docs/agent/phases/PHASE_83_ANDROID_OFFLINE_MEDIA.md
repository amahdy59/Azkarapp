# Phase Report — Android offline media playback

## Objective

Make recordings downloaded from Settings play without a connection in the installed Android app.

## Scope completed

Android now reads a verified downloaded recording from the existing Cache Storage bucket and supplies the media element a temporary Blob URL. Browser and PWA playback continue to use their hosted URL and Workbox range-request path. Temporary URLs are released when playback changes or stops; a cache failure falls back to the approved online recording.

## Files changed

- `src/app/audio/audioOfflineCache.ts`
- `src/app/audio/AudioProvider.tsx`
- `src/app/audio/audioOfflineCache.test.ts`
- `src/app/audio/AudioProvider.test.tsx`
- `docs/ARCHITECTURE.md`
- `docs/agent/DECISION_LOG.md`
- `docs/agent/INDEX.md`
- This report

## Components added or modified

- `audioOfflineCache` gained the Android-only cached-playback resolver.
- `AudioProvider` now selects a temporary downloaded-media source for Android when available.

## User-visible changes

After a reader downloads supported audio in Settings, that recording plays in the Android app with the device offline. Missing or removed downloads continue to use the normal online path and retain the existing offline error behavior.

## Accessibility work

No controls or focus flows changed. Existing player labels, progress, status announcements, keyboard controls, and error recovery remain in place.

## Tests added or updated

- Added Cache Storage playback-source coverage for Android and browser/PWA separation.
- Added AudioProvider coverage proving Android playback uses the cached Blob URL.

## Commands run

| Command | Result |
| ------- | ------ |
| Focused audio cache and provider Vitest suites | Passed: 3 files, 26 tests. |
| `pnpm typecheck` | Passed. |
| `pnpm build:android` | Passed; synchronized the updated web bundle to Android. |
| Android `:app:assembleDebug` | Passed; debug APK assembled. |

## Visual/manual evidence

Automated source-resolution evidence is complete. Android device verification remains pending: download one recording, disable connectivity, and start that same recording.

## Documentation updated

Architecture, decision log, phase index, and this report.

## Decisions recorded

DEC-222.

## Known limitations or remaining risks

The temporary Blob URL loads the complete downloaded recording into the WebView for offline playback. Physical-device testing should confirm seek and playback behavior for the largest supported download. The fix does not make recordings that were never downloaded available offline.

## Out-of-scope findings

Mushaf caching already reads Cache Storage directly and was not changed. No reviewed content, service-worker policy, storage permission, or remote audio catalog was modified.

## Recommended next step

Install the debug APK, download a supported recording in Settings, switch the device offline, and play it before release.
