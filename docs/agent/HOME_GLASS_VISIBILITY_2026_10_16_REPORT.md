# Phase Report — Home glass visibility

## Objective

Make normal Home glass visibly frosted and translucent across mobile, tablet and desktop, preserving the device's reduced-transparency preference as explicitly confirmed by the owner.

## Scope completed

- Compared actual normal-preference phone/desktop baseline captures with the supplied image. The image resembles the solid fallback; the user's actual device preference was not inspected.
- Refined the shared Home material with 16px frost, 135% saturation, a directional sheen capped at 5.5%, brighter inset reflections and a shallow shadow. Prayer summaries inherit the shared reflection/shadow and keep quiet 24% edges; other cards use 26% edges.
- Retained the existing tint hierarchy, scrim, next-prayer accent and single backdrop layer. Card geometry, reviewed content, prayer behavior, persistence and offline operation are unchanged.
- Kept the existing local preview-before-publication boundary. No commit, push or deployment; release notes are unchanged.

## Files changed

- `src/app/components/home-wird.css`
- `e2e/home-glass-material.spec.ts`
- `e2e/reduce-transparency.spec.ts`
- `e2e/counter-feedback.spec.ts`
- `docs/DESIGN_SYSTEM.md`
- `docs/agent/DECISION_LOG.md`
- `docs/agent/phases/HOME_GLASS_REFINEMENT_2026_10_15.md`
- This report.

## Components added or modified

Modified the shared Home CSS material consumed by prayer summaries, routine, evidence, Wird, saved items, situational shortcuts and utility cards. No component or dependency added.

## User-visible changes

All Home card categories have clearer frost, directional surface light and reflective edges in normal transparency mode. Reading retains a stronger tint, primary actions stay solid, and reduced-transparency/high-contrast surfaces stay opaque.

## Accessibility work

Preserved application/system reduced transparency, high contrast, no-filter fallback, keyboard behavior, semantic controls and focus. Existing 4.5:1 conservative compositing assertions against a white source pixel pass. Scene checks include axe. Responsive checks cover 320/390/834/1440px, Arabic/English and all three themes. No claim of complete manual accessibility compliance or real-device performance is made.

## Tests added or updated

- Expanded scene coverage to tablet and checked every Home material rather than one representative card, including no nested glass surfaces.
- Added live responsive resizing across all themes and both languages.
- Updated exact frost/saturation/edge expectations to the new material; retained contrast, fallback and geometry assertions.
- The first theme sweep read card count before the lazy Home route mounted (five failures). Replaced that immediate count with a retrying readiness assertion; all six cases then passed with the same count threshold and material assertions.

## Commands run

| Command                                                                                                                                        | Result                                                                        |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `pnpm test:e2e e2e/home-glass-material.spec.ts --project=desktop-chromium --grep 'reveals morning'`                                            | Baseline: 2 passed, 20.2s.                                                    |
| `pnpm test:e2e e2e/home-glass-material.spec.ts e2e/reduce-transparency.spec.ts --project=desktop-chromium`                                     | 17 passed, 44.7s.                                                             |
| `pnpm test:e2e e2e/home-glass-material.spec.ts e2e/counter-feedback.spec.ts --project=desktop-chromium --grep 'through responsive\|wide Home'` | Initial new readiness assertion: 5 failed, 2 passed, 22.2s; wide Home passed. |
| `pnpm test:e2e e2e/home-glass-material.spec.ts --project=desktop-chromium --grep 'through responsive'`                                         | After readiness fix: 6 passed, 28.0s.                                         |
| `pnpm exec prettier --write` (changed files only)                                                                                              | Passed.                                                                       |
| `git diff --check`                                                                                                                             | Passed.                                                                       |

Final validation: `pnpm check` passed in 99.5s, including toolchain, coverage-enforced unit suite, build, TypeScript, lint, formatting, content/timing checks, motion/type-scale checks, bundle budgets and CSS utility verification. `pnpm test:e2e e2e/practical-devotional-access.spec.ts --project=desktop-firefox-smoke --project=mobile-webkit-smoke --grep 'situational material'` passed all 4 cases in 45.6s. In total, 28 targeted post-change browser cases passed across the final feature selections (excluding the two baseline cases and superseded failed readiness sweep). Final report-only edits were formatted separately; no application inputs changed after the quality pass.

## Visual/manual evidence

Actual captures inspected at 390px and 1440px; tablet scene captures also produced. Retained comparison files under `output/playwright/home-glass-2026-10-16/`: `before-mobile.png`, `before-desktop.png`, `after-morning-390.png`, `after-morning-834.png`, `after-morning-1440.png`. These explicitly emulate normal transparency; they do not claim the user's actual system is in that mode.

## Documentation updated

Design-system material values, owner decision and active phase continuation; this report records verification and evidence.

## Decisions recorded

Owner requests clearer glass across views and explicitly chooses to preserve the device preference. Existing local image review remains the publication boundary.

## Known limitations or remaining risks

Device reduced transparency intentionally shows solid cards. Native backdrop rendering varies by browser/GPU; no physical-device frame-rate measurements or human assistive-technology session performed.

## Out-of-scope findings

None requiring application changes.

## Recommended next step

Owner reviews the supplied normal-mode phone/desktop previews, followed by the intact release process when publication is requested.
