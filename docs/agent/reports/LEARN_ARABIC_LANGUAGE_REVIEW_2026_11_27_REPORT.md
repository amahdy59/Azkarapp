# Phase Report — Learn Arabic language and source refinement, 2026-11-27

## Objective

Make the proposed prayer/ablution audio draft natural, relevant Arabic with explicit support from hadith and identified scholarly explanations. Resolve the owner's concrete concern about the awkward note on fasting and forceful inhalation while retaining the review-before-generation boundary.

## Scope completed

Reviewed all 33 stage explanations and the practice/feedback copy. Revised 42 explanation/interaction clips; one existing practice prompt was already suitable and remains unchanged. Preserved all 16 devotional-wording/Quran candidate texts and their transcript hashes byte-for-byte, including nine canonical application texts and the previously disclosed source-specific opening candidate. The inventory remains 59 candidates: 57 for potential HeyGen synthesis after approval and two reciter-recording slots. Revised proposed HeyGen text totals 5,349 characters, not measured audio duration.

Replaced the vague nasal-rinsing note with explicit teaching of inhaling/exhaling, the terms الاستنشاق/الاستنثار, and the distinction between thorough rinsing for a non-fasting learner and avoiding exaggeration when fasting. The evidence ledger cites Laqit ibn Sabrah's report in Abu Dawud 142 and Tirmidhi 788; it retains al-Tirmidhi's hasan-sahih judgment and identifies the difference between quoted hadith and teaching paraphrase. It no longer treats an unspecified warning against force as the teaching rule or postpones the fasting exception.

Added a paired mouth/nose demonstration group grounded in Bukhari 191, with its three repetitions applied to the pair. The scholarly note acknowledges separate handfuls as allowed rather than treating this selected demonstration as the only valid form. Added specific scholarly sources for facial boundaries and explicit obligatory-prayer rakah counts instead of attaching those details to unrelated or overly broad evidence. There are now 43 source records, including nine added records. Detailed scholarly explanation remains identified as such; this is not a claim of universal agreement or independent religious approval.

Separated the spoken review from source/reviewer/scene/production notes. Removed implementation language from source/clip titles. Added a small offline renderer so the JSON authoring draft produces both documents consistently; do not rerun the obsolete temporary v1 generator.

## Files changed

- `docs/audio/learn-narration/script-draft.ar.json`: v2 prose, source mappings, evidence notes and paired-demonstration metadata. Held generation/upload/integration flags remain false.
- `docs/audio/learn-narration/SCRIPT_REVIEW.ar.md`: natural-language Arabic review, separate devotional clips and per-step references.
- `docs/audio/learn-narration/REVIEW_NOTES.ar.md`: new source explanations, grading/variant qualifications, preparation directions, open review questions and production boundaries.
- `docs/audio/learn-narration/render-review.mjs`: authoring-only rendering of both review documents from the JSON.
- `docs/audio/learn-narration/validate-review.mjs`: validates both document views, sources, group/quote identities and explicit distinction of explanatory prose.
- `docs/agent/phases/LEARN_AUDIO_SCRIPT_REVIEW_2026_11_27.md`: follow-up scope and evidence links.
- `docs/agent/DECISION_LOG.md`: owner-authorized language/source revision; preserve concurrent entries.
- `docs/agent/reports/LEARN_AUDIO_SCRIPT_REVIEW_2026_11_27_REPORT.md`: historical-v1 note linking to this current checkpoint.
- This report.

The ignored `.cache/learn-audio-review/revise-language.mjs` applied the one-time migration and retained a local v1 comparison copy; neither contains credentials or is a runtime dependency.

## Components added or modified

None. No application components, canonical content, media files, assignments, routes, storage/synchronization or dependencies changed.

## User-visible changes

The owner receives a cleaner Arabic narration draft and separate useful source/preparation notes. Terms are introduced with their actions, repeated process wording is reduced, and feedback explains the relevant detail in familiar language. The live application is unchanged.

