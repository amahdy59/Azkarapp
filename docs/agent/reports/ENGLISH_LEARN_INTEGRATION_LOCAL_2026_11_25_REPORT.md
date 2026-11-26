# Phase Report — English Learn integration, local, 2026-11-25

## Objective

Connect the completed English Umrah adaptation and its three PDFs to the existing native Learn reader, preserving Arabic books, source text, offline reading and existing device-local records. Keep the publication hold and unfinished translation boundaries explicit.

## Scope completed

- Learn still contains three books under More, with the existing Azkar shortcut. Umrah now offers Arabic/English choices on its catalogue card and in Reading options. The other two unfinished English translations have no language option.
- The completed English adaptation opens inside the app with contents/search, navigation, bookmarks and remembered reading position. Its 16 source units preserve nine Arabic/English Quran pairs, source references, four photograph placements, six stage illustrations, two labelled native vector diagrams and full publication/About details.
- English Light/Dark/Navy PDFs use the exact saved exports and download only when requested. English filenames include `-en-`; Arabic filenames remain unchanged.
- Arabic URLs and state keys remain valid. English routes add `?lang=en`; positions/bookmarks use a separate `dalil-al-mutamir:en` record. Explicit language choice is remembered independently of interface language. Language/section changes replace the current reader entry, preserving Back to Learn.
- Offline jobs, readiness and removal identify the selected edition. Settings → Downloads → Books lists the editions separately. Shared photos are retained while another saved edition uses them; reading records survive removal.
- Readiness waits for the active download's final verification even if a concurrent cache scan already sees every file. Interrupted cache-body reads and document shutdown do not trigger destructive eviction; actual integrity failures remain rejected and are removed on an active check.
- The draft remains available only in development and isolated browser-review builds. Ordinary production excludes it until independent review. A direct unavailable English route recovers to Arabic with an explicit notice.

No religious text, Arabic source publication, primary navigation, synchronized state, dependency or release-note manifest was changed. No commit, push or deployment was performed.

## Files changed

- `src/app/learning/{types,catalogue,learningState,learningAssets,learningDownloads}.ts`, generated `catalogue.json` and their relevant tests: content-language identities, production review gate, safe node validation, normalized records, shared asset retention and lifecycle-safe verification.
- `src/app/hooks/useLearningLibrary.ts`, `useAppRouting.ts`, `src/app/routing.ts`, `routing.test.ts` and `App.tsx`: selected book language, stable routes/history, isolated positions and matching PDF export.
- New `LearningLanguageChoices.tsx` and `LearningDiagram.tsx`; updated `LearningContent.tsx`, `LearningContents.tsx`, `LearningOfflineActions.tsx` and its new readiness regression test.
- `LearnScreen.tsx`, `LearningReaderScreen.tsx`, `settings/LearningDownloadsPanel.tsx`, `learn.css` and `i18n/learning.ts`: visible language controls, native bilingual content, draft/coverage disclosure and edition-aware downloads.
- `scripts/pack-english-learning-book.mjs`, `pack-learning-books.mjs`, `learning-books.test.mjs`, `docs/learning/english-export-manifest.json` and new immutable optional assets: source-verified extraction/export and CI-independent artifact identity.
- `vite.config.ts`: development/isolated-review gate; ordinary production remains excluded.
- `e2e/learning-library.spec.ts` and `e2e/helpers/outage-origin.ts`: language, PDF, offline/server-outage and shared-image regressions using an isolated loopback origin.
- Phase/decision/index/architecture/content/delivery documentation, this report and the screenshot evidence directory.

## Components added or modified

The language choice component is pure presentation with native labelled radios and callbacks. The diagram component renders fixed source-verified geometry with accessible names/descriptions; packed data cannot supply executable SVG. Existing reader, contents, offline actions, protected Modal/SheetHeader, buttons, icon exports and device file-export service are reused. No iframe or separate reading window is introduced.

## User-visible changes

Choose the Umrah book language before opening or while reading. Switching the interface language leaves the selected content language intact. Arabic Quran remains visible in English reading, with corresponding attributed meanings. Search uses the selected text. Each language resumes its own place/bookmarks and exposes matching offline status and PDF files. Edition status/coverage uses progressive disclosure so enlarged options remain usable.

The current development app is served at `http://127.0.0.1:5180/`; Learn is `#/learn` and the English reader is `#/learn/dalil-al-mutamir?lang=en`. The existing unrelated local app/server on port 5173 and independent Home preview were preserved.

## Accessibility work

Native language radios, explicit fieldset labels, 44px targets, visible focus, protected opaque options/contents surfaces and keyboard recovery are retained. Choosing a contents result focuses the reading region; changing book language within options preserves the dialog and its return target. Content title/author/contents and body carry the selected language/direction; Arabic Quran has its own `lang="ar" dir="rtl"` spans within English reading.

The fixed diagrams retain anticlockwise/alternating passage direction under Arabic interface RTL. Visible captions and full instructions accompany SVG names/descriptions. The native geometry/labels are compared directly with the source-verified standalone diagrams. Narrow 320px/200% text, selected axe rules, RTL/LTR, app themes and protected options are checked separately from source fidelity.

Automated/browser evidence does not establish full WCAG/PDF-UA compliance or physical TalkBack/VoiceOver/PDF-reader acceptance. Independent content/language and real-device assistive-technology acceptance remain pending.

## Tests added or updated

