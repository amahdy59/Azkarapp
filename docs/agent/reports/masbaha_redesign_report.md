# Phase Report — Masbaha and Friday Salawat Redesign

## Objective

Redesign and simplify the Masbaha and Friday Salawat counter screens based on user feedback. The main goal was to remove clutter, align the UI with the existing minimalist aesthetic of the rest of the application, and simplify the interaction model.

## Scope completed

- Renamed "Electronic Masbaha" (المسبحة الإلكترونية) to just "Masbaha" (المسبحة).
- Removed the standalone `AuthenticZikrLibrarySheet` button in favor of an inline Zikr selection dropdown.
- Moved the `Reset` button to the `More Options` dropdown, improving layout and real estate.
- Moved the `Sound Toggle` (mute/unmute) to the `More Options` dropdown.
- Addressed tracking card translucency and "Wird completion" checkmark state matching the expected visual output.
- All associated tests were updated and the suite fully passes.

## Files changed

- `e2e/accessibility.spec.ts`
- `e2e/counter-feedback.spec.ts`
- `e2e/keyboard.spec.ts`
- `src/app/components/ProgressViews.tsx`
- `src/app/components/TasbeehCounterButton.test.tsx`
- `src/app/i18n/ar.ts`
- `src/app/i18n/en.ts`
- `src/app/screens/CustomCounterScreen.test.tsx`
- `src/app/screens/CustomCounterScreen.tsx`
- `src/app/screens/FridaySalawatScreen.test.tsx`
- `src/app/screens/FridaySalawatScreen.tsx`
- `src/app/screens/HomeScreen.render.test.tsx`

## Components added or modified

- `CustomCounterScreen`
- `FridaySalawatScreen`
- `ProgressViews` (`ProgressDayView` and `MainDhikrGroupCard`)

(Note: `AuthenticZikrLibrarySheet` was completely removed)

## User-visible changes

- **Masbaha and Friday Salawat Header:** The reset button and the sound toggle have been removed from the visible layout and moved into a new generic "More options" dropdown menu.
- **Masbaha Target Selection:** The title of the currently selected target (e.g. "Tasbeeh & Tahmeed") is now a dropdown menu itself, allowing for inline target collection selection.
- **Masbaha Title:** The title is simply "Masbaha" (or "المسبحة" in Arabic), allowing the title to fit nicely without clipping.
- **Home/Progress Completion:** When a required Wird is completed, the checkmark now renders opaque within a properly translucent background instead of being difficult to see.

## Accessibility work

- Ensured that the newly added `DropdownMenu` items inside the "More options" menu have proper `aria-label` texts and accessible interactions.
- The inline Target Selector was exposed as a `DropdownMenu` with proper semantics (`aria-haspopup`, `menuitemradio`).

## Tests added or updated

- **e2e/keyboard.spec.ts:** Updated interaction flows so that tests open the More Options dropdown before attempting to trigger the reset.
- **src/app/screens/CustomCounterScreen.test.tsx:** Adjusted all labels to look for `المسبحة` instead of `المسبحة الإلكترونية`. Altered tests to interact with `userEvent` for the dropdowns.
- **src/app/screens/FridaySalawatScreen.test.tsx:** Altered the reset test flow to ensure it uses the dropdown menu.
- **src/app/screens/HomeScreen.render.test.tsx:** Adapted link clicks for "Masbaha" from the previous "Tasbeeh Counter".

## Commands run

| Command         | Result                                     |
| --------------- | ------------------------------------------ |
| `pnpm check`    | PASS (after resolving Prettier formatting) |
| `pnpm test:run` | PASS                                       |
| `pnpm test:e2e` | PASS                                       |

## Visual/manual evidence

The agent has verified the structure via `e2e` tests (which take screenshots directly).
Screenshots provided previously matched the implementation intent perfectly.

## Documentation updated

No new architecture documentation changes were strictly necessary as the core `DESIGN_SYSTEM.md` principles were simply properly applied to the Masbaha.

## Decisions recorded

- Dropped `AuthenticZikrLibrarySheet` altogether, shifting to standard `DropdownMenu` components for collection selection.

## Known limitations or remaining risks

- The `DropdownMenu` components are slightly less obvious for users accustomed to a direct "Reset" button, but it was an explicit request to clean up the UI, matching other minimalist apps.

## Out-of-scope findings

- Prettier styling configuration occasionally fights with the standard formatting on some `.tsx` files; it's recommended to run `pnpm check` locally before any major push.

## Recommended next step

Monitor the production deployment and ensure the changes are live for users. Address any further UI styling adjustments the user might request post-deployment.
