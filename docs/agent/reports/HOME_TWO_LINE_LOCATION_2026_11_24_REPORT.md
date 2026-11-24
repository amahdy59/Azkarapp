# Phase Report — Home two-line summary and location footer

## Objective

Apply the owner's approved two-line Arabic-first summary and below-timings location reference. This is a correction within the existing local Home phase. The publication hold remains in force.

## Scope completed

- Now/Next labels occupy the first line, with their prayer names beneath them. Remaining time shares the next prayer's second line at normal 320px and 390px sizes.
- Labels and names align at logical start, right in Arabic, independently of the interval shade. Compact columns reserve more space for the next prayer; the narrowest measure uses the current name's intrinsic width. Enlarged text reflows instead of clipping or shrinking.
- Location follows all five timings with a quiet divider. A passive location caption is followed by grouped Change and Refresh actions. Change opens existing location settings; Home adds no location dropdown or chevron.
- Long names can wrap above the actions, which stay together with independent 44px targets. The existing location hook, App callback, saved-setting preservation and protected result dialog remain authoritative.
- An active location request or result dialog holds the expanded prayer section, preserving the disabled Refresh trigger's focus-recovery destination. Existing scroll animation, thresholds and reduced-motion endpoints are retained.
- Independent pending changes and reviewed religious content are preserved. No dependency, persistence schema, calculation or synchronization change was introduced.

## Files changed

Production: `src/app/components/HomePrayerOverview.tsx`, `HomeLocationRow.tsx`, `home-prayer-overview.css`, `src/app/screens/HomeScreen.tsx`, and `src/app/i18n/ar.ts` / `en.ts`.

Tests: `src/app/components/HomePrayerOverview.test.tsx`, `e2e/home-prayer-overview.spec.ts`, `e2e/home-glass-material.spec.ts`, `e2e/prayer-seconds.spec.ts`.

Documentation: README, Architecture, Design System, Prayer Times, Motion System, Quality Checklist, active Home phase, decision log, agent index, preceding Home report and this report. Other dirty files belong to preceding or independently scoped work.

## Components added or modified

HomePrayerOverview gains a screen-composed location slot and a consistent summary anatomy. HomeLocationRow presents a passive caption and grouped shared buttons. HomeScreen composes existing callbacks and extends its interaction hold through location request/result recovery. No new shared primitive is required.

## User-visible changes

The countdown stays beside the next prayer instead of creating a third summary line. Location moves out of the date header, below the timings, with clear Change and Refresh actions. Arabic text aligns to the right. Phone/tablet tile reflow and the existing desktop timer-card anatomy remain intact.

## Accessibility work

Native buttons retain independent 44px targets, visible focus and translated accessible names containing their visible labels. Location actions preserve DOM order and remain grouped when the caption wraps. The protected result modal retains keyboard containment, Escape dismissal and opener recovery. Countdown updates remain passive without a live timer region. Geometry checks cover RTL/LTR, narrow screens, 200% text, text-fragment containment, pointer hit-testing and focus recovery. Existing theme, contrast, transparency and motion fallbacks are exercised. Automated checks do not establish complete accessibility or physical-device acceptance.

## Tests added or updated

- Unit regression for summary label/name/countdown grouping, footer DOM order and absence of live countdown announcements.
- Browser geometry for two-line summaries across six prayer periods and Friday at normal 320px/390px in both languages; label/name logical-start alignment, inline countdown and positions invariant under different shade widths.
- Footer placement, absence of Home dropdown/chevron, grouped action geometry, complete long-name wrapping, target sizes and pointer hit-testing.
- Location request/result hold, success/denial, saved-location preservation, modal focus recovery and navigation to existing settings.
- Desktop Glass inventory includes the new independent footer surface; the compact overview retains one material owner. Countdown typography matches the approved supporting-text hierarchy.

## Commands run

Failure evidence is retained. No assertion, coverage threshold, bundle ceiling, baseline or hook was bypassed.

