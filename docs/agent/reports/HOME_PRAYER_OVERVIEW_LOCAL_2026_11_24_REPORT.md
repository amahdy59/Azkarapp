# Phase Report — Home prayer overview and adjacent location refresh

The subsequent owner-approved two-line summary and below-timings location footer supersede this checkpoint's header-location presentation. See [the latest correction report](HOME_TWO_LINE_LOCATION_2026_11_24_REPORT.md); the earlier results below remain historical evidence.

## Objective

Complete the owner-approved local Home prayer redesign, apply the screenshot corrections and place Refresh immediately beside the location. Publication remains on hold.

## Scope completed

- Five icon-led prayer tiles, a passive shaded current/next interval and one connected details panel. Current, next, opened selection and keyboard focus have independent meanings.
- Centered phone tiles, compact tablet presentation and the original large-time desktop card anatomy. Enlarged desktop/tablet content reflows instead of shrinking times.
- Two additional pixels between calendar dates; reduced header clutter; label-sized location selector followed by Refresh with an 8px default gap and independent 44px targets. Long Arabic/English names wrap. At narrow enlarged measures, the name has a full row with Refresh immediately below in the same group; fragment measurements require complete words.
- Explicit location detection through App's existing callback, retained calculation preferences, honest device-location context, duplicate/stale/unmounted-request protection and unchanged saved location on failure.
- Protected location-result dialog with a visible heading, separate close control and focus return. Location selection opens the existing Settings destination.
- Shared Glass surfaces and semantic color modes; separate desktop summary/card material owners and one compact material owner. High-contrast/reduced-transparency recovery remains opaque.
- Home's own space reservation controls its scroll handoff; native scroll anchoring no longer reverses the fold when the narrow grid changes height.
- Removed unused styling for the replaced Home carousel. Existing bundle ceilings and baseline were not increased.

## Files changed

The scoped implementation spans `src/app/screens/HomeScreen.tsx`, `HomeScreen.render.test.tsx`, `src/app/App.tsx`, `src/app/hooks/useAppRouting.ts`, `useHomeLocation.ts` and its test; `src/app/components/HomeLocationRow.tsx`, `HomePrayerOverview.tsx` and its test, `home-prayer-overview.css`, `home-wird.css`, plus the Home integration in `PrayerMomentPanel.tsx` and `PrayerActionsCard.tsx`. Arabic/English copy uses the existing i18n files.

Browser contracts updated: `e2e/home-prayer-overview.spec.ts`, `e2e/helpers/home-overview.ts`, `home-clarity`, `home-date-rail`, `home-glass-material`, `home-prayer-motion`, `home-prayer-scroll`, `home-time-actions`, `compact-prayer`, `prayer-glass-hierarchy`, `prayer-seconds`, `prayer-selection-connection` and the Home selector in `glass-reader-polish`. The shared `PrayerActionsCard.test.tsx` checks its existing Rawatib banner within the owning card rather than assuming it is inside the separate Sunnah subsection.

Independent Qibla, downloads, prayer settings, expanded desktop guidance, surah entry and external-document edits coexist in this checkout. This report does not claim ownership of their complete diffs.

## Components added or modified

Added HomeLocationRow, HomePrayerOverview and useHomeLocation. HomeScreen composes their callbacks, existing prayer models, location feedback and focus recovery. Existing shared Button, Modal, SheetHeader, prayer icons and material tokens are reused; no runtime dependency was added.

## User-visible changes

All five timings remain visible in the ordinary layout. Available prayers toggle one details panel; unavailable timings remain readable. The numeric minute countdown is retained, including its passive accessible description for the next prayer. Refresh is visibly associated with its location. Normal desktop timer-card composition is preserved.

## Accessibility work

Native buttons/disclosures, explicit expanded/disabled states, distinct focus, 44px location targets, keyboard selection and close recovery, protected modal surfaces, and Arabic/English direction are retained. Geometry checks cover phone/tablet/desktop, long labels and 320px/200% text. Countdown changes do not create a live timer region. Both motion preferences and solid/contrast/transparency fallbacks are exercised. Automated evidence is not physical-device or screen-reader acceptance.

## Tests added or updated

Unit coverage checks five icons/disclosure slots, independent next/open states, unavailable details, location success/denial, preference preservation, duplicate requests, thrown providers and stale/unmounted results. Browser checks cover geometry, pointer hit-testing, actual tile contents, all color modes/material owners, interval updates, keyboard/focus recovery, scroll/motion, midnight ordering and saved location. Older carousel/footer assertions were replaced with the approved grid/summary contracts; behavior and accessibility assertions remain.

## Commands run

Recorded verification is listed below. Intermediate failure logs are retained; no checks, thresholds, bundle ceilings or hook receipts were bypassed.

