# Phase 53 — Zikr Counter Continuity

## Status

- **Date:** 2026-09-23
- **Phase:** 53
- **Decision:** DEC-195
- **Status:** Complete

## Objective

Persist in-progress counts for multi-repetition azkar across unmounts, screen transitions, and browser refreshes so users do not lose progress if interrupted before reaching the target count (e.g. 30/33).

## Changes Made

- **State Schema (`src/app/types.ts`)**: Added `partialZikrCounts?: Record<string, number>` to `AppStateSnapshot`.
- **Normalization & Persistence (`src/app/state.ts`)**:
  - Added `normalizePartialZikrCounts` verifying bounded non-negative integers.
  - Included `partialZikrCounts` in `DEFAULT_APP_STATE`, `normalizeAppState`, and `mergeAppStates`.
  - Cleared `partialZikrCounts` on `clearPrivateAppData`.
- **Hook Continuity (`src/app/hooks/useZikrCounter.ts`)**:
  - Added `initialPartialCounts` and `onPartialCountChange` props.
  - Ref-tracked in-progress tallies initialized from persistent snapshot.
  - Emitted `onPartialCountChange` on count increment, completion (clearing entry to 0), reset (0), and undo restore.
- **Screen Integration (`src/app/screens/ReaderScreen.tsx`, `src/app/App.tsx`)**:
  - Bound `partialZikrCounts` and `handlePartialZikrCountChange` to `ReaderScreen`.
  - Added reset in `reconcileDailyProgress` when a new day rolls over.

## Verification

- `pnpm vitest run src/app/state.test.ts src/app/hooks/useZikrCounter.test.ts src/app/screens/ReaderScreen.surah.test.tsx src/app/screens/ReaderScreen.audio.test.tsx`
- All tests passing.
