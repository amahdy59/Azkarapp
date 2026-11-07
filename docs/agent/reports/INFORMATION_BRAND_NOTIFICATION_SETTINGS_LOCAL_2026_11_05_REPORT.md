# Phase Report — Team, help, notification settings and brand

## Objective

Finish the Information and Notifications settings review locally and present a consistent wa-zaker / وَذَكِّرْ identity.

## Scope completed

Information now shows both team members with bilingual roles and bios, small local portraits, LinkedIn and direct email. Bug and feature links open addressed email drafts. The FAQ uses plain-language answers for counting, saved items, reminders, offline use, backups, accessibility and garden progress. Its Settings links use the existing route builder. Notification settings put permission and the test action first, give the next configured time and timezone a distinct summary, and separate prayer, adhkar and contextual controls. The approved Mushaf work is preserved for screenshot review.

## Files changed

- AboutPanel, HelpPanel, NotificationsPanel, supportContact, the Arabic and English dictionaries and two compressed portraits in src/assets/team.
- CrescentMark, LayoutShells, onboarding brand, language and splash screens, crash recovery, shared-card lettering and the public SVG.
- Android launcher, splash and status-bar icon resources, Capacitor app name and localized launcher labels.
- Brand, About and browser regressions, the active phase, decision log, agent index and design system.

## Components added or modified

The existing CrescentMark now displays the same public SVG as the favicon. The Android vector uses its crescent and star outlines. The existing shared Button, ToggleTrack, protected Select, heading and field controls remain the presentation primitives.

## User-visible changes

The About page offers quick access to the FAQ and a personal way to contact the team. The FAQ links to the relevant settings. The Notifications settings page distinguishes permission, configuration and delivery guidance. The navigation, sign-in and install surfaces use the crescent and star. Progress palms retain their garden role.

## Accessibility work

Team photos have empty alt text beside visible names. Profile links identify the person and new tab. Native disclosure controls retain keyboard operation. Status, permission recovery, focus and target sizing are covered in the affected browser journeys.

## Tests added or updated

Bilingual contact assertions, localized Android labels and artwork parity, portrait loading, FAQ keyboard activation and routing, and editing an enabled reminder time. Existing readiness and Mushaf regression coverage remains in place.

## Commands run

| Command or scope                                                     | Result                                                                                                                                            |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focused brand, About, Notifications and Mushaf chrome unit tests     | 26 passed in 42.48s                                                                                                                               |
| Focused offline cache and branding rerun                             | 13 passed in 57.45s                                                                                                                               |
| Settings and reminder browser matrix in Chromium, Firefox and WebKit | 27 passed in 6.6m                                                                                                                                 |
| Sharing preview browser checks                                       | 2 passed in 36.3s                                                                                                                                 |
| Isolated WebKit reading regression retry                             | 1 passed in 34.7s                                                                                                                                 |
| `pnpm check`                                                         | Passed all stages in 271.8s, including coverage and bundle budget                                                                                 |
| `pnpm build:pages`                                                   | Passed, including CSS and bundle budget. Total output 12,570,934 bytes                                                                            |
| `pnpm test:e2e:inventory`                                            | Passed. 3,273 cases across nine shards                                                                                                            |
| Android `:app:processDebugResources`                                 | Passed in 1m 25s with an ignored local Gradle init script pointing the stale generated Capacitor dependency path at the installed Windows package |
| `pnpm audit:prod`                                                    | No known vulnerabilities found                                                                                                                    |
| `git diff --check`                                                   | Passed                                                                                                                                            |

The first full check timed out in the existing 604-page offline cache test. Its unchanged isolated retry and the final full gate passed. The initial browser run exposed an enlarged-team-card overflow, a test focus race and a WebKit reading timeout. The revised layout and keyboard test preserve the original checks. Run output is under `output/information-*.log`. The preceding Mushaf verification is in the [Mushaf phase report](MUSHAF_APPROVED_CHROME_LOCAL_2026_11_05_REPORT.md).

## Visual/manual evidence

Owner review captures are under `output/playwright/information-owner-review`, including English desktop Information, Arabic phone team, FAQ and Notifications, 320px enlarged team text, and the phone, tablet and desktop Mushaf. The final browser suite retains per-engine screenshots in `output/playwright/information-final`.

## Documentation updated

Design system, agent index, decision log and active phase. Proposed delivery content remains in the separate [notification approval catalogue](../../NOTIFICATION_CATALOG_APPROVAL_2026_11_05.md).

## Decisions recorded

Use the installed app's navy and gold mark across app identity surfaces. The FAQ uses progressive disclosure and places permission and delivery troubleshooting in a single answer. The tablet Mushaf controls remain beside or below the padded frame.

## Known limitations or remaining risks

Launcher rendering and notification delivery still need physical-device acceptance. An immediate test checks permission and the notification path for a single request. Published Pages remains on `6d740d9b`. This review candidate is local.

## Out-of-scope findings

The catalogue records possible duplicate reminders and browser notification tap routing for separate approval and testing.

## Recommended next step

Review the local settings and Mushaf screenshots. Approve delivery copy and schedules separately. Verify Android launcher and reminder behavior on a physical phone.
