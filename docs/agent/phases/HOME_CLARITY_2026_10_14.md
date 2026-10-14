# Phase Report — Home clarity and independent appearance choices

## Objective

Implement the owner's final approved Home image: current/next prayer with all-prayer disclosure, open image-free daily wird with optional photos, directly visible reminder, retained complete/abbreviated choice, benefits access, header streak/palms, desktop-only Today's path and icon-labelled situational shortcuts.

## Plan before editing

Reuse existing prayer models, recording controls, reviewed reminder and primary routine components. Introduce a Home-specific wird presentation without changing Progress. Persist one additive boolean through existing normalization/merge boundaries (default false); keep existing reduced-transparency behavior and expose the same control alongside images in Appearance. Use shared glass material for surfaces and photographic captions with reduced-transparency fallback. Test calendar prayer transitions, disclosure, preferences restore, themes, RTL/LTR, keyboard and narrow/enlarged layouts; complete intact release gates, exact-commit CI and production verification.

## Scope completed

Implemented locally. Feature verification completed; publication authorized following the explicit 12 MiB total-output exception.

## Files changed

HomeScreen and render tests; new HomeWirdSection/home-wird.css; PrayerTrackerCards; SituationalShortcuts and test; App/state/types and normalization tests; SettingsScreen/types/AppearancePanel and test; bilingual i18n; auth/remoteSyncSnapshot preference boundaries; responsive browser specs; architecture/design/prayer/decision/index documents.

## Components added or modified

Home prayer summary, Home wird section, situational shortcuts and Appearance settings.

## User-visible changes

As described in Objective. Reviewed content, prayer calculations and recording boundaries remain unchanged.

## Accessibility work

Native controls, labelled switches and disclosures, 44px targets, semantic order, contrast and reduced-transparency/reduced-motion fallbacks; physical assistive technology acceptance remains separate.

## Tests added or updated

New bilingual responsive Home tests cover 320/390/900/1440px, 200% text, keyboard, axe, two/five prayer disclosure, images/transparency independence, persistence and material fallback. Existing prayer geometry/interaction and Today’s path tests adapt explicitly to approved disclosure and desktop-only behavior.

## Commands run

- 66 initial focused units passed; 77 state/Home/settings/auth/snapshot units passed after preference integration.
- Final scoped units: 76 passed across six files (6.38s), exit 0.
- 24 new Home cases passed across three engines; 6 updated 900px cases passed after aligning to shared desktop shell. Initial 48-case browser run reproduced expanded-summary overflow; repaired run passed all 25 existing compact-prayer/counter cases.
- Updated RTL prayer selection passed.
- Browser inventory: 1,496 tests assigned exactly once across nine shards.
- Full pnpm check passed unit coverage, typecheck, lint, content, timing and motion checks, but failed formatting (two files, since repaired) and the fixed total-output ceiling. Scoped final formatting passed.
- Current final browser build is 11,941,511 bytes vs 11,534,336 ceiling, 407,175 bytes over. No limits or checks changed; no commit/push/deployment.
- Complete logs retained under output/home-_.log and output/reliance-_.log.

## Visual/manual evidence

The owner’s final image is the approved reference. Actual desktop/phone screenshots: output/playwright/home-clarity-ar-desktop-clear.png, home-clarity-ar-phone-clear.png, and home-clarity-ar-desktop-images.png. Synthetic cross-engine screenshots also retained.

## Documentation updated

This phase, index, decisions and relevant appearance/prayer contracts.

## Decisions recorded

The owner explicitly authorizes implementation of the final image, desktop-only Today's path and consistent glass materials. Existing autonomous main-branch release authority applies.

## Known limitations or remaining risks

Human screen-reader/physical device validation cannot be inferred from automated browser tests. Glass must preserve readable surfaces and respect reduced transparency.

## Recommended next step

The owner explicitly approved 12 MiB total output and publication of all changes. Run the final pre-push gates, then verify exact-commit Quality, Pages and production. All other limits and assertions remain intact.
