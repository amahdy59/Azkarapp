# Phase Report — Evidence-led final touches and owner follow-up

## Objective

Implement the consolidated owner requests locally, including the latest shared hover/cropping, Masbaha, Settings defaults and Mushaf reliability/focus-mode corrections. Preserve offline reading, reviewed content, progress, prayer/audio behavior and the publication hold.

## Scope completed

The master record is `docs/agent/CONSOLIDATED_REVIEW_CHECKLIST_2026_11_02.md`. Its implementation table and A–M IDs distinguish local code, verification still in progress, owner aesthetic acceptance and physical-device acceptance. Earlier requirements are preserved rather than replaced by each screenshot follow-up.

Home selection geometry coalesces observer/scroll work into frames, reads before writing, avoids identical writes and cancels hidden/unmounted work. Reader-owned CSS leaves the global stylesheet; the working-tree CSS inventory includes nonignored untracked source files and excludes deletions.

Downloads have document-level ownership, explicit cancel, truthful route-return progress, resolved voices and validated selective pages/Juz/full Mushaf acquisition. Verified files support resume after reload; ZIP handoff remains screen-owned. Status loading retries cleanly, stale scans abort, sequential verification yields, and definite corrupt recordings/registry entries are removed under a per-recording lock shared with writes. Transient read errors preserve files. This does not implement an OS background-transfer service or the separate native-file migration.

Shared Button/IconButton, radio choices, checked pills, switches, card actions and protected menu options receive consistent state feedback. Selected options still respond to hover while retaining readable selected contrast. Light controls darken slightly instead of lifting white beyond visibility. Disabled/busy/spinner exclusions and both still modes remain. Settings rows inherit actual container corners and dividers step aside during highlighting; functional focus wins over decorative finish and transparency flattening. Full-bleed/tight controls use inset indication with Forced Colors recovery. About's fixed-height custom rows are replaced by naturally reflowing shared rows.

Masbaha selection clears the remembered primary sidebar selection. Its zikr/target controls sit in a separate spaced block below the progress header; keyboard help moves into More in both standalone counting flows, retaining shortcuts and focus recovery. Home's routine pill grows to whole-label width and wraps whole options only when needed. Settings groups appearance/reading/accessibility, daily practice, account/data and support without replacing routes/search. Fresh defaults are Arabic, Midnight, enabled paper, medium text size, Clear font and icons-only reading tools. Explicit saved preferences and ordinary navigation labels remain.

The small Mushaf is reproduced after phone-to-desktop resizing: a fractional universal Reduce Motion duration accidentally enables layout transitions, making the fitter read old dimensions. Both still modes now use zero layout-transition duration. Juz/Surah/folio share capsule anatomy and 44px targets. Compact chrome moves nearer safe edges and reserves less space. Existing focus mode gains an explicit More action, removes metadata/chrome clearance and keeps one labelled 44px Show tools exit with focus return. Canonical fifteen slots, source-defined line breaks, page position, fonts, magnification and offline paths remain.

Paper texture is static background paint on filled owners, not a full-screen overlay. Transparent Mushaf text canvases do not double-paint it. Local theme selection, the persisted device switch and plain app-accessibility/Forced Colors/print fallbacks remain. OS frosting reduction does not silently disable static grain. The latest light tile supersedes rejected brass dots and sparse fibre trials: fine neutral pores on warm-neutral stock, more local definition and less average gray wash. Light is 5,747 bytes, dark remains 7,358 bytes, combined 13,105 bytes under the unchanged 14KB guard. Owner aesthetic approval is still open.

The completion continuation also repairs incidental reading-viewport focus after Space/volume/pointer settings through a shared Tab-intent hook. Confirmed 320px/200% defects receive natural standalone title/picker/tally reflow, contained navigation, bounded shared buttons and category badges, and inset indication on tight switches/benefit panels. No shortcut, counting, reviewed text or persistence behavior changes.

## Files changed

- Presentation: shared SettingsRow/SettingsPrimitives/AboutPanel, LayoutShells, ChoiceRadioItem, SegmentedControl, HomeCards, standalone/footer controls, protected menu states and their CSS.
- Reader: MushafPageViewer, shared MushafFocusExit, MushafQuickMenu, both Mushaf owners and their regressions.
- Screens/state: CustomCounterScreen, FridaySalawatScreen, SettingsRootPanel, Progress/Search focus, default-state normalization, Arabic/English product copy and explicit-language test fixtures.
- Earlier final-touch boundaries: Home anchor hook, download session/pickers/rows, audio/Mushaf cache verification, recorded-page charts, CSS inventory tooling and feature browser selection.
- Material: generated light/dark assets, generator, paper-grain CSS and perceptual/payload tests.
- Documentation: design/motion/quality/architecture/audio guidance, decision log, active phase, owner screenshots and the consolidated status ledger. Full current file inventory and input provenance belong beside the generated evidence.

