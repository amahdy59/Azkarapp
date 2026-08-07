# Phase Report — Phase 03: Shared Accessible Components

## Objective

Consolidate repeated UI patterns into reusable components with complete
interaction states, per `docs/agent/phases/PHASE_03_SHARED_COMPONENTS.md`.

## Scope completed

Step 1 analysis (component inventory, duplication survey, extend/refactor/merge/leave-local
classification, API design, migration order, test plan), then Step 3 implementation across
nine reviewable batches. Decisions are DEC-014 through DEC-025 in `docs/agent/DECISION_LOG.md`.

Two findings reshaped the plan versus the original analysis:

1. A prior undocumented commit (`a0b2591`) had already extracted `CategoryCard`,
   `StatCard`, and `SettingsRow` — with **zero tests**. Backfilling those came first.
2. Three of the patterns were not merely duplicated but **non-conformant** with
   `docs/agent/ACCESSIBILITY_REQUIREMENTS.md` §9. Those were treated as defect
   fixes, not consistency work.

## Files changed

New components: `Card.tsx`, `SegmentedControl.tsx`, `Tabs.tsx`, `ResponsiveSheet.tsx`
(exports `Modal` + `ResponsiveSheet`), plus `SettingsSection` in `SettingsPrimitives.tsx`.

Modified across batches: `CategoryCard`, `StatCard`, `SettingsRow`, `StatePanel`,
`InformationCard`, `PwaNotice`, `RoutineGarden`, `ProgressViews`, `QuranWordMeaningSheet`,
`ReaderReferenceSheet`, `AuthenticZikrLibrarySheet`, `CounterTargetPicker`,
`ShareableCardModal`, `ui/button.tsx`, `ui/select.tsx`, `ui/scroll-area.tsx`,
`HomeScreen`, `CategoryScreen`, `AzkarLibraryScreen`, `CustomCounterScreen`,
`SettingsRootPanel`, `NotificationsPanel`, `AccountDataPanel`, `DownloadsPanel`,
`HelpPanel`, `SourcesPanel`, `onboarding/LanguageScreen`, `src/test/setup.ts`,
plus ~16 files touched by the mechanical shadow-token pass.

## User-visible changes

- Cards across the app moved from four different Tailwind shadow weights to one
  `shadow-raised` token; dead `backdrop-blur-xl` removed from 26 opaque surfaces.
- Control focus rings normalised to 3px; scroll regions keep a deliberately
  subtler 1px treatment (two documented roles, see DEC-013).
- Routine-mode toggles, language pickers, and both tab groups gained keyboard
  navigation they did not previously have.
- Desktop word-meaning and reference dialogs are narrower (600px) and now trap focus.
- `Button` typography changed from `font-medium` to `font-semibold` and its sizes
  from fixed heights to minimums.

## Accessibility work

Three standing `ACCESSIBILITY_REQUIREMENTS.md` §9 violations closed:

1. **Mutually exclusive mode choices** (DEC-022) — `HomeScreen` and `CategoryScreen`
   routine toggles used `role="group"` + `aria-pressed`; now real radio groups with
   roving tabindex.
2. **Tabs** (DEC-023) — neither tablist had `aria-controls`, roving tabindex, or
   keyboard navigation, and `RoutineGarden`'s had **no `role="tabpanel"` at all** —
   its four views rendered as bare siblings, so the tabs pointed at nothing.
3. **Dialog focus containment** (DEC-025) — six hand-rolled `role="dialog"` overlays
   had no focus trap, no focus restore, and three had no Escape handling.

Also: fixed a fixed-height `Button` that would clip wrapped Arabic labels and 200%
text scaling (DEC-024), and restored colorblind-mode coverage on controls whose
focus rings had bypassed the `--ring` token.

## Tests added or updated

New: `Card.test.tsx`, `CategoryCard.test.tsx`, `StatCard.test.tsx`,
`SettingsRow.test.tsx`, `SettingsSection.test.tsx`, `InformationCard.test.tsx`,
`SegmentedControl.test.tsx` (6), `Tabs.test.tsx` (9), plus real-browser keyboard
and focus-trap tests in `e2e/settings-experience.spec.ts` and
`e2e/reader-microinteractions.spec.ts`.

