# Phase Report — Learn library and integrated books, 2026-11-25

## Objective

Integrate the three enhanced Arabic publications into a calm, accessible native reader and establish the owner-selected **More → Learn**, with an Azkar shortcut. Preserve the primary navigation and leave a coherent destination for future prayer, ablution and hadith modules. This is a local implementation under the existing publication hold.

## Scope completed

- One Learn catalogue with three real books; no empty future-module cards. Resource kinds distinguish books, guides and hadith collections. The current payload/reader is specifically for books; future guides and hadith collections still need their reviewed content, dedicated unit schemas and presentation.
- Integrated semantic HTML, source contents and Arabic search, section bookmarks, source-section/relative-scroll recovery, app reading font/text size and theme support. Arabic source retains its own language/direction in either interface language.
- On-demand compressed text packs (11–47 KB per book), current-section DOM and image acquisition, six native Umrah stage drawings, original photographs/captions and source-page references. UI-language changes retain the mounted Arabic content.
- Document-owned offline downloads with exact size/SHA-256 checks, cancellation, retry, corruption/eviction detection and removal of a book's current/older cached versions. Removing bytes retains reading records. Books management loads only when expanded in Settings → Downloads.
- Optional Light/Dark/Navy PDFs, verified before the existing device export. PDFs are separate from offline-reader readiness and never enter the app installation payload.
- Normalized device-local reading records, private-data erasure and full-download erasure. No account-sync or religious-content changes.

## Files changed

| Area                           | Files                                                                                                                                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Composition and routes         | `src/app/App.tsx`, `types.ts`, `routing.ts`, `hooks/useAppRouting.ts`                                                                                                                            |
| Entries                        | `screens/MoreScreen.tsx`, `screens/AzkarLibraryScreen.tsx`, core Arabic/English i18n dictionaries                                                                                                |
| Reader and catalogue           | `screens/LearnScreen.tsx`, `screens/LearningReaderScreen.tsx`, `screens/learn.css`, `i18n/learning.ts`                                                                                           |
| Services and state             | `learning/{types,catalogue,learningAssets,learningDownloads,learningState}.ts`, `learning/catalogue.json`, `hooks/useLearningLibrary.ts`                                                         |
| Presentation                   | `components/{LearningContent,LearningContents,LearningOfflineActions,UmrahStageArtwork}.tsx`                                                                                                     |
| Downloads and erasure          | `screens/settings/{DownloadsPanel,LearningDownloadsPanel}.tsx`, `state.ts`, `hooks/useSettingsHandlers.ts`                                                                                       |
| Content preparation/delivery   | `scripts/pack-learning-books.mjs`, `scripts/learning-assets-plugin.ts`, `vite.config.ts`, `docs/learning/README.md`, 15 immutable assets under `docs/learning/assets/`                           |
| Verification                   | `scripts/learning-books.test.mjs`, `learning/{learningAssets,learningState}.test.ts`, `routing.test.ts`, `src/test/isolatedSuites.ts`, `e2e/learning-library.spec.ts`, feature-browser selection |
| Unused illustration retirement | `components/ProductImage.tsx`, product-image export script, three byte-identical files moved from `public/images/` to `design-sources/retired-illustrations/` with a hash record                 |
| Contracts                      | README, Architecture, Content authoring, Design specification coverage, agent index/decision log/phase and this report                                                                           |

Paths under `src/app/` are shortened in the table. Independent pending Home, Settings, prayer-location and standalone-document changes were preserved.

## Components added or modified

LearnScreen and LearningReaderScreen compose data and behavior. LearningContent, LearningContents, LearningOfflineActions and UmrahStageArtwork are reusable presentation with supplied data/actions. They do not call storage or raw network services. Existing Button, TabList, ScreenContainer, Header, protected Modal/SheetHeader, icons, fonts and device export remain shared.

## User-visible changes

Read/Continue opens inside the app. Phones use a compact named toolbar and previous/next controls; wide readers also show a contents/search sidebar. The reader has an opaque base in Glass mode. Linked Umrah stages retain their card anatomy and full-size drawings. Enlarged book metadata wraps below its cover; Books management avoids nested padding. PDF appearance is chosen explicitly for printing/sharing through the device's downloaded file.

URLs: `#/learn`, `#/learn/<resource-id>`, `#/learn/<resource-id>/p-<source-page>`. Section changes replace the current reader entry; browser Back returns to the catalogue. Direct-reader in-app/native Back recovers to Learn.

## Accessibility work

- Native headings, paragraphs, lists, figures/captions, links, fieldsets/radios and progress semantics; explicit Arabic source language and RTL.
- Visible focus, ordinary 44px targets, full accessible names for compact controls and semantic DOM/keyboard order.
- Shared opaque portalled modal, bounded scrolling/search, Escape/Tab/Shift+Tab containment and opener recovery. Pointer activation establishes the opener in WebKit, where tapping a button does not normally focus it.
- Responsive reflow and geometry checks at 320px/200% text, phone/tablet/desktop, Arabic/English, Light/Dark/Midnight, Glass/solid and accessibility fallbacks. App/OS still-motion behavior remains shared; no ambient motion was added.
- Scoped loading, error, bookmark, storage and download announcements. The reading article is not a live region.
- Existing fonts are reused, synthetic font weight is suppressed, and source wording stays selectable rather than becoming image text.

## Tests added or updated

