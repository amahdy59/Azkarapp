# Progress Surface Unification and Clarity — 2026-10-13

## Objective

Apply the owner's approved thorough review and plan to eliminate nested cards ("cards within cards within card"), reduce visual clutter, enhance SVG trend chart interactivity, and refine calendar and weekly data visualizations while preserving all offline data, test contracts, and accessibility baselines.

## Scope completed

1. **Elimination of "Cardception" (Nested Box Anti-Pattern):**
   - **Day View:**
     - Removed nested card borders from `FridayProgressCard`: transformed inner button cards into flat, accessible list rows with subtle surface contrast.
     - Removed nested `<dl>` card from Oasis stage `<details>`: replaced with a seamless divided footer strip without double borders or duplicate `bg-card` wrapping.
     - Flattened 7-day rhythm items into clean pill columns without heavy individual cell borders.
     - Standardized `MainDhikrGroupCard` non-media appearance on Progress to use unified surface contrast (`bg-muted/40 border-border/50`) avoiding box-in-a-box visual fatigue.
   - **Week View:**
     - Consolidated the 3 previously stacked separate cards (Weekly Matrix, Routine Comparison accordion card, and Weekly Goal card) into **one unified Weekly Rhythm Card**.
     - Embedded routine comparison bars and weekly goal progress directly inside the unified card using clean dividers.
   - **Month View:**
     - In Day Details: replaced 4 nested boxed cards (`rounded-xl bg-muted border border-border`) with a clean divided list (`divide-y divide-border/30`) featuring distinct icon badges and high-contrast status text.
     - In Calendar Heatmap: refined 35 day buttons by removing harsh borders, applying 4-tier surface luminosity tints, and displaying 3 micro-pips (dots) for partial routine counts alongside checkmarks for complete days.

2. **Data Visualization Improvements:**
   - Added direct touch/click scrubbing to SVG data points in `ProgressTrendChart.tsx` with hit targets and contextual callouts, while keeping the accessible `<Select>` combobox and data table in full sync.
   - Retained strict accessibility conformance by ensuring SVG graphical elements do not introduce focusable children inside `aria-hidden` or `role="img"` wrappers.

## Files changed

- `src/app/screens/ProgressScreen.tsx`: de-nested Oasis reflection 7-day strip and summary strip.
- `src/app/components/FridayProgressCard.tsx`: de-nested action buttons into clean flat rows; standardized outer card.
- `src/app/components/ProgressPeriodViews.tsx`: consolidated Week view into one unified card; refined Month calendar cell luminosity pips and converted day details into divided rows.
- `src/app/components/ProgressTrendChart.tsx`: added interactive point scrubbing and contextual callouts.
- `src/app/components/ProgressViews.tsx`: refined non-media dhikr card background.
- `docs/agent/phases/PROGRESS_SURFACE_UNIFICATION_2026_10_13.md`: this phase report.
- `docs/agent/INDEX.md`: updated index link.

## Accessibility work

- WCAG 2.2 AA verified with Playwright Axe scans (`AxeBuilder` with 0 violations across Arabic and English).
- Touch targets maintain at least 44×44 CSS px across calendar cells, buttons, and scrubber regions.
- Preserved bidi isolation (`<bdi>`) and localized numerals/ratios.
- Maintained equivalent semantic data tables for screen reader users.

## Quality gates and results

- `pnpm typecheck`: passed with exit 0 (`tsc --noEmit`).
- `pnpm lint`: passed with exit 0 (`eslint . --max-warnings 0`).
- `pnpm format:check`: passed with exit 0 (`All matched files use Prettier code style!`).
- Unit tests: 5 test files, 30 passed with exit 0 (`ProgressScreen`, `ProgressPeriodNavigation`, `ProgressWirdGoal`, `ProgressTrendChart`, `ProgressViews`).
- Fast e2e suite: 26 passed with exit 0 (`pnpm test:e2e:fast`).
- Full Playwright progress e2e: 5 passed with exit 0 (`e2e/progress-trends.spec.ts`).
- Production Pages build: `pnpm build:pages` succeeded with exit 0 (`Bundle budget passed.`).
