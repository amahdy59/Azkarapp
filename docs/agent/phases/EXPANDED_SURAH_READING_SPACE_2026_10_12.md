# Phase Report — Expanded surah reading space

## Objective

Apply the owner's screenshot-based expanded-player recommendations locally, giving Quran text the largest practical reading area. No commit, push, deployment or release-note edits.

## Plan and scope completed

Inspect the current header, surface, following and shared Quran rendering. Reuse the existing components, font/page cache and exact cue hooks. Unify expanded-player main-canvas containment and one compact top bar. Replace paginated listening for Al-Kahf, As-Sajdah and Tabarak/Al-Mulk with continuous flowing passages. Remove page arrows and visible “Page” wording elsewhere; preserve a numeric native selector for Al-Baqarah. Make current-verse recovery overlay the reading area rather than move text. Add unit/browser regressions, inspect screenshots and run local quality checks. The owner requested application locally and did not request an approval gate.

## Files changed

- `src/app/components/AudioPlayerSurface.tsx`, `FloatingAudioPlayer.tsx`, `FloatingAudioPlayer.test.tsx` and `floating-audio-player.css`.
- `src/app/components/QuranListeningReader.tsx`, `QuranListeningReader.test.tsx`, new `QuranSurahListeningReader.tsx` and the shared `MushafExcerptCanvas` in `MushafPageViewer.tsx`.
- `e2e/audio-surah-stream.spec.ts`, `e2e/quran-listening.spec.ts` and `e2e/audio-expanded-layout.spec.ts`.
- Architecture, design system, audio architecture, decision log, agent index and this report.

Existing unrelated changes in the shared working tree are preserved. MushafPageViewer already contained opening-page/font changes; this phase changes only excerpt scale and optional playback annotations.

## Components added or modified

QuranSurahListeningReader composes bounded page passages from existing hooks and MushafExcerptCanvas. The shared expanded surface/header covers the session title/progress and restores covered content on collapse. No runtime dependency, stored preference or audio-controller change.

## User-visible changes and recommendations

1. Keep Close and Collapse on the edges with labelled Audio options between them. Add an explicit downward chevron so the disclosure is recognizable. Keep ordinary phone controls on one row; at enlarged text sizes let the centre slot wrap without overlapping the edge controls.
2. Give Al-Kahf, As-Sajdah and Al-Mulk one continuous vertical passage, with no page-control strip. Font size is 125% of the shared flowing Quran size (30px at default medium settings), with app text size and listening magnification retained. Page-specific QCF fonts and original Unicode alternatives remain.
3. Retain only a numeric page selector for Al-Baqarah, preserving navigation without previous/next arrows or a visible “Page” label. Its accessible name still identifies the page.
4. Show Return to current verse only after manual browsing. Keep it as an opaque floating action just above the transport; do not auto-dismiss the user's route back or change reading geometry. Activating it resumes following and returns focus to the keyboard-scrollable reading region.
5. Expand every audio player over the complete main canvas, including the session title and progress. Keep the surrounding app navigation outside this boundary. Preserve Stop/Collapse and transport access.
6. Keep transport permanently available and bounded. Preserve native seeking, explicit voice/speed/repeat controls, exact timing checks and the user's manual browsing. Normal printed Mushaf reading retains its existing canonical pagination and line fitting.

The screenshot suggestions are well aligned with a reading-first player. The deliberate refinement is to keep a persistent recovery action while following is paused, rather than hiding it on a timer and making recovery harder to find.

## Accessibility work

Native keyboard-scrollable reading, native numeric select, descriptive action names, explicit disclosure chevron/expanded state, visible focus, at least 44px targets, scoped error statuses, semantic Quran alternatives and non-color-only active verse/word paint. Covered session content becomes inert and aria-hidden during expansion and is restored on collapse. The player surface sits above the sticky session header but below portalled options. Recovery is outside text flow, returns reading focus and stays available while paused. Existing reduced-motion and RTL transport behavior remain.

## Tests added or updated

Unit tests cover complete mounted passages, omitted pagination, keyboard following recovery, overlay placement and complete fallback/translation. Existing paginated tests now exercise the native selector. Surface tests cover hiding the session header and restoring controls/focus. Browser tests retain transport symmetry, contrast, keyboard, disclosure/Escape, all-theme player scans and responsive checks; continuous tests cover every verse, exclusion of neighboring surahs, following/word toggles without geometry changes, offline reopening, unchanged state/media ownership, header pointer reachability and screenshot evidence. The uncached paginated recovery test selects a distant page so adjacent-page caching cannot invalidate its premise.

## Commands run

