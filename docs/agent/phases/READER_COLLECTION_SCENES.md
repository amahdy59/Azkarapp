# Phase Report — Reader collection scenes

## Objective

Add beautiful coordinated CSS-gradient and inline-SVG azkar header artwork within the existing desktop and compact header dimensions. Local changes only; no push or deployment.

## Scope completed

Plan before edits: inspect Reader, shared Header and existing prayer artwork; add a reusable static decorative component; retain existing padding, typography, controls, progress and minimum heights; use collection-specific palettes and proportional bounded artwork; preserve opaque fallbacks; verify responsive geometry, language direction, accessibility and offline behavior.

Owner screenshot follow-up: move the wide Reader's individual zikr title and Rare words switch out of the collection hero and into the reading area. Retain the compact reading row's existing placement and spacing. Verify that entry-specific controls no longer change collection header height.

## Files changed

ReaderSceneArt and its stylesheet/unit test; shared LayoutShells Header; ReaderScreen integration; reader-scene browser spec; design system, decision log, agent index and this report.

## Components added or modified

Memoized ReaderSceneArt; shared Header accepts an optional decoration slot and isolates its stacking; ReaderScreen supplies compact or wide artwork. Existing PrayerSceneArt is unchanged. No dependencies added.

## User-visible changes

Morning dawn, Evening dusk, Before Sleep night and neutral collection skies with a bounded mosque vignette. Desktop retains a dark central contrast veil; compact headers retain the theme surface and foreground. No extra header space is requested by artwork.

The wide header contains only collection-level actions, title and progress. Individual entry tools sit below it on the reading surface, using theme foreground/focus colors. The compact row keeps its original classes and receives only a test identifier. Header consistency checks compare Morning, Morning's Ayah Al-Kursi, Evening and Before Sleep at each responsive width; enlarged text retains accessible wrapping rather than a fixed clipping height.

## Accessibility work

Decorations are aria-hidden, unfocusable, pointer-transparent and static. Existing title semantics and controls remain. Reduced transparency and forced colors remove decoration; opaque existing surfaces remain. No network request, loading placeholder, error announcement or media cache is needed. Enlarged text retains existing wrapping behavior.

## Tests added or updated

Five focused units cover collection selection, decorative semantics, request-free SVG, proportional fitting and compact Header semantics. Browser checks cover three scenes, Arabic/English, 320/390/820/1440px containment and equal geometry with decoration hidden, entry-tools placement/header consistency, accessibility scans, three real startup themes, enlarged text, forced colors and offline availability. Existing progress, offline core, shared Header and title/keyboard-toggle regressions are retained.

## Commands run

