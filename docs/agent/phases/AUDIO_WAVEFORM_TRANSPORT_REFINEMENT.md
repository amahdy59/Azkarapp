# Phase Report — Audio waveform and transport refinement

## Objective

Apply the owner-approved player recommendations and follow-up: preserve the reading canvas, simplify identity/settings, add trustworthy waveform seeking, independent continuation and vertical volume. Keep all work local pending owner review.

## Scope completed

Plan: inspect audio/Reader contracts and reusable controls; generate verified waveform peaks; simplify the compact dock; implement stable transport and independent continuation; preserve completion/repetition behavior; align the expanded surface; test and capture evidence; update contracts. Follow-up moves reciter and track position into the header, removes its duplicate zikr title and visible speed label, and places brief Play all beside volume and speed.

Implementation and player-specific verification are complete. Repository-wide verification is qualified by concurrent owner edits as recorded below. No commit, push, release-note rewrite or deployment is authorized for this phase.

## Files changed

- Application integration: src/app/App.tsx and src/app/screens/ReaderScreen.tsx.
- Player: src/app/components/FloatingAudioPlayer.tsx, FloatingAudioPlayer.test.tsx, floating-audio-player.css and new AudioVolumeControl.tsx.
- Audio: src/app/audio/AudioProvider.tsx and AudioProvider.test.tsx; new audioWaveform.ts, audioWaveform.test.ts, audioWaveforms.json and audioWaveformUnavailable.json; scripts/generate-audio-waveforms.mjs.
- Localization: src/app/i18n/ar.ts and en.ts (player keys only).
- Browser tests: e2e/audio.spec.ts and e2e/audio-expanded-layout.spec.ts.
- Contracts: docs/DESIGN_SYSTEM.md, docs/QUALITY_CHECKLIST.md, docs/audio/architecture.md, docs/audio/testing-and-qa.md, docs/agent/DECISION_LOG.md, docs/agent/INDEX.md and this report.

Other concurrent workspace edits belong to the owner's separate work and were preserved. No dependency, lockfile, reviewed religious content, persistence schema or bundle ceiling was changed by this phase.

## Components added or modified

FloatingAudioPlayer uses one seek range and real peaks, a symmetric media grid and one responsive compact dock. AudioVolumeControl composes the existing Radix popover and a native vertical range. AudioProvider owns transient continuation. ReaderScreen no longer injects duplicate audio controls. Application ownership stays stable while queue navigation synchronizes the Reader.

## User-visible changes

- Compact: context/expand, Play/Pause, Stop and one thin progress strip.
- Expanded: reciter/position header without repeated title; complete reviewed text; actual waveform seeking without a large thumb; physical Previous, −10, Play/Pause, +10, Next in both languages.
- Volume opens vertically on activation, with percentage and explicit mute. Speed shows only its value; Play all has brief visible copy and a descriptive accessible name.
- Manual navigation remains available when continuation is off. Starting one zikr snapshots available collection tracks with continuation off; Play All starts on. Prescribed repeats, internal segments and ritual rounds remain intact.
- Fixed unwanted collapse on Next/Previous and reciter clipping at enlarged text sizes.

## Accessibility work

Native keyboard-operable ranges, visible seek focus outline, minimum 44px action targets, labelled selects, switch state and descriptive time values. Nested Escape restores focus without collapsing the player. Textual RTL is preserved alongside physically stable media direction. iOS retains hardware volume. Browser evidence covers narrow layouts, enlarged text, safe reading access, keyboard/focus and axe scans. Automated checks do not certify complete WCAG compliance.

## Tests added or updated

Unit coverage verifies real-data/fallback integrity, volume disclosure/mute, compact simplicity, fixed media keys, manual navigation, continuation boundaries, prescribed loops, internal segments and ritual rounds. Browser coverage checks manual queue navigation without collapse, pointer seeking, speed/transport alignment, mirrored slot symmetry, concise settings alignment, vertical volume/focus and the existing responsive/reading/accessibility matrix.

## Commands run

