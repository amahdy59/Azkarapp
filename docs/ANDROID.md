# Android host and release verification

Start with the [Android developer handoff](ANDROID_DEVELOPER_HANDOFF.md) for the shared-code map, existing native services, missing persistent native-file download backend and implementation/acceptance sequence. Current offline audio uses device-local WebView Cache Storage; native document export does not make it an app-private file repository.

The owner approved Capacitor 8 on 2026-10-15, retaining the React/PWA application. The host uses Android API 36, minimum API 24, Java 21, a checksum-pinned Gradle wrapper and the package version for `versionName`. `versionCode` begins at 1 and must increase for each Play upload. The application ID is `com.wazaker.app`; confirm it before the first Play registration because it becomes permanent there.

## Build

Install Java 21 and Android SDK platform 36, platform-tools and build-tools. Set `JAVA_HOME` and `ANDROID_HOME` in your environment. Never commit `local.properties`, credentials, keystores or generated web assets.

The web development watcher excludes the native Android tree, including Gradle intermediates. Native edits use the Android sync/build workflow rather than triggering web hot reloads for thousands of build outputs.

```sh
pnpm install --frozen-lockfile
pnpm android:sync
pnpm android:debug
pnpm android:bundle
```

`android:sync` always builds with Vite's `android` mode before copying assets. Do not copy a Pages build into Android: its base path and recording eligibility differ. Debug APKs are installable test artifacts. The release bundle is unsigned until the owner supplies protected signing configuration; it is not a Play-ready upload. CI compiles, runs Android lint/unit tasks, builds both artifacts, and is required by Quality / verify.

On Windows MSIX hosts, Java may fail in its Unix-domain socket temporary directory before Gradle starts. Set `JAVA_TOOL_OPTIONS=-Djdk.net.unixdomain.tmpdir=<an existing non-virtualized cache directory>` for the build process. This was necessary on the audit machine; no firewall or system network configuration was changed.

## Local native boundaries

The app shell ships in the package and does not register the PWA update worker. Android audio playback resolves complete downloaded responses from the existing audio cache to temporary object URLs, releasing them on source replacement. Eligible recordings retain the checksum-verified downloader, single-file export and complete ZIP export. Large hosted audio downloads use bounded native HTTP range requests so progress can stream through the WebView without putting an entire surah in one bridge payload; the final bytes are still verified before caching. The system document picker saves files to the user's chosen provider; bounded chunks avoid a single base64 bridge payload. No broad storage permission is requested. Cancelled/failed writes attempt to remove the partial user-created document. Device acceptance must cover large ZIPs and provider-specific failures.

### Free self-hosted UI updates

The native shell uses `@capawesome/capacitor-live-update` only for binary-compatible web assets. On startup it calls `LiveUpdate.ready()` before checking the static `live-updates/manifest.json` published with the GitHub Pages artifact. A newer checksum-verified ZIP is downloaded and staged for the next app reload; the existing update prompt lets the reader choose when to apply it. If the network, manifest, checksum, or bundle is unavailable, the bundled Android assets continue to work offline. The plugin rolls back a staged bundle that does not call `ready()` within 15 seconds and automatically blocks that failed bundle.

`pnpm build:live-update` creates the Android-mode ZIP and manifest. GitHub Pages runs it after the regular Pages build, so no paid update service is required. The manifest URL and host can be overridden with `VITE_NATIVE_LIVE_UPDATE_MANIFEST_URL` and `VITE_NATIVE_LIVE_UPDATE_BASE_URL`. Live updates must not contain native plugin, permission, WebView, or storage-contract changes; those still require a store release and a new native binary. The current implementation verifies SHA-256 checksums. Add a protected RSA public key/private signing workflow before treating an untrusted publishing account as a release authority.

