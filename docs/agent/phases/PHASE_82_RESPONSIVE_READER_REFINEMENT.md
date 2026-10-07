# Phase 82 — Responsive reader refinement

## Objective and scope

Apply the owner's tablet/desktop Mushaf and mobile header, guidance and menu screenshot feedback.

- Bound facing page frames to equal page-shaped proportions rather than stretching words across wide landscape viewports.
- Account for compact/regular toolbar width before choosing a spread.
- Remove scene artwork and unnecessary backdrop blur from compact headers; retain the wide hero's established scene and contrast treatment.
- Reduce guidance padding and collapse the learned hint to a compact, recoverable 44px hand control.
- Remove redundant menu headings, unavailable English playback and prescribed audio repeat when the player already exposes it. Keep unique collection and recovery actions reachable.

## Files/components changed

Shared Header, CounterTapHint, MushafPageViewer, mushafShell, ReaderScreen, their unit/browser tests and release notes.

## Accessibility and behavior

Native hand toggle retains its localized name, expanded state and visible focus indicator. Ordinary actions retain 44px targets. Header artwork is omitted only in the compact surface. Reviewed devotional content, fifteen-line page geometry, offline storage and progress are unchanged.

## Tests and evidence

- Added spread fit tests around tablet toolbar thresholds.
- Added wide-page proportion assertions at 1600×834 and 1920×1080.
- Added compact header artwork exclusion and collapsed hint geometry checks.
- Updated scene tests to assert the owner's opaque compact header while preserving wide scene checks, accessibility scans and screenshots.
- Initial focused Mushaf browser run: 10 passed.
- Initial focused component unit run: 32 passed.

## Commands run

| Command                                  | Result                                                                         |
| ---------------------------------------- | ------------------------------------------------------------------------------ |
| Focused component Vitest                 | 32 passed                                                                      |
| Focused Mushaf browser suite             | 10 passed                                                                      |
| Focused reader/responsive browser suites | 77 passed                                                                      |
| `pnpm check`                             | Passed; 1,482 unit tests, coverage, lint, formatting, content and bundle gates |

Scene and footer screenshots were generated in `output/playwright/reader-scenes` and `output/playwright/footer-redesign`. A 390px Arabic morning-reader screenshot was inspected: the header is uniform and the first-use guidance is compact. Final full-browser and deployment verification results are recorded in the release response.

## Documentation updated

The full local `pnpm test:e2e` run passed 678 tests with zero failures and one existing skipped test in 54.5 minutes. It includes Chromium phone/tablet/desktop, Firefox and WebKit projects. Both previously failing WebKit update-deferral cases passed without changing those tests or update behavior.

Phase brief, agent index and design-system follow-up.

## Known limitations

Physical-device OLED, system text sizing and assistive-technology checks remain manual. Screenshots/tests demonstrate simulated viewport behavior, not universal device certification.

## Recommended next step

Review the deployed reader on the owner's tablet and phone, including slow font loading.
