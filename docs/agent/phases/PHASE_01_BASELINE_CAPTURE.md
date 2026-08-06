# Phase 01 — Baseline Capture

## Objective

Create reproducible evidence of the current application before redesign begins.

## Scope

Test/evidence tooling and baseline artifacts only. Avoid user-visible redesign.

## Required reading

- Phase 00 approved audit
- `docs/QUALITY_CHECKLIST.md`
- `docs/agent/TEST_STRATEGY.md`
- Current Playwright configuration and e2e tests

## Step 1 — Analysis only

Do not edit code. Complete all of the following:

1. Identify existing screenshot and reporting capabilities.
2. Define the exact routes/states needed for Home, Library, Reader, Progress, Settings and Accessibility.
3. Define fixture/state setup for not-started, in-progress and completed states.
4. Identify which baseline checks can be automated and which require manual evidence.
5. Propose evidence storage that does not bloat production bundles.

Return the plan using the analysis-only format in `docs/agent/PROMPT_LIBRARY.md`.

## Step 2 — Approval gate

Do not implement until the user approves the plan and any required decisions are recorded in `docs/agent/DECISION_LOG.md`.

## Step 3 — Implementation

1. Add or refine baseline screenshot tests where appropriate.
2. Capture the viewport/language/theme matrix defined in the test strategy.
3. Run current axe scans and record findings without prematurely fixing unrelated issues.
4. Record current keyboard, text zoom, RTL/LTR and offline observations.
5. Record current production build/bundle result.
6. Create a dated baseline summary.

## Acceptance criteria

- Baseline can be reproduced
- No intentional visual redesign
- Important app states are represented
- Current failures are clearly separated from newly introduced failures
- Evidence paths are documented

## Required tests and evidence

Run `pnpm check`, relevant Playwright screenshot/e2e tests, and `pnpm build:pages`. Record exact results.

## Prohibited changes

- No broad component refactor
- No token redesign
- No deletion of failing evidence
- No change to product behavior solely to make screenshots easier

## Completion output

Use `docs/agent/templates/PHASE_REPORT.md`.
