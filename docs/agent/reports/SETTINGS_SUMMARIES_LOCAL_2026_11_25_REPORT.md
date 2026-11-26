# Phase Report — Settings summaries

## Objective

Apply all four owner-approved Settings recommendations locally, continuing the [audio/location phase](../phases/SETTINGS_AUDIO_LOCATION_LOCAL_2026_11_25.md). No commit, push, deployment or release-note update.

## Scope completed

- Audio & recitations displays the selected voice and localized playback rate, updating from local edits without requiring an active player.
- Downloads displays unchecked, downloading, or last-verified group readiness and approximate app-origin storage usage. It reuses the existing scan and does not scan caches when the menu opens.
- Prayer & reminders retains the location and adds saved reminder selection status. This describes configuration, not permission or guaranteed delivery, and includes optional reminders while excluding an empty prayer selection.
- Progress preferences shows the weekly goal when Garden is enabled. When hidden, it explains that progress stays saved on this device.
- Desktop Downloads now highlights its own row rather than Audio.

## Files changed

| Area                              | Files                                                                                                                                                                                                                   |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Passive summary formatting        | `src/app/screens/settings/settingsSummaries.ts`, `settingsSummaries.test.ts`                                                                                                                                            |
| Settings presentation/composition | `SettingsRootPanel.tsx`, `SettingsRootPanel.test.tsx`, `SettingsScreen.tsx`, `AudioSettingsPanel.tsx`, `AudioSettingsPanel.test.tsx`, `DownloadsPanel.tsx`, `DownloadsPanel.test.tsx` under `src/app/screens/settings/` |
| Existing download store           | `src/app/downloads/downloadSession.ts`, `downloadSession.test.ts`                                                                                                                                                       |
| Bilingual product copy            | `src/app/i18n/ar.ts`, `src/app/i18n/en.ts`                                                                                                                                                                              |
| Browser regression                | `e2e/settings-simplification.spec.ts`                                                                                                                                                                                   |
| Documentation                     | README, Architecture, Design System, Quality Checklist, audio/offline-caching, agent phase/index/decision log and reports                                                                                               |
| Screenshot evidence               | `docs/agent/evidence/settings-summaries/`                                                                                                                                                                               |

Earlier location/separation changes remain part of the local working tree. Independent devotional-document edits were preserved.

## Components added or modified

Modified SettingsScreen, SettingsRootPanel, AudioSettingsPanel and DownloadsPanel; added no visual component. Existing settings rows own passive, naturally wrapping descriptions. A pure formatter translates existing state; screen composition owns the data access.

## User-visible changes

Readers can see current voice/speed, reminder choices, weekly goal and last checked download context before opening a section. Approximate storage explicitly refers to app-origin usage, including other app caches; it is not device free space or exact downloaded-audio size. A new document or mismatched selected voice asks for a new check. Transfer/removal/new-scan/private-data clearing invalidate the old result; byte progress does not repeatedly repaint the menu.

## Accessibility work

Preserved existing row buttons, 44px targets, headings, keyboard order, protected overlays, Back focus recovery and theme tokens. Descriptions wrap in RTL/LTR and remain passive, without adding a live region to Settings. Browser evidence includes root and Downloads axe scans, desktop selected-row identity, 320px/200% text, phone, tablet and desktop. Human screen-reader/physical-device acceptance remains separate.

## Tests added or updated

- Localized summaries, selected/disabled/optional/empty-prayer reminder states, visible/hidden Garden, unknown/active/checked download states, unavailable storage estimates and voice mismatches.
- Preference-change propagation without an active player.
- Readiness publication after both verification scans complete; invalidation during transfers and private-data clear; stable summary identity during byte progress.
- Browser assertions for initial summaries, speed updates, checked readiness/storage, direct Downloads highlight, Back focus, reflow and root/Downloads accessibility scans.

## Commands run

| Command                                                                                                                                                                                                                                                                | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm test:run src/app/screens/settings/settingsSummaries.test.ts src/app/screens/settings/SettingsRootPanel.test.tsx src/app/screens/settings/AudioSettingsPanel.test.tsx src/app/screens/settings/DownloadsPanel.test.tsx src/app/downloads/downloadSession.test.ts` | PASS: 5 files, 52 tests.                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `pnpm typecheck`                                                                                                                                                                                                                                                       | PASS.                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `pnpm test:e2e e2e/settings-simplification.spec.ts --project=desktop-chromium`                                                                                                                                                                                         | PASS: 9 tests, including seven responsive scenarios and bilingual Back recovery. Report: `output/settings-summaries-chromium-e2e.json`.                                                                                                                                                                                                                                                                                                                                    |
| Final focused browser verification                                                                                                                                                                                                                                     | PASS: six selected cases per engine verified across Chromium, Firefox and WebKit. The combined focused run passed all six Chromium cases and five Firefox cases; its Firefox asset-load failure passed in isolation. The dedicated fixed preview passed all six WebKit cases in 3.0m. Reports: output/settings-summaries-firefox-isolated.json and output/settings-summaries-webkit-isolated.json. Earlier interrupted shared-preview diagnostics are retained separately. |
| `pnpm check`                                                                                                                                                                                                                                                           | FAILED in 355.1s solely on formatting in five independently edited Home browser specs (home-date-rail, home-prayer-motion, home-prayer-scroll, home-scroll-material and sticky-prayer-cards). Full unit/coverage, lint, types, build, bundle, CSS, content/timing and motion checks passed. Full output: `output/settings-summaries-check.log`.                                                                                                                            |

## Visual/manual evidence

Final focused WebKit verification passed all six selected cases against `http://127.0.0.1:4201`, an independently built `output/settings-summaries-frozen-preview/` artifact with the repository's loopback browser-test environment. The fixed preview prevents concurrent `.playwright-dist` rebuilds from removing files during a browser session. The Firefox reproduction passed in 10.8 seconds. Its earlier trace explicitly showed JavaScript asset 404s and MIME rejection while the shared preview files changed; no preference reset was needed or performed.

