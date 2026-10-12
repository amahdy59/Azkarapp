# Phase Report — Performance, motion and Quran refinement

## Objective

Apply the approved responsiveness, robustness and motion recommendations in a bounded phase, together with the owner's smaller Quran text, basmalah spacing and menu cleanup. Provide screenshots for owner verification and complete the existing main/Pages release cycle.

## Plan and scope completed

Inspect current implementation and contracts; record a throttled startup baseline; improve known font-loading and diagnostic boundaries; reduce flowing Quran typography; remove redundant Reader menu actions and obsolete share prefetch; polish keyboard-counter feedback and completion motion; verify targeted units, responsive browser geometry/accessibility and release gates. No architecture replacement, new dependency, content edit, persistence migration or weakened gate.

## Files changed

Shared Quran typography/theme token, QuranChrome, QuranSurahListeningReader and ReaderScreen; useListeningMushafPage and tests; observability and tests; ZikrComponents and tests; motion.css and completion test; Quran excerpt/listening and Reader audio tests; audio-surah-stream, practical-devotional-access and new reader-quran-refinement browser specs; architecture/design/motion/audio contracts, decision log/index, release summary/history and this report.

## Components added or modified

No new product component. Reuse QuranPrelude, QuranSurahHeader, MushafExcerptCanvas, QuranWordText, ReaderFooterTools, existing options and ZikrCounterSurface. Native page/font services and the existing telemetry boundary retain ownership.

## User-visible changes

Flowing Quran now uses 21.5/23/27px at standard root sizes and 1.65 leading. Continuous surah listening no longer adds 25% automatically; default size falls from 30px to 23px, with explicit enlargement retained. Basmalah artwork becomes 11rem wide with compact surrounding spacing; page-fragment gaps no longer interrupt continuous surahs. Printed Mushaf fitting and pagination are unchanged. Reader options omit Read again, duplicate Focus and keyboard help; dedicated footer Focus and desktop/tablet keyboard help remain. Overflow no longer warms export fonts. Complete local page words render before the optional font finishes. Counter keys get finite pressed feedback, without counting held-key repeat events. Home completion fades/transforms before removal without per-frame grid-row reflow.

## Accessibility work

Retain reviewed semantic Quran alternatives, RTL/LTR, keyboard focus recovery, 44px controls, enlarged text, local offline reading, OS/app reduced motion and native overflow. Counter feedback releases on keyup/blur/cancel. Scoped diagnostics contain collector failures. Automated axe/geometry tests and screenshot inspection are not complete human screen-reader or physical-device certification.

## Tests added or updated

Immediate fallback, font rejection and stale font cancellation; CLS session windows, grouped INP/outlier diagnostics, latest LCP, unavailable observers and blocked/declined collectors; deliberate keyboard presses/reduced motion; menu omissions and retained focus/recovery; Reader/playback typography parity; eight Arabic/English responsive menu/basmalah/200%-text/axe scenarios. Existing rapid navigation/counting, offline and full CI inventory remain.

## Commands run

| Command                                                                        | Result                                              |
| ------------------------------------------------------------------------------ | --------------------------------------------------- |
| Pinned Node/pnpm verification                                                  | Node 24.21.0 and pnpm 11.19.0.                      |
| Baseline startup browser spec, Chromium                                        | 3 passed, 23.5s; throttled Home visible in 5,585ms. |
| Focused Reader/Quran/font unit tests                                           | 41 passed across 4 files, 11.28s.                   |
| Observability units                                                            | 8 passed, 1.18s.                                    |
| Shared counter units                                                           | 7 passed, 10.89s.                                   |
| Typecheck                                                                      | Passed, exit 0.                                     |
| Reader Quran/menu, continuous listening and typography browser specs, Chromium | 26 passed, 1.3m.                                    |

Final cross-engine, motion/reliability, quality, hook and production results are recorded after completion. No pending run is described as passed.

Additional performance work changes startupMaintenance and its tests, HomeScreen and its render test, and the startup browser measurement. A shared two-frame after-paint idle scheduler keeps optional work behind a visible frame. Equivalent reminder contexts retain stable identity across clock ticks; real context/language/slot/refresh changes still reload evidence. Load failure retains local reviewed fallback. Targeted Home/scheduler units passed 30 tests across 3 files in 9.00s; the final timer-fallback scheduler run passed 8/8 in 3.72s. Final shared counter units passed 8/8 in 4.21s. Counter reload/live OS motion checks passed all three engines, 3/3 in 37.2s. Focus/geometry/axe checks at 320/820/1440px in Arabic/English passed all three engines, 18/18 in 2.7m. Production audit found no known vulnerabilities. Candidate build/bundle check passed without any ceiling or baseline increase. The complete CI inventory accounts for 1,348 cases with no omissions or duplicates.

