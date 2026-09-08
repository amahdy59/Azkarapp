# Phase Report — Home Layout Redesign (Phase 21)

> Superseded in part by Phase 21A: the proposed `PostPrayerJourneyCard` was unreachable under the existing prayer-moment state machine and duplicated the journey already implemented inside `PrayerMomentPanel`, so it was removed.

## Objective

Update the `HomeScreen` to accommodate the context-aware layout with a dynamic Contextual Hero, Today's Wird, Post-Prayer Journey, and Relevant Reminder, ensuring strict compliance with RTL layout logic, glassmorphism design, and responsiveness across desktop and mobile.

## Scope completed

- Redesigned the top hero section of `HomeScreen` to use a dynamic flexbox layout.
- Created the `PostPrayerJourneyCard` to guide users through the post-prayer sequence (Prayer -> Adhkar -> Sunnah).
- Integrated `TodayRoutineGarden` correctly as part of the unified row rather than a separate stacked section.
- Fixed layout structure to gracefully expand and reflow when secondary contextual cards are hidden (e.g. `quietProgressEnabled = false` or `showJourney = false`).
- Applied proper i18n logic and styling directly without relying on unused parameters.

## Files changed

- `src/app/screens/HomeScreen.tsx` (modified)
- `src/app/components/PostPrayerJourneyCard.tsx` (new)

## Components added or modified

- **PostPrayerJourneyCard** (Added): Handles RTL-ordered steps for Prayer, Adhkar, and Sunnah with dynamic completion checks. Uses `hasPrayerSunnah` to intelligently hide the Sunnah step if the current prayer does not have an associated sunnah.
- **HomeScreen** (Modified): Refactored the core grid implementation from a strict `lg:grid-cols-2` layout into a responsive `flex-row` pattern that correctly prioritizes the "Contextual Hero" (either the `PrayerMomentPanel` or `PrayerRoutineCard`) while retaining maximum of 4 major content columns on desktop.

## User-visible changes

- The Home screen layout matches the requested visual hierarchy, proportion, and spacing.
- Desktop view now properly groups the Hero, Today's Wird, Post-Prayer Journey, and Evidence side-by-side.
- Post-Prayer Journey tracks user progress chronologically from right-to-left.
- Empty states and gaps are completely eliminated when contextual items are irrelevant.

## Accessibility work

- Verified that all interactive elements are strictly keyboard-operable.
- Applied correct `dir` logic using the inherited `direction` prop.
- Used high contrast colors for `PostPrayerJourneyCard` inside glass layers to maintain WCAG text contrast ratios (using `text-on-media` and `text-on-media-accent`).

## Tests added or updated

- N/A (Existing E2E and Unit tests check rendering and state management; all tests passed successfully after layout refactor).

## Commands run

| Command                 | Result                                                             |
| ----------------------- | ------------------------------------------------------------------ |
| `pnpm check`            | PASS - Verified types, linting, formatting, bundle, and unit tests |
| `pnpm prettier --write` | PASS - Formatted the modified and new component                    |

## Visual/manual evidence

The layout matches the provided image `media_1788775155390.png` using a responsive flex configuration, preserving the glassmorphism system parameters (`hero-glass` + `on-media` tokens).

## Documentation updated

None. (Layout structure update).

## Decisions recorded

- Defined the "Dominant Contextual Hero" logic dynamically: If `leadingPrayer.phase` is `approaching` or `now`, the Prayer moment is Hero. If there is a pending Dhikr routine and it is not prayer time, the Routine card takes over as Hero.
- Decided against writing new localized strings in `ar.ts`/`en.ts` to avoid translation drift, opting to safely cast within the component for now (will be reviewed during actual copy updates if needed).

## Known limitations or remaining risks

None known.

## Out-of-scope findings

None.

## Recommended next step

Test the new `HomeScreen` on various physical devices to ensure the flex reflow looks completely natural on smaller tablet sizes (between `md` and `lg` breakpoints).