- Independent comparison of all **217 original source pages**, including continuation sheets, plus exact digests/sizes for text, photographs and **nine PDFs**.
- Safe-tree validation; corrupt/evicted/denied cache recovery; cancellation/retry; removal racing an in-flight request; older-version removal; immutable progress snapshots.
- Reading-state normalization, session-only writes, bookmark/position preservation and private/full erasure.
- Stable route parsing and invalid path rejection.
- Real-browser entry/history/continuation, Arabic search, keyboard/focus/opacity, bookmark and scroll recovery, text-preference persistence, offline reload/removal, PDF acquisition and responsive visual/axe evidence.

## Commands run

| Command                                                         | Result                                                                                                                          |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `node scripts/pack-learning-books.mjs`                          | Passed: 64 / 16 / 137 source units; 23 / 12 / 45 contents entries.                                                              |
| Targeted Vitest: learning/source/routing/routing-hook/Downloads | Passed: 74 tests in 7 files before the additional version/snapshot cases.                                                       |
| `pnpm check` — first broad run                                  | 13 stages passed; 2,669 tests passed and one existing 604-page Mushaf download test timed out at its unchanged 45-second limit. |
| Isolated Mushaf + learning/source Vitest                        | Passed unchanged: 20 tests in 4 files, 34.35 seconds.                                                                           |
| Learn browser matrix — preceding accepted run                   | Passed: 9 tests across Chromium, Firefox and WebKit. Additional reflow/recovery assertions are included in the final run below. |
| Navigation + offline-core browser regression                    | Passed: 13 Chromium tests, 27.3 seconds.                                                                                        |
| `pnpm build:pages`                                              | Passed after retiring the unused illustration; all original ceilings retained. Final metrics below.                             |
| Final Learn matrix                                              | Passed: 9 tests, 50.9 seconds; Chromium, Firefox and WebKit; no skips/retries.                                                  |
| `pnpm check:serial`                                             | Passed: all 14 stages, 274.4 seconds; full unit/coverage stage 130.5 seconds.                                                   |
| `git diff --check` and targeted Prettier                        | Passed; final report formatting checked separately.                                                                             |

The initial Pages build exceeded the total-output ceiling by 44,190 bytes. Reference inspection found the former Benefits image unused; its three files were preserved byte-identically outside `public/`, removing 148,834 deployed bytes. Git blob hashes also match the tracked originals. No ceiling, coverage threshold, timeout or assertion was weakened. Earlier UI runs exposed route-test settling/artifact-directory interference and the WebKit opener issue; the journey now waits for rendered UI, uses an isolated preview/output directory and retains the focus assertions.

Final Pages output: **12,482,994 bytes**, 99,918 bytes below the unchanged 12 MiB ceiling. Home startup graph: **520,006 gzip bytes**, within its existing baseline tolerance; baseline and ceilings were not changed. Book text packs are 28,231 / 11,341 / 46,622 bytes; the Umrah photographs add 900,506 bytes only on request or explicit offline saving. The full serial gate passed once before the final visual refinements (207.0 seconds), then passed again for the final implementation (274.4 seconds). Only this report's result entries were updated afterward and independently formatted.

## Visual/manual evidence

Screenshots and browser reports are under `output/learning-library/`. The `evidence/` folder contains 11 inspected PNGs: catalogue at desktop/enlarged narrow widths, Light photo reader, Dark tablet reading, English phone reading, enlarged narrow reader, stage cards, enlarged reading options, contrast/forced-colors fallbacks and Books management. `evidence-manifest.json` records exact PNG hashes. `complete-browser-report.json` contains the final nine-case result; `core-browser-report.json` contains the 13-case regression. Final gate/build logs are `output/learn-check-serial-final.log` and `output/learn-pages-build-final.log`. Source/source-PDF evidence remains in the preceding devotional-document report.

Actual PNGs were inspected to catch issues automated axe checks missed: oversized phone chrome, photography showing through reading content, flattened roadmap links and cramped enlarged metadata. Native stage drawings were also counted and inspected in the running application. Browser keyboard tests are automated evidence; real TalkBack/VoiceOver acceptance is still pending.

## Documentation updated

README, Architecture, Content authoring, Design specification coverage, `docs/learning/README.md`, agent index/decision log, the approved local phase and this report. The retirement archive records original hashes and regeneration guidance. Product release notes were not changed under the publication hold.

## Decisions recorded

Learn under More plus an Azkar shortcut; HTML as the primary reading format; PDFs as optional exports; no new main-navigation item; future content kinds without placeholder modules; device-local learning records outside daily progress/synchronization; immutable optional publication delivery outside the install payload.

## Known limitations or remaining risks

- Independent Arabic/religious-source review remains pending as recorded for the supplied publications. Text fidelity is verified; this phase does not certify source authenticity, source extraction/order or abbreviated passages.
- Real screen-reader, native-device export and physical low-end-device acceptance remain pending. Automated axe/keyboard checks do not establish complete WCAG compliance.
- Reading records are device-local and currently outside account synchronization and the existing AppState backup export. Browser storage can be evicted; readiness is reverified rather than promised permanently.
- Optional production asset URLs become available only when the held source/assets are published. CI, deployed-asset checks and production smoke belong to the later authorized release.

## Out-of-scope findings

The first broad gate's existing full-Mushaf timeout passed in isolation without modification, then both clean serial full gates passed. Independent Home/Settings and document improvements were not merged, committed or published by this phase.

## Recommended next step

Review the local Learn/reader evidence and complete publication-source/device acceptance. Then define the reviewed prayer/ablution guide units and hadith-collection schema beneath Learn, including their source metadata and any future backup/sync decision. Publication remains held until separately authorized.
