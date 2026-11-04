# Phase report · Glass and reader polish

## Objective and scope completed

Keep mobile Quran Wird headings stationary, improve the three long-surah reading cards, expose reader vibration settings, preserve Glass translucency during hover, strengthen dark paper and soften scrolling boundaries.

## Files and components

- QuranWirdScreen owns its scrolling overview beneath the shared Header.
- ReaderScreen uses one wrapping gold heading, 4:3 artwork and App's existing haptic preference. Arabic/English dictionaries supply the vibration actions.
- ScreenContainer and SettingsScreen load the shared scroll-edge stylesheet with their screen code. Progress has a separate edge beside its independently scrollable controls.
- Shared material, card, motion and Home styles retain backdrop/ink stability. The dark paper generator and asset regression define the stronger alpha.
- Existing sharing image 2 uses lossless progressive JPEG coding, saving 8,705 bytes. Pillow confirms identical decoded pixels, size, mode and ICC/EXIF/DPI/comment metadata. The offline sharing assertion uses the resulting byte length.

## User-visible changes and accessibility

Mobile Quran Wird scrolls below its title. Long-surah headings appear above taller images using gold ink selected for light or dark surfaces. Reading, listening and completion actions remain reachable at 320px and 200% text. Vibration can be enabled or disabled beside reader sound and persists through the existing App boundary.

Ordinary Glass summary cards use the same tint as other cards. Whole-control hover brightness and full-card tint washes are removed. Icon feedback and keyboard focus remain. Completed opacity entrances release their animation layer. The dark paper alpha gain changes from 1.35 to 1.7 with the same 6,267-byte asset size and unchanged light paper.

A static 12px masked edge and 4px blur soften content passing below fixed controls. Header text remains outside the mask. The edge passes pointer events through and is omitted in high-contrast, reduced-transparency and forced-color modes. The scroll threshold controls visibility without interpolating blur or geometry.

## Verification

- Focused ReaderScreen, QuranWirdScreen and ReaderOptions units passed 39 tests.
- Initial card material, reader, modal and artwork browser matrix passed 27 cases in four minutes across Chromium, Firefox and WebKit.
- Header, enlarged-surah, paper and fallback browser matrix passed 36 cases in 1.7 minutes across all three engines.
- AccessibleCombobox regression now assigns its scroll spy to the individual option, isolating it from shared-registry test history. Its 11 tests pass.
- The Pages build passes the existing bundle/CSS ceilings after loading scroll-edge rules with their owning screens and removing redundant hover rules.
- Settled-input results and release gates are recorded in output/glass-reader-settled-browser.log and output/glass-reader-polish-quality-final.log.

Screenshots are retained under output/playwright/glass-reader-polish-final, output/playwright/soft-edges-paper and output/playwright/glass-reader-settled. Visual inspection includes the enlarged Al-Mulk artwork, gold title, translucent Progress cards and stationary Quran Wird heading.

## Comparison and recommended next step

This comparison uses our browser evidence and other products' official descriptions. It establishes design opportunities rather than comparative usability scores.

| Product                 | Relevant pattern                                                                                        | Opportunity for Azkarapp                                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Quran.com               | A reading bookmark can identify a verse or page, be replaced and be undone. Guest bookmarks stay local. | Make continuation labels consistently show the surah and page. Our existing saved positions provide the state needed. |
| Pillars                 | Prayer tracking has a focused page, a simple recording action and a weekly view.                        | Consider a quieter Home hierarchy with one dominant current action and secondary information behind disclosure.       |
| Tarteel                 | Memorization-specific highlights can be switched off and belong to a defined reading mode.              | Keep optional aids within Reading/Listening options and preserve an uncluttered Focus surface.                        |
| Apple's scroll guidance | Soft scroll edges separate moving content from stationary controls and need legibility checks.          | Use one narrow edge per pane, with protected controls and clear accessibility fallbacks.                              |

Sources are [Quran.com bookmarks](https://quran.com/en/product-updates/reading-bookmark-easily-track-your-quran-progress), [Pillars prayer tracking](https://thepillarsapp.com/prayer-tracker-app), [Tarteel optional highlights](https://support.tarteel.ai/en/articles/12414495-understanding-mistake-highlight-colors) and [Apple scroll views](https://developer.apple.com/design/human-interface-guidelines/scroll-views).

## Documentation and remaining acceptance

Design, motion, quality, decision, phase and Android handoff notes are updated. No persisted-state schema or religious text changes are involved. Physical Android vibration, WebView compositing and scrolling with large system text remain device acceptance. The proposed Home/continuation hierarchy changes need a separate design review.

## Interrupted-run reconciliation — 2026-11-04

The previous conversation ended before reporting its final browser result. The retained output/glass-reader-settled-browser.log confirms **52 passed (7.2m)** across Chromium, Firefox and WebKit. Its named final quality log was not present; do not infer a complete final quality pass from the interrupted conversation. The local Audio Mushaf space report records the subsequent complete working-tree gate. Existing shared Glass cards, scroll edges, artwork/title, counter-vibration and dark-paper changes are preserved. Physical-device and aesthetic acceptance remain open. No publication occurs in this local continuation.
