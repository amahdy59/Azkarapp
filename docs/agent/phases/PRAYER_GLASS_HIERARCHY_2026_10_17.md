# Phase plan — Frosted prayer hierarchy

## Owner request and decisions

Match the supplied prayer-row reference using existing app iconography: icon tiles/dividers, generous time type, rounded status pills, quiet blue upcoming cards and gold current/next accents. Retain frosted glass and Solid/accessibility fallbacks. Mobile uses comfortable card widths, showing around three when width permits, with horizontal scrolling instead of squeezing. The owner explicitly selects “Show together initially; scroll freely”: initially reveal current/next together and reposition at a prayer change, without pinning or snapping back during browsing.

## Plan before implementation

Finish the preceding global material phase as a separate commit, then refine the existing PrayerTrackerCards summary anatomy and lazy Home CSS. Reuse existing prayer models, minute clock, actions, status translations, chronological RTL/LTR order, disclosure, countdown and remaining-time progress. Replace no calculation, source, state or persistence behavior. Native full-card buttons/progress and focus remain. Preserve the selected edge outside the card and existing bounded sticky-collapse/reduced-motion behavior.

Desktop: all five cards fit a bounded row, with clear icon/name/time alignment and pills carrying temporal status. Current is strongest gold, next has a restrained gold outline/countdown, later cards have a subdued blue edge. Avoid copied decorative background assets, continuous pulses, fabricated timings or extra blur layers. Retain recorded state in accessible description and expanded details.

Phone: use a minimum comfortable width around 7.5–8rem at ordinary text size, allowing three only when the viewport genuinely permits. Enlarge rather than clip when text grows. Keep a partial neighbor/scroll cue, native horizontal scrolling and keyboard focus reveal. Continue using existing current/next reveal logic; no scroll listeners that fight manual browsing.

## Verification and release

Update geometry tests for the new deliberate anatomy without weakening contrast, hit targets, footer/progress containment, RTL, overflow, current/next reveal or reduced-motion assertions. Capture actual bilingual phone/desktop at current/next states and enlarged text. Run relevant unit/browser checks, complete local gates and exact-commit CI/Pages/production smoke. Report screenshots, exact results and physical-device limitations. Release notes cover both separately committed appearance phases if they ship together.

## Recommendations adopted

No pulsing status dot or excessive neon glow; text labels distinguish state independent of color. Keep actual remaining time and its native bar, meaningful empty recording state, and generous horizontal spacing. Apple material guidance informs control/content hierarchy rather than claiming a native Apple shader or universal blur radius.

## Phase report

### Objective, scope and components

Reference-inspired frosted prayer cards now have icon tiles/dividers, larger time type, rounded status pills, blue later-prayer boundaries and gold current/next accents. PrayerTrackerCards, its unit tests and lazy Home CSS are changed; new short Arabic/English Now-pill copy uses i18n. Shared prayer calculations, records, audio, sources and action handlers remain unchanged. Global material is a preceding separate commit.

### User-visible and accessibility behavior

Ordinary phone cards have a comfortable 8.25rem minimum where space permits, native horizontal scrolling and an initial current/next pair. Around three fit at 480px; narrower screens show fewer with neighboring context. At the overnight boundary the narrow cyclic sequence begins Isha then Fajr. Free scrolling is never snapped back by a minute change. Full-card native buttons, expanded semantics, outside selection edges, native remaining-time bar and reduced-motion sticky behavior remain. Saved record facts remain in accessible descriptions and expanded details. At 200% text in the narrowest container, time occupies a full row without clipped period labels; optional decorative clock icons step aside when space is tight. No pulsing dot, animated blur, additional clock or new asset.

### Tests, evidence and commands

PrayerTrackerCards and AppSceneBackground unit suites: 22 passed, 21.63s. Prayer-only unit regression: 19 passed, 6.19s. The initial browser round found a 320px/200% English time overflow; corrected with a full-row time layout, preserving text size and assertions. All other 12 selected Chromium geometry, new row/fit/free-scroll and overnight cases passed in 1.0m before that correction. Final three-engine regression and exact quality/release results are in output/UNIFIED_HOME_GLASS_FINAL_RELEASE_REPORT.md.

New prayer-glass-hierarchy browser cases cover Arabic/English 390/480/1440px, current/next initial bounds, matched frost, equal height, no clipping, three-card fit at 480px, axe, free-scroll persistence and enlarged text. Overnight case covers Isha/Fajr adjacency. Updated Home-clarity tests preserve equal geometry, footer/progress containment, targets, focus, RTL, enlarged text and connected selection edges while asserting the new anatomy. Screen-reader-only record facts are excluded from visual clipping measurement and checked semantically instead.

Reviewed desktop capture output/prayer-layout-preview/prayer-glass-hierarchy-fro-e0b82-archy-en-1440-cross-browser-desktop-chromium/prayer-hierarchy.png. Final actual phone/desktop and 200%-text captures are in output/prayer-final-engines. Documentation updates: this brief, PRAYER_TIMES, design system, decision log and index. Release .6 notes include the prayer refinement alongside the separately committed shared material changes.

### Risks and recommended next phase

Physical older-device scrolling/battery and assistive-technology acceptance remain manual. App and Home Glass/Solid independence remains authoritative. No religious interpretation/content, timing, persistence or sync changes. Validate on representative physical Android/iPhone screens before adding decorative effects or additional material options.
