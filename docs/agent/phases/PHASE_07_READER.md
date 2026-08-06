# Phase 07 — Reader and Session Experience

## Objective

Refine the central reading and counting flow while preserving source integrity and session data.

## Scope

Reader layout, count interaction, progress, actions, benefit/source overlays, completion and resume behavior.

## Required reading

- Reader contract in `docs/DESIGN_SYSTEM.md`
- Content-authoring rules
- Session hooks/state
- Reader tests and microinteraction tests
- Accessibility requirements

## Step 1 — Analysis only

Do not edit code. Complete all of the following:

1. Trace count/session state and persistence.
2. Map all pointer and keyboard count triggers.
3. Identify accidental activation risks.
4. Verify reader text, translation and source rendering rules.
5. Verify focus and live announcements.
6. Define responsive reading measure.
7. Identify reduced-motion and audio concerns.
8. Define safe undo/recovery opportunities without corrupting state.

Return the plan using the analysis-only format in `docs/agent/PROMPT_LIBRARY.md`.

## Step 2 — Approval gate

Do not implement until the user approves the plan and any required decisions are recorded in `docs/agent/DECISION_LOG.md`.

## Step 3 — Implementation

1. Improve hierarchy and reading comfort using approved tokens.
2. Preserve constrained reading width.
3. Ensure explicit, keyboard-operable count interaction.
4. Prevent unrelated controls from incrementing.
5. Improve progress and completion announcements.
6. Preserve source/benefit sheet accessibility.
7. Respect reduced motion and avoid autoplay.
8. Add/update unit and Playwright coverage.

## Acceptance criteria

- Zikr/source text remains unchanged
- Count and completion work by pointer and keyboard
- Focus remains logical
- Dynamic progress is announced appropriately
- No accidental count from interactive controls
- Reader works at large text and narrow height
- Offline session behavior remains correct

## Required tests and evidence

Run reader unit tests, reader microinteraction Playwright specs, `pnpm check` and `pnpm test:e2e`. Complete manual keyboard and screen-reader reader flow.

## Prohibited changes

- No religious-content edits
- No session-state migration without separate approval
- No autoplay
- No excessive celebration or looping animation
- No removal of existing source access

## Completion output

Use `docs/agent/templates/PHASE_REPORT.md`.
