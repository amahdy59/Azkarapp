# Phase Report — Additional audio voices / OpenDua pilot

## Objective

Complete the owner-approved additive OpenDua review pilot while retaining existing hosted audio, playback defaults and downloads. Review tooling is complete; **recording activation remains pending independent qualified Arabic listening review**.

## Scope completed

- Retain three original Muhammad Jumah/OpenDua MP3s (305,256 bytes), explicit existing asset/segment mappings, original source URLs, versioned proposed keys, sizes and SHA-256 identities.
- Preserve the byte-identical source catalogue and CC BY 4.0 audio-licence snapshot, with pinned checksums and attribution. Preparation refuses different upstream bytes instead of replacing evidence.
- Provide a DEV-only bilingual current/additional recording comparison, exact source transcript, automatic formatting-normalized match hint, measured duration, error recovery, named findings, checksum-bound local notes and full JSON export. Notes never activate playback.
- Replace the review's native modal with the existing shared Modal after real-browser reproduction showed its external portalled Select menu could not receive pointer clicks. Preserve opaque menu protection, focus recovery and current-player pause on explicit review playback.
- Repair actual 320px/200% grid/fieldset overflow and allow radio/selector labels to wrap. Retain Arabic reading typography and native media controls.
- Correct the confirmed production bug: changing a Quran reciter updates only `quranReciterId`; it no longer overwrites the unrelated saved `duaVoiceId`.
- Prove existing cache migration retains every saved voice of an unchanged asset when another pending variant is added. No migration or cache-format change was needed.

## Files changed

- `.prettierignore`: exact-byte upstream licence/catalogue evidence exclusions only; tests enforce their SHA-256 identities.
- `scripts/prepare-opendua-pilot.mjs`, `scripts/opendua-pilot.test.mjs`.
- `src/app/audio/openDuaPilot.ts`, `openDuaPilot.test.ts`, `AudioProvider.tsx`, `AudioProvider.test.tsx`, `audioOfflineCache.test.ts`.
- `src/app/components/AppModalHost.tsx`.
- `src/app/screens/OpenDuaPilotReview.tsx`, `OpenDuaPilotReview.test.tsx`, `AudioContentReviewScreen.tsx`, `AudioContentReviewScreen.test.tsx`.
- `src/app/i18n/audioReview.ts`.
- `docs/audio/opendua-pilot/`: README, original catalogue/licence, pilot manifest, technical measurements and three original MP3s.
- `docs/audio/content-review-workflow.md`, this phase's brief/report, agent index/decision log and six-image evidence gallery/matrix.

Independent shared-checkout changes are preserved. The production audio manifests, source/voice/assignment registries, catalog version, hosted objects, checksums and timing data are unchanged.

## Components added or modified

`OpenDuaPilotReview` is a review screen composed with the existing protected Select. `AudioContentReviewScreen` uses the shared Modal and exposes the pilot alongside existing recording review. `AppModalHost` conditionally imports the review module only in development. `AudioProvider` retains its existing production ownership and preference boundary.

## User-visible changes

Ordinary playback keeps its current recordings/defaults. Quran and dua voice preferences remain independent when a supported optional reciter is changed. Developers/reviewers can open `/?audio-review=1&audio-source=opendua` on the development server to compare the three pending recordings and export findings. No new voice appears in ordinary production settings or downloads.

## Accessibility work

Native radio/media/input/textarea controls, localized labels, exact adjacent Arabic transcript, visible focus, minimum-height actions, error announcements, bounded protected portalled options, RTL/LTR reading, enlarged reflow and Escape/focus recovery. All 12 browser scenarios pass axe WCAG A/AA scanning in the review dialog. This does not claim complete accessibility compliance or replace real-device/assistive-technology acceptance.

## Tests added or updated

- Explicit source/app/segment text matching and mismatch rejection; pending variants stay unavailable; production catalogue/default resolution remains unchanged.
- Malformed local notes recover safely; unknown recording identities are discarded; review/export stays separate from activation.
- Current/additional source changes, media failure/unmount, named notes, denied storage and export recovery.
- Actual parent-modal sample selection, nested Escape recovery, per-recording note separation and preview cleanup.
- Independent Quran/dua preference mutation and multi-voice download-cache preservation.
- Pinned catalogue/licence/media hash checks and pending, checksum-bound technical playback evidence.

## Commands run

