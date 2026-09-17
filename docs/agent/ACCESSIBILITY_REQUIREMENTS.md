# Accessibility Requirements

## Standard

Target WCAG 2.2 Level AA for core product flows and default themes. Treat enhanced/AAA contrast as an optional target, not a substitute for an accessible baseline.

Primary references:

- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- WAI-ARIA APG: https://www.w3.org/WAI/ARIA/apg/
- Manual accessibility testing: https://web.dev/learn/accessibility/test-manual

## 1. Semantics and structure

- One `main` landmark per view.
- Logical heading hierarchy.
- Navigation has an accessible label.
- Controls have visible labels or reliable accessible names.
- Use native elements before ARIA.
- Arabic document state uses `lang="ar"` and `dir="rtl"`; English uses `lang="en"` and `dir="ltr"`.
- Mark substantial inline language changes.

## 2. Keyboard

- All actions work without a pointer.
- Tab order follows logical task order.
- No positive `tabindex`.
- Composite widgets follow expected arrow-key patterns.
- Escape dismisses dialogs, menus and drawers where appropriate.
- Focus returns to a logical trigger after dismissal.
- No keyboard traps.

## 3. Focus

- Every focusable control has a visible indicator.
- Focus is not hidden by sticky headers, footers, sheets or overlays.
- Route/view changes move or announce focus deliberately.
- Validation errors receive useful focus or summary behavior.

## 4. Contrast and color

- Normal text: at least 4.5:1.
- Large text: at least 3:1.
- Meaningful control boundaries and graphical indicators: at least 3:1 against adjacent colors.
- Do not use color alone for selection, completion, error, progress or chart meaning.
- Measure actual computed colors, including transparency over images.

## 5. Target size

- Ordinary interactive targets should be at least 44×44 CSS px.
- Maintain spacing between compact adjacent targets.
- Document any inline-text exception and provide keyboard/focus support.

## 6. Text and reflow

Validate:

- 200% browser text zoom
- 400% page zoom/reflow where applicable
- Largest in-app text setting
- WCAG text-spacing overrides
- 320 CSS px viewport
- Arabic and English long strings

No essential content or action may be clipped, overlapped or require two-dimensional scrolling in ordinary use.

## 7. Motion

- Respect `prefers-reduced-motion`.
- Avoid flashing, parallax, looping decorative motion and unnecessary large movement.
- Do not delay navigation for decoration.
- Provide non-motion feedback for completion and state changes.

## 8. Dynamic status

Use appropriate live/status behavior for:

- Search results
- Saved/unsaved confirmation
- Download progress and completion
- Offline/online transitions
- Sync results
- Prayer-time refresh results
- Repetition and session completion
- Validation and recoverable errors

Do not make the complete screen a live region.

## 9. Dialogs, menus, tabs and radio groups

- Dialogs have names, descriptions where useful, focus containment and reliable dismissal.
- Menus are used only for menu-like actions, not ordinary navigation lists.
- Tabs expose `tablist`, `tab`, `tabpanel`, selected state and keyboard behavior.
- Mutually exclusive appearance/mode choices use radio-group semantics.
- Switches expose current state and control a binary preference.

## 10. Charts and progress

- Provide labels and numeric values.
- Provide a textual or tabular equivalent.
- Use shape, pattern, label or icon in addition to color.
- Progress bars expose accessible name, value, min and max.

## 11. Screen-reader testing flows

Test at minimum:

1. Launch/onboarding
2. Home recommendation
3. Start and complete a routine
4. Search and open a collection
5. Save/unsave a zikr
6. Open benefit/source content
7. Review progress
8. Change language and appearance
9. Configure accessibility settings
10. Recover from offline or sync error

Use at least one desktop screen reader and one mobile screen reader before release.

## 12. Automated testing

Maintain axe-core and JSX-a11y coverage, but do not treat zero automated violations as proof of full conformance. Manual review is required for meaning, focus order, text over images, screen-reader language, chart alternatives and cognitive usability.
