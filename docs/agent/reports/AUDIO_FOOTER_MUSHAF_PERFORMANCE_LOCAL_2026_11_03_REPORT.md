# Phase Report — Audio footer and Mushaf performance

## Objective and scope

Compact the audio footer, keep the control lock available in Focus mode, and reduce contention between Mushaf reading and downloads. The phase stays local.

## Files and components

- FloatingAudioPlayer, its stylesheet and the Arabic and English listening labels.
- Mushaf scheduler, QCF loader, full and immersive readers, page canvas and snippet hook.
- Mushaf offline cache, storage estimates, Downloads panel and download session.
- Player, lock, scheduler, cache and download regression tests.
- Architecture, quality checklist, decision log and phase index.

## User-visible behavior and accessibility

Queue and repetition share a row. Repeat opens a labelled, portalled options panel. Play next uses a stable switch label. An active timer appears beside the playback context. Focus mode keeps the lock control, with the existing protected unlock dialog and focus recovery. The lock protects in-app controls from accidental touches.

Downloads reports verified bytes and page counts separately. Its Mushaf check can complete independently of the audio audit. Previous figures are a checking hint until cache validation finishes.

## Verification and evidence

- Player and lock units passed 47 cases.
- Download and scheduling units passed 31 cases. QCF units passed 18 cases, including eviction and backtracking.
- Pages build passed the existing bundle and CSS checks.
- Browser screenshots are under output/playwright/audio-footer and output/playwright/audio-mushaf. Arabic and English focus locking passed in Chromium, Firefox and WebKit.
- Command output is retained in output/audio-footer-browser.log, output/audio-mushaf-final-browser.log, output/audio-mushaf-quality.log and output/audio-mushaf-pages.log.

## Limitations and follow-up

The versioned session hint does not replace cache validation. Each audit still checks cached bodies in batches. Remote font sizes without bundled metadata remain estimates. The twelve-face target can be exceeded when more faces are in active use. Browser tests and controlled queue assertions do not establish Android cold-open, warm-open or turn percentiles. Measure those on the physical tablet before evaluating the speed gain.

## Final browser and build notes

The audio browser run passed 52 cases. Its WebKit desktop case timed out and passed in isolation. The download and warm-spread run passed 27 cases. One WebKit landscape route loaded during the preview rebuild and passed when rerun against the stable build. The isolated logs are output/audio-footer-webkit-retry.log and output/audio-mushaf-landscape-retry.log.

The final Pages build passed. Lossless recompression reduced the owner timing pack from 90,956 to 85,644 bytes. Its decoded bytes are identical and the validation script passed with the updated compressed hash. The existing bundle ceilings are enforced. The refreshed preview responded with HTTP 200 on port 4197.

The final pnpm check passed, including coverage, lint, type checking, content checks and both build budgets. The report and design notes were formatted separately after that run.

## Footer follow-up verification

The follow-up removed visible preparation and buffering lines from the app shell and player reading area. The screen reader status stays available. The player and stylesheet now place queue, applicable repeat context, the renamed auto-play switch and focus/lock above the waveform. Transport stays below. The labels and tests were updated in Arabic and English. No product behavior other than the presentation and wording changed.

The two affected unit suites passed 68 tests. Nine phone, enlarged-text and Focus lock cases passed across Chromium, Firefox and WebKit. One additional Chromium desktop case passed. Reviewed phone and desktop screenshots under output/playwright/audio-footer-order and output/playwright/audio-footer-order-desktop. The full pnpm check and Pages build passed. Logs use the output/audio-footer-order prefix.

## Single-row controls and options panel

Compact audio controls use icons and counts in one row above the waveform. Their full accessible names remain available. Options has a stationary heading and close action above a padded scrolling body, semantic label icons, thin scrollbar styling and a protected opaque surface. The compact row hides the timer text and shows an active timer icon in the options trigger.

The player unit suite passed 45 tests. Nine phone, enlarged-text and Focus lock cases passed across Chromium, Firefox and WebKit. Chromium also passed 320px, phone and enlarged layouts and prescribed-repeat interaction. The continuity test was updated to the current focus-actions container and passed. The full quality gate passed in 226.9 seconds and the Pages build passed. An additional 320px case with queue and repetition counts exposed crowding and led to bounded flexible count controls. Final verification logs use output/audio-single-row-count-verified and output/audio-single-row-quality-verified.

