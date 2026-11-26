# Phase Report — Seamless page headers, local 2026-11-25

## Objective

Apply the owner's approved seamless page-header recommendations locally across the remaining reading/counting exceptions and audit ordinary app pages. No commit, push, deployment or release-note change.

## Scope completed

- Replaced fixed navy wide Reader, Masbaha and Salawat bands with one presentation-only ReadingHeaderSurface. It borrows the active canvas without a second painted panel, gradient, vignette, rounded background or blur.
- Shared semantic title, action and progress ink adapts to Light, Dark, Midnight, Glass and high contrast. Header icons share round 44 CSS px targets at every text size.
- Preserved control inventory, keyboard/menu origin and recovery, responsive tiers, devotional content, counts, saved state, language, audio and offline behavior. Home photography and Quran/publication/cover imagery retain their existing content roles.
- Audited ordinary Library/category, surah entry, Quran overview/Benefits, Progress, Settings, Qibla, Benefits, Friday, Search, More, Learn catalogue and native book reader headers against their own canvas. Existing protected scrolling and popup surfaces remain.
- Updated the older header-scene browser assertions to the new owner-approved surface while retaining their geometry, theme, reduced transparency, forced colors, offline, focus and axe checks.

## Files changed

Phase-owned changes (some files also contain independent pending work):

- src/app/components/ReadingHeaderSurface.tsx — new shared presentation wrapper/action recipe
- src/app/components/reading-header-surface.css — transparent in-flow ground and semantic light progress track
- src/app/components/ReadingHeroToolbar.tsx — semantic foreground title; retained independent overlay-edge marker
- src/app/components/ReadingScreenChrome.tsx — reuse shared surface and semantic progress/actions
- src/app/components/ReadingScreenChrome.test.tsx — contrast/surface regressions
- src/app/screens/ReaderScreen.tsx — reuse shared surface and consistent header actions
- src/app/screens/ReaderScreen.audio.test.tsx — verify the approved header-toggle treatment and retained sidebar open/close semantics
- src/app/screens/CustomCounterScreen.tsx, src/app/screens/FridaySalawatScreen.tsx — shared action recipe only; preserve independent UX/state changes
- e2e/seamless-page-headers.spec.ts — theme/responsive/overlay and ordinary-route audit
- e2e/reader-header-refinement.spec.ts, e2e/reader-scene.spec.ts — approved surface expectations with existing behavioral/geometry coverage retained
- README.md, docs/ARCHITECTURE.md, docs/DESIGN_SYSTEM.md, docs/QUALITY_CHECKLIST.md, docs/DESIGN_SPEC_COVERAGE.md
- docs/agent/INDEX.md, docs/agent/DECISION_LOG.md, the phase brief, this report and the actual evidence gallery

## Components added or modified

ReadingHeaderSurface and its 44px ghost-action recipe are shared by collection Reader and ReadingScreenChrome. ReadingHeroToolbar uses semantic foreground ink. Shared ordinary Header, scrolling-protection owners, popup primitives, Home canvas and Mushaf/publication presentation were audited rather than replaced.

## User-visible changes

Wide reading/counting headers now continue the surrounding Light/Dark/Midnight/Glass canvas. The title, progress and actions remain readable without a separate navy band. Sidebar access joins the same round header-action family. Phone enlarged text retains 44px icon targets instead of enlarging those icons to 88px and crowding the row. Existing content artwork and controls retain their roles.

## Accessibility work

Checks cover RTL/LTR, 1440px and 768px headers, 320px/200% text, semantic title ink, real 44px DOM target geometry, hit recovery, protected menu bounds/opacity/hit coverage and Escape/focus return. Existing axe, keyboard Help, independent reading-tool layout, reduced-transparency, forced-colors and offline assertions remain. Progress's scrolled no-frost protection is exercised separately.

Firefox exposed an 8px enlarged-phone overflow from rem-sized actions; the shared recipe now uses 44 CSS px dimensions. Exact DOM target measurements avoid Firefox protocol serialization of an exact 44px box as 43.999996px; the 44px minimum assertion remains unchanged. Eventual hit testing uses the repository's existing assertion timeout while a preceding modal releases its finite pointer lock, rather than requiring a click through that active lock.

Automated checks and screenshots do not establish complete WCAG or physical TalkBack/VoiceOver acceptance.

## Tests added or updated

- Existing ReadingScreenChrome unit cases now verify semantic titles and the seamless wide surface while retaining direction/progress semantics.
- New browser cases cover three reading/counting families, five theme/material/accessibility choices, both interface languages, desktop/tablet and narrow enlarged text.
- Ordinary-page audit covers 14 routes, including surah entry and the native book reader.
- Old scene/refinement cases retain their interaction/fallback coverage under the superseding owner-approved design.

## Commands run

