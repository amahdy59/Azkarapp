# Phase 02 — Design and Accessibility Foundations

## Objective

Establish the approved global tokens and interaction foundations before screen redesign.

## Scope

Theme tokens, global typography, spacing, radius, elevation, focus, control boundaries, reduced motion/transparency foundations and approved responsive-shell contract documentation.

## Required reading

- Approved Phase 00 decision log
- Baseline evidence
- `docs/DESIGN_SYSTEM.md`
- `docs/agent/DESIGN_SYSTEM_DELTA.md`
- `src/styles/*`
- Shared UI primitives

## Step 1 — Analysis only

Do not edit code. Complete all of the following:

1. Inventory current semantic tokens and all hard-coded values that block consistent redesign.
2. Measure contrast in all current themes.
3. Identify focus-ring inconsistencies.
4. Identify radius, shadow and spacing drift.
5. Propose the smallest token delta.
6. Confirm the approved wide-screen shell strategy.
7. Identify tests that protect tokens and global behavior.

Return the plan using the analysis-only format in `docs/agent/PROMPT_LIBRARY.md`.

## Step 2 — Approval gate

Do not implement until the user approves the plan and any required decisions are recorded in `docs/agent/DECISION_LOG.md`.

## Step 3 — Implementation

1. Implement approved semantic tokens and mappings.
2. Standardize focus-visible behavior.
3. Stabilize functional surfaces and control boundaries.
4. Improve global text scaling and logical CSS behavior.
5. Ensure reduced-motion behavior is complete.
6. Add reduced-transparency tokens only if approved.
7. Update `docs/DESIGN_SYSTEM.md` and decision log for adopted contracts.
8. Add tests for global contracts where practical.

## Acceptance criteria

- Default theme combinations meet AA contrast for named roles
- Focus is visible and consistent
- Tokens replace new one-off styling
- No screen receives a standalone redesign
- RTL/LTR global behavior remains correct
- Existing core flow remains functional

## Required tests and evidence

Run `pnpm check`, targeted accessibility/style tests and `pnpm test:e2e`. Capture representative token/component evidence in all themes.

## Prohibited changes

- No screen-specific layout redesign
- No new icon library
- No replacement CSS framework
- No arbitrary bundle-budget increase
- No silent responsive-shell change without approved decision

## Completion output

Use `docs/agent/templates/PHASE_REPORT.md`.
