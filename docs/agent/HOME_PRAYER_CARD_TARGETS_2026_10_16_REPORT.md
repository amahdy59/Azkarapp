# Phase Report — Full-card prayer targets and spacing

## Objective

Make small prayer cards fully clickable, increase top/side padding, remove Viewing/معروضة, and stop highlighting current once next is approaching. Provide local images before another push, with recommendations for visually connecting the selected summary to its expanded panel.

## Scope completed

- Increased header insets and matching footer inline insets from 8px to 12px.
- Extended the existing native button's hit area over the whole card using a transparent pseudo-element. Kept the footer/progress outside button semantics and retained future openability/disabled rules, keyboard activation and full-card inset focus.
- Removed Viewing text; retained aria-expanded, data-selected and a quiet inset outline for selection.
- Current decorative emphasis is zero once next is within the final 30-minute approach. Next retains its gradual increase; times, records, content and text contrast are unchanged.
- Gave all temporal labels the same 28px minimum row so the Next badge cannot shift their measured vertical alignment.
- Proposed a restrained selected-card tab plus matching panel notch for the water-drop connection. This is a recommendation only; no bridge, panel relocation or connector animation implemented.

## Files changed

- `src/app/components/PrayerTrackerCards.tsx`, `src/app/components/home-wird.css`
- `src/app/prayerCardModels.ts`, `src/app/prayerTimeline.test.ts`
- `src/app/components/PrayerTrackerCards.test.tsx`
- `e2e/home-clarity.spec.ts`, `e2e/home-glass-material.spec.ts`
- Design-system/prayer contracts, decision log, active phase, index and this report.

## Components added or modified

Existing summary card interaction/styles and optional decorative model value only. No dependency, persisted schema or reviewed content change.

## User-visible changes

More spacious small cards with full-card activation for available prayers, no redundant Viewing label, quiet visual selection, and approaching-next focus without a competing current-card glow.

## Accessibility work

One native keyboard target per card; aria-expanded and existing disabled rules retained. The countdown and native progress remain outside button semantics. Full-card inset focus remains visible. Existing full-opacity text, contrast, glass/solid preferences, RTL/LTR, equal dimensions and natural 200% text remain verified through browser checks. Human assistive-technology/device acceptance remains separate.

## Tests added or updated

- Unit expectations verify removed Viewing copy with retained expanded semantics and zero approaching-current emphasis.
- Browser assertions measure actual 12px padding/insets rather than CSS declarations alone; test full footer pointer activation plus native Space toggling at enlarged text.
- Existing strict status/card alignment and all other geometry assertions are retained. Exact CI failure reproduction is run locally.
- Initial footer-hit checks exposed the shared global hover filter creating a new containing block and shrinking the pseudo-element target on pointer entry. Applied existing `no-press` opt-out and a card-sized hover treatment, preserving pointer targeting. A combined interaction check then exposed a focus-order timing interaction at 320px; isolated the pointer/keyboard sequence after the original focus/reflow assertions rather than weakening them.

## Commands run

| Command                                                                                       | Result                                                                                                                                  |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm test:run src/app/prayerTimeline.test.ts src/app/components/PrayerTrackerCards.test.tsx` | 25 passed, 3.25s.                                                                                                                       |
| Initial local combined browser check                                                          | 3 passed (including exact CI reproduction and 2 emphasis cases), 6 failed footer-hit assertions; fixed hover containing block.          |
| Intermediate Chromium geometry run                                                            | 4 passed, 2 failed at 320px on interleaved focus sequencing; isolated interaction sequence after original focus/enlargement assertions. |

Final supported-engine run: `pnpm test:e2e e2e/home-clarity.spec.ts e2e/manual-checklist.spec.ts --project=desktop-chromium --project=desktop-firefox-smoke --project=mobile-webkit-smoke --grep 'bounded prayer hierarchy|post-prayer summaries'` passed all 19 cases in 2.7 minutes, including the original exact CI geometry assertion. `pnpm test:e2e e2e/home-glass-material.spec.ts --project=desktop-chromium --grep 'surface emphasis'` passed both cases in 19.7s and captured final normal/enlarged approach states.

`pnpm check` passed in 121.3s with coverage-enforced unit tests, build, typecheck, lint, formatting, content/timing validators, motion/type-scale rules and bundle/CSS gates intact. It recorded an exact-snapshot local pass. Final documentation/evidence edits are checked separately with Prettier and `git diff --check`; no product inputs changed afterward.

## Visual/manual evidence

Phone/desktop Arabic/English screenshots are retained under `output/playwright/home-card-targets-2026-10-16/`, including `ar-390-home.png`, `ar-1440-home.png` and `focus-{390|1440}-{45|15|1}m.png`. Actual normal phone and selected near-adhan desktop/phone captures were visually inspected. The near-adhan images show the quiet current card, selected-next inset outline and expanded panel without Viewing text. No proposed water-drop tab/notch is included. No further commit/push/deployment was performed.

## Documentation updated

Design-system, prayer behavior, decision, active phase, index and this report. Release notes remain at the already-pushed release; no additional release prepared.

## Decisions recorded

The latest owner instruction explicitly restores a local image-review gate before another push. Connection geometry remains a suggestion pending choice; existing summary/panel arrangement stays stable.

## Known limitations or remaining risks

Unavailable future prayer details remain disabled under the existing 30-minute availability rule. Whole-card activation does not authorize early recording. A literal continuous water-drop bridge would need a responsive composition decision to avoid crossing neighboring desktop content or the phone scroller; the proposed small tab/notch avoids that geometry.

## Out-of-scope findings

The previous authorized push `2c46d17f497ed426c484f347f1ddc870b84d9a73` failed Quality run 38865693222 on `e2e/manual-checklist.spec.ts:364` because the padded Next badge shifted the status geometry. All other browser shards, quality checks and Android passed. The final verify gate correctly failed on that browser result; deployment run 38867629378 was skipped. Logs for both failed jobs were inspected and saved under `output/home-refinements-release-2026-10-16/`. The local status-row fix passes the original assertion; no threshold was weakened. Production remains at the previous successful commit.

## Recommended next step

Owner reviews new local images and chooses the proposed selected-card connection treatment before further implementation/publication.
