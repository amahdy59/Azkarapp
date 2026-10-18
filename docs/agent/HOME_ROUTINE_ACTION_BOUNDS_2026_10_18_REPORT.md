# Phase Report — Home routine action bounds

## Objective

Keep the Home routine share action inside its card when continuation text is long. Local implementation only.

## Scope completed

The primary action now takes the remaining flexible width and can shrink below its intrinsic text width. Existing single-line ellipsis, title and full accessible name remain. The share action retains a fixed 44px width/minimum height, including at 200% text, instead of doubling with root font size.

## Files changed

- `src/app/components/HomeCards.tsx`
- `e2e/home-routine-actions.spec.ts`
- `docs/agent/INDEX.md`
- `docs/agent/phases/HOME_ROUTINE_ACTION_BOUNDS_2026_10_18.md`
- This report.

## Components added or modified

PrayerRoutineCard only; two sizing class changes. No new component or dependency.

## User-visible changes

Long primary-action text truncates within available space, preserving the adjacent share action and arrow. Existing routine wording, counts and sharing behavior remain.

## Accessibility work

Preserved native buttons, full accessible names, focus styling and semantic keyboard order. Browser assertions cover 44px targets, bounds, non-overlap, alignment, 200% text, keyboard focus and primary activation. No claim of physical-device or assistive-technology certification.

## Tests added or updated

Added eight responsive scenarios per engine: Arabic/English, 320/390px, normal/200% text. Runs cover Chromium, Firefox and WebKit. The initial run exposed root-font scaling of the share target at 320px/200%; fixed its dimensions before the final run.

## Commands run

| Command                                                                                                                                                   | Result                                                                                                                             |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm test:run src/app/components/HomeCards.test.tsx`                                                                                                     | Passed: 1 file, 7 tests.                                                                                                           |
| `pnpm check`                                                                                                                                              | Passed in 275.8s: all stages, including coverage, lint, types, formatting, build, content/timing validators and bundle/CSS checks. |
| `pnpm exec prettier --check src/app/components/HomeCards.tsx e2e/home-routine-actions.spec.ts docs/agent/phases/HOME_ROUTINE_ACTION_BOUNDS_2026_10_18.md` | Passed.                                                                                                                            |
| `git diff --check`                                                                                                                                        | Passed.                                                                                                                            |

`E2E_PORT=4198 pnpm test:e2e e2e/home-routine-actions.spec.ts --project=desktop-chromium --project=desktop-firefox-smoke --project=mobile-webkit-smoke`: **24 passed (4.3m)**. The full check ran against the shared pending workspace; no release receipt or publication is claimed.

## Visual/manual evidence

- `output/home-routine-actions-2026-10-18/ar-390.png`: reviewed normal Arabic card with both actions inset and aligned.
- `output/home-routine-actions-2026-10-18/ar-320-200.png`: enlarged narrow WebKit evidence.
- Each browser case captures `routine-actions.png` in its test output.

## Documentation updated

Local phase plan, index entry and this report. No public behavior/content contract change.

## Decisions recorded

Owner's local-only instruction applies. Preserve all existing pending work; no commit, push, release notes or deployment.

## Known limitations or remaining risks

At extreme narrow/enlarged sizes, little of the long label can remain visible; its full accessible name and title persist. Existing broader Home header/typography reflow is outside this two-control fix. Human screen-reader and physical-phone verification remain separate.

## Out-of-scope findings

Unrelated material, prayer, Progress and other pending changes were preserved.

## Recommended next step

Review the local Home card on the reported phone before combining with any future release.
