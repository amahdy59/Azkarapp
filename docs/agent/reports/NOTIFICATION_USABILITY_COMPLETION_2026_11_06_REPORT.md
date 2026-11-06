# Phase Report — Notification usability and approved follow-ups

## Objective

Make Notifications & reminders easier to scan and verify. Extend the reviewed catalogue with the two ready opt-ins and prepare physical Android acceptance.

## Scope completed

Settings now shows a compact granted permission disclosure, the next configured reminder and up to three more, with their names, times and timezones. Android readiness queries the owned pending queue and exact-alarm access. A failed or unexpectedly empty queue offers a rebuild through the existing scheduling owner. The local save message uses the existing persistence status.

New readers explicitly choose whether to receive pre-Fajr reminders. Previously saved choices are preserved. Friday Salawat and Monday/Thursday fasting preparation are separate opt-ins and start off. Weekly reminders can schedule when there are no enabled daily reminders.

## Files changed

- Settings and presentation changes include `NotificationsPanel.tsx`, `SettingsScreen.tsx`, `NotificationUpcoming.tsx`, `EvidenceSource.tsx`, `EvidenceSheet.tsx`, the Home and prayer components, `materials.css`, and both locales.
- Timing and delivery changes include `contextReminders.ts`, `reminderOccurrences.ts`, `notificationCopy.ts`, `notificationEvidence.json`, `App.tsx`, the reminder and readiness hooks, native plan and adapter, notification worker, and state normalization.
- Source and build changes include `prayerVirtues.ts`, `fridayPrayer.ts`, and the existing build-only literal compactor.
- Targeted tests cover the settings, timing, worker, native, source, tooling and browser paths.

## Components added or modified

Home, prayer virtues and notification previews share a source sheet that renders the supplied quotation, reference, grading where available, and direct link. Prayer entries have explicit source URLs, including the narration variant for the Ramadan passage. [Sahih Muslim 233c](https://sunnah.com/muslim:233c)

## User-visible changes

The next reminder can be previewed before it is delivered. Settings distinguishes the prayer-location clock from routine times on the device clock and explains empty prayer selection. The new alerts open the existing Salawat or fasting sections. They use Friday at 10:00 and Sunday or Wednesday 45 minutes after Asr, within the adjacent prayer buffers. Fasting preparation honors the saved Hijri offset and the existing exclusions around Ramadan, Eid and Tashriq. [Abu Dawud 1047](https://sunnah.com/abudawud:1047) and [Tirmidhi 747](https://sunnah.com/tirmidhi:747)

## Accessibility work

The permission section uses a native disclosure. The source sheet uses shared portalling, focus containment and return, Escape dismissal, RTL/LTR direction and protected Glass paint. Browser cases cover keyboard use, hit testing, axe and reflow from 320px at 200% text through desktop. Physical assistive technology checks are pending.

## Tests added or updated

Tests cover explicit opt-ins through persistence, exact catalogue excerpts, eligible timing and fasting exclusions, weekly wake-up, both new tap routes, native queue count and recovery, source variants, emitted data equality and the empty prayer-selection message.

## Commands run

| Command or scope                                         | Result                                                                                                                                                                                                                                                                                            |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focused notification, prayer, native and tooling units   | 86 passed across 10 files. Final source and native follow-up passed 27 across three files.                                                                                                                                                                                                        |
| Initial Chromium notification set                        | 8 passed.                                                                                                                                                                                                                                                                                         |
| Chromium, Firefox and WebKit feature matrix              | 25 passed. One WebKit FAQ-to-Settings case timed out waiting for the link to stabilize.                                                                                                                                                                                                           |
| Focused browser follow-up                                | 4 passed in 3.8m, including the WebKit retry and the reduced transparency and empty prayer-selection cases.                                                                                                                                                                                       |
| Complete local quality gate                              | Concurrent run passed all stages except one Mushaf cache timeout. All six Mushaf cache cases passed in isolation in 8.50s. The serial quality gate passed in 387.8s, including 2,567 tests across 359 files, coverage, build, type checking, lint, formatting, content checks, and bundle limits. |
| `pnpm build:pages`                                       | Passed. 12,539,109 bytes with 43,803 bytes of headroom under the existing ceiling.                                                                                                                                                                                                                |
| `pnpm audit:prod`                                        | No known vulnerabilities found.                                                                                                                                                                                                                                                                   |
| Android web build, Capacitor copy and isolated debug APK | Passed. Gradle assembled the APK in 1m 47s. Its separate application ID is `m.azkar.com.acceptance` and the manifest includes both notification permissions.                                                                                                                                      |
| `adb devices -l`                                         | No connected devices listed.                                                                                                                                                                                                                                                                      |

Browser inventory passed with 3,283 cases across nine shards. The initial quality run exposed an effect cleanup lint error and a timeout in the full Mushaf cache test. The corrected effect passed lint and native units. The Android build initially hit a Java loopback error. Using a process-local temporary directory with its full Windows path resolved it.

## Visual/manual evidence

Screenshots and captured browser notification payloads are under `output/playwright/notification-usability-final` and `output/playwright/notification-usability-followup`. The phone Settings and doubled-text sheet were inspected visually. The isolated Android test package is `output/azkar-notification-acceptance.apk`.

## Documentation updated

Architecture, prayer times, content authoring, quality checklist, the notification catalogue, active phase and decision log record the new behavior.

## Decisions recorded

The owner approved the usability recommendations and ready opt-ins. The app uses the selected location and local prayer windows to place the two optional alerts. The work remains local for owner review.

## Known limitations or remaining risks

Scheduled Android delivery, system tray navigation, reboot behavior and offline startup require connected-device verification. Browser offline startup passed separately. Browser delivery remains limited by the browser lifecycle.

## Out-of-scope findings

Other calendar-sensitive topics require reviewed payloads, matching destinations or confirmed local eligibility.

## Recommended next step

Verify permission, exact-alarm access, a near-term scheduled reminder, notification tap and offline restart with persisted reading state on the connected Android phone. Review that evidence before release.
