# Phase Report — Active visitor presence (Phase 62)

## Objective

Replace the cumulative all-time visitor total with a privacy-safe estimate of people currently using the application.

## Scope completed

- Moved presence ownership to the application shell so navigation away from Home does not end an open visit.
- Added an immediate heartbeat, a 30-second visible-app refresh, and refresh on return to the app.
- Added D1 `last_seen_at` persistence and a 90-second active window.
- Limited retained presence records to 24 hours and removed IP/browser inputs when the local anonymous visitor ID is available.
- Updated the Arabic and English labels to communicate current visitors.

## Files changed

- `src/app/App.tsx`
- `src/app/components/VisitorCount.tsx` and its unit test
- `src/app/i18n/ar.ts` and `src/app/i18n/en.ts`
- `cloudflare/worker.ts`, `cloudflare/schema.sql`, and migration `0003_active_visitors.sql`
- `scripts/sync-sql.test.mjs`
- Architecture, decision log, phase index, and release notes

## Components added or modified

- Added `ActiveVisitorPresence` as the app-shell presence owner.
- Modified `VisitorCount` to display the shared active-presence result.

## User-visible changes

- Home now says “Visitors now” / “الزوار الآن”.
- The number represents visitors active within the rolling presence window instead of all historical visitors.

## Accessibility work

- Updated the bilingual accessible label to identify visitors currently using the app.
- The count remains ordinary text and does not create repeated live-region announcements on heartbeat refresh.

## Tests added or updated

- Component coverage for active-count display, quiet network failure, and periodic heartbeat refresh.
- SQLite coverage for migration of existing rows, presence refresh upsert, and active-window filtering.

## Commands run

| Command                                    | Result                                                                                                                         |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Focused VisitorCount and Worker SQL tests  | Pass: 7 tests.                                                                                                                 |
| `pnpm install --frozen-lockfile`           | Pass; lockfile current.                                                                                                        |
| `pnpm check`                               | Pass in a clean isolated worktree: formatting, lint, types, 1,083 unit tests, build, audio, bundle, type-scale, and CSS gates. |
| `pnpm test:e2e`                            | Pass: 389 passed, 1 skipped across the configured desktop, phone, tablet, Firefox, and WebKit matrix.                          |
| `pnpm build:pages`                         | Pass; 166-entry PWA precache generated and bundle/CSS budgets held.                                                            |
| `pnpm run check:release-notes`             | Pass; the bilingual manifest describes this deployment.                                                                        |
| `npx -y wrangler@4.119.0 deploy --dry-run` | Pass; Worker bundle and D1 binding validated without deployment.                                                               |

## Visual/manual evidence

- No new visual surface was introduced; only the existing bilingual counter label and value semantics changed.

## Documentation updated

- Updated architecture, this report, and release notes.

## Decisions recorded

- This report records the heartbeat cadence, active window, retention, privacy boundary, and approximation semantics.

## Known limitations or remaining risks

- Presence is intentionally approximate: a closed/hidden app may remain counted for up to 90 seconds, while a device with no network can age out despite remaining open.
- Multiple browsers or devices used by one person are counted separately; multiple tabs sharing the same stored visitor ID are counted once.

## Out-of-scope findings

- Unrelated in-progress category/type changes were present in the worktree and were not modified as part of this phase.

## Recommended next step

- Verify the production Worker migration and compare the live count with two simultaneous devices, then confirm both age out after closing.
