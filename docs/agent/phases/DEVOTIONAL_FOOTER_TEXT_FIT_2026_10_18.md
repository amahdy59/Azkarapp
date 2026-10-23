# Phase Report — Consistent devotional footer and text fit

## Objective

Apply the owner's requested footer consistency and text-hugging controls across Reader, Masbaha and Salawat on desktop/mobile. Local only.

## Plan before implementation

Inspect shared footer, support actions, primary counter geometry and existing contracts. Reuse existing components, replace constrained label cells with intrinsic-width tools, align visual/keyboard order, retain primary navigation/count behavior, add text-fit regressions and inspect responsive evidence. No planning gate was requested.

## Scope completed

Final single-row implementation and guidance removal are complete locally. All 87 affected browser cases pass across Chromium, Firefox and WebKit. Preserve all unrelated pending changes. Preserve all unrelated pending changes.

## Files changed

- src/app/components/ReaderFooterTools.tsx and test; StandaloneCounterFooter.tsx; reader-footer.css; ZikrComponents.tsx/CSS.
- ReaderScreen.tsx, CustomCounterScreen.tsx and FridaySalawatScreen.tsx remove guidance mounts. CounterGuidance.tsx/tests and useCounterGuidance.ts are removed with the retired feature.
- e2e/reader-control-consistency.spec.ts, devotional-footer.spec.ts, standalone-counter-footer.spec.ts, reader-guidance-layout.spec.ts and reader-microinteractions.spec.ts.
- docs/DESIGN_SYSTEM.md, docs/ARCHITECTURE.md, docs/agent/DECISION_LOG.md, docs/agent/INDEX.md and this report.

## Components added or modified

ReaderFooterTools adds a shared single tools row. StandaloneCounterFooter adopts complete labels. No new component, dependency, storage or remote boundary.

## User-visible changes

Support tools remain on one row. Wide controls hug full labels; compact containers use named 44px icon controls. Counting information strips and hand/reopen buttons are removed globally, including first visits. Header keyboard help, counting and Previous/Next remain.

## Accessibility work

44px targets, full labels on wide controls and accessible names/titles on compact icons, native buttons, localized accessible names, existing focus indicators and return behavior. DOM order follows tools, Focus, primary counter. RTL/LTR and 200% text geometry checks plus scoped axe scans. Human assistive-technology/device acceptance remains separate.

## Tests added or updated

Unit regression for tools/Focus/counter DOM order. Browser coverage expands to 320/390/1440px, both languages, one-row geometry, responsive label/icon presentation, no clipping/ellipsis, viewport bounds, 44px targets, 200% text, focus/escape and axe. Guidance assertions now verify its absence while preserving counting, reading geometry and header keyboard help. Prior equal-tool-grid assertions now verify independently centered tool and primary groups; counting/navigation assertions remain.

## Commands run

| Command                                                                                                                                            | Result                                                                                                                                                                                   |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pnpm test:run ReaderFooterTools.test.tsx CustomCounterScreen.test.tsx FridaySalawatScreen.test.tsx ReaderScreen.audio.test.tsx (full paths in log) | 59 passed, four files, exit 0, 33.01s; output/footer-single-row-units.log.                                                                                                               |
| Chromium: five affected specs filtered to footer, counting, geometry and keyboard-help cases                                                       | 51 passed, exit 0, 3.3m; output/footer-single-row-chromium.log and output/footer-single-row-chromium-results.json.                                                                       |
| Firefox/WebKit: reader-control-consistency.spec.ts                                                                                                 | 36 passed (18 Firefox, 18 WebKit), exit 0, 5.0m; output/footer-single-row-cross.log and output/footer-single-row-cross-results.json.                                                     |
| pnpm check                                                                                                                                         | All stages passed except decision-log formatting, exit 1, 260.5s; output/footer-single-row-quality.log. Unit coverage, build, types, lint, content, motion, bundle and CSS gates passed. |
| pnpm format:check                                                                                                                                  | Passed, exit 0; output/footer-single-row-format-check.log.                                                                                                                               |

## Visual/manual evidence

output/playwright/reader-footer-hug contains language/route/width/text-scale captures. Visually inspected final Arabic desktop Masbaha and phone Salawat: one aligned tool row, full desktop labels, consistent compact icons, and no counting-instruction strip or hand button. Counting and primary controls remain visible. Browser emulation does not replace physical-device or assistive-technology acceptance.

## Documentation updated

Design and architecture contracts, user decision, phase index and this report.

## Decisions recorded

The latest owner correction supersedes the initial wrapped-tools experiment: one tools row, compact icons where needed, and no counting guidance globally. Local only.

## Known limitations or remaining risks

The complete check passed every stage except decision-log formatting; the final repository-wide format recheck then passed. Concurrent workspace/document edits mean no frozen release receipt is claimed. Physical-device and human assistive-technology acceptance remain separate. No publication was requested.

## Out-of-scope findings

No religious text, repetition, persistence, audio ownership, prayer calculations, release notes or deployment changes.

## Recommended next step

Review the local responsive result; retain publication hold.

## Verification history

Initial text-fit checks exposed min-content overflow at 200% text; the grid track was bounded. One intermediate Chromium suite passed 46/48; two failures came from an incorrectly reversed legacy desktop-guidance test assertion. The owner then superseded that behavior with one tool row and no guidance globally. The earlier quality run was stopped on that scope change after its completed build/lint/type/domain stages passed. A cross-browser invocation used a nonexistent desktop-webkit-smoke project and exited without tests; the final run uses the configured mobile-webkit-smoke. All superseded failures remain in their logs.

## Final local acceptance

59 targeted unit tests and 87 browser cases passed. The final full check passed coverage, build, types, lint, content/audio/timing, type-scale/motion, bundle and CSS gates; its only failing formatting stage was subsequently cleared by a passing repository-wide pnpm format:check. No full-check receipt or release readiness is claimed for this concurrently edited workspace. Final screenshots were visually inspected. The retired guidance tests were removed with their deleted feature; screen/browser regressions verify absence plus preserved counting, navigation, reading geometry and header keyboard-help access. No commit, push, deployment or release-note change. Recommended next phase: owner review of the local result, then physical-device and assistive-technology acceptance before any separately authorized release.
