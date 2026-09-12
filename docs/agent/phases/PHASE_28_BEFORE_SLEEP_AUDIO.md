# Phase 28 — Before-sleep audio

## Objective

Publish the owner-supplied revised before-sleep recordings to Cloudflare R2 and enable audio only for application entries whose complete Arabic content matches a supplied file exactly.

## Approved scope

- Preserve each supplied MP3 byte-for-byte under an immutable, versioned R2 object key.
- Record exact duration, byte size, SHA-256, reciter, source, transcript fingerprint, and public path in the audio manifest.
- Add production assignments only for exact before-sleep matches.
- Leave unmatched application entries and unrelated supplied files unassigned.
- Update focused tests, the generated mapping report, release notes, and the audio-host runbook.

## Required evidence

- Full public-object downloads match the local SHA-256 values for all approved files.
- Range requests return `206`, the expected total byte size, and `audio/mpeg`.
- The focused assignment regression and audio manifest validator pass.
- The repository's full local and deployment gates pass.
