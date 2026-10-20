# Protected dropdowns — 2026-10-20

## Objective and authority

The owner supplies a Quran Juz picker screenshot showing competing underlying text/actions and requests a local fix plus a durable rule across layouts and color modes. No commit, push or deployment.

## Inspection and plan before editing

AccessibleCombobox positions its popup absolutely inside the card, uses ordinary translucent bg-card, and has no collision/available-height handling. Search and options can show underlying form text, and later content can paint over the popup. Shared Select and DropdownMenu already portal but need the same protected surface contract.

1. Reuse the installed Radix Popover for searchable pickers: portal, collision positioning, trigger width, viewport bounds, independent list scrolling and explicit focus recovery. Preserve search, selection, draft state and keyboard behavior.
2. Mark all shared dropdown surfaces explicitly. Require opaque theme-aware protection, including supported Glass and accessibility/no-filter fallbacks; the searchable list borrows the popup surface. Preserve the surrounding Glass canvas.
3. Add component and browser regressions for popup ownership, stacking/hit testing, search/icon separation, keyboard selection, scroll/resize recovery, text enlargement, RTL/LTR and all color/material modes. Update the durable repository/design/quality rules.
4. Run affected unit/browser suites, lint/type checks and the complete non-browser gate. Report exact outcomes and visual evidence, preserving unrelated pending work.
