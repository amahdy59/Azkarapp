# Phase Report — Compact practice and listening focus

## Objective

Implement the owner's second screenshot batch locally, preserving offline reading, playback and recorded-data rules. This continues the approved final-touch phase. Publication remains on hold.

## Scope completed

P1–P7: compact Azkar title/filter action, shared Library/Progress view controls, expanded-listening focus for Quran/zikr, removed empty-period banner, denser mobile metrics, structured Today's path and continuously visible navigation activation. P8 remains a proposal: keep full Progress reachable from Today's path; consider Qibla for the bottom slot after review. Masbaha is unchanged pending explicit owner confirmation; recommend a Home quick action plus More access.

## Files changed

- Library screen/stylesheet, ResponsiveFilters and shared pill-controls.css.
- ProgressScreen, ProgressDashboard and progress-screen.css.
- FloatingAudioPlayer, AudioPlayerSurface and floating-audio-player.css.
- TodaysPathSheet and shared theme/motion.css.
- Affected Library/Progress/audio unit tests; compact-practice browser regression, updated progress-dashboard/page-layout-consistency specs and feature selection map.
- Design system, architecture, quality checklist, active phase and consolidated requirements ledger.

## Components added or modified

Reuse shared TabList and the existing filter sheet. Extend the existing listening surface with ephemeral focus behavior. No new runtime dependency, content, database, storage or synchronization owner.

## User-visible changes

Phone filters occupy the header beside All/Saved, outside their tablist. Progress views use matching pills in the header, with readable labeled tablet controls. Compact metric cards preserve factual counts/denominators and labels without an extra empty-state card. Today's path uses relevant practice icons and a clear progress action. Listening Focus fills the viewport and hides transport/options while preserving playback and text. Navigation icons pulse without fading out.

## Accessibility work

44px minimum controls, native tabs/dialog/definition-list semantics, labeled icon controls, RTL-aware arrows, text reflow, stable hit areas, safe areas, temporary inert/aria-hidden shell coverage, focus recovery, Tab containment and Escape exit. Existing Reduce Motion and protected opaque overlays remain. Automated checks do not establish full WCAG compliance or human AT acceptance.

## Tests added or updated

Unit regression proves focus does not stop/pause audio, preserves the mounted text, restores inert attributes and returns focus. Existing empty-state tests now assert banner absence plus truthful known/unknown metrics and goals. Browser regressions cover four RTL/LTR phone/tablet/desktop and enlarged/material profiles, Quran/zikr focus, hit/viewport geometry, no playback pause, axe, filter persistence, Today’s path navigation and sampled icon animation opacity. Existing calendar/grid assertions remain with the new header layout.

## Commands run

Exact command results, counts, diagnostic attempts and final-input evidence are recorded in `output/compact-practice/PHASE_REPORT.md` with raw logs/JSON. The checkpoint protocol runs targeted units, affected browser specs on Chromium/Firefox/WebKit, core smoke, full `pnpm check`, Pages build and inventory. No assertion, coverage threshold or bundle ceiling is relaxed.

## Visual/manual evidence

Browser PNGs are retained under `output/compact-practice/`. Normal phone, narrow enlarged, tablet/desktop, focus and Today's path evidence is inspected. Owner aesthetic approval and real-device acceptance remain separate.

## Documentation updated

Design system, architecture, quality checklist, active phase and P1–P8 requirement ledger.

## Decisions recorded

Keep navigation placement unchanged in this checkpoint. Fixing Masbaha icon feedback does not relocate it. Do not commit, push or deploy.

## Known limitations or remaining risks

Native Android/iOS full-screen behavior, interruption/background audio and TalkBack/VoiceOver require physical-device acceptance. This is application viewport focus, not an OS/browser Fullscreen API request. The production bundle retains the existing ceiling and little headroom. Prior local drafts remain in the working tree.

## Out-of-scope findings

No remote deployment, reviewed religious text, migration or Masbaha navigation replacement.

## Recommended next step

Owner review of the local compact practice/focus screenshots, then decide Qibla's bottom-navigation slot and Masbaha's proposed Home shortcut before moving either.
