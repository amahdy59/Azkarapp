# Phase 83 — Mushaf spacing and Al-Baqarah audio

## Objective

Apply the owner's correction that facing pages must retain printed word spacing, and provide Al-Baqarah recitation in the right toolbar.

## Scope and components

MushafPageViewer lines respect their fitted text measure independently of equal page frames. Flex layout centers natural glyph advances instead of distributing unused canvas width between words. QCF typography and all fifteen reviewed slots remain intact; Unicode fallback remains available when the page font is unavailable.

KhatmahReaderScreen receives the existing shared audio control from App for Al-Baqarah. It uses the approved `ir-baqarah`/`quran-002` assignment and the single AudioProvider. The toolbar starts a complete Arabic recitation, pauses and resumes its current time. It does not estimate verse boundaries or change the Mushaf reading position. No recording, reviewed text, attribution or progress schema changes.

## Accessibility and tests

The native toolbar button reuses localized listen/pause labels, loading state, keyboard focus and touch-target semantics. Unit tests verify controller forwarding and natural spacing. Browser tests measure word gaps and verify start/pause/resume without resetting playback time.

## Commands and evidence

Results are recorded in the release response. The phase uses targeted Mushaf/audio browser suites plus the complete non-browser and enforced release gates; the final CI commit runs the full browser suite.

## Documentation and risks

Audio architecture, design system and agent index are updated. Fallback typography cannot exactly reproduce the page-specific QCF font's glyph artwork. Physical-device typography and assistive-technology review remain manual.

## Recommended next step

Review the deployed pages with both cached QCF fonts and a slow initial font request.
