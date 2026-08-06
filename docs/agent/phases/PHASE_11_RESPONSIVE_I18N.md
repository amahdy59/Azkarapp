# Phase 11 — Responsive, RTL/LTR and Text-Scaling Validation

## Objective

Validate and remediate the complete application across viewport, direction, language and text-size combinations.

## Scope

Cross-screen responsive fixes, logical properties, mixed-direction values, text wrapping and safe areas. No new feature work.

## Required reading

- All prior phase reports
- Responsive and narrow-layout tests
- i18n files
- Design-system direction rules

## Step 1 — Analysis only

Do not edit code. Complete all of the following:

1. Run the full viewport/language/theme matrix.
2. Identify overflow, clipping, overlap and excessive empty space.
3. Identify incorrect directional icon mirroring.
4. Identify mixed Arabic/English/numeric isolation problems.
5. Test 200% zoom and largest app text.
6. Test short landscape height and safe areas.
7. Prioritize issues by task impact.

Return the plan using the analysis-only format in `docs/agent/PROMPT_LIBRARY.md`.

## Step 2 — Approval gate

Do not implement until the user approves the plan and any required decisions are recorded in `docs/agent/DECISION_LOG.md`.

## Step 3 — Implementation

1. Fix responsive and direction defects only.
2. Replace physical properties with logical properties where appropriate.
3. Allow components to grow rather than shrinking text.
4. Preserve semantic DOM order.
5. Update responsive and i18n tests.
6. Update evidence matrix.

## Acceptance criteria

- No horizontal overflow at required widths
- No hidden actions at 200% zoom
- Arabic/English layouts are natural
- Directional icons behave correctly
- Mixed-direction values remain readable
- Short-height and safe-area behavior works

## Required tests and evidence

Run `pnpm check`, full `pnpm test:e2e`, screenshot matrix, 200% zoom manual review and largest-text review.

## Prohibited changes

- No feature redesign
- No array reversal to simulate RTL
- No smaller text as the primary overflow fix
- No language fallback left visible in the wrong locale

## Completion output

Use `docs/agent/templates/PHASE_REPORT.md`.
