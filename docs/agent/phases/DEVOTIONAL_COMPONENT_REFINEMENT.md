# Phase Report - Devotional component refinement

## Objective

Increase Zikr desktop Previous/Next horizontal padding and consolidate the
devotional footer presentation using the existing mobile footer as the reference.

## Scope completed

Desktop side-navigation inset becomes 20px per side with text-scalable width.
Shared DevotionalFooter and DevotionalAction replace duplicated presentation in
Reader, Masbaha and Salawat. Reader audio keeps its active variant.

The owner's follow-up expands this to app-wide alignment and spacing review,
using Apple HIG and Microsoft Fluent primary guidance. Shared ordinary Button
padding no longer depends on icon markup; icon-only buttons have zero inset.
Settings selection no longer shifts content, selects retain vertical clearance,
switches/chevrons/icon controls do not shrink, segmented labels center their
content, and sidebar quick settings keep a gap between labels and values.
Home summary prayer cards reserve equal metadata slots for aligned icon/title rows.

## Files changed

DevotionalControls.tsx, ZikrComponents.css, ReaderScreen.tsx,
CustomCounterScreen.tsx, FridaySalawatScreen.tsx, devotional-footer.spec.ts,
DESIGN_SYSTEM.md and this report.

## User-visible changes and accessibility

Roomier desktop navigation. Existing mobile inset, counter, footer, focus,
direction, disabled states and Mushaf controls are preserved. Native buttons
and caller-provided accessible names remain. No content or persistence changes.

## Tests and evidence

Existing footer regression now asserts 20px desktop insets, 112px default
width and unchanged 48px height in Arabic and English. Existing coverage checks
mobile geometry, themes, counting, sharing focus return and enlarged text.
Targeted unit runs passed 51 tests across seven files. Full `pnpm check` passed
toolchain, unit/coverage, types, lint, format, audio, type scale, production build
and CSS utility stages. The first bundle run exposed 47 excess gzip CSS bytes;
using an existing positioned element instead of new pseudo-element utilities
reduced the final entry stylesheet to 28,629 bytes against the unchanged 28,672
byte limit. The second full gate's bundle stage saw mixed concurrent root `dist`
output (10,919,342 bytes), so no complete `pnpm check` pass is claimed. The
original bundle and CSS utility checkers passed against the dedicated build,
using ignored verification junctions for their existing directory contracts.

The final dedicated Chromium run completed the eight existing footer tests;
the new alignment tests initially recorded one transient geometry retry.
Waiting for fonts and stable geometry, with the same 1px tolerance, passed both
Arabic/English alignment tests in a final clean rerun (33.8s).

Final Firefox/WebKit alignment and compact-footer matrix: eight tests passed
without retries in 4.2m. Final changed browser spec lint, documentation/spec
format checks and `git diff --check` passed. Physical-device and human
assistive-technology review remain outside this local automated verification.

Final browser screenshots: `output/playwright/alignment-after/`, seven core
routes at 390/1440px in Arabic/English (28 surfaces), with no horizontal overflow.
Inspected Home, Settings, Reader and Masbaha evidence. The dedicated preview is
`http://127.0.0.1:5176/`; full release/browser matrix and deployment are not claimed.

Before-change capture covers seven core routes at 390/1440px in Arabic/English.
Some initial captures caught lazy-loading placeholders; the capture script now
waits for the affected screen controls before final evidence. Measurement flags
are inspection aids; vertical navigation and compound-label rows intentionally
have different icon and first-line centers. New browser coverage asserts aligned
Home prayer icons/headings and ordinary-control insets at 390/820/1440px.

## Decisions and limitations

Work is in the sibling Azkarapp checkout; Responsive Resume is untouched.
Existing unrelated edits are preserved. This request is a local refinement;
publication and the full release gate are outside this change.

## Recommended next step

Use shared devotional primitives for future changes. Keep ordinary control
radius/height roles and the approved devotional/Mushaf variants distinct.
