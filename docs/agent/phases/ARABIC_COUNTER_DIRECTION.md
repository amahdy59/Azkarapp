# Phase Report — Arabic counter reading order

## Objective

Correct Arabic current/target counter order without reversing digits or changing the English tally.

## Approved plan

Use language direction on the shared tally row and isolate each number. Verify visual ordering in Reader, Masbaha, and Salawat across Chromium, Firefox, and WebKit. Keep all changes local, as requested by the owner.

## Scope completed

Local implementation and targeted validation completed. No commit, push, or deployment performed for this correction.

## Files changed

- src/app/components/ZikrComponents.tsx: language-directed inline flex tally, isolated numbers and separate slash.
- src/app/components/ZikrComponents.test.tsx: Arabic/English multi-digit and accessible-name regressions.
- e2e/counter-numeral-direction.spec.ts: browser geometry assertions across three counting views.

Concurrent changes to these components are preserved. This phase changes only tally direction and separator anatomy.

## Components added or modified

ZikrCounterSurface, shared by Reader, Masbaha and Salawat.

## User-visible changes

Arabic current count appears on the right and target on the left. English current count remains on the left. Digits within both numbers retain their normal order. Small equal gaps separate numbers from the slash.

## Accessibility work

Keep semantic current/target DOM order and accessible names. Preserve native keyboard/pointer counting and isolate each numeric token with bdi dir=ltr. Layout direction follows application language.

## Tests added or updated

Unit checks include 12 of 100 in both languages, token direction and accessible names. Browser checks assert physical positions and counting on Reader, Masbaha and Salawat in both languages.

## Commands run

| Command                                                         | Result                                           |
| --------------------------------------------------------------- | ------------------------------------------------ |
| pnpm test:run src/app/components/ZikrComponents.test.tsx        | 5 passed                                         |
| pnpm test:e2e e2e/counter-numeral-direction.spec.ts --retries=0 | 6 passed, 2.0 minutes; Chromium, Firefox, WebKit |
| pnpm typecheck                                                  | Passed                                           |
| scoped prettier and git diff --check                            | Passed                                           |

## Visual/manual evidence

Screenshots: output/playwright/counter-direction/ for all three views in Arabic and English. Arabic Reader screenshot visually inspected; current count is on the right and target on the left.

## Documentation updated

This report records the owner-approved correction to the prior all-LTR numeric-group contract. The group now follows interface language; each numeric token remains LTR. Other shared design documentation is being edited by concurrent sessions and remains untouched here.

## Decisions recorded

Owner explicitly requested correct RTL order and instructed continuation without pushing. Preserve the English order and other sessions' in-progress edits.

## Known limitations or remaining risks

Full repository/release gates are required before a future release; only targeted local checks were run for this small correction. Unrelated concurrent edits remain in progress. Manual assistive-technology review is not implied by browser automation.

## Out-of-scope findings

No religious content, persistence, synchronization, or progress behavior changes.

## Recommended next step

Review the local visuals alongside concurrent footer work. Run the full release gates only when the owner authorizes the next push.
