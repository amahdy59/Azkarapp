# Adding your own audio

This is the owner runbook for recording, reviewing, publishing, and activating audio in Azkarapp. Follow it for every new recording and every replacement. The system intentionally keeps an item unavailable until its exact transcript, media metadata, rights, hosting, and human approval are complete.

## The release rule

An audio item may play in production only when all of these are true:

- The recording contains exactly the Arabic represented by the audio asset: no missing words, extra prelude, translation, explanation, or baked-in repetition.
- A qualified Arabic reviewer has checked pronunciation and wording; Qur'anic material also has a qualified Qur'an/tajwid review.
- The source and permission permit public hosting, streaming, browser caching, explicit offline download, and redistribution.
- Every file has an immutable versioned path, correct MIME type, exact byte size, duration, and SHA-256 checksum.
- The asset and every required variant are marked `approved` in the manifest.
- Every category instance is mapped explicitly in `audioAssignments.ts`.
- `pnpm validate:audio`, `pnpm report:audio -- --write`, `pnpm check`, and browser QA pass.

If any condition is uncertain, leave the item unassigned. Reading and counting must continue without audio.

## How the model fits together

```text
category instance (Zikr.id)
        |
        | exact assignment
        v
canonical audio asset (AudioAsset.id)
        |
        +-- ordered segment(s): one du'a or one/more ayahs
        |       |
        |       +-- approved recording variant(s) by voice
        |
        +-- source, licence, review, version, and transcript metadata
```

- `Zikr.id` identifies one appearance in a category.
- `canonicalKey` identifies identical Arabic wording shared across categories.
- `AudioAsset.id` identifies the reusable logical recording.
- `AudioSegment` preserves order, especially for Qur'anic verse ranges.
- `AudioVariant` is one voice's delivery file for one segment.
- `AudioSourceRecord` holds the rights and public attribution for those bytes.

Never create one physical recording per screen. Identical canonical wording reuses one asset; different morning/evening wording gets different assets.

The files of record are:

- `src/app/audio/audioManifest.ts` — sources, assets, segments, variants, and manifest version.
- `src/app/audio/audioAssignments.ts` — production-approved instance-to-asset mappings.
- `src/app/audio/audioTypes.ts` — schema.
- `src/app/audio/audioReviewCandidates.ts` — non-production Qur'an review requirements.
- `scripts/validate-audio-manifest.mjs` — build and remote-host validation.
- `scripts/generate-audio-mapping-report.mjs` — current coverage and unmatched content.

## Recommended production standard

These are project defaults, not permission to process a recording until it sounds natural and passes human review.

| Stage          | Standard                                                                                                                                                  |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Room           | Quiet, non-reverberant, no fan/traffic noise, phone vibration, or electrical hum                                                                          |
| Microphone     | One consistent cardioid microphone, pop filter, fixed mount, 15–20 cm from the speaker                                                                    |
| Capture        | Mono PCM WAV, 48 kHz, 24-bit; preserve the untouched master                                                                                               |
| Input level    | Normal speech peaks roughly between -12 and -6 dBFS; never clip                                                                                           |
| Performance    | Calm, consistent pace; exact approved Arabic; natural pauses only                                                                                         |
| Processing     | Remove clicks and intrusive noise conservatively; avoid audible gating, reverb, pitch correction, or aggressive compression                               |
| Loudness       | Measure every file consistently. Suggested app target: -18 LUFS integrated, no higher than -1.5 dBTP true peak, then confirm by ear across the collection |
| Delivery       | MP3, mono, 48 kHz, 96 kbit/s CBR, no artwork or unnecessary metadata                                                                                      |
| Master archive | Original WAV, edited lossless master, final transcript, session log, release, and review record                                                           |

MP3 remains supported by all major browsers. Opus can reduce file size, but the current manifest accepts MP3 or Ogg and the player resolves one chosen variant rather than HTML `<source>` fallbacks. Use one high-quality MP3 delivery file now; add another format only after measuring a real need and extending format selection and tests.

EBU R128 defines a measurement method and a broadcast target of -23 LUFS. Azkarapp's suggested -18 LUFS is a deliberate, more audible mobile spoken-word target, not an EBU conformance claim. The important product rule is stable perceived loudness without clipping or audible pumping.

## Recording session workflow

### 1. Select one canonical item

Generate the current inventory:

```bash
pnpm report:audio -- --write
```