| Command                                                                                                                                | Result                                                                                                                                                                                                                                                                                                                                                           |
| -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| node scripts/generate-audio-waveforms.mjs                                                                                              | Passed: 241 of 243 unique recordings verified and decoded; two rejected hosted checksums retain fallback.                                                                                                                                                                                                                                                        |
| pnpm test:run src/app/components/FloatingAudioPlayer.test.tsx src/app/audio/AudioProvider.test.tsx src/app/audio/audioWaveform.test.ts | Passed: 3 suites, 41 tests.                                                                                                                                                                                                                                                                                                                                      |
| Manual navigation / waveform seeking across browsers                                                                                   | Passed: Chromium, Firefox and WebKit, 3 cases, exit 0, 37.6 seconds; actual pointer click-and-drag and independent queue navigation.                                                                                                                                                                                                                             |
| pnpm check                                                                                                                             | Exit 1, 318.0 seconds during concurrent edits: typecheck/build syntax failures in CustomCounterScreen; unused counter prop; formatting in separate counter/picker/share edits; 10 unit failures across CustomCounterScreen and FridaySalawatScreen (1317 passed, 176 suites passed). Earlier player implementation passed all ten stages, exit 0, 224.1 seconds. |
| Audio browser matrix                                                                                                                   | 39 of 40 passed, exit 1, 8.8 minutes. WebKit desktop timed out during axe at the unchanged 90-second limit; all its preceding geometry/keyboard checks passed. Isolated unchanged rerun passed, exit 0, 54.1 seconds, with the original timeout and axe assertions. All 40 scenarios have passing evidence.                                                      |
| pnpm build:pages                                                                                                                       | Exit 1: Vite production build and bundle budget passed; CSS utility guard rejects removed .ps-8/.pe-2/.start-2 utilities after concurrent shared-menu edits. No guard was weakened. Later owner edits may resolve these issues; a fresh whole-repository gate is required after that work settles.                                                               |

Intermediate runs exposed insufficient reading height, a compact 43.5px target and navigation remount; these were fixed without weakening existing requirements. Revised tests replace obsolete hover-volume, mirrored media and duplicate-title expectations with the owner-approved behavior. A transient edit error omitted the reciter select; targeted tests caught it immediately and it was restored before verification. A new volume-alignment assertion initially waited for a software control on the iOS profile; it now explicitly verifies the preserved hardware-volume behavior instead.

Later targeted ESLint and full pnpm typecheck both passed, exit 0, after the concurrent syntax/type edits settled. Player unit rerun passed 41 tests, exit 0, 49.35 seconds. The final enlarged-text matrix passed all three engines, exit 0, 52.8 seconds.

Affected-file Prettier check and git diff --check passed, exit 0. The initial extended pointer test mixed a real CDN media element with a stub duration; slower runs received real metadata and natural endings. It now uses the existing deterministic fake-media pattern so seek calculations and queue assertions are independent of hosting timing; actual MP3 bytes remain verified separately by generation.

## Visual/manual evidence

Screenshots in ../evidence/audio-waveform/: [expanded Arabic phone](../evidence/audio-waveform/expanded-ar-phone.png), [collapsed Arabic phone](../evidence/audio-waveform/compact-ar-phone.png), [English at 200% text](../evidence/audio-waveform/expanded-en-200-percent.png), [Arabic desktop](../evidence/audio-waveform/expanded-ar-desktop.png) and [vertical volume](../evidence/audio-waveform/volume-vertical.png). Visually inspected for preserved reading content, concise settings, balanced transport and clean reciter wrapping. Browser media events are controlled in deterministic functional tests; hosted waveform generation independently verifies actual recording bytes.

## Documentation updated

Design system, audio architecture and QA, quality checklist, decision log, index and this phase report. They supersede old mirrored media/large compact controls/hover-volume contracts and record the owner follow-up.

## Decisions recorded

The owner approves real waveform generation, symmetric/aligned transport, click-open vertical volume and no large seek marker; then requests the reciter/position header and concise single settings row. All changes remain uncommitted and unpushed until owner review because other work is in progress elsewhere.

## Known limitations or remaining risks

Two hosted Abdullah Muhammad recordings (m-hm-91 and m-hm-96) have SHA-256 values different from their approved manifests. They receive a seek-line fallback; manifests/assets were not altered. Replacing reviewed recordings is a separate content/source-review task. Real-device audio output, screen-reader announcements and iOS hardware volume still require human/device confirmation. Concurrent edits mean verification describes the tested snapshot, not a future merge or deployment.

## Out-of-scope findings

No deployment changes. Concurrent owner edits in counter/salawat, picker, sharing and shared menus were preserved; their intermediate whole-repository failures prevent a clean release claim. The existing Reader header still truncates its collection title at 200% text in the evidence; the expanded player identity wraps correctly. Existing media hosting mismatches are recorded transparently rather than silently accepted.

## Recommended next step

Owner review of the local player and pending third comment, then coordinate concurrent work before authorizing any commit or push. After approval, regenerate release notes and execute the repository's release gates/workflow monitoring.
