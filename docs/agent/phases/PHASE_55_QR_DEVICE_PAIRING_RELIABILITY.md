# Phase 55 — QR Device Pairing & Cloudflare Backend Reliability

## Status

- **Date:** 2026-09-23
- **Phase:** 55
- **Decision:** DEC-197
- **Status:** Complete

## Objective

Harden Cloudflare device pairing and sync reliability, prevent orphaned database records, eliminate 409 revision sync races, and provide a clear, decoupled UI with countdown timer and confirmation safeguards.

## Changes Made

- **Cloudflare Worker Backend (`cloudflare/worker.ts`)**:
  - Replaced hardcoded localhost:5173 with regex supporting all localhost and 127.0.0.1 ports for smooth local testing across Vite port assignments.
  - Returned `{ ok: true, revision: nextRevision, updatedAt: now }` on `PUT /v1/sync`.
  - Updated device `last_seen_at` on every sync (`GET` & `PUT`) and pairing generation.
  - Automatically deleted expired pairing tokens (`expires_at < now`) on pairing attempts.
  - When the last device is unlinked from an account (`DELETE /v1/devices/current`), cleanly purged the account row, pairing tokens, and sync snapshots.
- **Client Sync Hook & Library (`src/lib/cloudflareSync.ts`, `src/app/hooks/useCloudflareDeviceSync.ts`)**:
  - Returned the authoritative revision from `saveCloudflareSnapshot` and tracked it in `revision.current`.
  - On new device hydration without an existing remote snapshot, automatically seeded the remote database with local state.
- **Settings UI (`src/app/screens/settings/QrSyncPanel.tsx`, `src/app/i18n/en.ts`, `src/app/i18n/ar.ts`)**:
  - Split layout into two distinct cards: "This Device" and "Link Another Device".
  - Added connection status indicator badge (green when linked, muted when unlinked).
  - Added explicit confirmation prompt before unlinking, reassuring users that local reading progress remains preserved.
  - Added a live 5-minute countdown timer on generated QR codes with an expired notice and refresh action.
  - Added unit test suite in `src/app/screens/settings/QrSyncPanel.test.tsx`.

## Verification

- `pnpm vitest run src/app/screens/settings/QrSyncPanel.test.tsx src/lib/remoteSyncSnapshot.test.ts src/app/i18n/parity.test.ts`
- All tests passing.
