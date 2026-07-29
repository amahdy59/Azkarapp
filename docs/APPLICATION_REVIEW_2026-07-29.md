# Application review — 2026-07-29

## Executive summary

Azkarapp has a stronger baseline than a typical vibe-coded application. It uses strict TypeScript, automated formatting and linting, unit and browser tests, route-level lazy loading, a production bundle budget, PWA/offline support, semantic controls, RTL support, and documented architecture and design rules.

The application is not yet ready to claim full compliance with the supplied checklist. The main gaps are maintainability in several oversized modules, an initial bundle and CSS payload that are close to the configured ceilings, incomplete manual accessibility/device evidence, broad generated/scaffold code and dependency surface, and incomplete production observability and performance measurement.

### Review outcome

| Pillar                        | Status            | Summary                                                                                                                                                             |
| ----------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Architecture and organization | Partial           | Clear documented layers and typed boundaries, but several multi-responsibility files are too large and presentation contains derived-data logic.                    |
| Vibe-coding hygiene           | Partial to strong | Strong automated gates and AI review checklist; generated prototypes, unused UI scaffolding, dependency pruning, and coverage reporting still need attention.       |
| Performance and resilience    | Partial           | Lazy screens, PWA precache, local-first behavior, and budgets exist; the main bundle/CSS are large and there is no measured runtime/mobile performance record.      |
| Accessibility                 | Partial to strong | Automated axe, keyboard, touch-target, RTL, reduced-motion, and semantic coverage exist; screen-reader, 200% zoom, contrast, and real-device checks remain pending. |
| UX                            | Partial to strong | Core states, confirmations, responsive projects, RTL, and safe-area styling exist; manual edge-case evidence and production telemetry are incomplete.               |

## Change completed in this review

The monthly progress summary card containing “Longest Streak,” “Adherence,” and “Full Palms” (and its Arabic equivalents) was removed. Its unused calculations and translations were also removed. The month calendar remains unchanged.

A browser regression test now verifies, on desktop, mobile, and tablet Chromium projects, that the month calendar is visible and the removed metrics are absent.

## Implementation update

The following audit recommendations were applied after the initial review:

| Recommendation              | Applied result                                                                                                                                                  |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CSS/source pruning          | Tailwind now scans reachable application code and the eight active UI primitives. Production CSS fell from 179.82 KiB to 108.39 KiB.                            |
| Generated/scaffold cleanup  | Removed 85 unreachable generated prototype files, 40 unreachable UI scaffold files, and 37 unused direct runtime dependencies.                                  |
| Budget consistency          | Documentation and automation now agree on 450 KiB JS and 120 KiB CSS raw limits, plus per-file gzip limits and a manifest-derived 200 KiB initial-route limit.  |
| Route and feature splitting | Progress, Friday mode, progress sharing, and marketing are lazy chunks. The main entry fell from 439.46 KiB to approximately 398.56 KiB after observability.    |
| Render-path business logic  | Month/year completion aggregation moved to pure selectors with leap-year, deduplication, palm, and year-scoping tests.                                          |
| Account-client startup cost | Supabase client creation is a cached dynamic import and is not loaded for unconfigured guest startup.                                                           |
| Observability               | Added optional privacy-safe render/global error and CLS/INP/LCP/TTFB telemetry. Tests ensure payloads omit messages, stacks, content, identifiers, and queries. |
| Coverage enforcement        | CI now runs V8 coverage and enforces per-file/group thresholds for state, progress, theme, garden selectors, prayer calculation, and auth.                      |
| Browser compatibility       | Added Firefox desktop and WebKit mobile smoke projects; Chromium retains the complete desktop/mobile/tablet matrix.                                             |
| Remote history scaling      | Completion-ledger reads use keyset pagination; session uploads and reads are bounded to the newest 100; RLS/index/query-plan expectations are documented.       |
| Lint scope                  | Retained UI primitives are linted; obsolete exclusions for generated and UI source were removed.                                                                |

Still requiring external or manual evidence:

- NVDA/VoiceOver/TalkBack completion of the core flow, 200% zoom, physical iOS/Android safe areas, and device contrast checks.
- A configured `VITE_TELEMETRY_ENDPOINT` and production dashboard, if telemetry collection is desired.
- Production-sized Supabase `EXPLAIN (ANALYZE, BUFFERS)` output; the exact queries and expected indexes are documented in `ARCHITECTURE.md`.
- Product decisions on public search indexing and self-hosting web fonts.
- Further decomposition of `ReaderScreen`, notification settings, and share-card rendering as those areas are next modified.

## Priority findings

### P0 — release blockers

No P0 defect was found in the reviewed code or automated checks.

### P1 — address before a public production launch

1. **Complete the manual accessibility and device release record.**
   - `docs/QUALITY_CHECKLIST.md` correctly marks keyboard-only, screen-reader, 200% text zoom, contrast, responsive, RTL, safe-area, poor-connectivity, prayer/DST, mobile performance, and media checks as pending.
   - Automated axe checks are valuable but cannot establish real assistive-technology usability or layout behavior at maximum zoom.
   - Record dated evidence for NVDA or VoiceOver/TalkBack, 200% zoom, 320 px width, Arabic RTL, light/dark/high-contrast themes, iOS safe areas, Android, and offline recovery.

2. **Reduce initial JavaScript and CSS headroom.**
   - The production build generated a 438.98 KiB main JavaScript asset (122.57 KiB gzip), 179.82 KiB CSS (28.05 KiB gzip), a 141.74 KiB React vendor asset, and a 96.82 KiB motion asset.
   - The configured ceilings are 550 KiB JavaScript and 185 KiB CSS, leaving only about 20% and 3% uncompressed headroom respectively.
   - Split global CSS by actual feature usage, remove unused generated UI styles/components, and inspect the 438.98 KiB entry chunk with a bundle visualizer. Set a gzip budget and a total initial-route budget in addition to per-file uncompressed limits.

3. **Correct the budget source-of-truth mismatch.**
   - `docs/QUALITY_CHECKLIST.md` states a 140 KiB CSS ceiling, while `scripts/check-bundle-budget.mjs` enforces 185 KiB.
   - The current 179.82 KiB CSS build passes automation but exceeds the documented limit.
   - Choose the intended limit, make documentation and automation identical, and require justification for future increases.

4. **Add production error and performance observability.**
   - The app has a local error boundary and user-facing states, but the review found no production error reporting, Web Vitals collection, or release health dashboard.
   - Add privacy-conscious error capture and Core Web Vitals/interaction telemetry, with release/version tags and no zikr content or personal data in captured payloads.
   - Establish targets for LCP, INP, CLS, cold start, and offline startup on representative low/mid-range mobile devices.

### P2 — high-value maintainability improvements

5. **Split oversized multi-responsibility modules.**
   - `RoutineGarden.tsx` is about 1,096 lines and contains SVG marks, date parsing/formatting, day/week/month/year aggregation, four visualizations, milestones, and event notices.
   - `App.tsx` is about 925 lines and coordinates startup, navigation, state, authentication, synchronization, dialogs, and all screen routing.
   - `ReaderScreen.tsx` is about 721 lines; `NotificationsPanel.tsx` is about 575 lines; `zikrShareCard.ts` is about 890 lines.
   - Extract garden aggregation into tested selectors, split each period view into a component, move navigation to a reducer/router boundary, and separate share-card layout from drawing/export utilities.

6. **Move month/year aggregation out of render paths.**
   - `TodayRoutineGarden` constructs completion maps and month/year records during rendering.
   - Extract pure selectors such as `getMonthGardenView` and `getYearGardenView`, unit-test boundary cases (leap years, future dates, day-start offsets), and memoize only after profiling shows value.

7. **Prune generated prototypes, UI scaffolding, and dependencies.**
   - `src/imports` contains many generated screen prototypes and motion artifacts, while `src/app/components/ui` contains a broad component scaffold; both are excluded from ESLint.
   - The production package lists multiple UI ecosystems and many Radix packages while the active app imports only a small subset of the scaffold directly.
   - Identify reachable production files with an unused-code/dependency tool, delete or archive dead prototypes, lint retained generated code, and remove unused runtime packages. This reduces audit surface, install time, and accidental duplication.

