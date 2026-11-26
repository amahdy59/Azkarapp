# OpenDua additional-voice review pilot

Prepared on 2026-11-25 as pending intake. On 2026-11-26 the owner confirmed listening to all three and accepted them as a second option. The checksum-bound [acceptance record](activation.json) supersedes the original pending-activation status. The three variants are now registered under optional Muhammad Jumah with immutable hosting and CC BY 4.0 credits. Existing recordings, assignments, defaults, timings, asset versions and download-cache version remain unchanged. The original pilot/measurements below retain their historical pending status; they are intake evidence, not the activation record.

## Review the actual recordings

1. Start the existing development server with `pnpm dev`.
2. Open `/?audio-review=1&audio-source=opendua` on its local URL. The review follows the app's Arabic/English setting.
3. Choose a sample and compare Current recording with Muhammad Jumah · OpenDua. The latter plays the retained local original MP3, rather than a third-party live URL. Current recording uses its existing hosted URL and normally requires connectivity in development.
4. Check every word, pronunciation, full boundaries, additions/omissions and embedded repetitions with headphones. The normalized text match is only an intake check. Each sample is intended to contain one recitation; that still needs independent listening confirmation.
5. Enter the qualified reviewer's name and recording-specific notes, then select the listening result. Export all review notes. Findings are stored separately by SHA-256 on this development origin; they never approve a production recording or alter ordinary playback preferences/downloads.

The pilot covers `wu-hm-3` (praise upon waking), `friday-dua-22` (forgiveness for every sin) and `m-hm-91` (Subhan Allah wa bihamdih). Their source catalogue text matches the existing single-segment app text after the existing formatting normalization. Reviewed app wording and prescribed counts are unchanged.

## Retained source evidence

- `pilot.json`: explicit app/segment/source recording identities, original URLs, sizes, SHA-256 values, declared source durations and proposed immutable hosting keys.
- `catalogue.json`: byte-identical OpenDua v0.0.4 catalogue; its checksum is pinned in the pilot.
- `audio-licence.html`: byte-identical source audio licence snapshot; its checksum is pinned in the pilot. It states CC BY 4.0, with attribution to Muhammad Jumah for OpenDua. Future activation must retain this attribution in the source registry and consolidated About credits.
- `media/OD-003.mp3`, `OD-046.mp3`, `OD-254.mp3`: original, unmodified OpenDua audio v0.0.2 files (305,256 bytes combined).
- `measurements.json`: automated browser metadata/playback evidence tied to the same recording checksums. These measurements establish that the files load and play; they are neither human listening review nor final production authoring metadata. Obtain the existing authoring workflow's exact duration measurement before activating variants.

Run `node scripts/prepare-opendua-pilot.mjs` to verify/retrieve the pinned intake. It rejects a changed upstream response instead of replacing retained evidence or media. It does not upload files, change the live catalogue or enable a voice. The two original evidence snapshots are intentionally excluded from Prettier; tests verify their exact hashes.

## Activation checkpoint — 2026-11-26

The owner accepted all three retained samples after listening. Each additive variant carries its own dated owner-review metadata; `activation.json` records the exact statement without asserting an independent scholarly qualification. `scripts/upload-opendua-audio.mjs` validates that acceptance, refuses overwrites and verifies hosted SHA-256, MIME, production CORS and byte ranges. About retains the required credit and licence link. Settings exposes the optional voice and its three-recording coverage; uncovered items retain the existing resolver fallback. The same source is eligible for Android under its explicit CC BY 4.0 permission. Source MP3s stay out of the app installation bundle.

Any later recording still requires its own review:

Follow [the content review workflow](../content-review-workflow.md). Transfer independently signed findings through code review into schema-valid variant/source metadata only after immutable hosting, exact metadata and permission checks. Retain all current assets/defaults. Add the new voice as an explicit optional selection and recheck coverage, download preservation and About attribution. Do not copy Qur'an timings between recordings.

Al Quran Cloud is outside this pilot. Confirm permission for the application's hosting, offline download and file-export behavior before implementing it. No provider permission or recording approval is inferred from implementation approval.

See [the phase report](../../agent/reports/ADDITIONAL_AUDIO_PILOT_2026_11_25_REPORT.md) for checks, actual screenshots and release handoff.
