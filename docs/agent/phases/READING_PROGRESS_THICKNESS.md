# Phase Report — Reading progress thickness

## Objective

Apply the owner's approved 8 CSS px session progress bar on mobile and desktop as a local trial. Footer and counter feedback is advisory only.

## Scope completed

Increase the compact shared reading-header track from 6px to 8px; preserve the wide header's existing 8px track. Preserve concurrent edits.

## Files changed

- `src/app/components/ReadingScreenChrome.tsx`
- `src/app/screens/ReaderScreen.tsx` (compact progress height only)
- `src/test/isolatedSuites.ts`
- `src/app/components/ReadingScreenChrome.test.tsx`
- `e2e/reading-progress-thickness.spec.ts`
- `docs/DESIGN_SYSTEM.md` (progress thickness contract only)
- This report.

## Components added or modified

Modified ReadingScreenChrome and the Reader's separate compact progress track; no new runtime component or dependency.

## User-visible changes

Reader, Masbaha, and Friday Salawat share an 8px session progress track at every width. No footer or counter changes were made by this task.

## Accessibility work

Preserved accessible name, numeric progress values, rounded geometry, theme colors, and RTL/LTR direction. Thickness is a visibility refinement, not a claim of WCAG compliance.

## Tests added or updated

Four unit cases cover compact/wide Arabic/English progress geometry and accessible values. Two browser cases cover 320, 390, 820, and 1440px widths, computed height, direction, initial value, and horizontal containment.

## Commands run

| Command                                                                                         | Result                                                           |
| ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `pnpm test:run src/app/components/ReadingScreenChrome.test.tsx`                                 | Passed: 1 file, 4 tests.                                         |
| Scoped `pnpm exec prettier --write`                                                             | Passed.                                                          |
| `pnpm check`                                                                                    | Passed: all stages, 266.9 seconds.                               |
| `pnpm test:e2e e2e/reading-progress-thickness.spec.ts --project=desktop-chromium --retries=0`   | Passed: 2 tests, 1.9 minutes; eight language/width combinations. |
| `pnpm test:run src/app/components/ReadingScreenChrome.test.tsx src/test/isolatedSuites.test.ts` | Passed: 2 files, 6 tests.                                        |
| `git diff --check`                                                                              | Passed.                                                          |

## Visual/manual evidence

Browser cases wrote eight screenshots to `output/playwright/reading-progress/`. Inspected the Arabic 390px and English 1440px screenshots. Physical-device and human assistive-technology review is not part of this thickness trial.

## Documentation updated

Recorded the shared 8px thickness in DESIGN_SYSTEM.md and this report.

## Decisions recorded

Owner approved 8px for mobile and desktop. Owner explicitly confirmed that footer recommendations must not be implemented.

## Known limitations or remaining risks

The current working tree includes concurrent footer and other changes. This task does not commit, push, or deploy those changes. Existing colors are preserved; screenshot contrast observations remain recommendations rather than measured findings.

Initial verification caught an unregistered module-mocking test and the Reader's separate 6px track. Registered the test under the existing isolation policy and corrected the separate track; targeted reruns passed without weakening assertions.

## Out-of-scope findings

Suggested discussion points: empty-track visibility, counter emphasis, secondary support-action hierarchy, and enlarged-text layout.

## Recommended next step

Review the local 8px bar. Discuss footer refinements separately before any implementation.
