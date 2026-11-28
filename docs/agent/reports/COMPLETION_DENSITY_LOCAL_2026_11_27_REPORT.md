# Phase Report — Compact completion and desktop modal

## Objective

Apply the owner's follow-up locally: remove empty space inside the Hadith/reminder card, increase the screen's top/bottom breathing room, preserve visible available actions, and show desktop completion in a modal with Close. No commit, push, deployment, release-note rewrite or APK installation was performed.

## Scope completed

This is a controlled presentation follow-up within the [completion viewport phase](../phases/COMPLETION_VIEWPORT_LOCAL_2026_11_27.md). It supersedes forced remaining-height card expansion and desktop full-page completion. It preserves reviewed devotional text/sources, deterministic reminder selection, session timestamps, progress, collection/prayer/mode sharing, Continue and offline restart. Independent pending prayer-location, book, Quran, audio, sharing and native changes remain intact.

## Files changed

- Presentation: `src/app/screens/CompletionScreen.css`, `src/app/screens/CompletionScreen.tsx`.
- Shared modal semantics/recovery: `src/app/components/ResponsiveSheet.tsx`.
- Tests: `e2e/completion-reflection.spec.ts`, `src/app/screens/CompletionScreen.sharing.test.tsx`, `src/app/components/ResponsiveSheet.test.tsx`.
- Contracts and handoff: `README.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN_SYSTEM.md`, `docs/QUALITY_CHECKLIST.md`, `docs/agent/DECISION_LOG.md`, `docs/agent/INDEX.md`, the active completion phase, the earlier checkpoint report, this report and the [updated evidence gallery](../evidence/completion-viewport-density/README.md).

The listed tracked files already contained independent or preceding local work. This report describes this follow-up's changes, not ownership of their entire Git diff. No reviewed content file, persistence/schema, synchronization boundary, dependency, workflow or release manifest was changed by this follow-up.

## Components added or modified

CompletionScreen retains its existing Button, CompletionReflectionCard and shared Modal composition. Its desktop check/Close toolbar reuses the existing icon and Button exports; it replaces the in-content phone check rather than duplicating it. ResponsiveSheet's Modal explicitly declares its existing modality and handles an unconsumed Escape from the focused foremost modal when Radix's layer registration has not refreshed yet. Already-handled keys and other top overlays retain ownership.

## User-visible changes

- The reminder card follows its text rather than expanding to fill unused screen height. Automatic vertical quotation margins and the enlarged fallback's blank minimum reading track are removed.
- Ordinary phone/tablet composition is centered within its available height, with at least 1.5rem top/bottom padding and the greater physical bottom inset respected. Its quotation can still scroll independently when needed; source, Benefits and available actions remain visible on ordinary screens.
- At the documented 900px desktop/rail threshold, completion opens as a protected centered modal. Close and Escape return Home without undoing completion. Phone/tablet retain their compact page.
- The desktop check/Close row stays outside scrolling content. At short desktop/200% text, actions and sources remain reachable without passing underneath Close.
- Details and sharing dismiss independently, restore their completion opener and leave the same reminder/session state intact. Core routine continuation and situational New session retain their existing priority/behavior.
- Very short or enlarged narrow pages retain intrinsic scrolling, with a 34rem content-height cutoff after the increased outer padding. No devotional text is clipped, rewritten or reduced to fit.

## Accessibility work

Preserved native labelled quotation scrolling, complete citations, semantic DOM order, RTL/LTR, visible focus, 44px-or-larger targets, scoped completion announcements and both still alternatives. Desktop uses the shared named modal/focus boundary, explicit aria-modal, protected opaque surface and visible 48px Close. Nested Escape closes only the foremost layer once; details/sharing return focus without changing completion geometry. The desktop toolbar avoids a verified enlarged-text overlap. Automated axe, geometry and hit-testing checks pass for the selected feature cases; physical-device/TalkBack/VoiceOver acceptance remains pending.

## Tests added or updated

Units cover the named desktop dialog, unchanged reminder identity, Close-to-Home callback, explicit modal semantics and single-layer nested Escape. The new nested-modal fixture opens the second dialog through a real button, avoiding the invalid simultaneous mounting fixture that hid both dialogs from accessibility queries.

