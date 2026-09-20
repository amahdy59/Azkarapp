# Phase Report — Library and shared-header polish

## Objective completed

Reduce the mobile Library header footprint without hiding the familiar category pills, and give shared screen headers calm scroll separation without changing Home.

## Files changed

- `src/app/screens/AzkarLibraryScreen.tsx`
- `src/app/screens/AzkarLibraryScreen.test.tsx`
- `src/app/components/LayoutShells.tsx`
- `src/app/components/LayoutShells.test.tsx`
- `src/styles/theme/surfaces.css`
- `src/app/i18n/en.ts`
- `src/app/i18n/ar.ts`
- `e2e/responsive.spec.ts`
- `docs/agent/DECISION_LOG.md`
- `docs/agent/INDEX.md`
- `docs/agent/phases/PHASE_41_LIBRARY_FILTER_DISCLOSURE.md`

## Components added or modified

- Modified `AzkarLibraryScreen`.
- Modified the shared `Header` scroll treatment.
- Reused `TabList` and the shared dropdown menu; no new primitive or dependency was introduced.

## User-visible behavior changed

- Phones use one rounded Collections/Saved menu beside the category pills, directly below Search.
- Category pills remain visible and horizontally scrollable in the remaining row width.
- Tablet and desktop layouts retain the visible Collections/Saved tabs and category pills.
- Collections and Saved sit beside the title on wider layouts, leaving search as a clear full-width task.
- Shared non-Home headers become a glass surface only after their content scrolls; Home remains visually unchanged.
- Progress removes the former top inset so its sticky header meets the screen edge while scrolling.

## Accessibility work completed

- Preserved APG tab keyboard behavior, semantic tab panel association, and direction-aware arrows.
- Added a labelled menu trigger and radio-item semantics for compact section switching.
- Preserved 44px minimum targets, visible focus indicators, focus restoration, Escape dismissal, RTL/LTR, and localized labels.
- Kept result updates scoped to the existing polite status region.
- Added an opaque reduced-transparency fallback for the scrolled header.

## Tests added or updated

- Added a Library unit test for the compact section menu, radio semantics, selection, and applied view.
- Added responsive browser coverage for category-pill visibility, the mobile section switch, and desktop title/tab alignment.
- Added unit and browser coverage for shared header scroll state and the unchanged Home header boundary.

## Commands run and exact results

- `pnpm exec vitest run src/app/screens/AzkarLibraryScreen.test.tsx` — 9 passed.
- `pnpm typecheck` — passed.
- `pnpm exec playwright test e2e/responsive.spec.ts --project=desktop-chromium --grep "Library keeps mobile category pills"` — 1 passed.
- Focused `LayoutShells` and Library Vitest suites — 10 passed.
- Focused responsive Chromium coverage for the Library and shared header — 2 passed.
- `pnpm check` — passed in 49.6s after the final header-inset fix, including build, typecheck, lint, format, unit tests, audio manifest, bundle budget, and CSS utility checks.

## Screenshots/evidence produced

- Responsive browser geometry and interaction were verified by Playwright at 390×844 and 1280×800.
- The unobstructed Library was visually inspected in the in-app browser at phone width; the section selector and first pills share one row, the next pill remains partially visible, and the first collection appears without excess header space.
- Progress was visually inspected at phone width, while automated browser coverage verified its shared header changes state after scroll and Home does not render that shared header.

## Remaining risks or known limitations

- Real-device screen-reader and safe-area behavior remain manual release evidence.
- No commit or deployment is included; owner review of the local implementation is required first.

## Documentation updated

- Recorded DEC-183 and added Phase 41 to the improvement index.

## Recommended next phase

- Review the local Library at phone and desktop widths, then refine spacing or approve the phase for release.
