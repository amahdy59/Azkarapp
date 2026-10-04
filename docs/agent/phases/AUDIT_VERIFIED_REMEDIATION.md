# Phase Report — Verified audit remediation

## Objective

Apply the owner's approved, qualified assessment of the external UX/engineering audit locally. No commit, push or deployment.

## Scope completed

Plan: inspect current contracts and pending work; repair verified RTL, inset, interaction and motion findings; verify uncertain assertions before changing behavior; add regression checks, browser evidence and documentation. Preserve offline reading, count persistence, reviewed content, prayer calculations and existing local changes.

## Files changed

- Shared presentation: Card and its tests; HomeCards; LayoutShells; ProgressBar and its tests; new progressFillStyle; ResponsiveSheet; countingSurface and its tests; ZikrComponents and its CSS/tests; shared button and dropdown-menu primitives.
- Screens: KhatmahReaderScreen and its tests; ReaderScreen; ProgressScreen; QiblaScreen and its tests; FridaySalawatScreen.
- Localization: Arabic/English dictionaries, moving existing Friday Salawat product copy verbatim.
- Browser verification: audit-remediation, devotional-footer, khatmah-reader, reader-microinteractions, responsive, accessibility-new-surfaces and word-meanings specs.
- Documentation: design system, motion system, quality checklist, decision log, agent index and this report.
- Verification tooling: run-checks uses process-specific coverage and build directories; budget/CSS scripts accept an optional build directory while preserving their default `dist` behavior and all existing thresholds.
- Follow-up repair: DownloadsPanel and its tests disable download/removal actions during readiness loading, preventing initial status refreshes from erasing job feedback.
- Sharing follow-up: CollectionShareModal puts its header and method controls inside the scrollable body so the persistent action footer stays bounded at 200% text size.

## Components added or modified

The shared progress style translates a full-size fill through a clipped track, preserving end geometry and divider thickness. Existing components and icon exports remain authoritative. No runtime dependencies.

## User-visible changes

Arabic Mushaf exit follows the shared Back direction; physical page turns and rail placement retain their existing rules. Home/Reader/Progress use semantic directional icons. Standard cards consume the card radius; overlay elevation consumes the overlay radius; photographic Home containers keep their approved geometry. Home's primary action uses the existing hero control height. Compact sheets use the existing card surface and own the bottom inset. Menu/button interaction surfaces use muted theme tokens. Navigation cues are finite; native route crossfades isolate the main canvas. Live compass angles use existing domain smoothing without a second CSS interpolation. Progress fills animate transforms rather than geometry; counts and restored progress remain unchanged.

## Accessibility work

Keep keyboard actions, named progress bars, semantic order, 44px targets and focus restoration. Contextual dropdowns default to non-modal semantics so background controls are not aria-hidden while still focusable. Genuine dialogs/sheets retain their modal contract. Consolidate the duplicate in-app reduced-motion rule into surfaces.css; retain element and pseudo-element coverage for both OS and app settings.

At 200% text size on a 320px viewport, the Reader title/toggle row can wrap instead of shrinking the English passage title to zero width. Normal-size row geometry is unchanged; regression checks require both enlarged controls to remain visible, bounded and non-overlapping.

The compact Reader preserves a minimum passage viewport when enlarged footer controls consume the available height. Tests require native passage scrolling and the counter to remain reachable. The recurring Home geometry test now waits for responsive layout to settle using its unchanged geometry assertions and tolerances.

## Tests added or updated

Rapid counting verifies 100 accepted taps without computed-style reads. Shared progress tests cover labelled values and direction/ratio changes. Compass tests exercise north and signed-turn seams without CSS interpolation. Card and Mushaf expectations follow the approved radius and Back change. Browser geometry checks compare the visible clipped fill, preserving direction, empty/half/restored progress, target sizing and enlarged-text assertions. New full-page menu scans cover three themes, keyboard focus, Escape restoration and app reduced motion with OS motion enabled. Existing word-toggle locators use the current short labels; the title/toggle row assertion now applies at every tested width.

## Commands run

