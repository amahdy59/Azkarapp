# Phase Report — Global overlay consistency, local 2026-11-25

## Objective

Apply the owner's approved overlay recommendations across shared application surfaces, using the phone Mushaf index as the reference for ordinary reader tools. Local implementation only: no commit, push, deployment or release-note change.

## Scope completed

- Shared edge-aware phone sheets, contextual menus/pickers, centered dialogs and docked panels retain their appropriate semantics and responsive roles.
- Both phone Mushaf readers present options/settings in the content area between usable stationary bars. Index/bookmarks and ordinary tools replace one another rather than stack.
- Shared visual anatomy, opaque text protection, finite entry/exit, internal scroll bounds, focus recovery and app/OS reduced-motion behavior.
- Existing wider docking, religious content, page geometry, reading position, counting, progress, audio and persistence boundaries retained.

## Files changed

Only this phase's contributions are listed; the shared checkout contains substantial independent pending work.

- Shared primitives: `src/app/components/ResponsiveSheet.tsx`, `ToolbarPanel.tsx`, `overlay-surfaces.css`, `ui/dropdown-menu.tsx`, `ui/select.tsx`, `ui/drawer.tsx`, `ui/alert-dialog.tsx`.
- Shared lifecycle: `src/app/hooks/useOverlayOrigin.ts`, `useOverlayPresence.ts`, `useToolbarPanel.ts`, `useOverlayBack.ts`.
- Reader surfaces: `MushafNavigationModal.tsx`, `MushafPageViewer.tsx`, `MushafQuickMenu.tsx`, `MushafSettingsSheet.tsx`, `MushafImmersiveReader.tsx`, `src/app/screens/KhatmahReaderScreen.tsx`.
- Other shared controls: `AccessibleCombobox.tsx`, `AudioQueueSheet.tsx`, `AudioVolumeControl.tsx`, `FloatingAudioPlayer.tsx`, `QuranWordPopover.tsx`, `LayoutShells.tsx`, `ReadingHeroToolbar.tsx`, `ReaderFooterTools.tsx`.
- Tests: `useOverlayOrigin.test.tsx`, `ToolbarPanel.test.tsx`, `AccessibleCombobox.test.tsx`, `MushafNavigationModal.test.tsx`, `MushafPageViewer.test.tsx`, `QuranVerseText.test.tsx`, `e2e/overlay-consistency.spec.ts`, `e2e/mushaf-phone-index.spec.ts`, `e2e/mushaf-glass-clarity.spec.ts`, `e2e/quran-enlarged-reading.spec.ts`.
- Small integration repairs: `QuranReadingZoom.tsx` and `quran-reading-zoom.css` preserve phone fullscreen geometry and reserve stable wrapped continuation context; obsolete neutral-category props were removed from the counter/Friday header callers; formatting was normalized in the shared reading header. Other pending edits in those files remain independent.
- Documentation: README, architecture, design system, motion system, quality checklist, design coverage, agent index/decision log, phase brief and this report.

## Components added or modified

ToolbarPanel is a named non-modal region rendered into a stable reader content slot. Reader components supply it to ResponsiveSheet, keeping reader-only code out of the startup path. Shared hooks capture the physical opener before autofocus, inherit it through menu handoffs, coordinate one ordinary panel and retain only an inert exit frame. Existing Radix/Vaul components continue to own blocking-dialog focus containment, scroll locking and outside interaction.

## User-visible changes

- Top controls open downward; bottom controls open upward. Contextual popups follow their collision-resolved side.
- Index, reading options and reading settings use the same bounded phone reading area. Toolbar controls remain usable; repeated activation closes the corresponding panel.
- Shared compact headers use consistent type, spacing and a logical-end 48px close action. Enlarged action labels reflow.
- Shared overlays fully protect functional text in Glass. Replacing reader panels use the selected opaque page color. The listening-lock shield retains its deliberate transparency.
- Search pickers opened by touch do not automatically summon the keyboard. Search remains explicitly focusable; keyboard opening keeps direct search focus.
- Finite 260ms entry and 150ms exit use existing tokens. Centered dialogs fade without disturbing their centering; side panels retain physical direction. App/OS Reduce Motion removes travel and delay.
- Resize recovery follows an available phone/rail opener without resetting the reading page.

## Accessibility work

