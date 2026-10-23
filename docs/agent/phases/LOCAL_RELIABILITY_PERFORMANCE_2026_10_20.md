# Local reliability and performance — 2026-10-20

## Objective and authority

The owner requests applying all five recommendations from the reliability/performance review locally. No commit, push or deployment. Preserve concurrent Progress, footer, reading and sharing work, reviewed devotional content and all storage/synchronization contracts.

## Inspection and plan before editing

1. Make preference recovery return a truthful result without deleting the full snapshot on parse/read/write failure. Keep recovery usable and announce failure without claiming success.
2. Reuse Quran glyph preparation within a single sharing generation; cancel compatibility work at asynchronous boundaries. Preserve exact layouts, progressive images and URL ownership.
3. Measure full-snapshot counter persistence with realistic history. Reuse normalized/serialized unchanged fields in a mount-owned writer while preserving synchronous writes, normalization and the existing single-key format. Invalidate on any other field or day change.
4. Measure startup with the existing throttled production browser flow. Remove duplicate snapshot hydration by passing startup's normalized snapshot into App; retain synchronous content/offline contracts unless evidence justifies a broader split.
5. Index daily-path records per input revision and evaluate each garden day once per calculation. Preserve policy versions, dates, calendar and missing-record semantics; coordinate narrowly with the concurrent Progress work.
6. Add recovery, cancellation, reload, equivalence and invalidation regressions. Run affected units/browser tests, pnpm check and Pages build, record measurements and limitations in this report. Keep gates and budgets intact.

## Objective

Apply all five recommendations locally and reconcile owner-approved combined integration failures. No commit, push or deployment.

## Scope completed

Preference recovery now commits before reporting success. Parse/read/quota failures retain the only saved snapshot and show bounded bilingual feedback. Sharing reuses exact Quran text/canonical-key preparation within each generation; compatibility honors cancellation before work, after fonts/glyphs and before layout. Sequential image generation, complete text and URL cleanup remain.

App separates stable snapshot fields from counters. A mount-owned writer reuses unchanged normalized/serialized fields, normalizes counters each time and synchronously writes the existing complete single-key snapshot. Changed field identities/shape/day invalidate reuse. Imports, merges and ordinary saveAppState retain full normalization. A boot-owned reader shares initial appearance/App normalization only while exact primary/legacy storage bytes and devotional day agree, including another tab writing while chunks load.

Home/Progress index daily-path inputs per record/policy revision; garden calculations judge each day once locally. Existing historical policies, missing observations and calendar semantics remain. No dependency, schema or reviewed-content changes.

## Files changed

- State/startup: main.tsx, App.tsx/composition test, state.ts, new stateReliability.test.ts, useAppStatePersistence.ts/test, AppErrorBoundary.tsx/test.
- Sharing/history: collectionShareCard.ts/test, CollectionShareModal.tsx, dailyPath.ts/test, progress.ts, HomeScreen.tsx and narrowly indexed judgments in concurrent ProgressScreen.tsx.
- Integration/build: periodNavigation/wirdGoal screen tests; formatting of four new dashboard tests and toolbar; preserved concurrent Progress lint/semantic corrections; fonts.css, reader-footer.css, ZikrComponents.css, vite.config.ts; new compact-build-manifest.ts/test and app-fonts.test.mjs.
- Evidence/documentation: new runtime-reliability.spec.ts; architecture, quality checklist, decision log, index and this report. Other concurrent changes remain owned by their phases.

## Components added or modified

Modify App composition and independent crash recovery; reuse sharing/Home/Progress components. No new product component or runtime dependency.

## User-visible changes

Safer failed recovery, reduced repeated counter/history/export work and reused boot hydration. Reading/count/history behavior remains; failed preference saves no longer reload as though successful.

## Accessibility work

Recovery announces failure through a bounded status and retains named native retry actions. Its bilingual copy follows the existing independent crash-path exception. Integration preserves named toolbar grouping and keyboard-scrollable table overflow with native semantics. Physical device/human assistive-technology certification is not claimed.

## Tests added or updated

Saved-byte preservation on recovery errors; successful preference-only reset; reader-cache byte/day/legacy invalidation; writer normalization equivalence, malformed partial/Masbaha fields, new/removed values, quota retry and mount isolation; deterministic proof count-only saves do not traverse history; indexed/individual historical policy equivalence and one verdict per garden day; exact-text/identity/request-scoped glyph reuse and cancellation around asynchronous work. Browser regression seeds 3,285 routine records and proves immediate counting/reload with blocked lifecycle handlers in both languages. Tooling checks lossless manifest compaction and exact retained pinned font coverage.

