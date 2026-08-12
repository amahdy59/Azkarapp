# Phase Report — Phase 11 responsive, RTL/LTR and text scaling

## Objective

Validate and remediate Azkarapp across viewport, direction, language, zoom, text-size, short-height, theme, and safe-area contracts.

## Scope completed

- Replaced Playwright's unstable HMR server with one built preview on an isolated strict port.
- Removed hidden CI retries and retained traces for real failures.
- Made committed evidence refresh explicit rather than a side effect of ordinary E2E runs.
- Removed current inline bilingual JSX and added preventive i18n/accessibility lint guards.
- Widened Progress at the large desktop tier while preserving compact and tablet measures.
- Removed the temporary Friday preview control and improved Benefits-card information density.
- Removed four unreferenced original PNG masters from first-install precache while retaining optimized offline hero assets.
- Moved Reader- and Settings-only CSS into their lazy route chunks so the global stylesheet keeps bundle-budget headroom.
- Updated GitHub workflow actions to their current supported Node-runtime majors without changing release logic.

## Files changed

Test harness/configuration, two local ESLint rules and tests, current i18n consumers and bundles, Progress/Home presentation, route-scoped CSS, focused browser coverage, design-system/decision/release documentation, and this report.

## Components added or modified

- `ProgressDayView`, `ProgressWeekView`, `ProgressMonthView`, and `ProgressYearView`
- `TodayRoutineGarden` and `SevenDayGarden`
- `HomeScreen`, `FridayHomeCard`, and `SavedZikrCard`
- Authentication, Reader, counter, category, notification, and account-data copy consumers

## User-visible changes

- Progress uses up to 72rem at the large desktop tier instead of remaining capped at 44rem.
- Arabic and English progress labels, month-day names, counter guidance, auth copy, and notification guidance stay in the selected language.
- Benefits quick access includes a concise explanatory line rather than a largely empty card.
- The development-only Friday preview button is removed from Home.

## Accessibility work

- Replaced ignored `aria-label` attributes on roleless `div`/`span` elements with list/group/image semantics or visible screen-reader text.
- Added a lint rule preventing recurrence on roleless containers.
- Added a lint rule preventing Arabic/English conditional JSX copy outside the typed i18n bundle; the documented crash boundary remains the only exception.
- Preserved stable DOM order, RTL/LTR icon behavior, 44px controls, safe-area shell padding, focus visibility, and no-overflow behavior.

## Tests added or updated

- Three tests for the two local ESLint rules.
- Desktop Arabic/English Progress-width and four-card row assertions.
- Arabic largest-text Progress checks at 320px and 390px.
- Updated focused Home-card tests and existing i18n parity coverage.

## Commands run

| Command                                  | Result                                                                                                 |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Pre-change responsive/narrow matrix      | Desktop passed; dev server then exited and 26 mobile/tablet tests failed with `ERR_CONNECTION_REFUSED` |
| `pnpm lint`                              | Passed after i18n/a11y remediation                                                                     |
| `pnpm typecheck`                         | Passed                                                                                                 |
| Focused Vitest guards/i18n/Home/Progress | Passed — 3 files / 12 tests in final focused run                                                       |
| Preview responsive/narrow matrix         | Passed — 39/39, retries disabled                                                                       |
| Theme/zoom/Progress/search matrix        | Passed — 87/87, retries disabled                                                                       |
| Final evidence capture                   | Passed — 8/8; all 12 approved current screenshots refreshed deliberately                               |
| `pnpm install --frozen-lockfile`         | Passed — lockfile unchanged                                                                            |
| `pnpm check`                             | Passed — formatting, lint, typecheck, audio validation, 409/409 tests with coverage, build and budgets |
| `pnpm test:e2e`                          | Passed — 329 passed, 2 intentionally skipped, retries disabled                                         |
| `pnpm build:pages`                       | Passed — GitHub Pages build and bundle budgets                                                         |
| `pnpm audit:prod`                        | Passed — no known production dependency vulnerabilities                                                |

## Visual/manual evidence

- The approved 12-image current compact/tablet/desktop baseline begins at commit `795f6e0`; Phase 11 deliberately refreshed it once more after the final layout assertion.
- Final screenshots are deliberately refreshed only with `EVIDENCE_DIR`; ordinary E2E runs now write under ignored Playwright output.
- Automated checks cover 320px, 390px, tablet, desktop, 200% zoom equivalence, largest app text, short landscape, Arabic RTL, English LTR, theme contrast, and horizontal overflow.
- Real screen-reader and physical notched-device safe-area sessions remain human checks and are not claimed from automation.

## Documentation updated

- `docs/DESIGN_SYSTEM.md`
- `docs/agent/DECISION_LOG.md` (DEC-055)
- `public/release-notes.json`
- This report

## Decisions recorded

DEC-055 records the deterministic preview gate, retry policy, opt-in screenshot evidence, lint boundaries, and responsive Progress measure.

## Known limitations or remaining risks

- Real VoiceOver/NVDA/TalkBack behavior and physical-device safe areas still require human validation in Phase 12.
- `App.tsx` remains a high-risk large composition file; extraction is deliberately not mixed into this UI phase.
- Runtime performance remains unmeasured work for Phase 13. The generated initial PWA precache is measured at 123 entries / 2327.28 KiB, down from 125 entries / 8280.95 KiB before Phase 11.

## Out-of-scope findings

- No persisted state, religious content, prayer calculation, router contract, runtime dependency, or primary reading measure changed.

## Recommended next step

Begin Phase 12 with a real screen-reader session and physical safe-area/device checks, then remediate only evidence-backed findings.
