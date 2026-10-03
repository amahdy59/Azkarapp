# Phase 78 evidence

Captured from the final local Chromium browser run on 2026-10-03 using `e2e/practical-devotional-access.spec.ts`. These screenshots are representative visual evidence, not a declaration of complete accessibility compliance.

| File                            | Scenario                                                                                                                                                   |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `home-ar-320.png`               | Arabic Home situational shortcuts, 320 CSS px.                                                                                                             |
| `focus-ar-320.png`              | Arabic ordinary-reader focus with manual count and visible exit, 320 CSS px.                                                                               |
| `keyboard-help-en.png`          | English keyboard help with character shortcuts disabled.                                                                                                   |
| `keyboard-help-ar-enlarged.png` | Arabic help at 200% root text size on a 320×480 CSS px viewport, scrolled to its reachable checkbox. Title and label continue to scroll within the dialog. |
| `travel-downloads-en.png`       | English travel preparation with truthful incomplete coverage before download.                                                                              |

The full screenshot matrix remains in local `output/playwright/phase78/`: Arabic/English Home and ordinary-reader focus at 320, 820, and 1440 CSS px, plus help and travel screens. Cross-browser tests additionally exercise Firefox and mobile WebKit. The full browser run passed 457 tests with one existing skip. `quality-check.log`, `browser-tests.log`, and `pages-build.log` preserve final command output; the quality and Pages gates fail only bundle budget. The phase report records measurements and the pending scope decision.
