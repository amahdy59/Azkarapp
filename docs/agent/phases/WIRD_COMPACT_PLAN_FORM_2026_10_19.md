# Compact Quran wird plan form — 2026-10-19

Status: owner approved for local implementation; no push without confirmation.

## Objective and plan before editing

Replace six large plan cards with one labelled full-width Reading plan select: Pages per day, Repeat a fixed section, Finish on a schedule, Read freely. The schedule branch reveals a second select for end of the current Hijri month, end of the current Gregorian month, or custom duration. Preserve all existing persisted plan kinds, normalization, calculations, history and offline behavior.

Reuse the existing select primitives through a small reusable labelled field. Show only the selected explanation/settings. Keep the searchable Juz/Surah selectors; replace the unlabelled section-scope button row with a labelled compact select. Pages and days retain numeric inputs and explicit increment/decrement buttons. Present one live compact summary and explicit Save plan/Cancel; no wizard or automatic persistence. Controls fill available phone width, retain 48px height, visible chevrons/focus and enlarged-text wrapping. Custom page fields adapt to text-relative space.

Update component and browser tests without removing the existing plan calculations, exact saved payload, month/free/repeating, cancel and persistence assertions. Add bilingual phone/tablet/desktop, keyboard, enlarged-text and axe evidence. Run focused tests, the complete non-browser gate and Pages build. Update the phase report with exact results. Preserve the other local sharing/Quran-overview improvements and leave port 5173 untouched.

## Guidance and boundaries

The owner approved the compact form recommendation after reviewing the six-card screenshot. [GOV.UK select guidance](https://design-system.service.gov.uk/components/select/) explains the discoverability trade-off of selects; short explicit options and selected-only help keep this settings form understandable. [W3C form grouping](https://www.w3.org/WAI/tutorials/forms/grouping/) informs labels and related controls. These are input-selection references, not proof of universal UX superiority.

This supersedes Phase 72's large-card presentation only. It does not change religious content, saved plan schemas, day boundaries, repeating range completion, adaptive month goals or free-reading rules. The separate Progress redesign remains a proposal.
