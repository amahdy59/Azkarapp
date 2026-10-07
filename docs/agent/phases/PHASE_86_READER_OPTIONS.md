# Phase 86 — Reader options

## Objective and plan

Apply the owner's approved menu simplification. Inspect existing Reader actions and responsive surfaces; reuse the compact bottom sheet, native disclosure and segmented-control patterns; preserve unique actions; add Arabic/English responsive, accessibility and focus regressions; verify and release through the existing gates.

## Scope completed

Compact viewports below 600px use the shared bottom sheet. Focus mode, text size, saved state and a labelled complete/core Azkar-list selector remain directly available. Listening, collection actions and counter settings use collapsible sections. Medium and wide viewports retain the Radix dropdown, with labelled secondary groups. Listening and sharing distinguish the current zikr from the collection. Counter-sound changes keep the compact sheet open.

## Files and components

Modified ReaderScreen and Arabic/English UI translations. Added ReaderOptions presentation adapters and tests; reused ResponsiveSheet, SheetHeader, SegmentedControl and the existing dropdown primitives. Updated browser action helpers and affected Reader, audio, sharing, navigation and accessibility tests. No content, persistence schema, prayer logic, dependencies or offline boundaries changed.

## Accessibility

Phone actions are native buttons inside the existing modal dialog; secondary sections use native details/summary. Radio groups show their selected state and retain keyboard navigation. Controls retain 44px targets, theme tokens and visible focus. Automated scans and Escape/focus-return checks cover Arabic and English compact sheets. Physical-device screen-reader and system-text checks remain manual.

The stricter keyboard matrix caught the drawer library's default-disabled autofocus and Safari's lack of pointer-focus on native buttons. Reader options opt into compact autofocus through the shared sheet and explicitly focus their trigger before opening. Existing sheet callers retain their previous defaults. Tab containment and return-to-trigger assertions remain intact.

## Verification and evidence

The new component suite passed two tests. The collection-panel suite passed both languages, including opening its drawer from the compact sheet and restoring the options trigger. The compact-options and listening-layout browser run passed twelve tests with exit 0 in 3.7 minutes. Screenshots are produced in `output/playwright/reader-options` and the Arabic 390px expanded sheet was visually inspected.

The subsequent complete non-browser gate passed in 234.2 seconds, including 1,493 unit tests, coverage, format, lint, type safety, content and bundle gates. A broader feature run passed 80 tests and failed one long-surah-sharing test because its helper matched both the sidebar share button and the intended menu action. The helper now scopes native actions to the options sheet and retains the precise Radix menu action. The failed test is rerun separately; final exact-snapshot gates and three-engine sheet verification are recorded with the release result.

The initial complete non-browser gate found two stale accessible-name expectations in ReaderScreen.audio.test.tsx; those expectations now match the approved scoped labels. Initial browser helper failures came from searching collapsed buttons without including hidden elements; the helper now expands the containing disclosure before invoking the action. No assertions, thresholds or retry settings were weakened. Final targeted, complete quality, pre-push and CI results are reported with the release.

Final sheet verification passed six tests across Chromium, Firefox and WebKit with exit 0 in 3.7 minutes, including 44px text-size targets, Tab containment, Escape and trigger restoration. Nested collection-drawer and long-surah-sharing checks passed five tests with exit 0 in 3.5 minutes. Both collapsed and expanded Arabic/English 390px screenshots were inspected. An intermediate gate also found a Home composition timeout during concurrent checks; that suite passed all five tests in isolation. The final complete gate runs without a concurrent browser suite, preserving the existing assertions and timeouts.

## Release verification

The pre-push gate for the feature commit passed frozen installation, the complete non-browser check (1,493 unit tests), 26 core browser smoke tests and the Pages build. The Pages CSS budget initially exceeded its unchanged ceiling by two bytes; reusing the existing `ring-border/80` utility corrected the increase without changing the budget or unrelated scene styling.

Quality CI for commit `863c50c2` passed 695 browser tests but failed six Arabic/English header checks across Chromium, Firefox and WebKit. Those checks still expected a dropdown at compact widths. The regression now expects the approved sheet below 600px and the dropdown above it, retaining geometry, target size, keyboard, focus-return, overflow and accessibility assertions. The corrected six-test matrix passed locally in 59 seconds. The complete local `pnpm test:e2e` run then passed 702 tests with one skipped, zero failures and exit 0 in 1.1 hours.

## Documentation and decision

Updated DESIGN_SYSTEM.md, DECISION_LOG.md, agent INDEX.md and release notes for this release only.

## Recommended next step

Try the compact sheet on the owner's phone, including collection sharing, enlarged text and counter sound. Adjust grouping only after this direct usability feedback.
