# Phase Report — Prayer and fasting collections

## Objective

Add carefully scoped, reviewed Library collections for established in-prayer wording and year-round Ramadan/voluntary-fasting guidance.

## Scope completed

- Added `أذكار الصلاة / In-Prayer Supplications`, ordered from opening supplication through the final pre-salam supplication.
- Added `الصيام ورمضان / Fasting & Ramadan`, available all year and initially covering suhoor and iftar evidence.
- Preserved the separate `أذكار بعد الصلاة / After Prayer` collection.
- Added Arabic timing translations, direct source links, evidence text, English meaning, and Arabic benefits.
- Added both category IDs to the Supabase schema snapshot and a forward-only constraint migration.

## Files changed

- Added `src/app/content/inPrayerSupplications.ts` and `src/app/content/fastingRamadan.ts`.
- Updated category/type registration, shared content lookup, and Arabic timing localization.
- Added focused collection and Library interaction tests.
- Updated the Supabase schema snapshot, category contract test, and migration history.
- Updated the bundle baseline, release notes, decision log, phase index, and this report.

## Components added or modified

- Modified the existing Azkar Library category groups; no new visual component or runtime dependency was added.

## User-visible changes

- Readers can open eight sourced in-prayer supplications from the Daily Library group.
- Readers can open a year-round fasting reference for suhoor and iftar from the More group.
- Both collections participate in the existing offline reader, search, saved-item, counting, and progress flows.

## Accessibility work

- The collections reuse the Library’s semantic headings, native buttons, accessible item counts, direction handling, focus treatment, and 44px target floor.
- Authentic alternatives and the fasting-intention scope are communicated in text rather than by visual styling alone.

## Content safeguards

- The in-prayer introduction states that authentic variants are alternatives, not a combined prayer checklist.
- The fasting introduction does not prescribe a spoken daily intention formula.
- Direct references were checked against their linked records. The three-count bowing and prostration entries cite the reviewed Hisn al-Muslim references that explicitly state that count instead of attributing it to a narration that only establishes the wording.

## Tests added or updated

- Collection IDs, order, introductions, sources, Arabic benefits, and evidence-backed repetition references.
- Library discoverability and opening behavior for both collections.
- Supabase schema and latest-migration category parity.

## Commands run

| Command                                                          | Result                                                                                      |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Focused content, Library, attribution, and Supabase schema tests | Pass: 44 tests.                                                                             |
| `pnpm install --frozen-lockfile`                                 | Pass; lockfile current.                                                                     |
| `pnpm check`                                                     | Pass: formatting, lint, types, unit tests, build, audio, bundle, type-scale, and CSS gates. |
| `pnpm test:e2e`                                                  | Pass across the configured desktop, phone, tablet, Firefox, and WebKit matrix.              |
| `pnpm build:pages`                                               | Pass; PWA and bundle budgets held.                                                          |

## Visual/manual evidence

- Existing Library cards and Reader surfaces are reused; no new visual pattern required screenshot evidence.
- Source URLs were opened and compared with the represented wording/counts.

## Documentation updated

- Updated the phase index, decision log, Supabase schema/migration contract, release notes, and this report.

## Decisions recorded

- DEC-202 records the collection scope, grouping, alternatives, year-round availability, and evidence rules.

## Known limitations or remaining risks

- A local Supabase database reset could not be run because Docker is unavailable on this host. The repository’s schema parity tests validate the snapshot and migration text; applying the migration to a configured Supabase project still requires authenticated `supabase db push`.
- Optional Ramadan-specific Home surfacing remains out of scope until a separate Hijri-calendar and user-control design phase.

## Out-of-scope findings

- No existing reviewed devotional wording was changed.

## Recommended next step

- Apply the new Supabase migration in any deployment that still uses the legacy Supabase sync adapter, then smoke-test saving one session from each new collection.
