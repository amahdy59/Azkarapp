# Phase Report — Phase 25A: Push security foundation

## Objective

Make the dormant Supabase account boundary reproducible and least-privileged before any closed-app Push API subscription or scheduler is introduced.

## Scope completed

- Added an ordered initial migration for the four base account tables, RLS, owner policies, indexes, and grants.
- Added a privilege-hardening migration for existing projects.
- Made migrations the single deployment source of truth and demoted `schema.sql` to a generated review snapshot.
- Closed local token, private-cache, and duplicate saved-zikr sync gaps.

## Files changed

- Supabase schema/migrations and setup documentation
- Account sync, sign-out, and local-erasure boundaries
- State, auth, and schema regression tests
- Architecture, audit checklist, decision log, and phase index

## Components added or modified

No visual component changed. Persistence and account-service boundaries only.

## User-visible changes

- Erasing local data now also invalidates/removes the local account session.
- Signing out removes private recent-search and retired location-cache remnants while preserving device preferences and downloads.
- Re-saving the same zikr from multiple devices no longer requires an update permission the table intentionally does not grant.

## Accessibility work

No UI changed. Existing confirmation, error, and recovery semantics are preserved.

## Tests added or updated

- Local erasure covers Supabase tokens and dependency-owned review data.
- Sign-out covers only private cache namespaces.
- Schema tests require initial RLS and least-privilege migrations.
- Saved-zikr sync tests require conflict-ignore insertion.

## Commands run

| Command               | Result             |
| --------------------- | ------------------ |
| Focused Vitest suites | 82 passed          |
| `pnpm check`          | Pending final gate |
| `pnpm test:e2e`       | Pending final gate |
| `pnpm build:pages`    | Pending final gate |

## Visual/manual evidence

Not applicable: no rendered surface changed.

## Documentation updated

README, Supabase setup, architecture, audit checklist, decision log, and phase index.

## Decisions recorded

DEC-167.

## Known limitations or remaining risks

- Docker is unavailable on this host, so a clean local `supabase db push` replay cannot be run here.
- The Supabase CLI is not installed; an on-demand download also failed, so connected-project RLS isolation remains required before enablement.
- Provider flags remain off and no push subscription or server scheduler is enabled.

## Out-of-scope findings

Production closed-app push still requires a reviewed identity/legal contract, VAPID secret management, subscription lifecycle, service-worker push handling, and scheduled delivery.

## Recommended next step

Phase 25B: define the privacy-preserving subscription/schedule data model and service-worker delivery contract, then verify it against a connected Supabase project before production enablement.
