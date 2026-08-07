# Phase 05 — Home

## Summary

Home was restructured to match Figma node `940:26629`, supplied directly by the user as the target design. Unlike Phases 02–04 this phase had an external visual source of truth, which changed the failure mode: the risk was not "is this defensible?" but "does this actually match?".

## What shipped

- **Top utility bar** replacing the floating translucent header: quick actions on the start edge, next-prayer countdown and Hijri date as centred pills, lifetime palms and daily streak as end-edge badges. Moving the header off the hero image also removed the text-over-photo contrast risk the Phase 02 analysis had flagged as unverifiable.
- **Hero image contained within its card** rather than bleeding to the viewport, per explicit user instruction.
- **Three stat cards** (This Week / Streak / Total Azkar) in the design's order.
- **Labelled section divider** introducing the Friday section.
- **"وردك اليوم" lists three time-of-day routines**, not four.

## Course corrections

This phase required two, both caught by looking at rendered output rather than trusting the code.

1. **A duplicate wird card.** A bespoke `TodayWirdCard` was written first. A screenshot showed Home then rendering _two_ cards both headed "وردك اليوم" with overlapping routine navigation — the existing `TodayRoutineGarden` with `hideTabs` already **is** that card, and carries test coverage. The duplicate was deleted rather than kept alongside.

2. **Working from a screenshot instead of the design.** The first pass inferred structure from a pasted image and got the page structure wrong. Once Figma access was available the node was read directly and the layout rebuilt against it (DEC-029). The lesson is recorded because it generalises: an image of a design is not the design.

## Deviations from the design

| Deviation                                              | Rationale                                                                                                                                                                                                                                                                                                                                            | Status           |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| No settings gear in the top bar                        | Settings is already a top-level nav destination and `PHASE_04_SHELL_NAVIGATION.md` prohibits duplicating those. It was also a concrete defect: two controls with the accessible name "Settings" broke nine e2e tests with strict-mode violations and would be ambiguous for assistive tech. The bell is kept — notification settings is a sub-screen | Accepted by user |
| Wird card is `TodayRoutineGarden`, not a new component | Avoids duplicating an existing, tested component                                                                                                                                                                                                                                                                                                     | Accepted by user |

## After-prayer azkar

The design shows three routines; the fourth (`after_prayer`) is getting its own dedicated card later. Implemented as an opt-in `visibleCategoryIds` prop on `ProgressDayView` threaded through `TodayRoutineGarden` — deliberately **not** by overloading the existing `hideTabs` flag, which means "this is the compact Home rendering" and would have silently coupled two unrelated concerns.

The change is display-only and deliberately narrow:

- `ProgressScreen` passes no filter, so it still lists all four and the routine stays reachable.
- Leaf and palm arithmetic is untouched. A palm still requires all four main collections and the header still announces "N of 4". Filtering a rendered list must not quietly redefine what completing a day means.

**Known interim gap:** until the dedicated card ships, after-prayer azkar are not reachable from Home directly — only via Progress or the Azkar library. Accepted, not overlooked (DEC-030).

## Decisions

DEC-028 (initial restructure and the two deviations), DEC-029 (rebuild against the Figma node), DEC-030 (three routines, superseding the four-row decision in DEC-029).

## Verification

Full `pnpm check` and `pnpm test:e2e` green: **249 unit, 172 e2e**. New e2e test asserts the contract in both directions — Home omits after-prayer, Progress still shows it.

## Known limitations

- **No before/after screenshots**, shared with Phases 02–04.
- `HomeScreen` still does not adopt `.page-content-center`; deferred to a later phase as screen-internal redesign is out of Phase 04/05 scope.
- `FloatingAudioPlayer`'s viewport-fixed positioning remains deferred for the same reason.
