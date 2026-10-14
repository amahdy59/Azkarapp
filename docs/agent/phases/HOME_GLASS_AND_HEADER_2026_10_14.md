# Phase Report — Home glass and full-width desktop header

## Objective and approved plan

The owner approved extending the desktop header surface to main-canvas edges while keeping its contents aligned to the existing max-width grid. Inspect computed layers, replace cumulative opaque washes with shared standard/reading/header glass tokens, retain solid primary actions and reduced-transparency fallbacks, and verify actual photo-backed contrast, keyboard, RTL/LTR, responsive geometry and browser performance. Do not change reviewed content, state or prayer behavior. Reuse HomeCard and existing style/test infrastructure; no dependencies. Complete normal release gates and exact-commit deployment verification.

## Scope

Home presentation only. Standard glass starts at 48% navy tint, reading at 58%, header at 58%, with 18px blur. Retain the existing page scrim to bound bright-photo contrast. Photo captions retain a stronger 66% tint because their images do not have the page scrim. Avoid repeated blur/tints on controls inside a frosted parent. Inspect representative morning, evening and sleep screenshots before finalizing values.

## Verification

Pending implementation and focused tests. Automated contrast/axe evidence is supplementary to visual and human assistive-technology review.

## Scope completed / files and components changed

HomeScreen header now has a full-width outer surface and an aligned max-width inner container. HomeCard, HomeCards, PrayerTrackerCards, SituationalShortcuts, home-wird.css and shared layout styles use lighter standard glass, stronger reminder/header/caption materials, pale-gold text and dark insets without nested blur. Preserved solid primary actions, existing prayer state, modes, routes and content. Header title/streak/path DOM order and mobile exclusion remain unchanged.

## Accessibility and tests

Updated Home header-scroll render expectation and browser material checks. Header-to-canvas and inner-to-grid edges are asserted in Arabic/English at 320, 390, 900 and 1920px. Existing axe, keyboard, focus, enlarged text and independent appearance cases remain. Glass test reads computed scrim, fill, highlight and foreground colors, composites over the conservative maximum white source pixel, and requires normal text, muted text and small pale-gold text to meet 4.5:1. It also asserts nested actions have no backdrop filter and preserves opaque fallback checks. Manual human assistive-technology acceptance is not claimed.

## Commands and exact results

- Focused Home/HomeCards/shortcuts units: 22 passed across three files (5.15s).
- Initial three-engine header/material/control browser run: 46 passed (4.2m), including Firefox/WebKit geometry and preference checks.
- Final Chromium run after contrast refinement: 45 passed (1.1m), including conservative color-composition assertion, six-shortcut navigation, reader focus, material fallbacks and prayer interactions.
- Normal complete pre-push and exact-commit CI/deployment gates remain required before publication.

## Visual evidence

Inspected output/playwright/home-glass-morning-desktop.png, home-glass-evening-desktop.png and home-glass-sleep-desktop.png at 1920x1080 with system transparency emulated as enabled. The native host requests reduced transparency, so this override is used only for glass verification; product defaults continue respecting the host preference. Source images unchanged. Diagnostic development browser encountered visitor-counter HTTP429 responses during repeated reloads; unrelated to Home materials and no application state loss.

## Documentation updated / decisions

Design system, decision log, agent index, this phase, fresh bilingual release notes and release archive. Owner-approved scope documented above. No budget ceilings or dependency changes.

## Remaining limitations and recommended next step

Physical device/screen-reader acceptance remains separate. Complete intact local hook, full CI and production smoke, then owner review of deployed appearance.

## Owner mobile follow-up — 2026-10-15

Before publication, the owner requested a single side-by-side row when revealing all prayers on mobile, two daily-wird cards per row, and stronger prayer times. Implement a labelled keyboard-focusable horizontal prayer region with five columns and a 7rem minimum width; preserve chronological DOM order, native scrolling, focus visibility and a separate collapse action. At ordinary phone sizes use two equal wird columns; a container query returns to one column when the available measure is below 15rem, including enlarged-text cases. Prayer time uses 16px/800 on mobile and existing 15px subtitle measure/800 on wider screens. All original no-overflow, keyboard and target assertions remain; update only superseded row/size expectations and header inner alignment. No recording, persistence or content changes.

The first pre-push gate blocked publication for a 47-byte compressed stylesheet excess. No budget was raised. Consolidated reusable utilities and moved Home-only header/reading/inset variants to the existing lazy Home stylesheet rather than the global initial stylesheet. Final budget and full hook verification remain required. The unpublished 2026-10-14-7 notes are superseded by fresh 2026-10-15 notes covering both approved refinements.

## Card arrow and help clarity follow-up

The owner asks for arrows beside the text rather than at the bottom, and a clearer alternative to two info icons. Move the decorative chevron/check to the logical trailing edge of a flex row containing the title/status. Keep the whole card as the single accessible button. Consolidate Home help into the existing labelled benefits entry; move the original translated palm explanation into that screen without editing religious content. Progress help is unchanged. An optional preference question was offered; after allowing time for a reply, proceeded with the stated recommended combined-entry approach. Existing quiet-garden browser coverage now verifies the explanation through that help route.

Final mobile Chromium regression run: 33 passed (1.8m), including all-prayer single-row scrolling, both language order, two-column phone cards, enlarged-text reflow and compact-prayer controls. Earlier diagnostic failures came from superseded row/font/header expectations and were repaired without dropping geometry/keyboard/axe assertions. Final bundle proof passed after moving Home-only variants to the lazy stylesheet; the fixed compressed ceiling remains intact. Final combined help/three-engine run and release hook pending.

Final combined regression evidence: 31 passed across Chromium, Firefox and WebKit (5.5m), including one-row all-prayer reachability in RTL/LTR, two-by-two normal phone tiles, enlarged-text fallback, labelled combined benefits/palm route, independent appearance preferences, 1920px edge alignment and axe checks. Final 22 focused units passed (11.34s). Full pre-push and exact-commit CI remain required.
