# Phase 13 — Performance, Security, PWA and Release Hardening

## Objective

Prepare a stable release candidate after UX and accessibility work.

## Scope

Performance, bundle, dependency, PWA, offline, privacy, security, deployment and release evidence. No new features.

## Required reading

- `README.md` release/deployment sections
- `docs/QUALITY_CHECKLIST.md`
- `docs/ARCHITECTURE.md`
- PWA, Supabase, prayer-time and privacy documents
- `RELEASE_EVIDENCE.md`

## Step 1 — Analysis only

Do not edit code. Complete all of the following:

1. Review bundle output and route graph.
2. Profile suspected performance issues.
3. Review dependency audit.
4. Verify PWA install/update/offline behavior.
5. Verify persistence and synchronization recovery.
6. Verify prayer-time online/cache/offline behavior.
7. Review secrets, environment variables, RLS/schema changes and location privacy.
8. Review deployment workflows and store-readiness gaps.
9. Identify release blockers only; do not invent new features.

Return the plan using the analysis-only format in `docs/agent/PROMPT_LIBRARY.md`.

## Step 2 — Approval gate

Do not implement until the user approves the plan and any required decisions are recorded in `docs/agent/DECISION_LOG.md`.

## Step 3 — Implementation

1. Fix verified release blockers.
2. Optimize only measured bottlenecks.
3. Preserve or improve bundle budgets.
4. Complete release evidence.
5. Update README/docs for changed operational behavior.
6. Produce final risk and rollback summary.

## Acceptance criteria

- All required automated gates pass
- Bundle budgets pass or have explicitly approved measured change
- Core offline flow works
- Sync failure preserves local data
- No secrets are exposed
- PWA update/install behavior is understandable
- Release evidence is complete
- No unresolved release blocker remains

## Required tests and evidence

Run `pnpm check`, `pnpm test:e2e`, `pnpm build:pages`, `pnpm audit:prod` and complete manual release evidence.

## Prohibited changes

- No new feature
- No speculative optimization
- No disabling service worker or tests to avoid failures
- No security or privacy claim without evidence

## Completion output

Use `docs/agent/templates/PHASE_REPORT.md`.