| Command / check                                                            | Result                                                                                                              |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Initial targeted ReadingScreenChrome/ReaderSceneArt units                  | 10 passed; exit 0                                                                                                   |
| Initial counter/Salawat/shared chrome units                                | 41 passed; exit 0                                                                                                   |
| Final targeted shared chrome, counter/Salawat, Reader surah/language units | 6 files, 62 passed in 14.32s; exit 0                                                                                |
| pnpm typecheck                                                             | Passed; exit 0                                                                                                      |
| Targeted ESLint / Prettier / diff checks                                   | Passed for phase-owned inputs at the recorded checkpoints                                                           |
| First ordinary-route browser audit                                         | English route audit passed; exit 0 for that case                                                                    |
| First new header case                                                      | Exposed test readiness at preceding popup exit; kept real hit testing and standard timeout, then passed             |
| First three-engine matrix                                                  | 32 passed, 10 Firefox cases failed on enlarged-header overflow; retained logs and repaired the shared target sizing |
| Firefox repaired case and expanded ordinary audit                          | 2 passed in 19.1s; exit 0                                                                                           |
| Existing Reader scene/refinement/guidance regressions                      | 18 passed in 1.7m on Chromium; exit 0                                                                               |
| Final three-engine header + scrolled-fallback matrix                       | 42 passed in 5.5m; exit 0                                                                                           |
| Final compact aligned/header-refinement regressions                        | 10 passed in 42.5s on Chromium; exit 0                                                                              |
| First pnpm check                                                           | 2,728 unit tests passed; one stale square-toggle style assertion failed; all other stages passed                    |
| Updated Reader audio/sidebar regression                                    | 22 passed in 8.86s; exit 0; round header action and sidebar open/close semantics verified                           |
| Final pnpm check                                                           | Passed all stages in 155.8s, including enforced coverage, build and bundle/CSS budgets; exit 0                      |
| pnpm build:pages                                                           | Passed in 22.30s; bundle budget passed (524,584 gzip bytes for Home startup); exit 0                                |

The private previews use the loopback browser-test API namespace and unique output directories/ports; no general UI test is pointed at production. No assertion, timeout, coverage threshold, bundle ceiling or baseline was weakened to obtain a pass.

## Visual/manual evidence

The [evidence gallery](../evidence/seamless-page-headers/README.md) contains 26 actual app screenshots from the final Chromium run. No Android inset is simulated in ordinary desktop captures. Arabic desktop Reader/Masbaha/Salawat, final English Light/Dark Reader, Arabic Glass Reader and 320px/200% Reader/Masbaha samples were visually inspected. The reading header starts at the real desktop top edge and follows its own canvas in each appearance.

## Documentation updated

The architecture, design system, acceptance checklist, design coverage, README, owner decision, active phase and this report document the shared seamless surface and protected-scroll/overlay boundary.

## Decisions recorded

The owner's global seamless-header approval supersedes only the old fixed navy reading/counting header treatment. Existing Home imagery, independent Mushaf paper, reviewed content, persistence and protected overlays remain. The user explicitly repeats local-only/no-push instructions.

## Known limitations or remaining risks

- Physical devices and assistive-technology acceptance remain separate from browser evidence.
- This phase does not modify native Java; a later packaged Android build/OTA must include the latest web assets to show the new wide reading-header presentation.
- Other independent changes share the checkout. Their existing quality failures are reported if encountered; they are not repaired by weakening or rewriting unrelated tests.
- The 320px/200% captures validate header reflow and targets. Masbaha's separate content chooser has constrained word wrapping and its lower tool row needs its own enlarged-text layout review; this header phase does not claim complete page-level reflow acceptance.

## Out-of-scope findings

The combined diff includes separate overlay, completion/sharing, Masbaha UX, Home, Settings and Learn work. This phase preserves those edits and changes only its stated header/test/documentation portions.

## Recommended next step

Review the actual local gallery and perform physical-device/assistive-technology acceptance. The owner will publish the combined batch later after its complete release gates pass.

## Final verification

The final three-engine matrix passes all 42 cases. Existing compact/header regressions pass all 10 cases, and Pages build/budgets pass. The complete quality gate passes in 155.8s after replacing its one obsolete square-toggle assertion with the approved round-header contract, retaining sidebar-card and open/close assertions. The Reader audio/sidebar suite passes all 22 cases. Final diff whitespace checks pass. No commit, push or deployment was performed.

Logs are retained locally under output/seamless-headers-verified-matrix.log, output/seamless-headers-final-layout.log, output/seamless-headers-reader-regressions.log, output/seamless-headers-unit-final.log, output/seamless-headers-audio-regression.log, output/seamless-headers-quality-final.log and output/seamless-headers-pages.log. Only verification documentation is updated after the complete gate; application/test inputs are unchanged.
