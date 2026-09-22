# Phase 51 — Cloudflare sync and visitor count

## Objective

Provide a free-tier Cloudflare backend for privacy-safe visitor counting and
short-lived QR device pairing while preserving offline-first behavior.

## Scope completed

- Created and migrated the `azkarapp-production` D1 database.
- Deployed `azkarapp-api` Worker with device, pairing, snapshot, and visitor APIs.
- Added Home visitor count with local anonymous visitor ID.
- Added Account & data QR pairing UI and Cloudflare snapshot hydration/push.
- Added Arabic and English copy, CSP allowance, and Pages deployment configuration.

## Known limitation

Public email OTP is not enabled on the free tier. Existing Supabase auth remains
available only where configured; QR pairing is the supported Cloudflare path until
Cloudflare Email Service is enabled.
