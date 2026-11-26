# Phase 96 — Mushaf listening access and focus

## Approved objective and plan

The owner approves a distraction-free Mushaf listening mode and repair of missing mobile playback access. Inspect the current shared controller, standalone/immersive Mushaf controls and QuranListeningReader; reuse their recording identities, exact cues, font loading and following behavior. Keep the previous release's ongoing CI/deployment separate.

1. Pass the available surah audio control into the mobile Mushaf menu and provide a discoverable Listen action on supported pages. Extend standalone access to existing approved Al-Baqarah, Al-Kahf, As-Sajdah and Al-Mulk recordings using the single audio session; explain unavailable recordings without changing content or audio sources.
2. Add an explicit listening focus mode that presents the complete Mushaf page without transport chrome or decorative background. Retain highlighting and following. Expose an accessible reveal/exit control, keyboard Escape and modal focus recovery; manual scrolling pauses following and an explicit action resumes it.
3. Preserve playback position, queue, reciter, reading progress, saved data and offline text. Do not infer seek timestamps or add recordings/translations/dependencies.
4. Add targeted unit/browser coverage for mobile start/pause/resume, supported/unsupported pages, current cue/following, full-screen safe areas, focus recovery, reduced motion and enlarged text. Run required quality/full browser gates, update architecture/design/release notes, and verify CI and production.

## Existing contracts and limits

This supersedes phase 83's standalone Al-Baqarah-only control restriction for the four existing approved long-surah recordings. It does not promise narration for all 114 surahs. Existing owner-accepted generated timing previews retain uncertainty gaps and later human review. The owner's primary workspace remains local and untouched.
