# Phase 00 — Repository Audit and Conflict Register

## Objective

Create a verified map of the current application before changing any code.

## Scope

Analysis and documentation only. Do not modify application source, tests, configuration or existing contracts.

## Required reading

- `AGENTS.md`
- `README.md`
- All top-level documents in `docs/` relevant to architecture, design and quality
- `docs/agent/*`
- `package.json`
- Application structure under `src/`, `e2e/`, `.github/`, `scripts/` and `supabase/`

## Step 1 — Analysis only

Do not edit code. Complete all of the following:

1. Map the application shell, screens, shared components, UI primitives, hooks, state, content, i18n and styles.
2. Identify large or overloaded composition files without assuming they must be split.
3. Inventory shared components and repeated screen-specific patterns.
4. Map all design tokens and hard-coded visual values.
5. Map current navigation and responsive-shell behavior.
6. Map persistence and remote-sync boundaries.
7. Map accessibility automation and manual gaps.
8. Map current Playwright viewport/project coverage.
9. Identify conflicts between existing documentation, screenshots and proposed target state.
10. Specifically analyze the fixed/mobile canvas versus hybrid desktop-shell decision.
11. Produce a prioritized risk register.
12. Recommend whether any roadmap phases should be split based on actual code complexity.

Return the plan using the analysis-only format in `docs/agent/PROMPT_LIBRARY.md`.

## Step 2 — Approval gate

Do not implement until the user approves the plan and any required decisions are recorded in `docs/agent/DECISION_LOG.md`.

## Step 3 — Implementation

No application implementation. Create an audit report proposal only. The user may choose to save the final approved report under `docs/agent/evidence/phase-00/`.

## Acceptance criteria

- Complete architecture/component/test map
- Explicit conflict register
- No code changes
- No unsupported assumptions
- Clear phase order recommendation
- Decisions requiring user approval are isolated

## Required tests and evidence

No build is required if no files are edited. Confirm the working tree is unchanged. Provide references to exact repository paths.

## Prohibited changes

- No refactoring
- No dependency changes
- No styling changes
- No test changes
- No rewriting existing documentation

## Completion output

Use `docs/agent/templates/PHASE_REPORT.md`.
