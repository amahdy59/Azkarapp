# Phase Report — Quran entry stability

## Objective

Reduce the reported brief Quran font/size change on entering a Quran page or a Quran-containing zikr. Preserve pending dark-paper, update-readiness and Masbaha work. Local only; no commit, push or deployment.

## Scope completed

- Reproduce ready first-render, page-change and serialized-font acquisition failures before implementation.
- Reuse ready in-memory Quran words and decoded fonts on the first render and when switching cached pages.
- Start cold page data and font requests together while keeping complete Unicode immediately readable.
- Initialize both cached faces in full and immersive Mushaf readers.
- Lazily warm at most two likely page/font pairs from category/next-reader intent, respecting hidden-screen, Data Saver and 2G constraints.

## Files changed

- `src/app/hooks/useListeningMushafPage.ts` and its tests
- `src/app/content/qcfMushaf.ts` and its tests
- New `src/app/content/quranReadiness.ts` and its tests
- `src/app/App.tsx`, `src/app/screens/KhatmahReaderScreen.tsx`, `src/app/components/MushafImmersiveReader.tsx`
- `src/test/isolatedSuites.ts`
- New `e2e/quran-entry-stability.spec.ts`, existing `e2e/mushaf-interaction-refinements.spec.ts`
- Architecture, quality checklist, decision log, phase index, local phase brief and this report

This list describes the latest checkpoint; preceding pending changes remain intact.

## Components added or modified

Shared snippet/listening hook, app navigation-intent effect, full and immersive Mushaf initialization. `quranReadiness` is a content-loading utility; no new presentation component, cache, runtime dependency or persistence boundary.

## User-visible changes

Cached Quran passages appear directly in their ready lettering. Cached two-page Mushaf spreads appear with both faces together. First visits from a category and the next reader entries can use fonts warmed before entry; cold font loading no longer waits behind page data. Offline and failed-font reading stays available. Reviewed text, copy/share semantics, repetition, page geometry and saved position are unchanged.

## Accessibility work

Retain exact semantic text and existing native word/help actions, reading order and reduced-motion behavior. Fallback text remains visible while a font is unavailable. No extra live region, focus transfer, artificial delay or loading overlay is added. Existing browser interaction coverage retains keyboard/back/color controls; no claim of complete accessibility or physical-device acceptance.

## Tests added or updated

- Warm first render and cached page change never yield a null or wrong-font frame.
- Font request starts while page data is held pending; late font rejection/navigation stays contained.
- Ready-page boundary distinguishes unknown/cold glyph data from decoded fonts and cached Unicode pages.
- Intent warm-up deduplicates, caps requests, supports explicit multipage ranges/surah openings and skips hidden/Data Saver/2G work.
- Browser mutation histories cover first commits for online/offline warm spreads and Quran snippets, first entry after category warm-up and slow-data/rejected-font fallback.
- The existing WebKit settings-close test now waits for actual protected-overlay hit testing to release the paper before beginning its gesture; assertions remain intact.

## Commands run

| Command                               | Result                                                                                                                                                                                                             |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Initial hook regressions              | 3 failed and 4 existing passed before implementation; `output/quran-entry-before.log`.                                                                                                                             |
| Focused Quran/reader unit suites      | 90 passed across 6 suites during development; `output/quran-entry-units-verified.log`.                                                                                                                             |
| Final readiness/cache/isolation units | 32 passed across 4 suites; `output/quran-entry-final-units.log`.                                                                                                                                                   |
| Final feature browser checks          | 18 passed in 78.6 seconds across Chromium, Firefox and WebKit; zero failed/skipped/flaky. `output/quran-entry-final-browser.json` and matching log. Includes the repaired protected-overlay gesture checks.        |
| Arabic lettering in reading/audio     | 3 passed across all three engines in 1.1 minutes; tests include 320/390/820/1440px and enlarged text, word help and targeted axe checks. `output/quran-entry-lettering-browser.json`.                              |
| `pnpm check`                          | All stages passed in 142.7 seconds, including full coverage suite, type safety, lint, format, content/timing/motion checks, CSS utilities and unchanged bundle budgets. `output/quran-entry-quality-verified.log`. |
| `pnpm build:pages`                    | Passed, including bundle and CSS checks. `output/quran-entry-pages.log`.                                                                                                                                           |
| Local preview build                   | Passed, using the isolated loopback API fixture at port 4197. `output/quran-entry-preview-build.log`.                                                                                                              |

