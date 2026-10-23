# Android developer handoff — 2026-10-19

## Delivery model

Keep one React/TypeScript application. The website builds with `pnpm build:pages`; the installed Android application packages the same screens/domain logic using the existing Capacitor 8 host. Open `android/` in Android Studio after `pnpm android:sync`. Do not wrap the production website URL or copy a Pages build into Android. The packaged shell must launch without networking. Native changes belong in `src/app/native/` and the Android host, with web behavior retained at each boundary.

The host already exists; do not run `cap add android` again or regenerate it over the custom plugins. The application ID is `com.wazaker.app`. Confirm the permanent Play identity before the first upload. The current versionCode is 1; subsequent Play uploads need a higher code.

## Build and verification

Use the repository-pinned Node/pnpm versions from `.nvmrc`/`package.json`, Java 21, Android SDK 36 and the tracked Gradle wrapper. See [Android build notes](ANDROID.md), including the process-local Java socket workaround on Windows MSIX hosts.

```sh
pnpm install --frozen-lockfile
pnpm android:sync
pnpm android:open
pnpm android:debug
pnpm android:bundle
```

`android:sync` builds the Android asset variant before syncing. It is required after web source changes. Native-only changes can use Android Studio/Gradle directly. For native verification, run the existing wrapper from `android/` with `assembleDebug lintDebug testDebugUnitTest bundleRelease --no-daemon`. The Quality workflow already runs these tasks and preserves the `android-verification` artifacts. Release bundles remain unsigned until protected signing is configured.

## Existing implementation and remaining work

| Capability                                  | Existing boundary                                                                                                                        | Developer acceptance / remaining work                                                                                                                                                                                                                                                                                             |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shared UI, offline reading, counts/settings | Packaged `dist/`; `src/main.tsx` excludes PWA worker registration on Android; existing normalized state persistence                      | Verify cold airplane-mode launch, process death, reload, update-in-place, RTL/LTR and Android Back. Website and Android installations have separate device-local state; use the existing explicit sync/export flows to transfer it.                                                                                               |
| Notifications                               | `src/app/native/reminders.ts`, `reminderPlan.ts`, `useForegroundReminders.ts`; pinned local-notifications plugin                         | Native permission is requested through the existing opt-in action. Queue covers seven days and refreshes on resume/settings/completion changes. Test denial/revocation, reboot, clock/timezone changes, idle and OEM restrictions. Delivery is approximate; exact alarms and ongoing background rescheduling are not implemented. |
| Location                                    | Existing user-initiated `navigator.geolocation` path, manifest coarse/fine permissions and manual city/coordinates/timezone              | Test actual Android permission prompts, approximate location, permanent denial and manual recovery. No background location. A dedicated native geolocation plugin is not installed; add an adapter only if device evidence requires it.                                                                                           |
| Downloaded audio                            | Checksum-verified `audioOfflineCache.ts`; Android `native/cachedAudio.ts` turns a complete cached response into a revocable playback URL | Current downloads use WebView Cache Storage on the device, **not a dedicated Android files repository**. Implement the persistent app-private file backend below for the requested native download storage. Test reopening/seek under airplane mode and memory/low-storage pressure.                                              |
| Audio/file export                           | `native/saveFile.ts` → custom `AzkarFilesPlugin.java`, Android document picker, bounded bridge chunks                                    | Existing native export to a user-selected document. Test a large ZIP, cancellation, partial-write cleanup, insufficient storage and more than one document provider. This export plugin is not the internal download repository.                                                                                                  |
| Other offline assets                        | Existing web cache/persistence boundaries for Mushaf pages, fonts and timing assets                                                      | Verify the complete downloaded resource set after process death and app upgrade. Do not claim browser-cache data is a native persistent file store. Retain web fallbacks and download status/integrity checks.                                                                                                                    |
| Widgets                                     | `native/widgetSnapshot.ts`, `AzkarWidgetsPlugin`, four RemoteViews provider families                                                     | Read-only projection and routes exist. Test placement, resize, language, midnight expiry and reboot. Background tasbih increment/configuration is follow-up work.                                                                                                                                                                 |
| Accounts and links                          | Existing application routing/auth boundaries                                                                                             | Native account redirect/deletion acceptance remains pending. Validate against production provider configuration before advertising support. Notification/widget routes are separate from externally verified Android App Links.                                                                                                   |
| Background playback / remote push           | Web audio and local scheduled notifications                                                                                              | A native media foreground service, Android media-session/background-playback guarantee and FCM server push are not implemented. Specify these separately if required; daily local reminders do not require a push server.                                                                                                         |

## Persistent native download storage: next implementation phase

This is the principal gap relative to the owner's requested Android storage model. Keep website Cache Storage unchanged. Introduce a platform storage boundary beneath the existing downloader/status/remove/export/playback services; reusable presentation must not call native plugins. Review these requirements before choosing an official plugin or extending the existing host:

1. Store user-requested downloads in persistent app-specific files, rather than an evictable cache directory. Use scoped app storage without broad shared-storage permission. Explicit exports continue through the document picker. App-private data is removed on uninstall/clear-data; do not promise otherwise.
2. Use manifest identity, asset version, expected byte size and SHA-256 as the common contract. Stream to a temporary file, verify size/hash, then commit atomically. Mark a download ready only after the final file exists and is verified. Handle cancelled/partial writes and low-storage errors honestly.
3. Playback must resolve a local seekable source without loading an entire long recitation into JavaScript memory. Keep range/seek support and release resources on source replacement. A file URI alone does not establish background playback.
4. Route download availability, byte totals, deletion, retry, playback and file/ZIP exports through the same backend. Do not leave status reporting WebView-cache readiness while playback reads a different store. Preserve Android recording eligibility/rights decisions in `platformAudioPolicy.ts`.
5. Migrate complete, verified existing cache entries copy-first. Retain old entries on any copy/verification failure; remove them only after verified destination commit. Support interruption, app upgrade and manifest changes without losing saved recordings. Never clear user progress or other offline caches as recovery.
6. Retain `normalizeAppState`/merge ownership for counts/settings. A future native preferences/database change needs a separately reviewed migration with corrupt/legacy state and interrupted-write tests. Do not switch all persistence merely because audio moves to files.
7. Add contract tests for each backend and device evidence for large recordings, cold offline seek/export, storage pressure, process death and update migration. Keep web tests passing. Deliver the migration as a bounded follow-up with the Android developer.

Android documents [app-specific storage and lifecycle](https://developer.android.com/training/data-storage/app-specific). Capacitor documents the [Android host](https://capacitorjs.com/docs/android) and [native local-notification permissions/timing](https://capacitorjs.com/docs/apis/local-notifications). Recheck platform/store requirements at submission time.

## Play submission acceptance

Use the complete checklist in [ANDROID.md](ANDROID.md). The remaining owner/developer evidence includes protected upload signing/Play App Signing, final application identity/versioning, production account redirects, privacy/deletion and Data safety declarations, recording rights, real-device TalkBack/large-text/permission/offline/storage tests, and Play testing/pre-launch acceptance. Do not commit keystores, credentials, generated assets or `local.properties`.

A compiling APK/AAB and passing mocked native tests establish build/integration evidence only. The 2026-10-19 local inspection found no connected ADB device. Record actual device results, OS/WebView/OEM versions and known delivery limits before calling the Android version ready for publication.
