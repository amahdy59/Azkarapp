# Phase Report — Books and expanded listening, local 2026-11-27

## Objective

Repair book extraction/rendering defects, improve responsive reading and expanded listening, apply consistent header/footer spacing globally, and extend explicitly estimated exact-recording word following. The owner authorized starting immediately while keeping publication held. No commit, push, deployment or release-note change was made.

## Scope completed

- Inspected all 233 available native source sections and the available original Al-Mukhtar/Wird PDFs. Applied source-confirmed corrections through fingerprinted ledgers, rebuilt matching exports/packs and preserved earlier immutable assets.
- Added verified cached-edition recovery so a newly addressed book pack does not strand its offline readers. Resource/unit/bookmark/position identities remain intact.
- Replaced permanent competing player columns with one centered reading/transport axis. Non-Quran settings dock only on request when space permits; Quran settings overlay without moving or shrinking its normal page.
- Implemented responsive book defaults, opaque theme-aware reading surfaces, clearer paragraph/reference hierarchy and shared global chrome spacing.
- Added 92 estimated timing candidates for 80 exact recordings, retaining the earlier 276 candidates/234 recordings. Uncertain/uncovered intervals remain unhighlighted.
- Completed the aggregate gate, Pages build, affected production-preview browser coverage and artifact verification. Preserved independent inline-reader, release-test and Learn-authoring changes in the shared checkout.

## Files changed

Phase-owned files are grouped below. The shared checkout also contains independent changes attributed in their own reports.

- Source/export authoring: `docs/external-sources/book-content.mjs`, `generate_book1_al_mukhtar.mjs`, `generate_book3_al_wird_an_nabawi.mjs`, `book-source-corrections.json`, `mukhtar-extraction-corrections.json`, `mukhtar-quran-corrections.json`, and six matching HTML/PDF pairs under `book1_al_mukhtar/` and `book3_al_wird_an_nabawi/`.
- Native books: `scripts/pack-learning-books.mjs`, `src/app/learning/{catalogue.json,types.ts,learningAssets.ts,learningAssets.test.ts}`, eight new content-addressed assets under `docs/learning/assets/`, `LearningContents.tsx`, `LearningOfflineActions.tsx`, `LearningReaderScreen.tsx`, `learn.css`, and `i18n/learning.ts`.
- Source assertions: `scripts/{book-source-corrections.test.mjs,devotional-documents.test.mjs,learning-books.test.mjs,english-book-editions.mjs,english-book-editions.test.mjs}` and `docs/learning/english-wird-source-overrides.json`.
- Player: `AudioOptionsSurface.tsx` and its new test, `FloatingAudioPlayer.tsx` and its test, `AudioPlayerSurface.tsx`, `floating-audio-player.css`, and `ReaderScreen.tsx`. Coordinated canonical Quran edits in shared files are preserved.
- Global spacing: `src/styles/theme/{tokens.css,layout.css}`, `layout-shells.css`, `reading-header-surface.css`, `mushaf-reading-chrome.css`, `masbaha.css`, `LayoutShells.tsx`, `HomeScreen.tsx` and its assertion, `AzkarLibraryScreen.css`, and `FridaySalawatScreen.tsx`.
- Timing authoring/runtime: `scripts/{align-listening-audio.py,test-listening-alignment.py,listening-alignment-inputs.mjs,listening-alignment-inputs.test.mjs,pack-additional-timing-previews.mjs,pack-additional-timing-previews.test.mjs,validate-owner-timing-previews.mjs}`, `src/app/audio/{listeningTimingLoader.ts,ownerTimingLoader.ts,ownerTimingLoader.test.ts,ownerTimingPreviews.ts,ownerTimingPartitions.json}`, and one optional binary under `docs/audio/timing-assets/`.
- Optional delivery: `scripts/learning-assets-plugin.ts`, its new test and `vite.config.ts`.
- Browser regressions: `e2e/{books-audio-responsive.spec.ts,additional-timing-follow.spec.ts,audio-expanded-layout.spec.ts,learning-library.spec.ts}`. Independent audio-options helpers/tests remain intact.
- Documentation and selected actual-output evidence listed below.

## Components added or modified

`AudioOptionsSurface` reuses one options body as a named non-modal desktop region or protected anchored popup. Its trigger stays mounted, controls the actual region, and retains focus through Escape, nested choices and resize/remount recovery. Sidebar triggers do not falsely announce a dialog. Nested choices keep the shared portalled, opaque dropdown contract.

The reader uses a stable theme-aware canvas and shared chrome. Earlier-edition recovery stays inside the existing asset checksum/normalization boundary; visual components do not call storage or raw services.

## User-visible changes

