# Phase Report — Audio Mushaf space and word clarity

## Objective

Complete the screenshot-backed comment review; give audio Mushaf more reading space, footer recovery and a clearer timed-word cue; size the utility row to its content; and align Progress with shared header material.

## Scope completed

The preceding interrupted browser run completed 52 cases successfully. Its final full-quality log was absent; this checkpoint verifies the resulting working tree separately. Existing Glass/reader/paper/vibration work is preserved. All work remains local.

## Files changed

- `src/app/components/FloatingAudioPlayer.tsx`, `QuranListeningReader.tsx`, `QuranSurahListeningReader.tsx` and new `ListeningResumeButton.tsx` compose the shared footer recovery host and move paged navigation into existing Audio options.
- `src/app/components/MushafPageViewer.tsx`, `floating-audio-player.css` and `mushaf-magnification.css` reclaim obsolete clearance and provide stable word paint.
- `src/app/components/QuranListeningReader.test.tsx` verifies options placement, recovery portal cleanup and reading focus.
- `e2e/audio-mushaf-space.spec.ts`, `audio-surah-stream.spec.ts`, `quran-listening.spec.ts` and `helpers/quran-listening.ts` verify the new layout and preserve existing listening/offline checks.
- Architecture, design, quality, decision/index/phase documents and the preceding Glass phase report record the contract and interrupted-run reconciliation. The pending ReaderScreen.css artwork font declaration receives formatting-only line wrapping required by the full gate.

## Components added or modified

Added ListeningResumeButton. Modified FloatingAudioPlayer, both Quran listening readers and shared Mushaf word/page rendering. Reused the icon layer, translations, options portal, themes, audio controller and timing hooks. No dependency added.

## User-visible changes

Page selection is available in Audio options instead of above the Mushaf. Return to current ayah joins Focus/Lock in the footer, including Focus mode, and restores reading focus. Compact layouts show a named icon; wide layouts retain text. Footer recovery wraps when required. The text no longer reserves space for a floating recovery button or redundant header row, and printed pages use the available reading height.

The current timed word retains readable foreground ink with a stronger fill, two-pixel outline and underline. The rest of the ayah stays unshaded. Current-verse semantics/following remain; the marker remains a location aid without an active word. Optional word emphasis, exact recording checks, reviewed text and offline behavior are preserved.

## Accessibility work

Retained 44px tools, keyboard focus/recovery, semantic button names/titles, native page selection, independent scroll recovery and Focus/Lock. Tested RTL/LTR, 320px at 200% text, phone/tablet/desktop, light solid/dark Glass and Forced Colors. Word location has a shape/underline as well as tint. The reading screen is not a live region. Automated checks and browser geometry do not establish complete accessibility compliance.

## Tests added or updated

Added eight responsive scenarios covering paged and continuous readers plus an exact-glyph test using page 42's own shipped QCF font. Each checks word/neighbor paint, footer membership, pointer hit-testing, Focus clearance, recovery focus, system-color outline and one audio controller. Updated old assertions that required a header selector, floating recovery or changed word ink; scoped the page selector to its preferences region now that it shares Audio options with other fields. Existing page/offline recovery, text identity, magnification, optional highlighting and controller tests retain their behavioral checks.

## Commands run

| Command                                                                                                          | Result                                                                                                      |
| ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `pnpm test:run src/app/components/QuranListeningReader.test.tsx src/app/components/FloatingAudioPlayer.test.tsx` | Exit 0; 61 tests passed.                                                                                    |
| `pnpm typecheck`                                                                                                 | Exit 0.                                                                                                     |
| Final new-layout/paged-listening matrix (Chromium, Firefox, WebKit)                                              | Exit 0; 45 passed in 6.4m. `output/listening-polish-final-browser.log`.                                     |
| `pnpm check:serial`                                                                                              | Exit 0 in 445.2s; all stages, 2,520 tests and coverage passed. `output/listening-polish-quality-final.log`. |
| `pnpm build:pages`                                                                                               | Exit 0; unchanged bundle/CSS limits pass. `output/listening-polish-pages.log`.                              |
| `pnpm test:e2e:inventory`                                                                                        | Exit 0; 3,173 test identities assigned across all nine shards. `output/listening-polish-inventory.log`.     |

