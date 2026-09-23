# Phase 59 — Verification-led review remediation

## Objective

Apply the priority corrections to the existing Phase 52–58 working tree, then only the deferred improvements justified by current evidence. Preserve reviewed content, existing progress contracts, and offline operation.

## Plan and scope

1. Correct the remote privacy boundary and atomic sync revisions.
2. Verify count persistence and reconcile daily rollover without resetting situational collections.
3. Restore explicit free-reading semantics and make Qiblah direction primary.
4. Improve download recovery, storage preflight, and settings hierarchy.
5. Run targeted tests, the full quality gate, browser matrix, and responsive visual checks.

## Scope completed

- Remote snapshot validation permits prayer attendance `location` while excluding device coordinates and identity fields.
- Worker snapshot writes use atomic compare-and-set SQL. Competing initial writes and stale revisions return conflicts instead of overwriting newer data.
- Client sync serializes uploads, retries failures at most twice after the initial attempt, re-reads conflicting revisions, ignores stale unmounted responses, and rehydrates on reconnect.
- Pairing/device/QR/visitor endpoints have hashed-IP minute buckets; expired buckets and pairing tokens are cleaned hourly. Migration `0002_request_limits.sql` must precede Worker deployment.
- Revoked credentials can be unlinked locally; pairing actions disable conflicting submissions while pending and reject empty returned credentials.
- Partial counts survive navigation/reload. Daily rollover resets daily entries both on startup and while open; situational entries remain resumable.
- Explicit free-reading plans do not produce a daily Quran completion card. Legacy manual tracking remains intact.
- Qiblah opens with bearing, direction, distance, and alignment instructions. The optional sensor dial is behind a closed disclosure; closing it stops sensors. Location is requested only by an explicit action.
- Downloads show ready pages, approximate remaining size, Resume, and Available offline states. Quota preflight is advisory; write failures remain handled. Failed/cancelled Mushaf jobs drain sibling requests before returning control.
- Progress settings no longer duplicate the full dashboard; recent sessions are disclosed on demand.
- Removed invalid NUL bytes from `.gitignore` without changing the toolchain or adding runtime dependencies.

## Files changed

In addition to the pre-existing Phase 52–58 changes: `cloudflare/worker.ts`, schema and migration, `wrangler.jsonc`; remote snapshot boundary/tests; counter hook, Reader, App, state and tests; Progress/Qibla screens and tests; Downloads/Progress/QR settings panels and tests; download storage helper/tests; Mushaf cache/tests; bilingual strings; SQL regression tests; reader browser regression; repository docs.

## Components added or modified

Modified QiblaScreen, ReaderScreen, ProgressScreen, DownloadsPanel, ProgressPanel, QrSyncPanel. No new visual framework or runtime dependency.

## Accessibility work

Native keyboard-operable disclosures, bounded polite feedback, disabled conflicting async actions, localized copy, and existing focus/target-size tokens. Automated scans do not establish complete WCAG compliance.

## Tests added or updated

Atomic SQL contention and rate buckets; snapshot privacy/prayer attendance; count rollover; browser 30-count navigation/reload; free-reading semantics; explicit compass disclosure; insufficient download storage; quota fallback; revoked-device unlink and pending controls.

## Commands run

| Command                                                                                          | Result                                                                                        |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`                                                                 | Pass; lockfile already current.                                                               |
| Targeted Vitest suites for sync, counter, state, downloads, Qiblah, Progress, QR, and Worker SQL | Pass.                                                                                         |
| `pnpm check`                                                                                     | Pass: formatting, lint, types, full unit/coverage suite, build, audio, bundle, and CSS gates. |
| `pnpm build:pages`                                                                               | Pass; fixed CSS ceiling and all recorded bundle-growth budgets held.                          |
| `pnpm audit:prod`                                                                                | Pass; no known production vulnerabilities.                                                    |
| `npx -y wrangler@4.119.0 deploy --dry-run --outdir .wrangler-dry-run`                            | Pass; Worker bundle and D1 binding validated without deployment.                              |
| Focused Playwright navigation matrix                                                             | Pass: 14/14 desktop/mobile tests.                                                             |
| Focused 30-count persistence flow                                                                | Pass.                                                                                         |
| `pnpm test:e2e`                                                                                  | Pass: 389 passed, 1 skipped across the full configured browser and viewport matrix (18.8m).   |

## Visual/manual evidence

Responsive screenshots: `output/playwright/qibla-390.png`, `qibla-1440.png`, `mushaf-320.png`, `mushaf-1440.png`, and `downloads-390.png`. Physical compass calibration, real device safe areas, and assistive-technology review remain manual release requirements.

## Decisions and deferred work

- Do not add more haptic milestones: completion already differs from ordinary taps, and extra vibration needs device evaluation.
- Do not move calculations to workers or add speculative lazy boundaries without profiles showing a bottleneck.
- Do not archive sessions to another database: the existing 500-entry bound is deliberate; migration would add data-loss risk.
- Do not add settings search yet: first simplify hierarchy and measure discoverability.
- Do not change the day boundary or add Hijri-date offsets in this patch: midnight and calendar-plan semantics need to remain consistent across displays and goals.
- Do not add nonportable background audio APIs or blanket card/glass restyling. Preserve current platform and opaque-surface fallbacks.
- No religious content or source interpretation changed.

## Known limitations or remaining risks

Worker SQL tests execute SQLite locally, not live D1. Production rate-limit behavior and physical cross-device pairing require a deployed Worker/migration and a separate operational smoke test. Storage estimates vary by browser and do not reserve disk space. Sensor direction is optional and still requires physical hardware verification.

## Documentation updated

This phase report and the architecture/design contract addenda describe the corrected behavior and deliberate deferrals.

## Recommended next step

Review the uncommitted changes and complete physical-device pairing, compass, screen-reader, and safe-area checks before release.
