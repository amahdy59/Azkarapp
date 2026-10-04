# Phase Report — Recent review hardening

## Objective

Apply the owner's approved review recommendations while retaining their centered audio header, waveform playhead, forced-color support, and responsive/motion test repairs. Complete the authorized main-branch release cycle after verification.

## Scope completed

Entry-specific voice availability, controller-authoritative reciter identity, rejected-voice preference protection, a higher-contrast waveform, footer queue position, and selective quarantine of two mismatched Arabic recordings. Approved English narration, exact devotional content, counters and progress remain intact. Audio download selection also prevents substitution across recording languages. Manifest 7 invalidates older download catalogs.

The owner's timing repairs were committed separately as `99c9f7de`, with hook-test Git-environment isolation in `c0c5d2f3`; both remain in the candidate history. No changes are discarded or rewritten.

## Files changed

- Player: `FloatingAudioPlayer.tsx`, its stylesheet and unit tests.
- Audio: `AudioProvider`, `audioAssetsCore`, `audioManifest`, `audioOfflineCache` and their relevant unit/integration tests.
- Browser coverage: expanded audio layout, preserved 100-repeat behavior on an approved recording, and the new `audio-integrity.spec.ts`.
- Documentation: design system, audio architecture/QA/offline contracts, generated mapping report, decision log, phase index and this report.
- Deployment copy: the four-entry Arabic/English release manifest, covering only these changes after the successful `c0c5d2f3` deployment (Quality `37233733250`, Pages `37235293533`). Earlier RTL, reading-motion and enlarged-dialog improvements are not repeated.

## Components added or modified

Modified `FloatingAudioPlayer`; no new product components, persistence schema, dependencies, prayer calculation, or religious wording.

## User-visible changes

The centered reciter header and owner's playhead remain. The functional waveform is easier to see. Queue position is restored in the footer alongside separate repetition progress. Only voices with a current approved entry recording are selectable; rejected changes cannot mislabel playback or change saved voice preferences. Two mismatched Arabic recordings are unavailable pending reviewed replacements; all five shared entries retain reading/counting and approved English narration. Downloads never substitute English for missing Arabic or Arabic for missing English.

## Accessibility work

Measured composited waveform contrast in Light, Midnight and Dark at a 3:1 minimum. Preserve keyboard range semantics, nested Escape/focus restoration, 44px targets, RTL/LTR order, forced colors and reduced motion. Retain existing short-phone, landscape and 200% text coverage. Physical-device and human assistive-technology checks remain explicitly pending.

## Tests added or updated

- Unit regressions for unavailable voices, delayed controller acceptance, rejected preference updates, selective Arabic quarantine, retained English plans, and download language isolation.
- Browser assertions for actual composited waveform contrast, centered-header/footer queue anatomy, both quarantined entries' count persistence and explicit English playback, and Al-Kahf's approved voice/menu semantics.
- The original 100-repeat assertions run on approved tawhid audio; the unavailable istighfar recording is covered separately rather than skipped.

## Commands run

| Command                                                   | Result                                                                                                                                                                                                       |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Fresh full-byte probe of the two reported Arabic variants | Both HTTP 200 responses still fail their approved SHA-256 checks; sizes match. Evidence: `output/audio-integrity-review.json`.                                                                               |
| Initial focused unit run                                  | 66 passed, one failed: whole-assignment withdrawal removed valid English coverage. Narrowed quarantine to Arabic variants; retained the original full-English-coverage assertion.                            |
| Focused unit run after selective quarantine               | Four files, 68 passed, exit 0.                                                                                                                                                                               |
| Final focused unit run including download isolation       | Five files, 73 passed, exit 0.                                                                                                                                                                               |
| `pnpm typecheck`                                          | Passed, exit 0.                                                                                                                                                                                              |
| `pnpm audit:english-audio`                                | Passed: all 143 approved English recordings verified for HTTP/MIME, MP3 signature, exact size and SHA-256.                                                                                                   |
| `pnpm validate:audio`                                     | Passed including hosted probes: 254 instances, 165 assets, 196 mappings.                                                                                                                                     |
| `pnpm audit:prod`                                         | Passed: no known vulnerabilities.                                                                                                                                                                            |
| Initial feature browser run                               | 70 passed, one failed, exit 1, 4.0m: Arabic-repeat fixture used the quarantined recording. Failure preserved under `output/review-hardening-feature-failure`; repeat assertions retained on approved tawhid. |

