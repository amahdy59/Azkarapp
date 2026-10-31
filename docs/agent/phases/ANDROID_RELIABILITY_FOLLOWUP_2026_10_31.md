# Android reliability follow-up — 2026-10-31

## Objective and authority

The owner approves fixing all findings from the implementation review and asks to report additional worthwhile defects. Keep all existing local repairs and the untracked Android brief. The production hold remains active: no commit, push or deployment.

## Inspection and plan before editing

1. Route each haptic action through one platform path; translate web on/off patterns to Android's initial-off convention, honor system/app preferences and cancel on native lifecycle exit. Cover shared dispatch and native timing conversion.
2. Remove Progress's duplicate safe-area reservation; verify root versus child/portalled geometry under a simulated nonzero inset.
3. Include the exact current page among index shortcuts and reveal its current marker without changing search/manual browse or focus. Test intermediate pages and boundaries, both languages and enlarged text.
4. Bind queued Play all to its originating route/category/mode/language/reading context, discard stale requests and expose genuine loading/failure feedback. Retain explicit auto-advance, media and approved coverage semantics.
5. Add missing touch-drag/focus and index reveal regressions. Investigate adjacent failures without expanding into unrelated features. Run focused unit/browser/native checks where the environment supports them, then pnpm check and Pages build; retain hardware limitations and an exact structured phase report.

## Boundaries

No reviewed content, persisted progress format, dependencies, motion duration, bundle ceilings or test thresholds change. Native behavior requires an updated binary and device acceptance; browser mocks cannot certify Nord 4 haptics or system bars.

## Local result

See [the structured follow-up report](../reports/ANDROID_RELIABILITY_FOLLOWUP_2026_10_31_REPORT.md) for the completed implementation, discovered Glass/focus/import-cache defects, passing local gates and explicit native/device limitations. Production remains on hold.
