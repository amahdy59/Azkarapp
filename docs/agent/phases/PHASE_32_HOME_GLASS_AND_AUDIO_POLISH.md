# Phase Report — Home glass and audio polish

## Objective

Make the Home photograph visibly present through desktop and tablet cards, use the empty half-row beside prayer detail, add Quran to Today's Wird, and finish the shared player's continuous-play, seeker, volume, localization, accessibility, and containment behavior.

## Scope completed

- Reduced the shared Home glass wash and blur while retaining its edge, gradient, saturation, paint containment, and solid reduced-transparency fallback.
- Kept expanded prayer detail in its selected half and stacked daily context in the opposite half.
- Added a continuous hover corridor between the audio speaker and vertical volume slider.
- Styled native timeline and volume range controls with consistent CSS tracks and thumbs; no image assets or dependencies were introduced.
- Inset compact progress inside the player and added Play All to Reader options when a routine has multiple reviewed recordings.
- Added Arabic display metadata for the two reviewed audio sources.
- Added Quran as the fourth Home Wird tracker using the existing Quran goal and reading history, and removed the separate duplicate Home Quran card from the rendered composition.

## Files changed

- `src/app/screens/HomeScreen.tsx`
- `src/app/components/FloatingAudioPlayer.tsx`
- `src/app/screens/ReaderScreen.tsx`
- `src/app/App.tsx`
- `src/app/audio/audioTypes.ts`
- `src/app/audio/audioManifest.ts`
- `src/app/audio/resolveAudioAsset.ts`
- `src/styles/theme/layout.css`
- Focused unit and browser tests
- Design, audio, decision, phase, and release documentation

## Components added or modified

- Modified the existing Home responsive grid, floating audio player, Reader options, and audio-source metadata path.
- Modified the existing Home Wird to stack on phones, use a 2-by-2 tablet grid, and use four equal desktop tracks.
- Added no component and no runtime dependency.

## User-visible changes

- Tablet and desktop Home cards reveal the background scene instead of reading as opaque navy.
- Daily context fills the half beside expanded prayer detail.
- Volume remains reachable while moving the pointer to its slider.
- The seeker has consistent crisp track/thumb geometry and the compact progress line stays within the player.
- Reader options expose continuous Play All where more than one reviewed item is available.
- Arabic playback attribution no longer falls back to English for known sources.
- Today's Wird includes Quran progress and opens the appropriate Quran overview or continuation flow.

## Accessibility work

- Preserved native range semantics, vertical volume orientation, localized value text, keyboard controls, focus rings, 44px timeline hit height, RTL fill, and reduced-transparency fallback.
- Continuous play remains a named menu action, and partial audio coverage retains its confirmation disclosure.

## Tests added or updated

- Added pointer travel and volume-change coverage, compact progress containment, Reader Play All, Arabic attribution, transparent glass material, reduced-transparency fallback, and paired Home-column geometry.
- Added four-item Quran Wird ratio/action coverage and updated responsive RTL geometry expectations.

## Commands run

| Command                                                       | Result                                                         |
| ------------------------------------------------------------- | -------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`                              | Passed; lockfile already current.                              |
| `pnpm check`                                                  | Passed; all format, lint, type, unit, content, and size gates. |
| `pnpm test:e2e`                                               | Passed; 397 tests, 1 intentionally skipped.                    |
| `pnpm build:pages`                                            | Passed; bundle and CSS utility checks passed.                  |
| `pnpm audit:prod`                                             | Passed; no known production vulnerabilities.                   |
| Focused desktop Chromium Home, audio, and transparency suites | Passed; 16 tests passed.                                       |

## Visual/manual evidence

- Browser geometry verifies the responsive Home pairing and compact player containment at tablet and desktop widths.

## Documentation updated

- Updated the design-system, audio architecture and QA contracts, decision log, phase index, this phase report, and bilingual release notes.

## Decisions recorded

- DEC-173 and DEC-174.

## Known limitations or remaining risks

- Media Session integration remains browser-dependent.

## Out-of-scope findings

- None.

## Recommended next step

- Commit the verified local result. Push and production verification require the user's separate approval.
