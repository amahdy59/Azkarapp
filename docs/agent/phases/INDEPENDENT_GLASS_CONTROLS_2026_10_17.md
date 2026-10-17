# Phase Plan — Independent App and Home Glass, 2026-10-17

## Objective and approved plan

Implement the owner's approved mix-and-match appearance: Glass/Solid for non-Home interface screens and an independent Glass/Solid Home choice. Glass interface pages reuse the current Home photograph. Retain stronger reading surfaces and lightweight rendering. The owner requests planning and beginning implementation together, with no separate planning approval gate.

## Inspection and scope

The current release already has normalized appMaterial and homeMaterial preferences, legacy system/inherit compatibility, a shared deferred AppSceneBackground, responsive Home scene assets, protected Reader/Mushaf/listening canvases, static card translucency and chrome-only blur. Reuse these foundations. The current settings handler resets Home to inherit whenever App appearance changes, which conflicts with the new owner decision; Home controls are also hidden in a disclosure.

## Implementation steps

1. Keep both preferences and existing normalization/merge behavior. App changes must never write Home's preference.
2. Expose Home appearance alongside App appearance. Retain Same as app as an optional legacy-compatible convenience; show the independent Glass/Solid choices directly and let choosing one establish an override.
3. Explain the scope in Arabic/English: App governs other interface pages; Home can follow or differ; Glass shares the current Home scene. No new scene assets, persistence layer, runtime dependency or per-card blur.
4. Verify all four explicit combinations through the real settings controls, navigation and reload; ensure changing either preference does not overwrite the other, including reselecting App. Verify shared scene identity and preserved Reader protection, reduced-motion/transparency and contrast behavior.
5. Capture bilingual phone/desktop evidence, run focused unit/browser checks, then full quality and release gates under standing repository release authority. Do not claim manual assistive-technology certification from axe alone.

## Affected files and reusable components

AppearancePanel, existing SettingsSection/SettingsToggleRow/SegmentedControl, bilingual copy, AppearancePanel unit tests and app-materials browser coverage. AppSceneBackground/material CSS stay authoritative; change them only if verification exposes a concrete defect. Architecture/design notes, decision log, index and this phase report document the new independence rule.

## Acceptance

- App Solid/Home Solid; App Solid/Home Glass; App Glass/Home Solid; App Glass/Home Glass persist and render correctly.
- Neither App selection nor reselect overwrites a Home override.
- Inherited Home follows App without rewriting the stored inherit choice.
- The two choices are discoverable without opening a disclosure.
- Glass non-reading pages display the same current scene as Home Glass.
- Existing high-contrast/forced-color/readability/performance/offline contracts remain.

## Phase report — implementation

### Objective completed

Reuse the existing app-wide Glass/shared-scene implementation and make the owner's independent App/Home choice reliable and directly discoverable. No duplicated background system or new per-card blur is introduced.

### Files and components changed

AppearancePanel and its tests, Arabic/English appearance descriptions, app-material/audio-lock/Home-clarity browser fixtures, new independent-appearance and shared-interface-scene browser specs. Architecture/design contracts, decision log/index, this report and fresh release notes/history describe the prospective behavior. Shared SettingsSection/SettingsToggleRow/SegmentedControl, AppSceneBackground and normalized state remain authoritative.

### User-visible behavior

App selection/reselection never resets Home. Both Glass/Opaque groups are always available; selecting Home creates an explicit override, while Same as app remains an optional convenience and displays the effective choice. Existing explicit system/inherit values remain readable without migrating persisted data. Glass interface routes already reuse the current Home scene; protected reading canvases remain unchanged.

### Accessibility and performance

Native labelled radio groups and switch, existing arrow-key/focus/44px behavior, RTL/LTR order and bilingual copy. No new timer, dependency, image, compositor layer or network call. Existing chrome-only blur, static interface cards, high-contrast/forced-color/reduced-transparency and protected reading contracts remain intact. Axe complements visual/keyboard checks, not a claim of full assistive-technology compliance.

### Tests and commands

- Focused AppearancePanel/AppSceneBackground/theme/state unit run: 4 files, 66 passed.
- pnpm typecheck: passed.
- Chromium app-materials + independent-appearance: 8 passed, Arabic/English phone/desktop, all four explicit combinations, setting/reselection isolation, persistence and inherited Home.
- Firefox/WebKit targeted material/lock regression: 20 passed in 6.3 minutes.
- Shared scene route browser coverage: 3 passed in 39.3 seconds, eight interface routes on Chromium/Firefox/WebKit.
- pnpm install --frozen-lockfile: passed. pnpm check: passed in 133.5 seconds, including coverage, integrity, lint, formatting, types, build, CSS and bundle gates. Final hook revalidates the documentation snapshot before push.
- Home clarity and explicit-Glass/contrast browser regression: 9 passed across Arabic/English 320/390/900/1920px on Chromium.
- Exact-commit release outcomes are recorded after deployment in output/INDEPENDENT_GLASS_FINAL_RELEASE_REPORT.md; the intact pre-push hook and complete CI remain required.

### Evidence

Reviewed bilingual desktop/phone Appearance captures in output/independent-appearance-browser, including simple-appearance-en-1440.png. Reviewed shared-scene-azkar.png in output/independent-shared-scene; the route sweep captures all eight interface pages on three engines. Four-combination screenshots record App and Home state in the filename. Browser test API remains forcibly loopback-only; no production visitor writes are used for development verification.

### Risks and documentation

No religious content, repetition, prayer timing, normalized state shape or historical award changes. Shared scene intensity and reading protection retain the established contracts; this phase repairs independence/discoverability rather than introducing a second visual architecture. Legacy System and Inherit remain supported in stored snapshots. Updated docs/ARCHITECTURE.md, docs/DESIGN_SYSTEM.md, docs/agent/DECISION_LOG.md and docs/agent/INDEX.md supersede the former App-resets-Home rule.

### Recommended next step

Review the mix-and-match controls and captures, then retain the standard exact-commit Quality/Pages and both production-domain smoke verification for the release.