| Command / evidence                                                                            | Exact result                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Targeted Home overview/render/location/scroll unit suites                                     | PASS: 4 files, 27 tests, 7.62s. `output/home-two-line-units.log`.                                                                                                                                                                                                                                                     |
| Five affected Chromium browser specs: overview, date rail, motion, Glass and prayer countdown | PASS: 60 tests, 2.4m. `output/home-two-line-browser-final.log`.                                                                                                                                                                                                                                                       |
| Extended summary/footer/location/enlarged-text selection in Chromium, Firefox and WebKit      | PASS: 24 tests, 1.9m. `output/home-two-line-engines-final.log`.                                                                                                                                                                                                                                                       |
| Final spacing/across-day screenshot selection in Chromium, Firefox and WebKit                 | PASS: 18 tests, 1.7m, both normal phone widths, six prayer periods, Friday and enlarged tablet countdown. `output/home-two-line-evidence.log`.                                                                                                                                                                        |
| `pnpm check`                                                                                  | Overall FAIL, 266.9s: lint has 10 errors in independent `docs/external-sources/` scripts; format flags 21 files in that same directory. Toolchain, all units with enforced coverage, build, typecheck, audio/content/timing checks, type scale, motion, bundle and CSS checks PASS. `output/home-two-line-check.log`. |
| Final `pnpm typecheck`                                                                        | PASS. `output/home-two-line-typecheck-final.log`.                                                                                                                                                                                                                                                                     |
| Scoped ESLint                                                                                 | PASS, zero warnings. `output/home-two-line-lint-final.log`.                                                                                                                                                                                                                                                           |
| Final `pnpm build:pages`                                                                      | PASS: Home startup graph 517,816 gzip bytes; existing bundle ceilings and CSS checks pass. `output/home-two-line-pages-evidence.log`.                                                                                                                                                                                 |
| Browser inventory, scoped Prettier and `git diff --check`                                     | PASS: 3,577 browser identities without missing/duplicate shard coverage; all 21 scoped files formatted; no diff whitespace errors. `output/home-two-line-inventory-final.log` and `output/home-two-line-format-final.log`.                                                                                            |

The completed full gate precedes the final CSS column-spacing refinement and additional browser cases. That refinement is separately compiled and checked by the final Pages build and affected browser evidence; no successful exact-final-input full gate or reusable quality receipt is claimed. The initial browser attempts exposed the long Arabic action split and enlarged English overflow, which were repaired. An expanded across-day check then exposed the English Maghrib line break; the intrinsic-width narrow column fixes it in all three engines. Intermediate logs remain available.

## Visual/manual evidence

Actual application screenshots, without mockup DOM injection:

- `output/playwright/home-two-line/`: Arabic/English 320px and 390px captures in all three engines, after across-day/Friday assertions.
- `output/playwright/home-overview/desktop-chromium-ar-390-expanded.png`: phone summary, footer and opened prayer actions.
- `output/playwright/home-overview/desktop-chromium-ar-1440-expanded.png`: desktop card anatomy and footer.
- `output/playwright/home-overview/`: enlarged/long-location, loading/success/denial, tablet, solid and Glass screenshots from the affected checks.

Representative phone, desktop and long-name enlarged screens were visually inspected. The final phone spacing preserves a clear gap between the current/next groups while giving longer names adequate room on the narrowest measure. Simulated geolocation proves interface handling, not field accuracy.

## Documentation updated

The design and domain documents now describe the two-line summary, logical-start alignment, passive location caption, grouped Change/Refresh actions, below-timings slot, desktop footer material and request/result focus hold. The agent index links this correction and retains preceding evidence.

## Decisions recorded

The 2026-11-24 decision “Approved two-line Home summary and location footer” records the owner's approval, superseding the earlier date-header location and centered/three-line variants. Motion tuning remains a separate review. The local-only hold is unchanged.

## Known limitations or remaining risks

Physical Android/iPhone, TalkBack/VoiceOver and field geolocation acceptance remain pending. At enlarged text and the narrowest measures, complete content may occupy additional rows; it is not clipped to enforce the normal-size two-line design. The repository-wide gate remains blocked by independent external-source lint/format work. Concurrent changes require a consolidated exact-input gate before release. No full browser matrix, CI or deployment success is claimed here.

## Out-of-scope findings

Independent external-source scripts contain unused values and missing environment globals; generated document files also fail formatting. Their owning work is preserved. No religious source text was changed to resolve a presentation issue.

## Recommended next step

Owner review of the implemented screens, followed by the separately requested scroll-motion review and physical-device acceptance. Commit, push, deployment and release-note changes remain on hold; HEAD stays at `be3146ac`.
