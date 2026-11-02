# Phase Report — Procedural soft paper candidate

## Objective

Try the owner's selected soft-grain direction locally, then follow the clarification to generate it in code rather than using image sources. This is a visual candidate under the existing publication hold.

## Scope completed

Replace the light tile's sparse pore treatment with deterministic, softly correlated neutral grain. The existing generator wraps value-noise fields with fixed seeds, matches sampled edges and renders the result once at build time. The application uses its existing static background recipe. No runtime noise, extra overlay, photo or AI-image source is used. The superseded imagegen experiment is retained only in ignored output/soft-grain/.

## Files changed

- scripts/generate-paper-grain.mjs: procedural light field and bounded alpha; dark algorithm unchanged.
- src/assets/paper-grain-light.png: regenerated tile. Dark bytes unchanged.
- src/styles/theme/paper-grain.css: updated provenance comment; selectors/stock colours unchanged.
- scripts/paper-grain-assets.test.mjs: bounded soft variation, lower peak ink, continuous coverage and seam regression; combined 14KB ceiling unchanged.
- e2e/soft-paper-candidate.spec.ts: phone/desktop, Arabic/English, 320px/200%, stable geometry, hit-testing and axe evidence.
- Active phase and consolidated acceptance ledger: owner selection and procedural clarification.

## Components added or modified

None. Reuse the shared paper surface, existing theme selection, Settings switch, offline asset pipeline and accessibility fallbacks.

## User-visible changes

Light solid surfaces use finer, soft continuous grain. The enabled warm-neutral stock palette remains. Dark, Midnight, Glass's navy functional surfaces, reduced-transparency/high-contrast/forced-colour/print and the user's Paper texture choice retain their existing behavior.

## Accessibility work

Preserve plain fallbacks and static geometry. Regression checks cover texture-toggle geometry, hit-testing and automated contrast/semantics. Physical-device and human assistive-technology acceptance remains separate.

## Tests added or updated

The asset test verifies a valid tiny indexed tile, neutral ink, restrained spread/mean/peak, no sparse pepper effect, repeated-edge continuity and unchanged combined byte budget. Existing paper-grain browser cases retain theme/material/fallback/switch and Mushaf checks. New visual cases capture real Library and Progress surfaces at normal zoom and enlarged phone text.

## Commands run

Exact final results and raw logs are in output/soft-grain/PHASE_REPORT.md. Scoped candidate gates: asset Vitest, changed-file ESLint/Prettier, texture-specific Chromium/Firefox/WebKit cases, Pages build/bundle/CSS checks and generator reproducibility. No broad release verification or publication is claimed for this appearance trial.

## Visual/manual evidence

Generated-source image trial and first procedural cloudy draft are historical diagnostics. Final procedural Library/Progress screenshots are captured and inspected separately under output/soft-grain/. Owner visual acceptance remains open.

## Documentation updated

This report, active phase and Q3 follow-up in the consolidated ledger. The preceding texture contract is preserved, with only the generation/calibration of the light tile superseded by this candidate.

## Decisions recorded

Use code as the source. Retain the small build-time raster cache for runtime performance. No commit, push, deployment, reviewed-content or persistence changes.

## Known limitations or remaining risks

Fine grain visibility depends on physical display density and scaling. The final appearance requires owner review. The app still paints a generated image tile at runtime; it does not use live CSS turbulence. If literal image-free runtime rendering is desired, that would need a separate measured change to the existing no-live-filter contract.

## Out-of-scope findings

No navigation relocation, content changes or other visual redesign.

## Recommended next step

Review the local light Library/Progress candidate at normal zoom before any further texture adjustment or release work.
