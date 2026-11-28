# Phase Report — Audio-library browser release repair

## Objective

Complete the authorized audio/books release by repairing the full-matrix browser journeys after reading preferences moved into a native disclosure.

## Scope completed

Inspected every failed job in Quality run 45910846675 and all nine browser timing artifacts. The 55 terminal browser failures reach controls inside closed Reading settings; six additional cases passed on retry. Checks, Android and responsive jobs succeeded. Pages correctly withheld deployment.

## Files changed

Five affected browser specs and `e2e/helpers/audio-reading-options.ts`. No application behavior or devotional text changes in this repair.

## Components added or modified

No product components. A browser helper opens the existing native disclosure through its visible summary and asserts its open state before interacting with reading controls.

## User-visible changes

The intended progressive disclosure remains: reciter, speed and volume are immediately available; reading controls open on request. Existing browser journeys now exercise that interaction.

## Accessibility work

All existing keyboard, focus recovery, hit testing, reflow, magnification and axe assertions are retained. The helper uses ordinary pointer activation and the native details state; no forced click, hidden-control evaluation or increased timeout is used.

## Tests added or updated

Continuous surah listening, canonical magnification, paged Quran preferences, exact glyph geometry, enlarged Arabic/English translation and English narration controls. Complete affected specs run on Chromium, Firefox and WebKit before the normal hook and exact-commit full CI matrix.

## Commands run

| Command/evidence                                                | Result                                                                                                                                                                     |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `gh run view 45910846675 --log-failed` and all timing artifacts | Every failed job inspected; 55 terminal cases share the closed-disclosure interaction.                                                                                     |
| `pnpm test:e2e` with the five affected specs and three engines  | Running at this checkpoint; retain final JSON/log in local release evidence.                                                                                               |
| Prior complete local gates and media ingestion                  | Successful; see the audio expansion report. New file contents receive a fresh local gate.                                                                                  |
| Independent transcription completeness                          | All 459 source identities have diagnostic files: 121 full dua files and 338 full short-surah or opening/closing Quran samples. No prompt; source and model hashes checked. |

## Visual/manual evidence

Existing exact page geometry and screenshot assertions remain. Browser traces/screenshots and final outcomes are retained under `output/consolidation-20261126/` and GitHub Actions artifacts.

## Documentation updated

This repair report. Existing source contracts, release notes and media remain unchanged; test-only commits do not require a new release recap.

## Decisions recorded

Use the product's progressive disclosure in tests rather than restoring a crowded menu or weakening assertions. Human review is not a gate for this phase, and no human approval is fabricated.

## Known limitations or remaining risks

Final local, CI and production outcomes remain required. Speech recognition is supplementary and imperfect; long Quran diagnostics sample the ends, while full decoding and exact source/range/identity checks cover each retained recording. No inferred word timings are added.

## Out-of-scope findings

Six non-terminal CI retries are retained as diagnostic evidence. Their assertions remain intact.

## Recommended next step

Finish the targeted suite, fresh local quality gate and hook, then require Quality/verify, Pages build/deploy and production PDF/native-audio smoke for the final main commit.