Choose one `canonicalKey` from `docs/audio/generated-mapping-report.md`. Find every `Zikr.id` sharing that key. Confirm that all instances have identical normalized Arabic; never merge text merely because its meaning is similar.

Freeze a recording sheet containing:

```text
Asset ID:
Canonical key:
All Zikr instance IDs:
Arabic transcript copied from the application:
Content kind: Qur'an / du'a
Expected Qur'an range, if any:
Basmalah or seeking-refuge scope:
Prescribed repetition count:
Speaker/reciter:
Reviewer:
Date and take numbers:
```

Do not edit religious text as part of audio onboarding. If the application copy is suspect, stop and send it through the separate content-review process first.

### 2. Record the item once

For a non-Qur'anic du'a, record the canonical wording once even if the prescribed count is 3, 10, 33, or 100. The player models repetition. Never bake the count into the file.

For Qur'an:

- Record and review the complete required range.
- Prefer one delivery segment per ayah. This makes range validation, retry, replacement, and reviewer notes precise.
- Keep one reciter across all segments of a playable variant.
- Do not add an introduction, translation, surah announcement, or closing phrase.
- Decide the basmalah and seeking-refuge scope before recording; see the project-specific blocker below.

Record multiple takes without destructive editing. Name raw takes with the date and take number; do not use raw filenames as production URLs.

### 3. Edit from a copy

Keep the capture master unchanged. On a separate edited master:

1. Select the best complete take.
2. Remove false starts and excessive leading/trailing silence.
3. Repair isolated clicks manually.
4. Apply only enough high-pass filtering or noise reduction to remove a demonstrated problem.
5. Use light dynamics control only if needed for intelligibility.
6. Measure loudness and true peak.
7. Listen from beginning to end after processing; processing must not alter consonants, breaths, or tajwid.

Do not remove every breath, use synthetic room tone, add music/effects, or generate sacred recitation with text-to-speech.

### 4. Export the delivery file

With FFmpeg installed, a conservative mono MP3 export is:

```bash
ffmpeg -i edited-master.wav -map_metadata -1 -vn -ac 1 -ar 48000 -c:a libmp3lame -b:a 96k output.mp3
```

Measure loudness without changing the file:

```bash
ffmpeg -i output.mp3 -filter_complex ebur128=peak=true -f null -
```

If loudness correction is necessary, use FFmpeg's two-pass `loudnorm` workflow and re-review the result by ear. Do not repeatedly normalize lossy exports; always re-export from the lossless edited master.

### 5. Perform technical QC

Listen to the final delivery bytes, not only the WAV master. Check:

- First and last phoneme are intact.
- No clipping, distortion, plosive overload, metallic noise reduction, channel imbalance, or accidental silence.
- No unrelated speech, notifications, edits from another take, or embedded repetitions.
- Loudness is comfortable beside at least three already-approved assets.
- Duration and waveform agree with what was reviewed.

Use headphones, a phone speaker, and a low-volume test. Keep the exact accepted delivery file frozen after review.

## File naming and immutable versions

Use lowercase ASCII, hyphens, and stable semantic paths:

```text
dua/<canonical-key>/<voice-id>/v1/<canonical-key>.mp3
quran/<surah>/<ayah-or-range>/<reciter-id>/v1/<segment-id>.mp3
```

Examples:

```text
dua/sayyid-al-istighfar/voice-ahmed/v1/sayyid-al-istighfar.mp3
quran/002/285-286/reciter-ahmed/v1/002-285.mp3
quran/002/285-286/reciter-ahmed/v1/002-286.mp3
```

When any byte changes, publish `v2` (or a content-hashed filename), update the asset version and metadata, and run review again. Never overwrite `v1`. Immutable URLs permit long-lived caching without serving mixed versions.

## Collect exact metadata

On Windows PowerShell:

```powershell
$audioFile = Get-Item -LiteralPath '.\output.mp3'
$audioFile.Length
(Get-FileHash -Algorithm SHA256 -LiteralPath $audioFile.FullName).Hash.ToLowerInvariant()
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $audioFile.FullName
```

Convert duration seconds to an integer `durationMs` only after inspecting the result. `byteSize` is the exact file length. The checksum must contain exactly 64 hexadecimal characters.

Also verify the encoded stream:

```bash
ffprobe -v error -show_entries stream=codec_name,sample_rate,channels,bit_rate -of json output.mp3
```

The manifest's Arabic fingerprint is not a file checksum. Derive it in code from the exact transcript with `createArabicTextFingerprint`; use SHA-256 for delivery bytes.

