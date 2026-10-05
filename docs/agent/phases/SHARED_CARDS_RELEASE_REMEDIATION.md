# Phase Report — Shared-card release remediation

## Objective

Complete the shared-card release after two Quality attempts encountered transient hosted audio HTTP 429 responses on different recordings.

## Scope completed

Add bounded HTTP 429 retries to the existing hosted metadata probe. Honor Retry-After seconds and dates with a 30-second maximum wait and three total attempts. Retain complete recording coverage, concurrency, HTTP/MIME validation, network retry behavior, timeouts and resource cleanup.

## Files changed

scripts/probe-audio-variants.mjs, scripts/probe-audio-variants.test.mjs, docs/audio/testing-and-qa.md, this report, and the pending release-note stamp.

## Components added or modified

Existing build-time audio probe only; no runtime component or audio manifest changed.

## User-visible changes

The shared-card release can complete despite temporary host rate limiting. The card layout, optional sources, Hindi digits and plain footer remain the release's visible improvements.

## Accessibility work

No further runtime change. Sharing accessibility evidence remains in COMPACT_COMBINED_SHARED_CARDS.md.

## Tests added or updated

Retry-After seconds capped at 30 seconds, HTTP-date waits, recovery, three-attempt exhaustion, body cancellation and timer cleanup. Existing network/concurrency/HTTP/MIME tests are retained. The initial HTTP-date test used a fractional system timestamp; its clock is now fixed explicitly for deterministic whole-second HTTP dates.

## Commands run

| Command                                             | Result                                                                               |
| --------------------------------------------------- | ------------------------------------------------------------------------------------ |
| pnpm test:run scripts/probe-audio-variants.test.mjs | 9 passed, exit 0                                                                     |
| pnpm validate:audio                                 | Exit 0; all 254 instances, 165 assets and 196 mappings valid including hosted probes |
| Final pre-push quality/smoke/Pages gates and CI     | Exact results in output/compact-sharing-release/RELEASE_VERIFICATION.md              |

## Visual/manual evidence

No visual change in this remediation. Corrected shared-card PNGs remain in docs/agent/evidence/compact-combined-shared-cards.

## Documentation updated

Audio QA retry policy and this release-specific report. Release stamp advances to 2026-10-05.7; all notes still describe only the pending undeployed card improvements.

## Decisions recorded

Repository-authorized release remediation; no thresholds, tests, hooks or hosted-content requirements bypassed.

## Known limitations or remaining risks

Persistent host unavailability or rate limiting still blocks release after three attempts. Physical-device and screen-reader sharing review remains pending.

## Out-of-scope findings

Rate limiting affected different unchanged audio objects across attempts, independently of the visual change.

## Recommended next step

Complete Quality and Pages verification, then smoke-test the exact production commit.
