# Phase Report — Compact mobile Mushaf translation, 2026-10-11

## Objective

Apply the owner's revised mobile recommendations locally: replace the Surah/Juz selector with Arabic/English choices when English meaning is enabled, remove the extra language row, preserve the reading surface, and provide an explicit exit. No commit or push.

## Scope completed

Inspected the paired-page contract, selector CSS, mobile controls, translation panel, page fitting, state ownership and tests. Plan before editing: use a single shared opaque toolbar in the existing top-control space; keep both panes mounted to preserve their reading positions; restore the index on exit; retain native radio semantics, reviewed content, playback and page navigation. Implement, add regression coverage and verify locally.

## Files changed

- `src/app/components/MushafTranslationControls.tsx` and its new unit tests.
- `src/app/screens/KhatmahReaderScreen.tsx` and its unit suite.
- `src/app/components/MushafPageViewer.tsx`: inherited measured top-control clearance only; concurrent edits preserved.
- `src/app/components/QuranPageTranslationPanel.tsx` and its unit suite: localized retry and status recovery.
- `src/app/components/quran-listening-translation.css` and both i18n dictionaries.
- `e2e/quran-translation-layout.spec.ts` and `e2e/quran-translation.spec.ts`.
- Design system, decision log, agent index and this report.

## Components added or modified

MushafTranslationControls is a presentation-only native radio/exit group. Screen orchestration owns pane selection and mode exit. Existing MushafPageViewer and QuranPageTranslationPanel remain the content surfaces. No dependency, persisted schema, religious wording or pagination changes.

## User-visible changes

Enabling page meaning opens English and dismisses the options sheet. On compact surfaces, one toolbar replaces the index control without a separate language strip. Back and More remain available in both panes. Arabic selection retains translation mode; the visible X exits and restores Arabic/index, with keyboard focus recovery. Both pane scroll positions survive switching. Language autonyms stay recognizable in either interface language. Enlarged controls wrap with measured clearance rather than splitting language names or covering content. Translation unavailable/loading states preserve Arabic recovery and offer retry. Existing difficult-word controls keep their separate function.

## Accessibility work

Native labelled radio group, keyboard selection, language/direction metadata, 44px minimum language/exit targets, visible focus, selection underline plus surface treatment, opaque semantic toolbar and adaptive clearance. English text, native scrolling, source attribution, magnification and reduced-motion behavior remain intact. Physical-device cutout checks and TalkBack/VoiceOver remain human verification requirements; no complete WCAG compliance claim.

## Tests added or updated

Screen regression covers replacing the index, one More action, English-first selection, same-page switching, retained scroll position, explicit exit and restored focus. Selector tests cover native keyboard selection/exit in both interface languages. Panel regression covers failed-fetch retry. Browser tests measure reading-height preservation, 320/390/430px containment, 200% text, minimum targets, pane scroll continuity, focus and toolbar axe. Existing desktop paired geometry and keyboard scrolling assertions remain unchanged. Browser setup now waits for automatic options dismissal instead of sending a second Escape that would leave the reader.

## Commands run

