# Phase 07 — Reader and Session Experience

## Summary

The reader is the app's central flow and was the best-built screen encountered so far. Most of this phase's acceptance criteria were **already met**; the honest output is a short list of two real fixes plus a set of verified-correct findings, not a redesign.

## Verified already correct — deliberately unchanged

| Criterion                                         | Finding                                                                                                                                                                                                                                                                                         |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No accidental count from interactive controls     | `shouldIgnoreCountTap` closes over a thorough selector list (buttons, links, form controls, dialogs, menus, listboxes, switches, Radix scrollbars, plus an explicit `data-prevent-count` escape hatch). It also bails when text is selected, and full surahs never count from the canvas at all |
| Count and completion work by pointer and keyboard | `ZikrCounterSurface` is a real `<button>`, so Enter/Space already worked. Tap-anywhere is a convenience layered on top, not the only path                                                                                                                                                       |
| No autoplay                                       | Every `autoPlay: true` path in `AudioProvider` originates in an explicit user action — play, next, previous, or end-of-track continuation. Nothing plays on load                                                                                                                                |
| Zikr/source text unchanged                        | No content touched                                                                                                                                                                                                                                                                              |

Reporting these as "already correct" rather than manufacturing changes is the point: the phase's value here was confirming the contract holds.

## Fixed

1. **Dead `pulse` state in `useZikrCounter`.** `setPulse` ran on every tap and on reset, but no consumer ever read the value — `CustomCounterScreen` has its own separate `pulse` for its ring animation. Every count therefore forced an extra React render on the app's hottest interaction path, for nothing. Removed.

2. **`aria-live="assertive"` on the reader announcement region.** That region carries counting progress (every tenth repetition, the halfway mark) and the completion message. Assertive interrupts whatever a screen reader is currently saying — in a reader, usually the zikr itself. None of it is urgent enough to justify that. Changed to `polite`, matching `ZikrShareButton`, which already reserved assertive for errors only.

## Flagged, not fixed

**Reset does not undo a recorded completion.** `handleReset` clears local counter state, but `onComplete(idx)` has already fired and the session record persists; on remount `isDone` restores the completed state. This is Step 1 item 8 ("safe undo/recovery"), but acting on it means changing session state, which this phase's prohibited list explicitly excludes without separate approval. Recorded for a future phase rather than quietly changed.

## Verification

- Full `pnpm check` + `pnpm test:e2e`: **268 unit, 190 e2e**.
- New `useZikrCounter.test.ts` (9 tests): counting to completion, ignoring taps once complete, surface taps rejected on interactive controls but accepted on inert content, surahs never counting from the canvas, reset, haptics gating, and resuming an already-done zikr.
- Two new e2e tests: keyboard completion via the counter button, and the announcement region being polite with no assertive region anywhere in the reader.
- The polite-announcement test was verified by **reverting the fix and confirming it fails**, then restoring it.

## Known limitations

- No before/after screenshots — shared with Phases 02–06.
- The manual keyboard and screen-reader reader walkthrough required by the phase's evidence section has **not** been performed; automated keyboard coverage is not a substitute and this remains outstanding.
