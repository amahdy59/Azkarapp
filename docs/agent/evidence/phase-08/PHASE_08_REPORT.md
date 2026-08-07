# Phase 08 — Progress and Quiet Garden

## Summary

One serious accessibility defect, several criteria already met, and one substantial item deliberately left undone.

## Primary finding — the week grid was invisible to screen readers

The week view rendered completion as **shape alone with no text**. A completed cell held an icon `<div>`; an incomplete cell held an empty bordered `<div>`. Neither carried a label or any text content.

A screen reader therefore announced all 21 cells as blank. The week view — the phase's central visualization — conveyed **nothing**. That is a direct failure of "charts are understandable without color or vision."

**Fix:** `WeekStatusCell` renders an `sr-only` "Morning: Completed" / "Not completed" string and marks the visual shape `aria-hidden`. Column headers gained `scope="col"` so association is explicit during grid navigation.

## Verified already correct — deliberately unchanged

| Criterion                                    | Finding                                                                                                                  |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| No punitive streak language                  | Copy is already gentle — "You kept up with {category} today". Nothing to change                                          |
| Charts understandable without vision (month) | The month calendar is well built: every day is a `<button>` with an `aria-label` covering complete / partial / unstarted |
| Existing progress data intact                | No calculation, schema or ledger change was made                                                                         |
| No fabricated metrics                        | All displayed values derive from stored `dailyCompletions`                                                               |

Reporting these as verified rather than inventing changes is deliberate.

## A repeat mistake and its systemic fix

The Arabic strings in the new cell shipped as mojibake — the **same** defect as DEC-036, from the same `unicode_escape` script pattern.

The DEC-036 guard did not catch it, because that guard scanned only `ar.ts` and this Arabic was inline in a component. The guard now scans **every** `src/**/*.{ts,tsx}` file and reports `file:line`, verified by reintroducing the corruption.

Two occurrences of one defect class in a single session is a process signal, not bad luck. The check now covers the whole surface rather than the one file that happened to fail first.

## Not done — and why

**`ProgressViews.tsx` (905 lines) and `RoutineGarden.tsx` (781 lines) remain unsplit.** `RoutineGarden.tsx` sits at **2.45% statement coverage** — the lowest in the codebase.

Refactoring a 781-line file with almost no coverage is how regressions land silently: nothing would fail, and the damage would surface later in a screen users rely on daily. Characterization tests must come first, and that is a larger piece of work than this phase's fix.

This is a deliberate deferral, not an oversight. It is the single largest piece of technical debt remaining in the roadmap.

## Verification

Full `pnpm check` + `pnpm test:e2e`: **275 unit, 256 e2e**. New e2e asserts 21 labelled cells, that the table text contains "Morning: Completed/Not completed", and that column headers are scoped. Verified in a browser before and after.

## Known limitations

- The **screen-reader review of charts** required by this phase's evidence section has not been performed. The automated assertions prove the text exists; only a human can confirm it reads sensibly.
- The two large files above remain unsplit.
