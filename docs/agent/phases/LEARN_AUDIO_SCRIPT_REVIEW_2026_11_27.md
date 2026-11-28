# Learn Arabic audio script review — 2026-11-27

## Owner authority

The owner requests HeyGen audio for the proposed prayer/ablution modules and R2 hosting, then explicitly selects **Prepare Arabic scripts for review first**. Complete the reviewable scripts and production inventory before requesting the final script decision. No paid synthesis or upload precedes that decision. The earlier no-eyes, Arabic-first, eLearning/cognitive-load, accessibility and visual-design requirements remain. This is a separate authoring checkpoint and does not change the active audio-library release or authorize application implementation/publication.

## Plan before authoring

1. Inspect existing in-prayer/ablution texts, source and audio contracts, HeyGen narrator/script-writing instructions and R2 upload utilities. Inspect configuration availability without printing credentials.
2. Draft short Arabic explanations, distinct devotional-wording clips, optional practice prompts and explanatory feedback. Reuse existing wording exactly, cite evidence, identify accepted-variation/source questions and reserve Quran for separately reviewed reciter recordings.
3. Produce a human-readable Arabic review document and structured authoring manifest. Validate IDs, references, exact canonical text, transcript hashes, Quran/TTS separation and credentials absence. Record limitations and wait for the script decision before synthesis/upload.

## Deliverables

- [Arabic script review](../../audio/learn-narration/SCRIPT_REVIEW.ar.md).
- [Structured draft](../../audio/learn-narration/script-draft.ar.json).
- [Checkpoint report](../reports/LEARN_AUDIO_SCRIPT_REVIEW_2026_11_27_REPORT.md).

## Owner language/source refinement — 2026-11-27

The owner finds the review note about fasting/forceful inhalation unnatural and requests clearer, relevant Arabic grounded in hadith and other authentic resources. Revise the complete explanatory and practice prose, check the evidence for the actions described, and keep devotional/Quran text intact. Preserve this phase's script-first gate.

Revision 2 places the narration in the readable review and moves all production directions, claim-to-source explanations and open content questions to [separate evidence/preparation notes](../../audio/learn-narration/REVIEW_NOTES.ar.md). Explicitly teach the non-fasting/fasting distinction from Laqit ibn Sabrah's report (Abu Dawud 142; Tirmidhi 788), rather than postponing it or implying a blanket prohibition on thorough nasal rinsing. Pair mouth/nose rinsing in the selected continuous demonstration using Bukhari 191 while preserving the cited allowance for separate handfuls. Use identified fiqh explanations for details that are not direct hadith wording.

The JSON remains the authoring source; `node docs/audio/learn-narration/render-review.mjs` updates its two review documents. The [language/source refinement report](../reports/LEARN_ARABIC_LANGUAGE_REVIEW_2026_11_27_REPORT.md) records the changes and scoped validation. This does not activate the lessons, approve final religious/audio review or authorize generation, R2 upload, commit or publication.

## Boundaries

No API keys in source, manifests, reports or command output. No key rotation between requests to evade quota; no repeated paid audition, automatic generation retry or voice substitution. Credentials supplied in chat have not been used at this checkpoint. Local R2 configuration presence is verified, not permission/hosting correctness. New files would use the existing immutable uploader and be verified after an approved upload; existing objects are never overwritten.

The manifest is authoring data outside `src` and `public`, with generation, upload and app integration all held. Draft source comparison is not independent scholarly/pronunciation approval. Existing canonical devotional text, recordings, assignments, defaults, reviewed religious content, persistence, release notes, workflows and independent working-tree changes remain intact. No commit or push.
