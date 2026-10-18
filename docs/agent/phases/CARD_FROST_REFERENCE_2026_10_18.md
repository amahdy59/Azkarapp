# Routine-card frost reference — local only, 2026-10-18

## Objective and authority

The owner requests applying the supplied Home morning-routine card's frost across Glass-mode cards, improving consistency locally without pushing. Preserve all pending local changes; no commit, push or deployment.

## Inspection and plan

HomeCard, Card and explicitly owned feature cards already share 24% navy tint and stationary 22px/135% frost. Interface cards still use a brighter 7%/1.5% sheen than the supplied routine card's 5.5%/1.2% reflection. Consolidate reflection stops and ordinary/hover edges in semantic tokens and use the reference sheen across ordinary cards. Preserve the prayer-selection reflection, 36% reading tint, scrolling-header treatment, 80% overlays, nested single-filter policy and appearance/accessibility fallbacks.

Add browser comparisons against the actual routine card for Home, Library, Progress and Appearance at Arabic phone/English desktop sizes. Check loaded imagery, overflow, axe and opaque/high-contrast fallbacks, capture screenshots, run affected material tests across engines and the complete non-browser gate, and report results. No content, state, dependency, geometry, prayer, playback or release-manifest change.
