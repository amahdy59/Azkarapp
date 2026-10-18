# Phase Report — Local balanced glass and scrolling

## Objective

Apply all six code-review recommendations locally, sharing actual image evidence during implementation. The owner reviewed the first phone image and selected “Keep this balanced frost.” No commit, push or deployment is authorized.

## Scope completed

- Shared 24% card/36% reading navy tints and stationary 22px/135% frost, with quieter ordinary/flat elevation. Overlays keep 80%/28px.
- Explicit shared-card material ownership and exact legacy bg-card matching replace broad class-substring matching. Nested controls reuse outer frost.
- Latest owner correction supersedes the initial opaque scrolling visor: interface headers keep their 36% navy tint/sheen and increase frost from 22px at rest to 32px while scrolled. A faint separating edge/shadow accompanies the existing 8px/2px threshold, with no blur interpolation.
- Shared Header, Library, Progress and Settings track their actual vertical viewport, initialize restored position, rebind on resize and use 8px/2px hysteresis. Home adopts the same utility-header hysteresis while retaining 96px/8px prayer collapse thresholds.
- Owner live-preview correction: Home uses one inherited CSS expansion number for a coordinated 280ms footer/icon/spacing transition. The cards shrink continuously, with native reversal and reduced-motion cancellation. No shared row backing, compact countdown or visible scrollbar; each card and the header retain frost.
- Add loaded-photo Glass wheel/touch interaction checks and attached frame/long-task diagnostics, retaining the constrained Solid checks.

## Files changed

Theme tokens/materials and Home material CSS; Card, CategoryCard, StatePanel, ReferenceCard, DailyCompanionsCard, AzkarListItem and RoutineGarden material ownership; LayoutShells, HomeScreen, AzkarLibraryScreen, ProgressScreen and Settings primitives/root; new useScrollElevation and simplified useHomePrayerScroll; affected unit/browser specs and phase/design/architecture/motion documents. Exact file inventory is available in the local Git diff.

## Components added or modified

Add useScrollElevation/headerScrollViewport. Reuse existing card primitives, headers, native viewports, prayer-strip handoff and Playwright projects. No runtime dependency or new product control.

## User-visible changes

Balanced stronger frost, calmer secondary shadows, consistent frosted headers without a scrolling colour change, stable header elevation during nested/horizontal scrolling, and a coordinated smaller-card handoff, effective scrolling frost and no compact countdown or scrollbar. Glass disables its named route capture boundary, which actual Chromium diagnostics showed was preventing descendant filters from sampling passing content; Opaque retains its existing named transition. Progress retains native records scrolling beneath its unified controls and existing keyboard focus recovery, superseding the briefly tested separately clipped records viewport. No religious text, count, tracking, prayer calculation, playback, persistence or offline contract changes.

## Accessibility work

Preserve native semantics, keyboard order, focus recovery, 44px controls, RTL/LTR, independent Home/App material settings and Solid/high-contrast/reduced-transparency/forced-color behavior. Header background colour no longer transitions during scroll; passing content diffuses through stronger frost. Reduced motion remains immediate and cancels existing effects. Scoped browser axe results and physical-device/human assistive-technology limitations are recorded below; automation does not establish complete compliance.

## Tests added or updated

Unit coverage for restored scroll, nested reading/horizontal isolation, threshold hysteresis, responsive rebinding and threshold-only React renders. Actual-browser motion coverage pauses the real transition at 0/140/280ms to verify continuous card geometry, smaller compact height, hidden scrollbar, unchanged touch targets, effective individual/header frost, reversal, OS reduced-motion cancellation and enlarged text. Browser coverage for loaded-scene screenshots, actual header owners, nested-scroll isolation, immediate coverage, 8px/2px behavior, axe and real Glass wheel/touch scrolling. Existing material expectations follow the approved new values; fallbacks, targets, geometry and content assertions remain intact.

## Commands run

Header follow-up validation is recorded separately below. Earlier results certify their earlier snapshots, not the final stronger-frost correction. The interim fixed-controls experiment passed 13 unit and 16 Chromium browser tests, but was superseded by the owner's explicit request for content flowing behind headers. An interim three-engine run was stopped after encountering two Progress viewport-selection failures and one WebKit failure; no passing final claim is based on that incomplete run. The final material's first Chromium run passed six cases; two timed out during navigation/page setup under concurrent machine load. Keep those failures visible in header-frost-chromium-results.json. The corrected final regression selection uses only visible native viewports and a single worker without relaxing assertions or timeouts.

