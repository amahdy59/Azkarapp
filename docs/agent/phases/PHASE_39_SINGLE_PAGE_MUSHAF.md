# Phase Report — Single-page full-screen Mushaf

## Objective

Give the standalone Qur'an reader one predictable full-screen page and one control system at every viewport.

## Scope completed

- Removed the standalone reader's facing-page, desktop-rail, and Focus Mode presentations.
- Kept Back, Reading options, page bookmark, and word meanings in stable 44px corner controls while removing their space-heavy visible circles.
- Made the Surah name the primary index trigger while preserving the printed page folio as a direct page-navigation trigger.
- Reserved a lower folio band after the final ayah line, recovered unused vertical padding for the Qur'an page, and made the exit arrow point physically outward.
- Reduced Reading options to saved places and reading settings, removing duplicated and uncommon actions.
- Kept the navigation dialog focused on Surahs, Ajza', direct page jump, and saved places.

## Files changed

- `src/app/screens/KhatmahReaderScreen.tsx`
- `src/app/screens/KhatmahReaderScreen.test.tsx`
- `src/app/components/MushafQuickMenu.tsx`
- `src/app/i18n/ar.ts`
- `src/app/i18n/en.ts`
- `docs/DESIGN_SYSTEM.md`
- `docs/agent/DECISION_LOG.md`
- `docs/agent/INDEX.md`
- `docs/agent/phases/PHASE_39_SINGLE_PAGE_MUSHAF.md`

## Components added or modified

- `KhatmahReaderScreen`
- `MushafQuickMenu`

## User-visible changes

- One page and the same controls appear on phones, tablets, landscape screens, and desktop.
- Quiet, borderless corner icons leave more visual space to the Qur'an; hover, press, focus, icon fill, accent colour, and a state dot preserve interaction feedback.
- The overflow is now named Reading options and contains only saved places and reading settings.
- The Surah name is a plain-text navigation control with a chevron, and the page number uses a short underline instead of a circular container.

## Accessibility work

- Preserved native buttons and switches, 44px targets, visible focus, semantic state, RTL/LTR support, keyboard page navigation, Escape behavior, and polite position announcements.
- Kept the word-meanings icon stable between off and on states so its purpose does not change; state is exposed both semantically and visually.
- Removed a hidden-tools state that could make controls unexpectedly disappear.

## Tests added or updated

- Replaced spread/rail/focus-mode expectations with a responsive single-page matrix.
- Added coverage that Reading options does not duplicate visible page tools.
- Added browser geometry coverage proving the folio begins below the fifteenth line.

## Commands run

| Command                               | Result                                                                       |
| ------------------------------------- | ---------------------------------------------------------------------------- |
| `pnpm typecheck`                      | Passed                                                                       |
| Focused Mushaf Vitest suites          | Passed: 35 tests                                                             |
| Focused desktop Chromium Mushaf suite | Passed: 8 tests after correcting one outdated hidden-button test interaction |
| `pnpm check`                          | Passed in 62.4s                                                              |
| Focused page-furniture Vitest suites  | Passed: 45 tests after the quiet-control refinement                          |
| Focused mobile Chromium geometry test | Passed: final line and folio do not overlap                                  |
| Focused Chromium page-turn test       | Passed: 1 test after the quiet-control refinement                            |

## Visual/manual evidence

- Browser geometry and accessibility checks passed at compact, tablet, landscape, and desktop widths. The local preview remains available for owner review before any release action.

## Documentation updated

- Updated the design-system contract, decision log, phase index, and this report.

## Decisions recorded

- DEC-180.

## Known limitations or remaining risks

- Legacy layout and toolbar-side preferences remain in persisted state for safe compatibility, but no longer affect this reader.

## Out-of-scope findings

- No Qur'an text, QCF geometry, progress, bookmark persistence, word-meaning content, or page-turn direction changed.

## Recommended next step

- Complete responsive browser evidence and the full repository quality gates before release.
