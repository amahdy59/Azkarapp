# Home material color pairing — local 2026-11-27

## Owner authority and objective

The owner supplies screenshots of a light application-sharing card on the Glass Home canvas and pale books-button text on a pale fill. Diagnose and correct the actual theme/material boundaries locally. Preserve the earlier no-commit/no-push/publication hold and independent book/audio/native/overlay work.

## Inspected cause

Home resolves its own photographic/material state independently of the app theme. HomeAppShareSection did not receive that resolved value and rendered a solid light-theme button. HomeCard's Glass companion sets light foreground and muted text but leaves the background token used by nested outline Buttons in the underlying Light theme. That creates a mismatched foreground/background pair in the books entry. Existing Glass cards, outline Button, on-media tokens and reduced-transparency/high-contrast fallbacks remain the reusable contracts.

## Plan before editing

1. Pass Home's resolved visual-material value through HomeAppShareSection to HomeAppShareCard and opt into the existing hero-glass/home-glass-surface presentation. Preserve the single surviving trigger and horizontal desktop/stacked phone geometry.
2. Complete the shared Home Glass foreground/background token pairing for nested controls. Reuse on-media tokens; keep solid themes and protected overlay ownership intact. Give the sharing accent the matching on-media pair without changing its public QR bytes or sharing behavior.
   The screenshot's adjacent More action also lacked the resolved Home material, and the books icon used the underlying light-theme accent. Apply that same existing material and on-media accent to these two visible peers.
3. Add regression coverage for the books action and sharing surface, independent app/Home materials, Light/Dark/Midnight, RTL/LTR, hover/focus, high contrast/reduced transparency, narrow/enlarged screens and unavailable-photo recovery. Preserve existing geometry/hit-testing/QR/overlay assertions; replace the earlier solid-card expectation only for intentionally Glass cards with stronger matching-material assertions.
4. Run focused units, affected browser checks and current type/lint/build gates. Inspect actual screenshots and record exact results, including already known independent aggregate failures. No release-gate assertion, coverage or bundle ceiling may be weakened.

## Boundaries

No devotional content, prayer/audio controller, persistence/schema, synchronization, route, dependency or native-plugin changes. Visual/automated checks do not establish full WCAG or physical assistive-technology acceptance. No commit, push or deployment.

## Completed local checkpoint

Sharing, books and More now use Home's resolved material with correctly paired nested-control ink/ground and on-media accents. Final feature verification passes 32 units and 39 browser cases, including the reported independent Light/Glass combination, three engines, reduced-transparency/high-contrast, 320px/200%, photo failure, hover/focus and sharing-sheet regressions. The [report](../reports/HOME_MATERIAL_COLOR_LOCAL_2026_11_27_REPORT.md) records current aggregate Learn/Quran/lint/format/size failures separately and links the actual corrected gallery. No complete release-gate or physical-device pass is claimed. No commit, push or publication.
