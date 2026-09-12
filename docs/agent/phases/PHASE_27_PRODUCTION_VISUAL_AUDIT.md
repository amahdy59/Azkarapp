# Phase 27 — Production Visual Audit

## Objective

Confirm that the Home and Prayer composition layout changes introduced in Phase 26 are rendering perfectly across the responsive matrix on the live production deployment.

## Scope

Visual audit of the production GitHub Pages site across responsive viewports, RTL/LTR, light/dark themes, and assistive features. Record issues and remediate any critical layout bugs.

## Required reading

- `docs/agent/phases/PHASE_26_HOME_PRAYER_COMPOSITION.md`
- `docs/QUALITY_CHECKLIST.md`

## Step 1 — Analysis only

Do not edit code. Complete the following:

1. Identify target URLs on production (`https://amahdy59.github.io/Azkarapp/`).
2. Outline the device/viewport matrix to be tested (e.g., mobile narrow, tablet, desktop).
3. Outline state matrix (e.g., Arabic/English, light/dark, prayer variations).
4. Run manual or automated visual checks against the production site.
5. Propose any remediation for visual regressions or inconsistencies found.

Return the plan using the analysis-only format in `docs/agent/PROMPT_LIBRARY.md`.

## Step 2 — Approval gate

Do not implement fixes until the user approves the audit findings and proposed remediations.

## Step 3 — Implementation

1. Fix any approved layout/visual defects.
2. Update Playwright or Vitest coverage if edge cases were missed.
3. Push remediation commit if needed.

## Acceptance criteria

- Production visual audit covers Home, Prayer Moment, and Azkar Library.
- Identified layout or responsive issues are documented.
- Approved fixes are pushed and deployed successfully.

## Required tests and evidence

- Visual audit results summary.
- Full local gates (`pnpm check`, `pnpm test:e2e`) if any code is modified.

## Prohibited changes

- No further restructuring of the information architecture unless fixing a critical bug.
- No changes to unaffected screens.

## Completion output

Use `docs/agent/templates/PHASE_REPORT.md`.
