# Progress vNext implementation and release — 2026-10-31

## Authority

The owner requests applying all recommendations from the Progress review, reviewing and correcting the latest changes, pushing all verified changes and validating deployment. The owner confirms this is the only active agent. This supersedes earlier production holds for this release and resolves the baseline ownership question. Keep the four existing default metrics, as explicitly selected by the owner.

The attached plan and images remain design references. The assessment in `../reports/PROGRESS_VNEXT_REVIEW_2026_10_31.md` defines the accepted adjustments: no combined score, punitive missing-record statuses, duplicate accessibility screen, unsupported certification, invented data or unimplemented export formats. Preserve current architecture, themes, shell, reviewed content, persistence, date boundaries, complete-day comparisons and source/export semantics.

## Inspection and plan before editing

Baseline: local main `7f61f55d`, clean working tree. Inspect and reproduce the previous English 320px control/focus failure across Chromium, Firefox and WebKit; review its toolbar/filter truncation repair against readable-date/reflow contracts. Diagnose and repair any remaining defect without weakening tests.

1. Trend phase: reuse `RecordingTimeline`, add a disclosed native exact-bucket table, preserve slider/pointer/RTL keys and gap semantics, size sparse plots appropriately. Add a pure comparison helper in `progressDashboard.ts` for supported rates and percentage points; retain matched-date and known-goal restrictions and page-count units. Update paired dictionaries and targeted unit/browser tests.
2. Overview phase: retain four customizable metrics and semantic tokens; improve value/denominator hierarchy, distinguish no history/empty period/target-only cases, add a factual saved-data insight and a reflowing last-seven-date recording-presence list. Use scoped facts without inferring per-practice explicit zero provenance. Reuse existing Home/Quran actions; preserve settings and motion preferences. Add pure selector/component tests and screenshots.
3. Records phase: retain native sorting/pagination and one selected range, explain unavailable values accessibly, keep narrow/enlarged recovery and scoped JSON export with explicit privacy/status/error feedback. Guard asynchronous duplicate export and stale status. Add scoped tests and cross-engine evidence.
4. Release: review all diffs; update contract docs and newest-only bilingual release notes/history. Run affected tests and complete local hook gates, preserving coverage/budgets. Push verified main through hooks, inspect every failed CI job, repair only evidenced failures, require successful exact-commit Quality/verify and Pages/build/deploy, then confirm production release identity and smoke core Progress/reading/offline behavior where supported. Report exact results and pending physical-device/screen-reader limitations.

Use phase-scoped coherent changes; no dependency or schema changes. Finish code/docs before final quality to allow unchanged-input receipt reuse. Never reuse a result after its inputs change.
