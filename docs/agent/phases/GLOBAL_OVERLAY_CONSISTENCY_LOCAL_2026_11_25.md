# Global overlay consistency — local, 2026-11-25

## Approved objective

The owner approves the preceding overlay recommendations and requests applying them globally, locally only. Use the phone Mushaf index as the reference for ordinary reader panels: usable stationary top/bottom controls, bounded content, a single active panel and predictable recovery. Top controls open downward and bottom controls upward. Contextual menus stay anchored and collision-aware; confirmations and focused tasks retain proper modality.

## Plan before editing

1. Inventory existing shared sheets, dialogs, menus, pickers and both Mushaf readers. Preserve independent pending changes and content/data contracts.
2. Extend existing primitives with shared trigger-origin capture, directional entry/exit, protected surfaces, dynamic viewport/scroll bounds and reduced-motion behavior. Keep existing Radix/Vaul dependencies and dialog focus containment.
3. Reuse the reader's content slot for ordinary options/settings panels on phones, retaining keyboard-accessible bars and mutual exclusion with the index. Preserve wider docking, page geometry, bookmarks, progress, audio and offline behavior.
4. Add focused unit/browser regression coverage for both origins, panel replacement, focus/Back, keyboard/short-height/enlarged text, themes and reduced motion. Run targeted feature suites and the full non-browser gate plus Pages build; capture actual screenshots and record exact results/limitations.
5. Document the shared contract, coverage and phase report. No commit, push, deployment or release-note update.

## Boundaries

No religious-content edits, storage/schema/synchronization changes, new runtime dependencies or responsive-shell replacement. Existing content-specific evidence/sharing requirements remain. Physical-device and human assistive-technology acceptance must be reported separately from browser evidence.

## Local verification checkpoint

Implemented the shared overlay family and reader content-slot panels. The complete non-browser gate passed; 36 final overlay/index browser cases and six Glass checks passed across Chromium, Firefox and WebKit. Final fullscreen-reader integration checks, targeted follow-up gates and the Pages build are recorded separately in the [phase report](../reports/GLOBAL_OVERLAY_CONSISTENCY_LOCAL_2026_11_25_REPORT.md). The [actual-app gallery](../evidence/global-overlays/README.md) includes both languages, opaque page themes, tablet and 320px/200% text. No commit, push or deployment. Real-device keyboard/assistive-technology acceptance remains the recommended next step.
