# Phase 58 — Mushaf Desktop Spread & Mobile Library Polish

## Status

- **Date:** 2026-09-23
- **Phase:** 58
- **Decision:** DEC-200
- **Status:** Complete

## Objective

Elevate UI polish and accessibility across both mobile library browsing and desktop Mushaf reading: provide visual horizontal scroll affordance for library filter chips, provide clear contextual explanations for Mushaf page layouts, ensure assistive technology accurately announces two-page spreads, and stabilize lazy screen fallbacks to prevent transition shift.

## Changes Made

- **Library Horizontal Scroll Affordance (`src/app/screens/AzkarLibraryScreen.tsx`)**:
  - Implemented dynamic start and end gradient fade overlays on the category filter chips container.
  - Sensed scroll state across both RTL and LTR viewports using `Math.abs(scrollLeft)` and maximum scroll bounds.
  - Automatically recomputed affordances on viewport resize and container resize via `ResizeObserver`.
  - Added unit test in `src/app/screens/AzkarLibraryScreen.test.tsx` verifying scroll fade element rendering upon horizontal scroll.
- **Desktop Mushaf Layout Explanation (`src/app/components/MushafSettingsSheet.tsx`)**:
  - Added localized descriptive text for `layoutAuto`, `layoutSingle`, and `layoutSpread` explaining how automatic spread detection operates on screens >1024px.
  - Wired the description to the radiogroup using `aria-describedby="mushaf-layout-hint"`.
  - Added test assertion in `src/app/components/MushafSettingsSheet.test.tsx`.
- **Spread Live Region Announcement (`src/app/components/MushafPageViewer.tsx`)**:
  - Updated the polite live status region to announce `spreadLabel` ("Pages X and Y" / "صفحتا X وY") when facing pages are active, keeping screen reader status in sync with the article's accessible label.
  - Verified in `src/app/components/MushafPageViewer.test.tsx`.
- **Screen Fallback Surface Stability (`src/app/components/ScreenFallback.tsx`)**:
  - Added `min-h-[50vh] flex-1 w-full` to prevent height collapse and layout jarring during lazy reader route mounting.
- **Bilingual Localization (`src/app/i18n/en.ts` & `src/app/i18n/ar.ts`)**:
  - Added `layoutHintAuto`, `layoutHintSingle`, and `layoutHintSpread` strings.
  - Verified 100% key parity via `src/app/i18n/parity.test.ts`.

## Verification

- `pnpm vitest run src/app/screens/AzkarLibraryScreen.test.tsx src/app/components/MushafSettingsSheet.test.tsx src/app/components/MushafPageViewer.test.tsx src/app/i18n/parity.test.ts`
- All tests passing.
