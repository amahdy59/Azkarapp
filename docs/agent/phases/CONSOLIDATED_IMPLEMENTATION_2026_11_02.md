# Consolidated checklist implementation — 2026-11-02

Owner approves implementing the consolidated requirements, including subsequent keyboard, pill, chart clarity and chart-alignment follow-ups (55 acceptance items). The planning-only gate is lifted; the local publication hold remains. Preserve earlier drafts and source/data contracts.

## Inspected implementation and sequential plan

1. Reliability: Home's verified reminder loader depends on one unbounded external fetch and silently hides first-load errors. Ship its existing checksum-identical 91KB compressed asset with the offline app, bound acquisition and offer explicit recovery. Keep reviewed content and schedule unchanged; test corrupted/local/offline/stalled acquisition and retry.
2. Shared controls: complete existing metric/plan modals, equal-height wide summaries, nested searchable picker containment, stable hover hit geometry, stronger eased icon/paint cues, toggle containment/hover, audio action spacing/options finish. Reuse shared primitives and apply semantic token spacing/form states. Targeted unit/browser verification before advancing.
3. Quran/Progress presentation: move existing artwork to today's Quran continuation card, keep concise Progress empty state; retain stable wide/narrow panel and weekday improvements. Reclaim Mushaf furniture space and align metadata to the fitted paper measure, preserving 15 slots/line breaks/font guards. Verify actual primary QCF and fallback geometry.
4. Bilingual reading: Quran font/glyph rendering, remove redundant separators, fixed header/footer with independently scrolling ordered ayahs; add direct full Share entry to each verse using existing AyahInteractionSheet/ShareStudio. Preserve translations, references, bookmarks, scroll context and responsive reading order.
5. Consolidated acceptance: update checklist evidence per item (owner acceptance remains separate), run targeted three-engine cases, screenshots/axe/geometry/keyboard/still modes, full non-browser quality gate, Pages build and core offline/navigation smoke. Do not raise ceilings or weaken tests. Physical/assistive technology acceptance remains factual outstanding evidence.

Each numbered stage is a bounded checkpoint; do not roll unrelated architecture/content changes into it. Reports distinguish previous checkpoint evidence from current inputs. No push/commit/deployment is authorized by this implementation request.

Owner follow-up adds keyboard-help removal from the visible Reader actions (retain More recovery), stronger pill hover and recorded-data charts in empty plan/Progress routine-column space. Reuse a passive RecordedPagesChart with an explicit last-seven-elapsed-dates scope; no synthetic data or score. Add date clipping tests and screenshots, preserving all earlier gates.

Build-size checkpoint: packaging the verified reminder exposes a 64,803-byte output-ceiling overrun. Intern identical long value literals only in the emitted audio manifests, preserving source data and exact runtime objects. Prove both real manifest exports equal before/after and rerun output budgets; retain every asset, feature and ceiling.
