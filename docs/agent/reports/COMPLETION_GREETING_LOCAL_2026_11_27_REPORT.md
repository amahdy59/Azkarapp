# Phase Report — Approved completion greeting and spacing

## Objective

Implement the owner's approved preview locally, then incorporate their additional spacing/checkmark instruction. Use `بارك الله فيك · تقبّل الله منك`, increase breathing room above the greeting, remove the completed-zikr count, move optional streak feedback into Session details, increase spacing steps by 4px and enlarge the completion check. Preserve the compact card and desktop modal with Close. No commit, push, deployment, release-note rewrite or APK installation.

## Scope completed

The [approved phase brief](../phases/COMPLETION_GREETING_LOCAL_2026_11_27.md) records the plan and both owner instructions. This follow-up changes interface wording/presentation only. Reviewed Hadith/Quran text, citations, repetitions, actual completion records, progress calculations, offline behavior, frozen session timestamps, collection/mode/prayer sharing and all continuation/restart actions remain intact. All independent pending work is preserved.

## Files changed

- `src/app/screens/CompletionScreen.tsx`, `src/app/screens/CompletionScreen.css`.
- `src/app/components/CompletionReflectionCard.tsx` — spacing only; exact reviewed text/source rendering remains.
- `src/app/i18n/ar.ts`, `src/app/i18n/en.ts` — one blessing label in each language.
- `src/app/screens/CompletionScreen.sharing.test.tsx`, `e2e/completion-reflection.spec.ts`, `e2e/session-completion.spec.ts`.
- `README.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN_SYSTEM.md`, `docs/QUALITY_CHECKLIST.md`, `docs/CONTENT_AUTHORING.md`, `docs/agent/DECISION_LOG.md`, `docs/agent/INDEX.md`, phase/report and [fourteen-image evidence gallery](../evidence/completion-greeting/README.md).

These tracked paths already contain independent or preceding local changes; this phase does not claim ownership of their complete diff. No dependency, reviewed content catalogue, persistence/schema, synchronization, prayer, native or audio-controller file was changed by this follow-up.

## Components added or modified

CompletionScreen composes the approved greeting, one completed-collection h1, three main layout rows and the existing details/modal/share flows. CompletionReflectionCard receives the requested spacing increases. No component, motion controller, service or runtime dependency is added.

## User-visible changes

- Arabic wishes share one row: `بارك الله فيك · تقبّل الله منك`. English uses “May Allah bless you” and “May Allah accept from you”; long wishes deliberately stack without a dangling separator on narrow surfaces.
- The completed collection is the single visible h1. The completed-count row is removed; underlying records and shared collection items remain unchanged.
- Quiet-progress streak feedback moves into Session details and still honors its preference and absence of records.
- Phone top padding is 32px at ordinary root size. Check-to-greeting spacing is 28px; desktop retains a separate check/Close toolbar and additional greeting clearance.
- Main gaps increase 12→16px, action gaps 8→12px, secondary gaps 4→8px, with the existing header/card spacing steps increased by 4px too.
- Check circle increases 40→56px and its official icon 22→28px. A static semantic gold wash, inset highlight and subtle halo add depth; the existing finite entrance/still alternatives remain the sole animation owner. High contrast, reduced transparency and Forced Colors use a plain finish.
- Ordinary actions remain directly available; very short/enlarged text retains recovery. Long quotation scrolling leaves its source and Benefits action available. Desktop completion still uses the protected modal with unobscured Close.

## Accessibility work

Preserved one semantic h1, complete source-bearing devotional text, labelled keyboard quotation scrolling, scoped status, native buttons, full contextual sharing names, visible focus, RTL/LTR and 44px-or-larger targets. Larger spacing/check geometry is verified at ordinary size; text enlargement is not forced into a fixed line. Details/modal/share focus and dismissal remain unchanged. Existing OS/app motion and transparency/contrast fallbacks remain. Automated browser checks do not establish physical-device or human screen-reader acceptance.

## Tests added or updated

Units verify approved bilingual wording, one collection heading, removed count, hidden main-screen streak, optional details disclosure and preference/empty-record suppression while retaining exact collection/prayer/mode sharing and frozen time tests.

Browser cases verify ordinary paired Arabic wording, clean English wrapping, 32px phone top padding, check-to-greeting clearance, exact 16/12/8px gap steps and 56/28px circle/icon dimensions. Existing no-scroll/action bounds, target hit-testing, exact reviewed text/source, desktop/modal/Close, 200% text, theme/material, finite/still feedback, continuation, optional progress and real-origin outage restart assertions are preserved. The internal quotation-scroll fixture uses a legitimate core routine so its additional Continue action exercises overflow after the count row is removed. Capture waits for existing Quran loading states after responsive remounts rather than retaining a loading frame as evidence.

## Commands run

