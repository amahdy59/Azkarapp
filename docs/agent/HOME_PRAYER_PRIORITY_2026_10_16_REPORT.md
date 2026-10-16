# Phase Report — Home prayer priority and footers

## Objective

Show Friday's noon overview as الجمعة/Jumu‘ah, remove small-card Rawatib summaries, emphasize the next prayer and place remaining time in its footer. Preserve the preceding local glass refinement.

## Scope completed

- Derived noon display naming from the supplied civil record dayKey, without changing `dhuhr` IDs, times, navigation callbacks or persisted records.
- Removed all Sunnah summaries from small-card footers. Next has an accented name/time, a tinted Next badge and its countdown/native interval progress grouped inside the footer.
- Other footers show recorded mosque/home, independent adhkar completion when no location is recorded, Not recorded for current/past prayers, or After {previous prayer} for later prayers. No attendance, missed-prayer or home record is inferred.
- Kept equal card/footer sizes, wrapping/enlargement, 8px visible insets, keyboard scrolling, shared glass and solid accessibility fallbacks.
- Preserved existing expanded educational/checklist content and its religious evidence. No content reinterpretation, migration, dependency or timing change.
- Local previews only; no commit, push, deployment or release-note rewrite.

## Files changed

- `src/app/prayerPresentation.ts`
- `src/app/components/PrayerTrackerCards.tsx`
- `src/app/components/PrayerTrackerCards.test.tsx`
- `src/app/components/home-wird.css`
- `src/app/i18n/ar.ts`, `src/app/i18n/en.ts`
- `e2e/home-glass-material.spec.ts`, `e2e/home-clarity.spec.ts`, `e2e/compact-prayer.spec.ts`
- `docs/DESIGN_SYSTEM.md`, `docs/PRAYER_TIMES.md`, `docs/agent/DECISION_LOG.md`
- `docs/agent/phases/HOME_GLASS_REFINEMENT_2026_10_15.md`, this report.

Earlier glass-only changes remain in the working tree and are reported separately in `HOME_GLASS_VISIBILITY_2026_10_16_REPORT.md`.

## Components added or modified

Modified PrayerTrackerCards' existing summary presentation and shared Home CSS. Added one pure display-name utility; added no component.

## User-visible changes

The next prayer is the clear visual priority and its footer owns remaining time. Other footers reflect actual saved state or prayer sequence. The noon card reads الجمعة/Jumu‘ah on Friday and الظهر/Dhuhr otherwise.

## Accessibility work

Preserved native progress semantics outside buttons, localized accessible prayer names/descriptions and non-live minute updates. The Next badge/text supplements color. Equal geometry, 200% text, focus, keyboard, RTL/LTR and normal/solid materials have targeted browser coverage. No claim of complete human screen-reader or physical-device acceptance.

## Tests added or updated

- Unit integration verifies Friday in Arabic/English, adjacent weekdays, invalid-day fallback, unchanged noon time and `dhuhr` callback identity.
- Unit footer coverage verifies saved/legacy mosque and home, countdown inside footer, future sequence, no Rawatib text and independent adhkar without inferred attendance.
- Browser checks verify footer placement, real decreasing progress without announcements, aligned/equal cards and enlarged complete text, Friday naming/accessibility, themes, keyboard and glass/solid states.

## Commands run

| Command                                                                                                                                                       | Result            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| `pnpm test:run src/app/components/PrayerTrackerCards.test.tsx`                                                                                                | 17 passed, 4.76s. |
| `pnpm test:e2e e2e/home-clarity.spec.ts e2e/home-glass-material.spec.ts --project=desktop-chromium --grep 'bounded prayer hierarchy\|remaining time updates'` | 7 passed, 30.6s.  |
| `pnpm exec prettier --write` (affected files only)                                                                                                            | Passed.           |
| `git diff --check`                                                                                                                                            | Passed.           |

`pnpm test:e2e e2e/home-glass-material.spec.ts e2e/reduce-transparency.spec.ts e2e/compact-prayer.spec.ts --project=desktop-chromium --grep 'reveals|live system preference|saved setting|compact prayer .*themes'` passed all 16 cases in 2.0 minutes, covering every scene, Friday naming, material fallbacks and theme/enlargement/keyboard controls.

`pnpm check` passed in 183.6s: coverage-enforced unit suite, production build, TypeScript, lint, formatting, content/timing validation, motion/type-scale checks, bundle budgets and CSS utility verification. Final report-only edits are formatted separately; no application inputs changed after this pass.

`pnpm test:e2e e2e/home-clarity.spec.ts --project=desktop-firefox-smoke --project=mobile-webkit-smoke --grep 'bounded prayer hierarchy'` passed all 12 cases in 1.4 minutes. Total targeted browser verification: 35 passed across Chromium, Firefox and mobile WebKit.

The owner subsequently approved the countdown/alignment recommendations. Applied the existing 14px typography step, tabular numerals and logical trailing alignment matching the time column. The native bar retains its full width underneath with 8px inline insets; shared header alignment and equal dimensions are retained. New browser assertions measure the actual text edge against the time, font size, bar insets and vertical separation in both languages. The larger glyph range extended beyond its line box: the first Chromium run failed all six new 4px clearance assertions; 8px nominal spacing then passed Chromium but left 3.5px in Firefox/WebKit (12 failures). Increased the actual product spacing to 10px without relaxing the assertion.

Final alignment verification: `pnpm test:e2e e2e/home-clarity.spec.ts --project=desktop-chromium --project=desktop-firefox-smoke --project=mobile-webkit-smoke --grep 'bounded prayer hierarchy'` passed all 18 cases in 1.7 minutes. The final `pnpm check` passed in 86.5s with every quality stage and an exact-snapshot local receipt. An earlier 148.3s quality pass preceded the last spacing adjustment and was superseded by this final pass. Report-only final edits were checked separately with Prettier and `git diff --check`; application inputs remain unchanged.

Actual final Arabic/English 320/390/1440px Chromium captures are retained under `output/playwright/home-prayer-alignment-2026-10-16/`. The 390px and 1440px Arabic previews were visually inspected. Changes remain local for owner review; no commit, push or deployment was performed.

## Visual/manual evidence

Actual Arabic/English normal-glass Home captures at 320/390/1440px are retained under `output/playwright/home-prayer-priority-2026-10-16/`. Friday scene captures are retained alongside them after the scene checks. Desktop and phone previews are visually inspected before delivery. These captures do not establish physical-device rendering/performance or manual assistive-technology acceptance.

## Documentation updated

Design-system and prayer behavior contracts, owner decision, active phase continuation and this report.

## Decisions recorded

The owner's new footer/name request explicitly supersedes the earlier small-card Rawatib and progress-above-footer decisions. Device reduced-transparency remains respected under the owner's preceding confirmation. Local preview review remains the publication boundary.

## Known limitations or remaining risks

Friday substitution is a presentation label for the existing noon overview, not a new mosque-specific iqamah time or a religious-content review of the expanded Dhuhr evidence. Glass rendering varies by browser/GPU and intentionally becomes solid under reduced transparency/high contrast.

## Out-of-scope findings

No source-content changes were required.

## Recommended next step

Review the local Friday and responsive previews before the separately authorized release process.
