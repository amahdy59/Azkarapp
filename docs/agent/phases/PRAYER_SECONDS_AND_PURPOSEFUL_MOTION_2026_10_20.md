# Prayer seconds and purposeful motion — 2026-10-20

## Objective and authority

The owner approves the reference's small interval ring and seconds countdown, with the word “left” omitted on mobile so the countdown remains one line. They explicitly welcome beautiful, functional, inexpensive animation and request a durable app rule: purposeful motion and microinteractions are part of the default experience; Reduce Motion provides a calmer alternative. This supersedes the previous prayer-summary no-progress-indicator restriction for this small functional ring and the blanket interpretation that all recurrent functional updates are forbidden. Existing contrast, sacred-text, reduced-motion and performance requirements remain. Local only: no commit, push or deployment.

## Inspection and plan before editing

1. Retain the existing minute-based Home clock, dated prayer timeline, prayer calculation, tracking, sticky geometry and horizontal browsing. Pass the previous/next absolute instants through the existing presentation model.
2. Own one visibility-aware seconds clock in the next summary card. Derive time from the absolute deadline on every tick rather than decrementing state; stop while hidden, outside the scroll viewport, unmounted or expired. Reuse the same reading for expanded and condensed labels.
3. Replace the existing clock with a small elapsed-interval SVG ring. Keep fixed-width localized hours/minutes/seconds in LTR numeric order, with a finite seconds fade and short ring transition. Hide localized remaining-time words on mobile, narrow cards and the condensed copy; preserve complete passive accessible meaning and no live announcements.
4. Document the owner's positive motion policy and its bounded functional-update exception in the motion/design/architecture/prayer contracts and decision log. Keep OS and app reduced-motion alternatives and all quality gates intact.
5. Test timing boundaries, clock drift/visibility/offscreen cancellation, localization, no duplicate timers, geometry, mobile/enlarged text, both motion preferences and prayer-card regressions. Produce screenshots and a structured report; run the full non-browser gate after implementation settles.

## Owner-approved restoration follow-up

The owner explicitly approved repairing the independently reproduced WebKit scrolling issue locally. Inspect the closing/focus/scroll event sequence, retain the existing 96px/8px thresholds and interaction hold, repair the smallest responsible boundary, add a deterministic regression and rerun the unchanged sticky assertion in both languages and layouts. Preserve the seconds implementation and concurrent Progress/dropdown work. No publication.

## Implementation and verification report

See [the phase report](../reports/PRAYER_SECONDS_AND_PURPOSEFUL_MOTION_2026_10_20_REPORT.md) for completed behavior, exact commands, browser evidence and the coordinated combined-workspace bundle disposition. The owner-approved motion policy is also recorded in AGENTS.md and MOTION_SYSTEM.md. All changes remain local.