## Rights and attribution

Owning the microphone or paying a speaker does not automatically document all distribution rights. Keep a signed contributor release or licence record that covers:

- The exact speaker and recorded session.
- Worldwide public reproduction and distribution.
- Hosting, streaming, CDN caching, and explicit offline downloads.
- Technical editing, segmentation, encoding, loudness adjustment, and format conversion.
- Whether commercial use is permitted.
- Required public credit and the approved display name.
- Duration of permission and what happens if a takedown is requested.

For an in-house recording, a source record can look like:

```ts
"azkarapp-studio-2026": {
  id: "azkarapp-studio-2026",
  name: "Azkarapp Studio",
  attribution: "Recitation by Ahmed Mahdy for Azkarapp",
  licenseName: "Azkarapp contributor release v1",
  licenseEvidence: "internal:audio-releases/voice-ahmed-2026-08-01.pdf",
  notes: "Original session masters and signed release retained privately.",
}
```

Do not commit private identity documents or signatures. Commit only the durable evidence reference and public attribution; retain the actual agreement in access-controlled storage. Have legal counsel review the release wording for the jurisdictions and distribution model involved.

For third-party recordings, “free,” “downloadable,” a YouTube upload, or an API endpoint is not a licence. Preserve the licence version, source URL, author/reciter, download date, original filename, and a durable copy of the evidence. Confirm that editing and offline redistribution are allowed. Treat a trimmed or processed Creative Commons file as an adaptation and follow its attribution/share-alike requirements unless counsel confirms otherwise.

## Publish to the audio host

Use object storage plus a CDN or another stable public host. Do not put large audio files into the application JavaScript bundle and do not hotlink an upstream provider.

Every production response should have:

```text
HTTPS
Content-Type: audio/mpeg
Content-Length: <exact bytes>
Accept-Ranges: bytes
Access-Control-Allow-Origin: https://amahdy59.github.io
Cache-Control: public, max-age=31536000, immutable
```

`Access-Control-Allow-Origin: *` is also acceptable for truly public, credential-free audio. Allow `GET`, `HEAD`, and the `Range` request header. A range probe should return `206 Partial Content` and a correct `Content-Range`; a normal complete fetch should return `200`.

Check a published file on Windows:

```powershell
curl.exe -I 'https://audio.example.com/dua/example/voice/v1/example.mp3'
curl.exe -sS -D - -o NUL -H 'Origin: https://amahdy59.github.io' -H 'Range: bytes=0-0' 'https://audio.example.com/dua/example/voice/v1/example.mp3'
```

Do not use expiring signed URLs in the static manifest. Do not compress MP3 responses again at the CDN. If a Content Security Policy is introduced, permit the audio origin in both `media-src` and `connect-src`; offline download uses `fetch()`.

### Supabase Storage as the audio host

Google Drive is suitable for private master-file backup or reviewer handoff, but it is not the production audio origin. Drive sharing links are document/download flows rather than one stable public asset base with controlled object paths, response metadata, CORS, cache headers, and unauthenticated browser range requests. Keep WAV masters in Drive if useful; publish the reviewed MP3 delivery files to the project's Supabase Storage bucket.

Supabase is the chosen host for this project. It satisfies the requirements above
without a separate CDN, and it survives the eventual Flutter/Play Store port
because the files are served over plain public HTTPS rather than through any
web-only mechanism.

Create one **public** bucket named `audio`. Public matters: the manifest is
static and must not carry expiring signed URLs, so the objects have to be
readable without a token. Nothing private belongs in this bucket.

Supabase serves public objects from a fixed prefix. The project reference is
recorded in [docs/SUPABASE_SETUP.md](../SUPABASE_SETUP.md), so the base URL is:

```text
VITE_AUDIO_BASE_URL=https://vanjwanmnusgnavzzzpz.supabase.co/storage/v1/object/public/audio
```

Object keys inside the bucket are exactly the `relativePath` values in the
manifest, so the layout mirrors the naming scheme in _File naming and immutable
versions_:

```text
<content-kind>/<asset-id>/<voice-id>/v<n>/<asset-id>.<ext>
dua/morning-asbahna/muhammad-moataz/v1/morning-asbahna.m4a
quran/ayat-al-kursi/muhammad-moataz/v1/ayat-al-kursi.m4a
```

`<voice-id>` is the stable id from `src/app/audio/audioVoices.ts`
(`abdullah-muhammad`, `muhammad-alshara`, `muhammad-moataz`) — never the display
name, which is localized and may be re-worded.

