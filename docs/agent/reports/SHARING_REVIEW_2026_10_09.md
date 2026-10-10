# Sharing experience review — 2026-10-09

## Assessment

The supplied UX report offers useful artistic ideas, but it should not be treated as an approved implementation specification. Several recommendations describe features that already exist; others would reverse recent owner decisions or introduce complexity before resolving observable behavior. This review compares that report with the current implementation, approved design contracts, and desktop/phone production screenshots. The proposed visual redesign remains unimplemented.

The strongest direction is a calm modern default, restrained manuscript artwork as an optional style, and clearer controls with reliable preview behavior. Sacred text must remain primary, complete, and readable. Sharing should feel like preparing a card, rather than navigating another settings screen.

## Sharing window

The existing dialog already has a bounded desktop width, a fixed action footer, a close control outside scrolling content, a desktop preview/settings split, and collapsed options on narrow screens. It also provides enlarged previews, keyboard navigation, accessible HTML card reading, content presets, format descriptions, incompatibility explanations, and ZIP export. These are foundations to refine, rather than missing features to rebuild.

Priorities:

1. **Keep the preview stable while updating.** Generation currently clears pages, the active page, and selection whenever appearance/content options change. Retain the previous preview until its replacement is ready, show a small Updating status, and disable export of stale output. Only the latest generation may become exportable; cancel obsolete work and release obsolete object URLs.
2. **Preserve selection where identity survives.** Palette-only changes should preserve active/selected items. Content changes can alter pagination, so page indices alone are unsafe: map selection to exact item membership or explain the necessary reset. Never silently export different content under the old selection.
3. **Use available preview space well.** Tall cards can look tiny in a desktop window even when their exported text is large. Preserve a stable preview area and make enlargement easy to recognize. Evaluate real card readability at the displayed size before adjusting column ratios.
4. **Keep one phone scrolling model.** The current tall modal already provides useful reading space and an accessible footer. A second draggable bottom sheet would introduce competing gestures and nested scrolling. Any later swipe-to-change-card feature must preserve vertical scrolling, pinch zoom, arrows, and keyboard access.
5. **Make generation failures actionable.** Offer explicit recovery such as choosing Tall when a format cannot fit complete text. Do not silently split a zikr, truncate it, reduce below the approved text floor, or change export format.

Generation caching or rendering the current card first may help larger collections, but should follow measured latency. A retained preview must never make an old image appear to reflect new settings.

## Controls and feedback

Use a small sequence: content, appearance, then export. Keep Image/Text/Link modes and expose essentials compactly: format, palette, and content preset. Place source, glossary, translation, and QR detail under progressive disclosure. Preserve separate meanings for English translation, Arabic word meanings, and export-interface language.

The palette miniatures and format icons already support recognition. Improve selected/focus states and practical format descriptions before adding more choices. Native labelled buttons with pressed state are valid here; converting every selector to tabs is unnecessary.

The most useful control changes would be:

