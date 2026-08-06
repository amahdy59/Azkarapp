# Phase 05 — Home Page

## Objective

Create a focused time-aware home page with one primary next action and clear daily routine states.

## Scope

Home screen and directly shared components required by Home. Preserve routine/session data semantics unless explicitly approved.

## Required reading

- `SCREEN_RECOMMENDATIONS.md` Home section
- Home-related design-system contracts
- Time/prayer recommendation logic
- Home and progress-related tests

## Step 1 — Analysis only

Do not edit code. Complete all of the following:

1. Map current Home modules, actions and data sources.
2. Identify duplicate actions and competing hierarchy.
3. Confirm complete/short mode semantics.
4. Define target layout by viewport.
5. Define routine-row states and continuation behavior.
6. Define contextual Friday visibility rules.
7. Identify contrast and image-surface risks.

Return the plan using the analysis-only format in `docs/agent/PROMPT_LIBRARY.md`.

## Step 2 — Approval gate

Do not implement until the user approves the plan and any required decisions are recorded in `docs/agent/DECISION_LOG.md`.

## Step 3 — Implementation

1. Restrict imagery to a controlled hero/context region.
2. Create one dominant contextual CTA.
3. Simplify daily routine rows to one clear interaction model.
4. Separate devotional action from garden/progress metrics.
5. Show resume state when present.
6. Make mode, count and estimated duration understandable.
7. Apply contextual Friday presentation.
8. Add/update Home tests and screenshots.

## Acceptance criteria

- One primary CTA above the fold
- No duplicate action for the same destination
- Routine rows expose title, count, duration and state
- Functional text uses stable contrast
- Home works at 320 px and desktop
- Arabic/English and light/dark are validated
- Current recommendation logic remains correct

## Required tests and evidence

Run targeted Home tests, `pnpm check`, `pnpm test:e2e`, axe scan and viewport screenshot matrix for Home states.

## Prohibited changes

- No Reader redesign
- No change to prayer-time domain logic without separate approval
- No new gamification mechanic
- No content/source edits

## Completion output

Use `docs/agent/templates/PHASE_REPORT.md`.