The owner-authorized Al-Kahf and Al-Baqarah recordings by Muhammad Al-Shara (محمد الشرع) are eligible for Android playback, verified offline download and export. Twenty-three Abdullah Muhammad variants had referenced the generic source incorrectly; their source metadata now uses the existing owner-authorized Abdullah Muhammad entry. English and Abdullah Muhammad downloads remain available. Reviewed text, files, checksums and web availability are preserved.

Four resizable native RemoteViews widget families show prayer times, an azkar entry point, Quran continuation and the current tasbih count. Their versioned local projection excludes profile, coordinates and credentials. Taps open the matching app route. The prayer projection expires at the selected location's midnight and asks for refresh rather than displaying yesterday's times. Android refresh frequency is 30 minutes; no second-by-second countdown is claimed. Tasbih opens the durable in-app counter; background increment commands and widget configuration remain follow-up work. The mockup boards are design proposals, not screenshots of this initial host implementation.

Native reminders use the pinned Capacitor local-notifications plugin, replacing a seven-day queue when settings/completions change or the app resumes. On the first native launch, the app requests Android notification permission and opens Android's exact-alarm access screen so reminders can be enabled without first visiting Settings; Settings remains the recovery and refresh path after a denial or later revocation. Prayer instants resolve the selected IANA location and DST; routine times follow the device clock as on web. Completed routine reminders are removed when their completion reaches the app. Notification taps use allowlisted internal routes. Reboot restoration excludes past reminders rather than replaying expired notifications. Exact-alarm access remains device-controlled: Android 12+ may still return denied/default, and approximate alarms, idle/battery restrictions, force-stop and OEM policies can delay or prevent delivery. Native queue errors are reported through the existing error diagnostics, and notification settings state these limits. No background location permission or coordinate upload is added.

Native widget preferences and WebView state are excluded from cloud backup/device transfer; explicit exports remain under user control. Optional account and QR synchronization continue through their existing normalized boundaries.

## Required evidence before Play submission

- Configure protected upload signing and Play App Signing; increment versionCode for subsequent uploads.
- Confirm store name/application ID, listing graphics, age/content declarations, Data safety and public privacy/deletion URLs. Match actual optional Supabase, Cloudflare presence/device sync and local native services.
- Verify provider sign-in/deletion against the production configuration and native redirect flow before advertising native account support.
- Install on representative Android versions and OEM devices: cold/offline launch, Arabic/English RTL, 200% font, TalkBack, keyboard, safe areas, rotation, compass permission/recovery and low-storage recovery.
- Download eligible Arabic/English recordings, disable networking, reopen and play/seek them. Export individual files and a large ZIP to local Downloads and another document provider; test cancellation and insufficient storage. Verify exported files in an external player.
- Place/resize each widget and verify route, count/page freshness, midnight expiration and reboot recovery. Do not claim background counting until its durable command path is implemented and tested.
- Verify opt-in/denial/revocation, pending alarms, reboot, timezone/clock changes, idle/OEM battery restrictions and force-stop; confirm no past-alarm burst.
- Confirm release contents, native-library page-size compatibility if future plugins add `.so` files, Play pre-launch report, required testing-track eligibility and staged rollout.

These are acceptance requirements, not passed checks. No physical device was connected during initial implementation, and virtualization was unavailable on the audit machine. Code/build verification does not replace device, signing or Play Console evidence.

Final-polish acceptance check (2026-10-15): platform-tools `adb devices -l` still lists no connected device. Physical Android Back, TalkBack, cutout/large-system-text, cold offline playback/export, reminder reboot/idle and placed/resized widget checks therefore remain pending. Browser keyboard/offline/RTL evidence and native CI compilation remain separate; no device pass has been inferred.

## Startup budget accounting

The approved shared Capacitor platform bridge adds 7,844 gzip bytes to the measured initial graph (163,538 → 171,382, +4.8%). The bridge has its own manual chunk so it cannot pull deferred audio catalogs into startup. The measured increase is recorded in scripts/bundle-baseline.json; absolute bundle ceilings remain unchanged.