The first complete gate passed lint, build, type/content/timing/motion and bundle/CSS checks, but failed one pre-existing CSS formatting line and two 45-second offline-cache test timeouts under concurrent machine load (2,518 tests passed). The CSS line wrapping is corrected. Offline-cache reproduction and the complete serial gate retain the original assertions, timeouts and coverage. Browser verification is run separately from the final gate.

The first Chromium diagnostic passed 26/32 cases. Four new assertions incorrectly assumed the opening disconnected-letter verse had a second word, and two old assertions required gold word ink. The fixtures/assertions now check a multiword verse and the approved outline/underline treatment. Traces and the failed run remain in `output/playwright/listening-polish-chromium`; no skipped test, reduced assertion coverage or increased timeout is used.

## Visual/manual evidence

The owner requested an explicit instruction/work/evidence mapping. [Comment completion checklist](COMMENT_COMPLETION_2026_11_04.md) maps current and earlier comments, with clickable screenshots, source provenance and native/manual limitations. Fresh screenshot capture also verifies the reader vibration preference after reload and identical Quran Wird title coordinates before/after scrolling.

Screenshots and traces: `output/playwright/listening-polish-settled`. Inspect phone Focus in both readers and narrow/enlarged dark Glass alongside the tablet/desktop captures. The footer is separate from reading ink and the word cue leaves neighboring words clear. The exact-font test uses normal motion; responsive tests use reduced motion. No text animation was added.

## Documentation updated

`docs/ARCHITECTURE.md`, `docs/DESIGN_SYSTEM.md`, `docs/QUALITY_CHECKLIST.md`, `docs/agent/DECISION_LOG.md`, `docs/agent/INDEX.md`, this phase brief/report, the comment completion checklist and the previous Glass report.

## Decisions recorded

The owner's current local-only request supersedes historical publication instructions quoted in the pasted conversation. No commit, push, deployment or new release-note rewrite is part of this checkpoint. Existing pending release notes are preserved.

## Known limitations or remaining risks

Word cue accuracy remains bounded by the existing reviewed/owner-preview timestamps; this presentation change does not create or approve alignment. Missing exact page/font resources retain readable fallback. Physical Android safe areas, WebView glyph paint, TalkBack/VoiceOver and owner visual acceptance remain device work.

## Out-of-scope findings

Earlier Home/continuation design recommendations require their own approved scope. No religious text, timing assets, persistence/sync, native host or deployment changes were made.

## Recommended next step

Review this local player on the owner's Android device, especially Focus recovery, word clarity, large system text and TalkBack. Publish only after a subsequent explicit release request.

## Owner follow-up — footer pill and stronger-paper evidence

The owner's new screenshot reveals a fixed/growing auto-play wrapper spreading the label and switch apart. Removed the 9rem basis and compact 7rem growth/max-width rule. The wrapper no longer expands into spare row width; the switch uses intrinsic content width with a bounded label/track gap. The group stays centered with consistent existing spacing, visible labels and 44px controls. Added exact content-width/gap assertions and full-row captures to the responsive audio layout test. The former desktop assertion that auto-play must be at least as wide as queue is superseded by this owner correction; readable labels, one-row geometry and touch/focus assertions remain.

Compared the preceding committed dark PNG with the current stronger local PNG and texture off on identical Dark/Midnight × solid/Glass screens. Average tile alpha is 11.9197 → 14.9175/255 (+25.15%); peak is 20 → 26/255. Both files remain 6,267 bytes at 128 × 128. No further texture adjustment was made. Screenshots, source commit, measurements and a side-by-side gallery live in `output/comment-completion-evidence/dark-paper`; the comment checklist links each image.

The continuous-surah WebKit run passed all 18 cases in 4.7m after being separated from the heavy gate. Log: `output/listening-polish-stream-webkit-final.log`. All preceding final layout/paged cases passed 45/45, and the complete serial gate passed. The final footer follow-up passes its targeted matrix and combined quality/Pages gates, recorded below.

## Owner follow-up — homogeneous Progress heading