The final queue-plus-repeat case passed at 320px, and the enlarged continuity case passed with the compact switch. A 61-byte standard-build overage was resolved by removing redundant footer CSS. The final pnpm check passed in 142.2 seconds and the final Pages build passed. Evidence is retained in output/audio-single-row-quality-final.log, output/audio-single-row-pages-final.log and output/audio-single-row-count-verified.log. The preview was refreshed and returned HTTP 200.

## Label priority and restrained hover follow-up

The owner rejects the previous width allocation and icon-only continuation switch. The row now gives flexible space to a visible “التالي تلقائيًا” / “Play next” label. Queue and repeat use bounded content widths. The compact next-arrow beside the switch was removed because the label describes the action. Focus and lock retain their controls.

Hover feedback is scoped to audio controls and settings. It uses a soft fill and the existing icon cue at 1.035 scale. Pointer hover keeps the border stable. Keyboard focus retains the shared visible indicator. The timer field uses the grouped settings treatment and a shorter recovery explanation. Existing reduced-motion handling governs the icon cue.

Affected files are FloatingAudioPlayer, its stylesheet, Arabic/English listening copy, the audio layout/continuity/count browser regressions, design/quality/decision notes and this phase/report. No new presentation component was added.

The initial targeted player/provider units passed 68 cases. The browser tests assert visible labels, overflow and row geometry, switch width relative to queue, pointer border stability, keyboard options opening and opaque scrolling surfaces. Final exact results are recorded before completion.

To retain the bundle ceilings, lossless PNG compression saved 2,141 bytes across the existing 192/512 icons and dark paper tile. The decompressed PNG scanlines and every non-IDAT chunk remain identical. The accepted light-paper asset is unchanged. Evidence is output/audio-labelled-lossless-assets.json. The dark tile is now 6,267 bytes, with the same strength and pixels as the 7,358-byte version. Regenerating it with the existing script may use a larger compressed stream and should be budget-checked.

The final Pages build passed, including existing bundle and CSS checks. The first complete quality run passed every stage except formatting, which read the decision log while its update was being formatted. All changed documentation then passed a separate formatting check. The final full run is recorded in output/audio-labelled-priority-quality-final.log after the documentation settled.

Visual inspection covered the Arabic phone footer and options panel in output/playwright/audio-labelled-priority. The label is readable and the compact queue no longer fills the row. The protected panel shows a shorter grouped timer explanation. Physical-device aesthetic acceptance remains open.

Final verification completed with 13 targeted browser cases passing across Chromium, Firefox and WebKit in 3.4 minutes. The full pnpm check passed in 147.6 seconds, including coverage, lint, format, types, content/timing checks and bundle/CSS budgets. Pages build passed. Logs are output/audio-labelled-priority-final-browser.log, output/audio-labelled-priority-quality-final.log and output/audio-labelled-priority-pages.log. The refreshed isolated local preview returned HTTP 200. No commit or publication was performed.

## Audio menu structure follow-up

The owner requests clearer grouping, label spacing and alignment. Playback now groups voice, speed and volume. Text and following groups text visibility, Quran magnification and listening word/follow controls when applicable. Voice and timer fields share a 12px column gap, and the voice label has a native field association. The inset scrolling body aligns its scrollbar rail beneath the fixed Close target. The top separator above the footer controls is removed.

Changed files are FloatingAudioPlayer, its stylesheet, Arabic/English group names, the audio layout browser regression and phase/design/report notes. Existing semantic sections, protected popovers, native scrollbars, field controls and focus handling are reused. Geometry assertions cover field gaps, rail alignment in both directions and absence of the footer border. Evidence uses the output/audio-menu-structure prefix. Final results are recorded before completion.

The first geometry run exposed a remaining inline voice caption, which was replaced with the associated block label. Enlarged text then exposed a fixed-pixel scrollbar offset while the Close target grows in rem units. The offset now follows the target's half-width. The original assertions remain intact. Redundant metadata rules from the removed loading line were deleted to retain the standard-build budget. Initial diagnostic logs are preserved alongside final verification.

