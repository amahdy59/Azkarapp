# Phase Report — Phase 80: Android local reminders

## Objective

Deliver enabled routine and prayer reminders on Android when the app is closed, without relying on JavaScript timers.

## Scope completed

- Added a Capacitor Local Notifications scheduler that places upcoming reminders on native Android alarms for a rolling 14-day window.
- Rebuilds the window on app startup and when reminder settings, language, location, or daily completion state changes.
- Keeps web notification behavior on the existing browser timer and service-worker path.
- Makes notification permission handling aware of the Android and browser platforms.
- Explains the distinct Android and PWA behavior in Arabic and English.

## Files changed

- `src/app/hooks/useForegroundReminders.ts`
- `src/app/hooks/useForegroundReminders.test.ts`
- `src/app/hooks/useForegroundReminders.native.test.ts`
- `src/test/isolatedSuites.ts`
- `e2e/devotional-footer.spec.ts` (dismisses an update notice that otherwise intercepts the counter after reload)
- `src/app/screens/settings/NotificationsPanel.tsx`
- `src/app/screens/settings/NotificationsPanel.test.tsx`
- `src/app/i18n/ar.ts`
- `src/app/i18n/en.ts`
- `package.json`
- `pnpm-lock.yaml`
- `capacitor.config.ts`
- `android/` (Capacitor-generated Android project and local-notifications plugin integration)
- `eslint.config.js`
- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/PRAYER_TIMES.md`
- `docs/agent/DECISION_LOG.md`
- `docs/agent/INDEX.md`
- This phase report

## Components added or modified

- `useForegroundReminders`
- Notification permission and scheduling controls in `NotificationsPanel`
- Capacitor Android project integration for Local Notifications

## User-visible changes

- Android users can receive enabled notifications after swiping Azkar away or otherwise closing its UI, using reminders scheduled up to 14 days ahead.
- Existing PWA reminders remain browser-managed. Dependable delivery after a browser is fully closed still requires server push.

## Accessibility work

- Preserved the existing native switch controls, accessible labels, keyboard operation, and permission error announcements.
- Updated permission language for app and browser contexts in both locales.
- Automated checks do not establish complete accessibility conformance.

## Tests added or updated

- Verify reminder generation for the rolling horizon, future prayer-time calculations, stable distinct alarm IDs, and completion suppression for today's routine.
- Verify the Android hook hands opted-in reminders to Capacitor Local Notifications instead of starting browser timers.
- Updated permission-copy expectation for browser/app settings.
- Updated the Firefox footer browser check to dismiss a visible PWA update notice before interacting with the counter; the previous failure was caused by the notice overlay intercepting pointer input.

## Commands run

| Command                          | Result                                                                                                                                                                                      |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile` | Passed with Node 24.21.0 and pnpm 11.19.0.                                                                                                                                                  |
| Focused Vitest                   | Passed: 20 tests across native scheduler, reminder-generation, and notification-settings suites.                                                                                            |
| `pnpm typecheck`                 | Passed.                                                                                                                                                                                     |
| `pnpm check`                     | Passed after formatting and registering the isolated native-mocking test suite.                                                                                                             |
| `pnpm build:pages`               | Passed; bundle and CSS utility budgets passed.                                                                                                                                              |
| `pnpm build:android`             | Passed; Capacitor copied the app and detected Local Notifications 8.3.1.                                                                                                                    |
| Android `:app:assembleDebug`     | Passed; debug APK assembled.                                                                                                                                                                |
| `pnpm test:e2e`                  | 668 passed, 1 skipped, 4 failed on unrelated Reader scene and footer/panel browser checks. Reader scene and footer failures reproduced in isolation; the panel failure passed in isolation. |

## Visual/manual evidence

- Android emulator: `dumpsys alarm` showed pending `RTC_WAKEUP` entries owned by Capacitor's `TimedNotificationPublisher` after launch, confirming OS alarm registration.
- Closed-app notification appearance was not conclusively observed. An attempted force-stop is not a valid swipe-away test, so no delivery claim is based on it.
- A physical-device swipe-away/reboot check remains required before claiming OEM-specific delivery behavior.

## Visual/manual evidence

- Physical-device verification is still required: enable a near-term reminder, swipe the app away, confirm delivery, and repeat after reboot.
- Force-stop is not a valid swipe-away test; Android suppresses alarms from force-stopped packages until the user launches them again.

## Documentation updated

- README, architecture, and prayer-time contracts now distinguish native Android alarms from PWA browser scheduling.
- Decision log records DEC-219; phase index links this report.

## Decisions recorded

- DEC-219

## Known limitations or remaining risks

- Android notification permission must be granted. Exact-alarm access and device power-management policies can affect punctual delivery.
- The rolling window is refreshed when the app opens or scheduling inputs change; it is not extended while the app remains unopened beyond 14 days.
- The Android emulator confirmed OS alarm registration, but an actual notification after a swipe-away and reboot was not confirmed. Device-specific power management and exact-alarm access can affect timing.
- The PWA still cannot promise closed-browser delivery without server push.

## Out-of-scope findings

- No religious content, prayer calculation formulas, persisted app-state schema, or server push infrastructure changed.

## Recommended next step

Resolve the unrelated browser-suite failures, then rerun the release gates. Verify swipe-away and reboot delivery on a physical Android device before distributing the native Android build.
