# Phase Report — Expanded player refinement

## Objective

Apply the owner's expanded audio review locally, prioritizing a clear header/reading/controller hierarchy, mobile and desktop containment, native accessibility and reliable devotional reading. The owner's follow-ups supersede transport-adjacent and stacked options placement: remove the duplicated recording-position label, place Audio options and page navigation side by side, and remove Info.

## Scope completed

Move full-surah page controls into the fixed header via a presentation portal, remove redundant reciter identity, center labelled Audio options in the header, consolidate repetition editing, declutter the centered transport dock, retain repetition/mode context, reserve loading space and reading clearance, retain a minimum reading region on enlarged/short surfaces, enlarge targets and distinguish page/recording navigation. Existing translation/Mushaf changes are preserved.

## Files changed

- `src/app/components/FloatingAudioPlayer.tsx`, its unit suite and `floating-audio-player.css`.
- `src/app/components/QuranListeningReader.tsx` and its unit suite.
- `src/app/i18n/ar.ts` and `en.ts` (localized page, recovery and time labels).
- `e2e/audio-expanded-layout.spec.ts`, `e2e/quran-listening.spec.ts` and `e2e/audio.spec.ts`.
- Application/audio architecture, design system, decision log, agent index and this report.

## Components added or modified

FloatingAudioPlayer and QuranListeningReader reuse the existing player surface, native ranges, controller, icons and Radix popover. No runtime dependencies or persisted schema changes.

## User-visible changes

Page navigation stays above the verses. The selected reciter stays in Audio options rather than a duplicated header. Standalone non-Mushaf listening retains a metadata title; Reader playback does not repeat its session title. The owner's screenshot follow-up places labelled Audio options centrally between Stop and Minimize above the text, with full-surah navigation beside it in one centered group. The latest correction removes Info and moves following/word settings into Audio options. Narrow screens give the group a full-width row below the corner controls; enlarged labels can wrap. The duplicate recording-position label is removed; repetition/mode context remains visible; repetition editing is consolidated in options. Ten-second icons include localized numbers; time values are clearer and direction-isolated. Arabic manual browsing has a return-to-current-verse action; English keeps its existing translation recovery.

## Accessibility work

Page arrows and options-header close targets use at least 44px. Navigation names distinguish pages from recordings. Stationary full-surah playback cues are revealed again when text/page geometry resizes while following. Before the first cue, the printed opening is kept reachable; when its heading and first line cannot fit together, the first verse is revealed without changing page or content. manual browsing is preserved. Existing native seeking and Arabic media direction, keyboard reading, Escape/focus recovery, reduced motion, offline fallback, reviewed text and cue geometry are preserved. Enlarged page labels can use a separate header row.

## Tests added or updated

Unit regressions cover header-host rendering and cleanup, page browsing, Arabic following/focus recovery, selected reciter placement, visible progress and consolidated repetition. Browser assertions check header containment/targets and centered header options above independently centered transport, retaining existing accessibility, waveform contrast, native scroll, keyboard, recovery and text-geometry checks.

## Commands run

