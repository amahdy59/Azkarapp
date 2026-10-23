# Phase Report — Local motion and control polish

## Objective

Review app-wide motion/microinteraction coverage, apply focused improvements locally and identify worthwhile further animation. No commit, push or deployment.

## Scope completed

Shared button/link/semantic-control press feedback, switch/radio/tab indicators, overlays, reading/paper transitions, completion feedback and both motion preferences already provide broad coverage. This is not an exhaustive acceptance claim for every control/state. The source inventory finds six native range instances: compact/expanded audio seek, vertical volume, Mushaf magnification, sharing text size and timeline exploration. Each retains meaningful value text and immediate native values.

Applied cancellation hardening to delegated feedback, native range engagement and shared Home icon cues. Native WebKit ranges suppress box shadows, so a still surface tint accompanies the outline in every engine; other engines retain the halo too. Preserve concurrent Progress/Mushaf changes, religious text, persistence, audio ownership and bundle ceilings.

## Files changed

- Feedback: src/app/hooks/useControlFeedback.ts and useControlFeedback.test.tsx.
- Shared presentation: src/styles/theme/motion.css and surfaces.css.
- Composition: src/app/screens/HomeScreen.tsx; src/app/components/HomeCards.tsx and ProgressViews.tsx.
- Browser regression: e2e/motion-control-polish.spec.ts.
- Documentation: docs/MOTION_SYSTEM.md, DESIGN_SYSTEM.md, QUALITY_CHECKLIST.md, agent/DECISION_LOG.md, agent/INDEX.md, the phase brief and this report.

Only this list describes this phase; other working-tree files belong to concurrent owner work.

## Components added or modified

No component or dependency added. Home's Qibla/Masbaha icons and routine action arrow share control-cue. Legacy reusable TasbeehCounterButton is not mounted by current Home and is left unchanged. ProgressViews routine photography remains stationary. Existing useControlFeedback owns cancellation without dispatching clicks or changing native values.

## User-visible changes

- Home action icons settle over the existing 150ms token on keyboard focus and fine-pointer hover. Labels and reading layout remain stationary; independent scale preserves RTL arrow rotation.
- Native slider focus/engagement gains a brief tint/halo alongside the existing explicit outline. Thumb position, seek time and numeric values never lag behind input.
- Escape, pointer handoff and page exit release delegated key feedback, complementing blur, cancellation, visibility and unmount cleanup. Native action behavior stays browser-owned.
- Disabled actions and both reduced-motion preferences keep still icons. Reduced motion retains factual slider values and visible feedback.

## Accessibility work

Retain native controls, keyboard actions, visible focus, target sizes, logical order and existing value descriptions. Gate hover on actual fine pointers; never animate sacred text for this polish. OS/app reductions suppress cue movement and make slider feedback immediate. Automated browser coverage cannot certify complete WCAG compliance, physical touch, TalkBack/VoiceOver or representative-device performance.

## Tests added or updated

Cancellation unit regression covers Escape, cross-input pointer handoff, pagehide, visibility and listener cleanup without generated actions. Browser regressions exercise Arabic phone/English desktop Home cues and native magnification under normal motion, app reduction and OS reduction, including disabled recovery and keyboard values. Existing affected Home/Progress/shared-control and audio/sharing browser tests supplement these checks.

## Commands run

| Command                                                                   | Result                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Targeted Vitest: feedback, TasbeehCounterButton, HomeCards, ProgressViews | 4 files, 25 tests passed.                                                                                                                                                                                                                                                                                                                     |
| HomeScreen.render targeted Vitest                                         | 1 file, 16 tests passed.                                                                                                                                                                                                                                                                                                                      |
| Scoped ESLint on initial affected TS/TSX and browser files                | Passed, zero errors/warnings.                                                                                                                                                                                                                                                                                                                 |
| node scripts/check-motion-rules.mjs                                       | Passed: zero errors; existing layout.css overscroll warning retained.                                                                                                                                                                                                                                                                         |
| Initial isolated preview build                                            | Passed in 17.89s; browser API forced to loopback.                                                                                                                                                                                                                                                                                             |
| Browser fixture development                                               | First run exposed pointer-modality focus expectation and a legacy unmounted Home locator; interrupted and corrected fixtures. No product assertion or timeout was weakened.                                                                                                                                                                   |
| motion-control-polish browser recovery matrix, Chromium/Firefox/WebKit    | All six native-slider cases passed. Three Home English cases failed because the fixture assumed optional Qibla was present; keyboard behavior was not changed to accommodate that fixture.                                                                                                                                                    |
| motion-control-polish --grep 'Home cues', same three engines              | Final six cases passed in 1.3 minutes. Cancellation uses real focus loss, with explicit unfocused/no-navigation assertions; this avoids browser-chrome Tab behavior and optional neighboring actions.                                                                                                                                         |
| pnpm check:serial, first combined snapshot                                | Failed in 648.0s: 319 unit files/2,267 tests passed; six concurrent ProgressScreen.wirdGoal tests failed. Formatting failed on the other phase's Mushaf/Progress brief. All other stages passed, including build, types, lint, content/audio timing, type/motion rules, bundle and CSS utilities. Handed both failures to the owning session. |
| git diff --check                                                          | Passed.                                                                                                                                                                                                                                                                                                                                       |

