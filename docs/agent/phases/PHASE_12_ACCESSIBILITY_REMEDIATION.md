# Phase 12 — Accessibility Audit and Remediation

## Objective

Perform the final WCAG-focused audit, fix findings and collect manual evidence.

## Scope

All core screens and flows. Accessibility remediation only; avoid unrelated aesthetic changes.

## Required reading

- `ACCESSIBILITY_REQUIREMENTS.md`
- WCAG 2.2
- WAI-ARIA APG
- Existing accessibility tests
- All prior phase evidence

## Step 1 — Analysis only

Do not edit code. Complete all of the following:

1. Run automated scans across core routes and states.
2. Perform keyboard-only flow.
3. Perform desktop and mobile screen-reader flows.
4. Review focus order/visibility/obscuring.
5. Review names, roles, states and announcements.
6. Measure contrast including text over imagery.
7. Test target size, text zoom, reduced motion and color independence.
8. Classify findings by severity and success criterion where confident.

Return the plan using the analysis-only format in `docs/agent/PROMPT_LIBRARY.md`.

## Step 2 — Approval gate

Do not implement until the user approves the plan and any required decisions are recorded in `docs/agent/DECISION_LOG.md`.

## Step 3 — Implementation

1. Fix critical and high findings.
2. Fix medium findings where feasible; record deferred items explicitly.
3. Add regression tests for every automatable finding.
4. Update accessibility evidence and quality checklist records.
5. Do not overuse ARIA when native semantics solve the issue.

## Acceptance criteria

- No critical/high accessibility finding remains open
- Core flow is keyboard-completable
- Core flow is screen-reader-completable
- Default themes meet contrast requirements
- Focus is visible and not obscured
- Dynamic states are understandable
- Manual evidence is dated and recorded

## Required tests and evidence

Run `pnpm check`, `pnpm test:e2e`, targeted axe tests and the manual checks in release evidence.

## Prohibited changes

- No claim of full compliance based only on automation
- No ARIA role added without correct interaction behavior
- No hiding inaccessible content from scans instead of fixing it
- No visual redesign unrelated to findings

## Completion output

Use `docs/agent/templates/PHASE_REPORT.md`.
