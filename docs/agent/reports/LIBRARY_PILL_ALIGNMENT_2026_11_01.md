# Phase Report — Library pill alignment remediation

## Objective

Repair the exact-commit CI responsive alignment regression while retaining the requested inset pill design and all release gates.

## Scope completed

The compact Library title reserves the same minimum footprint as the inset tab track, preserving the shared title top. The inset track retains its border/padding and 44px options. The old track-equals-option-height assertion is replaced by symmetric measured insets; exact title/icon centres, equal options, widths, control spacing, no overflow and keyboard behavior remain asserted at 320/390px and 100/200% text in Arabic/English.

## Files changed

Library/progress screen styles, Button icon feedback, e2e/responsive.spec.ts, e2e/glass-refinement.spec.ts, public/release-notes.json, archived release history and this phase's brief/report. No content, persistence, notification or calculation code changes.

## Components added or modified

Compact Library title height matches the track; the adjacent Progress date field receives matching vertical insets. Icon-sized Button uses data-press-compact for motion without inheriting ui-icon-button minimum dimensions. The Glass test checks the actual context-inherited muted token. No new component, dependency, listener or animation is introduced.

## User-visible changes

Library title and rounded section switch share a vertical centre, including enlarged text. Release .7 describes only this follow-up since deployed .6.

## Accessibility work

Existing tab semantics, keyboard navigation, labels/counts, visible focus and 44px targets remain. Geometry tests retain narrow/enlarged layouts in both directions; no accessibility assertion or tolerance was removed to conceal the regression.

## Tests added or updated

Responsive pill test now verifies actual inset-track anatomy as well as existing exact alignment and interaction assertions. The first .6 CI run's four failed cases and job logs remain in output/ci-responsive-job.log and output/ci-first-use-responsive.

## Commands run

| Command                                                                                        | Result                                                                                              |
| ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Targeted responsive Library pill tests: mobile/tablet Chromium, Firefox and WebKit, one worker | See output/library-pill-alignment-proof.log; phone/tablet and both directions/text scales retained. |
| Targeted Prettier and git diff --check                                                         | Passed.                                                                                             |

The complete final quality/hook/CI/deployment results are retained in output/release-library-alignment-*. Logs, not this report, establish release completion.

## Visual/manual evidence

The responsive suite captures bilingual Library phone pill evidence. The prior .6 custom-domain production smoke passed HTTP 200, eight fresh presets, actual sourced reminder, palm/Library disclosures and offline counting 0 to 1 with no page errors; both worker and manifest returned no-store/no-cache/must-revalidate.

## Documentation updated

The brief records the confirmed cause and plan; this report distinguishes changed design anatomy from retained assertions. Fresh three-entry bilingual notes and archived history identify the follow-up.

## Decisions recorded

Retain the owner-requested pill track rather than remove its padding to satisfy an obsolete geometry assumption. Keep exact alignment and full release verification.

## Known limitations or remaining risks

Complete exact-commit CI and both hosting production checks remain required. Physical-device and human assistive-technology acceptance remain separate.

## Out-of-scope findings

Completed Chromium/Firefox/WebKit logs also identified enlarged Ayah-sharing icon overflow and adjacent Progress control misalignment. Both are repaired through existing geometry/feedback recipes. Enlarged Ayah-sharing passed all six original bilingual/engine cases; full page-layout, Glass and protected-dropdown assertions are retained.

## Recommended next step

Finish all failed-job diagnosis, push through intact local gates, and verify exact-commit Quality/Pages and live application.
