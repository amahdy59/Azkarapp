# Phase Report — Balanced Mushaf reader

## Objective

Apply the owner-approved images and corrections: centered bounded reading, target-colored transient status, original Mushaf capsule controls and functioning menus, compact two-column index.

## Scope completed

Both reader owners now compose MushafThemeNotice through shared page chrome. The existing timer and gesture/state logic remain. Normal compact reading reuses the title slot; rail and Focus provide a transient reading inset so feedback does not cover scripture. Explicit paper/ink tokens protect the applied Mushaf color from Glass overrides. A keyboard-focused original title action stays visible. The shared viewer retains mobile fill, canonical fifteen slots, 32rem readable floor, magnification scrolling, facing pages, bilingual content and original rail. Desktop canvas size is bounded by available height/width and 36rem/54rem maximums, with balanced margins. The index is centered and height-bounded, has grouped tabs, separate search and two compact surah columns; at enlarged/narrow measures it recovers to one column. Existing select/search/bookmark/jump/juz/quarter/Back/Escape semantics remain.

## Files changed

MushafThemeNotice and its test; MushafPageViewer, MushafImmersiveReader, KhatmahReaderScreen, MushafQuickMenu, MushafNavigationModal and its CSS; theme wordPopover/material/token CSS; affected browser specs and feature selector; design/architecture/quality/phase/index/decision documentation; current bilingual release notes and lossless archive.

## Components added or modified

New pure transient MushafThemeNotice; shared viewer geometry/status placement; existing NavigationModal presentation; QuickMenu close-boundary Focus handoff. No runtime dependency or persisted-state schema change.

## User-visible changes

Original capsule buttons and desktop rail remain distinct. Applied colors remain visible in Glass. Notifications match the newly applied paper/ink and do not cover verses. Desktop text no longer grows without a bound. Index uses two columns and less screen height; enlarged labels remain readable.

## Accessibility work

Retain native actions/44px targets, menu containment/recovery, semantic RTL/LTR order, live status with no new focusable action, high-contrast/Forced Colors and texture preferences. The real WebKit Focus race is resolved at the existing menu close-focus boundary, rather than an arbitrary delay. Tests retain full word/content and canonical-slot assertions. Automated checks do not establish physical Android or AT acceptance.

## Tests added or updated

New real browser test covers both reader owners, 320px/200%, phone Focus and wide/spread, full theme cycling and matching status paint outside scripture, original target geometry, bounded center/measure, index column order/density/search/focus recovery and axe. Unit tests cover all four notice themes and non-interactive status semantics. Existing material tests reflect explicit applied Mushaf paper and grouped index; OS reduced transparency retains its existing texture-only fallback. No assertion/timeout/coverage/budget is removed or relaxed.

## Commands run

| Command/stage                               | Result/evidence                                                                                                                                    |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Targeted units (7 files)                    | 145 passed in 20.01s; output/balanced-settled-units.log                                                                                            |
| Initial corrected Chromium page/zoom checks | 14 passed in 1.4m; output/balanced-mushaf-corrected.log                                                                                            |
| Final three-engine control matrix           | 39 passed in 4.0m; output/balanced-final-controls.log                                                                                              |
| Broader Chromium integration                | 46 passed in 2.1m; output/balanced-final-integration.log                                                                                           |
| TypeScript                                  | Passed; output/balanced-mushaf-typecheck.log                                                                                                       |
| Complete quality and release gates          | Exact results retained in output/balanced-release-* and tracked hooks; publication requires successful exact-commit CI/Pages and production smoke. |

## Visual/manual evidence

Actual captures inspected from output/playwright/balanced-final-controls and copied unchanged with source/hash provenance to output/balanced-mushaf-evidence. Phone index, Light/Charcoal/Midnight notices, Focus and desktop spread are separate states. Any screenshot during the exiting drawer can show its dimming transition; it is not a separate reading theme. Earlier diagnostics remain separate: Glass token interference/canvas collapse corrected, late spread-read fixture settled, and WebKit Focus restoration corrected at the menu boundary. Generated images are never used as Qur’anic content.

## Documentation updated

Design system explicitly preserves Mushaf capsule exceptions and supersedes unrestricted desktop measure and Glass-owned page/HUD colors; architecture/quality/decision/index/active phase reflect the approved checkpoint. Release 2026-11-04.8 describes only this change with three entries in each language; prior committed archive entries retained.

## Decisions recorded

Owner approved applying all recommendations after mockup review, specifically retaining old button geometry/menu behavior and correcting the pill to transient feedback. Existing repository release authority remains in effect; preserve intact hooks and exact-commit CI.

## Known limitations or remaining risks

Physical device safe areas, Android WebView font painting, native gestures and TalkBack/VoiceOver remain separate owner/device acceptance. Desktop screenshot scale is not a guarantee about every display/zoom. Full release results are only established by their actual final logs and production metadata.

## Out-of-scope findings

No reviewed religious wording/font data, timing annotations, storage/sync contracts, dependency/native-host or prayer behavior changes.

## Recommended next step

Complete exact-commit release and review the deployed reader on the owner's phone/desktop with the screenshot checklist.

## Exact-commit CI enlarged-index correction

Candidate 355e56d5 passed local quality/hook and most completed browser shards, but CI retained an existing Android-reliability assertion requiring a 200px results viewport at 320px/200% text. Arabic header/tab wrapping left 163px. Keep that assertion intact and allow font-relative dialog expansion (within safe-area/viewport limits) for enlarged text. Normal-size two-column geometry is unchanged. Verify the existing quarter/page reveal and selection/recovery cases across all engines, then run intact release gates again. This is a functional large-text correction, not a reason to weaken the regression.
