# Phase — App-wide materials and remaining release fixes

## Objective and approved plan

The owner approves app-wide Follow device / Glass / Solid and an independent Home override with Same as app. The owner subsequently requests applying all remaining changes and pushing everything. This phase owns the combined release, superseding the previous chat's interrupted release ownership.

Inspect existing appearance/state/sync boundaries; preserve explicit existing Home choices and normalize new preferences; add shared restrained interface materials while retaining solid reading/playback surfaces, independent photography and authoritative contrast/forced-color fallbacks. Add desktop brand navigation to Home. Diagnose the four outstanding CI browser failures without weakening assertions or religious-source integrity. Run focused unit/browser checks, existing full quality/hook gates, then exact-commit CI/Pages and production smoke, including the custom-domain version where applicable.

Use existing React/theme/i18n/segmented controls. Add no runtime dependency, AI API, remote service or new content source. Keep one blur layer per material group and preserve offline/persisted state. All pending reminder and previous Home work remains included in the release.

## Scope completed

CI integration correction: the responsive shard caught two issues in d584632f. Defaulting missing global preferences to System changed previously opaque screens, and the generic card wash overpainted reading-plan radio labels. Missing/invalid app appearance now defaults Solid, preserving existing screens; explicit System remains supported. Control/selection surfaces are excluded from the neutral material wash. The original opaque-header assertions remain unchanged. The existing RTL reading-choice test now explicitly enables Glass through Settings before checking distinct selected backgrounds/borders and accessibility.

The targeted correction matrix passed 28/28 across desktop, phone and tablet Chromium plus Firefox/WebKit. The complete gate passed every stage except stylesheet growth after the longer state exclusion selector; scoping eligible interface roots through one data attribute reduced CSS to 166.49KB raw/28.62KB gzip and restored the unchanged budget checks. No ceiling, tolerance or baseline was raised. The final complete gate is rerun on the corrected snapshot before its corrective push.

Added app-wide material preference and independent Home inheritance through the existing persistence/merge/theme boundaries. Preserved all prior explicit Home choices, existing photo control and protected reading/playback surfaces. Added desktop logo Home navigation. Applied the subsequent performance request: static card materials, limited chrome blur, no full-shell noise/blend layer, threshold-only header state updates, hidden-clock suspension, faster 180ms prayer handoff, immediate automatic reader following and Save-Data decorative fallback.

Diagnosed the prior full-CI failures. Enlarged Quran listening left opening verses outside the visible reading region because heading visibility was insufficient and a second startup effect could override follow positioning; one geometry-aware effect now aligns the appropriate heading/ink. The magnification test sampled Unicode fallback before a late QCF swap, so it now establishes the same canonical rendering mode before comparing zoom/reset, preserving every original geometry/content assertion. Tablet utility navigation tests explicitly settle the compact sticky transition before clicking content it moves. No skips, coverage reduction, bundle increase or religious-text/count change.

## Files changed

App, theme/types/state and tests; AppearancePanel and SettingsScreen contracts; HomeScreen scroll composition; LayoutShells navigation/header; materials.css and theme imports; reduced decorative shell CSS; useNow and useHomePrayerScroll with tests; hero image Save-Data handling/test; QuranListeningReader and QuranSurahListeningReader; automatic-follow positioning in Khatmah/immersive/Reader navigation; app-material, constrained-scroll, magnification and navigation browser tests; architecture/design/motion/decision/phase documentation and bilingual release notes/history.

## Components added or modified

Reused SegmentedControl for both material scopes. Added no runtime component library or dependency. Shared card/chrome styles use semantic theme values. NavSidebar brand is a native Home link. Existing foreground/background/source-reminder/provider ownership remains intact.

## User-visible changes

App appearance offers Follow device, Glass and Solid; Home can inherit or override. Explicit existing Home selections survive upgrades. Reading remains dense and stable. Desktop logo returns Home. Scroll feedback is shorter, automatic reading alignment no longer glides behind playback, background tabs stop screen-clock work, and device data saving omits decorative hero photos without hiding devotional content. The combined release retains the sourced reminders, visitor footer, automatic palms, audio protection and prior pending fixes documented in their phases.

## Accessibility work

