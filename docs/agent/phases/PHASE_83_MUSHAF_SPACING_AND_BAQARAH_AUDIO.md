# Phase 83 — Mushaf spacing and Al-Baqarah audio

## Objective

Apply the owner's correction that facing pages must retain printed word spacing, and provide Al-Baqarah recitation in the right toolbar.

## Scope and components

MushafPageViewer lines respect their fitted text measure independently of equal page frames. Flex layout centers natural glyph advances instead of distributing unused canvas width between words. QCF typography and all fifteen reviewed slots remain intact; Unicode fallback remains available when the page font is unavailable.

KhatmahReaderScreen receives the existing shared audio control from App for Al-Baqarah. It uses the approved `ir-baqarah`/`quran-002` assignment and the single AudioProvider. The toolbar starts a complete Arabic recitation, pauses and resumes its current time. It does not estimate verse boundaries or change the Mushaf reading position. No recording, reviewed text, attribution or progress schema changes.

## Accessibility and tests

The native toolbar button reuses localized listen/pause labels, loading state, keyboard focus and touch-target semantics. Unit tests verify controller forwarding and natural spacing. Browser tests measure word gaps and verify start/pause/resume without resetting playback time.

## Commands and evidence

| Command                                                                              | Result                                       |
| ------------------------------------------------------------------------------------ | -------------------------------------------- |
| Focused component Vitest (Mushaf, Khatmah, background and initial maintenance tests) | 66 passed                                    |
| Focused Chromium Mushaf/Home/audio browser suites                                    | 12 passed                                    |
| Facing-spread/Baqarah/performance browser matrix                                     | 7 passed across Chromium, Firefox and WebKit |
| Earlier complete non-browser gate after spacing/audio/photo changes                  | Passed all 11 stages                         |

The L shortcut invokes the same Baqarah controller as the native toolbar button. Wide screenshots at 1600×834 and 1920×1080 are in `output/playwright/mushaf-<project>-<width>.png`; the Chromium 1600 image was visually inspected. Browser fixtures include Unicode fallback, so this is geometry/spacing evidence rather than a certification of printed artwork. Complete release-gate and deployment results are in the final release report.

A separate browser capture loaded actual remote QCF fonts for pages 41 and 42, verified both rendering attributes as qcf-v2, and saved `output/playwright/mushaf-real-qcf-1600.png`. Visual inspection confirms the primary-font appearance and natural spacing; the earlier fallback screenshot uses Amiri Quran and is not the primary-font reference.

## Documentation and risks

Audio architecture, design system and agent index are updated. Fallback typography cannot exactly reproduce the page-specific QCF font's glyph artwork. Physical-device typography and assistive-technology review remain manual.

## Recommended next step

Review the deployed pages with both cached QCF fonts and a slow initial font request.
