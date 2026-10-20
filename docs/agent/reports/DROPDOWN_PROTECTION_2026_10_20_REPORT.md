# Phase Report — Protected dropdowns

## Objective

Fix the supplied Quran Juz picker overlap locally and establish an app-wide dropdown legibility/stacking rule across layouts and color modes.

## Scope completed

The searchable picker now uses the installed Radix Popover portal and collision handling. Search stays separate from independently scrolling options; names reflow at enlarged text sizes. Shared Select, DropdownMenu and submenu surfaces explicitly declare opaque theme-aware protection, with a navy ground for supported Glass and Canvas recovery for forced colors. The surrounding cards and Glass canvas retain their existing material.

## Files changed

- `src/app/components/AccessibleCombobox.tsx`, `AccessibleCombobox.test.tsx`, new `accessible-combobox.css`.
- `src/app/components/ui/select.tsx`, `ui/dropdown-menu.tsx`: shared surface markers only; preserve the concurrent Select viewportProps work.
- `src/styles/theme/materials.css`: shared protected dropdown ground and single-owner searchable list treatment.
- New `e2e/dropdown-protection.spec.ts`.
- `AGENTS.md`, `docs/DESIGN_SYSTEM.md`, `docs/ARCHITECTURE.md`, `docs/QUALITY_CHECKLIST.md`, `docs/agent/DECISION_LOG.md`, `docs/agent/INDEX.md`, the phase brief and this report.

## Components added or modified

AccessibleCombobox, SelectContent, DropdownMenuContent and DropdownMenuSubContent. No new dependency, persisted schema, content, route or network boundary.

## User-visible changes

Picker search/options obscure the form beneath them and stay above subsequent cards/actions. Menus fit the viewport across responsive reflow, with scroll recovery for long lists. All shared dropdowns retain a readable ground in every material/theme rather than relying on blur. Existing search, exact saved plan choices and explicit Save/Cancel remain.

## Accessibility work

Named popup, focused search, keyboard selection, Escape restoration, native Tab recovery, text/icon clearance, full option-label reflow and viewport-constrained scrolling. Automated checks cover RTL/LTR, 320/390/834/1280px and actual 200% text in a 320×480 window, all three color themes with solid/Glass, high contrast, reduced transparency, unavailable frost, forced colors and the three color-vision settings. Automated evidence does not establish physical screen-reader/device compliance.

## Tests added or updated

Two component regressions assert portal/protected-surface ownership and native-layer Escape focus restoration. Nineteen new browser cases cover all normal theme/material/language combinations and seven accessibility fallback/settings combinations, including geometry, opaque computed backgrounds and element hit testing. Existing compact-form saving/reload and sharing theme tests remain intact.

## Commands run

