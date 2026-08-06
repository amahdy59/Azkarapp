# Phase 03 — Shared Accessible Components

## Objective

Consolidate repeated patterns into reusable components with complete interaction states.

## Scope

Buttons, icon buttons, cards, navigation items, tabs/radio choices, routine rows, category cards, settings rows, progress and system-state primitives.

## Required reading

- Phase 02 foundations
- `docs/agent/COMPONENT_ARCHITECTURE.md`
- Existing `src/app/components` and `components/ui`
- Relevant WAI-ARIA APG patterns

## Step 1 — Analysis only

Do not edit code. Complete all of the following:

1. Inventory existing components and duplicate markup.
2. Classify each pattern as extend, refactor, merge or leave local.
3. Define component APIs and semantic elements.
4. Identify migration order to avoid a large-bang rewrite.
5. Define keyboard, focus, RTL/LTR and state tests.

Return the plan using the analysis-only format in `docs/agent/PROMPT_LIBRARY.md`.

## Step 2 — Approval gate

Do not implement until the user approves the plan and any required decisions are recorded in `docs/agent/DECISION_LOG.md`.

## Step 3 — Implementation

1. Implement or extend approved shared components.
2. Migrate a small representative usage before broad adoption.
3. Add component tests for semantics and keyboard behavior.
4. Document component contracts in the design system or component file comments where appropriate.
5. Keep compatibility adapters temporary and clearly marked if needed.

## Acceptance criteria

- Repeated patterns are reduced
- Components use semantic tokens
- States are complete
- Keyboard and accessible names are tested
- RTL/LTR behavior is verified
- No screen behavior is unintentionally changed

## Required tests and evidence

Run component/unit tests, `pnpm check`, and relevant Playwright tests. Capture a component-state matrix if a visual harness exists.

## Prohibited changes

- No full screen redesign
- No speculative generic component with no real use
- No deeply configurable “god component”
- No duplicate primitive libraries

## Completion output

Use `docs/agent/templates/PHASE_REPORT.md`.
