# Phase Report — Consistent Home routine actions

## Objective

Match the share action's height to the primary action and review every application color mode, locally only.

## Scope completed

The action row and share wrapper stretch together. Share uses a 52px width/minimum height, matching the primary's normal height; both can grow together with enlarged text. Both use rounded-2xl corners and the same focus-ring offset. Secondary hover fills use existing on-media or theme tokens. The earlier flexible-width/ellipsis fix remains intact.

## Files changed

- `src/app/components/HomeCards.tsx`
- `e2e/home-routine-actions.spec.ts`
- `docs/agent/INDEX.md`
- `docs/agent/phases/HOME_ROUTINE_ACTION_BOUNDS_2026_10_18.md`
- This report; the prior bounds report remains historical evidence.

## Components added or modified

PrayerRoutineCard action row only. No new component, dependency, content or persistence change.

## User-visible changes

Share and primary actions share their height and corner shape, while the filled primary remains dominant. Secondary hover and keyboard focus use the active theme. This supersedes the prior 44px share dimensions.

## Accessibility work

Native buttons, full accessible names, visible focus and semantic order remain. Targets are at least 52px tall. Added equal-height checks at 320/390px and 100%/200% text in Arabic/English. Color review covers Midnight, Dark and Light with Glass/Opaque and high contrast. Automated scans cover both actions; no complete accessibility compliance or physical-device certification is claimed.

## Tests added or updated

The existing 24 cross-engine geometry/activation tests now assert equal heights. Six additional Chromium design cases cover all theme/material combinations, each with normal and high-contrast axe/focus/geometry checks and screenshots.

## Commands run

- HomeCards targeted unit suite: passed, 7 tests.
- Targeted ESLint: passed, zero warnings.
- Targeted Prettier and `git diff --check`: passed.

- Full browser selection: 27 passed / 3 failed in 9.2m. Two failures were Home import/load failures during concurrent replacement of shared browser assets; the third timed out waiting for an enlarged WebKit element screenshot to stabilize after its geometry/focus assertions passed. Failures remain recorded, with isolated reproduction below.
- `pnpm check`: failed in 473.7s. Build, typecheck, content/timing validators, motion/type scale and bundle/CSS checks passed. Lint failed on `PrayerProgressSummary.tsx:70` (`jsx-a11y/no-noninteractive-tabindex`); formatting encountered a concurrently removed `e2e/progress-compact-tracking.spec.ts`; the full unit suite reported 4 failed files, 11 failed tests, 284 passed files and 2026 passed tests, including failures around concurrent Progress changes. The shared snapshot changed during this run; no clean full-gate result is claimed. No unrelated assertions or implementation were changed to make this pass.
- Built an isolated preview using `browserTestEnvironment(4199)` into `output/routine-actions-preview`, then served it with Vite preview on port 4199. Build passed. Selected affected cases were rerun using `E2E_BASE_URL=http://127.0.0.1:4199`, a separate test output directory and JSON report, preserving all assertions.
- Isolated rerun: **5 passed (1.4m)**. Covers Light/Opaque normal and high contrast, and English 390px normal/200% in Chromium and WebKit. Together with the original 27 passes, every one of the 30 selected scenarios has a successful result. This does not erase the original interrupted-run failures or establish a clean full repository gate.

## Visual/manual evidence

`output/home-routine-actions-2026-10-18/desktop-chromium-{midnight,dark,light}-{glass,solid}[-contrast].png` captures the actual cards and keyboard-focus treatment. Reviewed all six theme/material combinations, plus Light/Opaque and Midnight/Glass high-contrast recovery. The first Light/Opaque navigation failed because the shared browser build was replaced during the run: trace records a 404 for the imported ArrowNext chunk. Its isolated rerun passed both normal/high-contrast geometry, axe and focus checks; its final screenshot was reviewed.

## Documentation updated

Phase plan and index reflect the owner-requested matching geometry. This report supplements the previous bounds report.

## Decisions recorded

Keep all changes local and preserve unrelated pending work. No commit, push or deployment.

## Known limitations or remaining risks

Extreme text enlargement still truncates the long action label; its full accessible name/title remain. Human screen-reader/device review is separate. Concurrent checks share test-build assets; rerun an affected navigation against a fresh build when a trace confirms an asset replacement.

## Out-of-scope findings

Existing pending material, prayer, Reader and Progress changes are outside this action-row refinement.

## Recommended next step

Review the local Home action pair on the reported phone before any separately authorized release.
