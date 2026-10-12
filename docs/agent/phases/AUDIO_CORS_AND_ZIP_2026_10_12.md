# Phase Report — Audio CORS repair and persistent ZIP export

## Objective

Repair the owner's failed offline audio downloads on wa-zaker.com and provide a persistent filesystem ZIP export. The owner explicitly prohibits pushing the application improvements. No commit, push, application deployment or release-note edit is authorized.

## Scope completed

Plan before edits: compare the actual request origins, inspect and preserve the existing R2 policy, add only the missing production origin, verify hosted full/range requests and production downloads, then extend the existing verified downloader and ZIP utility with a persistent all-audio export. Keep selected-voice coverage, deduplication, exact byte/checksum validation, completed-file checkpoints, cancellation and existing individual exports.

The production azkar-audio bucket allowed GitHub Pages and localhost origins but omitted https://wa-zaker.com. Its CORS policy now also permits that origin. Existing origins, GET/HEAD, Range, exposed response headers and 3600-second preflight lifetime are preserved. The before/after policy snapshots are in output/audio-cors-repair/. This hosting-only correction is already live and requires no application push.

Local Downloads now always offers Download all audio as ZIP outside the management disclosures. It includes all available adhkar/dua and Kahf/Baqarah recordings in the selected voices. Missing recordings download through the normal verified cache boundary first. Packaging revalidates every selected file, uses immutable original file names and bytes, and refuses incomplete archives. Completed offline files remain after success, cancellation or later failure. Chunked ZIP reads yield so cancellation remains reachable; original blobs are retained without a second archive-sized byte-array allocation. Browser save handoff is described honestly.

## Files changed

- src/app/audio/audioArchive.ts: verified complete selected-audio archive orchestration.
- src/app/screens/settings/DownloadsPanel.tsx: persistent ZIP action, transfer/packaging progress, cancellation and save feedback.
- src/app/share/shareArchive.ts: reusable asynchronous stored-file archive builder; existing image/text archive API is preserved.
- src/app/i18n/ar.ts and en.ts: localized ZIP action/help/progress.
- Colocated downloader, Downloads and archive tests; e2e/audio-download-recovery.spec.ts.
- Audio hosting/offline documentation, policy example and this report.

Concurrent Mushaf changes belong to another session and are not part of this phase.

## Components added or modified

DownloadsPanel and the existing ZIP utility. No new runtime dependency, audio approval, content edit, cache version, stored setting or synchronization change.

## User-visible changes

Live downloads from wa-zaker.com can now read the audio host's responses. The local ZIP action remains visible after storage protection and after complete downloads; it saves all available selected-voice audio as wa-zaker-audio.zip. Individual exports remain inside Manage.

## Accessibility work

Native wrapping button with 44px minimum height, Arabic/English copy, scoped status/error feedback, named native progress and keyboard cancellation. The same button retains focus through cancellation and becomes available again afterward. No complete assistive-technology compliance claim.

## Tests added or updated

Exact ZIP payload/CRC/names and deduplication; reuse of verified cache and download only missing files; cancellation retaining cache; integrity failure refusing partial export; persistent action outside disclosure with storage already protected; inclusion of both surah recordings; save handoff and cancellation. Browser recovery tests retain existing checks and add persistent ZIP action, keyboard start/cancel/focus return, no cancelled browser download, progress and axe scans in both languages.

## Commands run

