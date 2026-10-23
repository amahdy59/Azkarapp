# Masbaha and Salawat footer/picker repair — 2026-10-21

## Objective and plan before editing

The owner supplies an icons-only Masbaha screenshot with a squeezed Benefit label and asks to repair the equivalent Salawat footer and show longer, more uniform zikr options. Both Benefit spans omit the shared reader-tool-label marker. Reuse existing footer anatomy and preferences, add that marker in both hosts, and preserve labelled mode, counting, focus and navigation.

Some reviewed Masbaha short names contain literal ellipses. For those menu previews only, display the existing complete localized text with a responsive two-line visual clamp, retaining full DOM/title text and the original concise trigger. Use consistent option spacing and a separate saved-count column. Apply the same bounded option anatomy to Salawat names/previews. Preserve protected portalled/collision-aware dropdowns, viewport limits, keyboard/focus recovery, RTL/LTR and enlarged-label reflow. Do not edit reviewed readings, names, targets, persistence or dependencies.

Add unit coverage for expanded existing text and regressions for icons/labels, both screens, menu geometry/opacity/keyboard selection and 320px/200% text. Capture actual browser evidence. This is a small patch, not a redesign; publishing still follows the standing full local hook and exact-commit CI/Pages/production release policy. No verification bypass or reduced assertions.

## Verification

The new 320px/200% hit tests also reproduce target-field overlap in both counter headers: an intrinsic nonshrinking Target field covers the dwindling reading trigger. Let the two existing fields wrap with equal zero-minimum flexible bases instead of shrinking their text or targets. The same regression must prove both pickers remain clickable. Direct menu focus resolves the increased-list scroll accessibility finding; retain axe assertions.

Results, deployment identity and remaining device acceptance will be recorded in the phase report.

Final targeted coverage: 40 unit tests pass. All 12 new Chromium, Firefox and WebKit route/language cases pass, including 320px/200% reflow, menu opacity/geometry, keyboard recovery and unchanged counts. The preceding combined run also passed all 24 existing standalone-footer cases; its four WebKit failures identified the trigger-focus defect repaired here. Evidence and exact release results: `output/counter-footer-pickers-release-2026-10-21/PHASE_REPORT.md`.

WebKit pointer activation did not focus either standalone Benefit trigger, so closing its sheet returned to an unrelated prior element. Match the existing CounterKeyboardHelp pattern: focus the native button without scrolling before opening the sheet. Keep the same count-neutral click and explicit focus-recovery regression in all engines.

The focused Chromium matrix passes all four route/language cases after fixing: the missing label markers, scrolling-menu tab access, 200% paired-field overlap, collision-aware menu max-height and collapsed reading/footer space. A 16rem minimum canvas lets the existing native screen scroll reveal enlarged footer controls. No assertion or timeout was weakened. Initial diagnostics (invalid Playwright matcher, stale short-name unit expectation and genuine enlarged-layout failures) remain recorded under output/counter-footer-pickers*. Full targeted/release evidence follows in the phase report. References informing the bounded preview/reflow approach: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/line-clamp and https://www.w3.org/WAI/WCAG22/Understanding/reflow.html.
