# Phase plan — Local glass and scrolling refinement

## Objective and authority

Latest owner correction: Library, Progress and Settings must not switch header backgrounds on scroll; increase frost while content passes behind them, imitating Home prayer cards. Keep 36% navy tint/sheen unchanged, with 22px frost at rest and 32px scrolled at the existing threshold. No blur interpolation. Actual browser diagnostics isolated a named app-content route boundary that blocked descendant backdrop sampling; disable that name only in Glass. Retain native Progress content flow beneath its unified sticky controls and focus recovery, superseding the interim clipped-records experiment. Preserve all accessibility fallbacks and accepted Home material/motion.

Follow-up plan before editing: capture current headers; consolidate tint/sheen rules and remove the opaque token; restore actual sampling and increase only scrolling frost; assert identical tint/image before/after scroll, expected 22px/32px filter values, no named capture boundary in Glass, hysteresis/nested isolation/fallbacks and axe; inspect phone/desktop images for all three screens; run focused browser cases across engines and pnpm check; update the phase report. No publication.

Owner live-preview correction: the single-shell handoff is visibly abrupt. Remove the shared scrolling prayer-row background, make the compact row smaller and coordinate the card/footer/icon/spacing transition. Use one inherited CSS expansion value, native transition reversal/cancellation and reduced-motion recovery; retain individual card frost and 44px native targets. This supersedes the earlier shell-only handoff and shared scrolling ground for Home. Keep all work local and show actual expanded/mid-transition/compact evidence.

The owner approved applying the code-review recommendations locally, with image evidence during development so they can direct the result. Do not commit, push or deploy this phase. Preserve the decision-log requirement that scrolled interface headers completely occlude passing text; the older translucent-header design note is superseded for this work.

## Plan before editing

1. Capture the existing loaded-scene Home, Library, Progress and Settings at phone/desktop sizes, including scrolled states.
2. Share consistent modestly stronger frost and restrained elevation between Home and interface surfaces. Preserve denser reading/overlay materials, opaque header protection and all accessibility/device fallbacks. Replace broad material class-substring matching with deliberate surface ownership.
3. Track the actual vertical scroll owner for shared headers, Progress and Settings. Initialize from restored position and use separate enter/exit thresholds; ignore nested horizontal/reading regions.
4. Coordinate Home footer height/opacity, icon size and spacing through one inherited CSS expansion value. Preserve current/next visibility, native CSS reversal, reduced motion and 44px targets. Remove shared row backing, compact countdown and visible scrollbar while preserving individual/header frost and native horizontal browsing.
5. Add unit/browser regression coverage, loaded-photo Glass wheel/touch scrolling and frame diagnostics. Capture successive actual screenshots in output/playwright/glass-refinement and show them to the owner.
6. Run affected tests and required local quality gates; document exact results and remaining physical-device limitations. No release-note change is necessary for an unpublished local preview.

## Scope and reusable components

Shared theme tokens/material CSS, Home material CSS, existing Header/Settings/Progress scroll handling, useHomePrayerScroll, existing card primitives and feature tests. No dependencies, religious content, prayer calculations, persistence/sync schema, playback ownership or deployment changes.

## Evidence and report

Baseline and successive bilingual phone/desktop screenshots plus browser frame diagnostics and final phase report. Automated frame evidence is diagnostic and does not certify physical phone smoothness or human assistive-technology acceptance.

## Final local acceptance

Latest header correction: 24/24 header browser cases passed across Chromium/Firefox/WebKit (6.9m), plus 10/10 selected Chromium Home/Progress/material regressions (2.0m) and 17/17 targeted unit tests (26.31s). All 14 pnpm check stages passed in 310.8s. Final inspected Arabic desktop rest/scrolled pairs are in output/playwright/glass-refinement/header-frost-final/. Header tint/sheen stays unchanged, scrolling frost strengthens from 22px to 32px, and the Glass route-capture boundary no longer blocks actual sampling. Progress retains native content flow behind controls. Physical Safari visual verification remains open due the local Windows WebKit rendering limitation below. No publication.

The owner-selected balanced material and live-preview Home corrections are implemented locally. Full quality passed in 125.8s. All 31 affected Home cases have passing results across Chromium/Firefox/WebKit: 29 passed in the initial engine round; the two WebKit animation-harness failures were corrected by observing the actual DOM state commit, and all six motion cases then passed in 39.2s with unchanged interpolation, reduced-motion, frost, size and target assertions. The updated inventory proves 1,869 cases exactly once. See [phase report](../GLASS_SCROLL_REFINEMENT_2026_10_18_REPORT.md). Nothing committed or pushed.

Visual acceptance caveat: actual Chromium frost is confirmed in the final images. Windows WebKit does not visibly render backdrop blur even in a standalone HTML diagnostic outside the app, so computed filter assertions are not Safari visual certification. Physical Safari verification remains open; see the report and paired minimal diagnostic images.
