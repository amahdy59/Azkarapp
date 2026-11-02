# Phase Report — Narrow tabs, notification wording and combined release

## Objective

Repair blank narrow Progress tabs and make notification enablement clear on Android and browsers. The owner authorizes publishing all pending local changes, superseding the previous publication hold.

## Scope completed

Removed the obsolete 24rem icon suppression. Generic notification permission/enable wording is shared by Settings and first-use setup; blocked Android permission has device app-settings guidance. Existing native/browser adapters and delivery limits remain authoritative. The release includes the preceding pending final-touch work documented in its phase reports.

## Files changed

This bounded fix changes progress-screen.css, NotificationsPanel.tsx, Arabic/English i18n, notification/onboarding tests, and adds progress-narrow-tabs.spec.ts and NotificationsPanel.native.test.tsx. Decision log, active phase/index, design and quality guidance, release notes and this report record the release. The full pending release inventory is available from the resulting commit diff and preceding reports.

## Components added or modified

Progress tab presentation and NotificationsPanel permission guidance. Existing shared notification copy also serves FirstUseSetup; no new runtime component or dependency.

## User-visible changes

Progress tabs retain their icons at 384px and below. Enable notifications and Notification permission apply to mobile apps and browsers. Android denial points to Android notification settings. Pending navigation, reading, material, progress and download refinements are described in the bilingual release manifest.

## Accessibility work

Retained accessible names, tab selection/keyboard semantics and 44px targets. Browser regression covers 100%/200% text and RTL/LTR. Permission failures retain scoped announcements and saved reminder choices. Automated results do not establish physical-device or complete accessibility acceptance.

## Tests added or updated

Narrow tab coverage at 320/360/375/384/390px in both languages, including icon visibility, hidden visual labels, target dimensions, pointer selection and End-key navigation. Native adapter tests exercise permission requests and denied/revoked permission recovery in both languages. Existing onboarding and notification expectations use the generic labels. The new native mock suite is registered in src/test/isolatedSuites.ts. The initial full quality run caught that missing registration (2,489 other tests passed); after repair, both the isolation-policy suite and native suite passed (6 tests).

## Commands run

| Command                                                                           | Result                                                                      |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Targeted Vitest notification panel, native panel, onboarding and native reminders | 4 files, 19 tests passed                                                    |
| Targeted Playwright narrow tabs, Chromium/Firefox/WebKit                          | 6 tests passed (1.7m)                                                       |
| Required hook, inventory, affected browser checks and audit                       | Exact command logs and exit results retained in output/narrow-tabs-release/ |

Final quality and deployment success must be assessed from the exact commit's GitHub Actions runs and production smoke evidence, not this implementation record.

## Visual/manual evidence

Playwright writes Arabic/English 384px/200% screenshots in test-results. Generated release evidence is retained under output/narrow-tabs-release/. Existing final-touch screenshots and owner references remain preserved. Physical Android notification delivery and TalkBack/VoiceOver checks remain pending.

## Documentation updated

Decision log records publication authorization. Active phase/index, design and quality contracts, this report and bilingual release notes describe the bounded fixes and combined release.

## Decisions recorded

The owner's 2026-11-03 request supersedes the local publication hold. No native storage, reminder scheduling, persistence, reviewed content, toolchain or dependency change is introduced by this fix.

## Known limitations or remaining risks

Browser and mocked native-adapter tests cannot establish real Android OS permission/delivery acceptance. Existing native-file migration, signing/Play acceptance and human assistive-technology gaps remain as documented in the preceding reports.

## Out-of-scope findings

The broader pending-tree browser run passed 72 of 78 cases and exposed an actual 320px/200% listening-control overlap: the new Focus actions intercepted Auto-continue. Below 20rem of available control width, transport, continuation and focus/lock now occupy separate rows, with shrinkable focus text. The audio continuity regression additionally verifies actual hit-testing. Five older shared-card cases still expected centered icons despite the owner's approved compact icon/label row; their geometry assertion now verifies centered vertical alignment and no icon/label overlap in compact rows, preserving centered wide-card, quantity, focus, opacity and accessibility assertions. All 14 affected Chromium cases pass after these repairs (47.6s). A WebKit app-reduced-motion diagnostic sampled a CSS animation before its startTime was assigned (null → 620ms); the no-replay assertion now waits for the animation ready promise before comparing the same start times. Duration limits and exact no-replay equality remain unchanged. Original diagnostics remain under output/narrow-tabs-release/.

The final quality run passed all tests, formatting and static checks but exceeded total output by 476 bytes after release archiving. ProgressRecordsTable has no current application caller; its unchanged table-only CSS now loads from that component instead of every Progress visit. This preserves reusable presentation and removes inactive styling from the live bundle without raising any budget. No new database or native binary change is needed. Existing pending work is released as authorized; its historical evidence remains tied to its own source checkpoints.

## Recommended next step

Complete remaining physical-device and human assistive-technology acceptance using the deployed release, preserving documented native storage boundaries.