Set the object metadata on upload; Supabase does not infer a usable
`Cache-Control` on its own. Because every path carries an immutable `v<n>`,
long-lived caching is safe:

```bash
supabase storage cp ./morning-asbahna.m4a   ss:///audio/dua/morning-asbahna/muhammad-moataz/v1/morning-asbahna.m4a   --content-type audio/mp4   --cache-control "public, max-age=31536000, immutable"
```

Supabase Storage already returns `Accept-Ranges: bytes`, answers `Range` probes
with `206`, and sends `Access-Control-Allow-Origin: *` for public buckets, so
the verification commands in the previous section apply unchanged. Run them
against a real uploaded object before marking anything `approved` — the
manifest validator fetches each variant and compares byte size, checksum, and
`Content-Type` against the record.

Note on format: recordings delivered as `.mp4`/`.m4a` are AAC and must be
declared `audio/mp4`, which `AudioVariant["mimeType"]` accepts alongside
`audio/mpeg` and `audio/ogg`. Do not relabel an AAC file as `audio/mpeg` to make
it fit — the validator compares the served `Content-Type` and will reject it.

## Configure Azkarapp

For local development, add to `.env.local`:

```dotenv
VITE_AUDIO_BASE_URL=https://audio.example.com/azkar
```

Do not include a trailing file path. Relative manifest paths are appended to this URL.

For GitHub Pages, create the repository Actions variable `VITE_AUDIO_BASE_URL` under **Settings → Secrets and variables → Actions → Variables**. It is a public URL, not a secret. The variable must be present during both validation and the final Vite build.

Important current repository check: `.github/workflows/quality.yml` passes this variable to `pnpm check`, and the Pages build passes it to `pnpm build:pages`; before the first approved asset, also pass it to the Pages workflow's **Verify quality gates** step because that step runs `pnpm check` separately.

## Add a pending manifest record

Do not start by editing `audioAssignments.ts`. First add the source and a complete pending asset to `audioManifest.ts`.

This illustrates one non-Qur'anic asset. Replace every example value with reviewed data copied from the application and measured from the delivery file:

```ts
import { createArabicTextFingerprint } from "./arabicMatching";

const SAYYID_AL_ISTIGHFAR_ARABIC = `COPY THE EXACT APPLICATION ARABIC HERE`;

export const AUDIO_SOURCES: Readonly<Record<string, AudioSourceRecord>> = Object.freeze({
  "azkarapp-studio-2026": {
    id: "azkarapp-studio-2026",
    name: "Azkarapp Studio",
    attribution: "Recitation by Ahmed Mahdy for Azkarapp",
    licenseName: "Azkarapp contributor release v1",
    licenseEvidence: "internal:audio-releases/voice-ahmed-2026-08-01.pdf",
  },
});

export const AUDIO_ASSETS: Readonly<Record<string, AudioAsset>> = Object.freeze({
  "dua-sayyid-al-istighfar": {
    id: "dua-sayyid-al-istighfar",
    titleArabic: "سَيِّدُ الِاسْتِغْفَارِ",
    titleEnglish: "Sayyid al-Istighfar",
    contentKind: "dua",
    kind: "single",
    canonicalArabicText: SAYYID_AL_ISTIGHFAR_ARABIC,
    normalizedTextHash: createArabicTextFingerprint(SAYYID_AL_ISTIGHFAR_ARABIC),
    segments: [
      {
        id: "dua-sayyid-al-istighfar",
        order: 1,
        transcriptArabic: SAYYID_AL_ISTIGHFAR_ARABIC,
        normalizedTranscriptHash: createArabicTextFingerprint(SAYYID_AL_ISTIGHFAR_ARABIC),
        variants: [
          {
            id: "dua-sayyid-al-istighfar-voice-ahmed-v1",
            voiceId: "voice-ahmed",
            voiceName: "Ahmed Mahdy",
            relativePath: "dua/sayyid-al-istighfar/voice-ahmed/v1/sayyid-al-istighfar.mp3",
            mimeType: "audio/mpeg",
            durationMs: 27410,
            byteSize: 329123,
            sha256: "REPLACE_WITH_64_LOWERCASE_HEX_CHARACTERS",
            sourceId: "azkarapp-studio-2026",
            reviewStatus: "pending",
          },
        ],
      },
    ],
    defaultVoiceId: "voice-ahmed",
    reviewStatus: "pending",
    reviewNotes: "Awaiting independent transcript and pronunciation review.",
    version: 1,
  },
});
```

