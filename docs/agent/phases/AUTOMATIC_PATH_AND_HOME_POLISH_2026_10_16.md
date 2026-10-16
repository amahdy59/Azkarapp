# Phase Report — Automatic daily path and smooth Home prayer cards

## Objective

Apply the owner's seven screenshot follow-ups locally. No commit, push, deployment or release-note update is authorized for this shared snapshot. The owner explicitly authorized cross-chat coordination while keeping these changes local.

## Scope completed

Plan before editing: inspect existing recordings, remaining-time semantics, sticky handoff, derived daily awards and glass layers; repair metadata without changing religious counts; simplify the path into recorded facts plus a three-tier guide; improve the existing Home cards; verify targeted units, bilingual browser flows and shared quality gates. Reuse current normalization, prayer timeline, modal, icons, palm vectors and i18n. Preserve unrelated concurrent edits.

## Files changed

- `src/app/dailyPath.ts` and its tests.
- `src/app/components/TodaysPathSheet.tsx`, `GardenMarks.tsx`, `PrayerTrackerCards.tsx`, `home-wird.css` and focused tests.
- `src/app/hooks/useHomePrayerScroll.ts` and its tests.
- `src/app/screens/HomeScreen.tsx`, `ProgressScreen.tsx` and bilingual copy.
- `src/app/audio/audioAssetsDuas.ts`, `audioArchitecture.test.ts`; coordinated timing-candidate quarantine is owned by the other session.
- `e2e/todays-path.spec.ts`, `e2e/home-prayer-scroll.spec.ts`, `e2e/home-scroll-material.spec.ts`.
- This report, decision log, phase index and motion/design/architecture notes.

These files include other sessions' pre-existing edits. This report describes only the incremental scope above.

## Components added or modified

TodaysPathSheet becomes a read-only summary with one current reward, three recorded facts, a palm/gold/oasis guide and one Progress action. PathRewardMark reuses the existing palm and oasis vectors; gold has a filled silhouette. PrayerTrackerCards keeps native progress outside its open button. The existing scroll hook coordinates the actual card and sticky-shell heights, with a small opacity arrival, once per threshold crossing.

## User-visible changes

- Arabic comprehensive-dua-42 contains three embedded repetitions: its three-count instance plays once; English still repeats three times. The separate 100-count misc-ref-13 remains 100 and safely offers play-once because three does not divide 100. No sacred wording or prescribed count changes.
- Bright bar = remaining time between the previous and next adhan, shrinking to zero. Arabic fills from the right and English from the left; native direction, accessible name/value text and explanatory tooltip make the meaning explicit. It is not a religious validity window.
- The selected-card stroke sits 7px outside its bottom edge, separated from the interval bar.
- A 260ms bounded handoff animates the five card silhouettes and sticky shell together; adjacent content follows actual layout. No scale, blur interpolation, loop or per-scroll animation. Reversal cancels stale effects. The shared 1fr/auto card rows preserve enlarged-text footer alignment.
- For policy-activated days from 2026-10-16: all three main zikr groups plus a completed Quran wird earn one regular palm. Three distinct mosque prayers upgrade it to filled gold; five add an oasis. No selected mosque target or after-prayer-adhkar prerequisite. No Quran goal does not count as a completed wird. Earlier policy rules and awards remain unchanged.
- The same derived tiers drive the Progress reflection and seven-day marks. Home header and sheet show the lifetime palm metric their labels promise.
- The scrolled prayer strip frosts its translucent ground once; child card/header filters are suppressed only in that state to prevent nested blur. At the top, individual Home cards retain their shared glass layer and the existing explicit Glass / Follow device / Solid, high-contrast and forced-color rules.

## Accessibility work

No checkbox-shaped marks or target controls in the path sheet. Recorded states and reward rules are text, with decorative marks. Native modal focus/keyboard recovery, normal reading order, bilingual direction, 44px actions and ordinary scroll recovery remain. Native progress has current remaining-time text. OS/app reduced motion skips or cancels the finite height effects; no moving sacred text. Automated scans supplement manual/browser evidence and do not establish complete accessibility compliance.

## Tests added or updated

Automatic thresholds 0–5, no chosen target, Quran/core prerequisites, duplicate/home prayer exclusion, historical cutoff; three-count Arabic/English voice switching and 100-count safe fallback; read-only sheet and current-tier text; native progress direction/value/name; coordinated geometry, hysteresis, reversal, preference changes and unsupported animation; browser path guide, responsive overflow, scroll geometry and screenshots.

## Commands run

