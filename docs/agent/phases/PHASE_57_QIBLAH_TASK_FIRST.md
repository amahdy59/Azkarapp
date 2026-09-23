# Phase 57 — Qiblah Task-First Redesign & Progressive Disclosure

## Status

- **Date:** 2026-09-23
- **Phase:** 57
- **Decision:** DEC-199
- **Status:** Complete

## Objective

Redesign the Qiblah experience with a calm, task-first hierarchy that solves the reader's primary prayer direction task immediately (exact bearing angle, cardinal direction, and distance to the Kaaba) on any device without requiring hardware motion sensors or unstable browser orientation permissions.

## Changes Made

- **Great-Circle Distance Calculation (`src/app/qibla.ts`)**:
  - Implemented `getKaabaDistance(latitude, longitude)` using the Haversine formula to compute distance in kilometers to the Kaaba (21.4225° N, 39.8262° E).
  - Verified with Cairo benchmark (30.0444° N, 31.2357° E) yielding ~1,287 km in `src/app/qibla.test.ts`.
- **Task-First Destination & Alignment Hierarchy (`src/app/screens/QiblaScreen.tsx`)**:
  - Placed the destination card prominently at the top showing exact bearing (e.g. 136°), cardinal direction name, and distance in km.
  - Added a 3-step practical alignment guide explaining how to face the Qiblah even without hardware sensors (bearing alignment, flat positioning, prayer direction).
  - Progressively disclosed the live motion compass sensor behind an explicit toggle, complete with sensor calibration advice when supported.
- **Bilingual Localization (`src/app/i18n/en.ts` & `src/app/i18n/ar.ts`)**:
  - Added full translation keys for Kaaba distance, alignment steps, and live sensor controls.
  - Maintained 100% parity verified via `src/app/i18n/parity.test.ts`.
- **Comprehensive Unit & Integration Tests**:
  - Created `src/app/screens/QiblaScreen.taskFirst.test.tsx` verifying distance display, cardinal direction, alignment steps, and sensor toggle behavior.
  - Ensured all existing orientation and sensor tests in `src/app/screens/QiblaScreen.test.tsx` continue to pass.

## Verification

- `pnpm vitest run src/app/qibla.test.ts src/app/screens/QiblaScreen.taskFirst.test.tsx src/app/screens/QiblaScreen.test.tsx src/app/i18n/parity.test.ts`
- All tests passing.