Browser regressions add compact reading-track measurements, ordinary outer padding, desktop modal presence across live resizing, protected/semantic dialog identity, details and sharing focus return, unchanged reminder/dialog geometry, Close/Escape-to-Home, ordinary target hit-testing and 900px/200% text recovery. The final toolbar follow-up hit-tests every scrolled action/source and asserts the content viewport begins below the toolbar. Existing exact-text/source, Arabic Quran/English meaning, ordinary no-scroll, core continuation, optional streak, offline completion/restart and motion/contrast tests remain intact.

## Commands run

| Command                                                                                                                                                                                                                                                                                                                                                                                            | Exact result                                                                                                                                                                                                                                            |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm test:run src/app/screens/CompletionScreen.sharing.test.tsx src/app/completionReflection.test.ts src/app/components/ResponsiveSheet.test.tsx`                                                                                                                                                                                                                                                 | Final pass: 3 files, 28 tests, 4.82s, exit 0.                                                                                                                                                                                                           |
| `pnpm typecheck`                                                                                                                                                                                                                                                                                                                                                                                   | Final toolbar snapshot passed, exit 0. The complete-gate attempt also passed types.                                                                                                                                                                     |
| Targeted `pnpm exec eslint` over CompletionScreen, ResponsiveSheet, their unit files and the changed browser specs, `--max-warnings 0`                                                                                                                                                                                                                                                             | Passed, exit 0.                                                                                                                                                                                                                                         |
| `E2E_BASE_URL=http://127.0.0.1:4393 E2E_REPORT_PATH=output/completion-layout-review/final-density-modal-results.json pnpm test:e2e e2e/completion-reflection.spec.ts e2e/session-completion.spec.ts --project=desktop-chromium --project=desktop-firefox-smoke --project=mobile-webkit-smoke --output=output/completion-layout-review/final-density-modal`                                         | Passed: all 54 cases, 460.48s, no skipped/flaky/failed cases, exit 0.                                                                                                                                                                                   |
| `E2E_BASE_URL=http://127.0.0.1:4395 E2E_REPORT_PATH=output/completion-layout-review/final-toolbar-cross-browser-results.json pnpm test:e2e e2e/completion-reflection.spec.ts --grep 'symmetrical completion\|desktop completion is' --project=desktop-chromium --project=desktop-firefox-smoke --project=mobile-webkit-smoke --output=output/completion-layout-review/final-toolbar-cross-browser` | Passed: 24 responsive/theme/modal cases on the final fixed-toolbar snapshot across all three engines, no skips/flakes/failures, exit 0. These recheck affected cases from the 54-case selection after the toolbar refinement.                           |
| `E2E_BASE_URL=http://127.0.0.1:4393 E2E_REPORT_PATH=output/completion-layout-review/final-shared-modal-results.json pnpm test:e2e e2e/modal-safe-sizing.spec.ts --grep 'sharing respects' --project=desktop-chromium --project=desktop-firefox-smoke --project=mobile-webkit-smoke --output=output/completion-layout-review/final-shared-modal`                                                    | Passed: 18 existing sharing/system-inset/dropdown/focus cases across three engines, exit 0. Shared Modal code is unchanged after this pass.                                                                                                             |
| `pnpm check`                                                                                                                                                                                                                                                                                                                                                                                       | Exit 1, 367.3s: 408 unit files / 2,873 tests passed, one independent book-audit file/test failed; independent lint, format and aggregate bundle findings also failed. Details below. This attempt preceded the final completion-only toolbar placement. |
| `pnpm build:pages` on the final toolbar snapshot                                                                                                                                                                                                                                                                                                                                                   | Vite/PWA generation passed in 7.97s; unchanged total-output budget rejected 12,590,171 bytes against 12,582,912 (7,259 bytes over). Exit 1.                                                                                                             |
| Targeted Prettier over the changed files and `git diff --check`                                                                                                                                                                                                                                                                                                                                    | Passed; no unrelated formatting was applied.                                                                                                                                                                                                            |

