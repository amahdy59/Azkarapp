# Phase report — audit remediation and Android preparation

## Objective

Apply the owner-approved audit recommendations in bounded changes, retaining React/PWA, durable offline progress and reviewed content. Add the explicitly approved Capacitor Android host and native service boundaries. The owner accepted SDK terms and chose to exclude only the two permission-pending Muhammad Al-Shara recordings from Android.

## Scope completed

| Audit item | Disposition                                                                                                                                                                                                                             |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A01        | Clone completion Sets before optimistic writes; delayed final-count summary regression passes in Arabic/English.                                                                                                                        |
| A02        | Guard storage access behind a device-link hook; mount/storage-event regressions pass.                                                                                                                                                   |
| A03        | Reconcile local, Supabase, QR/Cloudflare and anonymous presence disclosure in app/public privacy and deletion pages.                                                                                                                    |
| A04        | Abort/deadline requests and JSON bodies at 15 seconds; avoid overlapping heartbeats, expose truthful sync states and retry.                                                                                                             |
| A05        | Inventory confirms 2 Muhammad Al-Shara, 108 Abdullah Muhammad and 143 English variants. Correct 23 Abdullah source links; restrict only the 2 Muhammad Al-Shara variants on Android. No file/hash/text changes or invented permissions. |
| A06        | Dedicated capture configuration collects 28 evidence/baseline tests; normal release inventory remains separate.                                                                                                                         |
| A07        | Original WebKit Al-Kahf scrolling regression passes three consecutive unchanged runs. Root cause of historic CI flake remains unproven; no assertion/timeout weakened.                                                                  |
| A08        | Replace the stale skipped carousel test with current two-summary/all-five disclosure, aligned geometry, future-action exclusion and native tracking assertions.                                                                         |
| A09        | Search renders 20 results per batch with explicit continuation and query-reset regression.                                                                                                                                              |
| A10        | Add deterministic hydration, owner scoping, 500-row pagination, missing-table and write-failure tests. Raise auth floors to 65% statements / 70% branches / 55% functions / 70% lines. Live auth/RLS acceptance remains separate.       |
| A11–A12    | Extract pairing and device-link ownership; isolate native widget/reminder/file boundaries. Further App/Reader/Mushaf decomposition remains future bounded work.                                                                         |
| A13        | Preserve synchronous partial-count durability. Representative-device persistence profiling remains pending.                                                                                                                             |
| A14        | About and Android versionName use package metadata; About also shows the actual built release stamp.                                                                                                                                    |
| A15        | Recognized city labels, account numbers, public Arabic legal summaries and email support improved without changing stored custom names.                                                                                                 |
| A16        | Current-phase pointer and stale timing-catalog statement corrected.                                                                                                                                                                     |
| A17        | Automated build/browser evidence added; physical device, TalkBack, battery, compass and performance evidence remains pending.                                                                                                           |

## Files changed

- Session/progress: useSessionHandlers and tests; e2e/session-completion.spec.ts.
- Device services: cloudflareSync and tests, VisitorCount and tests, useCloudflareDeviceSync, deviceSyncStatus, useDeviceLinkStatus/useDevicePairing and QR/Account settings.
- Presentation: SearchScreen, Home/Qibla and Settings location labels, About, Help, Notifications, Downloads and AudioFileExports, Arabic/English dictionaries and public legal pages.
- Native: android/ host/resources/plugins/tests, capacitor.config.json, native/ platform/reminder/widget/cache/export modules, useNativeServices, startup notification/worker integration, shared file dispatcher and AudioProvider.
- Audio metadata/policy: audioAssetsCore, audioManifest, platformAudioPolicy, resolveAudioAsset and audioOfflineCache; existing review assignments and source bytes remain unchanged.
- Tooling: pinned Capacitor core/android/CLI/local-notifications dependencies, capture configuration, build-android script, native CI gate, auth floors, deliberate bundle baseline and release manifest/history.
- Docs: README, architecture, prayer/quality/audio contracts, Android runbook, decision log/index, original audit and this phase brief/report.

## Components added or modified

The shared completion handlers and settings/search components retain their existing visual system. Four RemoteViews widget providers share one renderer and versioned projection. Native plugins own allowlisted widget routes and bounded system-document exports. React screens retain existing normalization/merge/persistence boundaries.

## User-visible changes

Final completion reaches its summary. Blocked storage does not crash Account. Sync reports waiting/saving/saved/error and offers retry. Broad search loads in batches. Known cities and account totals localize. Help exposes email; public privacy/deletion/terms have Arabic sections. Audio remains downloadable/exportable, including verified offline web export; Android uses a system picker and local cached playback.

## Accessibility work

