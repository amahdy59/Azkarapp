# Sharing, quiet Masbaha and enlarged Quran reading — 2026-11-26

## Objective

Complete the approved sharing/Masbaha/Quran checkpoints and subsequent quiet-Masbaha correction. The coordinated release owner finishes the frozen implementation and verification. Current coordinated release authority supersedes the original local-only publication hold.

## Scope completed

- Eligible routine sharing opens on existing prepared artwork, with explicit card selection, full-size inspection and optional custom design. Explicit long-surah reminders retain their individual portrait/source-link path.
- Masbaha shows the reviewed dhikr once, one count/target ring and equal Undo/Dhikr/Focus actions. The symmetric Back/title/Options header gives its title a separate row at enlarged narrow widths; actions stack with whole labels. Six-digit count and target ink fits with independent numeral direction.
- Protected searchable choices stage selection until Continue, preserving the previous tally and resuming the selected tally. Options stages target, typography and feedback until Save. Presets populate a labelled numeric field accepting Arabic, Persian and Western whole numbers from 1 to 100,000; invalid input is explicit and dismissal discards drafts.
- One screen-owned panel prevents stacked tools. Reference/reset/help recover focus to Options. Source references, protected legacy swipe switching, day boundaries, normalization and screen-owned persistence remain intact.
- Completion stays inline with Undo, New round and Finish. Vertical scrolling and multi-touch suppress their synthetic counting click; the next deliberate tap works.
- Separately named Quran enlargement uses existing reviewed word identities and fitted portions, including long-ayah continuation. Pinch/buttons and explicit return preserve the canonical Mushaf renderer, page and focus.

## Files changed

CollectionShareModal, CustomCounterScreen, MasbahaDhikrSheet, MasbahaSettingsSheet, masbahaControls, ZikrComponents, QuranReadingZoom and quranReadingPortions; their styles, bilingual copy, units and affected browser specs. Existing Mushaf/Quran entry points expose enlargement. The controls feature runner includes Masbaha acceptance coverage.

## Components added or modified

Reuses shared sheets, opaque surfaces, choice radios, switches, reading header/actions, counting/persistence and sharing dispatch. Adds the focused dhikr sheet and separate Quran enlargement presentation. No runtime dependency was added.

## User-visible changes

Prepared cards require fewer sharing steps. Counting has a quieter hierarchy, deliberate choices, single-count correction and recoverable inline completion. Quran passages can be read in larger fitted portions and returned to their original position.

## Accessibility work

Arabic/English, RTL/LTR, 320px/200% text, short windows and phone/tablet/desktop are covered. Tests preserve header/action targets and hit-testing, tally ink, field reachability, opaque bounded pickers, radio keyboard focus, Escape/opener recovery, gesture ownership and axe checks. Automated results do not establish complete accessibility compliance or physical assistive-technology acceptance.

## Tests added or updated

Units cover staged/invalid goals, saved/resumed counts, exact Undo/completion, unchanged source links, explicit long-surah sharing, gesture suppression and focus recovery. Browser migrations name the approved anatomy while retaining behavior, geometry, export, keyboard, source and axe assertions. Expanded custom-sharing fields are individually bounded within their scrolling body above the fixed footer.

## Commands run

| Check                                             | Result                                                                                                                                                         |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focused Masbaha/helpers/portion units, one worker | 5 files / 31 tests passed in 9.96s after final focus wiring                                                                                                    |
| Sharing modal units                               | 39 passed in 11.49s                                                                                                                                            |
| Quran enlargement/pinch, three engines            | 15 cases passed; reviewed word identities retained exactly once                                                                                                |
| Sharing matrix                                    | Initial 37 passed; six confirmed arrow/footer failures repaired and all six passed across three engines                                                        |
| Custom-sharing field/export/focus                 | Chromium 2 passed in 24.6s; Firefox/WebKit follow-up 6 passed in 2.8m                                                                                          |
| Long-surah reminder/export/exact source link      | Passed in 4.5s after repair                                                                                                                                    |
| Masbaha saved settings                            | Chromium 2 passed in 11.6s; Firefox/WebKit settings plus quiet checkpoint 8 passed in 2.6m                                                                     |
| Broader migrated counting                         | Initial 28 passed / 8 failed; repaired reference focus, chooser row height, enlarged title bounds and stale help/text expectations without removing assertions |

Final acceptance, aggregate local gates and exact-commit CI/deployment results belong to the [coordinated report](COORDINATED_RELEASE_2026_11_25_REPORT.md).

## Visual/manual evidence

See [actual coordinated captures](../evidence/coordinated-release-2026-11-25/README.md). Visual inspection caught English mid-word action wrapping/title crowding at 320px/200%, corrected before final acceptance. Earlier owner screenshots predate final refinements and are not final acceptance evidence.

## Documentation updated

This report, the coordinated plan/report, DESIGN_SYSTEM and QUALITY_CHECKLIST record the final behavior and boundaries.

## Decisions recorded

The quiet-Masbaha correction removes visible remaining counts, repeated goals, tap captions and extra primary actions. Complete accessible instructions/count semantics remain. Reviewed religious text, source default targets and persistence/synchronization schema are unchanged.

## Known limitations or remaining risks

Real TalkBack/VoiceOver, physical touch/pinch and low-end-device acceptance remain separate. Publication depends on the unchanged mandatory local and exact-commit CI gates.

## Out-of-scope findings

Source-conflicted Learn editions and unreviewed audio remain withheld under their own reports. No source restoration or independent Arabic listening approval is claimed.

## Recommended next step

Finish the coordinated release and production verification, then the documented physical-device/assistive-technology acceptance.
