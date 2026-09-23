# Phase 54 — Quran Wird Completion Consistency Across Screens

## Status

- **Date:** 2026-09-23
- **Phase:** 54
- **Decision:** DEC-196
- **Status:** Complete

## Objective

Harmonize Quran Wird completion criteria across Home, ProgressScreen, and KhatmahOverviewScreen. Prevent ProgressScreen from reporting completion when a reader has only partially read towards their daily target goal, while clearly communicating fractional progress (e.g. "1 / 4 pages") on the DailyCompanionsCard.

## Changes Made

- **Daily Companions Presentation (`src/app/components/DailyCompanionsCard.tsx`)**:
  - Added `quranProgress?: { progress: number; goal: number }` prop.
  - When a daily goal is active and incomplete, rendered fractional progress string (e.g. "١ / ٤ صفحة" in Arabic, "1 / 4 pages" in English) and added a fractional ratio pill badge (e.g. "١/٤" / "1/4") alongside the empty checkmark circle.
  - When complete, displayed completion label with filled checkmark and goal ratio.
  - Added unit test coverage in `src/app/components/DailyCompanionsCard.test.tsx`.
- **Progress Calculation & History Rhythm (`src/app/screens/ProgressScreen.tsx`)**:
  - Replaced crude `wirdHistory.length > 0` checks in `quranWirdDone` and `weekDaysStatus` with `dailyPath.quran.complete` (when a goal is active) or reading at least 1 page (for free reading).
  - Preserved manual habit checkmark override (`dayHabits.some(h => h.habit === "quran_wird")`).
  - Passed `quranProgress` from `selectedDayPath.quran` to `DailyCompanionsCard`.
- **Comprehensive Unit Testing (`src/app/screens/ProgressScreen.wirdGoal.test.tsx`)**:
  - Added test suite asserting:
    1. 0 pages read of 4 -> incomplete, showing "0 / 4 pages" and "0/4".
    2. 1 page read of 4 -> incomplete, showing "1 / 4 pages" and "1/4".
    3. 4 pages read of 4 -> completed, showing "Completed" and "4/4".
    4. Free reading with 1 page read -> completed.
    5. Manual habit tick -> overrides and marks completed.

## Verification

- `pnpm vitest run src/app/components/DailyCompanionsCard.test.tsx src/app/screens/ProgressScreen.test.tsx src/app/screens/ProgressScreen.wirdGoal.test.tsx src/app/dailyPath.test.ts`
- All tests passing.
