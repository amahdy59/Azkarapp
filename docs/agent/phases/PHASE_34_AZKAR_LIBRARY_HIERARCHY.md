# Phase Report — Azkar Library Hierarchy

## Objective

Make the Azkar Library easier to scan while distinguishing editorial benefits from reader evidence and removing destinations already owned by Today's Wird or More.

## Scope completed

- Replaced the hidden Collections/Saved menu with two visible accessible tabs.
- Kept the searchable collection groups as the Library's primary content.
- Moved one compact, labelled Zikr Benefits action after the collection groups.
- Removed duplicate Quran and Masbaha entries from the Library.
- Reserved Lightbulb for Benefits and BookOpen for the reader Reference sheet.
- Exposed the localized Reference label at 600px and wider while preserving an icon-only phone action.

## Files changed

- Library and Reader screens, app composition, and the shared icon export.
- Focused unit and browser coverage for navigation, keyboard behavior, accessibility, geometry, and search.
- Design-system, IA, decision, phase-index, and release documentation.

## Components added or modified

- Modified `AzkarLibraryScreen` and `ReaderScreen`.
- Reused the shared `TabList`; no new component or dependency was added.
- Added the existing icon system's `Lightbulb` export.

## User-visible changes

- Collections and Saved are always visible and require one action to switch.
- Actual collections appear before the secondary Benefits destination.
- Benefits has a recognizable lightbulb plus text instead of an ambiguous disclosure icon.
- Quran and Masbaha no longer appear twice in the app structure.
- Reader evidence shows “Reference / الدليل” beside its book icon on tablet and desktop.

## Accessibility work

- Preserved a visible Search label while removing the duplicated placeholder.
- Reused APG tab semantics, roving focus, direction-aware arrows, Home/End, and labelled panel linkage.
- Preserved native buttons, 44px targets, visible focus, localized names, and dialog disclosure semantics.
- Kept narrow-phone actions compact without removing their accessible names.

## Tests added or updated

- Updated Library unit coverage for hierarchy, tab state, search labeling, and removed duplicates.
- Updated Saved navigation, keyboard, accessibility, responsive containment, and search browser coverage.
- Replaced obsolete menu geometry checks with tab direction and target-size checks.

## Commands run

| Command                                  | Result                                                         |
| ---------------------------------------- | -------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`         | Passed; lockfile already current.                              |
| `pnpm check`                             | Passed; all format, lint, type, unit, content, and size gates. |
| `pnpm test:e2e`                          | Passed; 397 tests, 1 intentionally skipped.                    |
| `pnpm build:pages`                       | Passed; bundle and CSS utility checks passed.                  |
| `pnpm audit:prod`                        | Passed; no known production vulnerabilities.                   |
| Focused Vitest Library and Reader suites | Passed; 11 tests.                                              |

## Visual/manual evidence

- Arabic Library and Reader checks covered 320px, 600px, tablet, and desktop layouts. Browser assertions verified tab containment, target sizes, RTL keyboard movement, and responsive Reference-label visibility.

## Documentation updated

- Design system, information architecture, decision log, phase index, this report, and release notes.

## Decisions recorded

- DEC-176.

## Known limitations or remaining risks

- Production verification remains pending because this change has not been pushed or deployed.

## Recommended next step

- Commit the verified local result. Push and production verification require the user's separate approval.
