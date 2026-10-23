# Phase Report — Combined release, 2026-10-18

## Objective

Publish all pending changes under the owner's explicit request, superseding prior local-only holds.

## Scope completed

Inspection confirms main matches origin/main. Combine the approved Home layout/action bounds, glass/scroll materials, compact prayer summaries/selection, Reader surfaces/default collapsed panel/shared title rows and read-only Progress statistics. Preserve content, data and deployment contracts. Plan: inspect diff and phase evidence, refresh bilingual notes, run affected browser checks, commit all intended files, push through intact hooks, inspect exact-commit Quality and Pages, then verify production.

## Files changed

All pending source, unit/browser and documentation changes listed in the combined commit. Fresh public/release-notes.json at 2026-10-18.1. No new dependency or reviewed devotional content change.

## Components added or modified

Shared material/header/card primitives; Home/prayer selection and scroll hooks; ReadingHeroToolbar and Reader shell; PrayerProgressSummary and read-only routine/Friday views. Domain-specific reports retain detailed inventories.

## User-visible changes

Simpler statistics-only Progress, compact prayer cards, aligned Home actions/cards, consistent glass and scroll presentation, shorter Reader headers and initially collapsed collection panel.

## Accessibility work

Preserve native keyboard/focus, 44px actions, RTL/LTR, enlarged text, reduced motion/transparency and opaque fallbacks. Optional exact records retain table semantics and a keyboard-scrollable region. Human assistive-technology/device acceptance remains outstanding.

## Tests added or updated

Existing and new focused regressions cover Home geometry/actions, prayer selection/collapse, material/scroll behavior, Reader headers/sidebar/audio expectations and read-only statistics with unchanged saved data.

## Commands run

Combined affected browser run: 60 passed / 12 failed initially (2.3m). Six Home cases expected superseded 14px header/68px footer geometry; updated to approved 10px/52px and the actual 9rem container breakpoint. Six Progress integrity cases compared a legacy seed before startup normalization; canonical complete-level records and empty habits remove that fixture race without changing the exact before/after equality assertion. All 12 corrected cases passed (35.4s, exit 0). Logs: output/combined-release-features.log and output/combined-release-corrections.log. All 72 selected cases have passing final checks. git diff --check passed. Intact pre-push gates and exact-commit CI/Pages pending. Prior read-only Progress gate passed all stages in 413.1s and 18 cross-engine responsive statistics cases passed. These do not replace the frozen combined snapshot's hook/CI verification.

## Visual/manual evidence

Existing phase captures under output/playwright and documented Home/Reader evidence. Production evidence pending.

## Documentation updated

Owner decision/index, release notes and this report. Earlier phase local-only statements describe historical authority; this request supersedes them.

## Decisions recorded

Explicit owner instruction: continue and push all changes.

## Known limitations or remaining risks

Complete browser matrix runs in mandatory CI. Local affected feature tests and hook gates remain intact. Concurrent checkout edits invalidate receipt reuse; never bypass the hook.

## Out-of-scope findings

No unrelated configuration remediation identified during initial inspection.

## Recommended next step

Complete exact-commit Quality/Pages and production verification.
