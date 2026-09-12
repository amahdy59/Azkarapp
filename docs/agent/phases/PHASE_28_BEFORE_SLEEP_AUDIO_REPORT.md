# Phase Report — Before-sleep audio

## Objective

Publish and link the owner-supplied revised before-sleep recordings without assigning audio to non-matching devotional content.

## Scope completed

- Uploaded eleven exact-match MP3 files to the existing `azkar-audio` Cloudflare R2 bucket under the immutable `azkar/before_sleep/abdullah-muhammad/v1/` prefix.
- Compared full public downloads against the local reviewed files; all eleven SHA-256 hashes and byte sizes matched.
- Added an owner-authorized source record, reciter metadata, exact transcript fingerprints, measured duration, byte size, checksum, public path, and approved review state.
- Added eleven explicit production assignments.
- Left two unrelated supplied files and seven before-sleep entries without supplied recordings unassigned.

## Files changed

- `src/app/audio/audioManifest.ts`
- `src/app/audio/audioAssignments.ts`
- `src/app/audio/audioArchitecture.test.ts`
- `docs/audio/generated-mapping-report.md`
- `docs/audio/adding-your-own-audio.md`
- `docs/agent/DECISION_LOG.md`
- `docs/agent/INDEX.md`
- `docs/agent/phases/PHASE_28_BEFORE_SLEEP_AUDIO.md`
- `public/release-notes.json`

## Components added or modified

- Audio catalog manifest and approved assignment registry.
- Explicit audio architecture regression coverage.

## User-visible changes

Eleven before-sleep entries now expose the existing audio controls with Abdullah Muhammad identified as the reciter. Entries without an exact approved recording remain readable and honestly audio-unavailable.

## Accessibility work

No control anatomy or semantics changed. Existing unavailable-state behavior is preserved so an audio control is not exposed as playable when no verified recording exists.

## Tests added or updated

- Added a regression asserting the exact set of eleven approved before-sleep assignments and one-to-one asset IDs.
- Regenerated the audio coverage report after adding the assignments.

## Commands run

| Command                                                        | Result                                                               |
| -------------------------------------------------------------- | -------------------------------------------------------------------- |
| `pnpm validate:audio`                                          | Passed: 195 zikr instances, 35 assets, 35 approved mappings          |
| `pnpm exec vitest run src/app/audio/audioArchitecture.test.ts` | Passed: 9 tests                                                      |
| `pnpm report:audio -- --write`                                 | Passed; generated mapping report updated                             |
| `pnpm install --frozen-lockfile`                               | Passed; lockfile already up to date                                  |
| `pnpm check`                                                   | Passed in 129.8 seconds                                              |
| `pnpm test:e2e`                                                | Passed: 385 tests, 1 intentional skip, in 13.6 minutes               |
| `pnpm build:pages`                                             | Passed; Pages build, bundle budget, and CSS utility checks succeeded |
| `pnpm check:release-notes`                                     | Passed; manifest describes the commits waiting to deploy             |

## Visual/manual evidence

- Cloudflare R2 listed all eleven objects with `audio/mpeg` and the expected byte sizes.
- Every public object answered a one-byte range request with `206 Partial Content`, `Accept-Ranges: bytes`, and the correct total `Content-Range` size.
- Full public downloads of all eleven objects produced the same SHA-256 hashes as the reviewed local files.

## Documentation updated

- Added the Phase 28 scope and DEC-169.
- Updated the audio-owner runbook to describe the current Cloudflare R2 host and immutable upload process.
- Regenerated current audio mapping coverage.
- Replaced release notes with this release's user-visible outcomes.

## Decisions recorded

DEC-169 records exact-only owner-approved before-sleep assignments, the R2 prefix, integrity evidence, and unavailable-item behavior.

## Known limitations or remaining risks

- The R2 bucket's CORS policy currently permits only local development. Production-origin CORS must be added before cross-origin offline downloads can be claimed; ordinary media streaming is available without that fetch permission.
- The current `r2.dev` public development URL is rate-limited and lacks production-grade custom-domain caching. A later infrastructure phase should migrate the unchanged object keys to an R2 custom domain.
- Approval records the owner's supplied revised files and exact text mapping; it does not claim a separate qualified tajwid review beyond that owner approval.

## Out-of-scope findings

The two supplied recordings named `سبحان الله وبحمده` and `سبحان الله وبحمده سبحان الله العظيم` do not exactly match a before-sleep entry and were not published in the app manifest.

## Recommended next step

Add the production GitHub Pages origin to the existing R2 CORS policy, then move the bucket to a custom audio domain when production traffic warrants it.
