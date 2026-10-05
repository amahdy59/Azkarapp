# Phase Report — Compact combined shared cards

## Objective

Apply the owner's combined-card design recommendations, plain website footer and Arabic-Indic numbers, including the follow-up optional first-reference summary limited to two lines.

## Scope completed

Plan before edits: reuse the measured sharing layout and renderer; compact collection header/panels; preserve reading size and sequence; place source and repetition in one metadata row; retain complete text and explicit incompatible-format recovery; verify actual browser glyphs, Arabic/English, optional sources, QR, keyboard, offline and responsive behavior; complete the authorized release cycle.

The owner explicitly superseded mandatory sources for exports. Sources default on and can be omitted. Images show the first listed reviewed source, never an inferred most-important source. Long names abbreviate visibly with reference numbers retained where they fit; all image source summaries stay within two lines. Source-enabled Text/ZIP preserve the complete reviewed source. Reviewed content, glossary attribution, progress, prayers and synchronization remain unchanged.

## Files changed

Sharing layout, canvas renderer and brand utilities with their tests; CollectionShareModal and tests; Arabic/English dictionaries; sharing browser spec; release notes; architecture/design/quality contracts; decision log/index; this report and two accepted exported PNGs under docs/agent/evidence/compact-combined-shared-cards.

## Components added or modified

Existing CollectionShareModal, shareLayout, collectionShareCard and shareCardBrand. No dependencies or persisted state added. Shared geometry owns compact spacing and measured citation/count separation; display digit mapping participates in wrapping.

## User-visible changes

Compact header with optional subtitle; 24px panel vertical padding and 20px gaps; compact source/repetition row; optional sources with a first-reference summary of at most two lines; centered one/two-line passages and right-aligned longer Arabic passages; plain accent-colored website text; Arabic-Indic visible image numbers in both label languages. Complete items pack sequentially, up to four short or three larger items, without reducing the 52px collection reading size. Individual count pills retain their 16px clearance.

## Accessibility work

Labelled native source/subtitle checkboxes, existing keyboard/focus behavior, readable semantic image text matching the displayed source/digits, unchanged text alternatives, opaque contrasting palettes and glyph/diacritic clearance. Browser axe/resize checks do not establish complete WCAG compliance. Human screen-reader and actual phone compression checks remain pending.

## Tests added or updated

First-source selection, two-line cap, long-source abbreviation with retained reference number, optional source omission in single/combined images and text, canonical content preservation, Unicode numeral mapping, unchanged URL/filename digits, four-item packing, metadata geometry, plain website/no source headings, subtitle choice, all-corpus source limits and readable text. Browser checks retain real glyph bounds and add optional-source PNGs, first-reference summaries and two-line limits across Chromium, Firefox and WebKit. QR keyboard readiness waits for the regenerated image, preserving the navigation assertions.

## Commands run

| Command                                                                      | Result                                                                                                                               |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| pnpm install --frozen-lockfile                                               | Exit 0; pinned pnpm 11.19.0 / Node 24.21.0.                                                                                          |
| pnpm test:run src/app/share src/app/components/CollectionShareModal.test.tsx | 8 files, 88 tests passed; exit 0. Final covered suite verifies the final snapshot.                                                   |
| pnpm typecheck                                                               | Exit 0 during development; repeated by the release gate.                                                                             |
| pnpm audit:prod                                                              | Exit 0, no known vulnerabilities.                                                                                                    |
| pnpm run check:release-notes                                                 | Exit 0; new 2026-10-05.5 notes replace the previous deployed release.                                                                |
| Affected sharing browser matrix                                              | Exact final counts/results in output/compact-sharing-final-browser.log and output/compact-sharing-final-results.json.                |
| pnpm check, pre-push smoke/Pages gates, CI and production smoke              | Final exact results and workflow links in output/compact-sharing-release/RELEASE_VERIFICATION.md; no gate, threshold or hook bypass. |

Earlier diagnostic failures are retained: one unit expected the wrong existing English repetition copy; another used an unsupported asymmetric toHaveValue matcher. The first browser matrix had a 0.144px glyph overhang and QR navigation before regeneration settled. Text insets now reserve additional ink clearance; the QR test waits for the changed image. No product assertion or coverage threshold was removed.

## Visual/manual evidence

Accepted exports: morning-with-sources.png and morning-without-sources.png in docs/agent/evidence/compact-combined-shared-cards. Inspection confirms compact reference/count rows, complete devotional text, plain footer, Hindi numerals and readable panels. The two exports have identical header pixels; source removal allows three complete items on the example's first page, instead of two. Browser artifacts include all palettes, single cards, reminders/QR, narrow and enlarged-text settings. Real destination-app compression, physical cutouts and screen-reader speech remain human follow-ups.

## Documentation updated

Architecture, design system, quality checklist, owner decisions, agent index and release notes. The source follow-up explicitly overrides older mandatory-source contracts for sharing alone.

## Decisions recorded

Owner approves the combined-card recommendations, removes the website pill, requires Arabic-Indic digits and then authorizes optional abbreviated first-source summaries capped at two lines.

## Known limitations or remaining risks

Very long items still require a compatible size or Text/Link recovery. Packing preserves devotional order rather than filling every leftover gap with a later item. Text and archives intentionally preserve source wording and machine-readable URLs/filenames. Actual social-app compression and human assistive-technology checks are pending.

## Out-of-scope findings

The previous deployed reading/update/audio changes are preserved. No content review, progress schema, prayer calculation or remote service was changed.

## Recommended next step

Check shared images on real Android/iPhone destinations and verify reading comfort and source choices with assistive technology.