Native radio/link semantics, visible focus, 44px controls, bilingual phone/desktop layout, enlarged text, reactive reduced transparency, reduced-motion cancellation, high contrast/forced colors and solid reading surfaces. Source/reading content and counts are untouched. Axe checks supplement browser and keyboard evidence; physical old-device and assistive-technology acceptance remain separate and complete WCAG certification is not claimed.

## Tests added or updated

Material normalization/partial merge and preference precedence, Save-Data no-photo requests, hidden-clock suspension/resume, existing scroll hysteresis/reversal/preferences, bilingual scope selection/persistence/brand navigation, phone/desktop axe scans and protected reading surfaces. A Chromium production-preview test records usable navigation/native scroll on four screens under 4x CPU slowdown, 150ms latency and 200KB/s transfer. It records observations rather than inventing a universal hardware performance guarantee. Existing Quran ink/transport/zoom/reset and tablet route assertions remain intact.

## Commands run

The production-preview focused matrix passed 31/31 cases in 3.2 minutes across Chromium, Firefox and WebKit. Constrained phone/desktop tests passed 2/2 in 15.0 seconds: initial Home was usable at approximately six seconds under 4x CPU slowdown/150ms latency/200KB/s; all four screens loaded and accepted native wheel input. These are instrumented test observations, not real-device INP claims. A complete `pnpm check` subsequently passed in 106.3 seconds; final CSS scope and test-evidence refinements are checked again by the intact final gate/hook before publication.

| Command / scope                            | Result / evidence                                                                                                                                                             |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focused state/theme/clock unit run         | 60 passed across three files.                                                                                                                                                 |
| Focused player/hero/header/scroll unit run | 32 passed across four files.                                                                                                                                                  |
| i18n literal-key integrity                 | One passed after correcting the logo's key to existing common.home.                                                                                                           |
| Initial `pnpm check`                       | Build/type/lint/format/content/audio/timing/motion/bundle/CSS stages passed; unit stage exposed the single logo i18n key error, corrected without relaxing the check.         |
| Enlarged Quran listening, three engines    | Three passed after the positioning repair.                                                                                                                                    |
| Tablet Firefox route recovery              | One passed after waiting for the compact state and finite transition.                                                                                                         |
| Current production build                   | Passed in 5.73s; bundle and CSS checks passed with unchanged ceilings.                                                                                                        |
| `pnpm audit:prod`                          | No known vulnerabilities found.                                                                                                                                               |
| Final browser and release evidence         | `output/final-material-browser.json`, `output/app-material-build.log`; final tracked-hook/Quality/Pages results are retained in GitHub and the consolidated release evidence. |

The final complete gate and push hook must run on the finished tracked snapshot. Exact results and deployed commit are reported in the final release response; no deployment completion is implied by this pre-release source document.

## Visual/manual evidence

Arabic/English 390px/1440px material captures and reading-layout evidence under `output/final-material-browser`; earlier cross-engine stable badge captures under `output/remaining-regressions`. Screenshots inspected for readable calm material, consistent geometry and overflow. Network/CPU observation is attached to the constrained-scroll browser result.

## Documentation updated

Architecture, design system, motion contract, decision log, phase index and this report. Release 2026-10-16.10 replaces the manifest with four bilingual outcomes covering all work since the last successful GitHub Pages deployment, including the CI material integration correction. The compressed release history is regenerated through the existing script.

## Decisions recorded

Owner explicitly requests all remaining implementation and publication; performance/accessibility and direct scrolling are subsequent requirements of this phase. The prior release chat confirms the shared checkout freeze and release handoff. GitHub Pages and Cloudflare custom-domain deployments are separate and must be verified independently.

## Known limitations or remaining risks

Browser CPU/network emulation is not physical-device or screen-reader certification. Blur costs vary by device; Solid, reduced effects and data-saving fallbacks remain available. Cloudflare's existing Git integration publishes separately from GitHub Pages; exact successful commit and live behavior must both be inspected. No runtime dependency, schema migration, source-text change, erased user data or remote AI calls are introduced.

## Out-of-scope findings

The prior release had four failed browser cases and skipped GitHub Pages deployment; the custom domain had independently published the same main commit. Earlier status based only on GitHub Pages did not establish the custom domain's version. This phase verifies both endpoints rather than assuming they share deployment state.

## Recommended next phase

Physical low-end Android/iOS and assistive-technology sampling, informed by field INP/LCP/CLS observations. Keep future materials constrained to measured, readable surfaces and avoid automatic new remote content dependencies.
