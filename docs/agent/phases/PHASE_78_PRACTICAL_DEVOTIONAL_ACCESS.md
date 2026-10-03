# Phase 78 — Practical devotional access

## Approved objective and plan

The owner requested implementation of the useful recommendations from the sensory/UX audit and exclusion of recommendations rejected in the subsequent review.

1. Preserve the existing press feedback, reduced-motion transitions, reviewed content, reader advancement, and pending local changes.
2. Add visible Home shortcuts to existing situational collections and an entry from Masbaha to the reviewed after-prayer reader sequence. Do not create a new ritual or alter counts.
3. Add a travel-preparation action using existing independent Mushaf/audio download boundaries, verified readiness, cancellation, and resumable partial success.
4. Add shared keyboard help, a way to disable character shortcuts, and safeguards around editing, dialogs, and modified shortcuts.
5. Add an explicit ordinary-reader focus mode with an always-visible exit, stable theme colors, and working counting/navigation.
6. Add regression tests and responsive Arabic/English evidence; run repository gates and report exact outcomes.

This is one access-and-continuity phase. Acoustic haptics, automatic counting, new religious sequences, streak healing, sound palettes, rolling numerals, continuous atmosphere, and ornamental content changes are excluded. Optional badges and a canonical Mushaf ruler remain experiments pending evidence of need. No new runtime dependencies or synchronized state fields are needed.

DEC-216-H's local-only restriction remains in force: no commit, push, or deployment.

## Phase report

### Objective

Implement the practical recommendations accepted in the audit review while preserving reviewed devotional content, offline reading, manual counting, existing progress, and unrelated pending work.

### Scope completed

- Six visible situational shortcuts on Home.
- Masbaha entry to the existing reviewed after-prayer reader.
- Travel preparation for the complete Mushaf and supported morning, evening, before-sleep, and Al-Kahf recordings.
- Shared keyboard help and visit-local control of character shortcuts.
- Ordinary-reader focus with explicit exit and preserved counting/navigation.

### Files changed

New runtime files: `SituationalShortcuts.tsx`, `CounterKeyboardHelp.tsx`, `keyboardShortcuts.ts`, and `audio/travelPreparation.ts` under `src/app/`.

Modified runtime files: `App.tsx`, `components/ZikrComponents.tsx`, `screens/HomeScreen.tsx`, `screens/CustomCounterScreen.tsx`, `screens/FridaySalawatScreen.tsx`, `screens/ReaderScreen.tsx`, `screens/ReaderScreen.css`, `screens/settings/DownloadsPanel.tsx`, `audio/audioOfflineCache.ts`, and Arabic/English i18n dictionaries.

Tests and documentation are listed below. Existing changes in these files were preserved; other dirty files were not part of this phase. A pre-phase copy of touched files was retained outside the repository for comparison.

### Components added or modified

Added SituationalShortcuts and CounterKeyboardHelp. Updated existing Home, counter shortcut hints, reader chrome, Masbaha, Friday counter, and Downloads panel using the existing Button, Modal, Card, menu, routing, and icon exports. No runtime dependency was added.

### User-visible changes

Situational collections are available directly on Home. Masbaha offers guided access to the reviewed after-prayer collection without resetting its tally or adding a religious sequence. Travel preparation runs independent download jobs, reports failed groups, supports cancellation, and preserves successful groups. Audio downloads verify cached bytes and skip valid recordings on retry; readiness reflects actual cache coverage rather than the registry alone. Ordinary-reader focus hides supporting chrome while keeping text, counting, audio, navigation, and an explicit exit available. Keyboard help is reachable by button or `?`; disabling character shortcuts leaves native controls, Space, and navigation keys available.

### Accessibility work

Used semantic links, headings, buttons, checkbox, dialog, progress, and status feedback. Preserved minimum targets, visible focus, RTL/LTR, reduced motion, editing/modifier safeguards, and dialog keyboard ownership. Reader-menu close autofocus explicitly hands focus to the focus-mode exit. Narrow keyboard help reserves separate space for its close control at enlarged text sizes. Browser checks include axe, keyboard focus, horizontal overflow, Arabic/English, and 200% text on a short Arabic phone. These checks do not establish complete accessibility compliance; manual assistive-technology release checks remain necessary.

### Tests added or updated

