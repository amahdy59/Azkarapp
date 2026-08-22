# Phase Report — Offline city selector and coordinated Quran release

## Objective

Let readers choose a prayer-time location without GPS or network access while safely integrating the concurrently developed Quran Wird work.

## Scope completed

- Added a bilingual, searchable catalogue of representative city-centre coordinates and IANA timezones.
- Reused the existing manual `LocationSettings` persistence boundary; no schema migration or runtime service was added.
- Kept manual city, timezone, latitude, and longitude entry available for locations outside the catalogue.
- Coordinated and validated the separately committed Quran Wird overview and plan redistribution changes.
- Repaired two integration defects exposed by the full gate: page status semantics and the missing bilingual Undo key.

## Files changed

- `src/app/content/prayerLocations.ts`
- `src/app/content/prayerLocations.test.ts`
- `src/app/screens/settings/NotificationsPanel.tsx`
- `src/app/screens/settings/NotificationsPanel.test.tsx`
- `src/app/screens/KhatmahReaderScreen.tsx`
- `src/app/i18n/en.ts`
- `src/app/i18n/ar.ts`
- `public/release-notes.json`
- `docs/PRAYER_TIMES.md`
- `docs/agent/DECISION_LOG.md`

## Components added or modified

- Added the prayer-location preset catalogue and search helper.
- Added city search, popular results, matching results, empty-state recovery, and one-tap selection to `NotificationsPanel`.
- Gave the dynamic Mushaf page label valid `status` semantics.

## User-visible changes

- Readers can search cities or countries in Arabic or English and save a location without granting GPS access.
- Selection immediately fills and persists city, timezone, latitude, and longitude for offline prayer calculation.
- The existing manual location controls remain available.
- The coordinated release also introduces the Quran Wird overview, deliberate page-completion logging, reliable continuation context, and flexible plans.

## Accessibility work

- Search uses a native search input with a localized accessible name.
- Results are keyboard-operable buttons with visible focus, a 44px-plus target, and `aria-pressed` selected state.
- The empty state and save confirmation use status semantics.
- Arabic and English were inspected at 320px with no horizontal overflow; the search target measured 49.5px high.
- Fixed a roleless Mushaf page `aria-label` by exposing it as a status.

## Tests added or updated

- City search defaults, English aliases/countries, Arabic normalization, coordinate ranges, unique IDs, and runtime-recognized IANA timezones.
- English and Arabic component selection and persistence.
- Existing Quran Wird/state tests were included in focused integration runs.

## Commands run

| Command                                         | Result                                                                                   |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`                | Passed; lockfile already up to date                                                      |
| `pnpm typecheck`                                | Passed                                                                                   |
| Focused city, Quran Wird, state, and i18n tests | Passed; final focused city run 7/7                                                       |
| Scoped Prettier and ESLint checks               | Passed                                                                                   |
| `pnpm check`                                    | Passed; 103 files and 539 tests, production build, PWA generation, bundle and CSS checks |
| `pnpm test:e2e`                                 | Passed; 507 passed, 4 intentional project skips, 0 failures                              |
| `pnpm build:pages`                              | Passed; PWA generated and bundle budget passed                                           |
| `pnpm run check:release-notes`                  | Passed                                                                                   |

## Visual/manual evidence

- In-app browser inspection at 320×800 in Arabic RTL and English LTR.
- Confirmed one-column result reflow, visible focus ring, no horizontal overflow, correct Arabic search matching, immediate saved fields, and stable English canonical city label after language switching.

## Documentation updated

- `docs/PRAYER_TIMES.md` documents the offline preset boundary and manual fallback.
- `DEC-085` records the privacy, persistence, and finite-catalogue decision.
- Release notes were replaced for the coordinated release and stamped `2026-08-22-2`.

## Decisions recorded

- DEC-085 — Offline city presets reuse the manual location boundary.

## Known limitations or remaining risks

- The built-in catalogue is intentionally finite and uses representative city-centre coordinates. Readers outside it must use manual coordinates; this is not an address-level geocoder.
- Automated checks and browser inspection do not replace physical-device screen-reader testing.

## Out-of-scope findings

- No additional Mushaf visual refinements were made in the city-selector change; those remained owned by the separate Quran task.

## Recommended next step

- Monitor the coordinated Quality and Pages workflows, verify the production SHA and smoke-test both city selection and Quran Wird entry after deployment.
