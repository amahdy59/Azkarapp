# Phase 10 — Loading, Empty, Error, Offline, Update and Sync States

## Objective

Create consistent, actionable system feedback across the application.

## Scope

Shared state components and their adoption in relevant screens and asynchronous flows.

## Required reading

- Architecture/offline documentation
- PWA/update hooks
- Sync/auth hooks
- Prayer-time error/cache behavior
- Shared component plan

## Step 1 — Analysis only

Do not edit code. Complete all of the following:

1. Inventory all asynchronous flows and existing states.
2. Identify generic or missing errors.
3. Map which states block the user and which should remain non-blocking.
4. Define retry, dismiss and recovery behavior.
5. Define announcements and focus behavior.
6. Identify offline-safe fallbacks.

Return the plan using the analysis-only format in `docs/agent/PROMPT_LIBRARY.md`.

## Step 2 — Approval gate

Do not implement until the user approves the plan and any required decisions are recorded in `docs/agent/DECISION_LOG.md`.

## Step 3 — Implementation

1. Implement consistent state components and messaging.
2. Add actionable retry/recovery.
3. Preserve local reading during remote failures.
4. Improve offline, update and sync status visibility without persistent clutter.
5. Add permission-denied guidance for location/notifications.
6. Add/update tests for failures and recovery.

## Acceptance criteria

- Every relevant flow has appropriate loading/error/empty/success behavior
- Messages explain what happened and what the user can do
- Remote failures do not block core local reading
- Status is announced accessibly
- Retry does not duplicate writes or corrupt state

## Required tests and evidence

Run targeted failure/recovery tests, `pnpm check` and `pnpm test:e2e`. Manually test offline/reconnect and permission denial.

## Prohibited changes

- No polling introduced without need
- No generic full-screen error for recoverable issues
- No loss of local state
- No silent failure

## Completion output

Use `docs/agent/templates/PHASE_REPORT.md`.
