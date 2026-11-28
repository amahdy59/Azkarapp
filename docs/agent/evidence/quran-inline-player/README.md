# Actual local Quran reader evidence — 2026-11-27

These are actual application screenshots, not the generated approval concepts. Tests use the repository’s canonical source words and fonts. Arabic/English, narrow/enlarged text, phone/tablet/desktop, protected geometry/opacity and keyboard recovery are automated evidence; physical-device and human assistive-technology acceptance remain separate.

| View                                                                         | Evidence                                   |
| ---------------------------------------------------------------------------- | ------------------------------------------ |
| Normal phone: one Zoom/page/meanings row and complete canonical reading area | [Phone normal](phone-normal.png)           |
| Inline enlarged portions: same page and bounded controls                     | [Phone inline zoom](phone-inline-zoom.png) |
| Concise opaque word/verse/close header and exact explanation                 | [Phone meaning](phone-meaning.png)         |
| Dark tablet meaning and page theme                                           | [Tablet](tablet-dark-meaning.png)          |
| Normal wide reading                                                          | [Desktop](desktop-normal.png)              |

The full twelve-case geometry/gloss/keyboard run passes across Chromium, Firefox and WebKit (`output/quran-reader-final-results.json`). Complete ordered word traversal and pinch recovery are also verified by `e2e/quran-enlarged-reading.spec.ts`. The legacy Focus/index suite retains Focus through More and verifies its surviving exit at 320px/200% text. The final six-case enlarged-text/hit-testing/Focus follow-up passes across all three engines (`output/quran-scaled-focus-final-results.json`).

The final six phone/desktop Quran-player cases pass across Chromium, Firefox and WebKit (`output/quran-universal-player-final-results.json`), including reference-size letters, unchanged canvas geometry when opening options, controls fitting without ordinary scrolling and nested-menu recovery. Wider universal-player and complete-check evidence belongs to the coordinated owner; see [coordination checkpoint](../../reports/QURAN_PLAYER_COORDINATION_2026_11_27.md). The selected player screenshots above show the verified centered layout and invariant geometry. The final compact zoom glyph and pairwise non-overlap at 320px/200% are separately proven across all three engines (`output/quran-scaled-glyph-final-results.json`); transparent outer footer insets recover space without shrinking capsules, labels or targets. The enlarged-meaning image shows this final correction. Publication remains held.
