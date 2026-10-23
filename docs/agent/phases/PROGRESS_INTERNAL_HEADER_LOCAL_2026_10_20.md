# Phase Report — Progress internal header and cancellation repair

## Objective

Continue demonstrated stability/performance repairs locally. The owner identifies Progress as the main scrolling problem and explicitly says not to push while other work is underway. This supersedes earlier release authority for further changes. No commit, push, deployment trigger or unrelated integration is part of this follow-up.

## Inspection and plan before editing

Owner's subsequent image review rejects the dark title fill and any background-color change while scrolling, allowing stronger frost. Follow-up plan: keep the Progress canvas/color identical at rest and scroll; replace the opaque title exception with existing stationary frost on its own scroll boundary, and remove the outer Progress tint change too. Update color-invariance and independent-scroll regressions, capture actual 70px overlap plus ordinary phone rest/scroll, verify engines/fallbacks/keyboard and keep all work local. This supersedes the opaque repair described in the earlier results below; the broader redesign was subsequently authorized and implemented in [Focused Progress dashboard](PROGRESS_FOCUSED_DASHBOARD_2026_10_20.md).

1. Inspect the current title/filter scroll owners and reproduce overlap in a short window with enlarged text. Preserve the existing responsive shell, title stickiness and 60% actual-viewport cap.
2. Reuse nearest-viewport elevation for the inner title. Introduce only the opaque protection needed while filters themselves pass behind it; retain one outer frost and independent record scrolling. Test upward reversal, rest and keyboard focus.
3. Inspect cancelled export preparation. Demonstrate discarded canvas/layout work before adding cancellation checkpoints around asynchronous boundaries. Preserve shared resource loads and progressive URL cleanup.
4. Run targeted units/browser regressions, inspect screenshots, update affected contracts and run the intact non-browser quality gate. Leave changes uncommitted and unpushed; preserve any concurrent edits.

## Scope completed

Reproduced visible tabs passing through the title at 320×480 with computed 32px root text in Arabic and English. The outer blur cannot hide its own descendants. A new regression failed in both languages before the repair. Shared title elevation now tracks internal controls scrolling. A narrow opaque on-media exception protects its text; explicit filter overrides prevent the more-specific shared scrolled rule from adding duplicate blur. Outer-record scrolling keeps the inner title transparent when its own controls are at rest.

Manual enlarged-text keyboard probing also found a focused tab partly hidden by the title. Extend existing keyboard-only focus recovery to internal controls, choosing a gap only when it fits. No scroll writes occur for ordinary pointer focus.

WebKit's English focus check initially retained a 1px overlap after native scrolling finished. Keep strict zero-overlap assertions, round the requested scroll conservatively and recheck once on the next animation frame while that control still owns focus. Cancel the pending frame on replacement/unmount. Final keyboard checks pass in both languages across all three engines.

Two export cancellation regressions failed because a discarded generation still allocated a canvas and measured layout after cancellation before/during fonts. Add checkpoints before fonts, after fonts and after glyph preparation, moving canvas allocation behind the last checkpoint. A third regression covers cancellation during glyph preparation. No global cache, sacred-text change or dependency was introduced.

## Files changed

ProgressScreen.tsx; materials.css; collectionShareCard.ts/test; new progress-internal-header.spec.ts; architecture/design/quality guides; decision log/index; this report and the prior review's follow-up note. Git status/diff identifies the exact local inventory.

## Components added or modified

ProgressScreen reuses the existing Header and useScrollElevation. No new product component.

## User-visible changes

Short/enlarged Progress filters no longer show competing text through their sticky title. Keyboard users can expose the selected tab beneath it. Cancelled sharing work stops before unnecessary layout/render preparation. Records, date boundaries, saved state, offline access and religious content remain unchanged.

## Accessibility work

Retained semantic tabs, keyboard order, RTL/LTR, enlarged text, original scroll hysteresis and existing opaque/high-contrast recovery. Focus clearance uses actual title/target geometry. Automated checks do not establish complete accessibility or physical-device compositing acceptance.

## Tests added or updated