Added unit suites for situational links, shared keyboard help, shortcut safeguards, verified audio resume/rollback, and independent travel-job failure/cancellation. Updated Masbaha and Downloads panel tests, and registered mocked audio suites in `src/test/isolatedSuites.ts`. Added `e2e/practical-devotional-access.spec.ts` for collection access, focused reading/counting, keyboard control, download disclosure, and enlarged-text dialog geometry, with cross-browser tags where applicable.

### Commands run

| Command                                                                                    | Result                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`                                                           | Passed; lockfile already current.                                                                                                                                           |
| `pnpm test:run`                                                                            | Passed: 170 files, 1,245 tests.                                                                                                                                             |
| `pnpm typecheck`                                                                           | Passed.                                                                                                                                                                     |
| `pnpm test:e2e e2e/practical-devotional-access.spec.ts --grep "enlarged text" --retries=0` | Passed: three tests, Chromium/Firefox/WebKit, 45.0 seconds.                                                                                                                 |
| `pnpm check`                                                                               | Exit 1, 91.9 seconds. Toolchain, typecheck, production build, lint, format, unit coverage, type scale, audio manifest, and CSS utilities passed. Only bundle budget failed. |
| `pnpm build:pages`                                                                         | Exit 1. Vite build and PWA generation passed; bundle budget failed.                                                                                                         |
| `pnpm test:e2e`                                                                            | Passed: 457 tests, one existing skip, 21.6 minutes; desktop/mobile/tablet Chromium plus Firefox and WebKit smoke projects.                                                  |
| `git diff --check`                                                                         | Passed.                                                                                                                                                                     |

The final default production stylesheet is 170,519 raw / 28,834 gzip bytes; the pre-phase snapshot is 170,465 / 28,823. This phase adds 54 raw CSS bytes and 991 gzip bytes to the initial route (149,919 → 150,910). The Pages build measures 170,636 raw / 28,843 gzip CSS bytes and 150,931 initial-route gzip bytes. Both the existing stylesheet ceiling and recorded-baseline growth checks fail. No budget, coverage, assertion, or timeout was weakened.

Earlier browser runs were stopped to fix the reader-menu focus race and refine enlarged-text help. The overlap regression initially measured padded heading bounds; it now measures rendered text and checks reachable controls plus label width. A lint run accidentally scanned the temporary diagnostic snapshot in `output/`; that copy was preserved under the system temporary directory and the final lint stage passed without changing lint exclusions.

Additional final checks: `pnpm report:unused-css` passed with 138 handwritten classes and zero unreferenced. Targeted Prettier checks for this report and the evidence index passed, and the final `git diff --check` passed.

### Visual/manual evidence

Screenshots in `output/playwright/phase78/` cover Arabic/English Home and focused reading at 320, 820, and 1440 CSS px, keyboard help, enlarged Arabic keyboard help, and travel preparation. Five representative final Chromium screenshots and final quality/browser/Pages logs are preserved in `docs/agent/evidence/phase78/` with an evidence index. The initial dialog screenshot revealed a title/close overlap at 200% text; the layout and regression assertion were corrected before final verification. On short enlarged-text screens, the complete help content scrolls while the close control remains reachable.

### Documentation updated

Updated architecture, design system, offline-caching contract, agent index, decision log, and this phase brief/report. Reviewed religious text, repetition counts, and release notes were not changed.

### Decisions recorded

DEC-217 records the owner's implementation request, the selected recommendations, excluded experiments, and the continuing local-only restriction from DEC-216-H.

### Known limitations or remaining risks

The existing stylesheet budget failure requires the owner's scope decision under AGENTS.md §12. Real bulk network downloads were tested through failure/cancellation/cache fixtures rather than downloading the complete corpus in browser evidence. Browser checks cannot replace manual screen-reader and device checks. Character-shortcut preference is intentionally limited to the current visit.

### Out-of-scope findings

The pre-phase production stylesheet measured 170,465 raw bytes and 28,823 gzip bytes against ceilings of 167,936 and 28,672. The initial route was already 1.7% above its recorded baseline before this phase; the selected additions bring it above the 2% growth allowance. The accepted recommendations did not require speaker haptics, automated counting, grace quotas, decorative motion/sound effects, new rituals, or new typography.

### Recommended next step

Feature verification is complete. Resolve the existing bundle-budget scope decision before treating this phase as merge-ready. The owner was asked whether to include targeted CSS cleanup or keep this phase scoped and report the existing failure; no answer has been received. Keep this work local for review; no commit, push, or deployment is authorized by this phase.