Browser commands used the three projects `desktop-chromium`, `desktop-firefox-smoke` and `mobile-webkit-smoke`:

```powershell
pnpm test:e2e e2e/quran-entry-stability.spec.ts e2e/mushaf-interaction-refinements.spec.ts --grep 'warm Mushaf|warm Quran|category intent|Quran zikr requests|surah Mushaf back' --project=desktop-chromium --project=desktop-firefox-smoke --project=mobile-webkit-smoke --output=output/playwright/quran-entry-final
pnpm test:e2e e2e/reader-mushaf-lettering.spec.ts --grep 'ar/m-hm-76a' --project=desktop-chromium --project=desktop-firefox-smoke --project=mobile-webkit-smoke --output=output/playwright/quran-entry-lettering
```

Browser diagnostics initially seeded auto layout at a viewport whose physical-fit rule correctly chooses one page; the explicit-spread fixture fixes the test setup without changing responsive product rules. The existing WebKit gesture case also sampled paper before an exiting modal released hit testing. Initial/repair logs remain in `output/quran-entry-browser.log` and `output/quran-entry-browser-repair.log`; final runs retain every relevant assertion. The first full quality run passed every stage except lint, which rejected an unnecessary `retry` dependency in the cache memo. Remove that dependency while retaining retry in the actual load effect; targeted lint/format and the unchanged bundle budgets pass. Final full-gate results are recorded before completion.

## Visual/manual evidence

Three-engine entry histories and normal-zoom screenshots are generated under `output/playwright/quran-entry-final/`. Inspected the WebKit Quran-zikr return screenshot and Chromium two-page spread. The recorded online and offline spread entries each contain exactly one state: pages 75 and 76 in QCF mode together, without a loading state. Category-intent and cached-zikr entry histories likewise retain ready glyphs. Example files:

- `output/playwright/quran-entry-final/quran-entry-stability-warm-2f857-ack-on-return-cross-browser-mobile-webkit-smoke/warm-quran-zikr-entry.png`
- `output/playwright/quran-entry-final/quran-entry-stability-warm-747f4-uding-offline-cross-browser-desktop-chromium/warm-spread-entry.png`

The spread and warm-zikr checks deliberately use a wide viewport; the slow-data/fallback browser case uses 390px. The separate Arabic lettering suite verifies 320/390/820/1440px and enlarged text in reading/audio. The WebKit project name is an engine profile, not a claim the wide screenshots show a phone viewport. No physical Android/TalkBack test performed in this checkpoint. Local preview refreshed at `http://127.0.0.1:4197/`; optional update acceptance remains under reader control.

## Documentation updated

Architecture/readiness ownership, quality regression checklist, active checkpoint, owner decision and report. No reviewed content or persisted schema change.

## Decisions recorded

The owner confirmed “Text briefly changes size or font”. Repair avoidable cached fallback and resource serialization while preserving immediate fallback and late-font recovery. Local-only remains authoritative.

## Known limitations or remaining risks

On a genuinely cold direct visit, unavailable page font or constrained connection, the app deliberately displays complete Unicode and can upgrade when the exact QCF font arrives. This may still change lettering; these changes remove avoidable warm-entry swaps and reduce cold likelihood, not guarantee zero first-download font change. Removing every cold swap would require selecting a different presentation policy (bounded placeholder or retaining fallback until navigation), which changes the documented immediate-reading/late-recovery contract. No such policy change is included.

Warm-up reuses existing non-abortable shared loaders so speculative cancellation cannot interrupt a reader's request. New work is bounded and skipped when hidden; already-shared requests may finish. Browser evidence is controlled lab behavior, not a measured physical-device speed improvement or field percentile.

## Out-of-scope findings

Audio footer and wider Mushaf download-status/scheduler/decoded-font-memory proposals remain in the preceding dark-paper review report. No broad audio redesign or download architecture migration is implied by this focused glitch repair.

## Recommended next step

Review the local Quran return/next-entry behavior on the reported device. If the remaining first-download font change is distracting, select the cold-entry presentation policy explicitly. Treat audio footer and download profiling as separate implementation checkpoints. Do not push until the owner changes the local-only instruction.