The broad feature selection and shared-modal selection represent 72 distinct passing browser cases; the 24 final-toolbar cases are an affected-subset recheck. Original JSON reports/screenshots are retained under `output/completion-layout-review/`. The final preview was built with the repository's isolated loopback browser backend; the 4393 run used a preserved preview directory so an independent build could not replace its chunks. No production user records were used.

Earlier density/modal development failures were diagnosed rather than hidden: the larger padding initially triggered the old short-screen cutoff; percentage/grid sizing collapsed desktop content; the installed shared dialog lacked an explicit aria-modal attribute; newly opened nested dialogs could miss Escape before their layer index refreshed. These were corrected with targeted regressions and the final passes above. A superseded 48-case density-only attempt had one WebKit Benefits lazy-load failure while the shared preview was rebuilding; the preserved final preview and complete 54-case pass subsequently exercise that journey successfully. No test assertion, coverage threshold, engine, timeout, budget or content boundary was weakened.

## Visual/manual evidence

The [sixteen-image actual-app gallery](../evidence/completion-viewport-density/README.md) shows Arabic/English desktop modals, short desktop at 200% text with unobscured Close, compact phone/streak, ordinary narrow phone, tablet, enlarged text, source/details, Continue, offline restart and quotation start/end. Images were copied without editing; [capture-manifest.json](../evidence/completion-viewport-density/capture-manifest.json) records original paths and SHA-256 values. The selected final-toolbar images supersede the earlier absolute-Close captures.

The nineteen-day streak is synthetic test data. The short phone simulates native CSS handoff with 28px top/20px bottom insets; the screen's own minimum bottom padding is 24px. The offline completion image follows a real stopped test-owned origin. These are labelled browser evidence, not physical-device acceptance.

## Documentation updated

README, design, architecture and quality contracts now describe content-sized bounded cards, outer breathing room, desktop modal ownership and fixed check/Close toolbar. The phase brief records both owner corrections and the implementation plan; the decision log and working index retain local/no-push authority. The earlier report/gallery remain available as historical evidence with a link to this superseding follow-up.

## Decisions recorded

The owner's accepted density request supersedes forced card expansion only. Their subsequent desktop-modal requirement supersedes full-page completion at the existing 900px desktop threshold. Preserve all reading/content/progress/sharing contracts and independent working-tree scopes. The latest “continue applying changes locally” instruction authorizes completion of this local follow-up, not publication.

## Known limitations or remaining risks

- Complete-gate attempt: `scripts/audit-learning-book-content.test.mjs:9` detects stale audit/current learning-pack identity; `CollectionShareModal.tsx:8` has an independently introduced unused `FIELD_LABEL_CLASS`; Prettier flags `docs/external-sources/book-presentation.mjs` and `docs/learning/english-wird-source-overrides.json`; total generic output was 12,592,440 bytes against 12,582,912. These findings were left with their independent owners rather than changing unrelated work or raising limits.
- Toolchain, production compilation, TypeScript, audio manifest, Quran/listening/owner timing, type scale, motion rules and CSS utility stages passed in that complete-gate attempt. Failed full-suite execution does not establish a full coverage/release pass. Later targeted lint, types, units and browser checks pass for this phase.
- The final Pages command also failed the existing aggregate-output ceiling after successful compilation/PWA generation. No budget baseline or ceiling was changed, and no unrelated assets were removed to force green.
- Short/enlarged layouts intentionally allow scrolling to retain readable, reachable content. Ordinary phone/tablet layouts remain bounded; desktop scrolling stays within the modal below its toolbar.
- Actual Android safe-area delivery and human assistive-technology acceptance remain pending. No native rebuild/install or release was requested.

## Out-of-scope findings

Preserved all independent prayer-location, books/source-review, Quran/audio, sharing and safe-area work. The global-gate failures above prevent release readiness, while focused completion behavior is independently verified.

## Recommended next step

Review the updated phone and desktop screenshots and exercise the result on the owner's device. Resolve the independently owned repository-gate findings during later consolidation before any separately authorized publication.
