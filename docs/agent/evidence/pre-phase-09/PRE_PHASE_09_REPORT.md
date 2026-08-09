# Phase Report — Pre-Phase-09 UI fix-list closure

> Status: implementation and every mandatory local release gate are complete. The published commit's GitHub workflow, deployment, and production-smoke conclusions are recorded in the release handoff.

## Objective

Resolve the user-supplied desktop/mobile UI fix list completely before starting Phase 09, without changing reviewed devotional text, breaking offline reading/progress, or weakening accessibility and deployment gates.

## Scope completed

Implementation is present for all numbered backlog items:

- Home contrast, Morning/Evening/Before Sleep/Friday context, responsive Masbaha entry, and the two-row compact utility header.
- Home-only photography plus a bounded, accessibility-aware tonal texture on non-Home page backgrounds.
- Desktop Library search/filter composition, explicit labels, RTL input behavior, and submit/text-driven Search navigation.
- Responsive Friday Mode, reviewed Mushaf page boundaries, long-vs-short-surah counter behavior, simplified final action, weekly contribution progress, and blessing feedback.
- Home Benefits and Saved sections, WhatsApp benefit sharing, Reader/custom-counter consistency and optional click sound, the released desktop counter/nav fixes, and positive Before Sleep checklist feedback.
- Visible Arabic and English onboarding skip actions for pointer and keyboard users, honest three-state Al-Kahf coverage, and a tracked tablet screenshot matrix.

The item-by-item implementation ledger is `docs/agent/UI_FIX_BACKLOG.md`. Final completion remains conditional on the gates and evidence below.

## Files changed

Implementation currently spans:

- Application composition/state: `src/app/App.tsx`, `src/app/types.ts`, `src/app/state.ts`, `src/app/fridayProgress.ts`, and their updated tests
- Shared UI/hooks: `src/app/components/ScreenContainer.tsx`, `src/app/components/TasbeehCounterButton.tsx`, `src/app/components/MushafPageReader.tsx`, `src/app/hooks/useCounterClickFeedback.ts`, `src/app/hooks/useZikrCounter.ts`
- Content structure: `src/app/content/azkar.ts`, `src/app/content/fridayKahf.ts`, `src/app/content/mushafPages.ts`, `scripts/generate-friday-kahf.mjs`
- Screens: `HomeScreen.tsx`, `AzkarLibraryScreen.tsx`, `SearchScreen.tsx`, `FridayModeScreen.tsx`, `ReaderScreen.tsx`, `CategoryScreen.tsx`, `CustomCounterScreen.tsx`, and new `BenefitsScreen.tsx`
- Product copy/theme: `src/app/i18n/ar.ts`, `src/app/i18n/en.ts`, `src/app/formatting.ts`, `src/styles/theme.css`
- Unit/browser coverage colocated with those modules plus `e2e/accessibility.spec.ts`, `e2e/navigation.spec.ts`, `e2e/search.spec.ts`, `e2e/reader-microinteractions.spec.ts`, `e2e/counter-feedback.spec.ts`, and `e2e/pre-phase-nine.spec.ts`
- Evidence: the 12 tracked current browser-baseline PNGs under `docs/agent/evidence/screenshots/current/`, refreshed by the passing evidence-capture suite
- Documentation: `docs/CONTENT_AUTHORING.md`, `docs/agent/DECISION_LOG.md`, `docs/agent/UI_FIX_BACKLOG.md`, and this report

## Components added or modified

- Added `BenefitsScreen` and its reviewed-content WhatsApp URL builder.
- Added `MushafPageReader` and structural page-splitting helpers.
- Added shared `useCounterClickFeedback` and wired it to Reader and custom counter.
- Modified Home, Library/Search, Friday, Reader, Category/Before Sleep, Custom Counter, and responsive Masbaha entry components.
- Modified application navigation to preserve the Saved destination, seed Search queries, and open Benefits.
- Added a common non-Home page-surface texture hook while keeping content cards opaque.

