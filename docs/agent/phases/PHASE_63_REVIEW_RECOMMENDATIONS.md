# Phase 63 — Evidence-led review recommendations

## Objective

Implement the review recommendations that close demonstrated user or maintenance gaps, preserve already-correct platform behavior, and expand the in-prayer reference through the repository content-review boundary.

## Plan and scope

1. Stabilize the existing settings/navigation working tree.
2. Add validated local backup restore beside the existing export.
3. Centralize supported audio preferences in Settings.
4. Extract application-level modal orchestration from `App.tsx`.
5. Improve storage transparency and compassionate progress wording.
6. Expand and verify the in-prayer collection with direct sources.
7. Run the complete local release gates and production verification.

## Scope completed

- Added versioned JSON export and safe restore with legacy-export compatibility, normalization, validation, confirmation, and save-failure handling.
- Added Audio & Recitations settings for reviewed voice, playback speed, and navigation playback; download management no longer duplicates voice selection.
- Added the missing runtime behavior for the existing “continue on navigation” audio preference.
- Extracted share/review overlays and confirmation dialogs to `AppModalHost`.
- Added an explicitly approximate downloaded-Mushaf storage figure beside audio and origin storage diagnostics.
- Changed the historical routine legend from “Missed” to “Not recorded.”
- Expanded In-Prayer Supplications from 8 to 17 sourced entries, including reviewed alternatives for opening, bowing/prostration, rising praise, prostration, between-prostration sitting, pre-salam supplication, and Witr Qunut.

## Deliberately not implemented

- No list virtualization: the largest current collection has 25 items, and no measured scroll or memory bottleneck justifies a dependency or focus-management complexity.
- No global TimeContext rewrite: Home, Progress, Quran overview, and the reader already use the shared minute-aligned, visibility-resynchronizing `useNow` clock. Event-time writes correctly sample the event time directly.
- No new wake-lock or MediaSession layer: both already exist, including seek, track, metadata, playback-state, position-state, and lifecycle handling.
- No selective Surah deletion: optional Mushaf storage is page/font based, and a Surah-level control could remove shared page/font resources inaccurately. Whole-pack removal remains truthful and recoverable.
- No cellular-network toggle: browser connection classification is not consistently available; large downloads remain explicit user actions with size/quota guidance.

## Content safeguards

- Existing reviewed entries were not rewritten.
- New variants are labelled as alternatives rather than a combined required checklist.
- Bukhari and Muslim reports are preferred where available; Abu Dawud entries carry the named al-Albani grade.
- Night-prayer and Witr wording is labelled with its specific context.
- Post-prayer adhkar remain a separate collection.

## Tests and verification

- Added backup round-trip, legacy import, unsupported-file, file-selection, and audio-preference persistence tests.
- Updated in-prayer stable-ID, count, source, and timing invariants.
- Targeted TypeScript and unit suites passed during implementation.
- Full gate results and production evidence are recorded below after release verification.

## Known limitations or remaining risks

- Browser origin-storage estimates are advisory and the Mushaf figure is explicitly approximate.
- Physical background-audio controls, wake lock, and file restore still benefit from final-device smoke tests because browser support differs.
- Content source links support review but do not replace independent scholarly review for future wording changes.

## Recommended next step

Run the full release gate, inspect the responsive Settings and in-prayer Reader surfaces, then deploy and smoke-test backup restore using a non-production test profile.
