# Phase Report — Reading settings and header zoom, local

## Objective

Apply the owner-approved revised visual concepts locally. Make enlargement one reading state with a single existing-position header, original Mushaf at 100%, continuous current-page text and one footer page identity. Preserve independent local work and the no-commit/no-push instruction.

## Scope completed

- Replace the search-like glyph with the shared expansion icon and a short Enlarge label; hide only the supplementary label where 320px/200% text cannot fit it.
- Replace ordinary reader chrome during enlargement with one minus/percentage/plus group and Page view. Reducing to 100%, Page view, Escape and native Back restore the original page and opener focus.
- Render every current-page source word exactly once in a named native vertical scroll region. Preserve a visible word anchor during size, viewport and font changes. A spread enlarges its current page and retains both original canvases for return.
- Keep one original footer page identity, with no repeated zoom/meaning actions or portion counter/arrows. Pause existing audio following on deliberate enlargement and reset original-page magnification before it can compound enlargement.
- Provide labelled theme previews, explicit reversible Follow app, keyboard radio navigation and enlarged-label reflow. Disclose original-page magnification, wide layout and toolbar-edge controls under Advanced display. Keep the existing protected overlay/reader-panel and responsive shell ownership.
- Preserve real fitted page measurements while panels temporarily hide the page. Retain the separate excerpt/listening modal renderer and correct its size-popup opening focus to the labelled slider and keep one Escape from dismissing the parent. Disabled boundary arrows retain native disabled semantics and own their pointer area, preventing fall-through into reading content.

## Files changed

Implementation: `src/app/components/InlineQuranReading.tsx` (new), `QuranReadingZoom.tsx`, `MushafPageViewer.tsx`, `MushafSettingsSheet.tsx`, `MushafImmersiveReader.tsx`, `EnlargedReadingToolbar.tsx`, `enlarged-reading-toolbar.css`, `quran-reading-zoom.css`, `mushaf-reading-settings.css` (new); `src/app/screens/KhatmahReaderScreen.tsx`; `src/app/i18n/ar.ts`, `en.ts`.

Tests: `InlineQuranReading.test.tsx` (new), `MushafSettingsSheet.test.tsx`, `MushafPageViewer.test.tsx`, `EnlargedReadingToolbar.test.tsx`, `QuranListeningReader.test.tsx`, `src/app/screens/KhatmahReaderScreen.test.tsx`; `e2e/header-zoom-settings.spec.ts` (new), `quran-enlarged-reading.spec.ts`, `quran-inline-player.spec.ts`, `mushaf-magnification.spec.ts`, `mushaf-phone-index.spec.ts`, `quiet-reading-toolbar.spec.ts`; the existing Quran feature selector includes the new settings spec.

Documentation and actual screenshots are listed below. Files already containing independent edits were changed in place without replacing those edits. Earlier local checkpoint copies for the main implementation files remain under `output/header-zoom/baseline/` for scoped comparison.

## Components added or modified

InlineQuranReading and InlineQuranZoomHeader provide presentation only. QuranReadingZoom owns transient enlargement state; the existing reader hosts remain authoritative for following, magnification and stored preferences. Existing components, icon exports, i18n, font/source data, protected overlays and normalization boundaries are reused. No runtime dependency, persisted schema or service is introduced.

## User-visible changes

The normal reader has an explicit expansion action. Enlarged reading uses the existing header position, shows complete current-page text through native scrolling and restores the printed page at 100%. Appearance settings are easier to scan and Advanced keeps secondary display choices available. Reviewed devotional text, source pagination, counts, bookmarks, prayer behaviour, audio identities and offline reading remain intact.

## Accessibility work

Native controls, named scroll region, complete source semantics without duplicate active canonical content, 44px targets, visible focus, live size output, native keyboard scroll, RTL/LTR radio navigation and explicit focus/Back recovery. Browser regressions check actual geometry/hit testing, protected opacity, last-word reachability, narrow 200% text, simulated safe areas and axe. Physical TalkBack/VoiceOver and real-device pinch/safe-area acceptance remain separate.

## Tests added or updated

Continuous source-word order/identity, first-line passage retention through resizing, complete vertical reachability/no horizontal overflow, unchanged fifteen canonical lines and mounted spread pages, the one header/footer contract, 100%/Page view/Escape/pinch recovery, source-conserving excerpt behaviour, theme keyboard/persistence and original-page enlargement without compounded scaling. Earlier portion-navigation expectations were replaced only for the newly approved canonical continuous reading contract; excerpt/listening expectations remain.

## Commands run

Completed locally on 2026-11-28. Logs are under `output/header-zoom/`.

