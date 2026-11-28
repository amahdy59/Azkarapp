# Prayer location page review — local 2026-11-27

## Owner authority and objective

Review the supplied older prayer-location screenshot against the current page, apply remaining relevant repairs locally and report the verification honestly. The owner explicitly prohibits pushing. Preserve all independent working-tree changes; no commit, deployment or release-note rewrite belongs to this phase.

## Plan before editing

The owner's subsequent simplicity instruction supersedes the preliminary manual-field validation work: users should use their current location or select options, without entering place names, coordinates, zones or minute numbers manually. Remove clutter and unnecessary detail. This explicitly supersedes the older manual-coordinate editing and always-visible timezone/provider-detail presentation contracts for this panel only.

1. Keep one dominant Use my current location action and a secondary Choose a city picker. City selection must work by browsing without typing; optional search only filters existing choices.
2. Remove manual city/coordinate/timezone text forms and Save. Preserve all existing saved values until an explicit selection changes them. Show place/source once; put timezone/DST and optional corrections inside one More settings disclosure.
3. Reuse the protected SelectField for timezone choices labelled by familiar cities/countries. Retain the current saved zone even outside catalogue coverage. Keep calculation selection immediate, with full authority names inside its picker and accessible description rather than duplicated visible text.
4. Replace editable minute numbers with labelled 44px Earlier/Later buttons, signed values and Reset adjustments. Retain existing bounds, prayer semantics, cancellation of obsolete GPS, normalization and offline persistence.
5. Update tests for the approved selection-only behavior. Verify both languages, ordinary/enlarged narrow screens, tablet/desktop, protected surfaces, keyboard/focus, GPS success/denial/races and offline/reload durability. Capture new actual screenshots; earlier validation screenshots no longer represent the final design.
6. Run targeted checks and the complete non-browser gate, preserving assertions/coverage/budgets. Record independent aggregate failures separately in the required phase report.

Accessible controls follow the repository's stronger 44px target contract and [WAI control labelling](https://www.w3.org/WAI/tutorials/forms/labels/). Native buttons avoid the touch-assistive-technology caveat of custom slider controls described by the [WAI slider pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/).

## Boundaries

No prayer formula, method, minute-adjustment semantics, persistence schema, synchronization, reviewed devotional content, dependency, router or shell-tier changes. Device timezone remains device-supplied rather than inferred from GPS; existing explanatory copy stays honest about that boundary.

## Completed local checkpoint

The simplified selection-only page is applied locally. The [structured report](../reports/PRAYER_LOCATION_REVIEW_LOCAL_2026_11_27_REPORT.md) records 37 focused unit passes, successful results for all 60 three-engine feature cases across two documented runs, 15 Settings integration passes and the [actual-app gallery](../evidence/prayer-location-simple/README.md). Independent combined-gate and bundle findings remain; physical-device acceptance is pending. No commit, push or publication.
