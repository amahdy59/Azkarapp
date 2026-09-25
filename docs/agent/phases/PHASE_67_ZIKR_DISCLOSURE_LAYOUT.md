# Phase Report — Phase 67: Zikr disclosure layout

## Objective

Give collapsible zikr cards a stable, accessible control anatomy while restoring the full reading width to devotional text.

## Scope completed

- Replaced the overlaid chevron and permanent trailing text inset with a stable utility row.
- Kept number and completion at logical start and disclosure at logical end in both RTL and LTR.
- Made the devotional summary use the full card width below the controls.
- Removed the duplicate text-based disclosure action while preserving wide Reader item selection as a distinct action.
- Hid disclosure when the two-line summary fits and no additional content exists.
- Added singular repetition copy in Arabic and English.

## Files changed

`AzkarListItem`, focused Category/Reader tests, bilingual localization, Reader browser coverage, the design-system contract, decision log, agent index, and this report.

## Components added or modified

Modified `AzkarListItem`; no new production component or runtime dependency was added.

## User-visible changes

- Long zikr summaries use the card's full reading width instead of wrapping around an empty trailing column.
- The expand/collapse control stays in the same top corner when the card opens.
- Short summaries without hidden details no longer show a false expand affordance.
- A repetition count of one reads “Recite once” / “تُقال مرة واحدة.”

## Accessibility work

- Kept one native 44×44 disclosure button with localized name, `aria-expanded`, `aria-controls`, and visible focus.
- Kept completion and Reader item selection as separate named actions.
- Removed the duplicate keyboard-focusable text disclosure.
- Preserved logical RTL/LTR order and reduced-motion behavior.

## Tests added or updated

- Added focused overflow/no-overflow disclosure coverage.
- Updated Category tests for native disclosure, same-node expansion, completion isolation, long-surah expansion, full-width content, and singular copy.
- Updated the wide Reader browser selector to target the distinct item-selection action.

## Commands run

| Command                                                                                                                                              | Result                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `pnpm exec vitest run src/app/components/AzkarListItem.test.tsx src/app/screens/CategoryScreen.test.tsx src/app/screens/ReaderScreen.audio.test.tsx` | Passed: 3 files / 18 tests                                                                                            |
| Focused Playwright Reader/Category coverage                                                                                                          | Passed in the release browser run; the wide Reader selection flow and responsive disclosure assertions remained green |

## Visual/manual evidence

Responsive browser verification passed in the release browser run at Arabic and English phone/tablet widths; the full suite later encountered a Windows preview-server connection cascade unrelated to these assertions.

## Documentation updated

Updated `docs/DESIGN_SYSTEM.md`, `docs/agent/INDEX.md`, `docs/agent/DECISION_LOG.md`, and this phase report.

## Decisions recorded

DEC-208 records the stable utility row, full-width summary, overflow-aware disclosure, and one-action-per-purpose behavior.

## Known limitations or remaining risks

Real TalkBack/VoiceOver confirmation remains a manual release check. Overflow measurement depends on rendered geometry and is rechecked after resize and font readiness.

## Out-of-scope findings

Reviewed devotional content, repetition counts, persistence, counter behavior, audio behavior, and Reader navigation were not changed.

## Recommended next step

Run responsive visual verification, the focused browser flow, and the full local quality gates before considering deployment.