| Command / selection                                                                         | Exact result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node --version`; `pnpm --version`                                                          | v24.15.0; 11.19.0.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `pnpm test:run` for the eight affected reader/settings/Back/portion/listening/toolbar files | **107 tests passed, eight files**; `final-targeted-unit.log`. The new nested-modal Escape test is included.                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Scoped `pnpm exec eslint ... --max-warnings 0` and Prettier checks                          | Passed on this phase's implementation/tests/docs; see `scoped-lint.log` and `scoped-format.log`.                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Seven affected Playwright specs, Chromium/Firefox/WebKit                                    | `final-browser.json`: **135 passed / 18 failed**, 153 selected cases. All 18 initial failures were the retained excerpt size-popup focus contract. No cases were skipped and no retries were used.                                                                                                                                                                                                                                                                                                                                       |
| Excerpt popup after focus, nested-Escape and disabled-arrow repairs, all three engines      | `excerpt-final-browser.json`: **17 passed / one failed**. The sole remaining failure was Firefox serializing a transformed 44px control as 43.99998474121094px.                                                                                                                                                                                                                                                                                                                                                                          |
| Exact failed Firefox excerpt case after sub-millipixel measurement normalization            | `firefox-fractional-browser.json`: **one passed**. The 44 CSS px requirement remains; the test rounds only below 0.001 CSS px. The final combined evidence covers **all 153 selected browser cases** successfully across three engines, rather than claiming a single all-green batch.                                                                                                                                                                                                                                                   |
| `pnpm check`, reconciled pre-final-popup checkpoint                                         | Typecheck/build/format and complete coverage stage passed (**412 files / 2,887 tests**). Failed only on the independent unused sharing import and aggregate bundle ceiling; `reconciled-check.log`.                                                                                                                                                                                                                                                                                                                                      |
| Final `pnpm check`                                                                          | Exit 1, `verified-check.log`: typecheck/build/audio/timings/type-scale/motion/CSS-utility stages passed. **409 unit files passed / three failed; 2,885 tests passed / four failed** in the independent book-source audit/edition/hash checks. Full lint failed on the unused `FIELD_LABEL_CLASS` import in CollectionShareModal. Format failed on four independently edited book/source files. Output **12,603,497 bytes** exceeds the unchanged **12,582,912-byte** ceiling by **20,585 bytes**. No threshold or assertion was removed. |
| `pnpm build:pages`                                                                          | Vite/PWA generation succeeded; command exit 1 at bundle budget. Pages output **12,600,320 bytes**, ceiling **12,582,912**, excess **17,408 bytes**; `final-pages-build.log`.                                                                                                                                                                                                                                                                                                                                                             |

The independent source work changed during aggregate verification. Earlier complete unit/type passes are retained as dated evidence, not represented as the final shared-checkout gate result. No full local browser inventory or production audit/deployment was requested for this local phase.

## Visual/manual evidence

See the [actual-app gallery](../evidence/header-zoom/README.md). Phone, 320px/200%, tablet, desktop, RTL/LTR, solid/Glass, Firefox/WebKit and simulated-inset/landscape images are included. Visually inspected the actual dark phone settings and enlarged-reading output, including readable source ink and single header/footer identity. Generated proposal boards are not test evidence.

## Documentation updated

README, architecture, design system, quality checklist, design coverage, agent index and decision log; the [approved phase brief](../phases/HEADER_ZOOM_LOCAL_2026_11_27.md); this report and actual-app gallery.

## Decisions recorded

The owner's revised header/100%/continuous-scroll design supersedes the earlier canonical portion toolbar. Original-page magnification remains secondary and does not compound reading enlargement. The separate excerpt/listening popup retains its own bounded presentation. All work remains local; no commit, push, deployment or release-note rewrite.

## Known limitations or remaining risks

The aggregate checkout contains independent learning/source/sharing changes. Complete gate failures are reported in Commands run without altering unrelated code, coverage thresholds, assertions or bundle ceilings. Desktop/phone browser evidence does not prove physical Android, assistive-technology or native-pinch acceptance. Exceptional large text and short screens retain deliberate scrolling/reflow.

## Out-of-scope findings

Earlier aggregate checks encountered independent LearningDiagram type/i18n errors; subsequent typecheck passed. The final run retained an unused sharing import, four book/source integrity failures, four book/source formatting findings and the aggregate output ceiling failure. Their current exact results are recorded in Commands run. No unrelated remediation or publication is included.

## Recommended next step

Owner review of the actual local screenshots, followed by physical-device/assistive-technology acceptance and independently coordinated aggregate release repair. Retain the publication hold.