The new browser regression initially exposed test setup errors (reload reseeded saved progress, a mismatched localized button label, and a unit-test matcher used in Playwright). Those errors were corrected without changing product behavior or reducing assertions. The final Chromium/Firefox/WebKit regression run passed all 10 tests, exit 0, in 50.4 seconds.

Final local gates:

- Full `pnpm test:e2e`: 535 passed, one existing skipped test, no failures, exit 0, 26.2m. All five browser projects ran. JSON: `output/review-hardening-full-results.json`.
- `pnpm install --frozen-lockfile`: passed, exit 0; pinned pnpm 11.19.0 and Node 24.21.0.
- `pnpm check`: all stages passed, exit 0, 91.4s: enforced coverage, build, typecheck, lint, formatting, audio manifest, type scale, bundle budget and CSS utilities. No thresholds or ceilings changed. Global coverage: statements 75.10%, branches 72.05%, functions 71.13%, lines 77.20%.
- `pnpm build:pages`: passed, exit 0: Pages-mode production build, generated service worker, bundle budget and CSS checks.
- `git diff --check`: passed, exit 0.

The tracked pre-push hook reruns the frozen install, exact-snapshot quality validation, core browser suite and Pages build. Its outcome, the exact released commit, Quality/Pages job results and production smoke evidence are recorded in the local completion report `output/review-hardening-release.md` after confirmation. The production check verifies the deployed SHA, reading/count persistence, English audio delivery, reciter availability and return to the counter. Remote checks are not counted as passing before they finish.

## Visual/manual evidence

Expanded-player browser scenarios produce screenshots at narrow phone, ordinary phone, tablet, desktop, landscape and enlarged text. Contrast assertions read actual composited browser colors; screenshots alone do not prove contrast, motion or assistive-technology behavior.

Phone, desktop and 200% text screenshots are preserved locally under `output/review-hardening-evidence/`. The phone and enlarged-text captures were visually inspected; ordinary-phone controls are visible, and enlarged content uses the tested scrollable layout. These are automated browser captures, not physical-device sign-off.

| Human verification                   | Required evidence                                                                                                    | Status                       |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| iPhone/iPad VoiceOver and safe areas | Device, OS/browser, date, tester; Arabic/English reading, playback, seek, menus, enlarged text, notch/home indicator | Pending human test           |
| Android TalkBack and cutouts         | Device, OS/browser, date, tester; same flow including RTL and large fonts                                            | Pending human test           |
| Lock screen/background/headphones    | Metadata names, pause/resume/seek, interruptions, natural-ending-only completion                                     | Pending physical-device test |
| Replacement Arabic audio             | Qualified review of exact bytes, transcript, pronunciation and rights; immutable new paths and signed metadata       | Pending approved replacement |

## Documentation updated

Contracts now describe centered reciter identity, footer queue position, selective rejection, cache invalidation and download language isolation. The human checklist distinguishes emulator/automated evidence from real-device sign-off.

## Decisions recorded

`DECISION_LOG.md`: Recent review recommendations and owner refinements, 2026-10-04. This supersedes only the queue-position header placement and authorizes these focused fixes and release verification.

## Known limitations or remaining risks

No human audio reapproval or physical-device/screen-reader sign-off is fabricated. Quarantined Arabic recordings remain unavailable until approved replacements are supplied. Existing catalog hashes and all reviewed content remain unchanged.

## Out-of-scope findings

No additional product redesign or roadmap phase is introduced.

## Recommended next step

Complete physical-phone/screen-reader evidence and provide exact-byte approved replacements for the two quarantined Arabic recordings.