Preserve native controls, 44px continuation/retry/support targets, focus indicators, RTL/LTR and status announcements. Replacement prayer coverage retains geometry and actionable tracking. Android resources include Arabic labels, RTL/resizing and branded vector launch assets. Browser automation is not a WCAG or TalkBack compliance claim.

## Tests added or updated

Regressions cover immutable completion, blocked storage, stalled fetch/body deadlines, heartbeat overlap/unmount, sync retry/status, search batching, known-city identity, auth boundaries, native reminder planning/queue/permissions, restricted-source identity, cached playback and bounded file transfer/cancellation. Native route tests reject external, malformed and out-of-range routes. Export mocks now target the actual async device-save boundary. The real lazy sharing module is awaited in its unit interaction test to avoid racing Vitest transformation; browser cold-loading coverage remains intact.

## Commands run

| Command                                                                               | Exact result observed before release                                                                                                       |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| pnpm check                                                                            | Passed all stages in 157.4s after repairing initial formatting, export mock, lazy-test and eager-audio bundle failures.                    |
| Native Gradle assembleDebug lintDebug testDebugUnitTest bundleRelease --no-daemon     | Passed, 333 tasks (118 executed / 215 up-to-date), 1m35s. App lint: 0 errors, 8 warnings. Native route test: 1 passed, 0 skipped/failures. |
| Targeted production Chromium audio export/search/completion/current-prayer specs      | 12 passed, 1.7m; Arabic/English cached audio exported with networking disabled.                                                            |
| Targeted Chromium completion/legal/prayer specs                                       | 7 passed, 10.0s.                                                                                                                           |
| Original WebKit Al-Kahf responsive test, repeat-each=3                                | 3 passed, 1.5m, unchanged scroll assertion.                                                                                                |
| Capture --list                                                                        | 28 tests in 2 files.                                                                                                                       |
| Audio policy/architecture/offline-cache targets                                       | 38 passed in 3 files.                                                                                                                      |
| Existing Home/Qibla/location settings targets                                         | 29 passed in 3 files.                                                                                                                      |
| Native reminder/file queue targets                                                    | 5 passed in 2 files.                                                                                                                       |
| Frozen install, pre-push core smoke/Pages build, exact-commit CI and production smoke | Required by the intact release cycle; results are recorded by hook/CI artifacts and the final task report, rather than predicted here.     |

Initial Android lint correctly rejected missing Arabic resource translations. Those were fixed alongside manifest order, boot-intent validation and scaffold icon/splash cleanup. Remaining warnings concern generated optional resources, wrapper update availability and monochrome fallback detection; no lint rule was disabled. Java's Windows MSIX socket issue was resolved with a process-local non-virtualized socket directory, not firewall/system changes. SDK/JDK downloads were checksum-verified after explicit owner authorization.

A targeted auth-only coverage diagnostic intentionally did not satisfy unrelated state/prayer global floors; the complete quality suite subsequently passed those intact floors. Targeted auth measured 73.41% lines, 69.18% statements, 74.75% branches and 58.97% functions. No overall-coverage claim is inferred from that diagnostic.

## Visual/manual evidence

The original audit gallery contains 65 screen captures and four widget concept boards under output/app-audit-2026-10-15/. Browser runs retain screenshots/traces in their normal evidence paths and JSON under output/audit-remediation/. The widget boards are proposals; initial native widgets are not claimed to match their final artwork/configuration. Debug APK and unsigned AAB are generated under android/app/build/outputs/. Both currently package zero .so libraries. No phone was attached; hardware virtualization was unavailable.

## Documentation updated

Android build/service/acceptance contracts and approved recording restriction are documented in docs/ANDROID.md, docs/audio/licensing-and-attribution.md, docs/audio/offline-caching.md and the decision log. Public release 2026-10-15-3 describes web outcomes only and is archived in bilingual release history. The approved bridge's measured startup increase (163,538 → 171,382 gzip bytes) is explicit in the baseline; absolute ceilings remain unchanged.

## Known limitations or remaining risks

This coordinated code phase does not establish Play readiness. Protected signing, Play declarations/testing eligibility, native provider redirect/deletion acceptance, physical-device TalkBack/safe-area/compass/battery/audio/export checks and representative-device performance profiling remain. Native reminders queue seven days, require reopening, can be delayed by approximate alarms/OEM restrictions and cannot overcome force-stop. Widgets currently open matching app routes; tasbih background writes and per-widget configuration/final visual layouts remain follow-up work. The two excluded recordings still need durable permission before Android inclusion. Other owner authorization references are retained as recorded, not replaced by invented licenses.

## Recommended next step

Complete exact-commit CI/Pages verification for the web release. Install the verified APK on representative devices and complete docs/ANDROID.md acceptance before protected signing or Play upload. Continue large-component extraction and widget interaction/configuration in separately reviewable changes backed by those device results.
