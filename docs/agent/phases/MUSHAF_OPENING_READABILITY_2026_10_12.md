# Phase Report — Mushaf opening-page readability, 2026-10-12

## Objective

Apply the owner's opening-page sizing, modest enlargement leading and filled word-highlight corrections locally. No commit, push, deployment or release-note changes.

## Scope completed

Inspected the shared fitter, opening page container, glossary paint, magnification and existing snippet styles. Plan stated before editing: repair opening typography normalization, add modest magnification leading, match word-meaning highlights to snippets, add regression checks and capture real desktop/mobile evidence. Opening text occupies 58% of its frame instead of 54%, preserving all eight slots and giving enlarged letters modest additional vertical space.

## Files changed

MushafPageViewer.tsx, MushafPageViewer.test.tsx, MushafPageFrame.test.tsx, QuranWordPopover.tsx, QuranWordPopover.test.tsx, mushaf-magnification.css, e2e/mushaf-opening-readability.spec.ts, this report, DESIGN_SYSTEM.md and agent INDEX.md.

## Components added or modified

Shared MushafPageViewer and its line fitter/word affordances, QuranWordPopover and existing magnification CSS. No dependencies or persisted state changes.

## User-visible changes

Opening pages normalize font fitting against their actual inner size container. Glossary words have softly filled gold backgrounds and gold ink, matching Quran snippets. Magnification adds 1–4% extra vertical rhythm above proportional page enlargement, preserving line breaks and native scrolling. Escape closes a word popup without also leaving the Mushaf.

## Accessibility work

Retained semantic Arabic text, keyboard Enter/Space activation, focus rings, selected-word outlines, popover Escape recovery and stable word geometry. No content edits. Browser checks do not establish complete accessibility compliance.

## Tests added or updated

Unit assertions cover filled highlight styling, keyboard selection, the opening-area contract and consumed Escape events. Browser checks cover opening/body relative sizing, all canonical slots, horizontal containment, filled word affordances, stable selection geometry and popup-only Escape dismissal at mobile/desktop widths. Existing magnification/reset tests cover all enlargement steps and accessibility scanning. Tracked browser tests block remote page fonts, verify Unicode fallback, and use the locally shipped page 42 font for word-help checks. Primary-font evidence was separately captured with the remote QCF fonts ready.

## Commands run

| Command                                                                                                                                                                                                                                   | Result                                                                                                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm test:run src/app/components/MushafPageViewer.test.tsx src/app/components/MushafPageFrame.test.tsx src/app/components/QuranWordPopover.test.tsx`                                                                                     | Final: 3 files, 34 tests passed in 13.13s.                                                                                                                                                      |
| `pnpm test:e2e e2e/mushaf-opening-readability.spec.ts --project=desktop-chromium --workers=1 --output=output/playwright/mushaf-readability-evidence` with `E2E_BASE_URL=http://127.0.0.1:5198`                                            | Primary QCF font capture: 2 passed in 29.4s. The subsequent Escape repair changes popup handling only.                                                                                          |
| `pnpm test:e2e e2e/mushaf-opening-readability.spec.ts e2e/mushaf-magnification.spec.ts --project=desktop-chromium --workers=1 --output=output/playwright/mushaf-readability-settled` with the same base URL                               | All four magnification/reset cases passed. Opening checks: mobile passed; desktop exposed insufficient opening area, subsequently corrected from 54% to 58%.                                    |
| `pnpm test:e2e e2e/mushaf-opening-readability.spec.ts --project=desktop-chromium --project=desktop-firefox-smoke --project=mobile-webkit-smoke --workers=1 --output=output/playwright/mushaf-readability-verified` with the same base URL | Final: 6 passed in 1.5m, with exact word-box equality and popup-only Escape dismissal across all three engines.                                                                                 |
| `pnpm check`                                                                                                                                                                                                                              | Final: passed in 144.1s, including formatting, lint, types, enforced unit coverage, content/timing checks, build and unchanged bundle ceilings. Log: output/mushaf-readability-final-check.log. |
| Scoped `pnpm exec prettier --write`                                                                                                                                                                                                       | Applied only to this phase's source, tests and documentation; final formatting gate passed.                                                                                                     |

Earlier exploratory browser runs failed on incorrect glossary-toggle selectors, a development-server reload during source editing, insufficient opening area at 54%, and Firefox measurements taken before the page-42 font/fitter settled. Corrected the selectors, geometry and font-settling setup without weakening assertions or timeouts. The initial full check saw the old 54% static expectation and a new popup test while its earlier source module was still loaded; its two failures are retained in output/mushaf-readability-check.log. Updated the explicit area contract and completed the Escape implementation; the final targeted and complete checks passed. No pre-existing failures were left unresolved by the final gate.

## Visual/manual evidence

Visually inspected actual QCF rendering of desktop and mobile Al-Fatihah and the final gold-fill page-42 glossary. Stable delivery copies are:

- output/playwright/mushaf-readability/opening-desktop.png
- output/playwright/mushaf-readability/opening-mobile.png
- output/playwright/mushaf-readability/opening-baqarah-desktop.png
- output/playwright/mushaf-readability/highlights-desktop.png

Original primary page-1/2/3 captures remain in output/playwright/mushaf-readability-evidence; final three-engine fallback and primary page-42 screenshots remain in output/playwright/mushaf-readability-verified. Magnification/reset captures remain in output/playwright/mushaf-readability-settled. Reviewed content, word order, counts and verse markers remain untouched. No physical-device or human screen-reader certification is claimed.

## Documentation updated

Design-system presentation contract, agent index and this scoped report.

## Decisions recorded

Owner request supersedes the dotted-only Mushaf glossary presentation. Keep this phase local and preserve unrelated shared-workspace edits.

## Known limitations or remaining risks

Page-specific QCF glyph metrics differ across pages; font-size numbers alone are not a measure of equal visible ink. Narrow canonical lines remain width-bound. Real-device and human assistive-technology review remain outstanding.

## Out-of-scope findings

Concurrent Downloads/i18n/share-archive changes are preserved and excluded from this phase's claims.

## Recommended next step

Owner review of the captured opening pages and gold-fill intensity; consider a separate adjustable-spacing preference only if the modest built-in increase proves insufficient.
