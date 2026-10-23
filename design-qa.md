# Sharing dialog visual QA — 2026-10-19

## Visual truth and comparison setup

- Source: `C:/Users/AhmedMahdy/Downloads/Share Collection UI Design Board-2.png` and `C:/Users/AhmedMahdy/Downloads/Share Collection Modal Design Walkthrough-1.png`, each 1536 × 1024 pixels. They are style references for the supported image-first flow, not specifications for new hosting features.
- Reference main-dialog crops: board 2 `(92,22)-(1120,690)`; board 1 `(257,6)-(1286,578)`. Crop out the explanatory callouts and secondary examples; normalize both crops to 1024 pixels wide without changing their proportions.
- Implementation: real Playwright browser captures at 1280 × 900 CSS pixels; tablet 834 × 900, phones 320/390 × 900 and the unchanged 390 × 844 / 320 × 700 regression viewports. Chromium/Firefox density 1; WebKit phone density follows the configured iPhone 14 project. Use CSS-sized modal captures and proportional downsampling for comparisons, never compare retina pixels as CSS pixels.
- States: Content with generated artwork and Customize content expanded; Content collapsed on phones; Design; Share; approved artwork and light theme; 200% text. Move the pointer away from the stepper before visual comparison.
- Raster asset decision: retain the real exported devotional images and existing brand assets. The agreed product scope excludes the illustrated phone shell and invented hosted-sharing features. Standard UI icons come from the existing official Untitled UI package; no raster substitutes or hand-drawn icons.

## Comparison history

1. P1: initial organization-only pass omitted the reference's illustrated choices and header icon. Fix: new pure SharingArtworkChoice presentation, document/brush icons, short bilingual descriptions, reserved selected check, stacked-card header, globe/translation select icons and sliders disclosure. Evidence: `output/playwright/sharing-board-2026-10-19/icon-evidence/`.
2. P2: wide preview inherited 4px sticky padding, placing its expand button and carousel too near the panel edge. Fix: explicit 16px wide panel inset with sufficient specificity. Evidence: `output/playwright/sharing-board-2026-10-19/visual-final-evidence/`.
3. P2: three-column additions wrapped English translation; source note abutted the checkbox row. Fix: two-column wide grid with 11rem minimum control width and 12px note separation. The owner's marked screenshot confirms these locations. Final evidence: accepted-evidence/ and board2-controls-comparison.png.
4. P1: 200% text let the device-capability explanation overgrow the fixed footer. Fix: move its associated explanation into Share settings. Keep the exact original viewport/footer and positive reading-area assertions. Corrected Chromium, Firefox and WebKit assertions pass in the final 21-case matrix.
5. Test-harness findings: two geometry assertions expected removed inline styles; update them to computed columns while preserving layout assertions. Two footer assertions expected the superseded cramped single row; now require Share/Save together and a wide Copy image row with exact boundaries and all 44px minimums. The isolated visitor endpoint needs explicit fulfillment for a meaningful console sweep; no console messages are suppressed.

## Required fidelity surfaces

- Typography: retain the product's Noto Sans Arabic UI and existing reading fonts, with clear bold titles, regular descriptions and 0.75rem secondary copy. The boards' unspecified mockup typeface is a visual reference, not a global font migration. Preserve complete labels and accessible 200% reflow instead of truncating or shrinking content.
- Spacing/layout: 1024px maximum dialog, balanced 1.05:1 settings/preview tracks, logical RTL placement, rounded tonal panels, 16px preview inset, 12px source-note separation and compact full-width phone fields. A 44dvh/380px wide thumbnail balances open additions; inspection remains larger and intrinsic. No artificial letterboxing or minimum-height spacer.
- Colors/tokens: map navy/gold/quiet borders to current semantic card/muted/primary/control-border tokens. Selected tiles and current step use the primary color and a check/number, not color alone. Light theme keeps its existing accessible ochre rather than forcing the dark-board palette. Keep existing glass/opaque/high-contrast material behavior.
- Image quality: the actual exported image remains sharp and proportionally scaled, with real content and exact output dimensions. No fake phone screenshot or invented sacred-text artwork is used to resemble the board.
- Copy/content: label the real generated mode Custom design, not Interactive studio. Source means citation, and availability descriptions report actual reviewed content coverage. Include text with image, Copy text and meaningful Copy reading link retain the approved image-first behavior. Feedback says copying/download initiation/device handoff, never claims publication.
- Icons: all UI glyphs use the existing outline family with consistent badge, menu and action sizes. Decorative icons are hidden from assistive technology; the choice's text remains its name and the short helper its accessible description. Outward arrows remain language-resolved and adjacent to the card.

