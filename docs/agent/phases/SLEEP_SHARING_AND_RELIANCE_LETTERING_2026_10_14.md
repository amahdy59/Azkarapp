# Phase Report — Supplied sleep cards and reliance-dhikr lettering

## Objective and plan

The owner supplied two sleep sharing cards and requested the existing morning/evening pack behavior. Preserve exact JPEG source bytes, register ordered bilingual metadata, retain generated studio/default and failure recovery, include assets offline, and verify previews/download bytes. Separately map the existing reliance dhikr to its explicitly identified quotation in 9:129; preserve semantic text/counts and reject mismatches. Bundle page 207 font and precache page data for first-visit offline rendering. No reviewed devotional records are edited.

## Scope completed

Registered the two supplied sleep cards; added strict quotation display mapping and page font. Verified locally; publication authorized following the explicit 12 MiB total-output exception.

## Files changed

curatedRoutineCards and tests, sharing-curated browser spec, two supplied card assets; mushafExcerpts and test, qcfMushaf font registry and test, daily-font script/manifest/font, reliance browser spec, Vite offline inventory.

## Components added or modified

Existing shared collection studio and QuranVerseText renderer reused without changes. Generated studio remains the default; supplied pack requires explicit selection.

## User-visible changes

Sleep collection has an optional two-card supplied pack with ordered preview/ZIP saving. Reliance dhikr displays verified Mushaf words with original semantic text and punctuation retained, without adding an ayah prefix or verse marker.

## Accessibility work

Bilingual card descriptions and existing keyboard/preview semantics preserved. Original semantic dhikr remains available to assistive technology. No complete manual WCAG claim.

## Tests and commands

Final mapping/sharing/shortcut units: 17 passed (8.12s); final combined scoped units: 76 passed (6.38s). Final built three-engine follow-up browser suite: 16 passed (1.6m), including both-language Mushaf glyphs and all three supplied packs; unit mapping rejects extra unmatched words and protects repetition count. Browser checks cover glyph identity, containment, actual ZIP bytes, preview geometry and offline assets.

## Visual evidence

Owner-provided images are the source; original JPEG bytes are retained. Original JPEG bytes are identical to supplied files (139,375 and 150,392 bytes). Lossless WebP candidate was 1,114,568 bytes total; preserving original JPEGs saves 824,801 bytes and avoids recompression. Browser preview/ZIP/offline checks pass.

## Documentation and decisions

Owner explicitly authorized these follow-ups during Home work. This report and content/architecture contracts document scoped exceptions: the existing quotation is mapped only within its explicit canonical verse. Generic unknown partial/mixed text still falls back.

## Remaining risks

Supplied raster cards are owner assets, not newly reviewed religious-source records. Their inclusion does not change the app's reviewed content. Physical screen-reader acceptance remains separate.

## Recommended next step

The owner explicitly approved raising only total output to 12 MiB and publishing all changes. Run final local gates and verify exact-commit Quality, Pages and production. The original 11 MiB failure is retained above as historical evidence.