| Command                                                        | Result                                                                                                                                                                                             |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Targeted unit tests, first pass                                | 7 files, 47 tests passed.                                                                                                                                                                          |
| New progress/compass unit checks                               | 2 files, 11 tests passed.                                                                                                                                                                          |
| pnpm check, first pass                                         | 1,296 tests passed, one obsolete unmirrored-Back expectation failed; two unused-direction lint errors and CSS 103 gzip bytes over the unchanged ceiling. All repaired within this phase.           |
| pnpm check (final audit scope)                                 | Passed all stages in 180.7 seconds; full unit coverage, format, lint, types, manifest, build and unchanged budgets.                                                                                |
| pnpm build:pages                                               | Passed with unchanged bundle and CSS utility gates.                                                                                                                                                |
| pnpm audit:prod                                                | No known vulnerabilities found.                                                                                                                                                                    |
| Focused Reader/Home browser regression checks                  | 10 passed in 1.6 minutes across desktop, phone and tablet; enlarged reading viewport, title/toggle, word typography, and unchanged Home geometry assertions.                                       |
| Full browser suite on verified audit build                     | 600 passed, 1 skipped, 3 failed in 27.8 minutes. All failures were the same sharing footer overflow at 200% text across Chromium tiers; repaired in the follow-up above.                           |
| Sharing unit regression suite after repair                     | 1 file, 16 tests passed.                                                                                                                                                                           |
| pnpm check after final sharing refinement                      | Passed all stages in 239.3 seconds.                                                                                                                                                                |
| pnpm build:pages after final sharing refinement                | Passed with unchanged bundle and CSS utility gates.                                                                                                                                                |
| Enlarged sharing regression after adaptive overview refinement | 3 passed in 1.7 minutes; desktop, mobile and tablet Chromium.                                                                                                                                      |
| Full sharing browser matrix after footer repair                | 48 passed, 2 flaky (passed on retry), no failures in 10.3 minutes; desktop/mobile/tablet Chromium, Firefox and WebKit. WebKit flakes were DOM-measurement timeouts during concurrent quality jobs. |

## Visual/manual evidence

Inspected screenshots: `../evidence/audit-remediation/menu-light.png`, `menu-midnight.png`, and `menu-dark.png`. They show the themed keyboard-focused menu and its readable interaction surface. Also inspected `../evidence/counter-progress/half-ar.png`: right-origin clipped fill with a crisp divider. `reader-en-320-enlarged-reading.png` and `reader-en-320-enlarged-controls.png` show accessible passage scrolling and reachable controls at 200% text. `sharing-selection-200percent.png` shows the bounded Save footer and adaptive card overview. Browser screenshots and failure traces are also recorded by Playwright. Physical cutouts, compass feel, vibration hardware and human assistive-technology checks remain pending.

## Documentation updated

Implemented surface/radius, dropdown semantics, inset ownership, transform-based progress, main-canvas snapshot and reduced-motion contracts. Verification checklist and owner decision record updated.

## Decisions recorded

Owner approved the qualified assessment and subsequently authorized investigating/repairing existing word-meaning/audio browser failures while retaining their behavior and accessibility assertions. No publication authorized.

## Known limitations or remaining risks

No measured input-latency or frame-rate improvement is claimed. Automated accessibility checks do not establish complete WCAG compliance. Physical-device and screen-reader evidence remains required before release.

The full browser snapshot predates the final sharing-only repair; its 600 passing cases were retained as evidence, and the affected sharing suite was rerun across engines instead of claiming another complete 604-test pass. Concurrent checkout edits/builds were observed. Isolated quality outputs now prevent transient coverage/build collisions, but snapshots cannot certify later changes made by another process.

## Out-of-scope findings

The external report's reduced-motion leak was contradicted by global overrides; existing coverage was verified and duplicate rules consolidated. Settings already reverses root/panel entrance direction. Search already offers clear recovery. Different checklist/completion shapes reflect different roles. No arbitrary haptic cooldown, universal text leading, numeral offset, drawer token or audio-glyph rewrite was applied. Religious text, evidence and attribution remain verbatim.

Pre-existing sharing/counter/audio work remains intact. Concurrent audio/typography edits were detected during verification; one build encountered a partially saved missing export that later became available. Initial full-browser runs were stopped after reproducible stale-label/attribution failures and before a fresh verification build. The separately approved `AUDIO_PLAYER_REFINEMENT.md` now explicitly omits recording attribution from the reciter menu; tests follow that decision while source verification metadata remains intact. Annotated Qur'an words retain the surrounding ayah's weight, size and leading, with tint and a dotted underline; browser assertions now enforce that existing contract. Reader audio-menu tests use awaited user interactions to avoid a reopen race without relaxing callback assertions.

## Recommended next step

Review local evidence, complete real-device and assistive-technology checks, then explicitly authorize a separate release. Refresh all release gates and notes before any future push.
