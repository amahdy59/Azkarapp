# Arabic and English listening alignment

Phase 89 extends the phase 88 Quran timing contract to every approved Arabic and English recording. Existing reciters, original recording bytes and reviewed display text remain authoritative. No alignment service or speech model runs in the application.

## Generate drafts

Use Node/pnpm from the repository and a separate Python 3.12 authoring environment. Install `scripts/listening-alignment-requirements.txt` into that environment, never the application dependency graph. TorchAudio is deliberately pinned to 2.8 because its CTC alignment kernel was removed in 2.9. Both source model repositories are Apache 2.0; fetch their config, vocabulary and weights at these exact revisions into ordinary local directories (Windows symlinks are unnecessary):

- `english`: `facebook/wav2vec2-base-960h`, revision `22aad52d435eb6dbaf354bdad9b0da84ce7d6156`.
- `arabic`: `jonatasgrosman/wav2vec2-large-xlsr-53-arabic`, revision `af46c2d8531b8dcbb5e23b952f739b372c2e5d2d`.

```powershell
node scripts/listening-alignment-inputs.mjs output/listening-alignment
node scripts/cache-listening-recordings.mjs output/listening-alignment/jobs.json C:/alignment-cache
python scripts/align-listening-audio.py --jobs output/listening-alignment/jobs.json --output output/listening-alignment/drafts --cache C:/alignment-cache --model-root C:/alignment-models --language en
python scripts/align-listening-audio.py --jobs output/listening-alignment/jobs.json --output output/listening-alignment/drafts --cache C:/alignment-cache --model-root C:/alignment-models --language ar
node scripts/verify-listening-aliases.mjs output/listening-alignment/jobs.json output/listening-alignment/alias-verification.json
```

The input inventory deduplicates exact audio checksums and refuses conflicting byte size, duration or repetition metadata. It includes unassigned approved variants; inventory membership does not create an app playback assignment. Model inputs use normalized spelling but retain the untouched transcript and UTF-16 display offsets. Quran page words retain canonical verse/word coordinates. Arabic display variants and distinct English translations remain separate candidates; matching their Arabic identity never proves what English wording was recorded.

Every original download must match the approved SHA-256 and byte size. The PCM working copy is resampled to mono 16 kHz without trimming. Acoustic inference uses 30-second central windows with two seconds of overlapping context; its frame scores are cached by recording/model revision. Supplied-text CTC alignment uses bounded blocks; long recordings without trustworthy recognition anchors are flagged for manual alignment. It never divides recording duration evenly. Acoustic scores are model evidence, not calibrated accuracy probabilities. Unsupported symbols, openings, introductions, basmalah, repetitions, omissions, missing words and block seams require review. In particular, disconnected Quran letters can have pronunciation different from their written spelling.

`--variant` selects an exact approved variant pilot, `--limit` bounds a batch, and `--threads` bounds CPU use. `--background` uses idle Windows process priority; it does not change machine settings. A `pause` file in the cache directory pauses processing between acoustic windows/jobs. Resume reuses completed results only when the pipeline version, exact job digest and model revision match. Acoustic caches are written atomically; damaged old caches are retained as `.invalid.npz` evidence and regenerated. Failures remain explicit draft records. Do not run large CPU alignment batches during browser release verification; a single idle-priority cached batch may be resumed separately, and should be paused before WebKit screenshot sweeps.

## Independent review

```powershell
node scripts/review-listening-timings.mjs output/listening-alignment/jobs.json output/listening-alignment/drafts C:/alignment-cache
```

Open `http://127.0.0.1:4189/`. The local tool serves only inventory recordings verified against their approved checksums, with byte ranges for seeking. Choose the actual spoken transcript candidate, listen to the entire recording, replay words and edit millisecond boundaries. Unresolved source words stay visible without invented times. Ordinary printed tokens absent from the recording, such as verse numbers, can be explicitly marked unspoken; canonical Quran semantic words cannot be omitted. Review embedded repetitions independently. Save edited drafts separately; generated drafts never set an approved status.

The independent qualified reviewer must enter their name/date and affirm complete recording/boundary review to export a reviewed annotation. Partial, unresolved, overlapping, out-of-range or duration-mismatched drafts cannot be exported as approved. All draft concerns remain available as evidence; correcting every missing boundary or explicitly reviewed ordinary omission resolves structural incompleteness. The tool cannot establish religious or linguistic qualifications itself. A named export is review evidence, not a substitute for the repository content-review process.

## Register reviewed annotations

```powershell
node scripts/prepare-reviewed-timing-registration.mjs independently-reviewed.json output/proposed-registration
```

This validates exact recording metadata, independent review, transcript checksum, complete display occurrences and canonical Quran word positions. It writes proposed immutable files and index entries under `output/` for code review; it never edits production registrations or grants approval. After content/timing review, copy the proposed files to `public/data/listening-timings/` and add the proposed metadata to `REVIEWED_TIMING_FILES` in `src/app/audio/reviewedTimingFiles.ts`. A Quran annotation is registered per variant. Each URL includes both recording SHA and annotation SHA, so corrected intervals receive a new immutable URL. Run `pnpm check` and the relevant listening/browser checks before the normal release.

The build validates annotation byte size/checksum, exact transcript digest, approved recording identities, independent dated review, interval order, coverage and repetitions. The runtime requests only the matching approved registration, verifies annotation bytes and exact displayed wording, rejects ambiguity, and cancels stale loads after voice/track/text changes. Individual files are bounded at 750 kB, excluded from the initial JavaScript bundle, and cached on first use for offline listening; unread timing files are optional network resources. Missing/offline/draft/corrupt annotations leave readable content intact with no misleading highlight.

## Playback and accessibility

Only the language actually spoken is highlighted, independent of interface language. Ordinary Arabic/English strings retain their exact punctuation, spacing and direction; Quran text inherits the existing Quran font role, and long Quran recordings retain QCF Mushaf layout. Embedded occurrences map back to the same display words. Native media time determines cues during seeking, repetition and speed changes; silence and interval ends have no cue. An underline and outline supplement color, `aria-current` identifies the current word, and no focus movement or per-word live announcement occurs. Ordinary text does not auto-scroll; Quran following remains optional and yields to manual scrolling. No persistence, progress or prayer behavior changes.

Reviewed Quran word emphasis starts enabled and remains switchable; automatic page following starts off. No production recordings have independently reviewed annotations at initial implementation. Draft completion alone does not enable production highlights. Release reports must distinguish generated, structurally complete, reviewed and deployed coverage.

Pipeline version 3 normalizes recognized Arabic spelling as well as supplied spelling before selecting long-recording anchors, preserving diacritics in the display text. It flags substantial extra recognized speech as a possible transcript/recording mismatch. Recognition alone cannot authorize a content correction: a qualified reviewer must resolve that finding through the existing content process before registration. Cached acoustic evidence can be reused when rerunning alignment after a pipeline change.

The review transcript has a bounded scrolling pane and one keyboard tab stop for its words. Arrow keys follow the transcript direction; Home/End select its first/last word. Playback never moves keyboard focus. Application word spans retain stable DOM identities across cue changes and silence to preserve assistive-technology reading position. English narration places English text first regardless of interface language. When an English interface plays Arabic with reviewed timings, the Arabic paragraph is shown automatically; an explicit user hide choice takes precedence.