## Consolidated flat-menu and header correction

The latest owner review supersedes the prior nested cards and rail-under-Close geometry. Playback and Text and following now use flat sections on the existing protected surface. Group outlines/fills and duplicated row gutters are removed; section spacing/dividers separate settings. Voice and timer retain their associated labels and 12px gaps. The native rail now stays at the panel edge. The single-row labelled footer, removed separator, quieter hover, focus/lock and earlier performance/update work remain.

The collection-header pills came from explicit per-wrapper background styles left behind after artwork was removed. Removing those styles preserves the shared contrast surface. Header Back opts out of the decorative control finish and retains hover, press and keyboard focus. Modified components are FloatingAudioPlayer, LayoutShells/IconButton and their existing styles/tests; no component or dependency was added. Browser regressions cover flat group surfaces, edge rail bounds, input gaps, transparent collection chrome and target containment. The earlier under-Close test is replaced because the owner explicitly rejected that design, rather than to mask a failure.

The prior serial check passed all unit tests (109.3 seconds), build, types and lint before cancellation for the new requested code. Its incomplete run is not final verification. Final commands, screenshots and limitations follow after verification. No commit or push.

## Reduced scrolling correction

The owner additionally requests consolidating settings. Speed and volume now share a responsive grid row and recover to one column when rem-scaled labels need room. Repeated label icons are removed. Existing full-width voice and timer fields keep the 12px label gap; text toggles remain grouped. Section gaps are reduced to 12px. Timer/device explanations move into native Playback help with a visible disclosure chevron. The actual sleep timer stays visible. AudioVolumeControl accepts an optional labelled-row presentation so iOS returns neither an unsupported trigger nor an orphaned row label. Arabic/English copy uses the existing i18n layer.

The targeted player/provider/header suites passed 77 tests after this correction. New browser assertions cover normal-phone settings without scrolling, paired target sizes/overflow and keyboard-reachable help. The first broader header run had 22 passes and three fixture failures because 834px uses the wide hero rather than the shared compact header. Its fixture now explicitly samples that theme at 600px; no application breakpoint changed. The first diagnostic remains in output/audio-flat-header-browser.log. Final evidence uses output/audio-consolidated-menu prefixes.

Visual inspection of the Arabic phone menu confirms a shorter flat panel with both playback controls on one row, grouped text options, the timer and collapsed help visible together. The dark Glass collection header is also inspected without the former title/tool pills. Representative evidence is output/playwright/audio-consolidated-menu/audio-expanded-layout-expa-a2b41--canvas-phone-cross-browser-desktop-chromium/frosted-options-phone.png and output/playwright/audio-consolidated-menu/reader-alignment-en-834-1--15911-quiet-surface-cross-browser-desktop-chromium/morning-quiet-header.png. The nested volume popup additionally receives the existing protected dropdown surface contract, with an opacity/Escape/focus regression. No new cache, data schema, dependency or content changes belong to this menu correction.

### Consolidated verification commands

Browser commands use `E2E_BASE_URL=http://127.0.0.1:4197`, the isolated preview built with `VITE_CLOUDFLARE_API_URL=http://127.0.0.1:4197/__browser-test-api`. No test writes to production.

