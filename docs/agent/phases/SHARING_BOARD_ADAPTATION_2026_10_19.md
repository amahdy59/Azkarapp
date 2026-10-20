# Sharing board adaptation — 2026-10-19

Status: owner approved; local only. The no-push confirmation hold remains.

## Inspection and plan before editing

The owner supplies two sharing design boards and approves the scoped recommendation: board 2's desktop proportions and quieter hierarchy, board 1's grouped controls, existing actual image output, optional Design with an explicit skip path and truthful compact feedback. Existing CollectionShareModal gives the preview the larger three-fifths column while settings have two-fifths, inverts grid direction and depends on viewport layout state; tablet/enlarged text need actual container-width adaptation. The shared Ayah studio already has columns but needs the same orientation and optional design behavior.

1. Keep existing cards, tokens, actual preview, one stepper, phone full-width fields, nearby outward arrows, caption and exact export/selection behavior. Rebalance settings and preview on usable wide surfaces with a shared visual separation; render without phone frames, extra summary panels or pagination dots.
2. Group supported generated/approved-artwork choices and optional additions with clear labels; maintain truthful per-item coverage and source/reference meaning. Keep phone controls compact. Use a container threshold so enlarged text or narrow dialogs recover to one column.
3. Make Design explicitly optional through a Content-step Skip design action that goes directly to Share without resetting or regenerating the current design. Preserve Previous/Next, focus, disabled operation states and direct step selection in both studios.
4. Show concise visible atomic operation feedback in the existing footer. Distinguish text/link copy, image copy, download initiation and device share handoff; do not claim posting or saving success beyond actual platform evidence. Correct stale error recovery copy that mentions removed modes.
5. Add unit and browser regression coverage for skip-with-preserved-choices, real current exports, wide-column geometry/RTL, phone/full-width/200% text, keyboard/focus, precise status, errors and native payloads. Capture real screenshots; run focused checks, full pnpm check and Pages build. Record a structured local phase report.

No new share permissions, expiry, embed, interactive hosted mode, list/carousel output, theme artwork, celebration page, dependency, storage/schema or religious-content change. The separate Progress redesign remains proposed. Port 5173 belongs to the owner's other project and is untouched; local app remains on 5196.

## Owner visual clarification

The owner explicitly requests both boards as references for the complete look and feel, including the choice icons, buttons, surfaces and spacing. Extend this same bounded phase with an outlined stacked-card header icon, distinct document/brush artwork-choice icons, short bilingual choice descriptions, a stable selection check, globe/translation menu icons, a sliders disclosure icon, tonal preview/control panels and rectangular navigation buttons. Use the existing Untitled UI icon export layer and semantic material tokens. Keep the actual exported artwork, compact phone layout, true platform feedback, readable text at enlargement and all supported functionality. Compare real browser screenshots against the reference boards before handoff; this is a refinement of the approved sharing scope, not a new roadmap phase.

The owner's marked spacing follow-up requires deliberate breathing room around the expand control, image navigation and source note. Keep a consistent 16px wide preview-panel inset, 12px separation before the source note, two-column wide additions and aligned phone edges. A 44dvh/380px wide thumbnail keeps the form balanced without unnecessary scroll; expanded inspection remains available. The test matrix retains minimum image legibility, 44px targets, 390px default no-scroll, narrow overflow and exact 200% action-footer bounds.

The owner then requests larger 1/2/3 indicators and colored connecting progress. Use shared 2rem circles, a 6px label gap and connector clearances, with a half-primary outgoing segment for the current step and full primary segments for completed steps. Resolve the fill origin from RTL/LTR. Keep one accessible step navigator; decorative lines do not introduce a second progress indicator or invented completion percentage. Verify circle/label/connector geometry, forward/backward stage colors, narrow layouts and text enlargement in both studios.
