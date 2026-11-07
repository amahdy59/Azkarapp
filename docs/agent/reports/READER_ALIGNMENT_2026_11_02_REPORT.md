# Phase Report — index, bilingual reader and counting-menu alignment

## Objective

Apply the owner's three screenshot corrections locally: align index choices/search/results without an enclosing pill boundary; align bilingual header/cards/footer; match zikr and target popup widths to their triggers.

## Scope completed

One scoped index gutter and scrollbar allowance aligns all modal sections. Tabs retain their semantic/selected/hover/focus behavior without the outer pill border or fill. Search remains separate from scrolling results. Surah results recover to one column at narrow/enlarged measures, with natural label reflow and a separate aligned page-metadata row instead of clipped names.

The bilingual reader uses one responsive bounded column for header, source attribution, verse cards and footer, including equal scrollbar reservation. Cards preserve their natural Quran/translation content; chrome stays stationary and opaque. Icon targets remain 44px; footer labels grow, with page context on its own narrow-screen row.

Both counting menus share trigger-width sizing capped by viewport/collision bounds. Long zikr choices reflow inside the protected scrolling surface rather than forcing a fixed popup width or clipping the wording.

## Files changed

MushafNavigationModal.tsx, new mushaf-navigation-modal.css, QuranBilingualStreamView.tsx, quran-bilingual-stream.css, AuthenticZikrPicker.tsx, CounterTargetPicker.tsx and devotional-picker.css. Added reader-alignment.spec.ts and updated the existing feature selector. Design/quality/phase/decision/checklist documentation records O1–O3. The existing Salawat picker shares the identical trigger class string through devotionalPickerStyles.ts; its behavior and popup sizing remain unchanged. Earlier local drafts remain preserved.

## Components added or modified

Extended the existing index modal, shared TabList usage, bilingual reader and two existing protected dropdown owners. Repeated class strings in the affected index/bilingual owners and counting field triggers are interned at module scope without changing paint or behavior. This restores the unchanged total-output budget; no limit is raised. No new primitive, runtime dependency, storage/network owner or content source.

## User-visible changes

Aligned columns, simpler index choices, coherent bilingual reading chrome/cards, and counting popup widths that follow the selected field while keeping long choices readable.

## Accessibility work

Retained tab/panel semantics, RTL arrow/Home behavior, search labeling, native buttons, 44px icon targets, focus return, scrolling and opaque protected overlays. Geometry/width/reflow/hit/focus/axe scenarios cover RTL/LTR, phone/tablet/desktop, 320px/200%, solid/Glass/high contrast. Physical AT/device and aesthetic acceptance remain separate.

## Tests added or updated

reader-alignment checks actual modal/search/result and header/card/footer edges, uncut tabs, stationary chrome, axe, trigger/popup widths, viewport bounds and Escape/focus return. Existing modal search/jump/bookmark, bilingual full share/bookmark and devotional picker units remain intact. The prior fixed-two-column unit assertion now describes the approved adaptive grid, backed by actual browser text bounds. The initial WebKit tablet combined journey reached its test deadline during its final focus assertion; preserve the trace. Index, bilingual and menu regressions now run as independent tests under the original timeout/assertions, without weakening focus recovery.

## Commands run

Exact final commands, results and input provenance are maintained in `output/reader-alignment/PHASE_REPORT.md` with logs, JSON and screenshots. Prior/interrupted attempts are diagnostic, not current passes.

## Visual/manual evidence

Actual aligned index, bilingual views and both counting popup screenshots are produced by reader-alignment. Review the latest candidate locally; screenshots supplied by the owner are problem references, not approval.

## Documentation updated

Design system, quality checklist, active phase, decision log, master O1–O3 tracker and this report.

## Decisions recorded

This is a scoped continuation of the current local phase. Preserve the publication hold and all earlier owner requests. Scope popup sizing to these counting selectors, not every command menu. No reviewed wording, translation, repetition, page selection or persisted/synchronized state change.

## Known limitations or remaining risks

Owner aesthetic approval and real-device/assistive-technology checks remain open. Narrow triggers may be bounded further by available viewport space; complete option text grows vertically and scrolls. Previous unrelated Firefox diagnostic incidents remain in their earlier report.

## Out-of-scope findings

No deployment, backend/schema, native migration, dependency or devotional-content change.

## Recommended next step

Owner local visual review of the three corrected surfaces; retain publication hold.