## Accessibility work

Retained complete readable text, individually replayable planned audio, learner-paced movement and reduced-motion/no-visible-eyes requirements. Moving production notes out of narration reduces unrelated material in the learning review. This is authoring work, not evidence of implemented accessibility or successful learning outcomes.

## Tests added or updated

Extended the offline authoring validator to cover separate spoken/production documents, stage anchors and audio links, source-ledger completeness, explanation/quotation distinction, paired demonstration references and evidence quotations. Existing canonical text, counts, complete Quran, hashes, credential checks and held-production assertions remain intact. No assertion was weakened to enable generation.

## Commands run

| Command or operation                                                                                                            | Result                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| One-time `node .cache/learn-audio-review/revise-language.mjs`                                                                   | Completed v2: 33 stages; 59 clips; 43 sources; all 16 devotional/Quran texts preserved; 5,349 proposed HeyGen characters; zero generated/uploaded audio files. |
| `node docs/audio/learn-narration/render-review.mjs`                                                                             | Initial attempt exposed a closing-bracket syntax error in the new renderer; corrected it. Subsequent runs render both documents successfully.                  |
| `node docs/audio/learn-narration/validate-review.mjs`                                                                           | PASS: 33 stages, 59 clips, nine preserved canonical texts, 11 preserved Quran verses, generation/upload held, no credential-like values.                       |
| Independent comparison with the local v1 JSON                                                                                   | All 16 devotional/Quran texts and hashes unchanged; 42 explanatory/practice clip texts revised.                                                                |
| `pnpm exec eslint docs/audio/learn-narration/render-review.mjs docs/audio/learn-narration/validate-review.mjs --max-warnings 0` | Passed with exit 0 and no findings before final documentation update; final scoped results confirmed before handoff.                                           |
| Targeted Prettier write/check for changed package, phase and reports                                                            | Passed before final handoff; no unrelated file formatted.                                                                                                      |

Full application gates, browser tests and release hooks are not run for this authoring-only revision. Independent source-book/audio/browser/UI changes were already present in the shared checkout and are left intact. No commit, push, release-note edit, deployment, paid synthesis or R2 operation occurred.

## Visual/manual evidence

Inspected the generated Arabic review and evidence notes, including the cited nasal-rinsing passage and ordinary prayer-stage wording. No new illustrations or audio exist. No listening, pronunciation, real-device, assistive-technology or user-learning assessment is claimed.

## Documentation updated

The Arabic review and separate source/preparation ledger, structured source data, scoped phase/decision entry, original checkpoint pointer and this report. The independent active-phase index is unchanged by this work.

## Decisions recorded

The owner requests revising wording and source support, not approving synthesis or implementation. The revised narration includes the fasting distinction at the relevant action; source quotations and explanatory commentary are identified separately. Postural/fiqh alternatives, final scholarly review, voice selection and listening review retain their earlier boundaries.

## Known limitations or remaining risks

- This is a source-linked draft comparison by the agent, not independent scholarly, pronunciation or tajwid approval. Evidence links are inspectable; automated checks cannot authenticate a religious interpretation.
- Exact wording, final curriculum/age scope, choice of detailed teaching reference and the existing R1 opening-supplication proposal still await owner/source approval.
- The selected basic lesson does not cover every accepted variant, the detailed rules for facial hair, congregational roles, disability accommodations, Friday/travel prayer or purification exceptions. These boundaries are explicit in the notes.
- No audio has been generated. Actual duration, intelligibility, accurate pronunciation, provider rights, final Quran-recording boundaries and hosted delivery remain to be verified after approval.

## Out-of-scope findings

Preserved all independent working-tree changes. No production content correction or audio activation was inferred from this request.

## Recommended next step

Review the revised Arabic wording and the separate R1–R5/source notes. After approval, prepare the authorized audio recordings and their checksummed R2 assets; application integration remains a separate decision.