| Command                                                                                                  | Result                                                                                                                                                                                                                                                                                                                                               |
| -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wrangler whoami, bucket CORS list and dev-url get                                                        | Exit 0; authenticated correct bucket/origin, policy inspected.                                                                                                                                                                                                                                                                                       |
| Wrangler bucket CORS set azkar-audio --file output/audio-cors-repair/after.json --force; subsequent list | Exit 0; only missing production origin added.                                                                                                                                                                                                                                                                                                        |
| Full GET with wa-zaker.com Origin                                                                        | HTTP 200, correct allow-origin header; browser receives 2,092,800 bytes with SHA-256 563fc61a602ad483511a1fbf9e2c9185faa1c50b8529aa69182373bbbefc0356.                                                                                                                                                                                               |
| HEAD with GitHub Pages Origin                                                                            | HTTP 200 and preserved allow-origin header.                                                                                                                                                                                                                                                                                                          |
| Range request with wa-zaker.com Origin                                                                   | HTTP 206, one byte, correct Content-Range and allow-origin.                                                                                                                                                                                                                                                                                          |
| Range preflight OPTIONS                                                                                  | HTTP 204; allows wa-zaker.com, GET/HEAD and Range.                                                                                                                                                                                                                                                                                                   |
| Production download button on wa-zaker.com                                                               | 90/90 Arabic recordings completed; remain verified after reload.                                                                                                                                                                                                                                                                                     |
| Targeted Vitest: archive, downloader resume, Downloads and individual exports                            | 4 files, 43 tests passed, exit 0.                                                                                                                                                                                                                                                                                                                    |
| TypeScript and scoped ESLint                                                                             | Passed, exit 0.                                                                                                                                                                                                                                                                                                                                      |
| Python zipfile independent archive validation                                                            | Passed; both original entries, payload and CRCs verified.                                                                                                                                                                                                                                                                                            |
| pnpm check                                                                                               | Exit 1 in 190.3s: 1775 tests passed, 1 failed in concurrent MushafPageFrame.test.tsx:27 (expects the old h-[54%] layout string). All other stages passed: toolchain, build, types, lint, formatting, audio/content/timing/motion/type validators, bundle and CSS checks. No assertion, threshold or unrelated Mushaf code was changed by this phase. |
| Targeted Chromium/Firefox/WebKit recovery and file-export browser specs                                  | 12/12 passed, exit 0, 4.1m. Arabic/English ZIP start/cancel/focus, transfer, persistence, individual offline exports and axe scans.                                                                                                                                                                                                                  |
| Existing narrow-screen sharing ZIP browser regression (Chromium)                                         | 1/1 passed, exit 0, 1.4m; image/text ZIP API and save behavior preserved.                                                                                                                                                                                                                                                                            |
| Existing offline-downloads responsive browser spec (Chromium)                                            | 6/6 passed, exit 0, 33.5s; narrow, phone, tablet, desktop, 200% text and landscape.                                                                                                                                                                                                                                                                  |
| pnpm build:pages                                                                                         | Passed, exit 0: production build/PWA, unchanged bundle budgets and CSS utility check.                                                                                                                                                                                                                                                                |
| git diff --check                                                                                         | Passed, exit 0. No commit or push.                                                                                                                                                                                                                                                                                                                   |

## Visual/manual evidence

Real production browser snapshots and policy/independent ZIP evidence are retained locally. Browser regression screenshots include ZIP transfer progress in Arabic/English. The 390px Arabic local preview screenshot was visually inspected: persistent ZIP action and wrapping help are visible outside management, controls fit, and the bottom navigation retains clearance. Evidence: output/audio-cors-repair/zip-local-ar-phone.png. Local preview: http://localhost:3000/#/settings/downloads (uses an existing allowed local origin). Physical browser save-dialog completion and device memory limits remain browser-controlled.

## Documentation updated

Offline caching describes complete ZIP export and existing cache retention. Audio hosting instructions document the production domain and reusable CORS policy, preserving other origins.

## Decisions recorded

The owner authorizes repairing the issue and explicitly prohibits pushing the improvements. This supersedes standing autonomous publication authority for this work. The earlier single-file-only export scope is superseded by the requested ZIP export. The remote CORS fix is live; application ZIP changes are local only.

## Known limitations or remaining risks

A ZIP still needs browser memory/storage for the final archive and one verified recording; it does not provide byte-range resume or ZIP64. All currently available selected recordings fit standard ZIP limits. ZIP export uses available selected voices, not every alternate voice. Browser save location/completion is controlled by the user/browser. The R2 development host remains rate-limited. Production separately reports a blocked Cloudflare analytics script; it is unrelated to audio CORS and was not changed.

## Out-of-scope findings

No reviewed religious content, persistence migration, dependency, deployment pipeline or unrelated concurrent Mushaf change is part of this repair. Release notes stay unchanged because no application release is authorized. The whole-workspace quality snapshot was not green: the concurrent Mushaf layout had changed while a static frame assertion still expected the earlier layout. Later changes from that session are not verified by this result. This phase's 43 targeted unit checks, 19 browser checks and Pages build passed. No complete CI/release claim is made.

## Recommended next step

Review the local ZIP action and actual device save behavior. Publish only after a new explicit owner instruction.
