# Additional audio voices — OpenDua pilot, 2026-11-25

## Approved objective

The owner approves the recommendations in this chat: add optional recording variations while preserving all existing hosted audio and playback defaults. Begin with a small OpenDua pilot; Al Quran Cloud remains pending permission covering self-hosting, offline downloads and file export. Preserve the independent local work and publication hold recorded in the decision log.

## Plan before editing

1. Prepare three explicit, exact-text OpenDua candidates for existing single-segment Arabic assets. Retain source/version, licence evidence, original bytes, SHA-256 and measured duration. Do not replace devotional text or infer mappings from IDs.
2. Extend the development-only audio review flow to compare current and candidate recordings, show source credits and exact transcript checks, and save recording-specific review notes. Pending candidates must never become production assignments or selectable production voices. Export review evidence for independent Arabic listening review.
3. Keep current catalogue identities, defaults, versions, hosted paths, bytes and timing annotations intact. Correct the confirmed Qur'an voice-selection write to the unrelated du'a preference. Add regression tests for pending-variant exclusion, unchanged legacy resolution, independent preferences and preservation of old downloaded variants.
4. Run targeted unit/browser checks, the complete non-browser quality gate and Pages build. Verify the production build excludes pilot recordings and review-only source data. Produce actual local review evidence and a structured report.
5. Hand off the concrete recordings for the independent listening/pronunciation review required by docs/audio/content-review-workflow.md. Activation and immutable uploads follow that evidence; neither owner implementation approval nor an automated text match is a human recording approval.

## Boundaries

No production recording activation, changed default, automatic fallback policy change, catalogue/cache version bump, timing reuse, religious-content edit or dependency. The current cache migration already preserves unchanged assets; verify it rather than replace it. No external Al Quran Cloud URLs enter production. This audio session does not commit or deploy; the owner's subsequent coordinating release chat may include verified production-safe changes after aggregate gates, while pending recordings remain excluded.

## Completed review checkpoint

The three original recordings, source catalogue, licence snapshot, checksum-bound review/export UI and independent voice-preference repair are complete locally. The final focused suite passes 45 tests; 12 actual bilingual responsive scenarios pass across Chromium/Firefox/WebKit with protected menu hit testing, keyboard recovery, pending export isolation and zero axe violations. An isolated Pages-mode build passes budgets and excludes all pilot media/source identities. The [phase report](../reports/ADDITIONAL_AUDIO_PILOT_2026_11_25_REPORT.md) records evidence and the coordinated release handoff. Independent Arabic listening review remains pending; no additional production voice has been enabled.
