# Phase Report — Quran word-meaning card release

## Objective

Review the user-redesigned Quran word-meaning card, complete its responsive and accessibility behavior, verify all pending application changes, and release them safely.

## Scope completed

- Preserved the compact visual direction of the redesigned card.
- Made the card stack on narrow screens and split into two regions only when space permits.
- Restored the full source attribution and the required action target size.
- Corrected the interactive card semantics without changing the informational Mushaf tooltip.

## Files changed

- `src/app/components/QuranWordPopover.tsx`
- `src/app/screens/ReaderScreen.tsx`
- `src/app/screens/ReaderScreen.audio.test.tsx`
- `e2e/accessibility-new-surfaces.spec.ts`
- `docs/agent/DECISION_LOG.md`
- `public/release-notes.json`

## Components added or modified

- `QuranWordPopover`

## User-visible changes

- Word meanings remain compact while fitting narrow screens without clipping.
- The source name is fully readable.
- The complete-meanings action remains comfortably tappable.

## Accessibility work

- Used a named non-modal dialog for the interactive card and retained tooltip semantics for informational cards.
- Preserved a 44px action target and 3px keyboard focus indicator.
- Added explicit Arabic language and direction metadata to the Arabic meaning region.

## Tests added or updated

- Reader unit coverage for the named interactive card.
- Browser coverage for role, accessible name, target size, source visibility, and automated WCAG A/AA checks.

## Commands run

| Command                                     | Result                                                              |
| ------------------------------------------- | ------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`            | Passed; lockfile already current                                    |
| Focused Reader unit test                    | 4 passed                                                            |
| Focused meaning/accessibility browser tests | 12 passed after enabling Reader attribution; focused rerun 3 passed |
| `pnpm check`                                | Passed in 60.9 seconds                                              |
| `pnpm test:e2e`                             | 321 passed in 8.9 minutes                                           |
| `pnpm build:pages`                          | Passed; bundle and CSS utility budgets passed                       |

## Visual/manual evidence

- Phone-width visual review confirmed the anchored card remained inside a 390×844 viewport without horizontal document overflow.
- Automated desktop, mobile, and tablet checks confirmed the named dialog, complete source, and 44px action target.

## Documentation updated

- Added DEC-106 to the decision log.
- Added this release report.

## Decisions recorded

- DEC-106 — word meanings stay compact without hiding provenance or shrinking actions.

## Known limitations or remaining risks

Pending GitHub Actions and production verification for the final commit.

## Out-of-scope findings

None.

## Recommended next step

Complete the full local gates, deploy the verified commit, and smoke-test the production reader and Wird overview.