Progress already used Header but overrode its background variable with the opaque on-media surface and enlarged only the filter icon to 54px. The owner's latest screenshot requests consistency: the full-width sticky controls now join shared Glass clear-at-rest/frosted-on-scroll rules, the filter uses the ordinary icon token, and the edge uses the matching material tint. The nested Header does not gain its own frost. This explicitly supersedes the earlier always-opaque/no-frost Progress presentation, preserving data/date semantics and sticky/filter recovery checks.

Changed files: `src/styles/theme/materials.css`, `src/app/screens/progress-screen.css`, `src/app/components/scroll-edge.css`, `e2e/progress-internal-header.spec.ts`, `e2e/paper-grain.spec.ts`, new `e2e/progress-header-material.spec.ts`, and the corresponding architecture/design/quality/decision/phase/index records. The new test compares actual Quran Wird and Progress title typography and before/after-scroll material at identical sizes, checks standard filter size and hit-tests every visible control. Screenshots include both reference and Progress views.

The final intrinsic-footer/Mushaf follow-up matrix passed **39/39 in 7.1m** across all three engines, including 100-repeat and 320px queue cases. Log: `output/listening-footer-fit-final.log`. No timeout/coverage/budget changes. Final Progress, quality and Pages results are recorded below.

All 12 direct Progress-versus-Quran Wird header comparisons passed across Chromium/Firefox/WebKit. The existing enlarged filter tests also pass. Diagnostic tablet/desktop fixtures initially used a height where Quran Wird did not scroll; 600px windows exercise actual overflow without changing assertions. Two WebKit scroll-return checks read paint before the scroll-state commit; they now await the same non-scrolled state before checking the same transparent/no-frost values. No product delay or timeout change. Final screenshots and reference frames are copied unchanged under `output/comment-completion-evidence/progress-header-*.png` and `reference-header-*.png`, with source provenance.

## Final combined verification and handoff

| Command / selected matrix                                     | Exact result                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm check:serial`                                           | **Exit 0 in 314.8s**. Complete unit/coverage suite, build, typecheck, lint, formatting, audio/content/timing validation, type scale, motion rules and unchanged bundle/CSS budgets pass. Log: `output/local-polish-final-quality.log`.                                                                                                                   |
| `pnpm build:pages`                                            | **Exit 0**. Build in 9.62s, PWA generation and unchanged bundle/CSS gates pass. Log: `output/local-polish-final-pages.log`.                                                                                                                                                                                                                              |
| `pnpm test:e2e:inventory`                                     | **Exit 0**. 3,185 test identities assigned across nine shards. Log: `output/local-polish-final-inventory.log`. This collects inventory, not a claim that all 3,185 browser tests ran locally.                                                                                                                                                            |
| Final intrinsic footer / Mushaf matrix                        | **Exit 0; 39 passed in 7.1m**, three engines; phone/narrow/enlarged/desktop, exact QCF, focus/recovery, 100-repeat and 320px queue checks. `output/listening-footer-fit-final.log`.                                                                                                                                                                      |
| Final new-layout / paged-listening matrix                     | **Exit 0; 45 passed in 6.4m**, three engines. `output/listening-polish-final-browser.log`.                                                                                                                                                                                                                                                               |
| Continuous-surah WebKit matrix                                | **Exit 0; 18 passed in 4.7m**. Earlier continuous-surah Chromium/Firefox cases also pass in `output/listening-polish-settled.log`; that earlier whole run was interrupted and is not claimed as green.                                                                                                                                                   |
| Progress reference/material and existing scroll/filter matrix | **22 passed, 2 diagnostic scroll-state failures** in `output/progress-header-final-browser.log`; the affected two WebKit tests pass **2/2 in 40.9s** after awaiting actual settled scroll state, in `output/progress-header-webkit-scroll-final.log`. All 12 direct header comparisons and enlarged filter checks pass. No assertions/timeouts weakened. |
| Dark/Midnight solid/Glass paper cases                         | All four selected cases pass in each engine in `output/progress-header-shared-browser.log`; unrelated oversized reference fixtures and an interrupted remainder are retained as diagnostics.                                                                                                                                                             |
| Final changed report formatting and `git diff --check`        | Pass. Final report updates follow the application gate and do not change application/build inputs.                                                                                                                                                                                                                                                       |
| Local preview HTTP smoke                                      | **200** at `http://127.0.0.1:4197/`. It serves the final isolated browser build, with no production backend writes.                                                                                                                                                                                                                                      |

