# Phase 04 — Responsive Shell and Navigation

## Objective

Implement the approved mobile, tablet and desktop shell while preserving focused reading widths.

## Scope

Layout shells, top-level navigation, active states, safe areas, responsive content containers and browser-history behavior.

## Required reading

- Approved DEC-001
- `docs/ARCHITECTURE.md` navigation section
- `docs/DESIGN_SYSTEM.md` responsive shell
- Existing LayoutShell/navigation components
- Navigation and responsive e2e tests

## Step 1 — Analysis only

Do not edit code. Complete all of the following:

1. Map current view state, history and focus behavior.
2. Identify shell variants by viewport and screen type.
3. Define mobile bottom nav, tablet rail/drawer and desktop sidebar behavior.
4. Define focused-reader exception.
5. Identify active-state, keyboard and safe-area tests.
6. Identify documentation clauses that must change.

Return the plan using the analysis-only format in `docs/agent/PROMPT_LIBRARY.md`.

## Step 2 — Approval gate

Do not implement until the user approves the plan and any required decisions are recorded in `docs/agent/DECISION_LOG.md`.

## Step 3 — Implementation

1. Implement the approved shell variants.
2. Preserve typed view/history architecture.
3. Add `aria-current` and accessible navigation labeling.
4. Remove duplicated language/theme controls from navigation if approved.
5. Preserve safe-area behavior.
6. Update responsive and navigation tests.
7. Update authoritative design documentation.

## Acceptance criteria

- Navigation is clear at all target viewports
- Active state is not color-only
- Browser back behavior remains predictable
- Reader remains comfortably constrained
- No horizontal overflow at 320 px
- Keyboard and screen-reader navigation work
- Arabic and English layouts are correct

## Required tests and evidence

Run `pnpm check`, navigation/responsive Playwright specs and full `pnpm test:e2e`. Capture all viewport/language/theme shell evidence.

## Prohibited changes

- No redesign of screen internals
- No router replacement
- No view-state rewrite unless separately approved
- No duplicated top-level destinations

## Completion output

Use `docs/agent/templates/PHASE_REPORT.md`.
