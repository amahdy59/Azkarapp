# Phase Report — Qibla visual direction and Mushaf speed

## Objective

Make the Kaaba direction immediately understandable as a visual target on every supported screen, then reduce perceived Mushaf startup time without weakening offline behavior or competing with constrained connections.

## Scope completed

- Replaced the hidden mobile direction dial with one always-visible Kaaba direction visual.
- Kept the locally calculated north-relative bearing as the dependable fallback and applied live phone heading only after explicit permission.
- Kept North visually separate, held the Kaaba marker upright through rotation, and preserved textual bearing, cardinal, distance, and turn guidance.
- Updated the Kaaba WGS84 coordinate to the reference used by Google Qibla Finder.
- Warmed the Mushaf route, exact continuation page, and QCF font concurrently from the Quran Wird overview and direct Home continuation.
- Preserved in-flight deduplication, Cache Storage, offline fallback, and Data Saver/2G restraint.

## Files changed

- `src/app/qibla.ts`
- `src/app/screens/QiblaScreen.tsx` and focused tests
- `src/app/content/qcfMushaf.ts` and focused tests
- `src/app/App.tsx`
- Arabic and English localization
- Qibla/navigation and Mushaf Playwright coverage
- architecture, design-system, decision-log, and phase documentation

## Components added or modified

- Modified `QiblaScreen` and its existing inline dial.
- Added the awaitable `prepareMushafPage` content boundary and reused it through `prefetchMushafPage`.
- Modified the app-level lazy Mushaf loader to expose a shared high-intent warm-up path.

## User-visible changes

- Readers see where the Kaaba lies on the dial immediately instead of opening a live-compass disclosure first.
- Supported phones can turn that same visual into real-time guidance; unsupported or denied sensors leave the useful visual bearing intact.
- Opening the Mushaf after viewing today's Quran Wird normally reaches the exact saved page with its canonical font already requested.

## Accessibility work

- The visual direction has a localized text alternative including the numeric bearing.
- Bearing, distance, direction, and live turn remain available as text and are not communicated through colour alone.
- Sensor permission remains behind a named 44px action; status updates remain bounded polite regions.
- Calibration help remains keyboard-accessible in a native disclosure.

## Tests added or updated

- Qibla rendering, static fallback, absolute-heading rotation, upright Kaaba target, permission denial, and bilingual behavior.
- Mushaf page-and-font preparation and in-flight reuse.
- Browser verification that the saved page begins warming on the overview before Continue reading is activated.
- Responsive navigation/Qibla regression coverage.

## Commands run

| Command                                                       | Result                                                                                         |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Focused Vitest suites for Qibla and QCF Mushaf loading        | Pass: 22 tests.                                                                                |
| `pnpm typecheck`                                              | Pass.                                                                                          |
| Focused Playwright Qibla/navigation and Khatmah reader suites | Pass: 15 tests.                                                                                |
| Focused Mushaf overview warm-up browser regression            | Pass.                                                                                          |
| `pnpm install --frozen-lockfile`                              | Pass; workspace already current.                                                               |
| `pnpm check`                                                  | Pass: format, lint, typecheck, unit/coverage, build, audio, bundle, type-scale, and CSS gates. |
| `pnpm test:e2e`                                               | Pass: 389 passed, 1 skipped across desktop, mobile, tablet, Firefox, and WebKit projects.      |
| `pnpm build:pages`                                            | Pass; 166-entry PWA precache generated and bundle/CSS budgets held.                            |
| `pnpm audit:prod`                                             | Pass; no known production vulnerabilities.                                                     |
| `pnpm run check:release-notes`                                | Pass; bilingual release manifest describes this deployment.                                    |

## Visual/manual evidence

- Before/after mobile and desktop Qibla screenshots in `output/playwright/audit-phase60/`.
- Mobile Mushaf screenshot in the same evidence folder.
- Real physical-device compass calibration remains required before claiming sensor accuracy for a particular handset.

## Documentation updated

- `docs/ARCHITECTURE.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/agent/INDEX.md`
- `docs/agent/DECISION_LOG.md`
- This phase report

## Decisions recorded

- DEC-201 records one always-visible direction visual and high-intent Mushaf warm-up with constrained-network restraint.

## Known limitations or remaining risks

- Browser orientation APIs expose device headings, not guaranteed calibrated truth. Nearby metal, magnetic cases, and handset calibration can still affect readings.
- QCF page fonts remain remotely sourced on first use; repeat/offline reads use the existing Cache Storage copy. Bundling all 604 fonts would materially increase installation weight and was not justified.

## Out-of-scope findings

- No reviewed Qur'anic or devotional content changed.
- No dependency, router, state manager, or Mushaf layout contract changed.

## Recommended next step

Run a short physical-phone Qibla check outdoors and beside/away from magnetic interference, then compare the aligned direction with a trusted local reference.
