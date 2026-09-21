# Phase Report — Home Wird density

## Objective

Reduce the vertical footprint of Home's photographic Wird cards, especially on phones, without reducing readable text, status, icon, or action sizing.

## Scope completed

- Replaced the fixed 17.5rem card minimum with responsive 12rem, 13.5rem, and 14.5rem minimums.
- Tightened only the flexible spacer above the card copy.
- Preserved the four-card order, photography, typography, labels, completion state, focus treatment, and whole-card action target.
- Added browser assertions for card count, height, text size, overflow, and RTL/LTR placement.

## Files changed

- Home Wird card presentation and responsive browser coverage
- Design-system guidance, decision log, phase index, this report, and bilingual release notes

## Components added or modified

- Modified `WirdCategoryCard`; no new component or runtime dependency.

## User-visible changes

- Phone cards use about 31% less minimum height, bringing the next routine into view sooner.
- Desktop cards use about 17% less minimum height and form a more balanced four-card row.
- Titles, descriptions, icons, status marks, and action labels remain the same size.

## Accessibility work

- Preserved the native button, accessible status name, full-card target, visible focus ring, and semantic/keyboard order.
- Confirmed that the 18px title and 12px description sizes did not change and that the longer English description wraps without internal overflow at 320px.
- Preserved Arabic and English direction and allowed content to grow beyond the minimum when text needs more room.
- Restored Reader keyboard focus after Space completes and advances a remembrance, and removed the duplicate global Space listener that could process the same key twice.

## Tests added or updated

- Extended the Home Wird browser test with four-card identity, tablet/mobile height bounds, unchanged typography, and internal-overflow coverage.
- Kept the prayer-strip containment assertion strict while polling for the completed responsive layout instead of sampling during resize.
- Retained the Reader focus assertion that exposed the deployment failure.

## Commands run

| Command                                                                                                          | Result                                                                                                 |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Focused Home Wird Playwright test                                                                                | 1 passed                                                                                               |
| Playwright CLI visual/console review at 320px, 390px, and 1440px                                                 | Arabic and English cards readable; no clipping or console errors                                       |
| `pnpm run check:release-notes`                                                                                   | Passed                                                                                                 |
| `pnpm install --frozen-lockfile`                                                                                 | Passed; lockfile current                                                                               |
| `pnpm check`                                                                                                     | Passed all repository checks                                                                           |
| `pnpm test:e2e`                                                                                                  | Final remediation run: 383 passed, 1 skipped, no retries or flakes                                     |
| `pnpm exec playwright test e2e/accessibility.spec.ts --project=tablet-chromium --grep "Friday mode\|Saved zikr"` | 2 passed in isolation, confirming the first-attempt timeouts were load-related rather than regressions |
| `pnpm build:pages`                                                                                               | Passed; PWA, bundle-budget, and CSS-utility checks passed                                              |

The final release handoff records push and production deployment results.

## Visual/manual evidence

- Reviewed the Arabic four-card row at 1440×900.
- Reviewed the Arabic card at 390×844 and the longest English card copy at 320×700.
- Confirmed preserved hierarchy, readable crops, two-line wrapping, contained actions, and zero browser console errors.

## Documentation updated

- Updated the Home Wird responsive-density contract, phase index, decision log, and release notes.

## Decisions recorded

- DEC-192.

## Known limitations or remaining risks

- Image crops can vary slightly with future copy length or user font overrides; the cards use minimum rather than fixed heights so content can grow safely.

## Out-of-scope findings

- The two tablet accessibility cases that initially timed out under full-suite load passed on automatic retry and again in a focused rerun.
- The first Pages attempt exposed Reader focus loss after keyboard completion; the remediation is included in this release and the failed workflow is superseded by the next verified deployment.
- No devotional content, completion data, Progress cards, navigation, or persistence behavior changed.

## Recommended next step

- Verify the deployed Home row on one physical narrow phone after the service-worker update arrives.
