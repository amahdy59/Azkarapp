# Phase 87 — Interaction and search reliability

## Objective

The owner authorizes repairing the hand guidance toggle and the five findings from the 2026-10-08 usability review. Audio synchronization/embedded Mushaf requests receive a separate evidence-based proposal; timing annotations are not invented in this phase.

## Plan and scope

Inspect the existing guidance lifecycle, shared search inventory, route/history boundary and saved routine modes. Reuse existing components and content. Make guidance activation reliable after first counting and keep the pointer target horizontally stable. Share the Library search corpus with Search, retain edited queries in the route, show recognizable surah names and match excerpts, use visit-local full reading context for lookup, and suppress global shortcuts inside modal/menu interactions while preserving legitimate shortcut history.

Add unit and cross-browser regressions for the actual failures. Run targeted tests, complete repository quality and browser gates, inspect responsive evidence, update contracts and release notes, then exercise the authorized release cycle. No religious content, persisted schema, dependencies, prayer calculation or reviewed audio bytes are changed.

## Verification and phase report

Local verification is complete. The structured report below records scope and evidence; the authorized release follows the mandatory pre-push and CI gates.

## Objective

Repair the six approved interaction/search findings without changing reviewed content, stored schema or audio recordings.

## Scope completed

The shared hand control now keeps a stable horizontal position and records first-count dismissal even when its explanation is already hidden. Search and Library share their reviewed dua inventory; query edits survive Reader return/reload; lookup opens the full list as visit-local context instead of changing saved routine mode. Global shortcuts respect modal/menu/native editing ownership and push reversible history. Surah results show names and matching excerpts from original text.

## Files changed

- Application composition/routing: `src/app/App.tsx`, `src/app/hooks/useAppRouting.ts`.
- Guidance: `src/app/hooks/useCounterGuidance.ts`, `src/app/components/ZikrComponents.tsx`.
- Search: `src/app/content/searchCatalog.ts`, `src/app/content/searchNormalization.ts`, `src/app/screens/SearchScreen.tsx`, `src/app/screens/AzkarLibraryScreen.tsx`.
- Regression tests: CounterGuidance, SearchScreen, searchNormalization and useAppRouting unit files; `e2e/review-reliability.spec.ts`.
- Documentation: ARCHITECTURE, DESIGN_SYSTEM, agent INDEX/DECISION_LOG, this phase and `docs/audio/SYNCHRONIZED_QURAN_PLAN.md`.
- Release communication: `public/release-notes.json` contains four parallel Arabic/English outcomes for stamp `2026-10-08.1`.

## Components added or modified

Modified CounterTapHint, SearchScreen and Library integration. Added a content-layer shared search catalog; no new visual primitive, runtime dependency or audio element.

## User-visible changes

A single pointer/keyboard activation toggles guidance after counting. Search retains comprehensive duas and edited queries, identifies surahs clearly, and preserves the saved Complete/Core choice. Opening a panel prevents global navigation shortcuts from unexpectedly replacing it. Valid shortcuts retain a route back to reading.

## Accessibility work

Retained the 44px native hand button, visible focus, localized labels and expanded state; added aria-controls and native hidden explanation. Eight stationary pointer activations plus Enter/Space preserve the count. Arabic/English phone/desktop verification covers hand geometry. Modal shortcut tests retain dialog ownership and Back restoration in all three engines. Matching excerpts retain original Arabic diacritics and use underline as well as color. Automated checks and browser keyboard evidence do not constitute complete assistive-technology certification.

## Tests added or updated

Unit regressions cover hidden first-count dismissal/manual reopening, shared search inventory/canonical result indexes, query callbacks, surah previews, original-word snippet boundaries, temporary routine context and consumed/modal shortcut suppression. Seven new browser cases produce 21 three-engine checks. Existing search and responsive guidance specs also run.

## Commands run

| Command                             | Result                                                                                        |
| ----------------------------------- | --------------------------------------------------------------------------------------------- |
| `pnpm verify:toolchain`             | Pass: Node 24.21 and pnpm 11.19                                                               |
| Targeted six-file `pnpm test:run`   | Pass: 62 tests, 11.16 seconds, exit 0                                                         |
| `pnpm typecheck`                    | Pass, exit 0                                                                                  |
| `pnpm check`                        | Pass: all ten stages, including enforced coverage and bundle/CSS gates; 105.7 seconds, exit 0 |
| Targeted three-spec `pnpm test:e2e` | Pass: 34 tests, 3.3 minutes, exit 0; `output/phase87-targeted-corrected.json`                 |
| `pnpm audit:prod`                   | Pass: no known vulnerabilities, exit 0                                                        |
| `pnpm check:release-notes`          | Pass: current release manifest covers waiting changes                                         |
| Complete `pnpm test:e2e`            | Pass: 723 tests, one skipped, zero failures, 36.4 minutes, exit 0; `output/phase87-full.json` |

Initial authored tests had one incorrect Testing Library import, a one-repetition fixture that intentionally auto-advanced, and an Arabic expectation without the reviewed diacritics. Corrected the tests and reran; no production assertion, threshold, timeout, coverage or bundle ceiling was weakened.

## Visual/manual evidence

Screenshots at `output/playwright/review-reliability/guidance-{ar,en}-{390,1200}.png`; Arabic phone and English desktop inspected. Browser evidence demonstrates stationary pointer hitbox retention and keyboard behavior. Review baseline is `output/playwright/ux-review/REVIEW.md`. Evidence paths are ignored local artifacts.

## Documentation updated

Architecture documents shared search ownership and visit-local lookup state. Design System documents stable guidance target placement and recognizable search previews. The audio proposal distinguishes QCF page glyph/fonts from Amiri Quran Unicode text and specifies bounded read-only player embedding, exact-recording timing validation, optional learner highlighting and manual accessibility/content review.

## Decisions recorded

DECISION_LOG records the owner-confirmed hand control, approval of the five review fixes and separation of the audio feasibility proposal from synchronization implementation.

## Known limitations or remaining risks

Synchronized audio and embedded Mushaf presentation are proposed, not shipped. Current recordings have no verified verse/word timestamps. Applying page-specific QCF fonts to plain Unicode cannot reproduce Mushaf pages; reuse the renderer with matching glyph data/fonts. New audio/timing content requires review. Manual screen-reader evidence remains a release input for that proposed feature.

## Out-of-scope findings

No reviewed religious text, repetition count, source, recording bytes, prayer calculation, synchronized field or persistent reading data was edited. Four unrelated owner text files remain untracked and untouched.

## Recommended next step

Implement the read-only Mushaf player adapter as its own approved phase, then acquire/review exact-recording verse timings before adding following; optional word and phrase learning follow verified annotations.
