# Phase Report — Shared interaction and Home motion review

## Objective

Review app-wide microinteraction coverage and Home motion, retaining consistent feedback by control type, accessibility and performance.

## Scope completed

Inspected the shared recipes and their production call sites rather than adding independent animation to every button. The review covers native buttons/links/disclosures, icon actions, tabs/radios, switches, sliders, overlays, counters, reading exceptions and asynchronous actions. Existing behavior remains the baseline; physical-device and assistive-technology acceptance remain separate.

## Files changed

src/app/components/ui/button.tsx, src/app/components/ResponsiveSheet.tsx, e2e/compact-icon-feedback.spec.ts, docs/MOTION_SYSTEM.md, agent INDEX/DECISION_LOG, the interaction phase brief and this report. Reliability/first-use/filter/card changes have their own phase report.

## Components added or modified

Icon-sized Button and shared SheetHeader/Modal/Drawer Close actions now use ui-icon-button, matching Header and Home icon actions. Independent active:scale-95 utilities were removed from Close actions. No new component, listener, timer, dependency or animation framework was added.

## User-visible changes

Compact icon actions share the established 0.92 press and finite release. Text actions keep ordinary feedback. Focus, selected states, real loading/disabled behavior and both Reduce Motion preferences remain functional. Reading text and no-press exceptions remain still.

## Accessibility work

Pointer and keyboard activation/cancellation, visible focus, 44px/48px targets, Escape/focus recovery, disabled exclusions and both app/OS motion alternatives are covered. Reduced motion retains immediate state and still opacity feedback. No animation is required to understand a selection or complete an action.

## Tests added or updated

New compact-icon-feedback tests exercise real pointer press, keyboard press, cancellation, Close, restored Home opener focus and both still alternatives in Arabic/English across engines. Existing Home prayer tests sample start/middle/end geometry, reverse and cancel transitions, check enlarged layouts and retained sticky material. Home-time-actions tests cover finite refresh, repeated activation, sharing focus recovery, cue direction and theme fallbacks. Motion-control-polish covers native slider immediacy and keyboard/pointer handoff.

## Commands run

| Command                                                                                                                             | Result                                                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pnpm test:e2e compact-icon-feedback/motion-control-polish/home-prayer-motion/home-time-actions, Chromium/Firefox/WebKit, one worker | 65 passed; one Firefox English case stalled while loading its reminder fixture. All new compact feedback cases and prayer transition cases passed.             |
| Targeted fresh Firefox reproduction                                                                                                 | 1 passed in 9.7 seconds; output/interaction-firefox-proof.log. An initial Windows process-start exit occurred before tests and was not counted as a test pass. |
| Targeted Prettier and git diff --check                                                                                              | Passed.                                                                                                                                                        |

Final exact-tree local gates and exact-commit CI results belong to output/release-first-use-final.log and the production execution record. These remain mandatory before claiming release completion.

## Visual/manual evidence

The targeted browser outputs contain Home transition snapshots at expanded/middle/compact states, keyboard cue/still captures, action feedback and native slider evidence. Source review confirms shared ownership; automated geometry/animation assertions complement screenshots and axe rather than establishing universal frame-rate or assistive-technology compliance.

## Documentation updated

MOTION_SYSTEM records shared compact-icon ownership; phase/decision/index documents record the owner's continuation and evidence requirements.

## Decisions recorded

Use feedback appropriate to action type, with immediate native input values and finite purposeful motion. Retain calm alternatives, stable devotional geometry and existing bundle ceilings. Avoid duplicate clocks and per-control handlers.

## Known limitations or remaining risks

This is a source/shared-component and core-flow review, not a claim that every possible state on every physical device was manually exercised. Physical touch/haptics, TalkBack/VoiceOver and performance on low-end hardware remain device acceptance work. Local resource contention can stall browser setup; complete exact-commit CI remains required.

## Out-of-scope findings

No motion-system replacement or new runtime dependency is necessary. Existing Home motion owners, hidden-work pausing, cancellation and disabled/read-only behavior were retained.

## Recommended next step

Complete the unchanged release gates and production smoke, then use the retained device checklist for physical acceptance.