Preserved true modal focus containment and avoided false modal semantics for reader panels with usable outside bars. Added/retained named regions, visible close controls, active-trigger state, keyboard focus entry/return, topmost Escape/native-Back dispatch, inert closing content, opaque surfaces, overscroll containment and forced-color fallbacks. Both directions, enlarged labels, short phone heights and 44px minimum ordinary targets are covered. Automated axe and geometry evidence do not establish complete WCAG compliance or real TalkBack/VoiceOver acceptance.

## Tests added or updated

- Unit regressions: unfocused touch openers, physical/explicit origins, frozen opening snapshots, nested handoffs, hidden-opener resize recovery, mutual panel replacement, Escape/native Back and focus restoration, touch-search focus, shared close target. Generic modal/sheet close controls also use the fixed 48px target and 12px inset, preventing rem-scaled overlap with headings.
- Browser regressions: both reader hosts and languages; panel/bar geometry and hit testing; index/option/settings handoffs; reading-position preservation; 320px/200% text; ordinary/app-still/OS-still motion; phone/tablet/desktop adaptation; global sheet/menu family and axe.
- Enlarged-reader checks assert true phone fullscreen geometry, constant context height, heading clearance from the fixed 48px close action, full source order and bounds through all portions, pointer and native keyboard navigation, focus return and unchanged canonical paper.
- Glass assertions now verify opaque selected page colors for replacing reader panels, preserving the existing legibility checks.

## Commands run

