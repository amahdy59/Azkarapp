# Phase 91 — owner-accepted generated highlights across the audio library

## Objective and authorized plan

The owner explicitly asks to consider all generated timings accepted and perform full listening review later while testing the app; they have no time to review every recording now. This supersedes the earlier per-recording review prerequisite for activation. Register all 243 processed recording drafts as owner-accepted previews, retain exact bytes/transcript identities and human-reviewed sample status, leave unresolved words unhighlighted, distinguish estimated controls, test Arabic/English/Quran and release after all normal quality gates.

## Scope and contracts

Preview provenance uses `reviewStatus: owner-preview`, dated owner acceptance, and empty independent-review fields. This records the actual authorization without inventing a full listening review. Independently reviewed files retain `approved` and complete coverage requirements. Ordinary previews declare every missing word as an unresolved gap; Quran previews may omit unresolved word/verse intervals but must preserve known semantic coordinates, ordering and duration bounds. No audio/text replacement, extrapolated times, schema changes, runtime model or new dependency.

## Files/components

Timing approval policy, ordinary/Quran validation, annotation registration/index, batch registration utility, generated immutable timing files, player/Quran estimated-word labels, Arabic/English i18n, unit/browser integration tests, release notes and domain/decision/index documentation. Existing native clock, QCF font/layout and reading persistence remain unchanged.

## Accessibility and user behavior

Generated cues default on using a translucent primary-color background and underline without padding, font-size or line-height changes; users can turn them off. The control reads “Estimated word highlights” in English and its Arabic equivalent. No per-word live announcement or focus movement. Manual Quran page navigation retains priority; following defaults on, pauses for manual scrolling/page navigation and can be resumed. Secondary controls use a compact accessible options popover. Missing boundaries create quiet gaps, never fabricated spoken tokens or an assertion that the word was absent from the recording.

## Tests/evidence and release

Verify explicit dated owner acceptance, strict reviewed-file completeness, preview coverage gaps, exact identity and semantic intervals; browser-test registered Arabic/English cues, voice transitions and long-surah controls. Run `pnpm check`, relevant browser specs, pre-push gates, exact-commit full CI/Pages and production smoke. Final results are retained in `output/phase91-*` and the release report.

## Owner's parallel workspace changes

The owner explicitly asks to preserve and ship their parallel changes. Include their library tabs at compact widths, bilingual searchable Quran plan pickers, reader/Aa display settings, and reader/reciter menu refinements. Preserve the original workspace while verifying an isolated combined snapshot, then check for newer edits before pushing. Adapt existing browser assertions to the new semantic combobox and visible tabs without dropping keyboard, geometry, search or target-size assertions. Keep unrelated personal root text files out of the application release.

## Known limitations and next phase

Model alignment is provisional, including 30 partial/concern recording cases. English wording candidates and possible recording/content discrepancies retain their evidence for later review; canonical text and assignments are unchanged. Al-Baqarah’s manifest/decoded duration differs by 792 ms, so generated cues are bounded to the exact registered manifest duration and any out-of-range word remains unresolved. No tolerance is enlarged. Full listening/assistive-technology review remains later work, as requested by the owner. Replace individual preview files with corrected, independently reviewed immutable annotations when available.
