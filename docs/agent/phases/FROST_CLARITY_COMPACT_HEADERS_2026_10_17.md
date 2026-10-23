# Phase plan — Frost clarity and compact consistent headers

## Owner request and authority

The owner supplies eight screenshots and requests stronger frosted cards/controls, readable glass colors, headers that obscure scrolling text, fewer decorative separators, a common compact zikr hero with title aligned to its actions, and removal of standalone-counter bottom instruction banners. This supersedes the earlier 18% card/28% reading and transparent header treatment where clarity requires denser material. Preserve independent Home/App selection, solid/accessibility fallbacks, content, counters and offline state. Standing direct-main release authority applies; no planning gate requested.

## Inspection and plan

1. Reuse materials.css and Home materials, with shared semantic on-media success/action colors. Make navigation and sticky controls denser than content; give ordinary and long-reading surfaces a calmer stationary frost without per-button blur layers.
2. Remove decorative header borders/shadows consistently in Header. Cover the entire Progress sticky control group with one dense material; prevent nested header filter suppression from making moving text legible beneath it. Keep native scroll, stacking, focus and menu portals.
3. Align desktop Reader and ReadingScreenChrome titles within their toolbar row using the same responsive grid, allowing wrapped/enlarged titles and action rows to grow. Retain progress and sacred text. Remove bottom CounterGuidance from Masbaha/Salawat while keeping header keyboard help and phone introductory guidance.
4. Add targeted actual-browser checks for scrolled headers, semantic success/share contrast, hero alignment/height and absent bottom banners in Arabic/English phone/desktop, with axe and solid/high-contrast recovery. Preserve existing tests, geometry tolerances and coverage requirements.
5. Update contracts/release notes, run local gates and feature browsers, push through intact hook, require exact-commit Quality/Pages and live smoke. Capture screenshots and a phase report.

## Risks

Web frost is app-specific, not native Apple rendering. Avoid animated blur and nested GPU filters. Physical-device compositing and assistive technology remain manual checks; automated scans alone do not establish accessibility compliance.

## Implementation report

Updated shared material tokens (36% cards,48% reading,22px frost),98% protected page headers, semantic success/filled-status/share contrast, divider-free Header/Settings defaults and devotional footer, compact Reader/standalone toolbar titles and removed bottom counter banners. No dependencies, content, persistent state or playback changes. Keep all44px controls, native focus, bidirectional/enlarged text and material fallbacks.

Affected feature tests add navigation/devotional browser flows in both languages and phone/desktop sizes, retained axe and exact alignment/focus assertions, and update approved material/header dimensions. The first six-screen test exceeded WebKit's90-second budget; split it into two coherent flows with every assertion preserved and no timeout increase.53targetedunits passed; full check passed187.3s after semantic-color lint correction. Final exact-source feature/gate/production results and screenshots are recorded in output/FROST_CLARITY_RELEASE_REPORT.md. Physical-device performance and human screen-reader acceptance remain unverified. Next phase is representative-device acceptance after the required release completes.

Owner screenshot selection: retain the open scene-backed Masbaha/Salawat canvas without an extra dark reading panel. Frost remains on their controls/menus; compact shared titles and removed bottom banners remain. This specifically supersedes applying long-reading tint to the standalone counter canvas.

Owner frost correction: replace the near-opaque navy header shade with a lighter slate glass (42% tint), soft white sheen and stationary36px/135% frost. Extend Progress's sticky material across the page gutters, add16px lower breathing room and rounded lower corners. This supersedes98% header shade; maintain44px controls, focus scroll clearance, opaque accessibility recovery and the owner-selected open counter canvas. Test foreground contrast and moving-content separation against actual screenshots.
