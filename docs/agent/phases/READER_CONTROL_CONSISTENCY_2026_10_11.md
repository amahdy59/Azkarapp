# Phase Report — Reader control consistency

## Objective

Apply the owner's screenshot feedback locally: match the focus button to its footer peers, align Masbaha and Salawat with the normal zikr reader, and remove benefits beneath the As-Sajdah, Al-Mulk and Al-Kahf reading surfaces. No push.

## Scope completed

Plan before editing: inspect the shared control family and three screens; reuse the same support button for focus; give standalone counters the same visit-local focus behavior; remove both surah reading-choice and immersive benefit footers; retain reviewed benefits through contextual options; add targeted regressions and responsive browser evidence. Existing unrelated pending work is preserved.

## Files changed

`src/app/components/DevotionalControls.tsx`, `ReaderFooterTools.tsx`, `StandaloneCounterFooter.tsx`, reader-footer.css, useStandaloneReadingFocus, CustomCounterScreen, FridaySalawatScreen, ReaderScreen, MushafImmersiveReader, MushafQuickMenu and MushafToolRail; colocated/screen regression tests; reader-benefits and reader-control-consistency browser specs; design system, decision log, index and this report.

## Components added or modified

Focus uses the shared DevotionalAction, including native button ref forwarding. Both standalone screens retain their own counter/target/persistence behavior and use a shared visit-local focus hook. Mushaf options and rail accept an optional benefit callback; no footer is inserted below the Quran.

## User-visible changes

Focus has the same pill shape, themed surface, border and 20px icon as adjacent controls, without an inner circular icon background. Masbaha/Salawat share the reader focus toggle while retaining relevant benefit, sound and reset controls. Focus hides screen chrome and secondary actions; the counter and explicit exit remain available. Surah benefits move to More on compact screens and the desktop tool rail.

## Accessibility work

Native toggle semantics, localized accessible names, minimum 44px targets and shared focus indicators remain. Focus entry targets the explicit exit; exit restores the labelled reading region. Escape leaves focus before leaving the screen and defers to open dialogs/menus. No complete accessibility compliance claim.

## Tests added or updated

Standalone focus/count continuity and keyboard recovery; absence of surah benefit footer/reading-choice buttons; optional Mushaf menu benefit; Arabic/English responsive control-style equality, minimum sizes, focus, axe and screenshots.

## Commands run

| Command                        | Result                                                                                                                                                                       |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Targeted unit tests (7 files)  | 87 passed, 36.42 seconds.                                                                                                                                                    |
| pnpm typecheck                 | Passed.                                                                                                                                                                      |
| pnpm check                     | Final run passed all stages in 447.9 seconds. Initial failures and their repairs are recorded below.                                                                         |
| Chromium feature browser specs | Final production-preview run: 8 passed; includes both languages, 320/390px compact and 1440px wide checks, benefit focus recovery, peer control styles and footer axe scans. |

## Visual/manual evidence

Browser screenshots are retained under `output/playwright/reader-consistency/`. Inspected Arabic phone views for all three screens, Arabic wide normal reader, English wide Masbaha and English phone Salawat. Final inspection/results recorded below. Physical-device and human screen-reader review remain outstanding.

## Documentation updated

Shared focus/control and surah benefit placement contract in the design system; user decision and index link; this report.

## Decisions recorded

The current explicit request supersedes prior below-surah benefit placement and separate standalone hide-tools controls. All edits remain local; no commit, push or release manifest change.

## Known limitations or remaining risks

The repository already contains extensive unrelated pending changes. Broad quality results apply to the combined workspace. Reviewed religious text, counts, persistence, synchronization and prayer calculations are untouched by this phase.

## Out-of-scope findings

Existing pending work remains owned by its respective phases.

## Recommended next step

Owner review locally; publication remains withheld.

## Verification follow-up

- Initial targeted units: 87 passed across seven files. After updating the superseded audio/surah footer expectation, the three-file follow-up passed 35 tests.
- Feature ESLint and scoped Prettier checks passed. `pnpm build:pages` passed with bundle budgets unchanged; `git diff --check` passed.
- The first two Chromium runs each passed all four surah cases and failed the four new control-style cases: the first selector included Previous/Next; the corrected selector then exposed the filled focus surface. The production CSS was corrected to share the peers' surface rule. No assertions were weakened.
- An intermediate development-server browser run timed out during initial navigation while compilation was contending with the quality suite, and was stopped. The final dedicated production preview contains the completed shared CSS and icon-order changes.
- Inspected Arabic phone screenshots of all three readers and the wide normal-reader screenshot under `output/playwright/reader-consistency/`. English screenshots are also retained there. Browser emulation does not replace physical-device or screen-reader evidence.
- Final full `pnpm check` passed (447.9 seconds), including coverage, content/audio integrity, formatting, lint, types, build, bundle and CSS checks. Because final CSS/icon edits happened during this combined workspace run, the separately built final production preview and feature browser run verify those last visual edits. No release receipt is claimed.
- Final cross-browser results are recorded below. No commit, push, release notes, workflows or production changes.

### Cross-browser follow-up

The combined Firefox/WebKit run finished with 13 passed and 3 WebKit wide-case timeouts in 12.1 minutes. All eight Firefox cases and five WebKit cases passed. The wide Arabic four-surah case and both wide three-screen control cases exhausted their 90-second shared budgets during later actions. Traces/error contexts were inspected; the original failed run is retained under `output/playwright/reader-consistency-cross-browser/`. Both specs now parameterize each surah/screen visit independently, preserving every route, viewport, style, target, focus, accessibility and ordinary-reader benefit assertion. No test skip, timeout increase, forced click or relaxed assertion. Final isolated wide WebKit results are recorded below.

Final production artifact bundle/CSS checks and final browser-spec ESLint/Prettier checks passed. The local preview is `http://127.0.0.1:5296/`.

### Final local handoff

The isolated wide WebKit rerun still timed out in the first Al-Kahf Arabic case, waiting for the rail Benefit button to become stable. The run was stopped after that failure; a second case was interrupted. This disproves shared test duration as a sufficient explanation. The trace/error context and screencast were inspected and retained under `output/playwright/reader-consistency-webkit-isolated/`; wide WebKit remains an unresolved verification gap, not a passing result. No production workaround, forced click, weaker assertion, timeout increase or unrelated browser-infrastructure change was introduced. The grouped run had already passed compact Arabic/English WebKit benefit access, compact Arabic/English control styling/focus, and English wide benefit access. All corresponding Chromium and Firefox cases passed.

Final outcome: the requested local UI changes are implemented. `pnpm check` passed, 87 initial targeted units and 35 follow-up units passed, Pages build passed, final production bundle/CSS checks passed, Chromium 8/8 and Firefox 8/8 feature cases passed. WebKit grouped run was 5/8 passed with 3 wide timeouts; the isolated attempted rerun remains failed/stopped. Final browser specs retain the split per-screen/per-surah cases for further diagnosis, with scoped ESLint/Prettier and `git diff --check` passing. Screenshots were visually inspected. No application source changed after the final production preview was built.

Recommendation: review the local preview at `http://127.0.0.1:5296/`, then diagnose the remaining wide WebKit interaction timeout before any future release. No commit, push or deployment.
