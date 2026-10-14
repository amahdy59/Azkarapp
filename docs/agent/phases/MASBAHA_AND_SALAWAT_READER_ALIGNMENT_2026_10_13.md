# Phase Report — Masbaha and Friday Salawat Reader Alignment & Desktop Symmetry

## Objective

1. Align the Masbaha / Tasbeeh experience (`CustomCounterScreen.tsx`) and the Friday Salawat experience (`FridaySalawatScreen.tsx`) with the visual, structural, and behavioral standards of the primary Devotional Reader (`ReaderScreen.tsx`).
2. Implement desktop visual symmetry by harmonizing the max-width of the top progress bar container and the bottom dock/footer to `max-w-[42rem]` (672px) across all reading and counting surfaces.
3. Eliminate duplicate code across counting and reading views by creating shared presentation primitives (`AppearanceMenu`, `ReadingScreenChrome` hero art, `StandaloneCounterFooter` action docks) so improvements to zikr groups automatically propagate.
4. Enhance Friday Salawat with authentic formula choices (Concise, As-Salat Al-Ibrahimiyyah, Short Tashahhud), cumulative rounds tracking, milestone haptics (33-count), and single-card share export.
5. Enhance Masbaha with flanking previous/next navigation buttons, horizontal swipe gestures between authentic azkar, appearance text-size adjustment, and single-card share export.
6. Strictly preserve all changes locally without pushing to git, per user instruction.

## Scope completed

- `ReadingScreenChrome.tsx`:
  - Integrated `ReaderSceneArt` desktop hero banner with mosque skyline illumination.
  - Symmetrically constrained the desktop progress bar container to `max-w-[42rem]`.
  - Exposed text-size (`AppearanceMenu`) and keyboard shortcut help triggers in both wide desktop and compact header layouts.
- `src/app/components/AppearanceMenu.tsx`:
  - Created reusable `AppearanceMenu` supporting Small (`أ-`), Medium (`أ`), and Large (`أ+`) font sizes with radio semantics.
  - Reused across `ReaderScreen.tsx`, `CustomCounterScreen.tsx`, and `FridaySalawatScreen.tsx`.
- `src/app/components/SalawatFormulaPicker.tsx`:
  - Created reusable dropdown picker for authentic Salawat formulas with Arabic and English typography, transliteration, and hadith source citations.
- `StandaloneCounterFooter.tsx`:
  - Added optional `previous` and `next` slots rendering `.adaptive-counter-row` flanking buttons.
  - Added `onShare` prop to display `Share2` in the 4-action support dock (`benefit`, `share`, `sound`, `focus`).
- `ReaderScreen.tsx`:
  - Delegated appearance menu rendering to the shared `AppearanceMenu` component.
  - Updated desktop progress bar wrapper to `max-w-[42rem]`.
- `CustomCounterScreen.tsx`:
  - Added text-size adjusting via `ReadingScreenChrome` and `AppearanceMenu`.
  - Added previous/next navigation buttons flanking the counter and horizontal touch swipe gestures (`useSwipeGestures`).
  - Added devotional share modal trigger (`CollectionShareModal`) to the support dock.
- `FridaySalawatScreen.tsx`:
  - Added `SalawatFormulaPicker` with live formula switching between concise, Ibrahimiyyah, and short Tashahhud.
  - Added cumulative Friday round tally indicator (`rounds > 0`) with polite aria-live feedback.
  - Added 33-count milestone haptic feedback.
  - Added text-size adjusting via `AppearanceMenu`.
  - Added devotional share modal trigger (`CollectionShareModal`).
- `App.tsx`:
  - Passed `onTextSizeChange={setTextSize}` into both `FridaySalawatScreen` and `CustomCounterScreen`.

## Files changed

- `src/app/App.tsx`
- `src/app/components/AppearanceMenu.tsx` (new)
- `src/app/components/AppearanceMenu.test.tsx` (new)
- `src/app/components/SalawatFormulaPicker.tsx` (new)
- `src/app/components/SalawatFormulaPicker.test.tsx` (new)
- `src/app/components/ReadingScreenChrome.tsx`
- `src/app/components/StandaloneCounterFooter.tsx`
- `src/app/screens/ReaderScreen.tsx`
- `src/app/screens/CustomCounterScreen.tsx`
- `src/app/screens/CustomCounterScreen.test.tsx`
- `src/app/screens/FridaySalawatScreen.tsx`
- `src/app/screens/FridaySalawatScreen.test.tsx`
- `src/app/i18n/ar.ts`
- `src/app/i18n/en.ts`
- `docs/agent/DECISION_LOG.md`
- `docs/agent/phases/MASBAHA_AND_SALAWAT_READER_ALIGNMENT_2026_10_13.md` (this report)

## Verification results

- `pnpm check`: Passed all 14 stages (toolchain, build, typecheck, lint, audio manifest, Quran timings, listening timings, owner timing previews, type scale, motion rules, format, unit tests, bundle budget, css utilities).
- `pnpm test:e2e:fast`: 26 passed.
- Unit tests: 65/65 passed across targeted affected suites.
- Code style: Prettier check passed without errors.
- TypeScript: `tsc --noEmit` passed with 0 errors.
- ESLint: Passed with 0 errors, 0 warnings.
- Local state: Working tree contains all verified changes uncommitted, waiting for user to consolidate and push.
