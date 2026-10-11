# Phase Report — Settings and downloads simplification

## Objective

Apply the owner's approved three-category download and compact Settings recommendations locally. No commit, push, deployment, or release-note change.

## Plan before editing

1. Preserve the pending Reader/audio/translation work and existing service, persistence and content boundaries.
2. Replace overlapping essentials/individual choices with Adhkar & duas, Kahf & Baqarah recitations, and Mushaf pages. Group all available approved adhkar recordings, deduplicate through the existing downloader, and disclose individual management and diagnostics on demand.
3. Present seven main Settings destinations and a quieter support group. Move appearance/language/calendar controls into their own panel; group prayer and reminder navigation while preserving existing links; connect audio to downloads.
4. Add one live reading preview, simplify repetitive control cards, and disclose advanced prayer controls. Retain native semantics, visible focus, 44px targets, direction and recovery.
5. Update meaningful unit/browser regressions; run targeted tests, complete quality gates, and responsive visual/accessibility evidence. Record exact results and any unrelated failures.

## Scope completed

Implemented the approved local redesign in the owner's checkout. Verification uses an isolated copy of the working files, sharing the installed dependency graph but using separate build, browser-results and coverage directories. Other pending Reader/audio/translation changes are preserved. No commit, push, deployment or release-note change was performed.

## Files changed

- `src/app/screens/settings/`: new Appearance and Prayer overview panels; updated root, screen composition, panel exports, Downloads, Audio, Reading, Notifications and Prayer Location.
- `src/app/components/OfflineResourceRow.tsx` and `SettingsRow.tsx`: compact resource presentation, disclosed management and current-value descriptions.
- `src/app/routing.ts`, Arabic/English i18n dictionaries and affected unit tests.
- New `e2e/settings-simplification.spec.ts`; updated Settings, navigation, downloads, accessibility, control-alignment, narrow-layout, manual-checklist and practical-devotional-access browser assertions.
- Architecture, design system, audio offline-caching contract, agent index and decision log. No release notes or deployment changes.

## Components added or modified

Added `AppearancePanel` and `PrayerSettingsPanel`. Modified the Settings composition/root, shared Settings/resource rows and the six affected detail panels. Existing controls, download services, icons, semantic tokens and confirmation dialog are reused.

## User-visible changes

- Exactly three primary download cards: Adhkar & duas, Kahf & Baqarah recitations, and Mushaf pages. The Adhkar card includes complete daily collections and other available approved recordings; text remains included without a download.
- Short state/size/action presentation; no idle progress bars. Active downloads retain cancel even when management is collapsed. Partial downloads resume and failures offer retry.
- Individual downloads/removal and diagnostics are inside native disclosures. Removal retains confirmation and preserves unrelated resources.
- Seven main Settings categories and four quieter support links. Appearance, language and calendar controls have their own panel. Prayer/reminders have an overview; Audio leads to Downloads. Existing direct links remain supported.
- Reading has compact selectors and one live preview. Advanced prayer adjustments and detailed reminder explanations are disclosed on demand.

## Accessibility work

Preserved native buttons, radios, switches, progress/status and confirmation semantics. Disclosures support keyboard activation; controls retain visible focus and 44px targets. Application direction reaches the new panels and download dialogs. Back restores the originating Settings row after the compact panel mounts. New browser coverage checks RTL/LTR, narrow screens, 200% text, containment, target sizes and axe results; this does not constitute a complete assistive-technology audit.

## Tests added or updated

New Appearance, Prayer overview and Reading preview unit tests. Downloads regressions cover grouped collection scope, independent management, cancellation while collapsed, retry, verified completion, quota/storage errors and confirmed Mushaf removal. Root navigation/search, prayer advanced controls and routing tests follow the new structure. Existing browser assertions retain their original behavioral checks through the new destinations.

## Commands run

The installed graph was reused through a directory junction. Commands in that copy use `pnpm --config.verify-deps-before-run=false` to prevent pnpm from attempting to replace the shared installed directory; toolchain verification still runs and no test, coverage or budget threshold changes. No receipt is copied to the owner's checkout.

