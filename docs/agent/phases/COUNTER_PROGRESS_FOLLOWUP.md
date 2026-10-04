# Phase Report — Counter progress follow-up

## Objective

Keep counter text on one line with smaller, concise labels and show actual progress through a gradually filled surface.

## Scope completed

Reuse the shared Reader, Masbaha, and Salawat counter. Implement in an isolated checkout to preserve concurrent changes in the owner's main checkout. No new dependency or state boundary.

## Files changed

Shared ZikrComponents presentation and tests; ReaderScreen responsive navigation; Arabic/English localization; CustomCounterScreen regression; devotional-footer browser tests; design system; decision log; agent index; this report.

## Components added or modified

ZikrCounterSurface and CounterOutlineProgress. Reader uses concise localized action labels; full instructions remain accessible.

## User-visible changes

20px scalable tally numerals with a compact separator, 14px single-line completion labels, and a neutral initial surface. The internal fill reflects count/target and starts at the appropriate Arabic/English edge. Completion fills the control; reset clears it. One-off readings fill only after explicit completion. Reader navigation retains equal 88px labelled widths without growing horizontally when text is enlarged.

## Accessibility work

Preserve native buttons, full accessible instructions and count, visible focus, 48px minimum height, keyboard activation, motion preferences, RTL/LTR, and enlarged text. Text stays readable across neutral and tinted fill surfaces. Automated evidence supplements pending human screen-reader and real-device checks.

## Tests added or updated

Unit regression covers zero, partial, complete, reset, and concise visible labels with full accessible instructions. Browser coverage checks single-line labels at 320/390/820/1440px and 200% text, initial surface, half fill, direction, and partial-count restoration after reload. Existing theme/pressed axe and footer geometry regressions remain.

## Commands run

| Command                                                    | Result                                                                                                                                       |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`                           | Passed                                                                                                                                       |
| `pnpm test:run src/app/components/ZikrComponents.test.tsx` | 1 file, 3 tests passed                                                                                                                       |
| `pnpm check`                                               | Final run passed all stages in 186.2s                                                                                                        |
| `pnpm build:pages`                                         | Passed bundle and CSS utility checks                                                                                                         |
| `pnpm audit:prod`                                          | Passed; no known vulnerabilities                                                                                                             |
| Focused final browser run on dedicated port 4175           | 20 passed (1.5m), Chromium/Firefox/WebKit                                                                                                    |
| Broader counting/keyboard/Reader regressions               | 51 passed before the enlarged Firefox check exposed the navigation issue, repaired and covered in the final run                              |
| Merged working-copy unit tests                             | 2 files, 18 tests passed                                                                                                                     |
| `pnpm test:e2e` full suite                                 | Interrupted: a concurrent run displaced port 4173, causing connection-refused errors in unrelated Progress tests; no full-suite pass claimed |

## Visual/manual evidence

Empty and half-filled Arabic/English screenshots inspected and copied into `docs/agent/evidence/counter-progress/`; footer theme and enlarged-text screenshots in `output/playwright/footer-redesign/`.

## Documentation updated

Design system, owner decision log, index, and this report. Release notes remain unchanged because the owner requested no push.

## Decisions recorded

The owner's latest request supersedes the solid initial primary surface and prior larger tally text. No devotional content changes. The follow-up explicitly prohibits pushing; no commit or deployment is part of this local refinement.

## Known limitations or remaining risks

The full suite must be rerun with exclusive test-server ownership before a future release. The first expanded-text runs exposed real navigation squeezing and unequal-width issues; both were repaired. WebKit's fifty-click test timed out while counting correctly, so the final regression verifies a real tap, a saved count of 49, a tap to 50, and reload recovery instead. A temporary build folder was initially scanned by lint; moved it into the existing ignored test-build location and the final gate passed. Physical-device and human screen-reader checks remain outstanding. No commit, push, or deployment performed.

## Out-of-scope findings

Other-session audio and word-help changes remain in the main checkout and are excluded from this isolated follow-up.

## Recommended next step

Check the final local counter on the owner's phone before authorizing a later release.

## Combined working-copy verification

Preserved the concurrent Arabic/English numeral-order refinement in the main checkout. Reduced the shared counter's horizontal internal padding to 8px and its numeral-group spacing to 2px so the combined face fits at 200% text. Built the combined working copy into the existing ignored test-build location and served it on port 4387. Final six single-line/empty-fill/partial-fill/reload tests passed across Chromium, Firefox, and WebKit in 40.0s without retries. Screenshots in this report show the combined working copy. The earlier combined run exposed clipping caused by the concurrent wider numeral spacing; repaired it without reverting its direction fix.

The full repository check passed in the isolated checkout before this final spacing adjustment, and the combined production build passed afterward. Full-suite exclusive-server release verification remains outstanding. Changes are present locally, uncommitted and unpushed.
