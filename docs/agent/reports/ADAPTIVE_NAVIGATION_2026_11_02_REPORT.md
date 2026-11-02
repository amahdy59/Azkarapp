# Phase Report — Adaptive devotional navigation

## Objective

Implement the approved mobile/tablet priorities, retain Settings and Qibla access, expose Masbaha when space permits, and preserve reliable discovery of Progress and secondary tools. Grain is owner-accepted. All work remains local.

## Scope completed

BottomNav shows Home, Quran, Azkar, Qibla, optional Masbaha, Settings in stable order. Masbaha appears at 36rem available container width; rem follows text enlargement. Small/enlarged layouts recover to five permanent links. Primary routes remain unchanged. Utility callbacks and active state come from App. Wide rail/sidebar retain Progress and expose Qibla/Masbaha. Home retains its Masbaha card and adds More; More gains localized Progress access. Today's path and More open Month Progress. No persistence, reviewed content, dependency, remote policy or release changes.

## Files changed

LayoutShells/component tests and CSS; App; HomeScreen; MoreScreen/test; Today's path test marker; Arabic/English More progress copy; adaptive-navigation browser spec and shared open-progress test helper; affected navigation/responsive/accessibility/Progress-flow expectations; feature browser map; README, architecture/design/quality guidance, decision log, active phase and R1–R5 ledger.

## Components added or modified

BottomNav, NavRail, NavSidebar composition, HomeScreen, MoreScreen and existing ToolCard. Reuse icons, native links, routes and i18n. No new runtime presentation component or dependency.

## User-visible changes

Settings and Qibla remain permanent bottom destinations. Masbaha additionally appears when space permits; its Home/More access remains. Compact Progress is secondary through Today's path and More, with direct/wide routes preserved. More is discoverable at the end of Home. Navigation is stable across ordinary route/scroll/audio changes; only defined layout thresholds affect optional visibility.

## Accessibility work

Native links, modified-click behavior, accessible labels, at least 44px targets, keyboard actions, explicit active cue, unique aria-current, RTL order, enlarged-label wrapping and display:none for unavailable optional links. Existing safe areas, three-column enlarged recovery, short-wide scrolling and immersive/focus exclusions remain. Browser axe/geometry does not establish physical AT compliance.

## Tests added or updated

Unit tests verify utility callbacks/native hrefs and primary deselection, compact Progress replacement, and More Progress access. Browser scenarios cover width threshold boundaries, Arabic/English, normal/enlarged text, labels/targets/active state, Home cards, More/Progress discovery, wide utilities and existing navigation/motion. Existing tests now use the appropriate visible Progress entry rather than assume a permanent compact Progress tab. Assertions and coverage ceilings remain intact.

## Commands run

Exact results, diagnostic history, counts and current-input gates are recorded in output/adaptive-navigation/PHASE_REPORT.md, with raw logs/JSON. Planned gates: targeted units/browser, full pnpm check, build:pages, core smoke, inventory and feature-specific engines. No stale pass is represented as exact-current evidence.

## Visual/manual evidence

Phone/tablet/threshold and 320px/200% screenshots under output/adaptive-navigation/. Owner visual review and physical Android/iOS/AT remain separate.

## Documentation updated

README, design system, architecture, quality checklist, active phase, decision log and R1–R5 acceptance ledger.

## Decisions recorded

Owner explicitly accepts procedural grain and approves all recommended navigation changes while requiring Settings permanently visible. This supersedes the former proposal-only Masbaha/Qibla hold. Existing immersive reading navigation exclusions remain; no publication authorized.

## Known limitations or remaining risks

Optional Masbaha uses a conservative 36rem text-aware threshold; exact visual acceptance remains with the owner. Native browser text scaling, safe-area hardware and assistive technology require physical-device checks. Production bundle headroom remains limited. Full current-commit CI is still needed before any future release.

## Out-of-scope findings

No audio/download, prayer behavior, content, persisted state or texture changes. Use the permitted local port 5173 for audio verification; 5181 retains the previously documented hosting CORS limitation.

## Recommended next step

Review the local adaptive navigation screenshots, then physical-device acceptance. Keep publication held until explicitly resumed.