| Command / evidence                                             | Result                                                                                                                                                                                |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Initial `pnpm check`                                           | Failed: external-source lint/format, concurrent shared guidance formatting/test registration, and 6,026 bytes over the total-output limit. Log: `output/home-continuation-check.log`. |
| Initial affected Chromium matrix                               | 108 passed, 7 failed. Exposed scroll anchoring, enlarged English tablet fitting and two tests activating a folded row. Log: `output/home-continuation-final-browser.log`.             |
| Scroll-anchor diagnostic                                       | 4 passed, 8.8s, with the narrow/live-viewport failures reproduced and the focused anchoring correction verified. Log: `output/home-scroll-diagnostic.log`.                            |
| Shared component/isolation units after corrected test boundary | 23 passed, 10.10s. Log: `output/home-continuation-shared-units.log`.                                                                                                                  |
| Focused source/browser ESLint                                  | Passed. Log: `output/home-continuation-lint.log`.                                                                                                                                     |
| `pnpm typecheck`                                               | Passed. Log: `output/home-continuation-typecheck.log`.                                                                                                                                |
| Pages build after retiring obsolete carousel CSS               | Passed, unchanged bundle ceilings; Home startup graph 517,399 gzip bytes. Log: `output/home-continuation-pages.log`.                                                                  |

### Final verification

| Command / evidence                                                                             | Exact result                                                                                                                                                                                                                                                                                                                                                  |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm check`                                                                                   | All unit tests with enforced coverage, build, typecheck, content/timing/motion, bundle and CSS checks PASS. Overall FAIL only lint/format in independent `docs/external-sources/` work; 351.3s. `output/home-final-check.log`. The subsequent location-only CSS reflow is separately browser/build checked; no reusable exact-final-input receipt is claimed. |
| Core Chromium/Firefox/WebKit selection                                                         | 59 passed, 1 failed, 11.0m. The failure was Firefox reporting inline `scrollWidth` with zero `clientWidth` in a test measurement. Replaced that measurement with actual text-fragment containment and reran the affected case in all engines below. `output/home-final-core-engines.log`.                                                                     |
| Final long-location/narrow-text/tablet-countdown selection, same three engines                 | PASS: 21 cases, 2.9m. Includes the corrected Firefox measurement, whole-word wrapping, adjacent default controls and the enlarged stacked-location exception. `output/home-accessible-location.log`.                                                                                                                                                          |
| Extended prayer, recording, responsive guidance, navigation, Settings, legal and offline suite | 90 passed, 7 failed, 8.7m. Failures were obsolete single-row/carousel/status-description and duplicate-date assertions. Their corrected contracts all pass in the two following rows. `output/home-final-extended.log`. The 28-case core smoke inventory is included in the passing portion.                                                                  |
| Corrected keyboard/date contracts, all color-mode Glass captures and scenery-hover test        | PASS: 13 cases, 1.2m. `output/home-final-corrections.log`. Date assertions also include the concurrent desktop guidance refinement's current visible-date contract.                                                                                                                                                                                           |
| Corrected phone/wide tracking-grid contract                                                    | PASS: 1 case. `output/home-final-tracking.log`. Five timing targets and actual content fit are checked at both widths.                                                                                                                                                                                                                                        |
| `pnpm build:pages` after final location CSS                                                    | PASS, original ceilings/baseline intact; Home startup graph 517,536 gzip bytes. `output/home-final-pages.log`.                                                                                                                                                                                                                                                |
| `pnpm test:e2e:inventory`                                                                      | PASS: 3,565 test identities, no missing or duplicate shard coverage. `output/home-final-browser-inventory.log`.                                                                                                                                                                                                                                               |

Final scoped Prettier and ESLint checks passed (`output/home-final-format.log`, `output/home-final-lint.log`); `git diff --check` passed. Inventory was recollected after the last test-title change with the same 3,565 identities and complete shard coverage. HEAD remains `be3146ac`; release notes and bundle baseline are unchanged.

Browser snapshots use isolated locally built previews with the repository's loopback test API namespace. Later CSS changes are covered by the specific affected cases; unchanged successful cases were not repeatedly rerun. Failure logs remain available. A combined full-browser or release-ready result is not claimed.

## Visual/manual evidence

Actual rendered screens are saved under `output/playwright/home-overview/`: Arabic/English 320/390/834/1440 collapsed/expanded views; long-location normal/enlarged views; loading/success/denial dialog states; and light/dark/midnight Glass captures. The phone header, location-result dialog, long-name enlarged layout and representative phone/desktop Glass captures were visually inspected. The first enlarged English location screenshot revealed fragmented words despite passing overflow assertions; a full-row narrow-text fallback and whole-word regression corrected it. Additional prayer hierarchy/selection/motion evidence remains in the browser output directories. Simulated GPS proves UI handling, not real-device location accuracy.

## Documentation updated

README, Architecture, Design System, Prayer Times, Motion System, Quality Checklist, Test Strategy, Home phase brief, decision log and this report. The active index links this report and retains the Home phase's local-only hold.

## Decisions recorded

The 2026-11-24 Home location-adjacency decision records the owner's approval to continue local refinements. Preserve the original desktop anatomy, centered phone tiles, material adaptation and the global publication hold. Widgets remain separate design work.

## Known limitations or remaining risks

Physical Android/iPhone, TalkBack/VoiceOver and field geolocation acceptance remain pending. Concurrent checkout changes can invalidate a combined quality result; final consolidation must verify its exact final inputs. No complete CI, deployment or repository-wide browser-matrix pass is claimed.

## Out-of-scope findings

The full-check log identifies lint/format failures in independently generated `docs/external-sources/` files. Preserve those files for their owning work. The shared test registration was subsequently added by the concurrent desktop refinement; the earlier failure remains in the evidence.

## Recommended next step

Owner review of the actual phone/tablet/desktop screenshots, then physical-device/assistive-technology acceptance and exact-snapshot consolidation in the separately designated release chat. No commit, push, deployment or release-note change was made here.
