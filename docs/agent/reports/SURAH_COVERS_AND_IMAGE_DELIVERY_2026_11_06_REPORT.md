# Phase Report — Surah covers, listening desk and image delivery

## Objective

Make the supplied surah artwork the focus of the entry while improving image delivery and expanding usable Mushaf listening space.

## Scope completed

- Al-Kahf, As-Sajdah and Al-Mulk use the larger responsive cover. On phones the image spans the entire viewport width. The title and reviewed catalogue details have separate space, and the actions keep comfortable side insets.
- Single-track Quran listening groups the play and skip controls between Focus and Lock. The reading region scrolls between the title and transport. Continuous listening trims empty exterior slots from filtered passages while keeping their canonical line layout.
- Compact 416px covers are local and precached. The existing 768px hosted WebP is selected for larger slots and cached after use. A stalled or failed hosted request can fall back to the matching cover. Friday and Progress illustrations select responsive sources.

## Files and components

ReaderScreen, SurahArtwork, FloatingAudioPlayer, MushafPageViewer, HomeCards, ProductImage and ProgressViews. Updated their layout styles, image assets and offline rules, focused tests, bilingual release notes and design contracts.

## Accessibility work

Retained native reading and playback controls with named 44px targets and focus recovery. Verified RTL and LTR geometry, doubled text at 320px and no horizontal overflow. Browser listening cases cover keyboard scroll recovery, magnification and automated accessibility.

## Tests and evidence

| Command                                           | Result                                                                                                                                                               |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focused Reader, listening and Progress Vitest run | 44 tests passed.                                                                                                                                                     |
| `pnpm typecheck`                                  | Passed during implementation.                                                                                                                                        |
| `pnpm build:pages`                                | Passed the existing CSS and artifact limits after keeping the larger covers on demand.                                                                               |
| Browser cover and listening suites                | 38 cases passed across Chromium, Firefox and WebKit. The separate stalled-cover regression passed in Chromium after correcting its density-adjusted width assertion. |

Screenshots and the browser execution record are under `output/playwright/surah-cover-confirmed`.

## Decisions and limitations

The 64px Friday illustration can use a 4,641-byte AVIF, compared with the previous 70,249-byte asset. Wider variants keep the original composition. The full-resolution, authored sharing exports and platform icons retain their original formats. Browser measurements are laboratory evidence. Physical-device frame pacing and assistive technology require separate manual verification.

## Documentation updated

Phase brief, decision log, design system, architecture, and the bilingual release notes and archive.

## Recommended next step

Verify the exact commit in Quality and Pages and smoke-test the production update.

## Release follow-up

The 320px view at 200% text now gives the title the full row and places Share beside the details. The English As-Sajdah title fits in two lines. The added regression passed in Chromium, Firefox and WebKit. Exact-commit CI on the first candidate exposed the listening desk narrowing the wide English translation below its two-column breakpoint. The desk now restores the wide measure while the paired meaning is open. The unchanged paired translation regression passed on all three engines.
