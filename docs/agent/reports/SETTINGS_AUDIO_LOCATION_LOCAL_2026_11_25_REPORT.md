# Phase Report — Settings audio, downloads and location

The owner subsequently approved all four recommendations. Their implementation and verification are recorded in [the Settings summaries follow-up](SETTINGS_SUMMARIES_LOCAL_2026_11_25_REPORT.md); the original checkpoint below is preserved.

## Objective

Separate listening preferences from offline downloads, replace coordinate-only prayer-location summaries with readable place context, and identify further Settings improvements. Local review only; no commit, push, deployment or release-note changes.

## Scope completed

- Added a direct Downloads destination alongside Audio & recitations in the existing menu and search. Audio holds voice, speed, listening continuation and resume controls; Downloads retains its existing acquisition/storage controls.
- Removed the nested Downloads row from Audio. Back returns to the main menu and restores the Downloads opener. Existing deep links and prayer subpanel navigation remain.
- Reused the offline city catalogue for coordinate-only or unnamed locations: the nearest city within 75 km produces localized “Near city, country” wording. Elsewhere, Device location or Saved location avoids an invented place. Custom names and recognized preset localization remain intact.
- Retained exact GPS coordinates, timezone, calculation settings, local persistence and existing normalization. No geocoding request, runtime dependency, content or download-service change.

## Files changed

| Area                  | Files                                                                                                                                                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Location presentation | `src/app/content/prayerLocations.ts`, `prayerLocations.test.ts`                                                                                                                                                          |
| Settings composition  | `src/app/screens/settings/SettingsRootPanel.tsx`, `SettingsRootPanel.test.tsx`, `SettingsScreen.tsx`, `AudioSettingsPanel.tsx`, `AudioSettingsPanel.test.tsx`, `PrayerLocationPanel.tsx`, `PrayerLocationPanel.test.tsx` |
| Product copy          | `src/app/i18n/ar.ts`, `src/app/i18n/en.ts`                                                                                                                                                                               |
| Browser regressions   | `e2e/settings-simplification.spec.ts`, `e2e/navigation.spec.ts`, `e2e/glass-reader-polish.spec.ts`                                                                                                                       |
| Documentation         | `README.md`, `docs/PRAYER_TIMES.md`, `docs/agent/INDEX.md`, `docs/agent/DECISION_LOG.md`, the linked phase brief and this report                                                                                         |
| Screenshots           | `docs/agent/evidence/settings-audio-location/`                                                                                                                                                                           |

## Components added or modified

No new components. Modified SettingsRootPanel, SettingsScreen, AudioSettingsPanel and PrayerLocationPanel using the existing rows, icons, headings, controls and routes.

## User-visible changes

Settings now has eight primary destinations. Audio & recitations and Downloads open independently. The screenshot's coordinates, 30.55°, 31.06°, display as “Near Cairo, Egypt” / “بالقرب من القاهرة، مصر”. Prayer-location details keep the coordinates available below the readable name. Downloads uses a concise main-menu label to preserve space at enlarged text sizes.

## Accessibility work

Preserved native buttons, labelled search, existing protected voice selection, visible focus, heading focus and bilingual direction. Browser regressions exercise Back focus recovery, keyboard-operated download disclosures, 44px download controls, horizontal overflow and axe scans on Downloads. Screenshot review includes phone, tablet, desktop and narrow enlarged text. No screen-reader or physical-device acceptance is claimed.

## Tests added or updated

- Offline nearby-place localization, precise-coordinate preservation, custom names, missing/invalid coordinates and remote-location fallback.
- Separate primary Audio/Downloads destinations and download search.
- Audio title and absence of its former nested Downloads control.
- Successful GPS display using nearby-city wording while retaining method and adjustments.
- Bilingual direct navigation, Back focus, deep links, updated Glass-row label, responsive menu and Downloads evidence.

## Commands run