| Command                                                                                                                                                                                                                  | Exact result / evidence                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node --version`, `pnpm --version`                                                                                                                                                                                       | v24.15.0 / 11.19.0                                                                                                                                                                                                                                               |
| Focused six-file Vitest run                                                                                                                                                                                              | 6 files / 52 tests passed; `output/global-overlay-units-final.log`                                                                                                                                                                                               |
| Nine-file overlay/integration Vitest run                                                                                                                                                                                 | 9 files / 98 tests passed; `output/global-overlay-integration-recheck.log`                                                                                                                                                                                       |
| Final four-file unit repairs                                                                                                                                                                                             | 4 files / 55 tests passed; `output/global-overlay-last-unit-repairs.log`                                                                                                                                                                                         |
| `pnpm exec vitest run src/app/content/mushafOfflineCache.test.ts`                                                                                                                                                        | 7 tests passed in 8.56s; `output/global-overlay-cache-recheck.log`                                                                                                                                                                                               |
| `pnpm check`                                                                                                                                                                                                             | Complete gate passed, exit 0, 287.1s; `output/global-overlay-quality-complete.log`. Includes coverage, formatting, lint, types, build, content/audio/timing/type-scale/motion rules, bundle budgets and CSS utilities.                                           |
| `pnpm build:pages`                                                                                                                                                                                                       | Final follow-up build passed, exit 0; `output/global-overlay-pages-complete.log`. Home startup 524,592 gzip bytes. Existing ceilings and baseline unchanged.                                                                                                     |
| `pnpm exec playwright test e2e/overlay-consistency.spec.ts e2e/mushaf-phone-index.spec.ts --project=desktop-chromium --project=desktop-firefox-smoke --project=mobile-webkit-smoke` against the dedicated isolated build | All 36 tests passed, 7.3m; `output/global-overlay-final-acceptance.json` / `.log`. The final run includes the enlarged-text body/final-action assertions and the preserved centered folio.                                                                       |
| Three-engine Glass recheck                                                                                                                                                                                               | All 6 tests passed; `output/global-overlay-glass-recheck.json`                                                                                                                                                                                                   |
| Fullscreen reading follow-up across the same three engines                                                                                                                                                               | All 15 tests passed in 2.0m; `output/global-overlay-fullscreen-acceptance.json` / `.log`. Checks true phone fullscreen bounds, invariant continuation-message height, every source portion, pointer/keyboard activation, focus return and unchanged Mushaf text. |
| Final focused type, lint and formatting checks                                                                                                                                                                           | Typecheck and ESLint passed; the last shared-close formatting warning was repaired and final Prettier passed in `output/global-overlay-final-format.log`. `output/global-overlay-final-static.log` retains the preceding warning.                                |
| `node scripts/check-motion-rules.mjs`                                                                                                                                                                                    | 0 errors, one existing `overscroll-behavior: none` warning in the paper scrollport; the existing page-gesture contract was retained.                                                                                                                             |
| Final focused overlay/portion unit tests                                                                                                                                                                                 | 3 files / 10 tests passed; `output/global-overlay-final-followup-unit.log`                                                                                                                                                                                       |
| Final fixed-close and global-family browser check                                                                                                                                                                        | All 18 tests passed in 2.3m; `output/global-overlay-final-close-acceptance.json` / `.log`. Same three engines; includes 200% heading-clearance and fixed 48px-close assertions.                                                                                  |
| Scoped `git diff --check`                                                                                                                                                                                                | Passed                                                                                                                                                                                                                                                           |

The complete gate passed before the final fullscreen CSS, stable continuation-message and fixed close-target follow-up. Those small integration fixes have separate final type/lint/format, unit, browser and Pages-build verification. No quality receipt was fabricated and no publication or exact-commit CI result is claimed.

Earlier runs were retained rather than hidden: the first complete gate had 2,722 passes and one loaded cache timeout, plus initial-route growth (194,113 gzip bytes). The cache passed alone, and supplying the reader panel from reader-owned chunks brought startup back within the unchanged budget. A later shared-checkout gate found the new content-slot adjacency expectation and concurrent counter/zoom integration drift. The slot test now proves both ordering and separation, touch fixtures identify a real primary pointer, meaning tests require only the independent zoom action after meanings close, and obsolete header props were removed. Intermediate formatting, type and unit failures were repaired; no assertion, timeout, coverage threshold or budget was reduced. The final gate and focused results above supersede those failed checkpoints. The additional enlarged-reader suite initially passed 14/15: review found that continuation-message wrapping could change the reading area geometry. The layout now reserves the exact wrapped message height. Its trace then showed 69 successful pointer activations consuming the unchanged 90-second limit; the regression now tests pointer entry followed by native Enter activation for every remaining portion, retaining all source-order, ink, geometry and axe assertions. The isolated case passed in 47.1 seconds; no timeout was increased.

## Visual/manual evidence

Actual screenshots cover Arabic/English phone options, 320px/200% text, tablet options, opaque page-color choices and dark options. The final screenshots include the separate labeled zoom row. Additional fullscreen review found the generic rem-scaled close action overlapping the heading at 200% text; a fixed 48px action and 12px inset restore clearance, now asserted across engines. The evidence gallery is `docs/agent/evidence/global-overlays/README.md`. Pointer hit testing, opacity, native keyboard journeys and axe complement screenshots. Browser motion endpoints and screenshots cannot establish physical-device frame pacing, operating-system keyboard behavior or human assistive-technology acceptance.

## Documentation updated

README, architecture, design system, motion system, quality checklist, design coverage, agent index, decision log and approved phase brief. The new contract explicitly distinguishes ordinary non-modal reader panels from blocking tasks and contextual menus. Content-specific evidence ordering, sharing, reviewed text and offline contracts remain.

## Decisions recorded

The owner's global local implementation approval supersedes bottom-only compact sheets and ordinary translucent text-over-text fills for the shared overlay family. Existing content/domain behavior and publication hold remain. No new runtime dependency, storage contract, native permission, router or responsive-shell tier.

## Known limitations or remaining risks

Real-device TalkBack/VoiceOver, mobile soft-keyboard and physical animation acceptance remain pending. The wider application still uses the approved presentation families rather than forcing every contextual popup or destructive confirmation into the reader-panel model. The shared checkout contains independent pending changes; exact-commit release verification is outside this local phase. The final fullscreen/context follow-up has focused checks and build verification as described above.

Visual inspection additionally found an enlarged-text failure that outer bounds and axe missed: the location capsule and heading consumed the entire options body. A container-query recovery now puts the location on a full row, gives the heading more width and omits redundant context already visible in the bars. The concurrently added zoom action keeps its own footer row so the folio remains centered. Stronger regressions require a real 96px body and scroll/activate its final action.

## Out-of-scope findings

The initial cache timeout passed standalone without test/source changes. Reader-only panel code was removed from the startup graph to satisfy the unchanged growth guard. Independent Home, Settings, Learn, document, completion and native system-bar changes were preserved. Local browser API traffic remains loopback-isolated.

## Recommended next step

Owner review of the local gallery and real-phone keyboard/assistive-technology acceptance. Publish only after separate authorization and exact-commit repository release gates.
