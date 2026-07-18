# Design specification coverage

This file maps the supplied July 2026 design specification to implementation evidence. It follows the engineering and release rules in `QUALITY_CHECKLIST.md`.

## Implemented

- Splash → language → login/guest → localized onboarding → Home flow.
- Morning, Evening, and Sleep session cards with not-started, partial, and complete progress states.
- Category browsing, zikr reader/counter, audio controls, completion summary, search, settings, and download/notification panels.
- Home / Azkar / Settings primary navigation, with persisted week/month/year progress views under Settings.
- Midnight, Light, and true-black Dark themes using the supplied semantic colors. The six supplied frames were verified with Dark active in Figma; the resolved OLED palette is `#0d0d0d` background, `#171717` cards, `#222222` tertiary surfaces, `#555555` borders, `#f5f0e8` primary text, `#d4d0e0` secondary text, `#b0aed0` tertiary text, `#d4a020` gold, and `#1a7060` teal.
- Supplied spacing/radius primitives and the locked typography contract: Inter for English UI, Noto Sans Arabic for Arabic UI, and IBM Plex Sans Arabic for zikr content. See `DESIGN_SYSTEM.md`.
- Responsive phone canvas: full-bleed at widths up to 430 px and a centered 390 px Figma frame on tablet/desktop viewports, with safe areas, RTL direction, and mirrored directional icons.
- Reader content uses one contained vertical scroll region, keeping Arabic text, controls, counter, and footer actions reachable on short-height viewports. Verified from 320 px narrow phones through tablet and desktop; Playwright guards the shell geometry.
- Reader counting accepts the full non-control canvas, while buttons, menus, dialogs, inputs, and scrollbars are excluded. The in-canvas Benefit sheet provides strictly localized Arabic or English supporting content.
- Settings changes language in place with a native selector, and the selected language immediately updates document language, direction, and visible copy.
- Zikr sharing generates a private, on-device 1080×2920 PNG with localized content and Light, Midnight, or Dark theme styling, then uses image Web Share with clipboard/download fallbacks.
- Reusable empty search, network, offline, audio, download, interrupted-session, and skeleton state components.
- Desktop marketing page at `/landing` with a 1440px-ready responsive layout.
- Automated formatting, linting, strict types, unit tests, bundle budgets, mobile/desktop WCAG scans, and CI gates.

## Product assets and manual evidence still required

The specification also describes design/research deliverables that cannot be fabricated from code alone: App Store screenshots, market research, user-testing results, device notification previews, and signed-off VoiceOver/TalkBack testing. These remain release inputs and must receive dated evidence in `QUALITY_CHECKLIST.md`.

The reusable component APIs cover current product flows. Additional Figma-only variant matrices should be added when their corresponding interactive behavior is accepted; unused duplicate components should not be added merely to inflate component counts.
