# Phase Report — Mushaf and Quran Wird refinement

## Objective

Make the 604-page Mushaf calmer and closer to a physical Madani reading page while keeping semantic Quran text, reviewed word meanings, explicit progress recording, offline behavior, and accessible alternatives to swipe.

## Scope completed

- Removed duplicate page and progress indicators from the standalone Mushaf.
- Added direct horizontal page drag/swipe while retaining persistent buttons and physical arrow-key behavior.
- Made every reviewed difficult word permanently discoverable and actionable.
- Replaced the Wird radial summary with one direction-aware linear track.
- Removed stale-position recording from the overview; recording remains explicit on the open page.
- Changed the Wird calendar to a local Saturday-to-Friday week.
- Collapsed plan controls behind native progressive disclosure and merged reading position into the primary card.

## Files changed

- `src/app/screens/KhatmahReaderScreen.tsx`
- `src/app/components/MushafPageViewer.tsx`
- `src/app/screens/QuranWirdScreen.tsx`
- `src/app/screens/quranWirdWeek.ts`
- `src/app/App.tsx`
- `src/app/i18n/ar.ts`
- `src/app/i18n/en.ts`
- `src/app/components/MushafPageViewer.test.tsx`
- `src/app/screens/QuranWirdScreen.test.tsx`
- `e2e/khatmah-reader.spec.ts`
- `docs/DESIGN_SYSTEM.md`
- `docs/agent/DECISION_LOG.md`
- `public/release-notes.json`

## Components added or modified

- Modified `KhatmahReaderScreen`, `MushafPageViewer`, and `QuranWirdScreen`.
- Added the pure `currentSaturdayWeekKeys` helper.
- Added no runtime dependency and changed no Quran text, page data, word-meaning data, or persistence shape.

## User-visible changes

- The phone Mushaf is full bleed; wider layouts keep one bounded page surface.
- Exactly one visible `page / 604` indicator remains.
- Swipe/drag, arrow keys, and Previous/Next buttons move to the same destination.
- Difficult words use a semantic tint, background, and dotted underline and open their reviewed Arabic gloss.
- Quran Wird owns the only progress track; Arabic progress fills from the right.
- The overview is shorter, shows the last position inside today's card, and hides plan fields until expanded.
- The week runs Saturday through Friday.

## Accessibility work

- Swipe has persistent single-pointer button and keyboard alternatives.
- Difficult words are native buttons with localized accessible names, dotted underline, visible focus, and color-independent affordance.
- The progress track exposes value/min/max and a localized accessible name and direction.
- Reduced-motion users get the same page destination without lateral movement.
- DOM order remains stable, Quran text remains selectable/semantic, and the reader has one named page-navigation region.

## Tests added or updated

- Unit coverage for Saturday-to-Friday keys, RTL progress direction, absence of overview recording, and permanent difficult-word buttons.
- Browser regression coverage for the overview, difficult words, swipe, RTL arrow keys, persistent navigation buttons, and the absence of the retired Khatmah indicator.

## Commands run

| Command                          | Result                                                 |
| -------------------------------- | ------------------------------------------------------ |
| `pnpm install --frozen-lockfile` | Passed; lockfile already current                       |
| `pnpm typecheck`                 | Passed                                                 |
| Focused Vitest files             | 8/8 passed                                             |
| `pnpm lint`                      | Passed                                                 |
| Focused `khatmah-reader.spec.ts` | 3/3 passed across desktop, mobile, and tablet Chromium |
| `pnpm check`                     | Passed; 103 files and 541 tests passed                 |
| `pnpm test:e2e`                  | Passed; 510 passed and 4 intentionally skipped         |
| `pnpm build:pages`               | Passed; bundle and CSS utility budgets passed          |

## Visual/manual evidence

- Inspected supplied references at the start; they were treated as visual references only.
- Verified live Arabic pages 1, 42, 43, and 187.
- At 320×700, 390×844, 768×1024, and 1110×835: 15 source lines, zero document overflow, zero page overflow, and zero line overflow.
- Verified page 42 exposes three reviewed difficult-word buttons and opens the source-backed gloss.
- Verified left drag 42→43, `ArrowRight` 43→42 in RTL, and Next 42→43.
- Verified recording page 43 updates the overview to value 1 of 4 and that the progress track has `dir="rtl"`.

## Documentation updated

- Updated the Reader contract in `docs/DESIGN_SYSTEM.md`.
- Recorded DEC-086 in `docs/agent/DECISION_LOG.md`.
- Replaced release notes with this release's four Arabic and English outcomes.

## Decisions recorded

- One page indicator in the Mushaf; progress belongs to the Wird overview.
- Page recording is explicit and page-local.
- The week begins Saturday.
- Current Unicode/Amiri rendering is source-aware and semantic but is not described as a pixel-identical QCF facsimile.

## Known limitations or remaining risks

- Exact King Fahd print glyph placement requires authoritative per-page QCF glyph codes and page fonts. The Quran Foundation documents that integration separately; the current offline dataset carries Unicode words and 15-line placement, not QCF glyph codes.
- Automated browser and keyboard evidence is not a manual TalkBack/VoiceOver session or real-device safe-area check.

## Out-of-scope findings

- No Quran wording, page boundary, translation, attribution, or difficult-word source was changed.
- No new Mushaf edition, recitation, or word-meaning content was introduced.

## Recommended next step

Evaluate a separately scoped, licensed QCF per-page font/glyph integration if pixel-identical Madinah print typesetting is still required after this semantic layout ships.
