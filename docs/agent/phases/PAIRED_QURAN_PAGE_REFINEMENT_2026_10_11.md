# Phase Report — Paired Quran page refinement, 2026-10-11

## Objective

Apply all owner-approved screenshot recommendations locally, with independently scrollable English, coordinated Arabic/English geometry and accessible responsive reading. No commit, push, deployment or release-note changes.

## Scope completed

Inspected the current reader, page frame, English text roles, following state and established design/content contracts. Plan stated before editing: constrain the translation column, preserve canonical Arabic overflow, match page bands/margins, align verse-number gutters, unify English typography, clarify metadata, soften glossary/divider emphasis, expose follow resumption and provide a native compact pane selector. Add regression tests and verify locally.

## Files changed

- Presentation: `QuranTranslationText.tsx`, `QuranPageTranslationPanel.tsx`, `QuranListeningTranslation.tsx`, `quran-listening-translation.css`, `MushafPageViewer.tsx`, `MushafQuickMenu.tsx`, and `src/styles/theme/layout.css`.
- Screen/playback orchestration: `KhatmahReaderScreen.tsx` and `QuranListeningReader.tsx`.
- Copy: `src/app/i18n/ar.ts` and `en.ts`.
- Tests: `QuranPageTranslationPanel.test.tsx`, `QuranListeningTranslation.test.tsx`, and `e2e/quran-translation-layout.spec.ts`.
- Owner-authorized audio lint repairs: `FloatingAudioPlayer.tsx`, `FloatingAudioPlayer.test.tsx`, and the programmatic-focus fixture in `QuranListeningReader.test.tsx`.
- Documentation: architecture, design system, agent index, decision log and this report.

## Components added or modified

Reused controlled translation/page components and existing playback owners. Added a native radio selection for compact Arabic/English panes and explicit compact page navigation. No runtime dependency, persistence field or replacement design system.

## User-visible changes

English headings and attribution stay outside the scrolling text. Page frames and body bands align with Arabic, English verse numbers occupy a fixed gutter accommodating three digits, and shared 18/20/24px relative typography uses 1.65 leading and a bounded measure. A softer divider ends at the furniture bands. Glossary words use normal ink and dotted accent underlines; selected/spoken words remain distinct without changing glyph geometry. Translation is available at compact widths and magnification through labelled native pane choices. Compact page navigation uses labelled arrows so enlarged labels cannot crowd the footer; Back and reading options remain reachable. Manual translation browsing pauses following, with explicit resumption where timing exists. Reviewed wording and canonical fifteen-line pagination remain untouched.

## Accessibility work

Named keyboard-reachable native scroll regions, isolated English language/direction, visible focus, full labelled radio pointer targets, native radio keyboard interaction, selectable English text, scalable typography, reflow and source attribution. Scrolling keys in the English region do not turn the Mushaf page. Existing Arabic overflow remains available for short or enlarged views. Automated axe and emulated keyboard checks do not establish complete WCAG compliance.

Audio elapsed/total time labels now use screen-reader text rather than prohibited labels on roleless spans. The audio resume-test fixture remains programmatically focusable without adding a noninteractive element to the Tab sequence. No ticker live region or lint suppression was introduced.

## Tests added or updated

Unit tests cover English type steps, heading semantics, manual-browse callbacks and localized resumption. New browser tests in both interface languages assert equal frames/body starts, stationary Arabic and parent scroll while English scrolls, fixed verse-number alignment, native keyboard ownership, compact pane selection, 320/390px containment at 200% text, complete Arabic slots and short-window attribution. Existing audio-following, hidden playback and magnification suites remain intact.

## Commands run

| Command                                   | Result                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm run verify:toolchain`               | Passed: Node 24.x / pnpm 11.19.0.                                                                                                                                                                                                                                                                                                                                        |
| Focused four-file component/screen Vitest | 66 passed before final additional resumption coverage.                                                                                                                                                                                                                                                                                                                   |
| Initial `pnpm typecheck`                  | Passed.                                                                                                                                                                                                                                                                                                                                                                  |
| Initial desktop translation browser run   | 6 passed; 2 new selector cases exposed intercepted radio pointer targets. Corrected the actual control rather than forcing clicks.                                                                                                                                                                                                                                       |
| Initial `pnpm check`                      | All other stages passed; CSS budget failed at 28,689 gzip bytes against 28,672. Removed redundant translation selectors/declarations; ceiling remains unchanged.                                                                                                                                                                                                         |
| Focused six-file Vitest rerun             | 6 files / 114 tests passed; includes the authorized audio repairs.                                                                                                                                                                                                                                                                                                       |
| Targeted ESLint                           | Passed across the 13 affected component/screen/test files.                                                                                                                                                                                                                                                                                                               |
| Final `pnpm typecheck`                    | Passed.                                                                                                                                                                                                                                                                                                                                                                  |
| `pnpm build:pages`                        | Passed, including the unchanged bundle ceilings after removing redundant global utilities.                                                                                                                                                                                                                                                                               |
| Full `pnpm check` during concurrent edits | Failed: 1670 tests passed / 3 failed in concurrent Settings/i18n work; unrelated Settings lint/format failures. The audio fixture lint failure was subsequently repaired. The recorded CSS-budget failure was subsequently cleared by the Pages build. See `output/playwright/paired-quran-pages/check.log`; this is not a green full-gate claim.                        |
| Final browser/navigation verification     | 4 passed (Chromium/Firefox, both UI languages); 2 WebKit cases exceeded the existing 90-second timeout. Arabic case stalled retrieving Arabic geometry after English PageDown; English case stalled activating the compact radio after desktop assertions. Subsequent split-suite WebKit rerun passed all four cases; see follow-up below. Traces and JSON are retained. |

Final navigation-only rerun: `pnpm test:run src/app/screens/KhatmahReaderScreen.test.tsx` — 37 passed. Final screen/spec ESLint and scoped Prettier checks passed. The six-file run used:

```bash
pnpm test:run src/app/components/QuranPageTranslationPanel.test.tsx src/app/components/QuranListeningTranslation.test.tsx src/app/components/MushafPageViewer.test.tsx src/app/screens/KhatmahReaderScreen.test.tsx src/app/components/FloatingAudioPlayer.test.tsx src/app/components/QuranListeningReader.test.tsx
```

The isolated final browser run uses `E2E_BASE_URL=http://127.0.0.1:5192` and `pnpm test:e2e e2e/quran-translation-layout.spec.ts --workers=1 --output=output/playwright/paired-quran-pages/isolated-tests`. Its build is kept separate from the shared `.playwright-dist`; no repository browser infrastructure or timeout was changed. The subsequent WebKit timeout investigation and passing rerun are recorded below.

