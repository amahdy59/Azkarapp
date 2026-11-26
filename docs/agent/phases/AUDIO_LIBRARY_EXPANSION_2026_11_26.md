# Audio choices and complete book access — 2026-11-26

## Owner authority

The owner extends the consolidated-main release: improve the audio-options menu on mobile and desktop; enable Mushaf audio and open-source dua reciters without a further confirmation gate; expose all three books with PDFs. The owner will review later and explicitly requires automated checks that audio matches displayed text, without relying on human review in this phase. This supersedes the earlier publication holds for these books and additional recordings. It does not assert that deferred human review has occurred or authorize altered devotional wording, invented recordings, inferred word timings or inaccurate licensing.

## Plan before implementation

1. Inspect existing single-controller playback, exact assignment/normalization boundaries, shared protected menus and book/PDF availability. Retain the ongoing consolidation audit and inspect every completed CI failure.
2. Inventory the licensed source catalogues. Build explicit deterministic mappings from source transcripts/complete Quran ranges to the application's displayed Arabic. Pin source evidence, immutable recording checksums, durations and permission. Reject missing, mismatched, truncated or ambiguous mappings; document actual coverage and automated-verification limits.
3. Extend the existing audio registry and Mushaf entry composition without adding another audio element, remote calls in visual components, fabricated human approval or copied timing annotations. Preserve existing defaults, offline integrity, explicit download behavior and fallback recovery.
4. Simplify the audio-options hierarchy and reciter interaction with the existing shared components: opaque bounded menus, no meaningless one-choice picker, labelled controls, keyboard recovery and phone/desktop reflow including 320px/200% text.
5. Expose the three Arabic book editions and their existing PDF appearances through the normal catalogue, retaining source/draft notices and independent reading records. Preserve immutable publication bytes and verify every advertised PDF.
6. Add targeted mapping, availability, playback, persistence, menu geometry/opacity, keyboard and production-book regressions. Run relevant tests across Chromium, Firefox and WebKit, all tracked local release gates, then exact-commit Quality/Pages and production smoke.

## Release boundary

Automated source/identity/coverage checks establish the tested mapping and media behavior; they do not establish complete pronunciation or religious-source accuracy. Never label deferred human review as completed. No further owner confirmation is required for this scope. Record any unavailable source coverage explicitly rather than attaching unrelated audio or silently weakening assertions.