8. **Centralize remaining visual literals.**
   - Core components still contain many arbitrary Tailwind sizes and direct color values, particularly `RoutineGarden.tsx`, `ReaderScreen.tsx`, and `NotificationsPanel.tsx`.
   - Promote recurring sizes, card treatments, status colors, and typography to semantic design tokens or shared primitives. Keep one-off geometry local only when it is truly unique.

9. **Add coverage reporting and minimums for critical logic.**
   - The suite has 85 passing unit tests and broad browser flows, but no coverage report or enforced thresholds.
   - Measure branch coverage for authentication merge/clear behavior, persistence migration, prayer calculations/timezones/DST, remote synchronization conflicts, and completion idempotency. Set thresholds for critical modules rather than chasing a misleading global percentage.

10. **Expand browser compatibility coverage.**
    - Playwright currently runs desktop, Pixel 7, and iPad-sized projects using Chromium.
    - Add at least WebKit mobile and Firefox desktop smoke projects for onboarding, reading/counting, settings, and offline/PWA-adjacent behavior. Retain Chromium for the full suite if CI time is constrained.

### P3 — polish and operational maturity

11. **Debounce or defer search only if profiling justifies it.**
    - Search filters the in-memory zikr collection on every keystroke. The current data size may make this acceptable.
    - Measure input responsiveness on a low-end mobile profile first; if needed, use `useDeferredValue`, normalized precomputed search fields, or a small debounce. Do not add complexity without evidence.

12. **Make swallowed failures intentional and observable where needed.**
    - Storage capability fallbacks reasonably use `catch` blocks, but the codebase has many silent catches.
    - Classify them: expected capability failures may remain quiet with explanatory comments; authentication, synchronization, sharing, notification, and calculation failures should return actionable UI states and optionally sanitized telemetry.

13. **Add explicit cache/invalidation documentation at remote boundaries.**
    - Supabase synchronization is local-first and tested, which is good. Document what is authoritative, when remote state is read, how conflicts merge, retry/backoff behavior, and how stale sessions are handled.
    - Bound history reads as completion data grows and verify indexes/query plans against realistic account histories.

14. **Review web-font privacy and offline typography behavior.**
    - Fonts are loaded from Google Fonts via CSS. The service worker can cache fetched font files after successful access, but first-run offline behavior and privacy policy implications should be explicit.
    - Consider self-hosting only the required subsets/weights and document fallback metrics to minimize layout shift.

15. **Add a public indexing decision to release configuration.**
    - `index.html` currently uses `robots: noindex, nofollow`.
    - Keep it for private/testing deployments; remove or make it environment-specific if the public app should be discoverable.

## Checklist mapping

### 1. Architecture and organization

**Met**

- A layer-based structure is documented in `README.md` and `docs/ARCHITECTURE.md`.
- Screens, reusable components, content, hooks, state, localization, and remote libraries have recognizable boundaries.
- Strict TypeScript provides typed props and function signatures.
- Naming is generally descriptive and component files generally match their primary exports.
- Setup, commands, architecture, persistence, testing, deployment, and maintenance are documented.

**Partial/open**

- Several files violate the “one module, one responsibility” intent.
- Derived calendar/progress business logic remains embedded in a presentation component.
- Generated prototypes and broad UI scaffolding increase duplication and comprehension risk.
- Arbitrary sizes/colors are still common despite a documented design system.

### 2. Vibe-coding-specific hygiene

**Met**

- Prettier, ESLint, React Hooks rules, JSX accessibility rules, strict type checking, unit tests, builds, and budgets run in CI.
- Pull requests explicitly ask whether work was AI-assisted and require generated code review.
- Runtime secrets use environment variables; the reviewed source did not contain a committed credential.
- Production dependency audit reported no known vulnerabilities on the review date (the registry returned temporary 503 retries before succeeding).
- Critical persistence, synchronization, prayer, progress, localization, share, and reminder logic has unit coverage.

**Partial/open**

