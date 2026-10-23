# Phase Report — Release QA isolation and presence diagnosis

## Objective and bounded repair plan

Finish the approved release without automated browser traffic writing to production visitor/device services. Diagnose the missing live visitor count, preserve all reading/count/progress contracts, and repair the Glass-specific CI fixture rather than changing the approved Opaque default.

Plan: inspect Worker/D1 and test-server configuration; distinguish remote quota failure from visual mounting; isolate only the browser build's API origin to local loopback; prove it with unit/browser tests; explicitly select Glass in the existing on-media contrast test; run intact local/CI/deployment gates. No paid-plan change, new service, database migration or user-data rewrite.

## Findings

Production visitor POST returned HTTP 500. The D1 API confirmed code 7500: the account exceeded its free daily row-write allowance. A same-value diagnostic update was rejected, changing no data. Reads and existing stored data remain available. Query insights show presence and request-limit writes are substantial; browser builds previously inherited the production API URL and therefore could contribute artificial presence and quota usage. The current snapshot's controlled visitor fixture worked, whereas an actual service check failed after an earlier successful response.

Cloudflare documents a 100,000-row daily write allowance for Workers Free and a midnight UTC reset: https://developers.cloudflare.com/d1/platform/pricing/ . At this release's Cairo offset, the next reset is 03:00 on 17 October 2026. Core reading/counting remains local. The exhausted allowance cannot be reset by a code change without a plan change; the current plan is retained.

## Scope completed and files changed

scripts/browser-test-environment.mjs and test; serve-browser-tests.mjs; backend-isolation browser regression; accessibility Glass fixture; README/architecture/phase guidance. Application production API settings and Worker/D1 data remain unchanged.

## Components and user-visible behavior

No production visual component changes in this repair. General browser tests use a local API namespace regardless of inherited production settings. Existing explicit request fixtures still exercise the same app response boundary. Deliberate production smoke remains separate. Glass contrast tests explicitly choose Glass before checking its on-media tokens; all previous assertions stay intact.

## Accessibility and integrity

Opaque remains the new-install default. The Glass fixture retains its original class, foreground and muted-foreground assertions. No assertion, browser project, inventory gate, coverage requirement, source record, count or bundle ceiling is removed or weakened.

## Tests and verification

Pure environment test checks forced loopback configuration, preservation of unrelated environment variables and no mutation of the input. Browser regression observes the actual heartbeat origin, supplies a controlled count and rejects production API requests. Targeted mobile/tablet Glass and reminder/presence fixtures run before the full gate. Exact final command results, CI and production evidence are recorded in the consolidated release report.

## Documentation and decisions

The owner explicitly requests thoughtful diagnosis and worthwhile improvements. The existing release authority covers bounded verification repairs. Keep paid-plan changes and replacement presence architecture as explicit product decisions. This commit changes tests/tooling/documentation only and therefore does not require new user-facing release notes under AGENTS.md.

## Remaining risk and next step

The already-exhausted write allowance remains unavailable until its reset or an explicitly approved plan change. Presence and optional remote writes cannot be claimed healthy before then. Isolated tests prevent further QA consumption; physical-device/accessibility sampling and aligning both deployment gates remain recommended separate follow-ups.

## Targeted results

Eight tooling tests passed. Eleven focused browser cases passed in 58.4 seconds across desktop, mobile and tablet Chromium: actual loopback heartbeat/no-production-request regression, explicit Glass on-media colours, contextual reminders, first-use offline extension and visible visitor-count fixtures. No tests were skipped or weakened. The final complete quality/hook/CI results follow in the consolidated release evidence.
