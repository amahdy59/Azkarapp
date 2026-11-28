# Phase Report — Inline Quran enlargement, compact meanings and coordinated player polish

## Objective

Implement the owner-approved revised image locally: one phone Zoom action replacing the normal Focus slot, enlargement inside the same page, more reading room, and a concise aligned meaning card. Coordinate the expanded player with **Improve books and audio player** under the owner’s later normal-Mushaf comparison.

## Scope completed

- Removed the extra Mushaf enlargement row. Both main and immersive phone readers place Zoom in the existing row; Focus stays available through More/keyboard and retains its explicit exit.
- Reused the measured complete-word portion renderer inside the existing paper. Scale starts from the actual fitted type, uses a bounded wide-screen measure, and genuinely enlarges letters. Canonical pages stay mounted with unchanged fifteen-line text/geometry and become inert/hidden from assistive technology until return.
- Kept portion keys, pinch synthetic-click suppression, Escape, shared hardware Back and opener recovery within the reading task. Existing flowing-excerpt modal presentation remains.
- Reduced meanings to an aligned word/passive-verse/close header and unchanged explanation, preserving All meanings where offered. Protected page-themed opacity, viewport collision measurement, size changes and exceptional internal scrolling remain.
- Coordinated shared player ownership and passed the owner’s normal-reader correction to the books/audio chat: Quran stays centered on a continuous surface; protected settings appear on request without narrowing it. Shared canonical rendering, balanced title/transport and no redundant per-page zoom rows are preserved. The player owner retains wider universal integration and the combined gate. The final phone/desktop Quran-player matrix now passes all three engines, including WebKit font parity.

## Files changed

Owned application files: `src/app/components/QuranReadingZoom.tsx`, `quran-reading-zoom.css`, `MushafPageViewer.tsx`, `MushafImmersiveReader.tsx`, `QuranWordPopover.tsx`, `src/app/screens/KhatmahReaderScreen.tsx`, `src/app/hooks/useOverlayBack.ts`, and `src/styles/theme/wordPopover.css`.

Shared player changes are coordinated with the other owner in `FloatingAudioPlayer.tsx`, `floating-audio-player.css`, `AudioOptionsSurface.tsx`, `QuranListeningReader.tsx` and `QuranSurahListeningReader.tsx`. Preserve their independently authored book/source/timing changes; this report does not claim those as inline-reader work.

Tests and documentation are listed below. No dependency, release-note, persisted data or synchronization change belongs to this phase.

## Components added or modified

QuranReadingZoom/EnlargedQuran, MushafPageViewer (including Focus takeover), MushafListeningPage, both Mushaf host compositions and QuranWordPopover reuse existing components, fonts, icons, source words and controls. No new runtime dependency or player/controller is introduced. Enlarged reading is suspended immediately when deliberate Focus takes over, keeping its exit in a single unobstructed slot.

## User-visible changes

The printed page regains the former extra-row height. Zoom stays within the current page and returns without losing reading position. Meanings have less empty space, clear alignment and an explicit close button. The expanded Quran player follows normal-reader centering/material rather than displaying a small off-center page alongside permanently visible options. Other playback keeps the same universal controller and responsive optional tools.

## Accessibility work

Named nonmodal enlarged region, native buttons, 44px targets, complete source text, local size/portion announcements, hidden/inert duplicate canonical content, explicit keyboard/Back return and focus recovery. The verse reference is passive; the explanation describes its named gloss. Opaque theme-aware paint, collision/hit testing, RTL/LTR, enlarged-text recovery and axe checks supplement visual inspection. Physical TalkBack/VoiceOver acceptance is not inferred from automation.

## Tests added or updated

- `e2e/quran-inline-player.spec.ts`: single-row geometry, canonical preservation, actual enlargement, local portion keys, opaque compact gloss/collision/hit targets, both directions/themes/materials, 320px/200%, phone/tablet/desktop, audio centering/no movement/reference type size/no ordinary control scrolling.
- `e2e/quran-enlarged-reading.spec.ts`: same-page region geometry/semantics, complete ordered source-word traversal, returned page/focus and pinch protection.
- `e2e/mushaf-phone-index.spec.ts`, `mushaf-approved-chrome.spec.ts`, `mushaf-sizing-feedback.spec.ts`: phone Zoom and Focus-through-More, preserving target, geometry and focus assertions.
- `QuranWordPopover.test.tsx`: protected description, passive verse and explicit close focus. `useOverlayBack.test.tsx`: inline Back ownership/cleanup. Khatmah reader test checks the retained accessible Meaning name instead of a removed redundant visible label.
- Shared audio options/browser expectations follow on-demand surfaces; the books/audio owner owns subsequent player test fixes. The audio feature selector includes the new combined regression spec.

