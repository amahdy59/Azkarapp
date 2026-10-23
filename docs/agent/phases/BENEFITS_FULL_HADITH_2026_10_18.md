# Phase Report — Complete Benefits hadith narrations

## Objective

Apply the owner's screenshot request locally: replace abbreviated Benefits hadith summaries with complete selected narrations in Arabic and English. Coordinate with the active release and prayer sessions. No commit, push or publication.

## Scope completed

Plan before editing: inspect the Benefits catalogue and content-review contract; reuse matching source-compared full readings; compare the remaining narrations to source pages; retain stable identities and source metadata; verify display, sharing and narrow-screen wrapping. Prepared externally while the release checkout was frozen, then applied only this phase's files after the release owner explicitly opened the local integration window. All six implementation/test/evidence files were checked byte-for-byte against the verified draft.

## Files changed

- `src/app/content/benefitsHadithReadings.json`: 21 complete bilingual readings.
- `src/app/content/zikrBenefits.ts`: typed full-reading lookup, removal of summary arguments and abbreviated title fragments.
- Content and Benefits screen tests, plus `e2e/pre-phase-nine.spec.ts`.
- Dated source-comparison evidence, content-authoring guidance, phase index and decision log.

## Components added or modified

No presentation component changes. Existing EvidenceCard and share adapter consume the complete catalogue text. The full readings remain bundled with the lazy Benefits screen and available offline.

## User-visible changes

All 21 hadith cards show full selected narration text, including the Ayat al-Kursi story, Fatimah's request and bedtime instruction, and Aban's account. English uses the app's rendering of meaning. Three abbreviated headings become concise topic labels without incomplete quotations. Existing Quran excerpts, 30 derived benefits, citations, IDs, counts and persistence remain unchanged.

## Accessibility work

Retain existing native headings, source links, share controls, keyboard-scroll region and direction. Verify complete Arabic text at 320px, with no horizontal overflow, and complete text sharing. No claim of complete manual accessibility acceptance.

## Tests added or updated

Require exact coverage of the 21 IDs, bilingual full-text rendering/sharing, no omission markers, equality with 12 reused readings, comparison boundaries for nine additional sources, and retained endings/context for long stories. Browser regression checks English text export and Arabic narrow rendering/export across engines.

## Commands run

| Command                                | Result                   |
| -------------------------------------- | ------------------------ |
| Targeted Vitest (catalogue and screen) | 2 files, 14 tests passed |
| TypeScript `tsc --noEmit`              | Passed                   |
| Targeted ESLint                        | Passed, zero warnings    |
| Targeted Prettier                      | Passed                   |
| Chromium Benefits browser regressions  | 2 passed                 |

All checks passed. Verification is isolated in `C:/Users/AhmedMahdy/.codex/workspaces/full-benefits-hadith`; no release receipt is transferred to the shared checkout.

## Visual/manual evidence

`output/playwright/benefits-full-hadith-ar-320.png` and `benefits-full-hadith-en.png` in the isolated workspace and copied to the shared checkout. Arabic 320px capture inspected: full Fatimah narration, readable source and share button, no horizontal clipping. Physical-device and human assistive-technology review remain separate.

## Documentation updated

This report, content-authoring contract, phase index, decision log and `evidence/benefits-full-hadith-2026-10-18.json`.

## Decisions recorded

Complete means the entire selected matn, including story context, excluding preceding transmission chains and subsequent compiler commentary/parallel-route notes. Reuse 12 existing full readings byte-for-byte (Tirmidhi 3505 excludes its trailing transmission note). Nine additional Arabic matn boundaries are source-compared; English is independently phrased for the app. Existing Dorar links and named authentication remain visible. Tirmidhi 3464 retains its attributed al-Albani assessment, supported by the linked Dorar record; differing provider grading is documented in evidence. This is coding-agent source comparison, not independent scholarly sign-off.

## Known limitations or remaining risks

Long stories require more vertical scrolling. Large image exports retain existing compatible-format/Text recovery. New content remains local only; release notes are intentionally untouched. The other release session owns publication of its earlier frozen snapshot.

## Out-of-scope findings

The active release's 20 original collection source comparisons are a separate scope. Do not replace those identities with these Benefits records or infer new prescribed timings/rewards.

## Recommended next step

Owner review of full Benefits narrations and the narrow-screen evidence; publish only on a subsequent explicit instruction.
