# Sharing steps and truthful content availability — 2026-10-19

## Objective and authority

The owner requests a polished multi-step sharing dialog, continuously available preview, explicit steps and Previous/Next navigation, and working content options including missing English translations where needed. Preserve the established artwork and complete exports. This request approves implementation; no planning approval gate was requested.

## Inspection and plan before editing

1. Capture the existing collection dialog and inspect the collection/Ayah studios, content adapters, presets, export lifecycle and existing tests.
2. Audit reviewed translation coverage. Repair adapters that fail to pass existing English content into sharing. Do not invent religious translations, pronunciation, rewards or source interpretations; new content would require the documented source-comparison process.
3. Reuse the modal, buttons, theme tokens, format selector and export services. Add shared accessible step navigation: Content, Design, Share. Text/link and supplied artwork omit inapplicable design choices. Preserve choices when navigating and keep the preview available throughout.
4. Derive presets and additions from actual nonempty content. Explain partial collection coverage, distinguish label language from translation, and retain honest device capability/loading/error recovery. Verify that each exposed choice changes its appropriate output.
5. Cover state preservation, missing/partial translations, bilingual evidence, exports, focus, RTL/LTR, narrow/enlarged/short layouts and reduced motion with targeted unit/browser tests and current screenshots. Run full quality, release gates and exact-commit CI/Pages verification under standing release authority.

## Initial evidence

`output/sharing-wizard-2026-10-19/01-before.png`: desktop English Midnight. The preview is clear, but settings extend below the viewport and content additions are hidden beneath another disclosure. Presets unconditionally enable unavailable additions. Quran Benefits' Arabic adapter drops its existing English meaning. These are implementation findings, not a religious-content interpretation.

## Verification and report

Implementation covers both studios, shared step/arrow presentation, clear format and content fields, truthful availability, existing translation adapters and responsive recovery. The structured final report follows `docs/agent/templates/PHASE_REPORT.md` and is produced as `output/sharing-wizard-2026-10-19/PHASE_REPORT.md`, alongside command logs, browser JSON, actual downloads and screenshots. Exact release-hook and Quality/Pages results are recorded there after completion. Do not infer release success from implementation alone.

## Owner follow-up: minimize scrolling and choose inputs deliberately

The owner explicitly requests less scrolling, efficient dropdown use and fully adaptable phone layouts. Supersede the initial open-all additions, large theme miniatures and permanently repeated help. Keep the common preset and language fields immediately available in an adaptive grid. Independent native checkboxes live in a clearly labelled optional disclosure; avoid a custom multi-select. Three theme choices stay visible as concise labelled swatches for comparison. Image dimensions/platform explanations and Ayah typography become optional native disclosures. Compact the thumbnail stage, textarea, repeated headings and final footer; keep source/translation integrity, 44px controls and recoverable enlarged/short-window scrolling.

Research grounding: [W3C multi-page forms](https://www.w3.org/WAI/tutorials/forms/multi-page/) recommends logical grouping and orientation; [GOV.UK select guidance](https://design-system.service.gov.uk/components/select/) warns against indiscriminate select use and permits preselected settings; [GOV.UK checkboxes](https://design-system.service.gov.uk/components/checkboxes/) distinguishes independent multiple choices. These support input selection; they do not establish that a layout is universally optimal or replace actual user/device testing.

Acceptance now includes measured default-step scroll bounds on 390×844 phones, 320×700 adaptation, both languages, explicit expansion of optional settings, retained preview and keyboard operation. Enlarged text and full readable/selection views may require scrolling to preserve content and accessibility.

## Owner follow-up: nearby outward card arrows

The owner supplied an English preview showing widely separated, inward-pointing arrows. Keep the previous/counter/next controls in one intrinsic-width group immediately below the preview (alongside the thumbnail on compact screens). Use physical arrows selected from the dialog language rather than logical icons that can inherit RTL from an outer application container. Previous/Next and Home/End must operate on the active generated or approved-artwork collection. Preserve button focus, boundary disabled states, live card count and 44px targets. This follows [W3C carousel controls](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/) and [W3C functionality guidance](https://www.w3.org/WAI/tutorials/carousels/functionality/). Verify actual rendered SVG direction, button positions, proximity and pointer/keyboard results in both languages.

Enlarged Arabic export labels use a two-column footer when the available text-relative width is small. Ordinary-size phones retain the compact action row; enlarged text can increase its height without clipped labels. Both studios use the same language-resolved arrows for step and card navigation.

Final QA reproduced a later-card preview gap when only the first replacement page had streamed. Preserve the last completed preview as render-only state, including its counter, while current-request pages continue to gate navigation and exports. The regression includes a replacement sequence that becomes shorter. The earlier CI candidate is superseded; the complete intact release gates apply again to the corrected snapshot.
