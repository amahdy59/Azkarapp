# Phase Report — Al-Imran audio restoration

## Objective

Restore working playback for the complete Al-Imran 3:190–200 waking passage using the existing owner-confirmed R2 recording.

## Scope completed

Plan before edits: inspect the transcript/assignment and prior completion contract, record the owner's scope confirmation, correct metadata using the unchanged reviewed passage, restore the exact assignment, verify bytes and native playback, and add strict regression coverage. The owner subsequently explicitly requests local application only: no commit, push, deployment or release-note edits. The prepared isolated checkout is archived; the repair remains in the shared local workspace.

## Files changed

audioAssetsCore.ts, audioAssignments.ts, audioArchitecture.test.ts, quranImranPassage.test.ts, e2e/audio-integrity.spec.ts, generated-mapping-report.md, ARCHITECTURE.md, CONTENT_AUTHORING.md, agent decision log/index and this report. ownerTimingPreviews.ts, ownerTimingLoader.test.ts and the new digest-addressed active timing pack also retire the obsolete short-transcript candidate. The original timing pack remains intact as historical evidence.

## Components added or modified

None. Existing resolver, playback-plan builder, controller, cache and reader controls are reused.

## User-visible changes

Listen is available again for Al-Imran 190–200. Its complete existing 4:42 recording participates in normal Arabic playback and approved audio downloads. The audio asset correctly identifies Quran rather than dua. Recording bytes, path, source, variant identity and reviewed reading content are unchanged.

## Accessibility work

Existing native controls, localized labels and announcements remain. Browser regression checks Stop restores focus to the counter according to the Reader contract. No complete assistive-technology compliance claim.

## Tests added or updated

Resolution and exact complete transcript/range/fingerprint; immutable recording size/checksum; rejection of the obsolete two-verse text; complete playback-plan URL; restored content assignment; reader start/expand/late-playback/stop and no stale short-transcript cues across Chromium, Firefox and WebKit.

## Commands run

| Command                                                     | Result                                                                                                                                          |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Targeted Vitest: audioArchitecture and quranImranPassage    | 22/22 passed. Initial new assertion used a manifest-only byteSize field on a resolved segment; corrected to assert the actual manifest variant. |
| pnpm validate:audio:local                                   | Passed: 255 instances, 166 assets, 197 mappings in the shared candidate.                                                                        |
| pnpm validate:audio                                         | Passed including hosted probes.                                                                                                                 |
| pnpm report:audio -- --write                                | Passed; current report regenerated.                                                                                                             |
| Al-Imran browser regression in Chromium, Firefox and WebKit | 3/3 passed. Initial new focus expectation incorrectly named Listen; corrected to the documented counter focus target.                           |
| Hosted full GET and SHA-256 verification                    | HTTP 200, audio/mpeg, wa-zaker.com CORS allowed; 11,297,280 bytes and f4ba5b49fef6bb91d693276907cb6d6bdfac22118b768fe13ebb1625516d4607 match.   |
| Native Chromium app playback and Web Audio decode           | Passed: duration 282.432s, stereo 48kHz, playback clock advances at start and after seeking to 260s, no media error.                            |
| pnpm install --frozen-lockfile                              | Passed with pnpm 11.19.0.                                                                                                                       |

Final local verification:

- Final targeted unit suite: 3 files, 24/24 tests passed, including absence of the retired Al-Imran timing record.
- Final three-engine Al-Imran browser suite: 3/3 passed in 2.0 minutes.
- Owner timing validator: all remaining 289 candidates for 241 recordings passed; active pack is 91,356 bytes. Original pack remains unchanged.
- First pnpm check failed on the now-retired obsolete timing candidate and shared bundle growth; unit tests and all other stages passed.
- Final pnpm check: exit 1 in 150.9s solely on shared initial-route bundle growth (162,868 gzip bytes versus baseline 159,119). Toolchain, production build, TypeScript, lint, formatting, complete unit/coverage stage, audio/timing/content validators, motion/type checks and CSS utilities all passed.
- Shared pnpm build:pages: production artifact/PWA built successfully, then exit 1 solely on the same bundle-growth guard (162,897 gzip bytes). No baseline or ceiling changed.
- Independent clean HEAD production/Pages-mode build: bundle budget passed. The same clean snapshot with only this repair's audio metadata, assignment and active timing pack applied: production/Pages-mode build and unchanged bundle budget also passed. Logs are output/imran-audio/baseline-build.log and isolated-fix-build.log. This isolates the shared growth to other pending work, without editing it.
- Final native live playback and full Web Audio decode repeated successfully after timing retirement; duration 282.432s and seek to 260s advance without error.
- git diff --check passed.

No commit, push, deployment or release-note change was made. Prepared release checkout was archived after the owner's local-only instruction. The shared bundle limitation is reported for the future combined release; it does not prevent locally verified playback.

## Visual/manual evidence

Inspected output/imran-audio/live-playback.png showing the actual expanded app playing at 4:20 of 4:42. output/imran-audio/live-verification.json records native playback/decoder results; the downloaded immutable recording is retained there for local verification. Mocked browser regression checks UI behavior separately from this real-media check.

## Documentation updated

Architecture/content guidance now records corrected catalog metadata and restored playback after the owner's exact-scope confirmation. Historical snippet reports retain their original quarantine evidence; this phase supersedes that unresolved scope only.

## Decisions recorded

Owner explicitly states the R2 recording matches the current displayed text. Reuse its approved bytes and existing reviewed passage rather than infer a new recording or change sacred text. No matching/hash, timing approval, coverage or bundle rule is weakened. Old two-verse timings are not extended, relabelled or accepted for the expanded text.

## Known limitations or remaining risks

No complete eleven-verse word timing is approved by this repair, so playback retains readable text without synchronized word emphasis. Physical-device/headphone and screen-reader checks remain separate human evidence. All work remains local under the latest owner instruction.

## Out-of-scope findings

Preserved all unrelated working-tree changes. No dependency, persistence, synchronization, prayer-time or content change.

## Recommended next step

Owner smoke test the restored passage; independently review full-passage timings if synchronized word emphasis is desired.