| Command                                                                                                                                                                                                                                                                                                      | Exact result                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm exec vitest run src/app/components/FloatingAudioPlayer.test.tsx src/app/audio/AudioProvider.test.tsx src/app/components/LayoutShells.test.tsx`                                                                                                                                                         | Exit 0; 3 files, 77 tests passed in 11.61s before the final protected-volume attribute; the full gate covers that final attribute/assertion. |
| `pnpm exec playwright test e2e/audio-expanded-layout.spec.ts e2e/reader-alignment.spec.ts --grep 'expanded listening\|collection headers use one quiet surface' --project=desktop-chromium --project=desktop-firefox-smoke --project=mobile-webkit-smoke --output=output/playwright/audio-consolidated-menu` | Exit 0; 25 passed in 3.6 minutes.                                                                                                            |
| `pnpm exec playwright test e2e/audio-expanded-layout.spec.ts --grep 'canvas: phone' --project=desktop-chromium --project=desktop-firefox-smoke --project=mobile-webkit-smoke --output=output/playwright/audio-consolidated-menu-volume-final`                                                                | Exit 0; 3 passed in 40.0s against the final volume-popup surface and Escape/focus assertions.                                                |
| `pnpm exec vite build --outDir output/local-update-masbaha-preview`                                                                                                                                                                                                                                          | Exit 0; final isolated preview refreshed.                                                                                                    |
| `git diff --check`                                                                                                                                                                                                                                                                                           | Exit 0.                                                                                                                                      |

Logs: output/audio-consolidated-menu-units.log, output/audio-consolidated-menu-browser.log, output/audio-consolidated-menu-volume-final.log and output/audio-consolidated-menu-preview-final.log. Final full gate and Pages results are appended after completion. The serial check is the existing complete `pnpm check` inventory with one concurrent stage; no checks or thresholds are removed.

The first final serial gate passed unit coverage (146.4s), build, types, lint, formatting, content/timing, motion and CSS utilities, but reported a 31-byte total-output overage (12,582,943 versus 12,582,912 bytes). The redundant listening-button selector was removed because these buttons already carry audio-options-row. The explicit block display was also redundant for direct flex children. No layout behavior, assertion or ceiling changed. Rebuilt final budget/gate results follow; the diagnostic is output/audio-consolidated-menu-quality-final.log.

## Final owner-comment audit

The owner requests تلقائي and no keyboard-help entry in mobile menus. The Arabic caption changes while the full accessible switch name remains. ReaderScreen, CustomCounterScreen and FridaySalawatScreen now omit that item in their existing compact layout below 768px; wide-menu help and actual keyboard shortcuts remain. Existing browser assertions are updated to the approved visibility, wording and row-above-waveform arrangement. The interrupted full gate is not reported as a completed pass; final settled-input verification follows.

| Previous comment                                              | Consolidated implementation                                                                                                    |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Blank controls below 384px; generic app/browser notifications | Preceding deployed narrow-tabs/notification checkpoint retained.                                                               |
| Optional update without hard refresh                          | Prepared versus accepted activation, Later and Android consent retained; no forced update.                                     |
| Awkward mobile Masbaha menus                                  | Dedicated settings sheet and draft/apply workflow retained.                                                                    |
| Stronger dark paper                                           | Stronger dark-only tile retained; accepted light tile unchanged.                                                               |
| Quran font/size flash                                         | Parallel warm resources and navigation prefetch retained; first uncached font still requires acquisition.                      |
| Crowded audio footer and preparation layout shift             | No routine visible loading line; one labelled context row above waveform; independent focus and lock retained.                 |
| Audio options cards, alignment, scroll, input gaps, hover     | One protected flat panel, fixed header, edge scroll, 12px field gaps, quieter hover, adaptive speed/volume and collapsed help. |
| Zikr title/tool highlights                                    | Individual fills and Back sheen removed; shared contrast/focus retained.                                                       |
| Mushaf performance/cache/download improvements                | Foreground scheduling, bounded unused decoded fonts, verified offline bytes and independent status checks retained.            |

The audit found stale label/menu-placement browser assertions and the orphan iOS volume label; both are corrected in this follow-up. Remaining acceptance is human visual/assistive-technology review and physical Android performance/update checks. No religious content, persistence schema, dependency or deployment changed. Recommended next step is owner review of this local build.

### Settled-input results

| Command                                                                                                                                                                                                                                                                                                                                                  | Result                                                                                                                                                |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm exec vitest run src/app/components/FloatingAudioPlayer.test.tsx src/app/screens/ReaderScreen.audio.test.tsx`                                                                                                                                                                                                                                       | Exit 0; 67 tests passed in 9.31s.                                                                                                                     |
| `pnpm exec playwright test e2e/audio-expanded-layout.spec.ts e2e/practical-devotional-access.spec.ts e2e/reader-quran-refinement.spec.ts --grep 'canvas: phone\|keyboard instructions follow\|focused menu ar/390' --project=desktop-chromium --project=desktop-firefox-smoke --project=mobile-webkit-smoke --output=output/playwright/audio-final-copy` | Exit 0; 9 passed in 1.1 minutes, using the isolated loopback preview.                                                                                 |
| `pnpm check`                                                                                                                                                                                                                                                                                                                                             | Exit 0; complete gate passed in 131.4s, including coverage (128.5s), lint, formatting, types, content/timings, motion and existing bundle/CSS limits. |
| `pnpm build:pages`                                                                                                                                                                                                                                                                                                                                       | Exit 0; production Pages build, bundle budget and CSS checks passed.                                                                                  |
| `git diff --check`                                                                                                                                                                                                                                                                                                                                       | Exit 0.                                                                                                                                               |
| Local preview HTTP HEAD                                                                                                                                                                                                                                                                                                                                  | 200.                                                                                                                                                  |

