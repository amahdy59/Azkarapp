# Home routine action bounds — local only, 2026-10-18

## Objective and authority

The owner requests suggestions and local implementation for the Home routine share button escaping its card when the continuation label is long. Truncating action copy is authorized; devotional content remains unchanged. No commit, push or deployment.

## Inspection and plan

Owner follow-up: match both action heights and review every app color mode. Stretch the action row and share wrapper, use 52px share width/minimum height, match the primary's rounded-2xl corners and focus offset, and provide theme-token hover fills. Preserve flex shrink and truncation. Add equal-height assertions to the existing cross-engine enlarged-text cases, plus Midnight/Dark/Light × Glass/Opaque screenshots, focused-action axe checks and high-contrast coverage. This supersedes the earlier 44px share size; changes remain local.

PrayerRoutineCard already truncates its label and prevents the share control and arrow from shrinking. Its primary button has a full-width basis and an automatic minimum width, allowing the label's intrinsic width to displace the adjacent share action. Give the primary button a zero minimum width and the remaining flexible space. Retain the existing label ellipsis/title, full accessible name, fixed share target, gap and focus treatment.

Verify partially completed morning routines in Arabic/English at 320px and 390px, normal/200% text, Chromium/Firefox/WebKit. Assert both actions stay in the row without overlap, maintain 44px targets and keyboard order, and preserve primary activation. Capture card screenshots and run HomeCards unit tests and the non-browser quality gate. Preserve all pending local material/prayer changes.
