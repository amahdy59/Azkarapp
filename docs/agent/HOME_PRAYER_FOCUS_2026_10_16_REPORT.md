# Phase Report — Prayer surface focus

## Objective

Apply the owner's approved gradual transfer of emphasis from current to next prayer, keeping other card surfaces quieter without fading their text or making them look disabled.

## Scope completed

- Derived decorative strength from existing dated timeline instants and the minute clock. Current starts at 100%, next at 15%; over the last 30 minutes current softens to 50% while next strengthens to 100%. Normal temporal rollover gives the new current full emphasis.
- Quieted previous/later reflections, edges and shadows. Kept a bounded 1.5–5.5% sheen, strength-weighted accent boundary and small stationary glow for current/next. Shared glass tint, blur, text colors and whole-card opacity remain unchanged.
- Solid mode retains opaque theme surfaces with a restrained accent mix. Application/system reduced transparency and high contrast omit glow and preserve existing opaque fallbacks.
- Preserved countdown/footer geometry, native progress, Friday label, keyboard/focus/selection, prayer calculations, openability, recording, reviewed evidence and persisted state.
- No additional timer, polling, animation loop, moving gradient, animated blur, dependency or migration. No commit, push or deployment; local visual review remains the publication boundary.

## Files changed

- `src/app/prayerCardModels.ts`
- `src/app/prayerTimeline.test.ts`
- `src/app/components/PrayerTrackerCards.tsx`
- `src/app/components/home-wird.css`
- `e2e/home-glass-material.spec.ts`
- `docs/DESIGN_SYSTEM.md`, `docs/PRAYER_TIMES.md`, `docs/MOTION_SYSTEM.md`
- `docs/agent/DECISION_LOG.md`, `docs/agent/phases/HOME_GLASS_REFINEMENT_2026_10_15.md`, this report.

Earlier local glass and prayer-footer refinements remain preserved in the working tree and their separate reports.

## Components added or modified

Modified the existing prayer model's optional presentation value and summary card surface styles. No component added. The shared full prayer tracker ignores the decorative value; its recording behavior is unchanged.

## User-visible changes

Current is the strongest surface at ordinary times; next gradually takes visual priority close to its adhan. Previous/later surfaces are quieter while prayer names, times, statuses and countdown remain fully readable. Next still owns the only real countdown bar.

## Accessibility work

Whole-card opacity remains 1 and no text/filter dimming is introduced. Existing bounded white-source contrast checks, all-scene axe scans, explicit Now/Next semantics, focus rings and keyboard targets remain. Reduced motion uses the existing short border-color behavior without continuous effects; reduced transparency/high contrast retain solid materials without glow. No physical-device frame-rate or human screen-reader compliance claim.

## Tests added or updated

- Model tests cover 45/30/15/1 minutes, exact adhan rollover, midnight and DST, unchanged times and recording restrictions.
- Browser tests capture actual 45/15/1-minute phone/desktop states, measure emphasis, verify stable text colors, opacity 1, no text filter, unchanged single frost layer and axe results.
- All-scene material checks now verify the approved 1.5–5.5% sheen range and quiet surfaces; the maximum contrast requirement remains unchanged. Live fallback checks explicitly verify no shadow on the current card under system reduced transparency and high contrast.
- Existing responsive/equal-size/200%-text checks remain intact across supported engines.

## Commands run

| Command                                                                                                    | Result                  |
| ---------------------------------------------------------------------------------------------------------- | ----------------------- |
| `pnpm test:run src/app/prayerTimeline.test.ts src/app/components/PrayerTrackerCards.test.tsx`              | 25 passed, 3.50s.       |
| `pnpm test:e2e e2e/home-glass-material.spec.ts e2e/reduce-transparency.spec.ts --project=desktop-chromium` | 25 passed, 1.1 minutes. |
| `pnpm exec prettier --write` (affected files only)                                                         | Passed.                 |

`pnpm test:e2e e2e/home-clarity.spec.ts e2e/home-glass-material.spec.ts --project=desktop-chromium --project=desktop-firefox-smoke --project=mobile-webkit-smoke --grep 'bounded prayer hierarchy|live system preference'` passed all 19 cases in 1.5 minutes, including the strengthened current-card no-glow fallback assertions. Combined with the scene/material run, 43 distinct targeted browser cases passed (the fallback case was exercised twice).

`pnpm check` passed in 101.5s: coverage-enforced unit suite, build, TypeScript, lint, formatting, content/timing validation, motion/type-scale rules, bundle budgets and CSS utilities. The command recorded an exact-snapshot local quality pass. No application inputs changed afterward; this final report-only edit is checked separately with Prettier and `git diff --check`.

## Visual/manual evidence

Actual captures at 390px and 1440px for 45/15/1 minutes before adhan are retained under `output/playwright/home-prayer-focus-2026-10-16/`, named `focus-{width}-{minutes}m.png`. Early/late desktop and phone captures were visually inspected. Explicit normal transparency is used for these captures; they do not establish the owner's actual device preference.

## Documentation updated

Design-system material hierarchy, prayer behavior and motion contracts, owner decision, active phase and this report.

## Decisions recorded

Owner approves the proposed current-to-next focus transfer and quieter peripheral surfaces. This supersedes the earlier next-only strong surface. The decorative 30-minute period does not define religious prayer-window validity and does not change the existing preview/recording rules.

## Known limitations or remaining risks

The change progresses in calm minute-clock steps rather than continuous animation. Native glass/glow rendering varies with browser/GPU. Current remains the existing calculated timeline state; this phase does not reinterpret Fajr validity after sunrise or change any religious-source content.

## Out-of-scope findings

None requiring implementation.

## Recommended next step

Owner reviews local early/near-adhan previews before a separately authorized publication through all release gates.
