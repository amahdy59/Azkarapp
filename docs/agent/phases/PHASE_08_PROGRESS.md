# Phase 08 — Progress and Quiet Garden

## Objective

Turn Progress into a useful, accessible and gentle reflection area rather than a duplicate Home screen.

## Scope

Day/week/month/year views, statistics, garden/streak presentation, continuation and accessible chart alternatives.

## Required reading

- Progress calculations and tests
- Quiet garden behavior/tests
- Progress recommendations
- Accessibility requirements for charts/status

## Step 1 — Analysis only

Do not edit code. Complete all of the following:

1. Map existing progress data and what can be derived safely.
2. Separate available data from aspirational metrics.
3. Define day/week/month/year information architecture.
4. Identify new-user empty state.
5. Define chart/list equivalents.
6. Review streak language for pressure or guilt.
7. Identify any state/schema changes requiring separate approval.

Return the plan using the analysis-only format in `docs/agent/PROMPT_LIBRARY.md`.

## Step 2 — Approval gate

Do not implement until the user approves the plan and any required decisions are recorded in `docs/agent/DECISION_LOG.md`.

## Step 3 — Implementation

1. Implement approved period views using existing data where possible.
2. Add accessible text/list equivalents for visualizations.
3. Improve previous/next period labels and disabled states.
4. Create meaningful empty and continuation states.
5. Use gentle language and restrained garden visuals.
6. Add/update progress calculations and tests.
7. Document any approved new derived metric.

## Acceptance criteria

- Progress answers useful user questions
- Home content is not simply duplicated
- Charts are understandable without color or vision
- Empty state guides a new user
- Period navigation is labeled
- No punitive streak language
- Existing progress data remains intact

## Required tests and evidence

Run progress/garden unit tests, relevant Playwright specs, `pnpm check` and `pnpm test:e2e`. Perform screen-reader review of charts/summary.

## Prohibited changes

- No remote analytics requirement
- No destructive state migration without proposal
- No competitive leaderboard
- No fabricated metric unsupported by stored data

## Completion output

Use `docs/agent/templates/PHASE_REPORT.md`.
