# Phase Report — Phase 05 Home card follow-up

## Objective

Refine the Home prayer/routine, Friday, and Saved-zikr cards after the responsive UX and accessibility audit, using the four user-approved decisions recorded in DEC-051.

## Scope completed

- Replaced the device clock in the routine hero with the next prayer, its calculated scheduled time, and countdown.
- Added responsive wrapping, concise routine-mode help, remaining-count CTA copy, and a calmer hierarchy to the primary card.
- Added a Thursday-Maghrib-to-Friday-Maghrib expanded Friday window, a compact outside-window state, a development-only preview, state-aware entry copy, and native progressive disclosure.
- Rebuilt Saved quick access on the shared card surface with deterministic ordering, source labels/icons, concise accessible names, loading/error announcements, and a useful empty-state route.
- Kept the existing button-free timed routine-completion card, prayer calculation, reviewed devotional text, Saved persistence, and synchronization contracts unchanged.
- Corrected a reduced-motion CSS collision that made the skip link permanently cover the Home header.

## Files changed

- `src/app/components/HomeCards.tsx`
- `src/app/components/HomeCards.test.tsx`
- `src/app/components/SegmentedControl.tsx`
- `src/app/screens/HomeScreen.tsx`
- `src/app/screens/HomeScreen.test.ts`
- `src/app/screens/HomeScreen.render.test.tsx`
- `src/app/App.tsx`
- `src/app/i18n/en.ts`
- `src/app/i18n/ar.ts`
- `src/styles/theme.css`
- `e2e/accessibility.spec.ts`
- `e2e/pre-phase-nine.spec.ts`
- `docs/DESIGN_SYSTEM.md`
- `docs/agent/DECISION_LOG.md`
- This report

## Components added or modified

- Added `PrayerRoutineCard`, `SavedZikrCard`, and `FridayHomeCard` as focused presentation components.
- Extended `SegmentedControl` to forward `aria-describedby` so the routine-mode group can reference its active explanation.
- Simplified `HomeScreen` to calculate state and compose the extracted cards.

## User-visible changes

- The prayer line now reads “Next prayer / prayer name / scheduled time / countdown” and wraps instead of truncating.
- The routine description is plain supporting text instead of another nested pill; the mode selector has an explanation and Resume states include the remaining item count.
- Friday is compact during the rest of the week and expanded only in the approved calculated window. The expanded card leads with the existing Al-Kahf virtue, keeps secondary items in a disclosure, and uses the repository icon system instead of an emoji.
- Saved rows visibly identify Collection, Dua, or Friday sources; opening lazy content provides local feedback and recovery; an empty Saved card opens Collections.
- Reduced-motion users no longer see the skip link covering the header unless they focus it with the keyboard.

## Accessibility work

- Preserved native headings, sections, buttons, radio-group semantics, and keyboard order in RTL and LTR.
- Connected the routine mode group and primary CTA to visible explanatory/progress text.
- Added complete Saved count labels, concise distinct item labels, `aria-busy`, local `role="status"`, and local `role="alert"` feedback.
- Kept all ordinary targets at least 44×44 CSS px and retained visible semantic focus rings.
- Used native `<details>/<summary>` for Friday progressive disclosure.
- Applied `zikr-text`/Arabic language semantics to Arabic Saved excerpts.
- Verified automated WCAG A/AA, contrast modes, narrow layouts, large text, and 200% zoom. Manual screen-reader confirmation remains a separate release-checklist item.

## Tests added or updated

- Added focused component tests for prayer presentation, Saved accessible/loading/error/empty states, and compact/expanded Friday variants.
- Added exact Thursday/Friday Maghrib boundary tests.
- Updated Home rendering and browser selectors from the removed device-clock test ID to the scheduled prayer time.
- Added a reduced-motion skip-link regression test.

## Commands run

| Command                                                                                                                                                                                                  | Result                                                                                                              |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `pnpm exec vitest run src/app/screens/HomeScreen.test.ts src/app/screens/HomeScreen.render.test.tsx src/app/components/HomeCards.test.tsx src/app/i18n/parity.test.ts src/app/i18n/keyIntegrity.test.ts` | Passed: 5 files, 16 tests                                                                                           |
| `pnpm exec playwright test e2e/pre-phase-nine.spec.ts e2e/narrow-layout.spec.ts --project=desktop-chromium`                                                                                              | Passed: 10 tests                                                                                                    |
| Focused accessibility, contrast, responsive, and text-resize Playwright runs                                                                                                                             | Passed: 15 tests                                                                                                    |
| `pnpm check`                                                                                                                                                                                             | Passed: format, lint, types, audio validation, 73 files / 385 unit tests, coverage, production build, bundle budget |
| `pnpm test:e2e`                                                                                                                                                                                          | Passed: 317; skipped: 2; failed: 0                                                                                  |
| `pnpm build:pages`                                                                                                                                                                                       | Passed: GitHub Pages PWA build and bundle budget                                                                    |
| `git diff --check`                                                                                                                                                                                       | Passed                                                                                                              |

An initial standalone reduced-motion assertion used Playwright's `toBeVisible`, which treats transformed off-screen elements as visible. It was replaced with the correct bounding-box assertion and passed. The first full-E2E command wrapper expired at two minutes without reporting a test failure; the conclusive rerun used the normal ten-minute allowance and passed in 8.6 minutes.

## Visual/manual evidence

- Inspected the live Arabic Home rendering at 320×700, 768×900, and 1440×900.
- Confirmed zero document-level horizontal overflow at 320 px.
- Inspected compact and development-preview expanded Friday variants.
- Confirmed the reduced-motion skip link is off-screen by default and visible on keyboard focus.
- No new screenshot artifact was added to the intended diff. Existing modified files under `docs/agent/evidence/screenshots/current/` were present before this change and remain outside its scope.

## Documentation updated

- Added the prayer-line, Friday-window, Saved-order/loading, and development-preview contracts to `docs/DESIGN_SYSTEM.md`.
- Recorded the four approvals and their boundaries in DEC-051.

## Decisions recorded

- DEC-051 — Home prayer, Friday, and Saved-card refinement.

## Known limitations or remaining risks

- Automated accessibility checks do not replace a manual VoiceOver, TalkBack, or NVDA pass.
- The Friday disclosure identifies the existing Surah reading source (`Qur’an 18:1–110`) but does not add a new hadith attribution; adding one requires the repository's religious-content review process.
- The development preview is intentionally absent at runtime in production builds.

## Out-of-scope findings

- The existing Home Benefits card remains unchanged in this follow-up.
- The existing after-prayer tracker and prayer-time calculation domain remain unchanged.
- The pre-existing modified evidence screenshots were not staged, reverted, or treated as implementation output.

## Recommended next step

Perform the pending manual screen-reader pass on Home in Arabic and English. If release is requested, stage only the files listed in this report, run the mandatory pre-push install/check/E2E/Pages gate, then commit, push, and verify GitHub Actions and production separately.
