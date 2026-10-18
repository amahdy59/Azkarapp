# Phase Report — Reader surface and collapsed sidebar

## Objective

Repair the owner's highlighted abrupt reading-panel edges and start collection navigation collapsed. Local only; do not push.

## Scope completed

Inspection found an unrounded glass-reading surface immediately beneath the rounded hero, plus an initially true visit-local sidebar flag. The plan was to reuse shared 16px corners and the existing sidebar state boundary, retain all interactions, update regressions and inspect actual screenshots. No planning approval gate was requested.

## Files changed

ReaderScreen.tsx; ReaderScreen.audio.test.tsx; reader-collection-panel, reader-guidance-layout, reader-microinteractions, audio-expanded-layout, audio, devotional-footer, quran-translation and quran-listening browser specs; DESIGN_SYSTEM.md; DECISION_LOG.md; INDEX.md; this report. Other pending workspace changes are preserved.

## Components added or modified

ReaderScreen only. No new component or dependency.

## User-visible changes

Tablet/desktop reading surfaces have rounded corners that contain their material and highlight. The collection panel starts collapsed on each Reader mount. Its existing toolbar control opens it; explicit resizing, width restoration and drawer behavior remain available. Reading measure, counters and reviewed text are unchanged.

## Accessibility work

Retain the labelled expanded/controls toggle, focus recovery, keyboard splitter and modal drawer. Hidden navigation remains outside keyboard order. Existing Arabic/English and enlarged-text coverage is retained. Automated checks do not establish complete accessibility compliance.

## Tests added or updated

Initial collapsed state and absent splitter; explicit opening before navigation/resize assertions; computed corners, hero clearance, counter visibility and overflow in Glass/Opaque at 820/1440px; preserved open/closed footer/audio coverage. Translation/listening checks now assert the intended full-width initial state.

## Commands run

| Command                                                                                          | Exact result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Targeted Reader unit suite (audio, surah, Mushaf parity)                                         | 3 files, 72 tests passed; 104.82s. output/reader-surface-units.log. Initial development run found one Play All fixture still assuming an open panel; corrected its explicit open step.                                                                                                                                                                                                                                                                                                      |
| pnpm test:e2e reader-collection-panel + reader-guidance-layout, desktop-chromium (E2E_PORT=4194) | 6 passed, 2.6 minutes.                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| pnpm test:e2e reader-collection-panel, Firefox/WebKit                                            | Firefox: all 4 passed. WebKit: both material/geometry cases passed; Both Arabic/English resize/drawer cases exceeded the unchanged 90-second test timeout (Arabic while waiting for the reopened toggle to become stable). Total: 6 passed, 2 failed, 8.5 minutes. Final run details: output/reader-surface-engines.log.                                                                                                                                                                    |
| pnpm check                                                                                       | Failed in 420.7s in concurrent Progress work: formatter could not read the removed PrayerProgressTracker files; unit collector could not find its removed test; key integrity reported 3 missing PrayerProgressSummary keys; ProgressScreen matched multiple Past day labels. 285 test files/2035 tests passed, 3 files/2 tests failed. Toolchain, types, build, lint, content/audio/timing validation, type scale, motion, bundle and CSS budgets passed. output/reader-surface-check.log. |
| Targeted Prettier check of all changed code/test files and this report                           | Passed. output/reader-surface-format.log.                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| git diff --check                                                                                 | Passed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

No assertion, timeout, coverage threshold or budget was weakened. No full browser release matrix or deployment was run for this local-only change. Concurrent work changed files during verification, so this is not a frozen whole-workspace quality pass. A final diff also reveals a concurrent ReadingHeroToolbar integration in ReaderScreen, added after this phase’s initial browser captures. It is preserved, belongs to the other phase and means these screenshots/results cannot certify the final combined header composition. On the owner’s continuation, one fresh single-worker WebKit run verifies that combined header and the Reader interactions; see the continuation evidence below. No fourth overlapping full quality run is added.

## Visual/manual evidence

Browser tests captured default collapsed, rounded Glass/Opaque, expanded/resized and phone drawer screenshots. Preserved evidence: output/playwright/reader-surface/glass-desktop.png, solid-desktop.png and expanded-arabic.png. Visually inspected the Glass collapsed canvas and expanded Arabic sidebar: material highlights follow the rounded boundary, the text measure remains centered, and all footer/header controls remain visible. The Glass preview was also displayed in chat.

## Documentation updated

Design system, decision log, index and this phase report document the new default and local-only authority. Release notes stay unchanged because publication is withheld.

## Decisions recorded

The owner's request supersedes the initially expanded desktop collection navigator. No persisted or synchronized field changes.

## Known limitations or remaining risks

Each Reader mount resets the sidebar to collapsed; its explicit choice remains visit-local. Physical-device and human screen-reader acceptance remain separate. Full quality verification includes unrelated pending work in this shared workspace and is currently blocked by the Progress failures listed above. The initial WebKit resize/drawer timeouts were cleared by a fresh single-worker run: both Arabic and English cases pass with unchanged assertions and 90-second timeout. Chromium and Firefox also cover those interactions successfully.

## Out-of-scope findings

Existing Home, material, prayer and Progress edits are outside this phase.

## Recommended next step

Review the local result; keep publication withheld until explicitly requested.

## Continuation verification — 2026-10-18

The owner requests continuing locally. Preserve the concurrent compact ReadingHeroToolbar integration; no additional application change is necessary. A fresh production browser build and single-worker WebKit run on port 4287 exercise the combined layout. All six checks pass in 8.4 minutes: both Glass/Opaque geometry cases, both Arabic/English resizing, keyboard, focus, drawer and axe cases, and both guidance cases including 200% text. Exit code 0; unchanged assertions and timeouts. Log: output/reader-continuation-webkit.log; separate JSON: output/reader-continuation-results.json.

Preserved and visually inspected current evidence: output/playwright/reader-surface/glass-desktop-current.png, expanded-arabic-current.png and phone-drawer-current.png. The desktop preview was displayed in chat. Existing rounded corners/default collapse remain intact, as does git diff --check.

Three other full checks were active at inspection. The concurrent Progress quality run (output/progress-statistics-quality.log) later reports 2034 passing tests and six failures in ProgressScreen.wirdGoal/App.composition plus its PrayerProgressSummary lint stage; formatting/build/budgets pass. The Progress component’s lint repair is already visible from its owning task. These evolving unrelated results do not establish a frozen complete quality pass; do not expand this Reader phase into unrelated Progress/initialization repairs without an owner decision. No commit, push, deployment or release-note change.
