# Phase plan — Calm prayers and separated overlays

## Owner request and plan

Soften prayer summary strokes, remove vertical icon dividers and next-prayer interval bars, retain clear aligned text countdowns, and improve expanded prayer composition on phone and desktop. Use a compact identity/status header, an organized checklist and primary action, and a quiet reviewed-evidence section without modifying its content. Preserve all tracking, targets, keyboard, RTL and enlarged-text behavior.

Fix visible text competition under overlays. Expanded listening must visually hide its covered reader while retaining cached scenery and restoring the reader on collapse. Dialogs/menus use a denser 80% navy material with 28px stationary frost; ordinary cards retain Home material. Native focus trapping, inert state and close recovery remain. No audio, content, state or network changes.

Inspect shared PrayerTrackerCards/PrayerActionsCard/PrayerMomentPanel, AudioPlayerSurface, ResponsiveSheet and material CSS. Verify softer computed borders, no divider/progress, stable heading/time geometry through collapse, overlay text isolation/restoration, dialogue contrast/focus and actual screenshots in both languages and responsive widths. Update explicit prior interval-bar/modal-tint contracts and affected tests; run targeted regressions, intact local gates, fresh release notes and exact-commit CI/production verification.

## Existing release regression

CI for 75964d13 found the new summary grid shifted its hidden status anchor by 10px when condensed countdown appeared. Keep the strict stable-geometry assertion and correct the grid alignment; do not relax tolerances. Public custom-domain .6 is live, but GitHub Pages correctly remains at the previous verified commit until Quality succeeds.

## Phase report

### Objective and scope completed

Quieter summary cards with 18% neutral boundaries and restrained current/next edges, softer icon/pill strokes, no vertical dividers and no next-prayer interval bar. Text countdown, five prayer actions, status semantics and free horizontal scrolling remain. Expanded tracking uses 44px rows with consistent padding; actions precede reviewed evidence on phone and share the existing two-column desktop composition.

### Files and components

PrayerTrackerCards/home-wird.css; PrayerActionsCard/PrayerMomentPanel; AudioPlayerSurface and FloatingAudioPlayer/floating-audio-player.css; shared materials.css. Updated affected unit and browser specs, design/architecture/prayer/audio contracts, decision log/index, bilingual release .7 and offline history. No dependency, sacred content, playback controller, calculation, persistence or synchronization changes.

### Accessibility and behavioral verification

Covered Reader siblings receive a reversible visual-hiding attribute alongside inert/aria-hidden; collapse restores the original flags and restores native keyboard focus. Native focus scope, nested select Escape recovery, 44px+ targets, reduced motion and fallback themes remain. Dialog/menu/listbox/expanded audio material is denser: 80% navy with 28px/135% frost; scenery-backed cards retain their existing tint/filter. The lock's transparent blocking shield remains untouched. Ordinary stable heading geometry is checked through repeated collapse/reversal, with unchanged tolerances.

### Tests and evidence

Targeted PrayerTrackerCards, FloatingAudioPlayer and PrayerActionsCard suites: 76 passed (39.69s). First browser round caught a material selector-priority defect; second confirmed the denser material but found focus returning before visible reading styles settled. Both were repaired without relaxing assertions. Final engine results and intact release gates are recorded in output/CALM_PRAYER_OVERLAY_RELEASE_REPORT.md. Screenshots include softer summary row, bilingual expanded prayer, expanded audio and frosted options/dialogs at phone/desktop sizes, in output/calm-tight-engine-proof. Initial reviewed captures are in output/calm-prayer-overlay-engines.

### Documentation and decisions

This owner review supersedes the earlier bright outlines, dividers, native next-prayer bar and 28% overlay tint. Ordinary reading/card tint and App/Home appearance independence remain authoritative. Docs updated: ARCHITECTURE, DESIGN_SYSTEM, PRAYER_TIMES, audio/architecture, decision log and phase index.

### Risks and recommended next step

Physical older-device compositing and assistive-technology acceptance remain manual; automated browser/axe checks do not certify complete accessibility. Do not add decorative blur animation or extra nested material layers. Complete exact-commit CI and both public-site smoke tests, then assess on representative physical phones.

Owner spacing correction: 8px section gaps, no checklist row gaps, 44px minimum rows and normal Arabic line height. The previous roomy 16px/48px treatment is superseded. Covered reader content uses non-inherited parent opacity with existing inert/aria-hidden, avoiding stale inherited visibility in browser focus recovery. No test tolerance or focus assertion is relaxed.

Release remediation: exact-commit CI39020640853 found one 12px mobile information/checkbox-center mismatch. Removed the information button's obsolete negative inline margin; retained 44px targets, 8px gaps and the unchanged 1px browser assertion. Release .8 announces only this alignment correction; .7 is retained verbatim in offline history. Final results follow in the output report.
