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
