# Phase Report — Mushaf spread reliability

## Objective

Remove intermittent facing-page size mismatches and make Mushaf loading stable on slow, cached, and offline connections.

## Files changed

- `src/app/content/qcfMushaf.ts`
- `src/app/content/qcfMushaf.test.ts`
- `src/app/screens/KhatmahReaderScreen.tsx`
- `src/app/screens/KhatmahReaderScreen.test.tsx`
- `src/app/components/MushafImmersiveReader.tsx`
- `src/app/components/MushafPageViewer.tsx`
- `e2e/khatmah-reader.spec.ts`
- `public/release-notes.json`
- `docs/DESIGN_SYSTEM.md`
- `docs/ARCHITECTURE.md`

## User-visible behavior

Facing pages now select QCF only when both page fonts are ready. If either font is delayed or unavailable, both pages use the same fallback mode. Late font completion refreshes the visible pair together. Each page frame fills its equal spread slot, so different line widths cannot produce different paper sizes or a visible layout jump. Existing Cache Storage, prefetch, offline, and download behavior remains intact.

## Accessibility and tests

The change preserves the existing semantic page regions, keyboard controls, 44px actions, RTL/LTR movement, and offline fallback. Unit coverage verifies spread mode selection. Browser coverage asserts matching rendering modes and equal spread frame geometry at desktop and mobile responsive transitions. The complete browser suite passed 677 tests with one unrelated transient shared-link failure; rerunning that exact test passed.

## Commands run

- Focused Mushaf Vitest suites: passed, 68 tests.
- `pnpm typecheck`: passed.
- `pnpm format:check`: passed.
- Focused Mushaf Playwright suites: passed, 27 tests.
- `pnpm check`: passed, all stages.
- `pnpm build:pages`: passed, bundle and CSS budgets held.
- `pnpm test:e2e`: 677 passed, 1 skipped, 1 transient unrelated shared-link failure; exact retry passed.
- `pnpm run check:release-notes`: passed.

## Known limitations

The first uncached QCF font still comes from the existing remote source; the reader now keeps the pair visually consistent while it loads. Physical-device and assistive-technology checks remain manual evidence.

## Recommended next phase

Verify the deployed Mushaf spread on a physical phone and a slow-network profile after the Pages workflow completes.