- No coverage reporting or critical-module thresholds.
- Large generated/imported sections are excluded from linting and remain in the active source tree.
- Runtime dependencies and UI scaffolding need a reachability/usage audit and pruning.
- Small/frequent commit quality is a team workflow practice and cannot be proved from the current working tree review.

### 3. Performance and resilience

**Met**

- Major screens are lazy-loaded with React `lazy`/`Suspense`.
- Vite manual chunks isolate React and motion.
- A production build and per-asset budget run in CI.
- The app is a PWA with a generated service worker and a 36-entry precache (about 1.22 MiB in this build).
- Core reading/progress is local-first, and connectivity changes have an announced offline state.
- No evidence of N+1 remote calls was found in the reviewed synchronization boundary.
- Static raster app icons are appropriately small; most application imagery is SVG/code-native.

**Partial/open**

- CSS nearly reaches its configured ceiling and the main entry chunk remains substantial.
- No runtime profiling, Core Web Vitals, cold-start, battery/network, or React Profiler record exists.
- Search is synchronous on each keystroke; profile before deciding whether it needs deferral.
- Calendar views render a bounded month/year, but their aggregation should be moved and benchmarked.
- Remote-history growth, cache invalidation, and query-plan evidence need documentation.

### 4. Accessibility

**Met**

- Native buttons/inputs and landmarks are used; the app includes a skip link and main-content target.
- Focus styles and 44 px-class touch targets are encoded and browser-tested.
- Axe WCAG A/AA scans cover major flows.
- Color-independent state cues, live regions, reduced motion, RTL, narrow layouts, and safe-area CSS have automated coverage.
- Gestures in the reader have button/tap alternatives.

**Partial/open**

- Manual screen-reader, keyboard-only end-to-end, 200% zoom, and contrast-analyzer evidence is pending.
- Playwright coverage is Chromium-only, so Safari/WebKit accessibility/layout behavior is not established.
- Real iOS/Android safe-area and TalkBack/VoiceOver behavior is unverified.
- Media alternative requirements should be manually reviewed for every audio flow.

### 5. UX best practices

**Met**

- The app has reusable loading, empty, error, network, synchronization, confirmation, and completion patterns.
- Destructive/private-data actions use confirmation.
- Navigation labels, screen headings, responsive projects, RTL translations, and safe-area padding are present.
- Onboarding, guest/account paths, and empty search guidance exist.
- The design system documents consistent typography, icons, geometry, motion, responsive shell behavior, and reader feedback.

**Partial/open**

- Slow-network, denied-permission, sync conflict, notification failure, and first-run-offline flows need dated manual evidence.
- Production telemetry is needed to verify that user-facing errors are actionable in real conditions.
- Copy and hardcoded bilingual strings should continue moving into localization files as touched.

## Verification performed

The following passed after the implementation update on 2026-07-29:

- Prettier check
- ESLint with zero warnings
- Strict TypeScript check
- 18 unit-test files / 90 tests with enforced V8 coverage thresholds
- Production Vite build
- Raw, gzip, and manifest-derived initial-route bundle budgets
- Production dependency audit: no known vulnerabilities
- 111 application Playwright tests across desktop, mobile, and tablet Chromium
- Firefox desktop and WebKit mobile core-flow smoke tests
- Card-removal regression across the complete Chromium viewport matrix

`pnpm check` passed as an aggregate command. The first all-project browser invocation discovered an unrelated transient hidden `.wcag22-audit-temp.spec.ts`; all 111 legitimate Chromium cases passed while that scratch case failed. Playwright now ignores hidden and `*-temp.spec.ts` files so transient audit files cannot enter CI discovery. The Firefox and WebKit smoke projects passed separately.

## Recommended execution order

1. Complete and record the manual release checks.
2. Align the CSS budget documentation and automation.
3. Analyze and reduce the initial entry/CSS bundles; prune dead generated code and dependencies.
4. Split `RoutineGarden`, `App`, `ReaderScreen`, and share-card responsibilities.
5. Add production error/Web Vitals telemetry with privacy controls.
6. Add WebKit/Firefox smoke coverage and critical-module coverage thresholds.
7. Document remote cache/conflict/query behavior and validate it at realistic history sizes.