| Command                                                                                                                                                                                                                                                                                                  | Result                                                                                                                                                                                                                                                                                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pnpm test:run src/app/dailyPath.test.ts src/app/components/TodaysPathSheet.test.tsx src/app/components/PrayerTrackerCards.test.tsx src/app/hooks/useHomePrayerScroll.test.tsx src/app/screens/ProgressScreen.test.tsx src/app/audio/audioArchitecture.test.ts src/app/screens/HomeScreen.render.test.tsx | 7 files, 107 passed                                                                                                                                                                                                                                                                                                                                                                                       |
| pnpm test:run src/app/components/PrayerTrackerCards.test.tsx src/app/components/TodaysPathSheet.test.tsx                                                                                                                                                                                                 | 2 files, 24 passed after five extra assertions                                                                                                                                                                                                                                                                                                                                                            |
| pnpm typecheck                                                                                                                                                                                                                                                                                           | Passed                                                                                                                                                                                                                                                                                                                                                                                                    |
| pnpm test:e2e e2e/home-prayer-scroll.spec.ts e2e/todays-path.spec.ts e2e/home-glass-material.spec.ts e2e/compact-prayer.spec.ts --project=desktop-chromium --output=output/local-home-path-browser (E2E_BASE_URL=http://127.0.0.1:5197)                                                                  | 70 passed, 4.2m, before final root-frost repair                                                                                                                                                                                                                                                                                                                                                           |
| pnpm test:e2e e2e/home-scroll-material.spec.ts e2e/home-prayer-scroll.spec.ts e2e/contextual-reminder-plan.spec.ts --project=desktop-chromium --project=desktop-firefox-smoke --project=mobile-webkit-smoke --output=output/local-home-scroll-final-browser (same dev URL)                               | 19 passed, 1 environment timeout, 3.1m: production-only offline test waited for serviceWorker.ready on a dev server. All 12 scroll and 6 interactive reminder cases passed across three engines; initial material test passed                                                                                                                                                                             |
| pnpm test:e2e e2e/home-scroll-material.spec.ts --project=desktop-chromium --output=output/local-home-material-specificity-browser (same dev URL)                                                                                                                                                         | 1 passed, 3.2s after final selector/assertion repair; native material, no nested blur under explicit Glass, system reduced transparency, high contrast, forced colors and axe                                                                                                                                                                                                                             |
| pnpm exec eslint e2e/home-scroll-material.spec.ts --max-warnings 0                                                                                                                                                                                                                                       | Passed on final file                                                                                                                                                                                                                                                                                                                                                                                      |
| git diff --check                                                                                                                                                                                                                                                                                         | Passed                                                                                                                                                                                                                                                                                                                                                                                                    |
| Coordinated pnpm check                                                                                                                                                                                                                                                                                   | Passed twice, 236.1s and 120.3s. Covers units/coverage, type, lint, format, content/audio/timing integrity, build and budgets; last pass preceded only final scrolled-filter selector/assertion repair                                                                                                                                                                                                    |
| Coordinated production offline/browser reproduction                                                                                                                                                                                                                                                      | Offline/service-worker test passed on isolated production preview 4201; exact matching-edge assertions passed 3 WebKit cases after awaiting style settlement                                                                                                                                                                                                                                              |
| Final post-selector build/bundle/CSS/motion/format verification                                                                                                                                                                                                                                          | Passed: isolated Vite build output/reminder-final-build (7.02s), bundle/CSS checks, targeted Prettier; motion 0 errors with one existing overscroll warning. Final production preview 4202: offline-first-use plus final scrolled material/fallback/axe 2/2 passed (11.1s), output/reminder-final-production.json. Final CSS/spec hashes match the frozen source. No exact final release receipt claimed. |

The first new audio test used the wrong content registry, then exposed the separate 100-count assignment; corrected the fixture and added a specific safe-fallback regression. An initial browser build was canceled to prevent concurrent .playwright-dist writes. No assertions, budgets or coverage thresholds were weakened.

## Visual/manual evidence

Reviewed Arabic/English 390px and 1440px golden-tier captures in output/local-home-path-review; the actual seeded records earn gold without an intention or after-prayer prerequisite. Reviewed compact-scrolling frames and corrected a real readable-heading overlap behind translucent cards. Final single-frost evidence is output/local-home-material-specificity-browser/home-scroll-material-scrol-857af-serves-appearance-fallbacks-desktop-chromium/scrolled-single-frost.png. The 12 cross-engine scrolling cases preserve badge geometry, keyboard/focus access, reduced-motion recovery and axe checks. Bilingual sheet/card checks include 320px, enlarged text and all five prayers. Screenshots supplement automation; assistive-technology certification is not claimed. Reports and traces have isolated local-home-* paths to preserve concurrent evidence.

## Documentation updated

This phase report records the prospective policy and local-only authority. Architecture/design/motion notes, decision log and phase index reference the same decision.

## Decisions recorded

Owner's current explicit local-only request supersedes earlier release authority for these pending files. Cross-chat coordination was explicitly approved with “Coordinate; keep these changes local.” Five prayers is interpreted as five at the mosque, following the preceding mosque tier; stated to the owner before implementation.

## Known limitations or remaining risks

No release or public-production smoke is performed. Local production-preview offline verification is coordinated separately. The shared working tree includes independent unfinished changes. Three-occurrence Arabic word highlighting requires accurate review before restoration. Historical days keep their original award rules. A palm is a reflection of recorded practices, never a measure of religious reward or faith.

## Out-of-scope findings

No new dependency, schema, sync migration, religious-source interpretation or network service. The other session owns source-reminder additions and unrelated audio-lock changes.

## Recommended next step

Review the local screenshots and consolidated verification. Keep all work local until the owner explicitly authorizes a release.
