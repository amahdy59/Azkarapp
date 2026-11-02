# Phase Report — Smooth navigation, compact panels and owner design brief

## Objective

Repair the owner's confirmed Library/tab/Progress/Quran overview defects and consolidate every live-review comment into a consistent visual/motion plan. Preserve the pending audio/shared-card work, offline reading, source content and local publication hold.

## Scope completed

One Library section arrival, retained successful deferred imports, Month entry defaults, compact metric spacing, stable full-card hover/hit geometry, coherent calendar/routine panels and Quran overview headers/cards. Restore the original full-width Search above filters. Remove repeated tracking/faith prose and unnecessary primary/wide title Back actions. Preserve explicit date routes, real loading/retry, reader recovery, calculation definitions and user data. Add the owner comment register, six saved visual references, concrete motion state matrix and prioritized Mushaf proposals. Repair the later reported Quran week-label truncation within the same overview scope.

## Files changed

RetryableScreen/ScreenFallback/Tabs and tests; Library screen/styles/tests; App.composition keyboard-route fixture; useAppRouting/useControlFeedback and tests; Progress screen/styles/metric/dashboard/heatmap/routines; shared CategoryCard/SettingsRow/LayoutShells/surface/motion recipes, new card-action.css/surface-panel.css/layout-shells.css and existing pill-controls.css; QuranWirdScreen/styles; PrayerProgressSummary/PrayerTrackerStats/TodaysPathSheet and tests; bilingual screen copy; navigation-motion/progress-compact-panels browser specs plus relevant existing navigation/heatmap/plan/path fixtures; feature-test selection and its tests; README, architecture/design/motion/quality guidance, active phase/index/decision log, owner brief/reference images and this report. Earlier audio/shared-filter changes remain documented in their own companion reports.

## Components added or modified

No new runtime dependency or second animation system. The measured bundle baseline records the final stylesheet/entry sizes in this change; every ceiling is unchanged. Component/feature-specific recipes load with their owners, preserving the startup stylesheet ceiling and shared behavior. Shared `surface-panel-heading`/`surface-panel-icon` recipes unify panel headers. Existing native actions, control-cue/delegated keyboard cleanup, semantic Tabs, ProgressBar and portalled overlays remain the reusable owners. Successful deferred module code is cached; mounted screen state is not.

## User-visible changes

Already-loaded Quran/Library returns no longer insert a fallback. Collections/Saved uses stationary selected paint and one 220ms panel fade without card restagger. Metrics use less reserved whitespace; hover/focus leaves the inner full-card hit/chevron geometry fixed and cues its badge. Month is the unqualified/primary Progress default; explicit periods remain valid. Wide calendar/routines form a balanced grid with shared header anatomy and natural narrow/enlarged stacking. Quran overview uses compact matching cards, one Continue book icon and no title Back. Its week strip removes fixed label widths/empty icon slots, retains whole weekday labels, uses balanced wide tiles and naturally reflows on narrow/enlarged layouts; today has date semantics and passive day summaries do not hover like buttons. Other ordinary title Back actions hide only when an actual rail/sidebar exists. Search/filter placement is restored. Repeated disclaimer prose is removed while real unknown values and definitions remain.

## Accessibility work

Keep native tab/button/link semantics, RTL/LTR keyboard order, visible full-card focus, immediate actions, actual state/progress and 44px ordinary targets. Both app and OS Reduce Motion remove badge scaling/arrival travel. Keyboard badge presses share existing cancellation without transforming the full-card pseudo-element. Enlarged plan number steppers reflow in DOM order when their available text measure cannot fit buttons and a usable native input. Enlarged Library titles/tabs wrap into separate usable rows; narrow filter label/context use separate lines and avoid repeating the selected section in the filter summary. Automated axe/geometry/keyboard checks complement remaining physical/assistive-technology acceptance; no full conformance claim.

## Tests added or updated