Final logs use output/audio-final-copy-{units,browser,quality,pages,preview}.log; screenshots are in output/playwright/audio-final-copy. The isolated preview contains the final application changes. The broader flat-menu/header matrix also passed 25 cases; subsequent changes received the final nine-case regression above. Latest modified components additionally include the three reading screens, AudioVolumeControl and LayoutShells. Design, quality, decision and phase notes record the consolidated contracts. No commit, push or deployment occurred; HEAD remains 9b7378c5. The full browser inventory and physical-device acceptance are not claimed from these targeted local checks.

## Outside dismissal, notification copy and cache reuse

Repeat, Audio options and Volume now handle outside pointer actions even if the reading surface consumes the later click. Nested controls preserve their own pointer and Escape behavior. Keyboard dismissal restores the trigger and outside dismissal leaves focus with the clicked control. Dividers separate settings without the two visible group headings. The three counter menus omit keyboard help on short touch viewports, including phone landscape.

The shared notification copy in notificationCopy.ts serves the foreground browser hook and both Android scheduling adapters. Arabic and English titles identify the prayer or reading. Prayer copy distinguishes due now from advance reminders. Contextual reading bodies identify the action and the test copy confirms receipt. Notification names in Settings use the same reading labels. Scheduled times, selected prayers, routes, permission and content are outside this copy change.

The cache reload regression verifies both stored page JSON and WOFF2 entries and reloads the spread with resource requests blocked. Chromium, Firefox and WebKit each render both exact page fonts from storage. Existing Downloads supports selected pages or the full Mushaf. A genuinely uncached page can still upgrade from readable text on its first visit. Browser storage eviction and native device acceptance remain relevant. Download-size estimates for unsaved fonts still use the existing estimation contract.

Files include FloatingAudioPlayer, AudioVolumeControl, the outside-dismiss hook, the three counter screens and shared keyboard policy, Arabic/English dictionaries, foreground/native reminder delivery, their unit/browser tests and prayer/design/decision/phase notes. The existing sleep-sharing JPEG was re-encoded with jpegtran progressive entropy coding to retain the bundle limit. Pillow verified identical decoded pixels, ICC, EXIF, DPI and comment fields. The file shrank from 139,375 to 131,054 bytes.

| Command                                                                                                                 | Result                                                             |
| ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Targeted Vitest run for FloatingAudioPlayer, native reminder scheduling, reminderPlan, NotificationsPanel and qcfMushaf | Exit 0, 74 tests in 10.38 seconds.                                 |
| Playwright audio layout, repeat, keyboard instructions and cache reload cases on Chromium, Firefox and WebKit           | Exit 0, 10 cases in 1.3 minutes.                                   |
| `pnpm check`                                                                                                            | Exit 0 in 136.7 seconds, including coverage and unchanged budgets. |

Evidence is in output/menu-notification-cache-{units,browser,quality}.log and output/playwright/menu-notification-cache. The Arabic phone screenshot shows the two title-free groups and their divider. Physical Android notification appearance and delivery, and assistive-technology validation remain manual acceptance. Continue review on the local preview.

The Pages build passed its bundle and CSS checks. The final isolated preview rebuilt successfully and returned HTTP 200 on port 4197. The working tree remains local at HEAD 9b7378c5.

## Mushaf control separation and short surahs

