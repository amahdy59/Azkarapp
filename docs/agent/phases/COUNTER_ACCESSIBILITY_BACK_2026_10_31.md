# Counter accessibility, Android Back and release headroom — 2026-10-31

## Objective and approved plan

The owner approves applying the reviewed recommendations with accurate tests. Preserve all existing pending repairs and the production hold: no commit, push or deployment.

1. Reduce verified unused CSS/duplicated build metadata without changing thresholds, emitted resources or reviewed content.
2. Add a restrained keyboard-only inset focus cue to scrollable reading regions, superseding DEC-062's no-outline treatment for those focusable regions. Keep completion counters focusable and non-operable until reset/advance; verify keyboard continuation.
3. Dismiss the foremost open overlay before native Android navigation or exit, preserving listening lock, nested modal focus and ordinary Back behavior. Use existing modal primitives and no dependency or history traps.
4. Share a small counter-announcement policy: short counts individually, longer counts at bounded milestones and completion. Preserve haptic/sound settings and validate reset/restored state.
5. Exercise real touch scrolling at enlarged text, targeted theme contrast and Home completed-state persistence. Fix demonstrated issues; retain purposeful motion, typography roles and layout. Limit structural extraction to reusable behavior/presentation with proven benefit; no global provider/state rewrite.
6. Run affected unit/browser tests, full pnpm check and Pages build, retain screenshots and exact evidence in a structured report. Native/device acceptance remains separate while Java/device access is unavailable.

## Boundaries

No religious text/count edits, schema changes, dependency additions, gate weakening or unrelated refactors. The existing light-theme primary and persistent Home completion tiles remain unless an actual failing case is measured.

## Local result

Implementation and local checks completed. See [the structured report](../reports/COUNTER_ACCESSIBILITY_BACK_2026_10_31_REPORT.md) for exact results, screenshots, repaired development failures, build headroom and remaining device/toolchain limitations. Production remains on hold.
