# Phase 45 — Progress priority and disclosure

## Objective

Give Home and Progress one prayer-first information hierarchy, reduce daily cognitive load, and keep religious claims within recorded facts.

## Approved scope

- Derive recorded-prayer and congregational-prayer counts without changing persistence.
- Reorder the Home daily-path sheet to prayer, Qur'an, then daily dhikr.
- Collapse congregation-goal configuration and link the sheet to full Progress.
- Put prayer first in every Progress period and disclose the full day tracker on request.
- Keep Qur'an ahead of the timed-dhikr breakdown and move streak/palm reflection below the day's practice groups.
- Remove spiritual-percentage presentation from the Oasis disclosure.

## Constraints

- No religious-reward score or claim about faith.
- No inference that an unrecorded prayer was missed or performed outside its time.
- No persisted-state migration or destructive rewrite of history.
- Existing prayer, Qur'an, dhikr, Friday, streak, palm, and Oasis records remain readable.

## Acceptance criteria

- Prayer is the first practice group in every period.
- Home's sheet presents the same ordered hierarchy and a direct full-progress action.
- Fifteen prayer tracking controls are collapsed by default on the day view.
- Congregation is presented as an attribute of prayer.
- Reflection metrics follow practical status.
- Arabic and English preserve the same semantic order and accessible controls.

## Required verification

- Focused daily-path, sheet, Home, Progress, and component tests.
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm test:e2e`
- `pnpm build:pages`
- Responsive Arabic/English visual inspection.

## Phase result

- **Objective completed:** Home and Progress now share the approved prayer-first semantic order. Prayer recording is summarized without inferring missed or late worship, congregation remains an attribute of recorded prayer, and secondary reflection follows the practical groups.
- **Files changed:** Progress, Home daily-path composition, shared daily-path derivation and cards, bilingual copy, focused unit/browser tests, design/decision documentation, and release notes.
- **Components modified:** `ProgressScreen`, `TodaysPathSheet`, `DailyCompanionsCard`, and their existing application composition.
- **User-visible behavior:** prayer appears first; the fifteen daily prayer controls open through one named disclosure; Qur'an and established daily remembrance follow; streak, palm, and Oasis detail are secondary.
- **Accessibility:** preserved one semantic DOM order for Arabic and English, native disclosure behavior, 44px targets, text-equivalent summaries, logical headings, keyboard operation, and non-colour status.
- **Tests updated:** added daily-path and sheet coverage; updated older prayer-tracking, prayer-virtue accessibility, quiet-garden hierarchy, and Today's Path browser tests for the new disclosure and wording.
- **Commands/results:** `pnpm install --frozen-lockfile` passed; `pnpm check` passed all repository checks; `pnpm test:e2e` passed 378 tests with 2 configured flaky retries passing and 1 intentional skip; `pnpm build:pages` is recorded in the combined release handoff.
- **Evidence:** responsive Progress checks passed for Day, Week, Month, and Year at 375px; 320px reflow, 200% zoom, 400% reflow, Arabic long labels, keyboard, forced-colour, and automated accessibility checks passed.
- **Remaining limitation:** automated checks do not replace real-device screen-reader and safe-area review.
- **Documentation:** updated the design system, decision log, phase index, this phase report, and bilingual release notes.
- **Recommended next phase:** verify the combined Progress/audio release in production before expanding either surface further.