Final stronger-header-frost results:

| Command/selection                                                                                    | Result                                                                                                                                                                                                                 |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vitest: useScrollElevation, ProgressScreen, viewTransitions                                          | 3 suites / 17 tests passed, 26.31s                                                                                                                                                                                     |
| Playwright glass header scroll ownership, Chromium + Firefox + WebKit, one worker                    | All 24 passed, 6.9m; unchanged tint/sheen, 22px/32px frost, live capture boundary, scroll ownership/hysteresis, nested-scroll isolation, axe and opaque/high-contrast fallback assertions                              |
| Playwright Home interpolation + narrow/desktop stationary Progress + independent materials, Chromium | All 10 passed, 2.0m; includes 320px/200% text and actual Home transition geometry                                                                                                                                      |
| pnpm check                                                                                           | All 14 stages passed, 310.8s, including enforced unit coverage, production build, lint/format/types/content/timings and unchanged bundle/CSS budgets; log: header-frost-quality.log                                    |
| Built CSS inspection                                                                                 | 32px token, scrolling filter declaration and Glass live-canvas rule all retained after minification; initial whitespace-sensitive diagnostic regex was corrected for minified function spacing, with no product change |
| Scoped formatting + git diff --check                                                                 | Passed                                                                                                                                                                                                                 |

| Command                                                                               | Result                                                                                                                                                                           |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Baseline glass-refinement evidence, desktop Chromium                                  | 2 passed, 1.6m; before source changes                                                                                                                                            |
| Targeted six unit suites                                                              | 34 passed, 18.23s                                                                                                                                                                |
| Targeted scroll/Header unit recheck                                                   | 17 passed, 6.61s                                                                                                                                                                 |
| pnpm typecheck                                                                        | Passed                                                                                                                                                                           |
| Scoped ESLint and formatting                                                          | Passed                                                                                                                                                                           |
| Pass-1 screenshot capture, desktop Chromium                                           | 2 passed, 34.8s                                                                                                                                                                  |
| Glass evidence + prayer-scroll + Home material + scroll-performance, desktop Chromium | 11 passed, 2.8m                                                                                                                                                                  |
| First new multi-engine header/evidence round                                          | 7 passed, 6 failed: initial viewport-discovery timing and wrong wide Settings test scope; corrected test setup without relaxing assertions/timeouts. Final results follow below. |

Additional completed validation before the owner's motion correction: the new Chromium header cases passed 8/8 (36.8s); the selected three-engine material/header/reading/motion pass had 62 successes and two 90-second WebKit timeouts. Both unchanged cases passed in isolation (41.4s and 16.5s; 2 passed in 1.6m). All 14 pnpm check stages passed in 230.4s, including unit coverage, format/lint/typecheck, content/timing validation, build and unchanged bundle/CSS budgets. Inventory proved all 1,863 browser cases exactly once. These results certify that earlier snapshot; the new Home motion correction receives fresh affected-browser and quality checks below.

The initial new motion unit run passed 21 tests (4.69s). Its first Chromium actual-interpolation cases passed 2/2; an obsolete shared-ground assertion failed and was updated to the owner's unboxed-card contract without changing fallback requirements. The corrected motion/scroll/fallback round passed 7/7 in 48.8s. Final acceptance: all 31 affected Home cases have passing results across Chromium, Firefox and WebKit. The first 31-case round passed 29 and found two WebKit harness failures: its emulated RAF loop completed before native scroll delivery. A separate real-device-profile diagnostic confirmed actual interpolation, then the harness was corrected to observe the real data-attribute commit and pause the resulting transition. All six actual-motion cases passed in 39.2s, retaining time-zero/mid/final geometry, 35%+ card-height reduction, enlarged text, hidden scrollbar, header/card frost, 44px targets, reversal and reduced-motion assertions. No timeout/assertion was weakened. The two new motion unit cases and the existing prayer-card suite passed 21 tests in 4.69s. The full refreshed pnpm check passed all stages in 125.8s, including enforced coverage, build, lint/format/types/content/timing and unchanged bundle/CSS budgets. The final browser-harness-only correction passed scoped ESLint/format and the six-engine cases afterward; production source remained unchanged. Updated browser inventory: 1,869 cases exactly once. Local preview returned HTTP 200 at http://127.0.0.1:5198/.

## Visual/manual evidence

