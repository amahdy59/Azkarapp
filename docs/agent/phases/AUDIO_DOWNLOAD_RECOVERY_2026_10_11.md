# Phase Report — Audio download recovery and device storage

## Objective

Repair audio download feedback and recovery locally, and explain device-local offline playback. Owner explicitly prohibits pushing; no commit, push, hosting or release-note change is authorized.

## Plan before editing

Inspect the existing Cache API, checksum, voice selection, Settings presentation and failed-download contracts. Preserve reviewed content, cache identity and existing playback range handling. Replace collection rollback with complete verified recording checkpoints; add bounded retries and streamed transfer feedback, honest storage persistence controls and meaningful unit/browser coverage. Preserve unrelated concurrent work.

## Scope completed

Audio download service checkpoints each complete verified recording, preserving it on later failure or cancellation. A retry verifies and reuses saved recordings and fetches only missing/invalid bytes. Response streams fill a single exact-size buffer; incomplete, oversized, wrong-MIME or wrong-checksum responses are never published. Network/429/5xx failures receive up to three attempts with bounded backoff and Retry-After handling. A 30-second inactivity deadline handles stalled transfers without limiting total time for progressing large files.

## Files changed

- Audio: new audioDownloadTransfer service/tests; audioOfflineCache and resume tests.
- Presentation: DownloadsPanel and tests, OfflineResourceRow, DownloadProgress, Arabic/English download dictionaries.
- Storage: downloadStorage and tests.
- Browser coverage: audio-download-recovery.spec.ts.
- Documentation: audio/offline-caching.md, agent index and this report.

## Components added or modified

DownloadsPanel exposes recording/byte progress, receiving/retrying/verifying phases, saved offline recording counts, failure feedback beside the affected card and storage protection. OfflineResourceRow always shows current state and accepts feedback plus correct category/management heading levels. DownloadProgress retains native progress and limited live milestones, adding a visible percentage. Services retain network/storage ownership; no runtime dependency or persisted-state migration.

## User-visible changes

Saved recordings survive a later failure or cancellation and are linked to normal playback through their immutable cache URLs. Cards show how many recordings are stored locally and whether a file is still transferring or undergoing verification. Specific localized network, server, integrity, unsupported-browser and storage errors replace ambiguous retry-only feedback. Keep downloads on this device requests browser persistence and reports granted/declined/unsupported honestly. Download help explains offline playback through the same app/browser/device and that files do not appear in the Files app.

## Accessibility work

Native progress and buttons, visible text feedback, preserved 44px controls, localized RTL/LTR numerals, correct h1/h2/h3 category hierarchy, scoped polite storage announcements and existing milestone progress announcements. Automated scans and browser keyboard/layout assertions do not establish complete accessibility compliance; physical-device and assistive-technology review remain follow-up work.

## Tests added or updated

Streamed progress before completion; 429/5xx/network retry recovery and exhaustion; Retry-After; inactivity; cancellation during backoff; length/MIME rejection; preservation of newly verified recordings after later failure/cancellation; retry fetching only missing files; localized card errors; progress versus verified readiness; storage persistence granted/declined/unsupported/error handling. Browser scenarios exercise real streamed response handling, storage action, visible progress, saved count, cancellation and axe in Arabic/English.

## Commands run

| Command / scope                                                                                                                                            | Exact result                                                                                                                                                                                                                                                                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Initial focused unit run (5 files)                                                                                                                         | 46 tests passed, exit 0, 64.76s.                                                                                                                                                                                                                                                                                                                                        |
| Final focused Vitest run (transfer, cache resume, Downloads, storage)                                                                                      | 4 files, 43 tests passed, exit 0, 55.43s. Includes final Retry-After handling.                                                                                                                                                                                                                                                                                          |
| Initial pnpm typecheck / final tsc --noEmit                                                                                                                | Both passed, exit 0.                                                                                                                                                                                                                                                                                                                                                    |
| Targeted ESLint / Prettier checks                                                                                                                          | Passed, exit 0; all matched files use Prettier style.                                                                                                                                                                                                                                                                                                                   |
| git diff --check                                                                                                                                           | Passed, exit 0.                                                                                                                                                                                                                                                                                                                                                         |
| pnpm check                                                                                                                                                 | Exit 1 in 420.1s. Build, typecheck, format, all content/audio/timing/motion/type-scale validators and bundle/CSS gates passed. Full units: 1743 passed, 1 failed across 244 files. Unrelated concurrent MushafPageViewer layout expectation failed; whole-workspace lint failed at QuranTranslationText.tsx:55 (interaction semantics). No assertions or rules changed. |
| Isolated Pages build: vite build --mode github-pages --outDir output/downloads-pages-build; existing bundle and CSS utility scripts against that directory | Passed, exit 0. Vite build 1m17s; PWA generated 208 precache entries. Same stages as build:pages, isolated output avoids concurrent dist ownership.                                                                                                                                                                                                                     |

## Visual/manual evidence

Final production-preview recovery spec (Chromium, Firefox, WebKit): 6/6 passed, exit 0, 4.8m. Arabic/English streamed transfer, persistence request, cancellation, saved-count feedback and full axe scan. Report: output/audio-download-production-preview.json.

Final existing offline-downloads spec (Chromium): 6/6 passed, exit 0, 1.4m. Phone/tablet/desktop, narrow width, 200% text, landscape, keyboard/target/axe and floating-player clearance assertions retained. Report: output/downloads-layout-final.json.

Final recovery screenshots are retained under output/playwright/downloads-production-preview/ for Arabic and English across all three engines; responsive screenshots are retained under output/playwright/downloads-layout-final/. Preview opened in Codex for local review. Deterministic streamed-response browser fixtures do not bypass production integrity checks or become approved downloads. No live-host configuration or file was changed.

Initial browser screenshots confirmed live Arabic/English transfer progress. Axe identified skipped heading levels; repaired category h2 headings without disabling rules. Initial combined Chromium run: 4 passed, 4 failed (4.6m); two new cases failed only heading order, two existing cases failed to load the Downloads route. A dev-preview retry stalled at page.goto before download assertions and was stopped. Final verification uses the isolated Pages production build at http://127.0.0.1:4200/Azkarapp/ with separate result output, avoiding shared build artifacts. Arabic Chromium progress screenshot inspected visually; text, saved count, current file, bar, amount and cancellation fit the phone card.

## Documentation updated

Offline audio contract now documents checkpoint recovery, streamed progress, retries and device-local persistence. It supersedes earlier collection rollback language without changing checksum/content requirements.

## Decisions recorded

Owner asks for local fixes and device caching without redownloads. Completed verified recordings are checkpoints, partial files remain unavailable, and existing cache identity and normal offline playback remain. User's no-push instruction overrides general release authority.

## Known limitations or remaining risks

Large audio still needs a full-file buffer for mandatory SHA-256 verification, although streamed reception avoids a retained chunk list and extra assembly copy. Resume works between complete files; partial-file byte-range resume is not implemented. Browser storage is scoped to an origin/profile/device and can be removed by clearing data. Persistence depends on browser policy. Production R2 development-domain rate limits remain; no external hosting change is included. Whole-workspace lint and a concurrent MushafPageViewer unit expectation failed outside this phase, left untouched. The combined checkout is not claimed release-ready.

## Out-of-scope findings

Shared checkout contains concurrent Quran/Reader/translation/share changes. They are preserved; no unrelated edits, hooks, budgets, assertions or content approvals are weakened.

## Recommended next step

Review the local download flow and perform a physical-phone offline playback check. Resolve unrelated combined-workspace gate blockers before any separately authorized release.