Pending assets must contain real, complete metadata; `pending` is not permission to use placeholders. Keep `APPROVED_AUDIO_ASSIGNMENTS` unchanged while review is pending.

For a Qur'anic sequence:

- Set `contentKind: "quran"` and `kind: "sequence"`.
- Set `requiredQuranRange` to the exact surah and ayah range.
- Add contiguous segments with `order: 1, 2, ...`.
- Add the exact `quranReference` to each segment.
- Ensure one `voiceId` has an approved variant on every segment.
- Ensure the ordered segment transcripts fingerprint to the application's complete `arabicText`.

Never use placeholder Arabic or copy transliteration into the manifest.

## Human review and approval

Start the app with the same base URL and open the development-only review screen:

```bash
pnpm dev
```

Then open:

```text
http://localhost:5173/?audio-review=1
```

For each instance, the reviewer must compare the displayed Arabic, canonical transcript, asset identity, source, voice, duration, and complete recording. Automated normalized matching removes formatting distinctions only; it cannot hear omissions or approve religious content.

Use this sign-off record:

```text
Asset and variant IDs:
Exact delivery-file SHA-256:
All assigned Zikr IDs:
Transcript exact: yes/no
No extra or missing speech: yes/no
Pronunciation approved: yes/no
Qur'an range and tajwid approved, if applicable: yes/no
Basmalah/seeking-refuge scope approved: yes/no
Technical quality approved: yes/no
Rights evidence verified: yes/no
Reviewer full name:
Reviewer qualification/role:
Reviewed UTC timestamp:
Notes and required corrections:
Decision: approved / rejected / needs new recording
```

Local review-screen notes do not activate production audio. After approval:

1. Change every approved delivery variant to `reviewStatus: "approved"`.
2. Change the asset to `reviewStatus: "approved"`.
3. Add `reviewedBy`, an ISO-8601 `reviewedAt`, and useful `reviewNotes`.
4. Add every exact category instance to `APPROVED_AUDIO_ASSIGNMENTS`.
5. Increment `AUDIO_MANIFEST_VERSION` when introducing or replacing production bytes so offline cache ownership stays explicit.

Example assignment reuse:

```ts
export const APPROVED_AUDIO_ASSIGNMENTS = Object.freeze({
  "m-hm-75": "quran-002-255",
  "e-hm-75": "quran-002-255",
  "s-hm-100": "quran-002-255",
  "ap-ref-9": "quran-002-255",
});
```

The content finalization layer derives each `Zikr.audioAssetId` from this registry. Do not add a second URL or heuristic mapping to the content files.

## Adding another voice or reciter

Add a voice only when it covers the same exact transcript:

1. Add its source/rights record if different.
2. Add one variant with the new `voiceId` to every segment of the asset.
3. Keep all new variants pending through independent review.
4. Approve the voice only when it covers every segment.
5. Keep `defaultVoiceId` on a fully approved voice.

The selector appears only when the current asset has multiple complete approved voices. Never label bytes with another reciter's name and never mix reciters inside one voice sequence.

## Validation and release

Run in this order:

```bash
pnpm validate:audio
pnpm report:audio -- --write
pnpm check
pnpm test:e2e
```

With approved assets, `pnpm validate:audio` also probes every approved URL using `VITE_AUDIO_BASE_URL`. It verifies HTTP status, MIME type, and the presence of a CORS header. The app's explicit downloader performs the stronger full-file byte-size and SHA-256 verification.

Review the generated report rather than only its exit code. Confirm:

- Expected mappings increased by the intended number of category instances.
- Shared canonical content points to one asset.
- No unexpected unmatched item disappeared.
- No duplicate path, Qur'an range, licence, or URL warning exists.

Before production:

- Test single play and Play All with complete and partial coverage.
- Test Retry, Skip, Stop, seek, rate, voice switching, and navigation while paused/playing.
- Test offline downloaded and uncached states.
- Test Chromium, Firefox, and WebKit on desktop and at least one real iOS and Android device.
- Test Bluetooth/headphone disconnect, lock/unlock, background/foreground, interruption by another app/call, slow network, and an intentionally broken URL.
- Test keyboard operation, visible focus, screen-reader names/live announcements, Arabic RTL, English LTR, narrow width, and 200%/400% zoom.
- Confirm audio completion never increments the spiritual recitation counter.
- Confirm the player shows the correct source and attribution for the bytes being played.