| Command                                                                                                                                                                                                                                                      | Result                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `node scripts/prepare-opendua-pilot.mjs`                                                                                                                                                                                                                     | PASS; 3 pending files, 305,256 bytes; repeat intake preserves immutable files                                                             |
| `pnpm test:run src/app/audio/openDuaPilot.test.ts src/app/screens/OpenDuaPilotReview.test.tsx src/app/screens/AudioContentReviewScreen.test.tsx src/app/audio/AudioProvider.test.tsx src/app/audio/audioOfflineCache.test.ts scripts/opendua-pilot.test.mjs` | PASS; final **6 files / 45 tests**, 19.67s                                                                                                |
| Targeted `pnpm exec eslint` across the changed TS/TSX/MJS files                                                                                                                                                                                              | PASS, exit 0                                                                                                                              |
| Targeted `pnpm exec prettier --write` / `--check` for this phase's files                                                                                                                                                                                     | PASS; original evidence snapshots intentionally excluded                                                                                  |
| Playwright CLI three-file technical playback / narrow Arabic check                                                                                                                                                                                           | PASS; all three MP3 clocks advance; 320px/200% menu bounded and review has no horizontal overflow                                         |
| `node output/playwright/opendua-cross-engine.mjs` (local generated QA driver)                                                                                                                                                                                | PASS; **12 scenarios**, four each in Chromium/Firefox/WebKit; zero axe violations; pending-only exports; pointer/keyboard/geometry checks |
| `pnpm exec vite build --mode github-pages --outDir output/opendua-pilot/production`                                                                                                                                                                          | PASS; 11.51s; isolated output avoids another session's build directory                                                                    |
| `node scripts/check-bundle-budget.mjs output/opendua-pilot/production`                                                                                                                                                                                       | PASS; Home startup graph 524,595 gzip bytes; ceilings unchanged                                                                           |
| `node scripts/check-css-utilities.mjs output/opendua-pilot/production`                                                                                                                                                                                       | PASS, exit 0                                                                                                                              |
| `node output/playwright/opendua-check-isolation.mjs`                                                                                                                                                                                                         | PASS; 1,159 files, 11 markers; zero pilot URLs, voice ID, filenames, recording hashes or pilot review-storage key                         |
| Scoped `git diff --check`                                                                                                                                                                                                                                    | PASS                                                                                                                                      |
| Aggregate `pnpm check`, hook smoke, full browser/Pages/deployment gates                                                                                                                                                                                      | Handed to the owner's sole release coordinator; not run concurrently in this audio session                                                |

Generated logs are in `output/opendua-pilot/`; retained review/evidence files are linked below. The first browser attempts exposed and helped repair the native-dialog portal failure, fullscreen positioning and enlarged intrinsic-sizing issues. An external CLI/Firefox protocol mismatch required the repository-matched runtime. A browser harness language-seeding race was fixed by applying seed data before application startup. Final assertions were retained and pass.

## Visual/manual evidence

[Actual review gallery and 12-scenario matrix](../evidence/additional-audio/README.md). [Technical recording measurements](../../audio/opendua-pilot/measurements.json) retain 12,947ms, 13,782ms and 3,500ms Chromium metadata durations beside the source's rounded 13s/14s/4s declarations. These are automated loading/playback evidence; final production authoring still requires the existing exact-duration workflow.

## Documentation updated

[Pilot authoring/reviewer handoff](../../audio/opendua-pilot/README.md), [content review workflow](../../audio/content-review-workflow.md), phase brief, agent index, owner decision and screenshot/geometry evidence. No release notes changed in this session; the release coordinator owns the consolidated manifest.

## Decisions recorded

The owner's request implements optional variations without replacing current recordings. The owner subsequently resumes this unfinished scope and authorizes a separate coordinating chat to validate/publish release-ready work. This session neither commits nor pushes. Human review/licensing boundaries remain in force regardless of release coordination.

## Known limitations or remaining risks

- All three OpenDua recordings remain pending independent Arabic listening/pronunciation, full-boundary and embedded-repetition review. No named human finding or production approval was fabricated.
- Nothing was uploaded to the audio host. Before activation, retain independent findings, exact metadata, immutable hosting, source attribution, coverage and download-preservation evidence in the established workflow.
- Al Quran Cloud is not implemented; permissions covering intended hosting/offline/export remain unresolved.
- No new Quran voice/timing set is present, and no existing annotation can be reused for another recording.
- Native/screen-reader/manual listening acceptance is separate from browser emulation and automated text/axe checks.
- Aggregate exact-snapshot release gates and production monitoring belong to the coordinating release owner.

## Out-of-scope findings

No unrelated content, storage/synchronization, deployment, dependency or fallback-policy remediation was performed. General local visitor requests use only the loopback test API; production-build browser checks must block external services before navigation.

## Recommended next step

The release coordinator can include the verified Quran/dua preference fix, DEV-only review implementation, tests and retained authoring evidence after the combined gates. Keep the OpenDua MP3s/source data out of deployment output and all pending variants out of production resolution. A qualified reviewer can now use the concrete comparison screen and export named findings; activate selected variants in a subsequent controlled phase only after that review.