| Command                                                                                                                                                                                                                                                                                                                                              | Exact result                                                                                                                                                                                                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm test:run src/app/screens/CompletionScreen.sharing.test.tsx src/app/completionReflection.test.ts`                                                                                                                                                                                                                                               | Passed: 2 files / 17 tests. Final spacing checkpoint: 6.72s, exit 0.                                                                                                                                                                                   |
| Targeted ESLint over changed completion/card/unit/browser files, `--max-warnings 0`                                                                                                                                                                                                                                                                  | Passed, exit 0.                                                                                                                                                                                                                                        |
| Targeted Prettier over changed source/tests and `git diff --check`                                                                                                                                                                                                                                                                                   | Passed, exit 0; no unrelated formatting was applied.                                                                                                                                                                                                   |
| Chromium completion/session browser selection during development                                                                                                                                                                                                                                                                                     | Passed all 18 cases after the spacing/check correction, 39.0s, exit 0.                                                                                                                                                                                 |
| `E2E_BASE_URL=http://127.0.0.1:4401 E2E_REPORT_PATH=output/completion-layout-review/greeting-resumed-results.json pnpm test:e2e e2e/completion-reflection.spec.ts e2e/session-completion.spec.ts --project=desktop-chromium --project=desktop-firefox-smoke --project=mobile-webkit-smoke --output=output/completion-layout-review/greeting-resumed` | 53 passed / 1 failed, 796.97s, zero skips. One Arabic Midnight WebKit case reached the 90s timeout during scrollIntoView checking. Follow-up results are recorded below.                                                                               |
| `E2E_BASE_URL=http://127.0.0.1:4403 E2E_REPORT_PATH=output/completion-layout-review/greeting-webkit-fresh-origin-results.json pnpm test:e2e e2e/completion-reflection.spec.ts --grep 'symmetrical completion ar midnight ' --project=mobile-webkit-smoke --output=output/completion-layout-review/greeting-webkit-fresh-origin`                      | Passed the remaining case against identical preserved build bytes on a fresh local origin: 1 passed, 27.7s, exit 0. No code/assertion/timeout change. All 54 distinct feature cases are therefore verified, with the earlier timing failures retained. |
| `pnpm check`                                                                                                                                                                                                                                                                                                                                         | Exit 1, 387.2s. 408 unit files / 2,881 tests passed; 4 files / 5 tests failed outside this phase. Independent type, lint, format and aggregate bundle stages also failed. Details below.                                                               |
| `pnpm build:pages`                                                                                                                                                                                                                                                                                                                                   | Vite/PWA generation succeeded in 11.47s; unchanged total-output budget rejected 12,599,154 bytes against 12,582,912 (16,242 bytes over). Exit 1.                                                                                                       |

Logs and original screenshot artifacts are under `output/completion-layout-review/`, including `greeting-check.log`, `greeting-pages.log` and `greeting-resumed-browser.log`. The final browser preview uses a preserved build directory and isolated loopback backend, so independent application builds cannot replace its chunks. A preceding combined run was interrupted before writing its final JSON and is not claimed as a complete pass.

The first isolated repeat on port 4401 timed out during initial route loading rather than scrolling. A second reproduction changed only the test-owned serving origin to port 4403, retained the same build and assertions, and passed the complete case in 26.6s (27.7s command total). This supports an intermittent local WebKit loading/timing limitation; it is not presented as a consistently green combined matrix. Other tasks' browser processes were inspected read-only and were not stopped or modified.

## Visual/manual evidence

The [fourteen-image actual-app gallery](../evidence/completion-greeting/README.md) covers Arabic/English phone, Arabic/English desktop modal, enlarged desktop, optional streak inside details, simulated-inset quotation start/end, narrow/enlarged text, tablet, Continue and real-origin outage restart. Images are copied without editing; [capture-manifest.json](../evidence/completion-greeting/capture-manifest.json) records original paths and SHA-256 values. The nineteen-day streak is synthetic fixture data; the short-phone native CSS insets are simulated (28px top/20px bottom). No production user data was used.

The generated comparison is a design reference, separate from actual-app evidence. The owner's selection is recorded in the phase and decision log; the app retains its own fonts/icons and exact reviewed quotations.

## Documentation updated

README, design, architecture, quality and content-authoring contracts record the approved interface goodwill, spacing/check changes, removed count and optional details-only streak. The decision log, index, phase brief and this report preserve the local-only scope and evidence boundaries.

## Decisions recorded

The owner explicitly approves the recommended blessing/acceptance depiction, then asks for consistent 4px spacing increases and a larger, more interesting check. This supersedes the earlier Masha'Allah headline/main count/main streak presentation only. The greeting is interface goodwill, not a prescribed completion dhikr or an assertion that acceptance is assured. Source discussion and URLs are preserved in the phase brief; reviewed religious content remains unchanged.

## Known limitations or remaining risks

- The combined browser selection retains one WebKit timeout, with another initial-load timeout during isolated reproduction; the identical-case fresh-origin reproduction passes. All 54 distinct feature cases have passing evidence, but local WebKit timing remains an explicit limitation. No timeout/assertion was increased, skipped or weakened to hide failures.
- Complete-gate type failure: independently modified `LearningDiagram.tsx:89` passes a possibly undefined string to an overloaded function.
- Complete-gate lint failures: independent `CollectionShareModal.tsx:8` unused `FIELD_LABEL_CLASS` and inline bilingual copy in `LearningDiagram.tsx`.
- Formatting: `scripts/render-umrah-source-review.mjs` was flagged and left to its independent owner.
- Full-suite failures: book-audit identity mismatch; two KhatmahReaderScreen magnification/control assertions; a Mushaf offline-cache case; a QuranListeningReader magnification/keyboard-pane assertion. These are outside this change. This phase does not claim a complete coverage/release pass.
- Generic output was 12,602,307 bytes against 12,582,912. Pages compilation/PWA generation succeeds but the total-output ceiling also fails. No budget baseline/ceiling was changed or unrelated asset removed.
- Actual Android system-inset delivery, TalkBack/VoiceOver and physical-device acceptance remain pending. Short/enlarged layouts intentionally retain scrolling to keep text/actions reachable.

## Out-of-scope findings

Independent learning, Quran/audio, sharing, prayer-location and native changes were preserved. Their repository-gate failures remain separate consolidation work rather than being changed as part of this completion presentation task.

## Recommended next step

Review the updated actual phone/desktop screenshots and exercise the result on the owner's device. Retain the local-only boundary; resolve independent repository-gate findings before any later authorized publication.