The Firefox/WebKit typography/menu/listening sweep initially finished 51 passed/1 failed in 7.7m. The 320px English WebKit gap assertion read passage and basmalah across separate frames while a font recentered the group. Reading both boxes atomically retains the same 16px limit; the corrected case passed Chromium/Firefox/WebKit. Initial keyboard checks exposed stale render-time OS reduced-motion preference; checking at activation repaired it and all three passed. One adapted focus fixture lacked the t import; repaired, then all 18 focused cases passed. A first startup recheck mistakenly served Pages-base dist at a root preview: all three failed to mount, an invalid diagnostic rather than a product result. Correct candidate previews passed. No failed diagnostic is counted as a pass.

Before final scheduler/context stabilization, startup rechecks varied from 9.84–10.87s; the added browser-frame probe measured 8.669s versus 9.961s automation observation. A diagnostic build overriding only the font-loading hook with HEAD measured 7.971s, showing the old wait also limited concurrent optional font work. The final scheduler/context candidate passed all three startup cases in 11.7s and measured 5.757s, near the original 5.585s baseline; no broad startup speedup is claimed. The test records the first visible Home frame separately from automation observation (5.915s). These lab results support preserving deferred work, not a promised field percentile. Diagnostic build/config remain ignored under output/performance-comparison.

## Visual/manual evidence

Owner reference screenshots inspected. Updated references live under output/playwright/performance-quran-refinement: reader-quran-mobile.png, reader-menu-mobile.png, reader-quran-desktop.png, reader-menu-desktop.png and tabarak-mobile.png. Responsive specs also capture 320px, tablet, English and 200% text. Mobile text/menu references have been displayed in chat. Baseline browser JSON is output/performance-motion-baseline.json.

## Documentation updated

Architecture, design system, motion and audio architecture explain changed contracts. Decision log records the owner-requested supersession of earlier enlarged type. Index identifies this active phase. Release notes describe only the current change and are archived before publication.

## Decisions recorded

Owner requests apply recommendations and screenshot-directed text/menu cleanup, then asks for image references after completed visible work. Existing autonomous release authority remains.

## Known limitations or remaining risks

Startup measurement is a six-times CPU/200kB/s desktop simulation, not a physical-phone benchmark or field percentile. Flowing text matches shared reading density rather than canonical fitted printed line breaks at every width. Custom metrics remain diagnostics with unsupported-entry, non-Chromium interaction-count and bfcache limitations; no full web-vitals parity is claimed. Real device comfort, battery/thermal behavior and TalkBack/VoiceOver still require human evidence. No blanket performance percentage or full accessibility certification is claimed.

## Out-of-scope findings

Home's existing static content graph still includes Al-Baqarah content. Changing that registration/lazy-loading boundary needs a separate content/state coverage review; it is not removed speculatively. Large-history storage and field performance require realistic device traces before structural optimization. Reviewed religious text, sources, counts and recordings are unchanged.

## Recommended next step

Review the supplied screenshots and physical-phone text density, then profile realistic long sessions and large histories to prioritize further measured reductions.

## Owner mobile pinch follow-up

The owner supplies a magnified Library screenshot and asks to stop pinch zooming the mobile UI, with accessible alternatives retained. A separate scoped layout rule applies only to coarse-pointer/non-hover devices: html/body, shell, scroll regions and dialogs permit panning without browser pinch magnification. Unrestricted viewport remains; no user-scalable=no, maximum-scale=1, blocking touch listener or data change. Existing Settings/Reader text sizing, explicit 100–200% Mushaf magnification, browser-menu zoom and OS magnification remain available. Browser accessibility overrides may still permit zoom and are intentionally respected. Automated tests dispatch a two-finger gesture through Chromium's mobile emulation, verify visualViewport scale, preserve native scrolling, test 200% text and run axe; Firefox/WebKit verify the gesture policy and enlarged-text/scroll behavior. Their gesture dispatch is not claimed as physical-device evidence. The first test selected the outer non-scrolling screen wrapper instead of the inner Library scrollport; corrected to the actual overflow-y-auto pane, retaining the scrolling assertion.

Final selected motion/counter/rapid-navigation matrix passed 17/17 in 1.5m across Chromium/Firefox/WebKit (the two normal-motion slide cases are existing Chromium cases). Release inventory remains complete and is rechecked after adding the mobile gesture spec.

Mobile gesture policy/scrolling/200%-text/axe checks passed all three engines, 3/3 in 30.4s. Inventory now proves 1,351 cases, assigned 193/193/193/155/155/104/103/103/152 without omissions or duplication. The first full pnpm check failed in 115.4s solely on two readingTypography legibility assertions (1,813 passed/2 failed across 254 files). The proposed smallest Quran size was below the unchanged 21.3px Arabic floor. Retained those assertions and adjusted final Quran sizes to 21.5/23/27px, keeping every setting above its corresponding ordinary long-text size and the existing floor. No threshold was lowered. Build, typecheck, lint, format, content/timing/type-scale/motion validation, bundle and CSS gates passed in that diagnostic. Final verification and release results are retained in output/playwright/performance-quran-refinement/RELEASE_VERIFICATION.md after completion.