| Command                                                                                                 | Result                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm test:run src/app/components/AccessibleCombobox.test.tsx src/app/screens/QuranWirdScreen.test.tsx` | 2 files, 31 tests passed on the final component changes.                                                                                                                                                                                                                                                                                                                                                                                   |
| Isolated browser preview: `vite build --outDir output/dropdown-preview`, API fixture on 4217            | Passed. Production build used for browser verification; existing preview ports untouched.                                                                                                                                                                                                                                                                                                                                                  |
| `pnpm check`                                                                                            | Failed: 317 unit files/2,248 tests passed, one startup-hydration test failed waiting for nav-home while Splash remained. Build, typecheck, lint, timing/content validators, motion/type-scale and CSS utilities passed. Formatting observed the new spec during editing; the final focused formatting check passed. Total output 12,586,183 bytes exceeded the unchanged 12,582,912-byte ceiling by 3,271. No checks/limits were weakened. |
| Cross-engine targeted browser matrix and final formatting/diagnostics                                   | See completion record below.                                                                                                                                                                                                                                                                                                                                                                                                               |
| `git diff --check`                                                                                      | Passed.                                                                                                                                                                                                                                                                                                                                                                                                                                    |

`pnpm format:check` subsequently passed on the completed implementation/test files. The new report is checked separately after completion. `pnpm test:run src/app/App.composition.test.tsx --testNamePattern 'reuses startup hydration'` passed its one selected test (six unselected), without changing assertions or timeouts. This diagnostic does not establish the full-suite failure's cause or replace that failed run. `node scripts/check-bundle-budget.mjs output/dropdown-preview` still fails on the final dropdown preview: 12,586,123 bytes, 3,211 over the unchanged total-output ceiling.

Initial browser diagnostics are retained: one premature preview connection attempt, first-frame positioning measurement corrected to await the same strict bounds, native Escape focus restoration repaired, and an English numeric-search fixture corrected because page ranges legitimately matched “30”. An interrupted diagnostic matrix was replaced after the fixture correction; no assertions were removed or timeouts raised.

## Visual/manual evidence

Phone and 200%-text screenshots are captured per theme/material/language under `output/dropdown-final-test-results/`. The Arabic Glass phone preview was visually inspected: search and options cover the underlying Save/Cancel and following card, with separate text/icon space and readable options. The enlarged narrow preview retains independent list scrolling and wrapping.

## Documentation updated

The repository constitution, design system, presentation ownership, quality checklist, decision log and phase index record the protected dropdown contract and required regression matrix.

## Decisions recorded

Owner-authorized local-only correction. Opaque functional dropdown protection supersedes the earlier 80% Glass overlay tint for dropdowns only. Shared cards and headers retain their contracts. No commit, push or deployment.

## Known limitations or remaining risks

The earlier combined workspace quality gate failed as recorded above. The hydration diagnostic passes alone; resource contention is possible but not proven. The Progress session subsequently reports an unchanged-budget pass on its final combined artifact at 12,582,773 bytes (139 bytes of headroom), and owns the final combined quality rerun. No duplicate broad gate is started here. Concurrent application changes remain outside this dropdown phase. No publication is attempted. Real assistive-technology and physical-device checks remain manual.

## Out-of-scope findings

The Progress session owns the remaining combined quality gate and legitimate size recovery. Its verified size reduction preserves all limits. This phase does not edit its files or duplicate its verification.

## Recommended next step

Review the local dropdown result and let the existing Progress session finish the combined quality gate. Publication remains exclusively with the owner; no commit or push from this chat.

## Completion record

Final targeted browser matrix: `E2E_BASE_URL=http://127.0.0.1:4217 pnpm test:e2e e2e/dropdown-protection.spec.ts e2e/quran-wird-plan-form.spec.ts e2e/sharing-themes.spec.ts --project=desktop-chromium --project=desktop-firefox-smoke --project=mobile-webkit-smoke --output=output/dropdown-final-test-results` — 72 passed: 26 Chromium, 23 Firefox and 23 WebKit, including all 57 new dropdown regressions. Console evidence: `output/dropdown-browser.log`; finalized report: `output/dropdown-final-results.json` (72 expected, zero skipped/unexpected/flaky, no errors). The Windows WebKit worker hung after the final passing case with no browser child process. Stopping only that owned idle worker allowed the runner to finalize its successful summary/report; record this shutdown intervention rather than claiming an unattended clean shutdown. No unchanged tests were rerun to hide it. The runner and isolated preview processes were cleaned up. Final component tests: 31 passed; repository formatting and diff whitespace checks passed. No assertions, coverage, budget limits or browser inventory were relaxed.

Copied review evidence: `output/playwright/dropdown-protection/phone-ar-glass.png`, `phone-en-light.png` and `enlarged-ar-glass.png`. Both the Arabic Glass and English light-mode phone screenshots were visually inspected. The test-specific directories retain every other theme/material/engine screenshot. No commit, push or deployment.

## Session coordination

Following the owner's explicit coordination request, this chat notified both active Azkarapp sessions. “Push all changes” owns Progress/date ranges, Progress-only size recovery and the final combined quality run; “Preview animated prayer timer” owns prayer/countdown/motion. This chat owns shared dropdown protection and its tests/docs. Each received exact file boundaries, verified results, remaining shutdown/quality limitations, the instruction to avoid duplicated work and the owner's no-push hold. Preserve the other session's Select viewportProps and all pending source changes. No further application/source edits after this handoff; report-only completion.