| Command                                                                                                            | Result                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm test:run src/app/screens/KhatmahReaderScreen.test.tsx src/app/components/QuranPageTranslationPanel.test.tsx` | Final run: 43 passed across 2 files.                                                                                                                                                                                 |
| `pnpm test:run src/app/components/MushafTranslationControls.test.tsx`                                              | 2 passed.                                                                                                                                                                                                            |
| Targeted ESLint and Prettier checks                                                                                | Passed on feature implementation and browser tests before final setup-only browser changes.                                                                                                                          |
| `pnpm typecheck`                                                                                                   | Passed before final test/documentation changes; final rerun recorded below.                                                                                                                                          |
| `pnpm build:pages`                                                                                                 | Passed, including unchanged bundle ceiling and CSS utility verification.                                                                                                                                             |
| `pnpm check`                                                                                                       | Failed in 418.8 seconds: lint and unit stages. 1714 unit tests passed, 3 failed. Build, toolchain, typecheck, format, audio/content timing checks, type scale, motion rules, bundle budget and CSS utilities passed. |
| First Chromium translation browser run                                                                             | 5 passed / 1 failed. The new scroll-continuity case sampled an in-progress native PageDown animation; corrected setup uses an instant deliberate scroll before comparing the same position.                          |
| Intermediate Chromium/Firefox run                                                                                  | Canceled after automatic menu dismissal made its old Escape setup navigate out of the reader. Setup corrected without weakening content or geometry assertions.                                                      |

## Visual/manual evidence

Inspected phone and 320px/200% screenshots from `output/playwright/mobile-translation-toggle/`. Inspection caught split language lettering at enlarged text, corrected through reflow. Final screenshots/results are retained under `output/playwright/mobile-translation-toggle-verified/` and recorded below. Desktop browser emulation is not physical Android/iOS or assistive-technology evidence.

## Documentation updated

Design-system anatomy, owner decision, agent index and this phase report. Earlier paired-page content and wide-frame contracts remain intact.

## Decisions recorded

Owner explicitly approved the revised recommendations locally and withheld pushing. Native pane choice does not change application language. Exit turns translation mode off; Arabic selection only changes the pane. Wide paired meaning retains its existing behavior.

## Known limitations or remaining risks

The workspace changed concurrently during verification, including sharing, content/fonts, Library and tooling files. Broad quality results therefore describe a changing combined workspace, not a release-ready feature snapshot. The broad lint run reported undefined `fetch`/`AbortSignal` in concurrently added `scripts/prepare-imran-passage.mjs`; unit failures included concurrent AyahShareStudio work and the earlier version of this phase's new screen fixture. The final 43-test feature run resolves the screen fixture. No unrelated edits were reverted, tests suppressed, budgets raised, receipts fabricated or deployment attempted.

## Out-of-scope findings

Concurrent uncommitted work is preserved. Full merge/release verification is withheld until the complete workspace settles and passes its gates.

## Recommended next step

Review on the owner's mobile device, complete TalkBack/VoiceOver and safe-area checks, then run the full combined quality/release gates after pending work is stable and publication is authorized.

## Verification follow-up

- Final feature units: **45 passed** (43 screen/panel tests and 2 native selector keyboard cases).
- Final `pnpm typecheck`: passed. Feature ESLint and scoped formatting checks passed.
- `pnpm build:pages`: passed, including bundle and CSS checks.
- Chromium/Firefox layout run: **11 passed / 1 failed**; the remaining new Chromium scroll-continuity case still sampled an unfinished native PageDown animation. Removed PageDown from this continuity setup and require the deliberately selected 240px scroll position before switching; existing native PageDown/End behavior tests remain intact. The final three-engine rerun is recorded below.
- Offline/theme/audio run: `pnpm test:e2e e2e/mushaf-mobile-translation-mode.spec.ts e2e/quran-translation.spec.ts --grep 'Compact mode|Main Mushaf' --project=desktop-chromium --project=desktop-firefox-smoke --workers=1` — **4 passed in 6.4 minutes**. Arabic retained all fifteen slots while offline, missing translation retried, exit restored focus, toolbar axe passed Light/Dark/Midnight, and main Mushaf audio following/manual recovery remained correct.
- Inspected `output/playwright/mobile-translation-recovery/` Arabic-preserved and theme captures plus the enlarged selector screenshot under `output/playwright/mobile-translation-toggle-verified/`. Explicit LTR toolbar placement preserves the existing physical Back/More positions in an RTL interface.
- Added `e2e/mushaf-mobile-translation-mode.spec.ts` for offline recovery and all-theme toolbar scans.

## Final local result

The three-engine production-preview layout run completed with **16 passed / 2 Arabic WebKit timeouts** in 17.5 minutes. Both timeout traces were inspected: the enlarged-text case completed assertions and timed out at its final screenshot; the combined width matrix reached the last width before exhausting its 90-second test budget. The new matrix is now parameterized by width, preserving all 320/390/430px, 100%/200%, target, containment, screenshot, scroll, geometry and exit assertions. No timeout increase, skip or relaxed assertion.

The isolated rerun against the same production artifact used `E2E_BASE_URL=http://127.0.0.1:5282` and `pnpm test:e2e e2e/quran-translation-layout.spec.ts --grep 'English.page..ar..*Compact' --project=mobile-webkit-smoke --workers=1 --output=output/playwright/mobile-translation-webkit-isolated`: **4 passed in 1.5 minutes**, including the previously timed-out enlarged case and each split width. Together with the prior run this supplies passing evidence for every intended layout scenario in Chromium, Firefox and WebKit; the original combined run remains recorded as failed. The initial isolated selector command matched no tests because Windows argument escaping doubled the regex escapes; the corrected selector ran all four intended cases.

Final scoped ESLint/Prettier and `git diff --check` passed. Final Arabic/English phone screenshots were inspected in `output/playwright/mobile-translation-final-review/`; isolated WebKit evidence is in `output/playwright/mobile-translation-webkit-isolated/`. The preview server is stopped at handoff. Physical device/screen-reader evidence and a successful stable combined-workspace gate remain outstanding. No commit, push, release notes, workflow or production changes were made.