| Command                                                                                 | Result                                                                                                                                                                                                                                                |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Targeted unit tests (initial)                                                           | PASS: 7 files, 35 tests.                                                                                                                                                                                                                              |
| `pnpm … check` (first complete run)                                                     | Full unit suite with coverage, typecheck, lint, build, audio/content/timing validators, motion/type-scale checks, bundle and CSS budgets passed. Format failed on the copied resource row; corrected by copying its formatted source. Overall exit 1. |
| `pnpm … check` (second run)                                                             | 236 test files and 1683 tests passed; one unrelated `scripts/quality-receipt.test.mjs` cleanup hook exceeded its existing 10s limit. Format reported the copied decision log. Other stages passed. Overall exit 1; no timeout/threshold relaxed.      |
| `pnpm … exec vitest run` — Settings, Downloads, routing and quality-receipt regressions | PASS: 8 files, 51 tests after the final resource-row layout adjustment. The tooling cleanup timeout did not recur in this focused run.                                                                                                                |
| `pnpm … build:pages`                                                                    | PASS: Pages build, PWA generation, bundle budget and CSS utilities.                                                                                                                                                                                   |
| `vite build --outDir .playwright-dist`                                                  | PASS; rebuilt after the final full-width description adjustment.                                                                                                                                                                                      |
| Targeted browser suite: Settings, Downloads, navigation, accessibility (Chromium)       | 47 passed, one obsolete accessibility-heading assertion failed. Corrected to the actual panel heading; isolated rerun passed (1/1). All new layout scenarios passed.                                                                                  |
| New Settings layout spec, Firefox + WebKit                                              | Firefox 4/4 passed; WebKit 3/4 passed. English 1440px scenario exceeded the existing 90s test limit while clicking `settings-sub-downloads` (line 49), before downloads assertions. Trace retained; no test timeout increased.                        |
| Complete `pnpm … test:e2e`                                                              | Started the existing 1024-test matrix; stopped after the unrelated Reader rail-boundary player failure and obsolete heading assertion appeared. Full-suite success is **not** claimed.                                                                |
| `git diff --check` for affected source and browser files                                | PASS.                                                                                                                                                                                                                                                 |

Final validation after the full-width description adjustment: all 4 Chromium layout scenarios passed (34.4s); targeted ESLint and Prettier passed. Final screenshots and browser JSON reports are copied into the owner's `output/` directory. No quality receipt is transferred.

## Visual/manual evidence

Responsive Settings, Reading and three-category Downloads screenshots are saved in `output/playwright/settings-simplification/`, with Arabic 390px, English 1440px, Arabic 320px at 200%, and English 390px at 200%. Reviewed Arabic root/downloads and English enlarged-text screenshots. The final adjustment allows descriptions the full card width and wraps the size below the title when enlarged text needs it. Keyboard disclosure, containment, visible target size and automated accessibility checks are exercised in the same spec. This evidence does not replace physical-device or screen-reader review.

## Documentation updated

The design-system and offline-caching contracts now describe the three groups and disclosed management. Architecture records the navigation ownership. The index and decision log record owner approval and the local-only scope.

## Decisions recorded

Owner approval supersedes the visible essentials bundle and independent top-level daily resource controls from the 2026-10-10 downloads phase. Independent controls remain in management. Prayer calculation and reminders remain separate services/destinations beneath one navigation group. No reviewed text, audio approval, cache format, progress, synchronization, or dependencies change.

## Known limitations or remaining risks

Only approved available recordings are included; coverage is not expanded by this design change. Browser storage estimates and persistence depend on browser support. Physical-device and screen-reader review remains a separate release check. This work is local and has not been committed, pushed or deployed. A clean combined full quality/browser run is still required before release: the full browser matrix and WebKit desktop-width timeout are not resolved by this phase.

## Out-of-scope findings

The shared checkout contains concurrent Reader/audio/translation work. Verification uses a file snapshot to avoid sharing mutable browser build/results directories with other active runs. No unrelated refactor is included in this phase.

- `e2e/audio-expanded-layout.spec.ts`, rail-boundary (900px, Arabic): no `region` named `مشغل الصوت` appeared after activating the reader dock; the expected compact-player assertion failed. This is outside the Settings phase and belongs to combined Reader/audio verification.
- `scripts/quality-receipt.test.mjs`, `dependencies and build environment are part of the snapshot`: existing `afterEach` cleanup timed out in the broad concurrent run; all seven tooling regressions passed on the focused rerun.
- Shared-file overlap: Arabic/English dictionaries, Architecture, Design System, decision log, index and browser navigation/accessibility assertions. Later dictionary additions for Qur'an font attribution are outside this phase and were preserved. The Settings and Downloads production files match the verification copy; the dictionary difference is only the later attribution copy.

## Recommended next step

Owner review of the local pages and screenshots. Finish the other working sessions, rerun the complete quality/browser matrix on the combined settled checkout, and resolve the identified Reader/WebKit failures before any later push. No additional broad run is started by this phase.