## Interaction/accessibility evidence

Keyboard activation and selection retention, step focus, native menu keyboard/focus behavior, explicit expand/reduce, outward arrows, exact exports/captions, phone default scroll bounds, 200% footer reachability, narrow reflow, live status and axe are covered by targeted repository browser tests. Automation does not establish complete WCAG compliance; physical receiving-app and screen-reader checks remain owner acceptance work.

## Findings

No actionable P0/P1/P2 findings remain in the agreed scope. The final 21-case matrix passes in Chromium, Firefox and WebKit (4.7m), with zero console/runtime errors in the board sweep. All four targeted Chromium Ayah export/enlarged-text cases also pass.

The final actual Chromium modal is 1024 × 842 pixels/CSS pixels at density 1 in a 1280 × 900 viewport, in Before Sleep Azkar / generated / Content / Customize expanded state. Firefox uses density 1; the same WebKit dialog is captured at density 3 and must be downsampled before physical-pixel comparison. The reference boards are 1536 × 1024 artist images with no source CSS size; board 2's 1028 × 668 crop normalizes to 1024 × 665, and board 1's 1029 × 572 crop normalizes to 1024 × 569. Larger real-source coverage/help and 44px controls intentionally add vertical space compared with the artist mockups. Default collapsed-phone states retain the no-scroll contract.

Full-view paired comparisons, each containing the actual source and implementation together: `output/playwright/sharing-board-2026-10-19/board2-full-comparison.png` and `board1-full-comparison.png`. Focused source/implementation pairs: `board2-controls-comparison.png` (choice icons/descriptions, fields, checks and helper spacing) and `board2-chrome-comparison.png` (header, larger stepper and footer). These were opened and visually inspected together. Earlier state: `comparison-before-spacing.png`.

Final implementation screenshots are under `output/playwright/sharing-board-2026-10-19/accepted-evidence/`, including `sharing-board-en-1280-content-dialog.png`, the matching Arabic/tablet/phone variants, Design, Share, 200% text and light-theme approved/custom states. Content, Design, Share, Arabic phone, enlarged-text, and light-theme captures were opened and inspected. The Share screenshot truthfully retains the remaining-card generation state when current-card export is ready; no stale image is exported as current.

P2 stepper follow-up: enlarge 24px circles to a shared 2rem, retain 6px circle/label/line clearance, show complete/current/upcoming connector fills, and remove 8px of outer padding after the unchanged default-phone assertion found 6px of extra scroll. Final geometry and original scroll assertions pass; retrying CSS assertions wait for the real reduced-motion style frame without a fixed delay or relaxed timeout.

Expected differences: actual devotional image rather than a decorative phone frame; Custom design/brush rather than a nonexistent hosted Interactive studio; real reference/coverage notes rather than mock source claims; existing Noto UI fonts/material preferences rather than an unspecified global font or forced Glass; the supported caption/text/reading-link flow rather than privacy/expiry/embed/celebration screens. Enlarged text reflows without clipping; ordinary action labels remain one line. These are deliberate product constraints from the approved plan, not missing implementation.

## Research references

[W3C WAI multi-page forms](https://www.w3.org/WAI/tutorials/forms/multi-page/) supports clear stage orientation and continuation. [GOV.UK select guidance](https://design-system.service.gov.uk/components/select/) informs the distinction between visible high-level choices and labelled compact menus. The supplied visual boards and repository accessibility/material contracts remain authoritative for this scoped adaptation.

## Final result

Release verification follow-up, 2026-10-20: fresh Firefox checks exposed an enlarged Arabic Copy image label in the 44px back-button column. Retain its wider column span and assert the applied enlarged font before the unchanged overflow checks. The board flow also needs to await completion of its 21–23 square PNGs before responsive inspection; use the established 60-second export-operation budget after the original first-preview assertion, retaining every existing readiness, geometry and output check. Exact rerun and release results are recorded in output/release-2026-10-20/PHASE_REPORT.md.

passed