The phone toolbar used an absolute safe-area offset while the paper reserved fixed padding. With a large top inset, the control row could intersect the first line. MushafPageViewer now places the compact tool bands outside the paper scrollport. Their actual size and device insets determine how much room the paper receives. KhatmahReaderScreen uses the same approach for the language switcher, and both Mushaf owners put the Focus exit in a dedicated bottom band. Entering Focus from the compact English pane displays the Arabic paper and returns to the same translation pane on exit.

ReaderScreen shows short surahs in zikr groups with the basmalah and verses. The decorative QuranChrome heading and metadata were removed from this presentation. The passage retains its localized accessible name. The full Mushaf still uses the canonical heading and basmalah slots. Reviewed text, counts and download behavior are preserved.

Focused changes include MushafPageViewer, MushafImmersiveReader, KhatmahReaderScreen, MushafFocusExit, shared layout styles, ReaderScreen and QuranChrome. Unit tests cover scrollport ownership, focus recovery and short-surah accessibility. Browser regressions exercise a 48px top inset, 24px bottom inset, Unicode and exact QCF pages, 320px at 200% text, independent scrolling, translation and focus. Al-Ikhlas fits at 320 × 600 with standard text. Scrolling remains available when the viewport or text settings require it. Changes are recorded in the design system, quality checklist, phase brief and decision log.

The first browser run exposed an extra translation row at standard text size. The translation toolbar now gives its language selector the full center track. Its original height-restoration assertion is unchanged. The updated focused unit run passed 85 tests in 17.23 seconds. Final browser and build results follow. The device screenshot was used to reproduce the geometry with simulated insets, and physical Android acceptance remains open.

Final browser run passed 16 cases across Chromium, Firefox and WebKit in 2.8 minutes. The Pages build and bundle/CSS checks passed. The parallel pnpm check timed out in the existing 604-page cache unit (45-second limit), with the other 2,513 units passing. The complete pnpm check:serial passed in 262.5 seconds, including coverage, types, lint, formatting, content and bundle/CSS gates. No thresholds changed. Evidence is in output/mushaf-bands-{units-final,browser-final,quality,quality-serial,pages,preview-final}.log and output/playwright/mushaf-bands-final. The local preview returned HTTP 200. Review the reading layout on the original phone for physical inset and assistive-technology acceptance. The working tree remains local at HEAD 9b7378c5.

## Stable font settlement, measured download sizes and Progress/hover review

The owner approves brief preparation before first Quran rendering and stable fallback if the exact font is slow. Full Mushaf and embedded/listening passages start data/font work together and wait up to 1.2 seconds after local data resolves. The chosen font remains stable when the late font completes. Ready cache entries retain exact glyphs from the first render. The late font remains available for subsequent navigation. Explicit retry remains available. This supersedes the old late-upgrade limitation in earlier report checkpoints.

The measured catalog contains every shipped page JSON length and all 604 remote font Content-Length values, with bundled-font checks. Version dfaedf705e388982 totals 2,940,607 page bytes and 97,748,636 font bytes, 100,689,243 bytes combined. Missing-resource accounting sums each absent component separately. Stored bytes still use actual validated bodies. Generate or refresh the catalog with node scripts/generate-mushaf-asset-sizes.mjs --refresh after source changes. The initial metadata acquisition and ETags are retained in output/mushaf-size-observations.json. Remote resources can change at their provider URL, so the catalog is a measured release snapshot. Actual transfer and cache validation remain authoritative.

The Progress sticky controls now participate directly in the screen scroll layout. The title retains sticky placement within the enlarged controls area. Full-height scrolling, pointer wheel where supported, 200% text and RTL/LTR header coordinates are covered. The former normal-size regression checked material appearance but did not assert the title's position.

The hover audit inspected the shared global brightness, card, button, form/menu, toggle, Home, counter, sharing and audio recipes. Shared icon cues now use 1.05 and fixed target geometry, with a 6% card tint and keyboard-only focus boundary. Audio retains 1.035. Ungated Home inset, sharing-artwork and counter hover rules now require a fine hovering pointer. The Home Tasbih arrow no longer travels sideways. Form/menu selection and error states retain their role-specific distinction. Human aesthetic acceptance remains subjective, while geometry, focus and reduced-motion behavior have automated coverage.

