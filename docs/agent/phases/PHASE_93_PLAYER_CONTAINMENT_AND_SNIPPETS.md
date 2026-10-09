# Phase 93 — player containment, playback Benefit and Mushaf excerpts

## Authorized plan

The owner reports clipped player controls and absent surah Benefit during playback, and asks whether short Quran passages can use actual Mushaf excerpts. Reproduce short-phone/safe-area player geometry, pass the existing Benefit action through the lazy wrapper correctly, display it in compact and expanded playback for all long surahs, and keep every transport control reachable through safe insets and scrolling when needed.

Reuse canonical shipped Mushaf word/line/glyph data for exact verse excerpts, preserving semantic word identities and accessible reviewed text. No screenshots or raster crops, inferred layout, religious wording changes, altered recordings or timing guesses. Keep ordinary and English devotional text on existing accessible renderers. Preserve the owner's separate uncommitted audio-layout phase.

Update targeted integration/browser tests, verify short and enlarged screens and RTL/LTR, run normal local/CI release gates, and report production evidence. Do not weaken geometry assertions or bundle ceilings.

## Owner correction and follow-on plan — 2026-10-09

The owner clarifies that Benefit belongs to the reading screen and must not be inside the audio player. This supersedes the initial phase 93 playback-Benefit request: remove player Benefit, retain close-focus restoration, and put the full-surah Benefit action directly below the three landing actions with the same bulb used elsewhere. Remove all redundant audio and sharing actions from Reader overflow; keep audio behavior in the player/main controls. Inspect and update affected regression assertions without removing functional coverage.

The owner additionally requests portrait/square ayah image sharing with optional word meanings and English translation. Build this as a separate scoped phase, reusing reviewed Quran text/meanings and explicitly verse-numbered existing Pickthall translations. No new translations or inferred verse boundaries. Provide a preview, keyboard-accessible options and share/download fallbacks; paginate long content rather than truncating or shrinking it beyond readability.

## Local implementation evidence

- Player grid permits the reading track to shrink and retains safe-area/native scrolling for transport controls.
- Exact complete excerpts cover Ayah Al-Kursi, the last two Al-Baqarah verses, Al-Kafirun, Al-Ikhlas, Al-Falaq and An-Nas. Canonical original line/token data is reused; mismatching or unavailable excerpts retain readable text.
- Benefit placement follows the later phase 95 correction, exclusively in reading. Close returns keyboard focus to the reading action.
- Targeted Chromium playback and excerpt tests passed. Cross-engine and complete release verification are recorded in the final phase report.
