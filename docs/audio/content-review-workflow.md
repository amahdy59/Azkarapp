# Content review workflow

## Owner-authorized automated expansion — 2026-11-26

For the current phase only, the owner explicitly replaces the human-listening/confirmation activation gate with automated source-transcript, full-range, byte identity, duration, complete decoding and hosted-integrity checks. [Expanded-library evidence](expanded-library/README.md) identifies the exact enabled files and rejected candidates. Source permissions, immutable hosting, explicit normalized assignments, default preservation and exact-checksum timing boundaries remain. `approved` records publication eligibility under this owner decision, not completed human or scholarly review. No old rejected recording is relabelled. The historical workflow below remains the normal review process outside this explicit phase.

1. Start the development app and open `?audio-review=1`.
2. Compare the displayed Arabic, source transcript, canonical key, asset ID, source, voice, duration, and normalized-match result.
3. Listen with headphones to every segment in order. Automated matching is only a hint.
4. Record notes as Unreviewed, Manually reviewed, Approved in review notes, Rejected, or Needs new recording.
5. A qualified reviewer independently confirms exact wording, pronunciation, complete Qur'anic ranges, and the absence of extra introductions, translations, explanations, omissions, or embedded repetition.
6. Transfer the signed-off decision into reviewed manifest metadata (`reviewedBy`, `reviewedAt`, notes) and the exact assignment registry through code review.

Local review-screen decisions never enable production playback. Only a schema-valid approved manifest plus an exact assignment can do so.

The [OpenDua additional-voice pilot](opendua-pilot/README.md) provides pinned comparisons through the same development-only entry, with `&audio-source=opendua`. Saved review-screen notes never activate recordings. On 2026-11-26 the owner confirmed listening to the three samples and explicitly accepted them as a second option; [activation.json](opendua-pilot/activation.json) records that exact scope and identity. This owner decision supersedes their activation hold without asserting an independent scholarly qualification. The three variants carry dated review metadata and retain current defaults; hosted immutable bytes are verified separately. Production builds continue excluding review screens, the source catalogue and bundled MP3s. Further recordings still need their own listening/coverage review and immutable hosting.