- The player opens centered. Options appear on request; Quran keeps the normal reading canvas, font parity and unchanged geometry when settings open.
- Shared edge rhythm is 12px compact, 16px medium, 20px desktop and 8px short landscape, with designated safe-area ownership preserved. Home, ordinary/Library/Settings and devotional chrome, Learn, expanded audio, navigation and Mushaf bands share it.
- Default phone Arabic book text is 18px, rising to 20px in wider reading containers; English is 16px/18px. Preferences remain rem-based. Phones reclaim nested card gutters; the opaque canvas follows the selected theme, including Glass.
- Paragraphs, quotations, attribution, glossary and references have clearer spacing. Contents search shows nearby matching text; source page numbers remain together.
- All 207 original numbered Al-Mukhtar entries are separately present. It has 48 restored source-bound Quran excerpts in total, plus a ledger of 2,314 extraction-token repairs across 53 source pages. The ledger count does not mean every corrected token appears in the rendered adaptation. Wird restores source-confirmed narrator/travel/glossary continuity. Review-copy notices remain.
- A known saved earlier edition opens offline if the latest cannot load, after its original bytes/schema validate. A bilingual notice identifies it; its status differs from the latest edition being saved. Explicit removal clears both versions while retaining bookmarks/positions.
- 80 additional recordings support clearly labelled estimated following. Exact recording/variant data loads on demand. Uncertain intervals remain blank. No book narration was added.

## Accessibility work

Preserved semantic direction/keyboard order, visible focus, 44px ordinary targets, protected opaque menus, 320px/200% reflow, reduced motion and one playback controller. Added correct sidebar/popup associations, Escape/nested-menu/resize recovery and focused earlier-edition status announcements. Geometry, hit-testing, axe and keyboard/focus checks passed in selected flows. Physical-device assistive technology testing and complete WCAG conformance are not claimed.

## Tests added or updated

Source tests cover original fingerprints, exact token slices, all numbered boundaries, canonical ranges, mixed prose/Quran, reference digit order, complete travel continuity, immutable assets and preserved English draft bindings. Offline tests cover verified recovery, rejection, cancellation and removal.

Timing tests cover exact registration/bytes, aliases, coordinates, partition loading, checksums, omissions and bounded delivery. Browser following uses real timing bytes/DOM with a controlled media clock; it is not independent acoustic listening review.

Browser tests cover requested options, centering, narrow/enlarged controls, RTL/LTR, phone/tablet/desktop, material/accessibility fallbacks, menu stacking/hit-testing, recovery, mobile text defaults, global spacing, offline upgrades and PDFs. The coordinated reader chat independently verifies canonical normal-reader font parity.

## Commands run

Node 24.15.0 / pnpm 11.19.0. No runtime dependency, coverage threshold, bundle ceiling or assertion was weakened.

| Command                                                                                                                                                                                      | Result                                                                                                                                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `CHECK_VERBOSE=1 pnpm check` (PowerShell environment assignment)                                                                                                                             | **PASS**, 121.8s. 402 files/2,835 tests, enforced coverage, content/audio/timing, types, zero-warning lint, formatting, type scale, motion and bundle/CSS checks. Statements 79.93%, branches 76.79%, functions 77%, lines 81.91%. `aggregate-check-verified.log`. |
| `pnpm build:pages`                                                                                                                                                                           | **PASS**, exit 0 on final application source. Startup HTML/CSS/JS 534,997 gzip bytes; 325 precache entries/7,297.92 KiB. Existing budgets pass. `pages-build-verified.log`.                                                                                        |
| `pnpm audit:prod`                                                                                                                                                                            | **PASS**, no known vulnerabilities. No dependencies changed afterward. `audit-prod.log`.                                                                                                                                                                           |
| `node docs/external-sources/verify-books.mjs`                                                                                                                                                | **PASS**, nine Arabic HTML editions/72 responsive cases, axe, print bounds, controls and contents. `standalone-books.log`.                                                                                                                                         |
| Bundled Python `docs/external-sources/verify-book-pdfs.py`                                                                                                                                   | **PASS**, nine saved PDFs. Each Mukhtar: 78 pages/24 bookmarks/96 resolved links; Umrah: 18/40/33; Wird: 138/99/177. `saved-pdfs.log`.                                                                                                                             |
| Native section audit before/after rebuilding source                                                                                                                                          | **PASS**, all 233 available sections, no horizontal overflow/broken images. `native-book-baseline.json`, `native-book-after.json`. Final CSS also covered below.                                                                                                   |
| `node scripts/validate-owner-timing-previews.mjs`                                                                                                                                            | **PASS**, earlier 276 candidates/234 recordings/88,527 compressed bytes plus 92/80/12,663. `timing-validation-final.log`.                                                                                                                                          |
| Python `scripts/test-listening-alignment.py`                                                                                                                                                 | **PASS**, three authoring tests.                                                                                                                                                                                                                                   |
| Targeted Vitest: source remediation, optional assets, offline upgrade, final controller association                                                                                          | **PASS**, respectively 44/5/19/48 tests; all included again in the aggregate gate. Corresponding `*-units.log` files retained.                                                                                                                                     |
| `pnpm exec playwright test e2e/audio-expanded-layout.spec.ts e2e/audio-options-library.spec.ts --project=desktop-chromium --project=desktop-firefox-smoke --project=mobile-webkit-smoke`     | **PASS**, 68/68, 7.3m. `final-player-browsers.log/json`.                                                                                                                                                                                                           |
| `pnpm exec playwright test e2e/books-audio-responsive.spec.ts e2e/additional-timing-follow.spec.ts --project=desktop-chromium --project=desktop-firefox-smoke --project=mobile-webkit-smoke` | **PASS**, 15/15, 1.5m, final application source including ARIA association. `control-association-browsers.log/json`.                                                                                                                                               |
| `e2e/learning-library.spec.ts`, same three projects in the focused production-preview run                                                                                                    | **PASS**, 21/21, including cold offline reopening, previous-edition recovery, removal, bookmarks, PDFs and themes. This run had 33 passing book cases/three timing-fixture failures; see remediation below.                                                        |
| Coordinated `e2e/quran-inline-player.spec.ts` canonical player subset                                                                                                                        | **PASS**, 6/6 at 390/1440 across Chromium/Firefox/WebKit: normal-reader font >=95%, exact center, no page movement opening options, ordinary control no-scroll, targets, axe/focus. `output/quran-universal-player-final-results.json`.                            |
| `git diff --check` and scoped Prettier after report finalization                                                                                                                             | **PASS**; final documentation check retained with local evidence.                                                                                                                                                                                                  |