New bilingual, three-engine internal-overflow/reversal/keyboard regression. Three export cancellation cases cover pre-start, pending fonts and pending glyphs, alongside existing complete-image and progressive URL cleanup coverage.

## Commands run

| Command / scope                                                                 | Result                                                                                                                            |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| New internal-header regression before repair, Chromium                          | 2 failed as expected: title never observed internal scroll.                                                                       |
| First repair across engines plus fallback                                       | 6 new cases failed on duplicate inner blur; 6 fallback cases passed. Fixed selector specificity without weakening the assertions. |
| Progress internal/header fallback/outer scroll checks, three engines            | 18 passed in 1.1m before the additional keyboard assertion.                                                                       |
| New export cancellation cases before repair                                     | 2 failed as expected: discarded canvas allocation.                                                                                |
| ProgressScreen, useScrollElevation, collection renderer and sharing modal units | 4 files / 70 passed in 19.05s before final keyboard follow-up.                                                                    |

Final internal-overflow/keyboard regression: 6 passed in 33.5s across Chromium, Firefox and WebKit, retaining the strict zero-overlap assertion. Log/JSON: `output/progress-internal-keyboard-recovery.*`. Final ProgressScreen/scroll-hook/collection-renderer units: 3 files / 33 passed in 12.72s (`output/performance-local-own-units-final.log`). Earlier failed evidence is retained; no push is scheduled.

`pnpm check` on the evolving combined workspace failed in 173.8s: 306 unit files passed and one sharing-modal file had two failing expectations (2,163 tests passed / 2 failed). The failures concern the concurrent phase's removed Previous button and its footer button count. Formatting also flagged only that phase's report and `e2e/control-feedback-sharing.spec.ts`. Those files were not changed by this patch; their owner was updating the expectations during the run. Build, typecheck, lint, toolchain, audio/content timing, type scale, motion, bundle budgets and CSS utility checks passed. Preserve `output/performance-local-quality.log`; do not describe the full workspace as green or reuse a quality receipt from this run. No thresholds or assertions were weakened. A later coordinated quality run is required once the other work settles.

Scoped `pnpm exec prettier --check` passed for all 12 files authored in this patch (`output/performance-local-own-format-final.log`). The final report addition also passed Prettier. Scoped `git diff --check` passed. Changes remain uncommitted and unpushed; release notes were not altered.

## Visual/manual evidence

Before capture: `output/playwright/progress-internal-header-before.png`. Protected Arabic capture: `output/playwright/progress-internal-header-after.png`, opened and visually inspected; title text is isolated from the passing tabs. Protected bilingual engine captures: `output/progress-internal-final/`. Logs/JSON: `output/progress-internal-before.*`, `output/progress-internal-fixed.*`, `output/progress-internal-final.*`, `output/share-cancellation-before.log` and `output/performance-local-targeted-units-final.log`. Keyboard probe at 200% measured a tab top of 74px beneath a 112px title before recovery.

## Documentation updated

Architecture, design system, quality checklist, decision log, index and review follow-up. Release notes remain untouched because publication is withheld; refresh them against the last deployed commit before any later approved push.

## Decisions recorded

Owner's no-push instruction and narrow exception to the inner-title transparency contract are recorded in DECISION_LOG.md.

## Known limitations or remaining risks

Shared font/glyph requests already in flight may finish for other consumers; cancellation stops subsequent export work rather than cancelling shared loads. Physical touch/GPU and assistive-technology acceptance remain manual. This is a focused repair, not the proposed Progress dashboard redesign.

Concurrent control-feedback/sharing changes appeared during verification, including App, sharing dialogs, Reading settings, theme/state/types and translations. They are preserved and remain outside this patch's authorship. Final broad checks describe the combined workspace snapshot they actually execute, not an isolated release candidate. Do not commit/push either phase during the owner's hold.

## Out-of-scope findings

Further glyph-preparation reuse and historical selector indexing still need profiling; no unbounded cache or speculative architecture change was added. Concurrent work elsewhere remains outside this local patch.

## Recommended next step

Review the local result and coordinate the owner's other work before a separately authorized release. Keep the larger Progress range/metric redesign as its existing proposal.
