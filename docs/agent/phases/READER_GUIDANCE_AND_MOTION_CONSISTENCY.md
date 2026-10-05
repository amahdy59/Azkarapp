# Phase Report — Reader guidance and motion consistency

## Objective

Apply the owner's combined keyboard/counting guidance, improve open-panel desktop and tablet reading space, and implement the motion audit's approved performance refinements.

## Scope completed

Plan presented before edits: combine instructions and keyboard help; move ordinary navigation below text; narrow the open desktop collection panel; remove the subtle ambient photo loop; convert remaining layout-based progress animations; bound Library staggering; strengthen the motion gate; verify Arabic/English, keyboard focus, enlarged text and browser engines. Retain the approved directional reading-text transition (100ms exit, 240ms arrival) with immediate reduced motion.

## Files changed

Shared CounterGuidance, CounterKeyboardHelp, ZikrComponents and icon exports; Reader, Masbaha and Salawat screens; CategoryCard and Library entrances; reference-copy feedback and translations; Home background CSS; prayer/Friday/Quran/Mushaf progress surfaces; SplashScreen; theme layout; motion validator and quality runner; focused unit/browser tests; design/motion contracts, decision log, phase index and release notes.

## Components added or modified

Added CounterGuidance; reused CounterTapHint, CounterKeyboardHelp, DevotionalFooter, progressFillStyle and ReadingTextTransition. No dependencies added.

## User-visible changes

Phones retain the touch hint above actions. Desktop/tablet combine click/Space instructions and the keyboard-icon help action below the counter, replacing two separate shortcut rows. Ordinary Previous/Next sit beside the counter at all widths. Wide collection navigation uses 30% bounded at 288–352px; text uses symmetric scrollbar gutters and reduced side insets. The Home photograph is static. Progress fills use transforms inside clipped tracks; Library entrances finish without an index-dependent long wait. Zikr transitions retain the existing restrained directional slide/fade on text alone. Header controls now occupy their own normal-flow row; the title wraps separately, and the collection heading never overlaps its close control. Enlarged navigation labels yield to centered arrows when they do not fit. Library search/group/tab interactions stop entrances immediately.

## Accessibility work

Retained RTL/LTR, reduced motion, counter announcements and native keyboard semantics. Help has a named 44px trigger, complete shortcut dialog and explicit focus return after Safari pointer activation. Only one responsive guidance/help instance mounts at a time. Desktop guidance is hidden with focus-mode chrome. Enlarged-text regression preserves single-line counter labels and usable reading space. Automated accessibility evidence does not establish complete compliance; physical-device and screen-reader checks remain pending.

## Tests added or updated

Added localized guidance/dialog/focus tests and motion-validator fixtures. Added reference-copy pending/focus recovery and no-replayed-Library-entrance regressions. Added responsive browser geometry/help checks at 390, 820, 1200 and 1440px, plus 200% text. Updated footer/navigation assertions to the owner-approved combined layout. Existing normal-motion reading tests retain stationary controls and exact transition behavior.

## Commands run

| Command                                                    | Result                                                                                                                                                                 |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focused guidance/help/motion-validator unit run            | 3 files, 8 tests passed; exit 0.                                                                                                                                       |
| Focused reference-copy/Reader/audio unit run               | 4 files, 27 tests passed; exit 0.                                                                                                                                      |
| Library regression unit run                                | 1 file, 12 tests passed; exit 0.                                                                                                                                       |
| Responsive Reader guidance in Chromium, Firefox and WebKit | 6 tests passed; exit 0, 1.5m. The final enlarged-navigation variant is also covered by the full run below.                                                             |
| `pnpm typecheck`                                           | Passed; exit 0.                                                                                                                                                        |
| `pnpm check`                                               | Passed; exit 0, 278.3s; toolchain, covered unit suite, typecheck, lint, format, audio metadata, type scale, motion rules, isolated build, bundle and CSS gates passed. |
| `pnpm build:pages`                                         | Passed; exit 0; Vite 28.86s, service worker generated, bundle/CSS checks passed.                                                                                       |
| `pnpm audit:prod`                                          | Passed; exit 0, no known vulnerabilities.                                                                                                                              |
| `git diff --check`                                         | Passed; exit 0.                                                                                                                                                        |
| Final `pnpm test:e2e`                                      | Passed; exit 0, 553 passed / 1 existing skipped, 30.5m across desktop/mobile/tablet and Chromium/Firefox/WebKit.                                                       |

Earlier diagnostic runs are not counted as a successful final gate: the first targeted browser run had 89 passed/9 failed, exposing the cramped 200% counter and Safari focus-return defect. Both implementation defects were repaired; old sidebar/placement/header assertions were updated to the owner-approved layout. A subsequent 16-case run had 12 passed/4 failed against the obsolete standalone-card placement assertion. The first enlarged-panel regression used an ambiguous heading locator (six failed); selecting the named panel heading fixed that test fixture, and the next six-engine/language cases passed. Initial quality checks also exposed a tooling URL import and an obsolete sidebar class assertion; both were corrected. The newly added approved audio waveform was generated from checksum-verified bytes, preserving historical failed-source evidence. Interrupted broad runs were stopped while the owner-requested layout refinements were still being completed, and are not reported as passes.

Push-hook and deployed verification results are recorded in `output/motion-review-2026-10-05/RELEASE_VERIFICATION.md` after publication. The hook must still verify the exact final snapshot after this report is updated.

## Visual/manual evidence

Initial audit: output/motion-review-2026-10-05/REPORT.md and its production screenshots. Updated responsive screenshots: output/playwright/reader-guidance and output/playwright/footer-redesign (generated by browser tests; ignored artifacts).

## Documentation updated

DESIGN_SYSTEM.md and MOTION_SYSTEM.md describe responsive guidance, motion geometry and bounded entrances. The motion checker now runs in pnpm check.

## Decisions recorded

2026-10-05 owner request in DECISION_LOG.md.

## Known limitations or remaining risks

Static motion analysis catches explicit JSX transitions and direct animate object targets; it is not a profiler or exhaustive dynamic-expression analysis. The existing documented Mushaf overscroll warning remains. Tablet keyboard help is offered by layout rather than unreliable hardware detection. The concurrently completed scoped audio restoration is included by the explicit owner approval; see SCOPED_AUDIO_RESTORATION.md for exact recording review and checksum evidence.

## Out-of-scope findings

The layout/motion changes preserve reviewed devotional text, prayer calculations, persisted progress and synchronization. The separately approved scoped audio restoration restores Arabic availability and is included in the combined release. Functional audio visualization remains motion while playing. Gentler Progress wording and the unconfirmed update-deferral behavior remain deferred. Reference-copy feedback now names pending/success states, guards repeat requests and preserves focus.

## Recommended next step

Confirm comfort on physical tablet/desktop and perform assistive-technology checks after release.
