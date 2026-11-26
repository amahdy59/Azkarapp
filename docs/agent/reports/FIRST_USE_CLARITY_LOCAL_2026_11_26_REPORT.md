# Phase Report — Notification-first welcome, local only

## Objective

Apply the owner-approved welcome concepts locally. No commit, push, release manifest change or deployment.

## Scope completed

One optional notification decision with benefit-led Arabic/English copy, illustrative preview, collapsed actual reminder selections and explicit Enable/Later actions. Grants proceed directly; an optional location step appears only when location-dependent reminders need location confirmation. Preserve saved locations and treat fresh-install fallback Cairo as unconfirmed. Denied, dismissed, unsupported and iOS tab sessions retain reading and accurate recovery. Move storage protection into Account & data.

## Files changed

- Application: App.tsx, notifications.ts, i18n/ar.ts and en.ts, onboarding/FirstUseSetup.tsx and first-use-setup.css, settings/AccountDataPanel.tsx, StorageProtection.tsx and PrayerLocationPanel.tsx; shared components/PrayerCitySearch.tsx. Paths are below src/app.
- Tests: FirstUseSetup.test.tsx, StorageProtection.test.tsx, notifications.test.ts, e2e/first-use-calm-controls.spec.ts. Existing accessibility/audio/baseline/keyboard/narrow/navigation/pre-phase-nine/reader-microinteractions/reduce-transparency/responsive/search/settings-experience setup helpers dismiss with the existing labelled Close button instead of the removed Continue-to-Home label.
- Documentation: this report, the phase brief, INDEX, DECISION_LOG, ARCHITECTURE, DESIGN_SYSTEM and QUALITY_CHECKLIST.

Concurrent Quran/Progress changes in the shared checkout belong to a separate scope and were preserved.

## Components added or modified

FirstUseSetup uses protected ResponsiveSheet/SheetHeader and shared Button. PrayerCitySearch receives prepared offline results and selection callbacks; both welcome and prayer Settings use it. StorageProtection is a Settings-owned explicit browser request beside saving/backup.

## User-visible changes

No permission is requested on mount. Selected reminders remain inspectable and editable through Settings. Granting permission advances automatically; GPS/manual city selection saves through App's existing location/reminder owner. Later/Close, failed GPS and denied notifications retain ordinary reading and saving. Browser background/full-closure limitations remain explicit. iOS installation guidance does not imply that installation supplies a push backend. Existing choices and overnight opt-in are unchanged.

## Accessibility work

Protected opaque surfaces, bounded compact desktop width, phone bottom origin, native details/summary, 44px actions, wrapping copy, separate city search/results scrolling, explicit keyboard focus on step changes and existing modal Escape/Back/focus containment. Real screenshots and automated geometry/opacity/hit-testing/axe checks cover RTL/LTR, 320px/200%, phone, tablet and desktop; appearance checks include solid/Glass/high contrast/reduced transparency. No complete WCAG claim or physical-device AT/delivery acceptance.

## Tests added or updated

52 focused unit tests pass across welcome, storage protection, notifications, location hook and prayer/account Settings. They cover gesture-only permission, grant/deny/dismiss/errors, duplicate/unmount guards, returning from settings, native/iOS/unsupported guidance, actual reminder selections, optional/known location, GPS refusal/success and manual city saving without losing method/adjustments.

Browser evidence includes first-install preset preservation, denied reading/reload and moved storage control in Arabic/English across Chromium, Firefox and WebKit. Responsive and appearance results are recorded below.

## Commands run

| Command                                               | Result                                                                                                                                                                                                                                    |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Targeted pnpm test:run across the six affected suites | 6 files, 52 tests passed                                                                                                                                                                                                                  |
| First-use permission browser cases, three engines     | 6 passed                                                                                                                                                                                                                                  |
| Responsive location cases, Chromium/Firefox           | 4 passed; WebKit resizing assertion subsequently waits for the replacement surface                                                                                                                                                        |
| Final responsive/appearance browser run               | 8 passed (4.6 minutes), Chromium/WebKit, both languages; see output/first-use-responsive-final.log                                                                                                                                        |
| pnpm check                                            | Failed: 2767 tests passed, 2 unchanged mushafOfflineCache timeouts; initial unused-import lint and formatting failures. Build/typecheck/content/timing/type-scale/motion/bundle/CSS checks passed. See output/first-use-quality-final.log |
| Final pnpm lint                                       | Passed; unused imports corrected; see output/first-use-lint-final.log                                                                                                                                                                     |
| Final pnpm format:check                               | Failed on 12 concurrent Quran/Progress files only; own helper formatting corrected; see output/first-use-format-final.log                                                                                                                 |
| pnpm build:pages                                      | Passed, bundle budget passed (523677 gzip bytes for Home startup); see output/first-use-pages-final.log                                                                                                                                   |
| git diff --check                                      | Passed                                                                                                                                                                                                                                    |

The first aggregate check was deliberately interrupted after screenshot review exposed width/origin issues; it is not a passing check. Initial browser/test-fixture failures were retained in local logs and repaired without weakening assertions or changing production content. Full unchanged gates are not repeatedly run to conceal the unrelated cache failures.

## Visual/manual evidence

Actual local app captures are in output/first-use-clarity, including phone-ar.png and desktop-ar.png, responsive Arabic/English welcome screens, optional city step/search and appearance fallback variants. They are screenshots of the implementation, not generated concepts. Initial screenshot inspection found and corrected a full-width desktop modal and inherited top-origin phone sheet. Browser permission/GPS responses are fixtures; native OS prompts/delivery require real devices.

## Documentation updated

Phase brief and owner decision explain the new presentation, optional permissions and local-only publication hold; architecture/design/quality documents describe shared ownership and verification. No content or persistence schema changed.

## Decisions recorded

Owner approval dated 2026-11-26 supersedes the previous multi-permission first-use presentation only. Preserve all reminder/saving/location contracts and publication hold.

## Known limitations or remaining risks

The combined checkout does not have a green aggregate quality result: two documented Mushaf cache tests time out under the full suite and independent Quran/Progress edits changed during verification. No tests, coverage, budgets or timeouts were weakened. Browser reminders still stop at full closure and may pause in background; this phase adds no push service. Real iPhone/Android permission, alarms, assistive technology and delivery acceptance remain separate.

## Out-of-scope findings

Separate Quran/Progress work is present. The two Mushaf cache timeouts match the prior documented complete-gate limitation and are unrelated to the welcome scope. Do not silently modify those areas to obtain a green result.

## Recommended next step

Review the local welcome screenshots and verify real-device permission/recovery. Resolve aggregate cache/parallel-work gate limitations before any future release. No push is authorized.