## User-visible changes

- Home switches its hero background to Friday on Friday, presents a two-row compact header, previews saved zikr, and opens Benefits.
- Library search no longer navigates on focus; desktop search and filters share one row; Arabic inputs begin from the right; Search opens with the entered query.
- Friday Mode reflows by viewport, shows weekly progress feedback, and removes the final CTA's supporting sentence.
- Long surahs render as separated Mushaf pages and reveal the explicit counter only after the final page; short surahs retain tap-anywhere counting.
- Reader and custom counter expose the same easy mute/unmute preference and restrained click feedback.
- Completing all Before Sleep preparation steps produces visible and announced positive feedback.
- Onboarding exposes its existing localized skip action visibly instead of restricting it to assistive technology.

## Accessibility work

- Kept visible, associated input labels and natural direction for Arabic/Latin search text.
- Preserved semantic tab/radio/button behavior, 44px minimum control targets, keyboard activation, and visible focus rings.
- Added progress/status semantics for Friday and Before Sleep without turning whole screens into live regions.
- Suppressed decorative texture for high contrast, reduced transparency, and the platform reduced-transparency preference.
- Kept long-surah Quran text separate from the counter activation target and preserved ordinary short-surah keyboard/pointer behavior.
- Made onboarding dismissal reachable by pointer and keyboard with a visible focus ring and a 44px minimum target.
- Complete WCAG 2.2 AA compliance is not claimed from automation alone; existing manual screen-reader, device safe-area, and other human evidence requirements remain in `docs/QUALITY_CHECKLIST.md`.

## Tests added or updated

- Home background/header/Saved/Benefits rendering tests.
- Benefits content, locale, navigation, and WhatsApp-link tests.
- Library/Search label, focus, query, desktop layout, and RTL-direction tests.
- Mushaf metadata, contiguous splitting, byte-for-byte reconstruction, page rendering, and long-vs-short-surah interaction tests.
- Friday weekly-dua progress and completion-state tests.
- Counter sound persistence, safe fallback, shared counting callback, responsive geometry, and keyboard-guard tests.
- Before Sleep preparation progress and reversible completion-feedback tests.
- Onboarding visible-skip pointer/keyboard coverage and Al-Kahf Not started/In progress/Completed regression coverage.

The final local gate contains 67 Vitest files / 356 tests and 307 Playwright tests across desktop, mobile, tablet, and cross-browser smoke projects.

## Commands run