Latest owner-header evidence is in output/playwright/glass-refinement/header-frost-final/ (Arabic 1440px, Library/Progress/Appearance, rest/scrolled pairs) and header-consistent/{desktop-chromium,desktop-firefox-smoke,mobile-webkit-smoke}/ (Arabic 390px and English 1440px rest/scrolled regression captures). The final Arabic desktop pairs were visually inspected after restoring actual backdrop sampling; a scrolled Settings image was shown inline. Intermediate files in header-consistent include rejected experiments and diagnostics and are not the final design. The in-app browser confirmed the earlier ineffective filter before the correction; final acceptance images use actual Playwright Chromium rendering. The original local preview remains at http://127.0.0.1:5198/#/home.

Actual images are in output/playwright/glass-refinement/{before,pass-1,pass-2,final}/, separated by browser project. Home, Library, Progress and Appearance include Arabic 390px and English 1440px. Scrolled Home and Progress images are included. Final actual expanded/paused-midpoint/compact and 200%-text Home captures are in output/playwright/glass-refinement/home-motion/{desktop-chromium,desktop-firefox-smoke,mobile-webkit-smoke}/. Final Chromium compact phone and desktop captures were visually inspected after restoring actual backdrop sampling. Baseline, first phone refinement and corrected desktop Progress/Library images were inspected and shown during implementation. The first after capture exposed transparent-background transition bleed; immediate header coverage fixes it. Windows WebKit captures exposed a separate rendering limitation described below; its computed-style assertions do not certify visible frost.

## Documentation updated

Phase plan, agent index/decision log, design system, architecture, motion system and this report. Competing historical material/header notes are explicitly superseded for this bounded local preview.

## Guidance consulted

The [CSSWG discussion of view-transition capture boundaries](https://lists.w3.org/Archives/Public/www-style/2023Mar/0009.html) explains the backdrop-root effect of naming a captured subtree. A controlled actual-browser diagnostic reproduced the ineffective header frost, then restored it by removing only the app-content name; paired screenshots are in header-consistent/view-transition-diagnostic.png and the earlier diagnostics. This is direct local rendering evidence, not an assumption from computed filter values.

The [CSSWG Filter Effects Level 2 working draft](https://drafts.csswg.org/filter-effects-2/#BackdropRoot) describes how opacity/filter ancestors bound backdrop sampling; it remains a working draft. Removing the retained opacity entrance fixed actual passing-text frost in the captured Chromium evidence. Motion remains finite and suppressible through OS/app preferences, consistent with [WAI guidance on interaction animation](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html); this is not a claim of full accessibility conformance.

## Decisions recorded

Balanced Home frost accepted by the owner. Latest header direction supersedes complete solid text occlusion: preserve tint/sheen while strengthening frost to diffuse moving content. Glass gives up the named route crossfade to keep effective backdrop sampling; Opaque keeps it. Independent accessibility preferences remain authoritative. Keep all changes local and unpublished.

## Known limitations or remaining risks

The preceding material snapshot's 4x-CPU diagnostics recorded occasional long frames (initial Home phone maximum 444ms; subsequent loaded-font sample maximum 560ms). These are input/frame diagnostics, not uniform-60fps certification or a benchmark of the later coordinated Home motion correction. Physical older-phone scrolling/battery and human assistive technology remain manual acceptance. Do not infer physical performance from desktop emulation or automated axe checks.

Windows Playwright WebKit reports the expected backdrop-filter but does not visibly blur the captured content. A standalone HTML striped-background test outside the app reproduced this: Chromium blurs the stripes; WebKit leaves them sharp despite reporting blur(22px). Explicit prefixed CSS did not change the result. Evidence: home-motion/{chromium,webkit}-minimal-backdrop.png and webkit-prefix-check.png. This isolates a local renderer limitation independent of the application styles; it does not establish how physical Safari renders. The three-engine tests verify geometry, interactions and declared filter values, while actual Safari/iPhone frost remains a manual visual acceptance item. No browser sniffing or speculative product workaround was added.

## Out-of-scope findings

Separate prayer-connector edits appeared in the shared Home stylesheet during this session and are preserved. This phase changes shared shadows and the prayer-row motion/material rules; the separate connector block is preserved and its design/verification belongs to that concurrent work. No release-note manifest, commit or push was created. The earlier single-shell implementation was superseded after owner live-preview feedback.

## Recommended next step

Review the final balanced-frost screenshots and try the Home collapse on representative physical phones before authorizing publication or further decorative effects.
