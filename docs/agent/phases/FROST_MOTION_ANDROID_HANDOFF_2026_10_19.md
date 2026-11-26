# Phase Report — Home frost, motion and Android handoff

## Objective

Apply the owner's screenshot request for softer Home scroll frost and synchronized prayer-card motion. Prepare the existing shared-code Android host for the Android developer. The owner's subsequent instruction requires returning for review before any push; publication is withheld.

## Scope completed

Plan before editing: inspect documented Home/material/motion contracts, existing CSS/threshold/scroll tests and Capacitor boundaries; replace layered dark scroll backing with one frosted surface; synchronize the existing CSS handoff; verify affected browser/native paths; prepare the Android handoff/artifacts and fresh notes; complete local quality checks. The owner subsequently withholds push/deployment pending review. Two bounded scopes; no native storage migration, reviewed content, persistence or dependency change.

## Files changed

Home CSS and four existing browser specs; architecture/design/motion contracts; README/Android guide and new ANDROID_DEVELOPER_HANDOFF.md; decision log/index/phase report; bilingual release notes and existing offline archive.

## Components added or modified

Existing Home sticky material and expansion-value transition. No new component, hook, native plugin, persisted field or dependency.

## User-visible changes

Scrolled Home Glass uses one 60% on-media tint, restrained sheen and stationary 32px frost instead of the 88% backing plus extra header tint. Its utility header is transparent; child cards retain their tint/edges without nested frost. Resting and independent Opaque/App choices remain.

One immediate 220ms expansion-value transition replaces the 60ms hold and 160ms contraction. Footer details fade during the first 60ms and compact countdown arrives during the final 60ms; expansion reverses visibility order. Both directions finish together. Stable text size, reserved flow footprint, native scroll/horizontal position, interaction holds and instant reduced-motion cancellation remain.

## Accessibility work

Preserve semantics, non-live countdown, 44px targets, visible focus, Arabic/English, enlarged text, keyboard scrolling and material/motion fallbacks. Browser geometry/axe results supplement actual device/screen-reader acceptance; no complete compliance claim.

## Tests added or updated

Motion tests require immediate 220ms geometry and coordinated detail delays. Material tests require 60% shared tint, transparent nested header, one filter and existing fallback/independence recovery. All previous geometry/reversal/flow/enlarged-text/accessibility assertions remain.

## Commands run

| Command                                                                    | Result                                                      |
| -------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Focused hook/card/native Vitest files                                      | 33 tests / seven files passed; 24.41s, exit 0               |
| Chromium motion/scroll/material/independence specs                         | 13 passed; 1.4m, exit 0                                     |
| pnpm android:sync                                                          | Passed; Android Vite build 47.73s, Capacitor sync complete  |
| Gradle assembleDebug lintDebug testDebugUnitTest bundleRelease --no-daemon | Passed; 1m32s, 333 tasks; app lint seven warnings/no errors |
| adb devices -l                                                             | No connected device                                         |

The selected Firefox/WebKit motion, stable-scroll, enlarged-text and independent-material checks all pass: 28 tests, 9.0m, exit 0. The initial shared-checkout `pnpm check` ran while another session changed Quran sharing files: formatting and eight sharing-layout tests failed in that unrelated in-progress scope (2,082 passed). Isolate this phase in its managed worktree and rerun the full quality gate against its exact candidate; do not repair, stage or publish the other session's files.

Further material runs and complete isolated local quality results are recorded in `output/frost-motion-android-2026-10-19/PHASE_REPORT.md`. This ignored execution report records final verification. The owner explicitly requires returning for review before any push, so there is no new release SHA, workflow or production change. Release freshness initially ran during archive preparation; the new manifest has since been archived and validated. No hook bypass or fabricated receipt.

Final local results: `pnpm check:serial` passes every stage in 359.8s (exit 0), including all 2,090 unit tests with enforced coverage, build, typecheck, lint, formatting, content/timing validators, motion/type rules and bundle/CSS checks. `pnpm test:e2e:fast` passes 28 tests in 2.0m (exit 0), including cold offline Reader/Settings. Four additional Chromium evening-scene/preference cases pass in 3.7m; targeted plus core browser coverage totals 73 passing checks. `pnpm build:pages` passes (Vite 15.75s, exit 0), with bundle and CSS budgets intact. The source remains uncommitted; no push/deployment occurs.

The first isolated parallel full check hit one existing lazy-reader audio timeout (2,089 passed). Its unchanged five-test composition file passes alone in 20.55s, then the complete serial gate above passes. No assertion/timeout/coverage change. Final publication-hold/result documentation is formatted separately after recording these results; no reusable release receipt is fabricated or claimed.

## Visual/manual evidence

`output/playwright/glass-refinement/home-motion/` contains Arabic phone and English desktop expanded/intermediate/compact/enlarged-text captures. The Arabic compact image was visually inspected. Material/language/fallback tests retain additional screenshots in test output. Physical inertial scroll, TalkBack, OEM notification delivery and cold offline media remain manual checks.

## Documentation updated

Architecture/design/motion record the new supersession. The Android handoff maps existing native reminders/widgets/export, distinguishes WebView cache from persistent native files, and specifies migration/developer/Play acceptance work. README/Android guide link it. Release 2026-10-19.3 replaces every bilingual note and is archived.

## Decisions recorded

The current owner request supersedes the old 88% Home ground and delayed contraction only. Preserve independent appearance/accessibility. Prepare build/developer handoff; retain website caching and recommend the Android developer implement native-file storage separately. Existing native reminders do not establish exact alarms, remote push or guaranteed background playback. The owner's latest instruction supersedes standing release authority: do not push or deploy until returning for review.

## Known limitations or remaining risks

Audio downloads still use device-local WebView Cache Storage. Persistent app-private files, copy-first migration and large-file seek/storage-pressure acceptance are specified for the Android developer. Signing, Play declarations/acceptance, native auth redirects, actual permission/notification/offline/TalkBack checks remain outstanding. The APK is for testing; the unsigned bundle is not Play-ready. Existing native lint/tooling warnings remain visible.

## Out-of-scope findings

No destructive storage migration or devotional content change. Read-only widgets do not gain background counting. Location retains user-initiated WebView/manual recovery.

## Recommended next step

Give the Android developer the handoff, matching source snapshot and test APK. Implement persistent native download storage, then complete device/Play acceptance. Review Home frost/motion on the owner's actual phone.
