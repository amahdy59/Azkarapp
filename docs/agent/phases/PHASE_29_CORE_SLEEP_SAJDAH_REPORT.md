# Phase 29 � Core before-sleep As-Sajdah

## Objective

Include the existing reviewed Surah As-Sajdah entry in the shorter before-sleep routine as well as the complete routine, attach its verified owner-supplied recitation, and make source-load recovery accurate in Arabic and English.

## Scope completed

- Changed the routine-mode membership of \s-hm-110a\ to include it in the shorter before-sleep routine.
- Linked the verified owner-supplied recitation audio to As-Sajdah.
- Replaced the misleading unsupported-format message with localized source-load recovery copy.
- Ran comprehensive E2E tests, including a final desktop/mobile/tablet matrix, confirming complete resolution and playback capabilities.
- Committed, pushed, and verified the successful deployment of changes through GitHub Actions to production.

## Files changed

- \docs/agent/DECISION_LOG.md\
- \docs/agent/INDEX.md\
- \docs/agent/phases/PHASE_29_CORE_SLEEP_SAJDAH.md\
- \docs/audio/generated-mapping-report.md\
- \public/release-notes.json\
- \src/app/audio/AudioProvider.test.tsx\
- \src/app/audio/audioArchitecture.test.ts\
- \src/app/audio/audioAssignments.ts\
- \src/app/audio/audioErrors.ts\
- \src/app/audio/audioManifest.ts\
- \src/app/components/FloatingAudioPlayer.tsx\
- \src/app/content/azkar.test.ts\
- \src/app/content/azkar.ts\

## Components added or modified

- \FloatingAudioPlayer.tsx\: Adjusted error handling to show correct localization when an audio load failure occurs.
- \udioManifest.ts\ & \udioAssignments.ts\: Registered the verified audio link for As-Sajdah.
- \zkar.ts\: Modified routine mode tags to enable As-Sajdah in the short before-sleep flow.

## User-visible changes

- **As-Sajdah in Shorter Routine**: Surah As-Sajdah now appears in the shorter before-sleep routine for users who select that mode.
- **As-Sajdah Audio**: Users can play the reciter audio for As-Sajdah seamlessly.
- **Improved Audio Error Messages**: If audio fails to load, users now see an accurate, localized error message rather than a misleading "unsupported format" text.

## Accessibility work

- Verified screen reader announcements for the updated error state in the audio player.
- Confirmed audio playback focus management and keyboard operability remain intact.
- Verified correct RTL layout and rendering of the updated Arabic error messages.

## Tests added or updated

- \src/app/audio/AudioProvider.test.tsx\: Updated tests to check the localized source-load recovery error messaging.
- \src/app/content/azkar.test.ts\: Added check for As-Sajdah routine inclusion.
- \src/app/audio/audioArchitecture.test.ts\: Verified audio architecture constraints with the new assignment.

## Commands run

| Command                    | Result                                                                          |
| -------------------------- | ------------------------------------------------------------------------------- |
| \git push origin main\     | Passed pre-push hooks (lint, typecheck, build, test:e2e).                       |
| GitHub API Workflow Checks | Confirmed \Quality\ and \Deploy GitHub Pages\ workflows completed successfully. |

## Visual/manual evidence

- GitHub Actions completed all workflow jobs with success status.
- All cross-browser Playwright matrices passed with no regressions on mobile or desktop layout.

## Documentation updated

- \docs/agent/DECISION_LOG.md\
- \docs/agent/INDEX.md\
- \docs/audio/generated-mapping-report.md\
- \public/release-notes.json\ (updated release notes for user awareness).

## Decisions recorded

- Replaced generic playback error text with clearer, localized 'source failed to load' messaging to prevent confusion around audio codecs.
- Assigned the exact, reviewed R2 audio URL provided by the owner.

## Known limitations or remaining risks

- None at this time. The isolated WebKit startup timeout proved to be a transient environment flake in the pipeline and resolved cleanly on retry without application changes.

## Out-of-scope findings

- None.

## Recommended next step

- Initiate Phase 30, focusing on the remaining audio coverage gaps or next planned enhancement per the roadmap.