| Command                                                                                                                                                       | Exact result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm test:run src/app/components/QuranListeningReader.test.tsx src/app/components/FloatingAudioPlayer.test.tsx src/app/components/MushafPageViewer.test.tsx` | **75 passed across 3 files**, final run 35.34s.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Targeted ESLint on changed components/tests/specs                                                                                                             | Passed after correcting the native-scroll test fixture's tab index.                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Targeted Prettier checks and git diff --check                                                                                                                 | Passed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| pnpm typecheck                                                                                                                                                | Passed after an earlier concurrent ProgressTrendChart edit settled. The full check's typecheck also passed.                                                                                                                                                                                                                                                                                                                                                                                                                  |
| pnpm build --outDir output/surah-owned-preview                                                                                                                | Passed; Vite and PWA output generated. Preview serves successfully at http://127.0.0.1:4199/.                                                                                                                                                                                                                                                                                                                                                                                                                                |
| pnpm check                                                                                                                                                    | **Failed in 376.4s**. Format, typecheck, build, audio manifest, Quran/listening/owner timing validation, type scale, motion and CSS utility stages passed. Unit stage: **1789 passed / 2 failed**, **251 passing / 1 failing files**; both failures are in concurrent RoutineGarden.characterization.test.tsx. Lint found the now-corrected test-fixture tabIndex rule. Initial-route bundle baseline failed at **163295 bytes**, 2.6% above **159119**. No budget or assertion was weakened. This is not a release receipt. |

Initial browser development run: **17 passed / 5 failed**. The three narrow/enlarged failures were the test returning from shell focus to a pointer target obscured by the focused skip link; the test now explicitly restores options focus and uses Enter. Paginated recovery assertions were updated for numeric selection and a genuinely uncached distant page. Screenshot inspection separately found and corrected surface stacking above the sticky header. A subsequent run against the shared generated preview was interrupted when another session rebuilt that directory; use the dedicated immutable preview for final evidence.

The final Chromium/Firefox sweep includes the audio behavior, player containment, expanded layout, paginated following and continuous-surah specs. One English page-recovery test initially selected visible label “10” instead of option value “10”; the native-select test now uses an explicit value, retaining the exact fallback assertion. The repair and WebKit follow-up results are recorded below.

## Visual/manual evidence

Initial screenshots exposed the sticky Reader header painting above the expanded player; the surface stacking order is corrected and pointer-hit assertions were added. Final evidence is generated under `output/surah-owned-evidence/` , `output/surah-recovery-webkit-evidence/` and `output/surah-webkit-settled-evidence/`, including phone, 320px, desktop and 200% text in Arabic/English. Screenshot review confirms the full-height top bar and larger flowing Quran text. Automated browser scans and keyboard checks are not a claim of complete WCAG conformance. Physical device safe-area and human screen-reader validation remain pending.

## Documentation updated

Application architecture, design system and audio architecture describe full main-canvas expansion, the new continuous presentation, font/cue/fallback reuse, numeric navigation and overlay recovery. Decision log records the owner authority superseding the older paginated/second-row containment. Agent index links this phase.

## Decisions recorded

Apply locally only. Preserve all reviewed words, references, translations, repetition counts, recordings, cues, persistence, prayer timing and offline service boundaries. No publication is authorized by this request.

## Known limitations or remaining risks

The shared working tree contains concurrent audio, Quran, after-prayer and Progress work. An early typecheck observed errors in a concurrently edited ProgressTrendChart; a subsequent typecheck passed after that independent edit settled. The full gate currently exposes two unrelated RoutineGarden characterization failures and an initial-route baseline overrun. These remain for coordinated workspace review; no unrelated repair or baseline increase is applied here. The listening/Mushaf modules remain outside the initial static route graph in the dedicated build manifest. Broad gates must be interpreted against their actual input snapshot. Do not include unrelated work as this phase's changes or claim a release receipt. Real TalkBack/VoiceOver and mobile-device checks remain outstanding.

## Out-of-scope findings

No religious-content, storage, synchronization, recording, release-note or deployment change is part of this phase.

## Recommended next step

Review the local continuous player on an actual phone, especially enlarged text and TalkBack/VoiceOver, before requesting a coordinated release.

## Final browser command record

- `E2E_BASE_URL=http://127.0.0.1:4199 pnpm test:e2e e2e/audio-surah-stream.spec.ts e2e/quran-listening.spec.ts e2e/audio-expanded-layout.spec.ts e2e/audio.spec.ts e2e/player-containment-benefits.spec.ts --project=desktop-chromium --project=desktop-firefox-smoke --workers=2 --output=output/surah-owned-evidence` — **53 passed / 2 failed in 8.6m**. Both failures were the English native-select value/label ambiguity described above; all layout, ordinary audio, containment, continuous-surah and Arabic recovery checks passed.
- `E2E_BASE_URL=http://127.0.0.1:4199 pnpm test:e2e e2e/quran-listening.spec.ts e2e/audio-surah-stream.spec.ts e2e/audio-expanded-layout.spec.ts --project=desktop-chromium --project=desktop-firefox-smoke --project=mobile-webkit-smoke --grep 'Mushaf listening ir-baqarah|continuous listening|fixed listening header' --workers=2 --output=output/surah-recovery-webkit-evidence` — **34 passed / 2 failed in 12.7m**. The corrected English numeric recovery passes in Chromium, Firefox and WebKit. WebKit exposed a screenshot-stability timeout after a desktop resize and a compact-player remount race during 200% text setup. The continuous test now waits for the Reader layout before checking player state and captures at CSS-pixel scale; all geometry, content and accessibility assertions remain.

Environment assignments above are shown in shell-neutral notation; PowerShell used `$env:E2E_BASE_URL` and dedicated report paths.

- `E2E_BASE_URL=http://127.0.0.1:4199 pnpm test:e2e e2e/audio-surah-stream.spec.ts --project=mobile-webkit-smoke --grep 'friday-kahf ar|s-hm-110b en' --workers=1 --output=output/surah-webkit-settled-evidence` — **2 passed**, including both previously failing WebKit cases with the final viewport/capture corrections. No timeout increase, skipped assertion or reduced coverage.

All 67 unique browser cases selected across Chromium, Firefox and WebKit have passing evidence after the targeted repairs (55 Chromium/Firefox cases plus 12 WebKit cases). This is scoped feature verification, not a full repository browser run or release approval. Final source lint/format checks, git diff --check and local preview HTTP **200** passed. The preview remains available at http://127.0.0.1:4199/.