| Command                                     | Result                                                                                                              |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`            | **Passed — lockfile-frozen install completed in 6.7 seconds**                                                       |
| `pnpm check`                                | **Passed — format, lint, type, audio, 67 Vitest files / 356 tests, coverage, production build, and bundle budgets** |
| `pnpm test:e2e`                             | **Passed — 307/307 in 11.3 minutes across desktop, mobile, tablet, Firefox, and WebKit projects**                   |
| `pnpm build:pages`                          | **Passed — 1,889 modules built, 127-entry PWA precache generated, and bundle budget passed**                        |
| GitHub `Quality / verify`                   | **Recorded in the publication handoff**                                                                             |
| GitHub Pages `build`                        | **Recorded in the publication handoff**                                                                             |
| GitHub Pages `deploy`                       | **Recorded in the publication handoff**                                                                             |
| Production HTTP and expected-app smoke test | **Recorded in the publication handoff**                                                                             |

## Visual/manual evidence

The full Playwright baseline/evidence-capture run passed and refreshed the tracked current screenshots for Home, Library, Category, Progress, and Settings, including 834×1194 tablet Home and Library captures. Automated browser assertions cover the remaining listed viewports and interactions. Human screen-reader/device review remains pending and is not represented as automated evidence.

The automated release matrix covers:

- Home header at 320×700, 390×844, 643×275, and desktop; confirm no third utility row.
- Library desktop side-by-side layout plus Arabic empty/typed cursor direction.
- Friday Mode mobile/tablet/desktop reflow and progress copy.
- Al-Kahf final-page transition, page separators, and counter placement; short Al-Ikhlas tap behavior.
- Non-Home texture in standard themes and its absence in high-contrast/reduced-transparency modes.
- Home Saved and Benefits entry, WhatsApp target, custom/Reader sound toggles, and Before Sleep completion/reversal.
- Fresh production smoke after the deployed commit is live, recorded in the publication handoff.

Mushaf structural metadata was reviewed by the implementation agent on 2026-08-08 against the Quran Foundation Content API v4 “Verses by Page Number” contract for Madani Mushaf pagination: <https://api-docs.quran.com/docs/content_apis_versioned/4.0.0/verses-by-page-number/>. Implemented ranges are Al-Kahf pages 293–304, As-Sajdah pages 415–417, and Al-Mulk pages 562–564. Tests require concatenated page segments to equal the original Quran string byte-for-byte.

## Documentation updated

- `docs/CONTENT_AUTHORING.md` now defines source review, contiguous range, generator-preservation, and byte-invariance rules for `mushafPages`.
- `docs/agent/DECISION_LOG.md` records the bounded supersessions and data/content constraints in DEC-044.
- `docs/agent/UI_FIX_BACKLOG.md` now distinguishes released verification from implementation awaiting the final gate.
- This report provides the handoff for local gates, deployment monitoring, and production evidence.

## Decisions recorded

DEC-044 records:

- the user-authorized Home utility-header supersession;
- the non-Home tonal-texture exception while opaque reading surfaces remain mandatory;
- Saved as a first-class Library destination with a Home preview;
- source-reviewed, byte-preserving Madani Mushaf metadata;
- weekly device-local Friday dua contribution;
- device-local optional counter click feedback; and
- Benefits assembled only from already reviewed content.

## Known limitations or remaining risks

- A failed GitHub workflow, deployment, or production smoke in the publication handoff reopens release completion.
- Web Audio feedback is intentionally optional; browser policy or unsupported APIs may keep it silent while counting continues normally.
- Long-surah behavior is metadata-driven and currently limited to the three reviewed multi-page surahs named above. Text length or `isSurah` alone must not opt additional content into that behavior.
- Weekly Friday contribution and counter-sound preference are device-local by design; clearing site data clears them, and they do not synchronize across devices.
- No claim of full manual accessibility compliance is made; the repository's pending human checks remain pending.

## Out-of-scope findings

- Phase 09 Settings information architecture and controls.
- New religious claims, Quran text edits, translations, transliterations, source reinterpretation, or count changes.
- Supabase schema/state migration, new remote analytics, or new runtime dependencies.
- Broader redesigns outside the supplied fix list.

## Recommended next step

Publish the verified commit to `origin/main`, monitor Quality and Pages through successful deployment, and complete the production smoke test. Start Phase 09 only after the publication handoff is green.

## 2026-08-09 Home responsive boundary follow-up

- **Objective completed:** Populated Saved and Benefits cards now remain inside Home's scroll-region boundary instead of expanding an implicit grid column beyond the screen.
- **Files changed:** `HomeScreen.tsx`, `e2e/pre-phase-nine.spec.ts`, and `public/release-notes.json`.
- **User-visible behavior:** Home cards fit compact, medium, expanded, and large layouts, including the reported 768px view.
- **Accessibility:** Long Arabic saved text still truncates visually while the complete button name remains available to assistive technology.
- **Focused evidence:** The populated Arabic Home boundary test passed at 320, 390, 600, 768, 899, 900, 1199, 1200, and 1440px; live browser review covered phone, medium, and desktop layouts.
- **Remaining risk:** Manual safe-area and real screen-reader checks remain pending as documented in `docs/QUALITY_CHECKLIST.md`.
- **Recommended next phase:** Start Phase 09 only after this follow-up's release workflows and production smoke test are green.
