# Visual coherence — owner-approved implementation, 2026-10-13

## Objective and authority

The owner approves the visual/UX review recommendations and additionally requires consistent radio buttons, buttons, dropdowns and related controls. Mushaf is already solid: do not enlarge buttons or change alignment. Preserve reviewed text, canonical page geometry, persistence, offline reading, prayer behavior and the adaptive shell.

## Sequential delivery plan

1. Shared foundations: consolidate ordinary control appearance, radio anatomy, menu option states, page gutters and typographic roles. Preserve native/Radix semantics and Mushaf geometry. Verify targeted unit/browser cases before proceeding.
2. Core composition: refine Home material hierarchy, Library alignment and Settings presentation using accepted foundations. Preserve Library phone peer-tab geometry and sacred content.
3. Task clarity: simplify Qibla repetition, initial Quran plan composition, Reader tool recognition and download explanation. Keep counters/footer anchors fixed and localize copy.
4. Secondary/data flows: refine empty Progress and secondary/source/sharing/audio presentation without altering data meaning. Verify combined RTL/LTR, themes, narrow/large text, keyboard/reduced motion and protected Mushaf geometry; complete authorized release.

Each step is scoped and verified separately. No dependencies, state migration, religious content alteration, router or design-system replacement. Presentation belongs in shared components; avoid global button selectors.

## Coordination

The owner explicitly authorizes messaging “Plan app performance and polish”. This session requests ownership of visual/control/page work; that session owns its performance/reliability work. Release dd448416 completed. Coordinate shared files and publication; do not run simultaneous builds/gates into shared artifacts.

## Acceptance

- Equivalent ordinary controls share surface, border, radius and selected/disabled/focus recipes.
- Radio choices retain group/single-value/arrow semantics and non-color selection indicators.
- Dropdowns retain keyboard recovery, localized names and direction.
- Ordinary title/content edges use existing spacing tokens; approved devotional variants remain.
- Mushaf control dimensions, alignment, typography and canonical lines remain unchanged.
- Home retains one dominant contextual action; Qibla and offline availability stay truthful.
- Preserve independent practice records, unrecorded/upcoming meaning and exact reviewed content.
- Targeted checks, full hook gates, exact-commit CI and production verification remain intact.

## Report

Implementation in progress. Record each step's results/evidence before moving on. Physical device and human assistive-technology validation remain separate.

## Phase 1 — shared controls completed

Added ChoiceRadioItem for theme, text/font, accessibility and weekly-goal choices. Shared menu/select selection paint, neutral hover/focus and theme-paired destructive button ink; native Quran/share radio styling uses shared recipes. Sizes and layout stay caller-owned. No Mushaf file or geometry changed. Settings/segmented unit subset: 17 passed; Quran/share subset: 21 passed; new held-key radio tests: 2 passed. Initial jsdom instantaneous-key tests failed because Radix defers focus until after simulated keyup; held-key simulation retains selection/disabled assertions and passes. Real-browser RTL/segmented/theme/alignment subset: 5 passed in desktop Chromium. Typecheck passed. Continue core page composition next.

## Phase 2 — core composition completed

Home evidence now uses a stable opaque theme surface; daily photo-tile actions use a quiet shared media treatment instead of four action colors. Main routine action remains dominant. Library title/search/list gutters and compact Settings title/search/sections share existing page spacing; the desktop Settings navigation pane retains its 16px inset and form measure. Ordinary settings sections use flat elevation. Header has an opt-in page-gutter role; devotional defaults are unchanged. Updated units: 52 core and 11 settings passed. Browser gutter/tab geometry plus photo-loading: 3 passed.

Additional shared-radio validation exposed a real fast-key selection issue: Radix's deferred focus arrives after keyup and its item overrides bubbling onKeyDown. ChoiceRadioItem now handles arrow/Home/End navigation in capture, immediately focuses/selects the enabled option and prevents the deferred action. Immediate-key unit cases pass (2); unchanged real-browser selection/paint/axe checks pass in Arabic and English across Midnight/Light/Dark (2 browser cases). Earlier held-key results did not establish fast-key correctness; no failing assertion was weakened. Proceed to task clarity.

