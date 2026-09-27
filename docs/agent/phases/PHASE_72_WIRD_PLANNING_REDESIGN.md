# Phase Report — Phase 72: Quran Wird Planning & Tracking Redesign

## Objective

Redesign the Quran Wird planning and tracking experience to support users who recite a fixed repeating section every day (such as a specific Juz, Surah, or custom page range) and want it marked complete each day upon finishing 100% of that selected range, while keeping general khatmah pacing and free reading effortless to configure.

## Scope completed

- **Data model & state normalization (`src/app/types.ts`, `src/app/state.ts`):**
  - Added `"repeating"` plan kind to `QuranWirdPlanKind`.
  - Added `repeatStartPage`, `repeatEndPage`, `repeatScope?: "juz" | "surah" | "custom"`, `repeatNumber?: number` to `QuranWirdPlan`.
  - Updated `normalizeQuranWirdPlan` to validate and normalize repeating plans with defensive fallbacks and page clamping (1–604).
  - Preserved full backward compatibility with existing user state and history without destructive schema migrations.

- **Unified Day Progress Calculation (`src/app/screens/quranWirdGoal.ts`):**
  - Implemented `getQuranWirdDayProgress(plan, wirdHistory, dayKey)` returning `{ goal, read, remaining, complete }`.
  - For repeating plans, accurately counts only unique pages read _within_ the repeating range on that day; pages read outside the range are isolated and do not pollute wird completion.
  - Completion requires 100% of the repeating section to be read today (`read >= goal && goal > 0`).

- **Application Integration (`src/app/dailyPath.ts`, `src/app/screens/KhatmahReaderScreen.tsx`, `src/app/components/QuranHomeCard.tsx`):**
  - Connected Daily Path devotional status (Quran pillar) to `getQuranWirdDayProgress`.
  - Updated Mushaf reader notice and progress bar to reflect repeating wird status and completion banner.
  - Updated Home screen Quran Wird card to display progress and completion badge for repeating plans.
  - Extended `QuranWirdScreen`'s `onContinue` prop to accept an optional `targetPage`, enabling one-tap restart to the beginning of the repeating section.

- **Screen Redesign & UX Controls (`src/app/screens/QuranWirdScreen.tsx`):**
  - Added "Daily fixed section" plan option with interactive scope selection:
    - **Juz selector:** Defaults to current Juz or selected Juz (1–30), auto-populating page bounds.
    - **Surah selector:** Defaults to current Surah or selected Surah (1–114), calculating exact page spans.
    - **Custom page range:** Number inputs for start and end pages with numeric wheel protection.
  - Added "Start section again" action (`RotateCcw` icon + localized label) in the Today card when reading a repeating plan, allowing users to restart their section at any time.
  - Updated Week view to show daily completion signals (✓) and counts based on `getQuranWirdDayProgress`.

- **Internationalization (`src/app/i18n/ar.ts`, `src/app/i18n/en.ts`):**
  - Added full Arabic and English copy for all repeating wird features (`planRepeating`, `planRepeatingHint`, `planRepeatingJuz`, `planRepeatingSurah`, `planRepeatingCustom`, `repeatingSummary`, `repeatingScopeJuz`, `repeatingScopeSurah`, `repeatingScopeCustom`, `selectJuz`, `selectSurah`, `fromPage`, `toPage`, `startSectionAgain`, `wirdTodayRepeating`).
  - Verified 100% parity via `parity.test.ts`.

## Files changed

- `src/app/types.ts`
- `src/app/state.ts`
- `src/app/screens/quranWirdGoal.ts`
- `src/app/dailyPath.ts`
- `src/app/screens/KhatmahReaderScreen.tsx`
- `src/app/components/QuranHomeCard.tsx`
- `src/app/components/PrayerActionsCard.tsx`
- `src/app/App.tsx`
- `src/app/i18n/ar.ts`
- `src/app/i18n/en.ts`
- `src/app/screens/QuranWirdScreen.tsx`
- `e2e/khatmah-reader.spec.ts`
- `public/release-notes.json`
- `docs/agent/DECISION_LOG.md`
- `docs/agent/INDEX.md`
- `docs/agent/phases/PHASE_72_WIRD_PLANNING_REDESIGN.md`

## Tests added or updated

- `src/app/screens/quranWirdGoal.test.ts`: Added tests for repeating goal calculation, page range counting, and completion logic.
- `src/app/state.test.ts`: Added normalization tests for repeating plan configuration and default range calculation.
- `src/app/dailyPath.test.ts`: Added tests verifying repeating range completion in Daily Path status.
- `src/app/screens/ProgressScreen.wirdGoal.test.tsx`: Added tests verifying repeating wird completion requires 100% range pages.
- `src/app/screens/QuranWirdScreen.test.tsx`: Added comprehensive tests for configuring repeating plans (Juz, Surah, Custom), restarting sections, Today progress display, and week view completion.
- `e2e/khatmah-reader.spec.ts`: Updated radio count expectation to 5 to account for the new repeating plan option.

## Quality Gates & Verification

| Gate                  | Command                                                                                 | Result                                            |
| --------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Typecheck             | `pnpm typecheck`                                                                        | PASS (0 errors)                                   |
| Formatting & Lint     | `pnpm check`                                                                            | PASS (all stages passed in 134.2s)                |
| Unit Tests & Coverage | `pnpm test:coverage`                                                                    | PASS (1167 passed, 161 test files)                |
| E2E Tests             | `npx playwright test e2e/home-prayer-moment.spec.ts:170 e2e/khatmah-reader.spec.ts:175` | PASS (4/4 passed across desktop, mobile, tablet)  |
| Bundle & Pages Build  | `pnpm build:pages`                                                                      | PASS (Bundle budget passed, CSS utilities passed) |
| Release Notes Check   | `pnpm run check:release-notes`                                                          | PASS                                              |

## Remaining risks or known limitations

- If a user reads pages across multiple non-contiguous surahs for general study while on a repeating plan, only pages within their designated repeating range count toward today's wird completion. This is the intended behavior requested by the user.

## Recommended next steps

- Monitor user feedback on repeating plan customization.
- Explore optional notification reminders specifically tailored to repeating wird routines.