Except for the coordinated reader output, logs above are under `output/books-audio-review-20261127/`. Browser commands used `E2E_BASE_URL=http://127.0.0.1:5193` with an isolated production preview/output. The inventory covers 104 distinct affected browser cases across three engines, plus six coordinated canonical cases; repeated intermediate passes are not added to the count. Full local `pnpm test:e2e` and CI were not run: this is a local phase, and release policy reserves the complete matrix for exact-commit CI unless diagnosis requires it.

Failures are retained honestly. The first aggregate failed four legacy source/spacing expectations, formatting and an output overage of 2,366 bytes. Exact restored-source/shared-spacing assertions and formatting were repaired; the optional timing pack moved outside installation output without raising limits. The second aggregate passed every stage except four test-only unqualified `fetch` lint errors, corrected to `globalThis.fetch`. The third complete gate passed. Early dev-server offline failures were superseded by a production preview. That preview exposed transparent Glass book canvas and unstable selector frames, both repaired without dropping checks. A later timing test selected the wrong visible reciter; its fixture was corrected, all three engines passed, then the final 15-case run passed again.

## Visual/manual evidence

The complete gate preceded only final report/index/checkpoint edits. Those documentation files received scoped formatting and diff checks. A later push still requires a valid exact-input hook receipt; no stale receipt is asserted here.

[Actual-output gallery](../evidence/books-listening/README.md): final phone book, centered desktop player and saved source-page-60 PDF. [Coordinated Quran/inline gallery](../evidence/quran-inline-player/README.md): symmetry/font parity, protected settings, enlarged meanings and Focus recovery.

Original PDF glyph/page comparisons, section audits, screenshots/traces, acoustic drafts/registration and complete gate logs remain under `output/books-audio-review-20261127/`. Selected figures are actual output, not mockups. They precede only a nonvisual ARIA association correction verified by the final browser run.

## Documentation updated

`docs/ARCHITECTURE.md`, `docs/DESIGN_SYSTEM.md`, `docs/CONTENT_AUTHORING.md`, `docs/QUALITY_CHECKLIST.md`, `docs/audio/WORD_ALIGNMENT.md`, `docs/learning/SOURCE_REPAIR_2026_11_27.md`, source/English-binding ledgers, phase brief, agent index/decision log, this report, coordination checkpoint and gallery. Independent reports are preserved.

## Decisions recorded

Start locally while publication is held; clearly labelled estimates; responsive defaults; settings on request; globally balanced top/bottom edges. Original source authority and independent-review boundaries remain explicit. No new runtime dependency, toolchain replacement or persisted-state migration.

## Known limitations or remaining risks

- Source-image comparison is not independent scholarly/language approval. Review-copy notices remain; unresolved extraction is not silently guessed.
- Timings are estimates without independent listening approval. Additional Arabic inventory is about 96.46 hours; only 80 additional recordings were completed here. Uncovered/omitted intervals remain unhighlighted.
- No narrated book recordings are available to align; following applies to exact available dua/Quran files.
- The unavailable full 138-page Umrah original was not restored. Its 16-source-page adaptation and English draft bytes remain unchanged. Full Al-Mukhtar/Wird English translation is not claimed complete.
- Physical Android/iOS, assistive technology and human acoustic acceptance remain separate. Automated checks do not establish complete accessibility compliance.
- An earlier offline edition can retain old source issues; its explicit notice remains until the new edition is available. Old assets are retained deliberately.
- Optional timing assets work through the local review route. A future release must include them and pass exact-commit CI/deployment checks; no publication occurred here.

## Out-of-scope findings

Independent inline-reader, release-regression and Learn narration/language work is preserved and attributed in its own reports. No unrelated history changes, new source interpretation, English translation completion or remote service setup.

## Recommended next step

Review the local gallery and separately complete human source/listening/device acceptance. Keep publication held until the owner resumes the release. A later release owner must consolidate the shared snapshot, write fresh release notes, pass exact-input hook gates and exact-commit CI, then verify deployment/production. This report does not authorize or claim that release.