| Command                                                                                                                                                                                          | Result                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm test:run src/app/components/ReaderSceneArt.test.tsx src/app/components/LayoutShells.test.tsx src/app/i18n/keyIntegrity.test.ts`                                                            | Passed: 3 files, 10 tests; final run 14.08s.                                                                                                                                                                                                                                               |
| Scoped ESLint and Prettier checks for the changed application/tests                                                                                                                              | Passed; no warnings.                                                                                                                                                                                                                                                                       |
| `git diff --check`                                                                                                                                                                               | Passed.                                                                                                                                                                                                                                                                                    |
| `pnpm build:pages`                                                                                                                                                                               | Passed, including bundle budgets and CSS utility checks.                                                                                                                                                                                                                                   |
| `pnpm check`, first run                                                                                                                                                                          | Failed: 1431 tests passed, 1 failed. Concurrent new sidebar-resize component referenced three missing translations. All other stages passed. Those translations were subsequently supplied by the owning session; targeted integrity verification passed.                                  |
| `pnpm check`, second run                                                                                                                                                                         | Failed: 1430 tests passed, 2 failed in concurrent Reader audio/sidebar fixtures; concurrent separator lint failed. Build, types, formatting, audio validation and budgets passed.                                                                                                          |
| `pnpm check`, final run                                                                                                                                                                          | Failed: 1435 tests passed, 1 failed in concurrent PrayerActionsCard styling assertion; PrayerActionsCard formatting also failed. Build, types, lint, local audio validation, motion, type scale, budgets and CSS checks passed.                                                            |
| `pnpm test:e2e e2e/reader-microinteractions.spec.ts --grep 'Ayah Al-Kursi title' --project=desktop-chromium` against the candidate preview                                                       | Passed: 2 tests, 19.2s; title/toggle alignment, pointer/Space behavior, 200% text and reading/counter reachability. Report: `output/reader-title-results.json`.                                                                                                                            |
| `pnpm test:e2e e2e/reader-scene.spec.ts --grep 'theme and accessibility' --project=desktop-chromium --project=desktop-firefox-smoke --project=mobile-webkit-smoke` against the candidate preview | Passed: 18 tests, 6.1 minutes. Report: `output/reader-theme-results.json`.                                                                                                                                                                                                                 |
| `pnpm test:e2e e2e/reader-scene.spec.ts e2e/reading-progress-thickness.spec.ts e2e/offline-core.spec.ts` across the three engines                                                                | Final broad diagnostic: 27 passed, 6 failed (11.8 minutes). Chrome/Firefox geometry, title placement, progress and offline smoke passed. Superseded theme fixture, tests renamed during the run, and WebKit readiness/timeout cases are recorded rather than treated as a passing command. |
| Isolated WebKit geometry/header rerun (`reader-scene.spec.ts`, grep `entry tools\|scene preserves`, project `mobile-webkit-smoke`)                                                               | Passed: 8 tests, 3.5 minutes. Report: `output/reader-webkit-results.json`.                                                                                                                                                                                                                 |

## Visual/manual evidence

Screenshots generated under `output/playwright/reader-scenes/{desktop-chromium,desktop-firefox-smoke,mobile-webkit-smoke}/`. Visually reviewed wide Arabic Morning/Sleep, English Evening, dark compact Morning and light compact Sleep: art is contained, titles/controls remain legible, and entry tools are outside the wide hero. Title regression images are under `output/playwright/reader-title/`.

Final WebKit geometry checks use a copied candidate build at `output/reader-scene-preview-20261005/`, served separately on port 4199. This prevents concurrent builds from replacing the assets under verification. Passing automation and visual review do not replace physical-device or human assistive-technology evidence.

## Documentation updated

Design system, decision log, agent index and this report. Release notes unchanged because no release is requested.

## Decisions recorded

Reader collection scenes, 2026-10-05. Owner explicitly forbids pushing.

## Known limitations or remaining risks

Automated checks do not establish human screen-reader or physical-device compliance. Compact decoration is intentionally more subdued than desktop to preserve the reading space and theme foreground. No measured device-loading improvement is claimed.

## Out-of-scope findings

Other sessions added sidebar resizing and prayer-screen refinements during this task, including edits to the shared ReaderScreen. Their files and edits were preserved. The full quality gate's remaining PrayerActionsCard failures belong to that concurrent scope; no assertions, coverage thresholds or budgets were weakened here, and those components were not edited here. The verified frozen browser build certifies this task's scene and entry-tool changes, not later unrelated edits to the live checkout.

## Recommended next step

Owner visual review of the three scenes before any publication.

## Approved visual refinement follow-up — 2026-10-05

### Objective and scope completed

Apply the owner's accepted header refinements locally, retaining borderless compact controls, existing header geometry and the compact reading layout.

### Files and components changed

ReaderScreen and its stylesheet, ReaderSceneArt and its stylesheet, LayoutShells Header's optional back-button class, ReaderSceneArt units, and the new reader-header-refinement browser spec. Existing shared Header consumers retain their default button styling. No runtime dependency, content, persistence or network behavior changed.

### User-visible changes

Wide entry tools follow the reading measure. The skyline is smaller, its ground tapers to the edge, and night celestial detail sits above progress. Warm title/fill and neutral progress labels establish hierarchy. Wide toolbar actions share circular shape, size and interaction treatment; compact actions share foreground and interaction states with no permanent border. Compact artwork is quieter in light themes and legible in dark themes without increasing header space.

### Accessibility work and tests

Consistent 44px targets, keyboard menu activation/Escape focus return, visible focus rings, semantic foreground colors and decorative-only artwork. New browser checks cover both directions at 320/390/820/1440px in Chromium, Firefox and WebKit, including borderless compact controls, exact header geometry, tools alignment, celestial/progress clearance, overflow and axe scans. Header measurements remain 57px compact and 165.5px wide at ordinary text size; enlargement still permits accessible wrapping. Focus rings are deliberately visible and are distinct from permanent button borders.

### Commands run

| Command                                                          | Result                                                                                                                                                                                                                       |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focused ReaderSceneArt/LayoutShells units                        | Passed: 2 files, 10 tests, 44.47s.                                                                                                                                                                                           |
| `pnpm check`                                                     | Passed all stages in 429.5s: toolchain, typecheck, build, lint, audio manifest, type scale, motion, format, unit tests, bundle budgets and CSS utilities. This certifies that checkout snapshot; other agents remain active. |
| `pnpm exec vite build --outDir output/reader-refinement-preview` | Passed; isolated PWA preview generated, 180 precache entries.                                                                                                                                                                |
| Header refinement browser spec, three engines                    | Passed: 6 tests, 1.3 minutes. Initial run failed because its fixture rounded the existing 165.5px CSS height to 166px; fixture corrected to the fractional measurement without changing application geometry.                |
| Reader scene theme/fallback and entry-tools checks, Chromium     | Passed: 8 tests, 19.7s; all three themes, reduced transparency, forced colors, offline and consistent group/entry headers. Report: `output/reader-refinement-fallback-results.json`.                                         |
| Scoped Prettier and `git diff --check`                           | Passed.                                                                                                                                                                                                                      |

### Visual/manual evidence

Screenshots: `output/playwright/reader-header-refinement/{desktop-chromium,desktop-firefox-smoke,mobile-webkit-smoke}/`, both languages and four widths. Reviewed Arabic wide/320px night and English 390px light screenshots: restrained artwork, clear progress, tools below the header and intact reading layout. Isolated candidate preview: `output/reader-refinement-preview/`, port 4199. Browser report: `output/reader-refinement-results.json`.

### Documentation and decisions

Updated design system, decision log and this follow-up report. Owner explicitly requires local-only work and borderless mobile buttons. No commit, push, deployment or release-note rewrite.

### Remaining risks and out-of-scope findings

Other agents continue to modify the shared checkout. The passing check applies to the snapshot tested; their later edits require their own verification. Automated accessibility checks and screenshots do not establish physical-device or human assistive-technology compliance. Unrelated changes were preserved.

### Recommended next step

Owner review of the local header visuals, followed by combined verification when all agents finish and before any publication.