- Targeted component suites: `pnpm test:run src/app/components/FloatingAudioPlayer.test.tsx src/app/components/QuranListeningReader.test.tsx src/app/components/QuranListeningTranslation.test.tsx` — **52 passed across 3 files** after the final geometry change.
- `pnpm typecheck` — passed. Targeted ESLint on the changed player, reader and browser tests — passed; an effect dependency omission during development was corrected.
- Targeted Prettier checks — passed before the final documentation update; shared decision-log changes were formatted again. `git diff --check` for this phase — passed.
- Production Vite builds using `pnpm build --outDir output/expanded-player-review-preview` — passed, including PWA generation (final build 30.38s). Separate immutable preview directories avoided concurrent browser runs overwriting assets.
- `pnpm test:e2e e2e/audio-expanded-layout.spec.ts --project=desktop-chromium --project=desktop-firefox-smoke --workers=1` — **13 passed**: narrow/phone/tablet/desktop, shell boundaries, enlarged text and landscape.
- Combined Chromium player/listening run — **31 passed, 2 failed**. Both failures exposed initial text visibility at 200% in the new full-surah checks; subsequent geometry recovery refinements address those cases. All 11 existing audio behavior cases passed.
- Full-surah Chromium/Firefox run before the final opening-position correction — **21 passed, 3 failed**. All 16 existing full-surah cases passed (page/cue state, following, offline recovery, typography and reading-state preservation); the three failures were the newly added enlarged initial-visibility cases.
- Header regression run before the final screenshot-driven sizing correction: `pnpm test:e2e e2e/quran-listening.spec.ts --grep "fixed listening header" --project=desktop-chromium --project=desktop-firefox-smoke --workers=2` — **8 passed in 41.8s**, including 320px English at 200%, Arabic at 200%, narrow Arabic and landscape in both engines.
- `pnpm check:serial` — **failed after 806.7s**: unit tests **1689 passed / 4 failed** across **235 passing / 4 failing files**, plus lint and format failures. Observed unit failures include concurrent QuranVerseText, useListeningMushafPage and quranGlyphs work. Lint failed on a temporary `e2e/qcf-diagnostic.spec.ts` explicit-any violation; formatting failed on that file and the paired-page phase report. This phase does not edit those files. Toolchain, production build, typecheck, audio manifest, Quran/listening/owner timing checks, type scale, motion rules, bundle budget and CSS utility checks passed. This is not a green combined-release gate or a release receipt.
- Earlier browser runs were canceled when owner placement corrections superseded their builds. Earlier WebKit sweeps encountered timeouts; final WebKit verification is not claimed.

## Visual/manual evidence

Visually inspected phone/enlarged/desktop player captures and the combined full-surah header in Arabic phone and English desktop screenshots. Browser artifacts are in `output/expanded-audio-side-by-side/`, `output/expanded-audio-final-layout/` and the final `output/expanded-audio-settled-focused/` directory. The tests attach reading geometry and capture the settled reading pane, verify 44px header targets, symmetry, full vertical/horizontal header containment before and after options dismissal, no Info action, keyboard opening/Escape focus return and an axe scan of Audio options. Physical-device and human screen-reader checks are not claimed.

## Documentation updated

Architecture describes the presentation portal and existing state ownership. Design system describes fixed-header/reading/dock anatomy and adaptive options. Decision log records the owner's local authority superseding earlier reciter-header/options placement; agent index links this phase.

## Decisions recorded

Local changes and verification only. No commit, push, deployment or release-note change. Preserve pre-existing local translation/Mushaf edits and all religious content, timings, persistence and playback completion rules.

## Known limitations or remaining risks

Physical Android/iOS and assistive-technology validation require human evidence. Existing uncommitted workspace changes participate in broad quality results; their scope is listed separately by Git. The combined gate currently exposes failures in concurrent Quran/font work and a temporary QCF diagnostic lint violation. This phase leaves those files untouched; final header verification is recorded below.

## Out-of-scope findings

Existing translation and Mushaf refinements were already pending when this phase began. They are not rewritten or reverted.

## Recommended next step

Review the local player on physical mobile devices and with assistive technology before requesting a release.

The last 21-case run before max-content correction had **18 passes / 3 failures**, all three fixed and passed in the nine-case run above. Interrupted connection-refused runs followed a stopped preview server and were canceled, then rerun against a verified listening port; they do not demonstrate a product failure.

## Shared-file overlap and handoff

The i18n dictionaries, QuranListeningReader and its tests, application/design/audio docs and decision log also contain other sessions' changes. Preserve them when reviewing or committing. This phase owns only the expanded-player presentation, navigation/preferences portals, local following recovery and its regression assertions. No religious text, annotation, font asset, persistence, release notes, deployment or workflow edit is owned by this phase.

Final screenshot inspection exposed the short/enlarged grid shrinking the header below its wrapped utility content. The first grid track now uses max-content and the full-surah header uses its intrinsic content minimum, so page navigation cannot overflow into the reading pane; the complete player retains native scrolling when needed. Final strengthened verification: `pnpm test:e2e e2e/quran-listening.spec.ts e2e/audio-expanded-layout.spec.ts --grep "fixed listening header|landscape" --project=desktop-chromium --project=desktop-firefox-smoke --workers=2` against `output/expanded-player-settled-preview` — **9 passed in 1.2m**. This includes all 8 full-surah header cases plus ordinary landscape, with full vertical containment and header/reading separation asserted. All previously failing short/enlarged cases pass. Final build/PWA generation passed (21.19s); final changed-source Prettier check passed.