No audio starts on page load. Browsers may reject `HTMLMediaElement.play()` without a user gesture; the controller must continue handling that rejected promise as `playback-blocked` and offer an explicit retry.

## Replacing or withdrawing a recording

To replace approved bytes:

1. Export and review a new delivery file from a lossless master.
2. Publish it under a new immutable `vN` path.
3. Update duration, size, SHA-256, variant ID, asset version, and manifest version.
4. Record a fresh human approval tied to the new checksum.
5. Run the complete release workflow.
6. Keep the old object during a rollback window; do not mutate it.

For an urgent content or rights concern:

1. Remove only the affected assignments immediately.
2. Increment the manifest version if downloaded copies must be invalidated.
3. Redeploy and confirm the app reports honest reduced coverage.
4. Investigate offline storage and CDN purge requirements without reusing the old URL.
5. Add a corrected version only after full review.

Never restore heuristic or nearest-match fallback behavior to preserve coverage.

## Current project-specific gates

Resolve these before the first applicable production release:

1. **Basmalah and seeking-refuge scope:** the UI may render these as separate prelude text while the asset fingerprint currently compares only `zikr.arabicText`. Do not approve a recording containing an audible prelude that is absent from `canonicalArabicText`, and do not omit it from the transcript to force a match. Either export exact-scope bytes or extend the content/manifest model and validator through reviewed code changes.
2. **Pending non-Qur'an review linkage:** the current review candidate registry models required Qur'anic ranges. Do not place pending du'a mappings in `APPROVED_AUDIO_ASSIGNMENTS`; extend a separate non-production candidate registry before relying on the in-app review screen for du'a intake.
3. **Pages validation environment:** pass `VITE_AUDIO_BASE_URL` to the Pages workflow's `pnpm check` step as well as its build step once approved assets exist.
4. **Public credits:** the floating player shows the selected source and attribution. Before a large catalogue launch, add a searchable Audio Credits view if licences or contributor expectations require persistent consolidated credits.

These gates are not reasons to weaken validation. Until resolved, the affected audio remains unavailable.

## Operational quality targets

Track these after launch without collecting listening history tied to a person:

- Playback-start success rate by browser family and audio error code.
- Median time from user Play to `playing`.
- Buffering and retry rate by asset/variant ID.
- Checksum/download failures.
- Total and per-collection download size.
- Content corrections, rights requests, and mean time to disable an affected mapping.

Do not log the user's profile, recitation counter, private settings, or full URLs containing credentials. Alert on a sudden rise in `network`, `cors`, `decode`, or `metadata-timeout` failures.

Media Session integration may later add lock-screen and hardware play/pause/seek controls, but it is progressive enhancement with incomplete feature support. It must route through the existing controller and must never become required for core playback.

## External standards and current browser guidance

- [MDN web audio codec guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Audio_codecs) — browser codec support and format selection.
- [MDN autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay) and [`HTMLMediaElement.play()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play) — user activation and rejected play promises.
- [MDN cross-browser audio basics](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Audio_and_video_delivery/Cross-browser_audio_basics) — preload and media behavior.
- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) and [audio-only alternatives](https://www.w3.org/WAI/WCAG21/Understanding/audio-only-and-video-only-prerecorded) — focus, control targets, and equivalent visible text.
- [MDN CORS guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS) — cross-origin `fetch()` requirements.
- [RFC 9110 range requests](https://www.rfc-editor.org/rfc/rfc9110.html#name-range-requests) — byte-range semantics.
- [RFC 8246 immutable responses](https://www.rfc-editor.org/rfc/rfc8246.html) — versioned URLs and long-lived immutable caching.
- [EBU R128](https://tech.ebu.ch/publications/r128) and [FFmpeg audio filters](https://ffmpeg.org/ffmpeg-filters.html#loudnorm) — loudness measurement and normalization tooling.
- [MDN Media Session API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API) — optional OS-level media controls and compatibility limits.

## Related repository documents

- [Architecture](architecture.md)
- [Content mapping](content-mapping.md)
- [Content review workflow](content-review-workflow.md)
- [Recording guidelines](recording-guidelines.md)
- [Licensing and attribution](licensing-and-attribution.md)
- [Offline caching](offline-caching.md)
- [Testing and QA](testing-and-qa.md)
- [Troubleshooting](troubleshooting.md)
- [Explicit asset registry decision](../adr/001-explicit-audio-asset-registry.md)