## Visual/manual evidence

Browser screenshots cover both languages, wide pages, independent scrolling, narrow/enlarged English and short windows. Desktop fallback and 320px/200% screenshots visually inspected during implementation. A separate real QCF-v2 rendering of page 3 was loaded and visually inspected in `output/playwright/paired-quran-pages/primary-desktop.png`. All artifacts are retained under ignored `output/playwright/paired-quran-pages/`. Browser tests deliberately block the external QCF font for deterministic offline-fallback geometry; screenshots use CSS-pixel scale.

## Documentation updated

Architecture records scroll and callback ownership. Design system records coordinated geometry, typography, emphasis and compact choices. Decision log records the owner's local-only approval, superseding smaller page typography and desktop-only translation availability. Agent index identifies this phase.

## Decisions recorded

Match page frames and top/body/footer bands rather than forcing individual Arabic/English verses into equal-height rows. Preserve reviewed content and printed page data. Use existing following state, native scrolling/radios and semantic tokens. Publication remains withheld.

## Known limitations or remaining risks

Physical-device rendering and human assistive-technology checks remain separate manual evidence. The complete workspace quality gate cannot be certified while concurrent Settings changes have failing tests/lint/format checks. No assertion, coverage threshold or bundle ceiling was reduced.

## Out-of-scope findings

Concurrent Settings, audio, reader and previous release-report edits appeared during verification and were preserved. The owner explicitly authorized the audio lint repairs after clarification; unrelated Settings implementation/tests were left to that ongoing work. No commit, push, publication or release-note changes were made for this phase.

## Recommended next step

Owner review of the local paired reading page, followed by physical-device and assistive-technology verification before separately authorized publication.

## WebKit follow-up verification

The retained traces showed slow setup/browser calls exhausting the combined 90-second scenario, rather than an assertion demonstrating an application regression. Split each interface-language scenario into desktop geometry/keyboard/axe and compact enlarged-text/short-window tests with shared setup. Every assertion, native pointer action, accessibility scan, screenshot, and the existing 90-second timeout remains. No application code changed in this follow-up.

Built with `pnpm exec vite build --outDir output/playwright/paired-quran-pages/webkit-diagnosis-dist` and served the isolated output on unused port 5297. Ran with `E2E_BASE_URL=http://127.0.0.1:5297`:

```bash
pnpm test:e2e e2e/quran-translation-layout.spec.ts --project=mobile-webkit-smoke --workers=1 --output=output/playwright/paired-quran-pages/webkit-diagnosis-tests
```

Result: **4 passed (3.9m)**. Arabic desktop 84 seconds, Arabic responsive 47.7 seconds, English desktop 54.1 seconds, English responsive 40 seconds. JSON evidence: `output/playwright/paired-quran-pages/webkit-diagnosis-results.json`. Targeted ESLint passed for the changed spec. No timeouts increased, assertions removed, forced clicks or skipped engine checks.

Chromium/Firefox split-suite verification:

```bash
pnpm test:e2e e2e/quran-translation-layout.spec.ts --project=desktop-chromium --project=desktop-firefox-smoke --workers=1 --output=output/playwright/paired-quran-pages/split-desktop-tests
```

Result: **8 passed (1.9m)** on the same isolated build/port. JSON: `output/playwright/paired-quran-pages/split-desktop-results.json`. Combined final engine coverage is **12 passed**: four each in Chromium, Firefox and WebKit, covering both interface languages. The WebKit 320px/200% screenshot was visually inspected. The earlier WebKit blocker is resolved; no application repair was necessary. Only this report and `e2e/quran-translation-layout.spec.ts` changed during the follow-up. No commit or push was performed.
