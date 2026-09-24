# Phase Report — Phase 64: Masbaha and Progress refinement

## Objective

Give the dedicated Masbaha a clear finite intention, safer session controls, and the same reviewed-content anatomy used elsewhere, while making Progress comparisons complete and truthful.

## Scope completed

- Replaced the compact remembrance selector with a labelled, searchable reviewed-content picker.
- Removed open-ended targets from the dedicated Masbaha and normalized legacy open sessions to a reviewed finite recommendation.
- Protected non-empty sessions from accidental reset or remembrance replacement and preserved counts during target-only changes.
- Kept completed counters actionable so readers can reopen completion choices.
- Separated the configurable weekly intention from fixed seven-day routine activity.
- Restored omitted month-end cells and removed stale/ambiguous Progress states.
- Corrected focused-prayer continuation and refreshed the private Progress summary anatomy.
- Reviewed the compact Home utility header at 320 px and 390 px in English and Arabic RTL without expanding this phase into a Home redesign.

## Files changed

- `src/app/screens/CustomCounterScreen.tsx`
- `src/app/components/AuthenticZikrPicker.tsx`
- `src/app/components/ZikrComponents.tsx`
- `src/app/components/TasbeehCounterButton.tsx`
- `src/app/components/ProgressViews.tsx`
- `src/app/components/RoutineGarden.tsx`
- `src/app/screens/ProgressScreen.tsx`
- `src/app/App.tsx`
- `src/app/components/DailyCompanionsCard.tsx`
- `src/app/components/FridayProgressCard.tsx`
- `src/app/components/ShareableCardModal.tsx`
- `src/app/i18n/en.ts`
- `src/app/i18n/ar.ts`
- Focused unit and browser tests for the changed behavior
- `docs/DESIGN_SYSTEM.md`
- `docs/agent/INDEX.md`
- `docs/agent/DECISION_LOG.md`
- `public/release-notes.json`

## Components added or modified

- Added `AuthenticZikrPicker` as the reusable reviewed-remembrance dialog.
- Modified `CustomCounterScreen`, `ZikrCounterSurface`, and `TasbeehCounterButton` for finite goals, protected session actions, completion re-entry, and direction-safe navigation.
- Modified `ProgressWeekView`, annual heatmaps, `TodayRoutineGarden`, and `ProgressScreen` for separate intention/activity measures and complete calendar data.
- Modified the Progress share card and supporting cards to use current terminology, semantic icons, and consistent focus targets.

## User-visible changes

- Masbaha starts with a specific goal and never presents an open counter.
- Readers can search exact reviewed remembrances and see each concise benefit before selection.
- Changing the target keeps the current count; resetting or changing remembrance protects a non-empty session with confirmation.
- A completed counter can be activated again to reopen the completion dialog.
- Weekly activity remains measured out of seven days, while the weekly intention is shown separately.
- Year views include every day of each month.
- Progress sharing uses current palm/routine/additional-practice language.

## Accessibility work

- Preserved native radio semantics, labelled search, dialog naming, focus-visible treatment, and 44 px minimum targets.
- Used the shared `Lightbulb` icon alongside text for benefits rather than color alone.
- Added explicit confirmation dialogs for destructive session changes.
- Kept completed counters keyboard operable and announced as an available action.
- Added a labelled semantic progress bar for the weekly intention.
- Verified 320 px and 390 px layouts and Arabic RTL direction manually.

## Tests added or updated

- `CustomCounterScreen.test.tsx`: finite defaults, no open option, searchable selection, reset/switch confirmation, target preservation, and completed-state action.
- `ProgressViews.test.tsx`: separate weekly intention, fixed seven-day denominators, neutral legend, and complete 31/28-day grids.
- `ProgressScreen.test.tsx`: weekly intention propagation and focused-prayer navigation.
- `ShareableCardModal.test.tsx`: current terminology.
- `e2e/keyboard.spec.ts`: keyboard reset confirmation.

## Commands run

| Command                                                                                                                                                                                                                                                                                      | Result                                           |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `pnpm vitest run src/app/screens/CustomCounterScreen.test.tsx src/app/components/ProgressViews.test.tsx src/app/screens/ProgressScreen.test.tsx src/app/components/ShareableCardModal.test.tsx src/app/components/countingSurface.test.tsx src/app/components/TasbeehCounterButton.test.tsx` | Passed: 6 files, 40 tests                        |
| `pnpm typecheck`                                                                                                                                                                                                                                                                             | Passed (also covered by `pnpm check`)            |
| `pnpm exec playwright test e2e/keyboard.spec.ts e2e/counter-feedback.spec.ts --project=desktop-chromium`                                                                                                                                                                                     | Passed: 14 tests                                 |
| `pnpm install --frozen-lockfile`                                                                                                                                                                                                                                                             | Passed: lockfile current                         |
| `pnpm check`                                                                                                                                                                                                                                                                                 | Passed: all repository checks                    |
| `pnpm test:e2e`                                                                                                                                                                                                                                                                              | Passed: 389 tests, 1 intentional skip            |
| `pnpm build:pages`                                                                                                                                                                                                                                                                           | Passed: Pages build, PWA, bundle, and CSS checks |
| `pnpm audit:prod`                                                                                                                                                                                                                                                                            | Passed: no known production vulnerabilities      |
| `pnpm run check:release-notes`                                                                                                                                                                                                                                                               | Passed: release manifest is fresh                |

## Visual/manual evidence

- Verified Masbaha at 390×844 in Midnight theme: finite progress, compact paired selectors, stable centered devotional content, and reachable counter.
- Verified the remembrance picker at 390×844: exact phrases, visible selected state, labelled search, shared bulb benefits, and bounded scrolling.
- Verified the target menu at 390×844: 10, 33, 100, 1000, and positive custom target only.
- Verified Home utility header at 390×844 and 320×568 in English and Arabic RTL, including its sticky scrolled state.

## Documentation updated

- Extended the Masbaha and Progress contracts in `docs/DESIGN_SYSTEM.md`.
- Recorded DEC-205 in `docs/agent/DECISION_LOG.md`.
- Registered Phase 64 in `docs/agent/INDEX.md`.

## Decisions recorded

- Dedicated Masbaha goals are always finite and positive.
- Target-only changes preserve counts; session-destructive changes require confirmation.
- Weekly intention is not a denominator for observed seven-day activity.

## Known limitations or remaining risks

- Masbaha counts remain intentionally local and do not feed devotional Progress; adding that relationship requires a separate product and persistence decision.
- Reviewed benefits remain concise picker summaries; full source and grade stay in the existing Benefit dialog.
- The Home header's compact numeric path indicator is accessible by name but visually terse when its value is zero; a future Home-specific phase can test a short visible label without crowding the date.

## Out-of-scope findings

- `ProgressViews.tsx` remains a large module. Splitting it without changing behavior should be a dedicated maintainability phase rather than mixed into this visual and interaction correction.

## Recommended next step

Run a focused Home-header comprehension study for the zero-state path indicator before changing its established compact/sticky composition.