Final isolated commands used `E2E_BASE_URL=http://127.0.0.1:4201`:

```text
pnpm test:e2e e2e/settings-simplification.spec.ts --project=desktop-firefox-smoke --grep 'Settings preference summaries: en/1440/1' --output output/settings-summaries-firefox-isolated-results
pnpm test:e2e e2e/settings-simplification.spec.ts --project=mobile-webkit-smoke --grep 'en/1440/1|ar/320/2|nested Settings Back' --output output/settings-summaries-webkit-isolated-results
```

`pnpm test:e2e:inventory` failed during the changing shared-checkout collection: 0 missing, 1 extra. The extra identity belongs to the independent `learning-library.spec.ts` case “Learn and publication layouts reflow across themes and reading widths”, which arrived between snapshots. Log: `output/settings-summaries-inventory.log`. The unchanged inventory checker and complete test set remain intact; rerun against the frozen consolidated release input.

The first combined Firefox/WebKit run completed all nine Firefox cases, then exposed two WebKit test-budget timeouts during concurrent quality work and two assertions that incorrectly required storage estimates on an engine without that capability. It was stopped for diagnosis, retaining traces in `output/settings-summaries-first-webkit/`. The assertion now checks both supported and unavailable estimate behavior. WebKit is rerun without the concurrent quality workload and with its own artifact directory. Production code was unchanged by this test correction.

A separate WebKit rerun passed the first phone case but reproduced the desktop test-budget timeout. Its trace showed individual screenshot captures taking up to 11 seconds; management received less than nine seconds of the existing 90-second case budget. CSS-resolution screenshots alone still left the phone case close to that limit. Routine screenshot capture now belongs to Chromium, while every engine retains all functional, geometry, keyboard and axe assertions and failure traces. Existing reviewed Firefox/Chromium screenshots remain preserved. No test timeout or assertion was reduced or removed. Additional diagnostic traces remain in `output/settings-summaries-webkit-results/` and `output/settings-summaries-webkit-css-results/`.

The same long case still exhausted WebKit's whole-case budget after screenshot consolidation, although phone/enlarged cases passed. The final test structure separates preference editing from download-management/readiness checks, with the latter explicitly seeded to the same large-text/1.25× state. All previous assertions remain across those two focused tests, with unchanged timeouts. Final verification selects English desktop, Arabic 320px/200% and bilingual Back recovery in all three engines. No production implementation was altered for these test scheduling corrections.

`pnpm build:pages` passed, including bundle/CSS checks (mixed-checkout startup graph: 519,022 gzip bytes). Log: `output/settings-summaries-pages.log`. Scoped ESLint and Prettier passed for the Settings/download code, browser tests and updated documentation. The prior navigation title change was formatted while preserving the independently arriving Home assertions in that file.

Reviewed actual Arabic phone and English desktop screenshots showing all summaries and Downloads' selected identity. Further screenshots are preserved in [the evidence directory](../evidence/settings-summaries/). Narrow text remains scrollable within the existing shell; this phase does not change the shared shell.

## Documentation updated

README explains concise status summaries. Architecture and audio/offline-caching define the in-memory last-check boundary, voice matching, invalidation and absence of menu-time scans. Design System and Quality Checklist define passive row reflow, truthful copy and required regressions. The phase brief and decision log record approval and the publication hold.

## Decisions recorded

All four recommendations are approved locally. Keep exact file verification and persisted settings unchanged; reuse existing checks and do not infer delivery or current readiness from metadata alone. Last-check results are deliberately transient and explicitly historical.

## Known limitations or remaining risks

- Cache eviction after the last check remains possible; reopening Downloads performs the authoritative verification.
- Storage estimates are browser-origin estimates. If unavailable, readiness remains visible without an invented storage figure.
- Saved reminder choices do not prove notification permission, a scheduled native alarm or later delivery.
- The shared shell leaves a small scrolling region at 320px/200% text; normal phone/tablet/desktop layouts retain existing behavior.
- The current full gate is blocked by formatting in five independently edited Home browser specs. Inventory collection also saw one independently added learning-library case between full/shard snapshots (0 missing, 1 extra); no test was omitted or scheduled away. Independent source/test work continued during this phase; no consolidated-release readiness is claimed. No assertions, coverage or budgets were weakened.
- No production, full browser inventory or physical assistive-technology acceptance is claimed for this local-only phase.

## Out-of-scope findings

Independent devotional-document work remains unmodified by this phase.

## Recommended next step

Review the local summaries/screenshots and resolve independent repository gate failures before a consolidated release.