Loaded-return and Month-default regressions failed before their repairs. Units retain rejected-import retry/cancellation, explicit last30 routing, tab semantics, disclaimer absence, data/status semantics and keyboard press cleanup. New browser cases observe transient fallback insertion, motion ownership, stationary geometry, default/app/OS feedback, restored filter order/width, Month URLs, compact metrics, matching panels, responsive title recovery and Quran layout. Existing rolling-range, six-kind plan persistence, keyboard/enlarged form and path assertions remain intact. Weekday line-box/containment assertions cover normal and enlarged phone/tablet/wide layouts. Live resize baselines await loaded fonts and two rendering steps before comparisons, retaining exact no-shift/whole-label assertions. A three-engine run exposed a real 320px/200% plan-number overflow; repair and diagnostic assertions retain the original overflow/target requirements.

## Commands run

| Command / selection                                | Result                                                                  |
| -------------------------------------------------- | ----------------------------------------------------------------------- |
| Initial loaded-return/default unit reproduction    | 2 failed / 6 passed; both confirmed defects repaired                    |
| RetryableScreen/routing/Tabs targeted units        | 19 passed, exit 0                                                       |
| Library/Progress period feature units              | 51 passed, exit 0                                                       |
| Library/dashboard/heatmap/routines layout units    | 29 passed, exit 0                                                       |
| Prayer/path/Quran/layout/deferred summary units    | 44 passed, exit 0                                                       |
| Initial Chromium navigation/card browser selection | 10 passed, exit 0; intermediate evidence before final filter correction |

Final frozen-input quality, Pages build, targeted three-engine browser, core navigation/offline smoke, audit and inventory commands with exact results are recorded in `output/smooth-navigation/PHASE_REPORT.md`. Earlier/superseded runs are preserved separately and do not count as final acceptance. No hook bypass, skipped assertion, lowered coverage or enlarged budget ceiling is used.

## Visual/manual evidence

Six supplied owner screenshots are preserved in `docs/agent/evidence/owner-design-2026-11-02/`; the Settings image is a positive visual anchor and the other images identify defects/corrections. Actual browser screenshots and frame samples are preserved beside the generated final report. Image inspection complements hit geometry, opacity and axe checks. Browser viewport emulation and lab frame samples do not establish real-device smoothness, assistive-technology acceptance or field percentiles.

## Documentation updated

[Owner design brief](../OWNER_DESIGN_BRIEF_2026_11_02.md) maps each comment to a decision/status, links earlier review context and explains the local preview/physical acceptance boundary. Motion guidance specifies hover, press, focus, selection, overlays, save/undo, real loading, charts and Mushaf ownership/timing/cancellation. Design guidance records the positive Settings reference, density, restored filter placement, title-arrow rules and removed prose. Architecture/quality/README/active phase/index/decision log reflect current behavior. Superseded Library stagger/two-line metric reservations are corrected rather than left as conflicting current instructions.

## Decisions recorded

Month supersedes the former rolling default; explicit routes remain authoritative. The owner selects the Settings finish and rejects side-by-side Library Search/filters. Compactness preserves font sizes, targets and natural reflow. Quran overview is a primary destination. Purposeful default animation is expected, with equivalent still alternatives; passive content does not become a button. Further Mushaf work is prioritized recommendation-only. Publication stays on hold.

## Known limitations or remaining risks

Real Android/iOS touch, long-session performance, native text scaling, TalkBack/VoiceOver and background/OS interruption behavior remain separate dated acceptance. A successful loaded module is retained for the application lifetime; current import errors still clear the in-flight request for retry. Hiding ordinary Back depends on actual persistent navigation, preserving compact/immersive recovery. No perfect performance/design or complete app-wide motion-audit claim is made. No new commit, push, exact-commit CI or production release is part of this local continuation.

## Out-of-scope findings

The broader Progress/Mushaf proposals extend existing cache/index/meaning/audio controls rather than duplicating them. No reviewed religious wording, QCF paper geometry, storage/sync schema, prayer behavior, dependency, shell breakpoint or release policy is changed.

## Recommended next step

Review the local Month/Library/Quran views against the preserved Settings reference, complete dated physical-device acceptance, then select the next narrow Mushaf navigation/readiness refinement from the owner brief. Retain the local publication hold until lifted by the owner.
