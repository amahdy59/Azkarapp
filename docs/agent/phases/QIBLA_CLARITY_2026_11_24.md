# Qibla clarity and honest direction — 2026-11-24

The owner approves the Qibla essential-view and details/recovery references and explicitly rejects changes to Home's appearance. Implement only Qibla: a complete dial, visible location/source, one turn instruction and optional opaque details. Preserve Home, More, navigation, prayer settings, reminders, reviewed content and persistence. Explore, city switching/comparison and learning modules remain future proposals.

Keep location and orientation permission behind explicit actions. Never relabel a fresh coordinate fix with the saved city, infer a confirmed city from the nearest preset, or silently change prayer settings. Surface location accuracy/time when provided and distinguish these from heading accuracy. Use an offline, validated magnetic-declination correction so supported magnetic headings and the calculated true-north bearing share a reference. Reject invalid/relative readings, pause hidden work and recover from stale/poor readings without retaining a false alignment.

Reuse the existing Header, Button, ResponsiveSheet and icon layer. Put reusable dial presentation in components and sensor lifecycle in a focused hook. Retain static north-up fallback and desktop guidance. Confirm alignment after the existing 350ms dwell with one optional haptic; respect app/OS reduced motion. Keep text equivalents, scoped announcements and 44px actions.

Test permissions, accuracy/reference conversion, stale/hidden/unmounted work, location recovery, details focus/opacity, no-scroll ordinary phone layout and scroll/reflow at narrow/enlarged/short sizes. Verify Arabic/English, phone/tablet/desktop and themes/material/accessibility fallbacks. Capture actual UI evidence, run intact local/CI release gates and produce the phase report. No dependency or bundle-ceiling increase is authorized.

## Publication status

The owner’s 2026-11-24 publication hold in DECISION_LOG.md supersedes standing release authority and the release wording above. Keep this work local: no commit, push, deployment or deployed release-note rewrite. Final release belongs to a separate owner-selected chat. See reports/QIBLA_CLARITY_2026_11_24_REPORT.md (relative to docs/agent).

## Compass material refinement — 2026-11-24

The owner finds the initial compass cartoonish and requests a robust, slightly photorealistic treatment. Refine only QiblaCompassDial artwork: a slim shaded metallic bezel, 5-degree engraved-style graduation marks, quieter crosshairs, slender faceted two-ended needle, machined centre cap and shaded architectural Kaaba faces. Keep all live/static rotation, upright labels/target, text alternatives, confirmation and reduced-motion behavior. SVG gradient identifiers are instance-unique. Materials derive from existing semantic tokens; the Kaaba’s physical black/gold material uses local artwork colors. No bitmap/network asset, runtime dependency, Home/navigation change or new animation is added.

## Approved final recommendations — 2026-11-24

The owner approves implementing all final recommendations and requests actual screenshot evidence, with no push. Keep Home/navigation intact. Clarify saved-location provenance and expose Use my location visibly; label the fixed physical top of the phone only while live guidance runs; provide direct Retry for stale/unavailable/denied/unsupported compass states and calibration help for poor readings. Show an approximate-location warning above 100m reported uncertainty (a product warning threshold, not guaranteed direction quality). Keep refreshed coordinates transient and prayer settings unchanged. Add an explicit WMM2025 review-before-2029-07-01 unit gate and device acceptance matrix. Capture real rendered saved/live/stale/aligned/poor/approximate states in Arabic/English with simulated sensor/fix states labelled as such. Physical-device/assistive-technology evidence must remain Pending unless actually executed. No commits, push, deployment or release-note changes.

## Location notifications without layout movement — 2026-11-24

The owner requests the location-update result and approximate-location warning in a notification modal with Close, without moving page elements. Both messages now use the existing portalled Modal with an opaque Qibla surface, localized Location update title, visible X and Close button, bounded scrollable text, Escape dismissal and explicit focus return to the location action. No result/warning paragraphs remain in the main layout. Fresh coordinates and accuracy continue to update transiently; prayer settings remain unchanged. Each result opens once after the user-requested lookup, including actionable failure messages; an earlier inaccurate fix's warning is not repeated after a later lookup failure.

## Final local acceptance and consolidation — 2026-11-24

The owner approves the final acceptance recommendations and repeats the no-push instruction. Add Arabic/English Light, Midnight, app high-contrast and system forced-colors evidence; retain actual handset and TalkBack/VoiceOver acceptance as Pending without a connected device. Strengthen Kaaba outlines in contrast modes and use system semantic colors for the mounted Qibla screen and its shared shell in forced colors.

Resolve the recorded combined-checkout lint/format/output-budget blockers without changing content, raising budgets or weakening checks. Extend the existing build-only literal compactor to frequent short metadata, with byte-exact exported-value tests. Convert the nine external document generators to ESM for the existing lint contract, retaining the latest concurrent generator versions and every template segment; format generated documents without regenerating their PDFs or interpreting reviewed content. Run complete quality and targeted browser gates, retain evidence and report remaining acceptance gaps. No commit, push, deployment or release-note rewrite.