## Commands run

| Command                                                                                     | Result                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node --version`; `pnpm --version`                                                          | v24.15.0; 11.19.0.                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `pnpm typecheck`                                                                            | Passed during initial implementation; also passed in the initial aggregate gate.                                                                                                                                                                                                                                                                                                                                                       |
| Focused `pnpm test:run` for seven affected reader/gloss/Back/portion/listening/player files | **139 tests passed**, seven files, 18.32s. See `output/quran-inline-targeted-unit.log`.                                                                                                                                                                                                                                                                                                                                                |
| Focused Prettier check across owned implementation/tests                                    | Passed.                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Focused ESLint for reader and shared modified renderer/player files                         | Passed after correcting region event ownership; no rule suppression was added.                                                                                                                                                                                                                                                                                                                                                         |
| Initial `pnpm check`                                                                        | Failed during concurrent work: initial inline-region lint (fixed), ten then-active unrelated source/timing formatting files, three book-source expectations, and the subsequently updated shared player-header assertion. 2,827 tests passed / four failed at that snapshot; build, typecheck, source/audio/timing/motion checks and bundle/CSS gates passed. See `output/quran-inline-check.log`. This is not a final aggregate pass. |
| `pnpm build:pages`                                                                          | Passed, including bundle and CSS-utility checks. See `output/quran-inline-pages.log`.                                                                                                                                                                                                                                                                                                                                                  |
| Initial Chromium enlargement/word meanings specs                                            | Nine passed.                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Full three-engine enlargement/meaning/pinch run                                             | All 27 reader cases passed; five earlier audio cases passed and the final superseded audio-sidebar expectation failed after the owner changed the layout contract. See `output/quran-inline-cross-results.json`.                                                                                                                                                                                                                       |
| Updated focused audio Chromium symmetry/no-scroll/reference-size cases                      | Both 390px/1440px passed. WebKit desktop exposed a remaining shared font-parity defect, handed to the player owner.                                                                                                                                                                                                                                                                                                                    |
| Final reader geometry/focus checks                                                          | In progress at this checkpoint; final results and gallery follow below.                                                                                                                                                                                                                                                                                                                                                                |
| `git diff --check`                                                                          | Passed at the recorded check.                                                                                                                                                                                                                                                                                                                                                                                                          |

## Visual/manual evidence

Actual screenshots are under `output/playwright/quran-reader-final/` and `output/playwright/quran-symmetry-final/`; the [selected local gallery](../evidence/quran-inline-player/README.md) includes normal reading, inline enlargement, compact meaning and dark tablet/wide views. The gallery includes the final composite glyph on the normal phone view, final 320px/200% WebKit meaning hit-test, and reachable Focus exit. The explicitly checked footer controls have disjoint rectangles at enlarged text; only transparent outer insets are reduced on narrow phones. The gallery includes the final verified phone/desktop player and on-demand options; wider shared-player release evidence belongs to its owner’s checkpoint. Concept images were approval references only; generated Quran lettering never enters the application.

## Documentation updated

README, Architecture, Design System, Quality Checklist, decision log, working index, scoped phase brief, this report and `QURAN_PLAYER_COORDINATION_2026_11_27.md`. The latter is owned jointly and records active integration/quiet-window status.

## Decisions recorded

The owner approves the revised three-control concept, then explicitly requires normal-reader symmetry and coordination with the existing books/audio chat. Quran options overlay without changing reading measure; the initial permanent sidebar is superseded. All work remains local: no commit, push, deployment or release-note rewrite.

## Known limitations or remaining risks

The first coordinated quiet aggregate gate passed all owned reader tests but exposed four remaining source/global assertions, formatting and a 2,366-byte total-output overrun in the shared candidate; the player/book owner is repairing these with existing limits intact. A final aggregate pass remains pending. Final Quran-player font/centering/options cases pass all three engines. Wider player/book integration and its complete gate remain with the coordinated owner, who is also preserving earlier saved book packs across upgrades. Short/enlarged screens, long scripture, expanded help and long meanings retain deliberate native scrolling; ordinary controls must fit without shrinking labels or source text. Physical-device and human assistive-technology review remain separate. Independent book/source/timing work is not asserted complete by this phase.

## Out-of-scope findings

Concurrent source-correction and estimated-recording work changes the shared checkout while checks run; no unrelated content, receipt, test threshold, budget ceiling or history is changed to manufacture a passing result.

## Recommended next step

Complete the other owner’s wider book/player integration and repaired aggregate gate on its quiet candidate. The scoped reader/Quran-player visual work and focused verification are complete locally. Retain the owner’s publication hold.