- Every Arabic source unit/continuation still matches its source; all immutable text/image/PDF bytes are checked.
- All completed English source blocks, nine Quran pairings/attribution, sixteen units, four photo placements, six stage icons, two diagrams and exact source/native diagram paths/labels are checked.
- Normalization retains legacy Arabic positions/bookmarks and independent English records; malformed/unsupported identities reject. Existing private-data erasure and denied-storage tests continue to pass.
- Catalogue tests prove only the completed English draft appears during local review and ordinary production excludes it.
- Routes preserve Arabic links and round-trip English language context while rejecting unsupported book/language combinations.
- Cache tests cover corruption, eviction, interruption, document closing, shared-image retention, cancellation, retry and accurate active-job readiness.
- Browser cases cover language selection/search, interface/content direction independence, separate bookmarks/positions, reload, protected focus, 320px/200% reflow, all three matching PDF downloads on demand, offline/server-unavailable reopening and retaining Arabic after English removal.

## Commands run

| Command                                                                                                                                                       | Result                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node scripts/pack-learning-books.mjs` with bundled Python in `BOOK_PYTHON`                                                                                   | PASS: 217 unchanged Arabic source units plus 16 English units; 9 bilingual Quran pairs; immutable packs/images and 12 PDF assets registered.         |
| Targeted Vitest runs for Learn state/assets/catalogue, readiness, routing, extraction/geometry and English edition/sample integrity                           | PASS: 8 files, 56 tests; final focused run 20.81 s.                                                                                                  |
| Targeted ESLint and Prettier checks for affected files                                                                                                        | PASS after correcting two TypeScript issues and formatting.                                                                                          |
| `pnpm typecheck`                                                                                                                                              | PASS, exit 0 after the SVG attribute/catalogue-status fixes.                                                                                         |
| `pnpm exec playwright test e2e/learning-library.spec.ts --project=desktop-chromium --project=desktop-firefox-smoke --project=mobile-webkit-smoke --workers=2` | PASS: all 18 cases, including retained Arabic reader/history/offline tests and new English flows.                                                    |
| WebKit English offline/server-outage regression with `--repeat-each=3` after lifecycle/readiness fixes                                                        | PASS: 3 consecutive cases.                                                                                                                           |
| `pnpm check`                                                                                                                                                  | PASS: complete non-browser quality gate, including coverage, content integrity, type/lint/format, build, budgets and CSS checks.                     |
| Final `pnpm check:serial`                                                                                                                                     | PASS, exit 0, 516.0 s. All intact stages pass: coverage, build, typecheck, lint, format, content/audio/timing/motion checks, budgets and CSS checks. |
| Final `pnpm build:pages`                                                                                                                                      | PASS: Pages/PWA build, bundle budget and CSS utility checks. Home startup 520,862 gzip bytes; no budget ceiling/baseline change.                     |

Earlier runs caught TypeScript attribute/status inference errors, a formatting race during edits and inaccurate readiness during active verification. These were corrected without weakening assertions, coverage, budgets or content checks. The final evidence supersedes diagnostic results. No release workflow was run under the publication hold.

The pinned Playwright offline flag rejects worker-backed navigation in WebKit; its upstream [minimal reproduction](https://github.com/microsoft/playwright/issues/42775) documents the distinction. The new cross-engine acceptance test follows the repository's existing server-outage pattern: stop its own loopback origin, prove requests fail, require a successful worker-served reload, then verify reading/bookmarks and language-specific removal. This tests actual origin unavailability without mocking a successful document or affecting parallel tests. Chromium's existing offline-emulation reader test is retained.

## Visual/manual evidence

`docs/agent/evidence/english-learn-integration/` contains the actual integrated desktop English reader, phone English content in Arabic UI, enlarged reading options and theme/geometry/axe evidence. These are screenshots of the running application, not standalone HTML mockups. The final visual pass uses compact language labels and a collapsed detailed coverage disclosure so controls remain accessible at enlarged text. Light/Dark/Midnight review uses the same app surfaces and fixed diagram direction.

Browser traces/results are retained under `test-results/` and the phase command logs under `output/english-learn-integration-*.log`. Physical-device/screen-reader acceptance is not claimed.

The final native UI review adds nine theme/material/width configurations and eighteen selected axe scans: Light/Dark/Midnight Glass, Light solid and a high-contrast/reduced-transparency fallback. Every root theme is asserted; 320px cases use 200% text. Reader/options scans report zero selected violations and the content has no horizontal overflow. The evidence index identifies final screenshots separately from earlier diagnostics.

## Documentation updated

The active index, owner decision log, integration phase, architecture, content-authoring and Learn delivery contracts record language identities, retained Arabic data, optional assets/export manifest, draft-only review visibility and remaining source/translation/release boundaries. This report records validation and user-visible access.

## Decisions recorded

The owner authorizes integrating the remaining available document items locally. More → Learn and the Azkar shortcut remain. Only the complete current English Umrah adaptation is exposed; no incomplete English edition is advertised. Existing review and publication contracts remain in force. Source corrections and independent religious/language review are not performed as an integration shortcut.

## Known limitations or remaining risks

- English Umrah is a review draft of the available 16-page adaptation, not the inaccessible 138-page original.
- Full Al-Mukhtar/Wird translations and separately recorded Arabic source corrections remain unfinished.
- Ordinary production intentionally excludes the unreviewed English draft. Publication requires the owner-selected release and independent review checkpoints.
- Physical-device accessibility, PDF-reader reading order and independent terminology/religious-source acceptance remain pending.
- Reading state remains device-local. Browser cache eviction/denial can require saving again; it does not remove bookmarks/positions.

## Out-of-scope findings

Independent Home, Settings, motion, earlier Arabic-document and Learn work in the shared checkout is preserved. Other project servers/tests were not modified or stopped. No account schema, runtime dependency, deployed site or release-note change is part of this phase.

## Recommended next step

Use the local integrated reader for the remaining independent content/accessibility acceptance. Continue original-source reconciliation and full Al-Mukhtar/Wird English authoring before adding their language options. Publish only through the separately authorized final release phase.
