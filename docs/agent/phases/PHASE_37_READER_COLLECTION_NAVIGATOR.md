# Phase Report — Reader collection navigator and in-place disclosure

## Objective

Make collection progress and direct zikr selection continuously visible on wide desktops, while making compact overview disclosure expand the text already on screen instead of presenting a second copy.

## Scope completed

- Added a wide-reader collection navigator at the 1200px breakpoint and above.
- Kept the navigator at 34% of the available reader row and placed it on the logical end through the existing page direction.
- Reused current collection data, completion state, routes, translations, theme tokens, typography, and navigation callbacks.
- Changed compact overview disclosure so one persistent text node moves between clamped and expanded states.
- Preserved existing counting, completion, audio, progress, and reader navigation behavior.

## Files changed

- `src/app/App.tsx`
- `src/app/screens/ReaderScreen.tsx`
- `src/app/screens/ReaderScreen.audio.test.tsx`
- `src/app/screens/CategoryScreen.tsx`
- `src/app/screens/CategoryScreen.test.tsx`
- `e2e/reader-microinteractions.spec.ts`
- `docs/DESIGN_SYSTEM.md`
- `docs/agent/INDEX.md`
- `docs/agent/phases/PHASE_37_READER_COLLECTION_NAVIGATOR.md`

## Components added or modified

- `ReaderScreen`: responsive collection navigator, current/completed states, direct selection, and automatic nearest-scroll for the active item.
- `CategoryScreen` `ZikrAccordion`: native disclosure button around one stable summary text node, with the independent completion action kept as a sibling control.
- `App`: supplies the existing direct-selection callback and collection-specific completion IDs.

## User-visible changes

- At 1200px and wider, readers can see the whole current zikr collection, its completed count, individual completion marks, and the active zikr without leaving the reader.
- Selecting a row jumps directly to that zikr using the existing reader route and state.
- Below 1200px, the reader keeps its prior compact/tablet composition.
- Expanding a zikr from the collection overview now reveals the remainder of the same text rather than adding a duplicate full-text block.

## Accessibility work

- The collection is a labelled `nav` containing an ordered list of native buttons.
- The active item exposes `aria-current="step"`; completion has a visible check as well as accessible-name text.
- Active-item scrolling respects reduced-motion preferences.
- Overview disclosure uses a native button with `aria-expanded` and `aria-controls`.
- The completion action remains a separate 44px native button, avoiding nested interactive controls.
- Arabic text retains the zikr font and explicit language/direction metadata; layout uses logical RTL flow.

## Tests added or updated

- Added component coverage for direct collection navigation, active/completed semantics, and completion-state input.
- Added component coverage proving the same overview text element remains mounted while its clamp is removed.
- Added browser coverage for the 34% desktop proportion, Arabic logical-side placement, direct selection, and hiding below 1200px.

## Commands run

| Command                                                                                                                | Result                                |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `pnpm exec vitest run src/app/screens/CategoryScreen.test.tsx src/app/screens/ReaderScreen.audio.test.tsx`             | Passed: 2 files, 12 tests             |
| `pnpm exec playwright test e2e/reader-microinteractions.spec.ts --project=desktop-chromium --grep "wide Reader keeps"` | Passed: 1 test                        |
| `git diff --check`                                                                                                     | Passed                                |
| Targeted ESLint for touched TypeScript and E2E files                                                                   | Passed                                |
| `pnpm check`                                                                                                           | Passed all repository gates in 199.8s |
| `pnpm test:e2e`                                                                                                        | Passed: 404 tests, 1 skipped          |

## Visual/manual evidence

- Compact Arabic Reader: counter size, placement, reading priority, and controls remained stable.
- Compact Arabic overview: collapsed and expanded states were inspected; expansion occurs in place without duplicate zikr text.
- Wide English Reader: the navigator uses the intended roughly one-third column and two-line row summaries.
- Wide Arabic Reader: the navigator moves to the left logical end while the devotional reading surface remains primary.
- Direct selection: choosing the second navigator row updated the active treatment, reader text, and route.

## Documentation updated

- Updated `docs/DESIGN_SYSTEM.md` with the responsive navigator and in-place disclosure contracts.
- Added this phase report and indexed the phase.

## Decisions recorded

- No new dependency, state store, route, content field, translation string, or counter behavior was introduced.
- The navigator begins only at 1200px because the existing tablet reader needs its full reading width.
- Collection rows intentionally use two-line previews; the full sacred text remains primary in the reader.

## Known limitations or remaining risks

- The navigator is intentionally absent on tablet and compact widths; those widths continue to use the existing overview as their collection map.
- Automated accessibility results supplement, but do not replace, assistive-technology verification.
- The worktree also contains an inherited Phase 36 English-audio change set; it was preserved and not folded into this phase's design decisions.

## Out-of-scope findings

- No religious text, repetition count, attribution, audio assignment, persistence model, or synchronization behavior was changed.
- Release notes, commit, push, workflow monitoring, and production verification remain out of scope until this mixed worktree is intentionally released.

## Recommended next step

Review the wide Arabic and English layouts once more at the intended production desktop widths, then release this phase separately from or explicitly together with the inherited Phase 36 audio work.