- Replace generic Copy with **Copy image** or **Copy text**, based on the actual action. Multiple cards and unsupported clipboard-image environments must not surprise the reader.
- Show a compact visible success/error status near the footer, announced politely. The current success feedback is available to screen readers but can be visually easy to miss. Keep the entire dialog out of a live region.
- Show an explicit scope and output count: current card, selected cards, or all cards. A combined card can contain several items, so distinguish item count from image count.
- Choose primary action from actual payload support. Use `navigator.canShare` for the prepared files, and preserve transient user activation when opening native sharing. Phone/desktop detection cannot reliably determine whether image sharing works. See the [Web Share specification](https://www.w3.org/TR/web-share/).
- Retain Save and Text/Link alternatives. The operating system controls available destinations; do not imply that the application can directly publish to a particular social app.

Keep the repository's 44px ordinary targets, visible focus, logical RTL/LTR keyboard order, safe areas, text resizing, reduced motion, and Escape/focus recovery. Normal text contrast needs at least 4.5:1, with 3:1 for qualifying large text; a universal 10:1 target is an artistic preference rather than the AA requirement. See [WCAG contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum). Uploaded images do not carry the application's semantic reading view, so text/link sharing remains essential.

## Cards and typography

Keep a contemporary devotional default. A subtle manuscript option can add distinction through a restrained frame or corner ornament, but avoid making every card a luxury object with competing seals, foil, and watermarks. Existing botanical/framed artwork is not itself a usability defect.

Protect the established hierarchy: complete Arabic text first, then supporting translation/glossary when selected, then count/source, followed by branding and navigation. Short text can be centered; longer text benefits from right alignment. Do not justify Arabic canvas text until shaping and spacing have been verified.

The current renderer measures text and ink, uses a minimum Arabic size, and already allows breathing room. Increasing all line height to 1.8 without inspecting actual diacritics would consume space and increase fit failures. Compare representative short, long, vocalized, translated, combined, and large-repetition cards at export size and after realistic social compression. Preserve the approved 52px floor and larger single-card text when it fits.

Keep ornament outside a stable opaque reading surface. A 2% watermark is not evidence that it cannot interfere with sacred text. Hairline gold frames also need compression testing. The existing compact metadata row is more space-efficient for combined cards than a seal beside every item; reserve decorative count treatment for suitable single cards.

Preserve the approved full brand mark and plain website footer. A smaller crescent-only mark would reverse the recent brand decision. Keep QR codes crisp, high contrast, and correctly routed with their quiet zone. Normal cards retain optional QR; long-surah reminder cards retain their specific required QR/name/benefit/source behavior and do not become exports of the full long surah. Sources remain optional and enabled by default where that owner decision applies. Display digits remain the approved Arabic-Indic set, not the Persian digit example in the supplied report.

## Palette recommendations

Refine the existing Olive Daylight, Midnight Gold, and Lavender Night first. Verify Arabic/body/supporting/footer contrast and compressed output before expanding the palette menu.

| Proposed palette     | Assessment                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Andalusian Sand      | Most distinct addition: warm cream/terracotta can expand the range without duplicating the dark palettes. Best first candidate. |
| Royal Emerald & Gold | Attractive optional style, but overlaps the existing olive/gold direction. Differentiate its surface and text contrast clearly. |
| Kiswah & Ivory       | Overlaps Midnight Gold. Consider a refined charcoal variant before adding a separate near-duplicate choice.                     |

Simple names such as Sand, Emerald, and Charcoal avoid implying devotional significance from a decorative palette. Add one validated palette at a time; six options are not automatically better than three coherent ones.

## Routine Garden sharing

An actual image matching the celebration preview is a worthwhile separate enhancement, with Square and Story formats plus retained text sharing. Use calm palm artwork, clear labels, and optional date/statistics disclosure. Offer a simple card without numbers for readers who prefer privacy.

Lifetime palms are a lifetime metric; today's golden/green dates describe a different period. Do not label palms as a streak, blend these into a worship score, or imply spiritual reward from application activity. Avoid rankings and punitive comparisons. Any new devotional wording requires the existing content-review process.

The current review repaired the existing text export so both native sharing and clipboard fallback include the displayed statistics and correct application base URL. Graphic generation remains a proposal.

## Recommended sequence

1. Reliability and clarity: stable generation, identity-safe selection, explicit copy labels, visible export status, accurate scope/count, and payload-specific sharing.
2. Window ergonomics: compact essential controls, practical preview enlargement, and responsive/RTL/focus verification without another nested sheet.
3. Card polish: measured typography, restrained optional artwork, and one distinct palette after contrast/compression checks.
4. Routine Garden graphic export: truthful periods, optional personal statistics, and retained accessible text/link alternatives.

Each step should remain a separate approved phase. Verify long Arabic text, diacritics, mixed-language cards, every format, fit failure/recovery, rapid option changes, selection, multiple-file exports, unsupported sharing, cancellation, keyboard focus, narrow screens, and reduced motion. Automated scans support this work but do not establish complete accessibility compliance.

## Reader screenshot follow-up

The owner supplied phone screenshots of ordinary devotional reading and Quran listening, requesting recommendations on line spacing, focus mode, permanent footer options and guidance coverage. These recommendations are not implemented in this review.

**Quran snippets:** use a compact excerpt layout with natural line spacing. The current Quran listening renderer uses full Mushaf page geometry, whose height and width-dependent font fitting need different treatment from a short snippet. Preserve reviewed words, glyph shaping, verse identity, timing/word mapping and diacritic clearance. Keep the full Mushaf's canonical page geometry unchanged. For ordinary devotional text, replace unnecessarily loose spacing with a measured font-specific rhythm. A starting prototype around 1.6–1.75 may suit reflowed Arabic text, but it is not a universal rule for QCF facsimile lines; verify actual ink and enlarged text before choosing values.

**Default reading:** retain the existing spacious Previous / Count or Complete / Next row. Remove the permanent secondary row rather than cramming six actions into one. Share, Benefit and a prominent Listen action remain in the existing Reader options menu. During playback, audio controls replace the counting controls. Keep important source/authenticity information accessible and do not infer that hidden details are unimportant. Prioritize Play/Pause and a compact progress/seek control; speed, voice, repeat, continuation, volume and following settings belong in an explicit audio-options disclosure. Preserve an accurate estimated-highlighting label inside those options, rather than deleting provenance.

**Focus mode:** hide category/header controls, visible progress statistics, footer actions, counting guidance and audio options. Retain a thin collection-progress line with an accessible name and a small explicit exit action in reserved layout space. Reveal controls through that action or a named edge control, plus Escape on keyboards. Do not use tapping the devotional text to both count and reveal controls. Revealed controls must reserve space rather than cover text; hide them again only through a predictable explicit action, never while they hold focus. Preserve manual counting/completion and navigation; no automatic completion or advancement. Audio can continue, with an easily reachable Pause action when controls are revealed.

**Hand guidance:** the existing hand toggles the counting instruction, not the entire footer. Preserve that meaning unless a separately named footer disclosure is introduced. Avoid adding it to the three primary buttons. Show guidance in reserved layout space while it is needed; after counting is learned, keep a named hand/help action in Reader options to reopen it and remove the dedicated collapsed strip. Expanded instruction belongs in document flow and should never overlay sacred text. Hide the guidance affordance entirely in focus mode. This would supersede the current persistent full-width collapsed-row presentation and therefore requires an approved visual phase.

Recommended reader sequence: first correct snippet spacing; then simplify ordinary footer actions; then extend focus mode with explicit recovery; finally integrate non-obscuring guidance. Check Arabic/English, phone/landscape, large text, screen-reader and keyboard operation, completion, seeking, manually paused following and focus recovery. These are staged design changes, separate from the verified pending-change repairs.

## Evidence boundary

Desktop and phone screenshots were captured from production during this review. Source review and regression repairs use the local pending working tree; production screenshots do not prove that those local repairs have shipped. No visual redesign, commit, push, deployment, or release-note change was performed as part of this review.