## Phase 3 — task clarity completed

Qibla shows one bearing, a cardinal direction and a practical clockwise instruction, with location action secondary when a bearing exists. Quran plan choices use shared native-radio surfaces and a two-column phone layout where it fits; only the selected plan's existing inputs are rendered. Desktop continuation is bounded by the form measure, and plan actions reuse Button. Category playback becomes secondary to Start. Downloads retains a visible offline summary/persistence notice and discloses storage/file explanation. Reader secondary tools gain concise visible micro labels inside existing 44px targets; focus shorthand is localized and the normal footer positions remain. No Mushaf files, data/content or audio logic changed. Seven affected unit files: 82 passed. Qibla phone/tablet navigation and sensor-denial browser checks: 3 passed. Combined footer/large-text browser checks follow with Phase 4.

DEC-022 separately records focus-only radio arrows pending a decision. The owner has been asked whether to accept standard arrow-key selection for the new ordinary choice family; publication of that keyboard adjustment awaits the response. Styling and independent phases continue.

## Phase 4 — secondary presentation and release verification

Peer tabs share selected tint/outline; Progress zero-activity charts are compact without changing exact records or upcoming periods. Benefits/Search/More use ordinary page gutters. Sharing promotes Save when native sharing is unavailable. Onboarding language radios share the ordinary choice surface; guest/provider/email/verification/profile actions consume shared button recipes while preserving callbacks and validation. The owner approved immediate arrow-key selection; ChoiceRadioItem and SegmentedControl share radioNavigation, retaining Space, Home/End, disabled skipping and direction. DEC-022 is explicitly superseded for these ordinary controls only.

Seven secondary unit files: 67 passed; choice/segmented subset: 9 passed; new guest/email action tests: 2 passed after correcting the test’s initial outdated accessible-name assumption. Targeted browser suite: 48 passed and 5 footer failures. Labels below icons caused the first four; a nowrap label caused the 200% Arabic overflow. Labels now sit beside centered icons and wrap under enlarged text. All five original failing cases then passed; no assertions changed. Extra Firefox/WebKit and mandatory local/CI/release results are recorded in the final evidence report.

Mushaf comparison against deployed dd448416: all six phone controls and all eight desktop rail buttons had identical x/y/width/height. Initial phone comparison used different languages and was discarded; equal Arabic/Midnight state produced an exact match. Protected Mushaf/Khatmah/QuranChrome/magnification source files have no diff from dd448416. No page, word, line, font or magnification behavior changed.

Final screenshots cover Arabic/Midnight phone and desktop, English/Light phone and English/Dark desktop, plus 320px enlarged Arabic. The development browser encountered transient React deletion errors during hot replacement of edited components; fresh navigation/reload and production-artifact tests are the evidence used for acceptance. These are not presented as a verified production defect or a fixed root cause.

Design contracts and legacy coverage/motion reference descriptions are reconciled to current behavior. Audio’s already-focused expanded layout, reviewed sources, completion/recovery semantics and adaptive shell remain unchanged; shared controls inherit the paint refinements where applicable. Physical phone and human assistive-technology verification remain pending; no claim of visual perfection or complete accessibility certification is made.

Firefox/WebKit ordinary control/three-theme/RTL/gutter checks: 8 passed. Shared radio Home/End, disabled skipping and Enter tests: 2 passed. New authentication presentation tests: 2 passed; callbacks and unavailable-provider guest access remain intact. Release notes are rewritten as four matched Arabic/English entries under stamp 2026-10-13-4 and archived. Release freshness is checked against committed history, so the pre-commit check still reports the previous committed notes; rerun after committing the final manifest. Mandatory quality/fast smoke/Pages build and exact-commit CI/deployment are the remaining release steps.