## Measurements

Fixture: 1,095 days/3,285 routine records and 336,115 serialized characters. Same Node/Vite harness: count-save processing averaged 8.813ms before and 0.011ms after; history summary averaged 128.679ms before and 24.990ms after. These isolate JavaScript with an in-memory storage stub; real browser storage/disk latency and physical-phone gains are not represented. Evidence: output/local-runtime-before.json, local-runtime-after.json and profile-local-runtime.mjs.

Six-times CPU/100ms latency/200kB/s production simulation observed Home at 11,622ms before and 8,102ms on the isolated candidate. Concurrent host load/evolving inputs prevent a controlled speedup claim. Optional audio/player chunks remained absent. Eager content/Baqarah remain synchronous under offline/content contracts; no speculative content split.

Pages candidate: 12,575,614 total bytes under 12,582,912; main CSS 164,788 raw/28,283 gzip; manifest 57,977 bytes. Unchanged budget passes with limited output headroom. Font coverage is compared against the pinned package.

## Commands run

| Command                                                                            | Result                                                                                                                                                                           |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Initial focused state/persistence/recovery/sharing/composition/path/progress units | 9 files / 196 passed in 45.91s.                                                                                                                                                  |
| Hydration follow-up                                                                | One fixture used 03:00 despite normalized default 00:00; corrected to actual midnight. Corrected state selection passed 11 cases, followed by an added Masbaha equivalence case. |
| Integration tooling/dashboard/state/old screen units                               | 51 passed / one obsolete full-month-name expectation. Corrected explicit abbreviated date labels; period navigation passed separately (1/1).                                     |
| Initial pnpm check                                                                 | 311 files/2,215 tests passed; seven old detail/tab expectations, concurrent lint/format and total/CSS budgets failed. output/local-reliability-check.log retained.               |
| Combined follow-up quality                                                         | Units/coverage, lint, types, content/build/budgets passed; only toolbar formatting failed. Corrected formatting.                                                                 |
| pnpm build:pages                                                                   | Exit 0, bundle and CSS utility checks passed. output/local-integration-pages.log.                                                                                                |
| Isolated Chromium browser selection                                                | 11 passed in 1.1m: offline core/ayah sharing, reload tally, sharing layout, Home path/keyboard/startup. output/local-reliability-isolated-browser.json.                          |
| Final quality and managed three-engine selection                                   | pnpm check passed in 439.2s; runtime 17/17, keyboard 6/6 and Custom WebKit 1/1 passed. Detailed logs below.                                                                      |

## Visual/manual evidence

Actual Arabic/English three-year-history Reader screenshots come from runtime-reliability.spec.ts. Arabic desktop capture opened and inspected: saved 3/100, complete devotional text, intact controls. Browser suites retain real shared-image/axe/focus evidence. Failed startup trace in output/local-reliability-failed-startup shows old hashed chunks disappearing during a concurrent shared-preview rebuild. Dedicated preview is used subsequently; standalone preview startup/lifetime failures are retained and not counted as passes. Managed-server setup required correcting the temporary config's working directory and Windows URL decoding.

## Documentation updated

Architecture records bounded cache ownership, sync saves and font/build delivery; quality checklist covers recovery/equivalence/cancellation/day/browser acceptance. Decision log/index/report record owner approval and renewed publication hold.

## Decisions recorded

Owner approves all five recommendations and combined integration repair, then explicitly reserves the combined push for themselves. No commit, push, deployment, release-note change, budget increase or content change.

## Known limitations or remaining risks

Writer reuse requires immutable application fields; external data must pass existing normalization/merge boundaries. Full localStorage writes retain synchronous browser cost. Measurements are not physical-phone guarantees. No full accessibility, exact-release CI or deployment claim. Concurrent edits mean evidence applies to tested candidates; future publication needs intact exact-snapshot gates.

## Out-of-scope findings

Native Android persistent-download storage and physical reminder/audio/Play acceptance remain separate documented work. No database/auth/prayer-calculation changes.

## Recommended next step

Finish other owner refinements, review on a physical phone and run combined exact-snapshot release gates when the owner is ready. Keep all work local.

## Owner-approved integration follow-up

