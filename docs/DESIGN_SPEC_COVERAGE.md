# Design specification coverage

This file maps the supplied July 2026 design specification to implementation evidence. It follows the engineering and release rules in `QUALITY_CHECKLIST.md`.

## Implemented

- Owner-approved Mushaf/Progress continuation (2026-10-20): single-owner tap visibility, dismissible named word glosses, reversible Mushaf-only colours, concurrent critical font/data preparation with independent meanings, shared responsive reading sheets and explicit close actions; labelled filter disclosures, Overview/Trends/Records navigation and independent icon/progress cards. Evidence and release acceptance: docs/agent/phases/MUSHAF_INTERACTIONS_PROGRESS_TABS_2026_10_20.md and output/mushaf-progress-release-2026-10-20/PHASE_REPORT.md. Physical-device speed/touch and human assistive-technology checks remain distinct from automated evidence.

- Owner-approved mobile refinement: stable full-screen sharing, selectable zikr/collection content, larger previews and balanced short readings; native compact Library/Progress filters with visible applied context; factual hold-to-unlock feedback and protected in-app navigation. Native OS pinning and human screen-reader/device acceptance remain separate.

- Splash → language → login/guest → localized onboarding → Home flow.
- Morning, Evening, and Sleep session cards with not-started, partial, and complete progress states.
- Category browsing, zikr reader/counter, audio controls, completion summary, search, settings, and download/notification panels.
- Home / Mushaf / Azkar / Progress / Settings primary navigation; Progress has Day/Week/Month/Year views.
- Midnight, Light, and true-black Dark themes using the supplied semantic colors. The six supplied frames were verified with Dark active in Figma; the resolved OLED palette is `#0d0d0d` background, `#171717` cards, `#222222` tertiary surfaces, `#555555` borders, `#f5f0e8` primary text, `#d4d0e0` secondary text, `#b0aed0` tertiary text, `#d4a020` gold, and `#1a7060` teal.
- Supplied spacing/radius primitives and the offline system-typography contract for English UI, Arabic UI, and zikr content. See `DESIGN_SYSTEM.md`.
- Adaptive app canvas: bottom navigation at compact/medium widths, a rail at expanded widths and a sidebar on large screens, with safe areas, RTL direction and mirrored directional icons. The 390px Figma frame is a design reference rather than the current desktop shell.
- Reader content uses one contained vertical scroll region, keeping Arabic text, controls, counter, and footer actions reachable on short-height viewports. Verified from 320 px narrow phones through tablet and desktop; Playwright guards the shell geometry.
- Reader counting accepts the full non-control canvas, while buttons, menus, dialogs, inputs, and scrollbars are excluded. The in-canvas Benefit sheet provides strictly localized Arabic or English supporting content.
- Settings changes language in place with an accessible segmented radio control; ordinary dropdown fields use the shared themed Select. Language updates document language, direction and visible copy.
- Zikr and collection sharing use an on-device preview with Story, Square, Portrait and Tall PNGs, olive/gold/lavender palettes, indivisible zikr cards, sourced long-surah name/benefit reminders with mandatory Mushaf QR, optional English meaning/benefit/pronunciation and ordinary-card QR, explicit current/selected/all scope, exact links, accessible text alternatives and matching ZIP saving. Sharing/copy failures are explicit; available native targets are device-dependent. Physical-device social-app and screen-reader validation remain pending.
- Reusable empty search, network, offline, audio, download, interrupted-session, and skeleton state components.
- Desktop marketing page at `/landing` with a 1440px-ready responsive layout.
- Automated formatting, linting, strict types, unit tests, bundle budgets, mobile/desktop WCAG scans, and CI gates.

## Product assets and manual evidence still required

The specification also describes design/research deliverables that cannot be fabricated from code alone: App Store screenshots, market research, user-testing results, device notification previews, and signed-off VoiceOver/TalkBack testing. These remain release inputs and must receive dated evidence in `QUALITY_CHECKLIST.md`.

The reusable component APIs cover current product flows. Additional Figma-only variant matrices should be added when their corresponding interactive behavior is accepted; unused duplicate components should not be added merely to inflate component counts.