Unit tests went from 196 to 237; e2e from 142 to 148.

Two existing tests were changed, both deliberately:

- `e2e/audio.spec.ts` queried the routine-mode toggle by `role="button"`, which
  correctly stops matching once it is `role="radio"`. Selector updated; accessible
  name unchanged.
- `ZikrShareButton.test.tsx` asserted the literal class `min-h-11`. Rather than
  substituting the new literal, it was rewritten to assert the actual contract —
  a `min-h-*` of at least 44px **and** no fixed `h-*` that could clip. Stronger
  than the assertion it replaced.

Also fixed a real gap in the test infrastructure: `src/test/setup.ts` never
registered `afterEach(cleanup)`, so DOM from earlier tests leaked into later ones
in the same file.

## Commands run

| Command                         | Result                                              |
| ------------------------------- | --------------------------------------------------- |
| `pnpm run check` (per batch)    | Pass — 237 unit tests, build, bundle budget         |
| `pnpm run test:e2e` (per batch) | Pass — 148 tests across the browser/viewport matrix |

## Visual/manual evidence

**Not captured.** Before/after screenshots across Light/Dark/Midnight are still
owed for this phase and for Phase 02 — see Known limitations.

## Documentation updated

`docs/DESIGN_SYSTEM.md` (elevation tokens, `bg-card` opacity contract, status-token
foregrounds, the two focus-ring roles), `docs/agent/DECISION_LOG.md` (DEC-014–DEC-025,
plus DEC-013 moved Proposed → Approved).

## Decisions recorded

DEC-014 (interim focus-ring contract), DEC-015 (Card as DEC-008 vehicle), DEC-016
(progress-bar correction), DEC-017 (delete dead `PalmTreeReward`), DEC-018
(`StatePanel` empty-saved), DEC-019 (`SettingsSection`), DEC-020 (`InformationCard`
action slot), DEC-021 (shadow-token rollout), DEC-022 (`SegmentedControl`), DEC-023
(`TabList`), DEC-024 (`Button` alignment + adoption), DEC-025 (`Modal`/`ResponsiveSheet`).
DEC-013 resolved and implemented.

## Known limitations or remaining risks

- **Before/after screenshots are now captured** in `docs/agent/evidence/screenshots/` — `before/` is the pre-Phase-02 commit `5290eeb`, `after/` is current `main`, both produced by the same `e2e/evidence-capture.spec.ts`.
  significant changes — `bg-card` losing backdrop blur, the app-wide shadow-token
  swap, `Button` typography — are unverified against the design intent. This is the
  largest outstanding gap and blocks a clean Definition-of-Done sign-off.
- **Light-theme `--success`/`--warning`/`--info` values remain hand-computed**, not
  verified with a contrast tool (carried from DEC-006).
- **Selection does not follow focus on arrow keys** in Radix 1.2.3 radio groups
  (DEC-022). Verified by probe to affect the pre-existing `ThemeModeSelector`
  identically, so it is upstream behaviour, not a regression — but it is a real gap
  against the APG pattern and needs its own decision (Radix upgrade or local shim).
- `ProgressViews.tsx` (905 lines) and `RoutineGarden.tsx` (781 lines) were **not**
  split — extraction only, per the Phase 00 carry-forward. File splitting remains
  Phase 08 scope.
- `git stash` is unreliable in this OneDrive-synced working tree (file-lock errors
  can leave a half-applied stash). Recovery is possible via `stash@{0}^3` for
  untracked files, but prefer branches over stashes here.

## Out-of-scope findings

- `AccountDataPanel`'s local `DataAction` has a latent bug: in `destructive` mode it
  silently ignores the passed `icon` prop in favour of a hardcoded `LogOut`. Left
  unmerged and unfixed to keep this phase's diff honest — worth a separate fix.
- `src/styles/globals.css` is an empty file imported by nothing meaningful.
- `ui/dropdown-menu.tsx` is defined with zero consumers — not a gap, just noted so it
  is not mistaken for an unfinished migration.

## Recommended next step

Capture the outstanding before/after screenshots for Phases 02–03, then proceed to
**Phase 04 — Shell and Navigation**, per the roadmap's numerical order.