Final verified results: `pnpm check` passed every stage in 439.2s (unit coverage 427.5s; formatting, lint, typecheck, build, audio/Quran/listening/owner-timing/type-scale/motion validators, unchanged bundle and CSS utility gates). Log: output/local-reliability-quality-complete.log. The earlier unused `fireEvent` import from the concurrent shared-dropdown test update was removed; focused lint passed before this complete passing run. No check was disabled, timeout raised or threshold/budget changed.

Progress browser verification: the initial dedicated integration selection had 15 passes/3 WebKit failures. Two were the genuine delayed-native-focus defect described below; all six corrected 320px/200% Arabic/English cases now pass across Chromium, Firefox and WebKit in 3.3m (output/local-progress-keyboard-browser.log). The third was a WebKit initial Loading timeout; rechecking that exact English Custom/export flow on the same fixed artifact passed in 55.0s, exit 0 in 1.2m (output/local-progress-custom-browser.log). Earlier header/custom/date/export cases remain covered by their 15 passes; all original failed cases now have passing follow-up evidence. The 17-case runtime selection separately passed across all three engines. No browser assertion was weakened or test budget increased.

The final `pnpm build:pages` passed with exit 0 after the keyboard repair, including unchanged bundle/CSS utility gates (output/local-reliability-pages-final.log). Final artifact: 12,577,905 bytes total, 58,116-byte manifest and main CSS 164,788 raw/28,280 gzip bytes. Documentation-only report completion follows the passing application gate; future combined publication still needs its exact-snapshot checks because the owner continues other work.

Further reproduced WebKit defect: at 320px/200% text, native focus scrolling could finish after React focus capture and cover the trend selector by 30–70px. Outer record controls now reuse the same one-frame, still-focused reconciliation already used inside the controls viewport. No scroll loop, pointer interception, changed viewport cap or weakened geometry assertion. A deterministic unit regression simulates late native scrolling and focus loss; all 10 screen cases pass. The focused keyboard browser cases are rerun against a fresh dedicated artifact.

Final runtime verification: the managed selection passed all 17 checks in 3.1m across Chromium, Firefox and WebKit, including three-year-history counter/reload in both languages, blocked lifecycle handlers, offline reading/sharing and startup. Log: output/local-runtime-managed-browser.log. Final focused integration units passed all 23 tests in five files in 12.77s (state, Quran completion, period navigation, font coverage and manifest preservation); output/local-integration-final-targeted.log.

The concurrent Progress refinement subsequently adopts the existing shared dropdown instead of native selects. A complete quality run caught one old native-value expectation while that test was being updated; the corrected shared-menu test passes. Preserve that approved refinement. Final quality and targeted reproductions are complete; exact passing results are recorded above.

After the complete gate found concurrent Progress failures, the owner explicitly requests repairing combined integration failures here. Correct lint/semantics, update superseded tab/always-mounted-detail expectations while retaining their behavioral assertions, and meet unchanged bundle ceilings. Remove the unused mathematical font supplement while retaining exact pinned Arabic/Latin/Latin-extension/symbol coverage and all Quran fonts. Compact only Vite build metadata whitespace, preserving every manifest field/hash/path. The owner reiterates that all changes must stay local and they will push the combined result themselves.

## Coordinated cold-import test correction — 2026-10-20

The owner authorizes coordination to avoid duplicate work. The Progress session's later combined coverage run found the first hydration test waiting on the lazy mocked Splash boundary (Loading), before navigation mounted. This was a test-boundary race during cold coverage transformation. Both hydration tests now await `vi.dynamicImportSettled()` within asynchronous `act` after render and before starting the unchanged DOM query timeout. Navigation selection, standalone/default hydration and exact loader-call assertions remain intact. No application code, timeout, coverage threshold or Progress implementation changes.

Focused verification: `pnpm test:run src/app/App.composition.test.tsx --coverage --coverage.reportsDirectory=output/hydration-boundary-coverage` passed all seven tests in 22.01s. The command exits 1 because selecting only one spec cannot satisfy the unchanged repository-wide state/progress/theme/garden/prayer/auth coverage thresholds; this is not reported as a passing complete gate. Formatting and scoped diff checks pass. The coordinating Progress session owns the full unit/coverage-stage rerun; no duplicate broad gate or publication is started here. Evidence: output/hydration-boundary-coverage.log and output/hydration-boundary-format.log.
