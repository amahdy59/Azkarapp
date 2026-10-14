# Phase Report — Persistent devotional downloads and human-readable archives

## Objective

1. Protect user-downloaded devotional content (audio, Quran pages, QCF fonts, word timings) from service-worker update wipes so downloads persist across application updates like media apps (YouTube, Spotify).
2. Migrate valid audio downloads across manifest version updates without requiring re-downloading unchanged audio files.
3. Automatically request persistent device storage (`requestDownloadPersistence()`) when downloading offline resources.
4. Structure full-audio ZIP exports into cross-platform, numbered, bilingual category folders with human-readable track titles and localized reciter names.

## Scope completed

- `pwaUpdate.ts`: Added `isProtectedContentCache()` guard to ensure `escapeStaleServiceWorker` only deletes precache and route caches (`workbox-precache-`, `azkar-routes-`), strictly preserving `azkar-audio-`, `azkar-mushaf-`, `azkar-qcf-fonts-`, and `azkar-listening-timings-`.
- `audioOfflineCache.ts`: Updated `cleanupStaleAudioDownloads()` to migrate still-valid cached files from older audio caches into the active cache before retiring old caches, and decoupled stale invalidation from manifest version bumps alone. Extended `SavedAudioFile` with category and sequence metadata, and enabled custom suggested file naming in `prepareSavedAudioFile()`.
- `DownloadsPanel.tsx`: Auto-requests download persistence upon initiating downloads, and passes user language to `prepareAudioArchive()`.
- `audioArchive.ts`: Implemented `sanitizeArchiveName()`, `getArchiveCategoryFolder()`, and `buildArchiveEntryPath()`. Formatted entries inside the ZIP into bilingual category folders (`01 - Morning Azkar (أذكار الصباح)`, `04 - Quran (القرآن الكريم)`, etc.) with clean 2-digit and 3-digit numbered tracks, titles, and localized reciter names.
- Tests added in `audioArchive.test.ts`, `pwaUpdate.test.ts`, and updated in `audioOfflineCache.test.ts` and `audioOfflineCache.resume.test.ts`.

## Files changed

- `src/app/pwaUpdate.ts`
- `src/app/pwaUpdate.test.ts`
- `src/app/audio/audioOfflineCache.ts`
- `src/app/audio/audioOfflineCache.test.ts`
- `src/app/audio/audioOfflineCache.resume.test.ts`
- `src/app/audio/audioArchive.ts`
- `src/app/audio/audioArchive.test.ts`
- `src/app/screens/settings/DownloadsPanel.tsx`
- `docs/ARCHITECTURE.md`
- `docs/agent/INDEX.md`
- `docs/agent/DECISION_LOG.md`
- `docs/agent/phases/PERSISTENT_DOWNLOADS_AND_HUMAN_READABLE_ARCHIVES_2026_10_13.md`

## Components added or modified

- `DownloadsPanel`
- `audioArchive`
- `audioOfflineCache`
- `pwaUpdate`

## User-visible changes

- Downloads of Adhkar and Quran now survive app updates completely and are not wiped when updating.
- Updating the app will only replace application code; audio is retained and migrated automatically.
- Starting a download prompts the browser/OS for persistent storage protection automatically.
- Exporting audio as a ZIP creates an organized, human-understandable directory structure with category folders, track numbers, titles, and reciter names.

## Accessibility work

- Progress and status announcements remain polite and atomic.
- Storage persistence notifications retain polite live region feedback.
- ZIP entry naming preserves RTL and Arabic text while ensuring cross-platform filesystem compatibility.

## Tests added or updated

- `src/app/pwaUpdate.test.ts`: Added tests verifying `isProtectedContentCache()` and ensuring content caches are kept during service worker escape.
- `src/app/audio/audioOfflineCache.test.ts`: Added tests for `cleanupStaleAudioDownloads()` verifying migration from older audio caches and preservation across manifest versions.
- `src/app/audio/audioOfflineCache.resume.test.ts`: Updated expectations to verify human-readable archive naming and `voiceId` handling.
- `src/app/audio/audioArchive.test.ts`: New unit tests verifying `sanitizeArchiveName()`, `getArchiveCategoryFolder()`, and `buildArchiveEntryPath()` across languages and invalid character sets.

## Commands run

| Command                                                          | Result                                           |
| ---------------------------------------------------------------- | ------------------------------------------------ |
| `pnpm vitest run src/app/pwaUpdate.test.ts`                      | 14 passed (14)                                   |
| `pnpm vitest run src/app/audio/audioOfflineCache.test.ts`        | 5 passed (5)                                     |
| `pnpm vitest run src/app/audio/audioOfflineCache.resume.test.ts` | 15 passed (15)                                   |
| `pnpm vitest run src/app/audio/audioArchive.test.ts`             | 6 passed (6)                                     |
| `pnpm exec playwright test e2e/audio-file-export.spec.ts`        | 6 passed across Chromium, Firefox, WebKit (2.4m) |
| `pnpm test:e2e:fast`                                             | 26 passed (1.1m)                                 |
| `pnpm format:check`                                              | All matched files use Prettier code style        |
| `pnpm check`                                                     | All 13 stages passed in 154.3s                   |

## Visual/manual evidence

- Playwright offline audio export passed with exact hash matching on disk.
- Archive layout tested with Arabic, English, and filesystem-illegal character sets.

## Documentation updated

- `docs/ARCHITECTURE.md`
- `docs/agent/INDEX.md`
- `docs/agent/DECISION_LOG.md`
- `docs/agent/phases/PERSISTENT_DOWNLOADS_AND_HUMAN_READABLE_ARCHIVES_2026_10_13.md`

## Decisions recorded

- **DECISION_LOG (2026-10-13)**: Persistent devotional downloads and human-readable archives:
  - Content Cache Protection on Service Worker Update Escalation. `escapeStaleServiceWorker` must never delete caches prefixed with `azkar-audio-`, `azkar-mushaf-`, `azkar-qcf-fonts-`, or `azkar-listening-timings-`.
  - Non-Destructive Audio Cache Migration Across Manifest Versions. `cleanupStaleAudioDownloads` migrates valid unchanged files from older audio caches before deleting retired caches.
  - Automatic Persistent Device Storage Request on download start.
  - Human-Readable Categorized ZIP Archives. ZIP exports structure files into bilingual numbered category folders with sequence numbers, titles, and localized voice names.

## Known limitations or remaining risks

- When users update in private/incognito browsing windows, browsers do not persist storage across sessions by browser design.

## Out-of-scope findings

- None.

## Recommended next step

- Owner consolidation and push as requested.