Existing Reader shared-feedback, English compact/expanded seeking and desktop vertical-volume regressions passed: all seven cases across their selected Chromium/Firefox/WebKit projects, 1.0 minute. Logs/results: output/motion-polish-existing-controls.log and output/motion-polish-existing-controls.json. Together with the six native-slider and six final Home cases, all 19 distinct selected browser cases have passing evidence for the frozen motion implementation. No green exact-snapshot receipt is claimed for the first changing-worktree run.

### Final coordinated quality result

After the other session repaired its six retained wird assertions, formatted its brief and finished all 12 compact-date-sheet browser cases across Chromium/Firefox/WebKit, both scopes froze. The one final combined `pnpm check` passed with exit 0 in **209.3 seconds**. Every stage passed: unit tests with enforced coverage (190.8s), production build (40.7s), types (26.5s), lint (31.3s), formatting (84.2s), audio manifest, Quran/listening/owner timings, type scale, motion rules, bundle budgets and CSS utilities. Full log: output/motion-polish-combined-final-check.log.

The gate recorded its normal content-bound pass. This final report metadata is the only subsequent tracked change from this chat; application code/tests remain frozen. Do not fabricate or manually adjust a receipt for the report write, and let the intact hook assess the actual later publishing snapshot. A scoped report-format check and git diff whitespace check follow this metadata update. No full browser inventory, Pages build, CI, production deployment or manual-device acceptance is claimed for this local-only phase. No commit or push was performed.

## Visual/manual evidence

Browser screenshots and JSON/log evidence are retained under output/playwright/motion-polish* and output/motion-polish*. The preview uses its own output/motion-polish-preview directory and loopback port 4198 to avoid changing another session's browser artifact/server. Reviewed Arabic Chromium Home focus and slider screenshots, English desktop Home, and Arabic WebKit slider: clear focus, stable labels and an in-bounds settings surface; WebKit retains its native thumb and the tint/outline alternative. Final Home results: output/motion-polish-final-home.json and output/playwright/motion-polish-final-home; successful slider results: output/motion-polish-recovery-browser.json and output/playwright/motion-polish-recovery. Earlier mixed-result logs remain available rather than being hidden.

## Documentation updated

The motion/design/checklist contracts explain cue parity, disabled/reduced-motion behavior, native range engagement and cancellation. The local phase is indexed and the owner's local-only instruction is recorded in the decision log.

## Decisions recorded

Purposeful animation remains welcome by default. Apply shared, finite feedback without inventing motion for every content block. No religious content, persistence, dependency, release notes, commit, push or deployment change is part of this phase.

On the owner's subsequent explicit coordination request, the active “Improve sharing, filters, and lock” session confirmed the publication hold, retained Progress/Mushaf ownership and stopped its duplicate full check. This chat owns motion feedback and the final combined local quality gate after both scopes freeze. Neither session repeats the other's feature regressions. That session moved its unpublished checkpoint off main without discarding file contents; HEAD is again the deployed 642520bd and all pending changes are uncommitted. This motion phase performs no Git mutation.

## Known limitations or remaining risks

Concurrent owner work is present and continues to change the same workspace; whole-workspace results must be read against their tested snapshot. Real-device touch, assistive-technology slider operation and frame-rate acceptance remain manual. Shared CSS/source coverage does not establish exhaustive behavior across every possible control/state/theme.

## Out-of-scope findings

The unused legacy Home button and unused waveform export are not evidence of active product coverage. No unrelated dead-code cleanup was attempted. Existing functional clock/progress updates and approved Home geometry exceptions remain governed by their own contracts.

## Recommended next step

1. Prioritize short local success/error transitions for real save/download/copy outcomes, with visible recovery and existing status announcements; do not delay the action behind an animation.
2. Apply a single finite icon confirmation when saving/removing an item, with a reachable Undo where reversal helps. Reuse existing favorite/check vocabulary rather than adding whole-card movement.
3. Use a 150–220ms opacity arrival for newly revealed non-reading context when it clarifies a deliberate disclosure. Keep focus, headings and existing reading controls stationary; rapid input cancels obsolete arrivals.
4. Inspect representative phones with touch and TalkBack/VoiceOver, normal and reduced motion, enlarged text and slow-device profiling. Add animation only where observed state changes need clearer feedback. Sliders and chart exploration keep immediate values; avoid chart redraws/count-up numbers that obscure exact facts.

These are prioritized recommendations, not claims of implemented additional features. Technical references: [W3C slider interaction guidance](https://www.w3.org/WAI/ARIA/apg/patterns/slider/) and [browser animation-performance guidance](https://web.dev/articles/animations-and-performance).
