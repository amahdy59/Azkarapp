# Phase Report — Prayer Home and reminders

## Objective

Unify the prayer experience across responsive Home layouts, add efficient configurable pre-prayer reminders, and give readers an explicit solid-theme Home option.

## Scope completed

- Rebuilt the stable five-prayer Home summary as one responsive strip.
- Unified the time-bounded prayer moment, virtue, journey and action inside one surface.
- Added opt-in reminders 10 or 15 minutes before all five calculated prayers.
- Replaced reminder polling with exact next-due scheduling plus focus/visibility reconciliation.
- Connected Reduce transparency to Home photography and every top-level Home surface.
- Reduced the header-to-prayer spacing.

## Files changed

The phase commit contains the exact list. Scope is limited to Home/prayer presentation, reminder state and scheduling, localized copy, tests, release notes, and their contracts.

## Components added or modified

- `HomeScreen`
- `PrayerTrackerCards`
- `PrayerMomentPanel`
- Home card surfaces
- `NotificationsPanel`
- `useForegroundReminders`

## User-visible changes

- All five prayers remain visible and actionable at every viewport width.
- The current prayer is emphasized consistently on mobile, tablet and desktop.
- Settings offers one prayer-reminder switch and a 10/15-minute lead-time choice.
- Home can be shown without translucent material or photography.
- Prayer content starts closer to the utility header.

## Accessibility work

- Preserved semantic prayer buttons, accessible names, status text, `aria-current`, and visible keyboard focus.
- Preserved logical RTL order without changing DOM or keyboard order.
- Used native switch/select semantics for reminder controls.
- Kept on-media contrast for glass and opaque theme tokens for the solid preference.

Automated checks support the result but do not constitute a claim of complete WCAG conformance.

## Tests added or updated

- Prayer reminder due-time, deduplication and efficient next-delay unit coverage.
- Reminder permission, lead-time and persistence coverage.
- Corrupt persisted lead-time recovery.
- Five-prayer strip overflow checks at 320, 390, 834 and 1440 pixels.
- Saved solid-theme Home behavior and existing glass coverage.

## Commands run

| Command                                           | Result                               |
| ------------------------------------------------- | ------------------------------------ |
| Targeted reminder/state Vitest                    | 50 passed                            |
| Targeted Home/Settings/contrast/Reader Playwright | 25 passed                            |
| `pnpm install --frozen-lockfile`                  | Passed                               |
| `pnpm check`                                      | Passed in 116.8s                     |
| `pnpm test:e2e`                                   | 367 passed, 1 skipped in 22.4m       |
| `pnpm build:pages`                                | Passed; bundle and CSS checks passed |

## Visual/manual evidence

Responsive Arabic Home screenshots were inspected at 390×844, 834×1194 and 1280×900. They show all five prayers without overflow, correct RTL placement, one-column phone and two-column tablet/desktop prayer composition, and an unobstructed desktop sidebar. The solid-theme path is verified by computed-style and DOM assertions: no photograph, no top-level Home glass, and an opaque card color.

## Documentation updated

- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/PRAYER_TIMES.md`
- `docs/agent/DECISION_LOG.md` (DEC-164)
- This phase report

## Decisions recorded

- DEC-164

## Known limitations or remaining risks

- Browsers cannot guarantee scheduled execution after the PWA is completely closed without a connected push service. Settings and Help disclose this boundary.

## Out-of-scope findings

- A server push-scheduling service is intentionally not introduced in this static, private, offline-first phase.

## Recommended next step

Deploy the exact verified commit and run production Home/Settings smoke checks.
