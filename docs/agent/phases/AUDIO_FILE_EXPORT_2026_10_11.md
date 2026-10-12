# Phase Report — Save audio files to device

## Objective

Add an owner-requested option to save downloaded audio as actual device files, alongside the app-private offline cache. Changes remain local; no commit or push.

## Plan before editing

Inspect approved audio selection, cache verification and existing single-file download utilities. Reuse verified cached bytes and the browser download dispatcher. Expose individual exports through audio group management to avoid automatic multi-file downloads or assembling large archives. Verify exact original bytes, offline operation, cache retention, failed/evicted-file recovery and browser save feedback. Preserve unrelated work and existing content/voice boundaries.

## Scope completed

Each audio group’s Manage section now offers Save audio files to device. Opening it lists only complete approved recordings whose cached bytes pass status/MIME/length/SHA-256 verification. Selecting Save audio file verifies the selected cached response again and hands its original MP3/WAV/OGG/M4A bytes to the existing browser download dispatcher. No network fetch occurs for an export and no app cache is removed. Empty and error states explain downloading or recovering the app copy first. Save feedback says the file was handed to the browser, without claiming the user completed a filesystem write.

## Files changed

- audioOfflineCache and resume tests: verified enumeration and single-file preparation.
- New screen-owned AudioFileExports and its unit tests; DownloadsPanel composition.
- Arabic/English download copy; isolatedSuites registration for the mocked unit suite.
- New audio-file-export browser spec and an unchanged approved owner-audio test fixture with provenance/checksum README. Fixture stays under e2e, outside production build assets.
- Offline-caching contract, agent index and this report.

## Components added or modified

AudioFileExports owns service orchestration, disclosure, preparing/save feedback and error recovery. Existing Button/icons/dispatcher are reused. DownloadsPanel memoizes group selection and preserves existing download/remove actions. No dependencies, content metadata, cache format, audio approval or manifest version changes.

## User-visible changes

Users can save individual downloaded recordings to Downloads/Files or another location chosen by their browser. Files have stable recording/voice/version names and correct original format. Exported copies may be moved independently; app playback continues using the existing private cache. Copy distinguishes offline storage from actual exported files. Missing recordings must first be downloaded through existing group/collection controls.

## Accessibility work

Native details/summary, localized button labels naming the recording and voice, wrapping text, 44px buttons, scoped status/error feedback, and retained keyboard/RTL/LTR semantics. Preparing disables competing file exports. Navigating away during asynchronous preparation does not trigger a delayed browser download. Automated scans supplement physical-device and assistive-technology review.

## Tests added or updated

Service checks verified-only enumeration, byte-identical export without fetch/removal, rejection of corrupt or unknown recordings, and eviction between listing/saving. UI tests cover lazy enumeration, one browser download, empty state, verification failure and unmount cancellation. Browser tests use frozen approved recording bytes verified against production metadata, seed the actual Cache API, go offline, capture an actual browser download, hash the saved file and confirm the app cache remains. No checksum override or live audio dependency.

## Commands run

Focused `pnpm exec vitest run` for audioOfflineCache.resume, AudioFileExports, DownloadsPanel and isolatedSuites: 4 files, 37 tests passed, exit 0 (24.31s). TypeScript and targeted ESLint checks passed, exit 0.

After final copy edits, the same focused suite passed again: 4 files, 37 tests, exit 0 (50.81s).

`pnpm test:e2e e2e/audio-file-export.spec.ts` against the isolated production preview, with desktop-chromium, desktop-firefox-smoke and mobile-webkit-smoke: all 6 Arabic/English tests passed, exit 0 (2.0m). Each test also passes its automated accessibility scan.

Whole-repository `pnpm check`: exit 1 (281.4s). Unit tests, lint, TypeScript, build, CSS and content/design validators passed. Formatting flagged the concurrent unrelated e2e/ayah-image-sharing.spec.ts. The initial-route bundle guard also flagged 162374 compressed bytes against the unchanged 159119 baseline plus 2%; explanatory copy was shortened afterward. Final isolated build/budget results are recorded below. No baseline, ceiling, test assertion or unrelated file was changed to obtain a passing result.

Final `vite build --mode github-pages --outDir output/audio-export-pages-final`: exit 0 (22.73s), including PWA generation. `node scripts/check-bundle-budget.mjs output/audio-export-pages-final` and `node scripts/check-css-utilities.mjs output/audio-export-pages-final`: both exit 0. Scoped Prettier verification passed after formatting the changed Arabic copy. Final production preview runs at http://127.0.0.1:4202/Azkarapp/#/settings/downloads. No commit or push was performed.

## Visual/manual evidence

Browser download artifacts and Arabic/English screenshots for all three engines are retained under output/playwright/audio-file-export/. The Arabic mobile WebKit screenshot was visually inspected: long titles wrap, the save action is visible, and the offline banner/status remain readable. Actual exported fixture bytes match the production SHA-256; audio network requests remain zero and the Cache API response remains present. Real-phone save location UX remains controlled by the browser and should receive physical-device review.

## Documentation updated

Offline-caching contract now explains the separate browser-file export workflow and cache retention. This report/index records local-only authority.

## Decisions recorded

The owner requests actual local files. Use one deliberate save per recording, reuse the existing browser download utility, preserve app-private playback cache, and do not claim access to or control of the browser’s final filesystem destination.

## Known limitations or remaining risks

Export prepares one full recording at a time, so very large audio requires memory for its file buffer. Browser policy controls file location and download prompts; the app cannot confirm completion of a manual save dialog or import a moved file automatically. No bulk archive, OS filesystem linkage, PDF/QCF export or hosting migration is included. Existing concurrent whole-repository gate failures, if repeated, are reported without modifying unrelated work.

## Out-of-scope findings

Shared checkout contains other active Quran/Reader/share changes. They remain intact. No content/approval changes or gate weakening.

## Recommended next step

Review Manage → Save audio files to device locally and verify a phone browser save and playback in a device media player before any separately authorized release.

## Owner follow-up — concise descriptions

Shortened Arabic/English export, offline-storage, transfer/error, cancellation and storage-protection copy. Retained the saving destination, separate app cache, verification state, recovery action and storage limitations. No components, behavior, dependencies or reviewed content changed. Updated existing UI assertions for the new wording; the first run exposed one remaining old cancellation expectation, which was corrected. Final targeted UI run: 2 files, 23 tests passed, exit 0 (38.01s). Scoped Prettier passed. Isolated Pages build at output/audio-export-pages-copy passed, exit 0 (26.08s plus PWA generation); unchanged bundle/CSS checks both passed, exit 0. Preview on port 4202 now serves that build. Earlier browser evidence covers the unchanged export behavior; browser suites were not repeated for this copy-only refinement. No commit or push.
