# Phase 78 follow-up — Home material and mobile keyboard help

## Objective

Apply the owner's screenshot feedback locally: hide computer instructions on mobile and match the new situational card to Home's shared appearance and transparency preference.

## Scope completed

The three ordinary counting screens hide the shared keyboard-help trigger below 768px, matching the existing shortcut hints. Keyboard commands remain usable with an attached keyboard. The situational card opts into the same glass material as adjacent Home tools when visual effects are enabled; otherwise it uses the active theme's opaque card, border, text, and raised elevation. No new CSS surface, runtime dependency, persistence field, content change, commit, push, or deployment.

## Files changed

- `src/app/components/CounterKeyboardHelp.tsx`
- `src/app/components/SituationalShortcuts.tsx`
- `src/app/screens/HomeScreen.tsx`
- `e2e/practical-devotional-access.spec.ts`
- `docs/DESIGN_SYSTEM.md`
- `docs/agent/DECISION_LOG.md`
- This report and the agent index.

Existing and concurrently edited Reader, translation, and Reader regression files remain outside this follow-up's scope.

## Components added or modified

Modified CounterKeyboardHelp and SituationalShortcuts; Home supplies its existing visual-effects preference. The situational heading uses a unique React ID so reused instances cannot duplicate landmark labels.

## User-visible changes

Mobile Reader, Masbaha, and Friday Salawat no longer show keyboard-help instructions. Home situational collections match neighboring glass surfaces in Light, Midnight, and Dark; Reduce Transparency selects each theme's opaque material. Other ordinary pages retain their documented stable surfaces.

## Accessibility work

Semantic collection links, localized visible labels, native modified-link activation, and 48px minimum link heights remain intact. Glass uses on-media text and focus-ring tokens; opaque cards use the active theme tokens. Hidden mobile help leaves layout and accessibility order. An attached keyboard can still open help with question mark at any width. Tests cover visible focus, minimum target geometry, no horizontal overflow, scoped WCAG axe scans, Arabic/English, and help at 200% text on a short phone. Automated checks do not establish full screen-reader or physical-device compliance.

The accessibility review follows [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) guidance for contrast, visible focus, reflow, and target size together with the repository's stronger 44px target baseline.

## Tests added or updated

Added browser coverage for all three counter routes around the 768px breakpoint and all three themes with transparency enabled/disabled, in Arabic and English at 320, 820, and 1440px. Material properties are compared with the neighboring Qibla surface. Existing enlarged-text help opens using the attached-keyboard path on mobile; visible-button help uses a desktop viewport.

## Commands run

| Command                                                                                                          | Result                                                                                                                                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm test:run src/app/components/CounterKeyboardHelp.test.tsx src/app/components/SituationalShortcuts.test.tsx` | Passed: 2 files, 4 tests.                                                                                                                                                                                                                                                    |
| `pnpm check`                                                                                                     | Exit 1: toolchain, typecheck, build, lint, audio manifest, type scale, unit tests, bundle budget, and CSS utilities passed. Formatting failed in the concurrently edited `e2e/reader-microinteractions.spec.ts`.                                                             |
| Scoped `pnpm exec prettier --check`                                                                              | Passed for all six modified runtime/test/contract files.                                                                                                                                                                                                                     |
| `pnpm build:pages`                                                                                               | Passed, exit 0, including bundle and CSS checks.                                                                                                                                                                                                                             |
| Isolated Playwright suite (all configured applicable projects)                                                   | All 50 distinct cases passed across completed runs: 18 Chromium, 16 Firefox, 16 WebKit. The combined run was interrupted after Chromium/Firefox passed; the WebKit run had 13 passes and 3 timeouts (exit 1), and a fresh targeted rerun passed all 3 (exit 0, 2.1 minutes). |
| `git diff --check`                                                                                               | Passed.                                                                                                                                                                                                                                                                      |

The subsequent `pnpm format:check` exited 1 for the separately edited `docs/agent/phases/READER_TITLE_ALIGNMENT_FOLLOWUP.md`; the earlier Reader-test warning was resolved outside this follow-up.

Initial browser attempts were superseded after the ordinary preview server stopped during testing and a theme fixture reset settings on reload. Verification uses the existing independently served browser build on port 4189, with explicit per-test theme settings and individual theme cases. The combined run passed all Chromium and Firefox cases before WebKit exceeded the unchanged 90-second timeout during repeated geometry measurements. Target rectangles now use one batched browser call, and WebKit runs with one worker to avoid contention. No assertions, coverage, bundle ceilings, or timeouts were weakened.

## Visual/manual evidence

`output/playwright/phase78/material-{ar,en}-{light,midnight,dark}-{glass,opaque}.png` records mobile surfaces. Arabic Light glass and opaque screenshots were visually inspected for readable labels, spacing, card consistency, and focus. Browser logs are in `output/phase78-followup-*.log`; local evidence is intentionally uncommitted.

## Documentation updated

Design-system material/mobile-help contracts, DEC-217 follow-up decision, agent index, and this report.

## Decisions recorded

The owner's 2026-10-03 screenshot follow-up authorizes these local corrections and expressly prohibits pushing. No approval gate was requested for implementation.

## Known limitations or remaining risks

Full repository formatting must be green after the separately edited local files settle. WebKit exhibited timing sensitivity: its two Dark glass axe scans and Arabic focus-flow test timed out during the first isolated run, then all passed with fresh contexts without changing assertions or the 90-second timeout. Human TalkBack/VoiceOver/NVDA checks remain pending. The full unrelated browser suite was not rerun for this small follow-up.

## Out-of-scope findings

The previous Phase 78 report's bundle failure does not recur in this measured working tree: the current production and Pages budgets pass. This follow-up did not change budget thresholds or baselines.

## Recommended next step

Review the local screenshot feedback changes alongside the other pending work. Run the complete release gates when the owner is ready to ship everything together.
