# Phase Report — Surah entry clarity, local 2026-11-24

## Objective

Apply the owner's approved surah-entry design, typography and performance recommendations after review of the screenshot, dark/light concepts and actual bundled fonts. Keep the work local and preserve all concurrent changes.

## Scope completed

The shared Al-Kahf/As-Sajdah/Al-Mulk entry now uses interface typography, bounded landscape artwork and clearer action hierarchy. Bundled covers paint first; desktop detail is optional. Closed long-surah navigation defers its reading/glossary DOM. Canonical Mushaf, reviewed text/names/metadata, audio, completion, reading position, persistence and synchronization are unchanged.

## Files changed

- `src/app/screens/ReaderScreen.tsx` and `ReaderScreen.css`.
- `src/app/components/SurahArtwork.tsx` and new `SurahArtwork.test.tsx`.
- `src/app/screens/ReaderScreen.surah.test.tsx`.
- `e2e/surah-artwork.spec.ts` and `e2e/offline-core.spec.ts`.
- README, Architecture, Design System, Quality Checklist, agent index/decision log, this report and the approved phase brief. These documents already contain concurrent edits; only scoped additions were made.
- Ignored diagnostic builds, logs, reports, CPU profiles and screenshots under `output/`.

## Components added or modified

ReaderScreen composition and SurahArtwork changed. Shared Button, Header/menu primitives, icon exports, semantic theme colors and existing media-query hook were reused. No runtime dependency or new font was added.

## User-visible changes

- Exact existing surah names use Noto Sans Arabic 600: 28px on ordinary phone/tablet entry and 36px in the wide two-column layout, retaining rem-based text enlargement and wrapping.
- Theme foreground replaces the bright gold title. The cover is inset, rounded and 16:9; bounded portrait/wide measures retain comfortable space and native scrolling on short/enlarged windows.
- Share replaces appearance in the entry header. Actual reading retains its controls. Reading leads with a quieter theme-derived primary fill, listening uses the secondary outline treatment, and manual completion is a 44px ghost action.
- Single-surah entry omits redundant collection percentages/counts and shows recorded completion only. Multi-item collections retain their real progress and navigation.
- Local artwork no longer waits for a remote-first responsive candidate or a 2.5-second source-switch timer. Optional loaded desktop detail overlays the local cover without blanking it on stall/error. Missing named artwork falls back to the local generic cover.
- Closed long-surah collection navigation mounts on explicit opening; selection, expansion and scroll state remain owned by the screen, with keyboard focus recovery preserved.

## Accessibility work

Preserved native button semantics, disabled/audio-busy state, existing announcements and exact logical order. Retained 44px targets and visible focus, including keyboard focus on the entry scroll region. Browser checks cover RTL/LTR, 320px/200% text, phone/tablet/desktop, Glass/Solid/high-contrast, opaque reduced-transparency and forced-color menus, keyboard opening/closing and actual sharing focus return. Automated scans do not establish complete WCAG compliance. Physical Android and human TalkBack/VoiceOver acceptance remain pending.

## Tests added or updated

SurahArtwork units cover local-first phone delivery, pending/failed/successful desktop detail and named/generic fallback. Reader tests cover single-surah status/header, real multi-item progress and deferred navigator opening, alongside existing page-resume/completion/audio/Mushaf parity regressions. Browser assertions now reflect the approved type/geometry while retaining fit, ordering, navigation and reading checks. New checks cover exact unchanged names, action semantics, theme accessibility, enlarged opaque menus and actual navigator focus recovery. The real install-cache offline test now opens Al-Kahf and its own artwork for the first time while offline.

The first engine run reported an exact 44px CSS target as 43.999996px in Firefox. Target measurement now rounds to 1/1000 CSS px while retaining the 44px threshold in both dimensions; the exact failed case passed on confirmation. No product threshold, coverage, inventory or assertion was removed.

## Commands run