## Components added or modified

Added shared MushafFocusExit, presentation-only MushafDownloadSelection/RecordedPagesChart and subscribed download session. Extended existing radio/pill/row/action/overlay primitives; reused native semantics, fonts, i18n, protected portalled menus and verified downloaders. About now shares the same row contract instead of maintaining fixed-height variants. No new runtime dependency, router replacement or database/schema change.

## User-visible changes

Clearer and more consistent interaction feedback, uncut Settings/routine labels, organized Settings, exclusive Masbaha navigation, a cleaner counting footer and separated selectors, reliable Mushaf resizing, matching page metadata controls, usable focus mode, adaptive optional texture, clearer charts and more reliable offline-download continuity. Earlier consolidated reports retain the reminder, navigation, Month-default, Quran-plan modal, imagery, bilingual sharing and audio-control changes integrated into this working tree.

## Accessibility work

Preserve semantic radio/tab/switch/dialog/menu/field actions, accessible names for icon-only tools, 44px ordinary targets, keyboard recovery, RTL/LTR and natural enlarged-text growth. Focus is not erased by decorative/flattened surfaces. Disabled controls remain inert; protected menu text remains opaque. Still modes retain immediate state/focus feedback without animating sacred text. Automated checks do not establish complete WCAG or assistive-technology acceptance.

## Tests added or updated

New three-engine focus/highlight, Mushaf repeated-resize/still-mode/capsule/focus-mode and owner-follow-up defaults/rows/pills/options/Masbaha/About scenarios. Updated invalid-font and explicit-English test fixtures for the new defaults while retaining behavior assertions. Existing material, overlay, footer, player, sharing, offline and navigation suites remain available and unchanged assertions are not skipped. The development feature selector includes the new specs; complete CI inventory remains intact.

## Commands run

Exact combined commands, outcomes, input fingerprint and audit triage are recorded in `output/final-touch-quality/PHASE_REPORT.md` and its linked JSON/logs. That generated evidence is the authority for automated completion. Historical checkpoints are retained separately, including the prior default-fixture failures and diagnostic focus/reflow attempts; they are not relabelled current passes. New targeted regression coverage includes useReadingFocusIndicator, reader-focus-intent and enlarged-control-reflow.

## Visual/manual evidence

Owner screenshots are issue references under `docs/agent/evidence/owner-design-2026-11-02/`, including M1–M9 follow-ups. Actual screenshots, route audits, geometry/hit tests and three-engine results live in `output/final-touch-quality/`. Route-audit candidates require triage: intentional scroll clipping, invisible proxy controls and stale hash-navigation panels must not be reported as actual defects. Fresh-document scanning and exact geometry scenarios verify confirmed repairs. Texture screenshots are candidates for owner review.

The material implementation is informed by the owner's Creative Mahdy reference, MDN background layering, web.dev animation/layer guidance and W3C contrast guidance already linked in the owner checklist/design documentation. Calibration values are product judgments, not a universal best texture.

## Documentation updated

Design system records exact state/corner/opaque-overlay/focus/material/default contracts. Motion guidance records zero layout transitions in both still modes. The master checklist tracks every original and latest comment with implemented versus remaining status; the active phase and decision log record the expanded authorization while preserving publication hold.

## Decisions recorded

Latest owner follow-ups supersede the texture-only pause and the old English/Humanist/labelled defaults. Respect explicit saved preferences. Keep the rejected particle styles as diagnostic history, not current guidance. Focus mode extends the existing reader; it does not introduce browser fullscreen or new persisted state. A test fixture's language change does not change account synchronization behavior.

## Known limitations or remaining risks

Owner texture/visual/comprehension approval and physical Android/iOS, native text scaling, TalkBack/VoiceOver, native share/download storage, background audio and reminder-delivery evidence remain outstanding. Document-owned downloads do not survive process termination as an OS job; the documented native-file migration remains separate. Lab timings and automated browser emulation do not prove field performance or physical-device acceptance. Previously recorded transient browser failures retain their diagnostic history. No commit, push, workflow or production-release success is claimed for this local working tree.

## Out-of-scope findings

No reviewed devotional-content edit or interpretation, backend/schema migration, live account mutation, dependency/toolchain replacement or raised budget/coverage ceiling. Historical performance/cache observations remain tied to their measured checkpoint.

## Recommended next step

Review the local result against the master implementation table and complete the remaining human/device acceptance. Publication requires a separate instruction lifting the hold, current bilingual release notes, intact local release hooks and exact-commit Quality/Pages/production verification.