| Command                                                                                                                                                                                                                                                                      | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node --version`; `pnpm --version`                                                                                                                                                                                                                                           | Node v24.15.0; pnpm 11.19.0. The full gate's toolchain check passed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `pnpm test:run src/app/content/prayerLocations.test.ts src/app/screens/settings/SettingsRootPanel.test.tsx src/app/screens/settings/AudioSettingsPanel.test.tsx src/app/screens/settings/PrayerLocationPanel.test.tsx src/app/screens/settings/PrayerSettingsPanel.test.tsx` | PASS: 5 files, 28 tests, including the final missing-coordinate guard.                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `pnpm check`                                                                                                                                                                                                                                                                 | FAILED in 291.8s. Full unit/coverage, build, bundle, CSS utilities, audio manifest, timing, type-scale and motion stages passed. The first typecheck found optional coordinates in the new helper; corrected and independently rechecked successfully. Lint found 22 errors in independent external-source scripts; formatting found 21 files, including this phase's decision-log addition and 20 independent external-source files. The decision log was subsequently formatted. Full output: `output/settings-audio-location-check.log`. |
| `pnpm typecheck`                                                                                                                                                                                                                                                             | PASS after the missing-coordinate correction and again on the final source.                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `pnpm exec eslint <all changed src/e2e files> --max-warnings 0`                                                                                                                                                                                                              | PASS.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `pnpm test:e2e e2e/settings-simplification.spec.ts --project=desktop-chromium --project=desktop-firefox-smoke --project=mobile-webkit-smoke`                                                                                                                                 | Initial run: PASS, 18 tests. Final expanded matrix: PASS, 27 tests in 5.6m, zero failures. Seven responsive scenarios and bilingual Back recovery in all three engines. Final report: output/settings-audio-location-final-e2e.json.                                                                                                                                                                                                                                                                                                        |
| `pnpm test:e2e e2e/settings-simplification.spec.ts e2e/navigation.spec.ts e2e/glass-reader-polish.spec.ts --project=desktop-chromium --grep 'ar/(1440\|1024)\|en/320\|secondary app state\|Glass cards reveal'`                                                              | PASS: 5 tests, including Arabic desktop/tablet, English 320px/200%, deep-link Back and Glass hover. Report: `output/settings-audio-location-additional-e2e.json`.                                                                                                                                                                                                                                                                                                                                                                           |
| `pnpm build:pages`                                                                                                                                                                                                                                                           | PASS, including bundle and CSS-utility checks, repeated after subtitle refinement. Final startup graph: 519,408 gzip bytes within the unchanged budget. Final log: output/settings-audio-location-pages-final.log. Earlier build log: Log: `output/settings-audio-location-pages.log`.                                                                                                                                                                                                                                                      |

## Visual/manual evidence

Final scoped verification also passed: `pnpm test:run src/app/screens/settings/SettingsRootPanel.test.tsx` (1 file, 6 tests), ESLint over all changed source/browser files, Prettier over all changed source/browser/documentation files and the phase/report, and `git diff --check` over the scoped tracked changes. No unrelated external-source files were formatted or repaired.

Actual browser screenshots are preserved in [the evidence directory](../evidence/settings-audio-location/). Reviewed Arabic phone, English desktop, Arabic desktop/audio, Arabic tablet and narrow enlarged-text captures. The enlarged English capture prompted removal of the nonessential Downloads subtitle from the main menu.

## Documentation updated

README documents separate destinations and offline place context. PRAYER_TIMES defines the approximate 75 km display boundary and unchanged calculation/privacy contract. The phase brief, index and decision log record the local scope and publication hold.

## Decisions recorded

The latest owner request supersedes only the combined Audio & downloads presentation. Use offline, explicitly approximate place context; never derive actual location from the device timezone. Preserve independent devotional-document work and keep changes local.

## Known limitations or remaining risks

- The built-in city catalogue is intentionally small. Locations outside its 75 km coverage use a generic label; readers can select or enter their own city. Nearby-city wording does not establish an administrative country boundary.
- At 320px/200% text, the existing shell leaves a small scrollable content area. Controls remain reachable through scrolling; this phase does not redesign the shared shell.
- A fully green repository-wide gate remains unavailable because of independent external-source lint/format failures. No assertions, coverage, budgets or gate policies were weakened, and those files were left untouched.
- No full local browser inventory, production verification or physical assistive-technology acceptance was performed for this local-only change.

## Out-of-scope findings

Useful next refinements: show the selected voice/speed under Audio; show verified download readiness and used space under Downloads without triggering a menu-time verification scan; expose reminder on/off status beside the location; replace the Garden-only Progress summary with a clearer tracking/weekly-goal summary. These remain recommendations.

## Recommended next step

Review the local Settings changes and screenshots, then choose whether to implement the concise status summaries. Resolve the separate document-tooling failures before a consolidated release.