| Command                                                                                                 | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm typecheck`                                                                                        | Exit 0.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Targeted ESLint for changed source/unit/browser files                                                   | Exit 0.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Targeted Prettier and `git diff --check`                                                                | Exit 0.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `pnpm test:run` with SurahArtwork, ReaderScreen.surah, ReaderScreen.audio and ReaderScreen.mushafParity | 4 files / 84 tests passed. First sandbox-only attempt could not rename temporary transform files; rerun with a writable task-local temp directory executed normally.                                                                                                                                                                                                                                                                                                                                                                                                                |
| `pnpm test:e2e e2e/surah-artwork.spec.ts --project=desktop-chromium`                                    | 14 passed. `output/surah-entry-chromium.log` and `.json`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Same feature spec in Firefox and WebKit                                                                 | 27 passed; one Firefox floating-point failure described above. `output/surah-entry-engines.log` and `.json`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Exact Firefox `320px in ar` confirmation                                                                | 1 passed. `output/surah-entry-firefox-confirmed.log` and `.json`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Chromium affected reader/header/panel/sharing/offline/new-menu/new-navigator selection                  | 11 passed. `output/surah-entry-regressions.log` and `.json`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Controlled production-build comparison                                                                  | Exit 0; 12 samples (three alternating before/after phone and desktop pairs). `output/playwright/surah-review-2026-11-24/comparison.json`, `cpu-before-desktop.json`, `cpu-after-desktop.json`.                                                                                                                                                                                                                                                                                                                                                                                      |
| `pnpm check:serial`                                                                                     | Exit 1 in 271.3s: toolchain, full units/coverage, build, typecheck, audio/Quran/listening/owner timing checks, type scale, motion and CSS utilities passed. Lint failed with 76 errors in unrelated source-review/scratch scripts. Formatting flagged 23 files, including this then-unformatted new report; the report was subsequently formatted and checked independently. Bundle budget failed: 12,593,802 total bytes vs 12,582,912 ceiling and initialRouteGzip 189,053 vs recorded 185,270 (2.0% growth). `output/surah-entry-check.log`. No ceiling or baseline was changed. |
| Saved before/after build budget diagnostics                                                             | Both exit 1 at the unchanged total-output ceiling: before 12,588,482 bytes; after 12,596,905. The independently evolving shared checkout means this difference includes concurrent edits. `output/surah-entry-baseline-budget.log`, `output/surah-entry-after-budget.log`.                                                                                                                                                                                                                                                                                                          |
| `pnpm test:e2e:fast`                                                                                    | 27 passed, 1 failed in 1.3m. The failing Settings case expected the old Location & Prayer Times heading while concurrent prayer-settings work rendered Prayer times & location. Its independently updated assertion was confirmed with the exact launch-critical case: 1 passed. Both the original failure and confirmation remain in `output/surah-entry-core-smoke.log`/`.json` and `output/surah-entry-smoke-heading-confirmed.log`/`.json`. This is not represented as a single passing whole-suite run.                                                                        |
| `pnpm build:pages`                                                                                      | Vite/PWA artifact generation succeeded; command exit 1 at the unchanged bundle gate: 12,590,737 total bytes vs 12,582,912 ceiling (7,825 over); initialRouteGzip 189,082 vs recorded 185,270 (2.1% growth). `output/surah-entry-pages.log`.                                                                                                                                                                                                                                                                                                                                         |
| `pnpm test:e2e:inventory`                                                                               | Exit 0; all 3,535 cases accounted for across the nine CI shards. `output/surah-entry-inventory.log`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Final scoped formatting/lint and diff check                                                             | Targeted Prettier and ESLint passed for this phase's changed source, tests and documentation; `git diff --check` passed. This does not replace the red repository-wide gates.                                                                                                                                                                                                                                                                                                                                                                                                       |

The successful feature evidence comprises 84 targeted units and 53 distinct browser cases across the focused runs. The initial failed engine batch is retained separately and is not described as an entirely passing run. Tests use Node 24.15.0, pnpm 11.19.0 and repository-pinned browser engines; browser traffic uses the isolated test backend.

## Visual/manual evidence

Actual rendered entry/theme screenshots are in `test-results/surah-artwork-*` and `output/surah-entry-engine-artifacts`. Enlarged opaque/forced-color menus, first-offline entry and unaffected reader screenshots are in `output/surah-entry-regression-artifacts`. Controlled comparison evidence is under `output/playwright/surah-review-2026-11-24/`. The earlier AI concept board is a proposal, not evidence of implemented UI.

Final Arabic dark/Glass, light/Solid and desktop screenshots were captured from the generated Pages artifact and visually inspected: `output/playwright/surah-review-2026-11-24/final-arabic-dark.png`, `final-arabic-light.png`, `final-arabic-desktop.png` and the side-by-side `applied-dark-light.png`. Production APIs and external artwork were blocked during these captures to verify the bundled dependency path. Phone and wide screenshots were visually inspected. Physical-device, human screen-reader and field performance acceptance have not been executed in this phase.

## Controlled performance evidence

The pre-change build was captured before editing the surah source. The candidate build includes this feature and concurrent shared-checkout edits. Each variant received three alternating cold samples at four-times CPU slowdown, 100ms network latency and 200kB/s down, with HTTP/service-worker caches disabled, an isolated guest, production APIs blocked and the hosted cover deliberately left pending. Treat these as a loading-failure diagnosis on one desktop machine, not an isolated whole-app speedup, field percentile or physical Android result.

| Measurement                                      | Before   | After                |
| ------------------------------------------------ | -------- | -------------------- |
| Phone median Read-button observation             | 7,687ms  | 7,196ms              |
| Phone median complete-cover observation          | 10,272ms | 7,400ms              |
| Phone median gap between Read and complete cover | 2,585ms  | 204ms                |
| Phone hosted-cover requests per sample           | 1        | 0                    |
| Desktop closed-entry DOM nodes                   | 3,185    | 237                  |
| Desktop median Read-button observation           | 8,968ms  | 8,921ms              |
| Desktop median complete-cover observation        | 11,218ms | 9,087ms              |
| Phone/desktop observed CLS after the change      | —        | 0 in all six samples |

The direct improvements are removal of the remote-cover wait/blank source switch and approximately 93% fewer DOM nodes on the closed desktop entry. Initial availability remains slow under these conditions. Desktop CPU profiles retain application/audio initialization, garbage-collection and route work; there is no demonstrated general cold-start/INP pass. Optimize that broader startup path only through a separately profiled, contract-preserving phase. Three lab samples cannot establish field p75.

## Documentation updated

The approved phase, decision log, README, Architecture, Design System and Quality Checklist record the new title/header/status, artwork delivery and deferred-navigation contracts. Earlier entry-specific instructions are explicitly superseded; reviewed religious content contracts are unchanged.

## Decisions recorded

Owner: “apply recommendations”. The current publication hold remains. No commit, push, deployment or release-note rewrite.

## Known limitations or remaining risks

- The complete quality gate is red; targeted passes and passing full units are not a release pass. The total-output budget was already exceeded by the saved pre-change build, and the final shared snapshot also exceeds initial-route growth. No unrelated cleanup, threshold increase or baseline update was used to obtain green results.
- This is a mixed checkout with independent Qibla, Downloads, Home, prayer-settings and source-review changes. Existing consolidation findings are not repaired by changing unrelated files or weakening gates.
- Optional desktop detail requires connectivity; the local cover remains available when it is absent. Small phone covers deliberately use the existing bundled resolution.
- No perfect-performance, physical Android or complete-accessibility claim is made.

## Out-of-scope findings

The prior downloads report recorded source-review lint/format failures, CategoryScreen/Mushaf suite timing failures and total-output-budget overage. This phase's fresh complete unit/coverage stage passed; its fresh lint/format and budget results remain red as detailed above. Concurrent prayer-settings changes also updated a Settings smoke heading between the broad run and exact-case confirmation. Preserve these snapshot distinctions. No budget ceiling or baseline is changed in this phase.

## Recommended next step

Owner visual review and real Android/TalkBack acceptance. Resolve shared consolidation findings and perform the intact release cycle only in the separate owner-selected final-release chat.
