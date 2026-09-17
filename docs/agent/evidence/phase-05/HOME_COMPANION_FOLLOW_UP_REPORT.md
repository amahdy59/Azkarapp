# Phase Report — Home companion follow-up

## Objective

Refine the Home, electronic masbaha, and Friday companion experiences for responsive Arabic-first use without changing reviewed devotional content.

## Scope completed

- Preserved Morning, Evening, Before Sleep semantic order while mirroring Arabic placement through RTL layout.
- Made Wird cards full-width, horizontal rows on compact screens and maintained the three-card layout from `sm` upward.
- Kept the completion acknowledgement brief, then removed the completed routine prompt from Home.
- Moved next-prayer context into the theme-aware After Prayer container and improved its state cues.
- Expanded the Home masbaha entry and custom counter geometry at tablet and desktop widths while retaining the Reader counter contract.
- Surfaced existing Friday benefits directly on desktop/tablet and progressively disclosed the additional detail on compact screens.

## Files changed

- Home composition, cards, progress cards, masbaha button, custom counter, Friday screen, and theme styles.
- Focused unit/render tests and responsive Playwright coverage.
- Design-system contract and decision log.

## User-visible changes

- The routine prompt disappears after the completion acknowledgement instead of returning as an actionable card.
- Next prayer, active/completed prayer state, and time now share one modern After Prayer surface in every theme.
- The masbaha entry uses available wide-screen space; the dedicated counter becomes comfortably larger at tablet and desktop widths.
- Friday surfaces retain source-linked existing benefits nearer to the action.

## Accessibility work

- Stable DOM/keyboard order for time-of-day routines, with visual RTL mirroring only.
- Larger readable compact targets, responsive text wrapping, semantic progress/current-state cues, and non-colour state icons.
- Existing reduced-motion behavior remains intact; accessibility and touch-target browser checks passed.

## Tests added or updated

- Unit/render coverage for routine ordering, completion removal, after-prayer context, Friday benefits, and counter sizing contract.
- Playwright coverage for LTR/RTL card placement, 320 px compact geometry, desktop masbaha sizing, and custom counter dimensions.

## Commands run

| Command                          | Result                                             |
| -------------------------------- | -------------------------------------------------- |
| `pnpm install --frozen-lockfile` | Passed                                             |
| `pnpm check`                     | Passed: 386 tests, production build, bundle budget |
| `pnpm test:e2e`                  | Passed: 320 tests, 2 skipped                       |
| `pnpm build:pages`               | Passed                                             |
| `pnpm audit:prod`                | Passed: no known vulnerabilities                   |

## Visual/manual evidence

The full desktop, tablet, and compact Playwright matrix passed, including no-overflow, 200% zoom, touch-target, automated accessibility, Arabic RTL, and theme checks. Existing screenshot files were left outside this release scope.

## Documentation updated

- `docs/DESIGN_SYSTEM.md`
- `docs/agent/DECISION_LOG.md` (DEC-052)

## Decisions recorded

DEC-052 records the approved responsive Wird ordering, post-prayer ownership, and companion content-depth rules.

## Known limitations or remaining risks

Automated accessibility checks supplement, but do not replace, screen-reader validation on physical devices.

## Recommended next step

Collect brief usability feedback from Arabic and English readers after the live release, especially around the prayer-state rail and counter scale.
