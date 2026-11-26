# Home corner status and compact location — 2026-11-25, local

## Owner-approved scope

The owner selects the compact single-line Now/Next summary, blank and quieter future states, and location option A (a split control). After reviewing implementation, they reject inline status and the altered desktop/tablet look. Their latest instruction requires passive social-style corner badges that occupy no layout space, restoring the original desktop/tablet card size, typography and materials. Preserve the existing tracking/location behavior, independent Settings/Learn/publication work and the local publication hold.

## Implementation plan

1. Reuse HomePrayerSummary, HomePrayerOverview, HomeLocationRow, existing dated models/records, shared Button, icon exports and localized copy. Keep calculations, recording windows, exact dates, normalization and synchronization untouched.
2. Restore the existing desktop/tablet card presentation. Remove the visible status footer. Position a recorded check, eligible-unrecorded circle or directional next arrow absolutely across the top logical-start corner (top right RTL, top left LTR). Badges reserve no row or timing width. Future unrecorded prayers have no badge and retain quieter readable semantic ink/borders. Current marker, next emphasis, dated recording and selection stay independent; complete accessible descriptions and hover titles explain the state.
3. Place Now/name and Next/name/countdown on one baseline when width permits. Keep the labelled 44px Show/Hide action; compact widths use an accessible icon control. Enlarged text and short widths wrap without clipping or shrinking the reader's text.
4. Replace the full-width location bar with a content-width split control below timings. City opens existing location settings; crosshair explicitly detects fresh coordinates using the unchanged callback and result dialog. Preserve busy/duplicate protection, failed-request saved-location retention and focus recovery. Add no Home picker or automatic location detection.
5. Verify badge overlay/no-displacement geometry, original desktop/tablet dimensions/type, dated recording, availability, keyboard/focus, long names, Arabic/English, phone/tablet/desktop, Glass/light solid, 320px/200%, accessibility fallbacks and affected engines. Capture actual screens. Run the local quality gate and Pages build and report exact results and independent blockers.

This latest owner correction supersedes the earlier inline concept and its compressed desktop/tablet implementation. Only the visible status footer, prior two-line summary and separate Change/Refresh presentation are replaced. Reviewed content, dependencies, persistent data, prayer calculations, routes, deliberate disclosure and location recovery remain unchanged. No commit, push, deployment or release-note change is included.