Modified components and boundaries are qcfMushaf, useListeningMushafPage, useQuranSnippet, QuranVerseText, AyahMushafText, MushafExcerpt, both full-page readers, ProgressScreen, DownloadsPanel, downloadStorage and Mushaf offline status, shared motion/card/control styles and existing feature/browser tests. The size generator and catalog validation test are added. No runtime dependency is added. Architecture, design, quality, motion, phase and decision notes record these contracts.

Focused units passed 92 tests in eight files. The final font/cache, header and shared icon browser run passed 33 cases across Chromium, Firefox and WebKit in 2.3 minutes. A separate settled-hook/catalog run passed eight cases in 3.28 seconds after strengthening the deferred-font test. Initial diagnostic failures identified a test reading the temporary preparation box too early and unsupported mobile WebKit mouse-wheel input. The corrected test awaits preparation completion and exercises native scrollTop on mobile. Neither product assertion was weakened. Screenshots under output/playwright/stable-font-final include the sticky Progress heading after scroll and stable fallback before/after exact-font loading. Home/Library/Quran/Progress hover evidence is under output/playwright/shared-hover-review. Final broad-hover and complete quality results follow.

### Final verification

| Command or feature run                                                                                                                                                  | Exact result                                                                                                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Delayed-font, offline/reload cache, Progress header and shared icon browser cases on Chromium, Firefox and WebKit                                                       | Exit 0; 33 passed in 2.3 minutes. Log: output/stable-font-final-browser.log.                                                                                                                 |
| Home action feedback, motion alternatives and Library/Quran navigation browser cases on all three engines                                                               | Exit 0; 30 passed in 6.1 minutes. Log: output/shared-hover-review.log.                                                                                                                       |
| `pnpm exec vitest run src/app/components/FloatingAudioPlayer.test.tsx src/app/components/QuranBilingualStreamView.test.tsx src/app/screens/AzkarLibraryScreen.test.tsx` | Exit 0; 3 files, 61 tests passed in 13.95 seconds. Log: output/stable-font-consumer-tests-final.log.                                                                                         |
| `pnpm check:serial`                                                                                                                                                     | Exit 0 in 184.7 seconds. Full unit coverage, build, types, lint, formatting, content/timing, type-scale, motion, bundle and CSS checks passed. Log: output/stable-font-quality-complete.log. |
| `pnpm build:pages`                                                                                                                                                      | Exit 0; production build and existing bundle/CSS limits passed. Log: output/stable-font-pages.log.                                                                                           |
| `pnpm exec vite build --outDir output/local-update-masbaha-preview`                                                                                                     | Exit 0 with the isolated loopback test API; preview contains the final application changes. Log: output/stable-font-hover-preview.log.                                                       |

The full gate initially identified synchronous text expectations in the Library, bilingual reader and player tests. These now await the approved bounded preparation state before making the same content assertions. The final complete gate covers those changes. No test was skipped, assertion weakened, timeout increased or budget raised. The serial gate runs the complete existing inventory without competing heavy stages.

The latest font-settlement and measured-catalog contracts supersede earlier checkpoint notes about late visible font upgrades and estimated Mushaf font sizes. Browser storage can still be evicted by the platform. Remote size metadata is a release snapshot; actual validated bytes remain authoritative. Physical Android timing, notification delivery, safe-area behavior and assistive-technology acceptance remain manual follow-up. The browser checks establish shared hover consistency and primary-flow behavior, rather than exhaustive aesthetic acceptance of every screen.

Architecture, design, motion, quality, decisions and the active phase brief are updated. Recommended next step is a physical-device reading, Progress scrolling and notification smoke test against these local changes. No commit, push or deployment occurred; HEAD remains 9b7378c5.

## Release preparation on 2026-11-04

The owner authorized pushing the completed batch. The Arabic and English update notes and Android release handoff are included. Regenerating the offline notes archive with the default compressor exceeded the total bundle ceiling. Lossless gzip recompression reduced the archive from 95,050 to 89,747 bytes. The decoded archive matches the source, and the release-notes check passed. The bundle ceiling stays in force.