The user-visible final state is shown in the linked comment completion checklist. Final header-only captures show the exact reported area at rest and after scroll: `output/comment-completion-evidence/progress-header-detail.png` and `progress-header-detail-scrolled.png`. The excessive auto-play gap is absent in `audio-footer-row.png`. The paper comparison preserves previous/current/off versions and measurements in its linked gallery. Fresh captures were visually inspected.

All code, reports and evidence remain local. No commit, push, deployment, native version/signing, content/timing change or new dependency was performed. Pending release notes from the preceding batch remain untouched by this checkpoint. Physical Android delivery/vibration/safe-area/AT and owner aesthetic acceptance remain open. Recommended next step: review the local preview and screenshot checklist on the target phone before authorizing publication.

## Owner correction — equal control frames and icon alignment

The owner spots a remaining mismatch in the delivered header screenshot. Measured tab-group height was 54px (44px options plus 4px padding and border), while the filter was 44px. The preceding standard-size correction overlooked the outer frame. Added the shared section-view-actions grid and square section-view-action rule to `src/app/components/ui/pill-controls.css`; Progress composes those with the existing choice-pill surface, and removes the redundant screen-specific flex recipe. All three glyphs use the existing 20px icon size. The first measured Firefox run also exposed tab glyph flex shrinking at labelled widths, fixed with existing shrink-0 utilities.

Strengthened `e2e/progress-header-material.spec.ts` to assert outer top/bottom equality within 1px, square filter size, common icon centers/20px dimensions and matching material fill/edge/radius, in addition to the existing keyboard/pointer/sticky tests. Added a 600px enlarged-label scenario; the existing 320px enlarged, phone, tablet, desktop, RTL/LTR and solid/Glass cases remain. The latest request supersedes the earlier standalone 44px filter presentation, while preserving inner tab touch-target minimums. Changed documentation records the correction. Screenshot and final verification results follow.

The added 600px/200% screenshot exposed an overly narrow title column despite contained controls. A local Progress heading container now moves the tools below the title at usable widths up to 18rem, retaining the ordinary phone composition. The browser assertion checks the title stays within its single-line/min-height block rather than accepting letter-by-letter wrapping. This responsive recovery is part of the owner's same header correction.

The extra Firefox 600px/200% case exposed late label wrapping that increased the tab frame after intrinsic grid sizing. The constrained 18rem heading mode now also uses the existing icon-only presentation, retaining full tab accessible names; labelled widths continue to show their labels. The unchanged containment test now passes this boundary. No timeout or geometry assertion was relaxed. Earlier failed diagnostics remain under the progress-controls-aligned/settled output prefixes.

Final phone screenshot measurements for the control correction: tab frame 102×54px at y=8, square filter 54×54px at y=8; all three 20×20px glyphs center on y=35px. Values and screenshots are retained in `output/comment-completion-evidence/progress-controls-aligned-metrics.json`, `progress-controls-aligned.png` and refreshed header-detail captures. Focused Progress unit suites pass **24/24 in 17.86s** (`output/progress-controls-aligned-units.log`). Final browser/gate results follow.

### Equal-control correction: verified outcome

The settled matrix passes **33/33 in 3.6m** across all engines (`output/progress-controls-responsive-final-browser.log`). Focused Progress units pass **24/24**. The complete serial quality gate passes **exit 0 in 210.2s**, with all coverage/content/type/lint/format/motion/bundle gates intact (`output/progress-controls-final-quality.log`). Pages build passes **exit 0**, build 6.86s and unchanged bundle/CSS limits (`output/progress-controls-final-pages.log`). Inventory collects **3,188 identities** (`output/progress-controls-final-inventory.log`). Header evidence and source provenance are refreshed. This completes that local correction; the owner's new Choose metrics/button-consistency request has its own scoped phase. No commit or push.
