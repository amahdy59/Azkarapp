# Phase Report — Scoped Arabic audio restoration

## Objective

Restore Arabic playback for اللهم مصرف القلوب, سبحان الله وبحمده and أستغفر الله وأتوب إليه without overwriting existing R2 objects or changing unrelated audio links.

## Scope completed

Plan: inspect exact assignments and prior quarantine, obtain owner confirmation of reciter/complete text/repetition, inspect the local bytes, upload at unused v2 paths, verify hosted bytes and metadata, update only affected assets and waveforms, then run focused regression and quality gates. No push or deployment.

## Files changed

`src/app/audio/audioAssetsCore.ts`, `audioAssetsDuas.ts`, `audioManifest.ts`, `audioWaveforms.json`, `audioArchitecture.test.ts`, `audioOfflineCache.test.ts`, `audioRestoration.test.ts`, `e2e/audio-integrity.spec.ts`, `docs/audio/architecture.md`, `docs/audio/testing-and-qa.md`, `docs/audio/generated-mapping-report.md`, `docs/agent/DECISION_LOG.md`, `docs/agent/INDEX.md`, and this report.

## Components added or modified

No presentation components or runtime dependencies. Two existing shared assets gain approved replacement Arabic variants; the existing dua asset gains Arabic beside unchanged English. Stable assignment IDs remain unchanged, including the historical `friday-dua-08-english` asset ID.

## User-visible changes

The dua gains Arabic playback. Morning/evening سبحان الله وبحمده and أستغفر الله وأتوب إليه regain Arabic playback; the existing miscellaneous سبحان الله وبحمده instance shares the same repair. Prescribed counts remain unchanged; every supplied recording contains one repetition. English playback stays explicit and unchanged.

## Accessibility work

No control/layout changes. Existing labelled playback controls, reviewed on-screen text, keyboard semantics and manual counting remain intact. Automated evidence does not claim complete accessibility compliance.

## Tests added or updated

Six exact replacement plan checks verify versioned URLs, checksums, one embedded repetition, prescribed counts, waveforms and retained English paths. Browser coverage verifies all six instances, Arabic and English playback, counting persistence where prescribed count is 100, reciter availability and stop recovery. Rejected-variant and offline language-isolation regressions now use explicit rejected fixtures rather than relying on withdrawn production recordings.

## Commands run

Final browser command: `pnpm test:e2e e2e/audio-integrity.spec.ts --project=desktop-chromium --project=desktop-firefox-smoke --project=mobile-webkit-smoke` — **21 passed**, exit 0, 2.2m. Final `pnpm typecheck`, scoped ESLint with zero warnings, Prettier checks and `git diff --check` also passed, exit 0. The JSON browser evidence is `output/audio-restoration/e2e-results.json`.

| Command                                                                                                                                                                    | Result                                                                                                                                                                                                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Local Chromium decode and fresh-path HEAD checks                                                                                                                           | All three decoded successfully; each new path returned 404 before its upload.                                                                                                                                                                                |
| Wrangler remote object uploads                                                                                                                                             | Three uploads passed, exit 0, into fresh v2 keys; no existing key was written.                                                                                                                                                                               |
| Hosted full-byte/range/CORS and catalog comparison                                                                                                                         | Passed, exit 0; all three exact hashes/sizes/MIME types matched; 206 ranges and existing GitHub Pages CORS passed. Unrelated assets, sources, all assignments and three English variants were unchanged.                                                     |
| `pnpm test:run src/app/audio/audioRestoration.test.ts src/app/audio/audioArchitecture.test.ts src/app/audio/audioOfflineCache.test.ts src/app/audio/audioWaveform.test.ts` | Four files, 30 tests passed, exit 0, 7.96s.                                                                                                                                                                                                                  |
| `pnpm validate:audio`                                                                                                                                                      | Passed, exit 0; 254 instances, 165 assets and 196 assignments, including all hosted probes.                                                                                                                                                                  |
| `pnpm report:audio -- --write`                                                                                                                                             | Passed, exit 0; generated report updated, duplicate paths reduced from 9 to 7.                                                                                                                                                                               |
| `pnpm check`                                                                                                                                                               | Passed, exit 0, 243.2s; formatting, lint, typecheck, covered unit suite, production build, audio metadata, motion/type-scale, bundle and CSS gates all passed.                                                                                               |
| Initial browser runs                                                                                                                                                       | Interrupted, exit 1: first retained the obsolete disabled-reciter assertion; second used the internal dua category ID instead of its hyphenated URL slug. Corrected both test fixtures; playback reached the new paths. Final browser result recorded below. |
| `pnpm build:pages`                                                                                                                                                         | Passed, exit 0; Vite built in 52.99s, bundle/CSS checks passed.                                                                                                                                                                                              |
| `git diff --check`                                                                                                                                                         | Passed, exit 0.                                                                                                                                                                                                                                              |

Browser verification uses the fresh application artifact built by the initial browser run, served through a separately managed strict-port preview at 4198. Only browser test fixtures changed after that build. No application code or recorded bytes changed. The full gate passed before the final two browser fixture corrections; final formatting/lint/type verification covers those edits. Exact-snapshot publication gates are still required in the other session.

## Visual/manual evidence

Owner confirmed all three recordings' complete matching text, Abdullah Muhammad and one repetition on 2026-10-05. Chromium decoded durations: 7,344ms / 4,780ms / 5,220ms respectively. Public full-byte reads matched all local SHA-256 and sizes; MIME types matched and byte ranges returned 206 with the existing GitHub Pages CORS policy. Existing objects were not overwritten. No bucket CORS policy changes were made.

`output/audio-restoration/hosted-verification.json` records all three paths/hashes. `catalog-before.json` and the comparison verify every unrelated asset, every assignment, all source records and all three existing English variants remain unchanged. `audioWaveformUnavailable.json` retains historical failed-check evidence. No screenshot is required for a metadata-only repair.

## Documentation updated

Audio architecture/QA, decision log and agent index record the scoped owner review, immutable replacement and local publication restriction.

## Decisions recorded

The owner explicitly prohibits this session from pushing; another working session will publish. Release notes are intentionally left for that combined release, which must describe the final changes since the last deployed commit.

## Known limitations or remaining risks

The new R2 objects are public, but production retains its deployed manifest until the other session pushes. Manifest 8 invalidates earlier download catalogs, following the repository's replacement contract; readers may need to redownload audio. Existing unrelated working-tree changes are preserved. Human device/screen-reader evidence remains outside this metadata-only repair.

## Out-of-scope findings

None requiring changes.

## Recommended next step

The publishing session should include these fixes in combined release notes, run the exact-snapshot push gates, and verify Quality, Pages and production after the owner-authorized push.
