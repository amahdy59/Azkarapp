# Phase Report — Home corner status, summary strip and split location

## Objective

Apply the owner's final correction: preserve the original desktop/tablet prayer cards and present status as passive corner badges that occupy no name/time layout space. Complete the approved compact Now/Next and location controls locally.

## Scope completed

- Recorded check, eligible-unrecorded circle and directional next arrow float across the top logical-start corner: right in Arabic and left in English. Future unrecorded prayers render no badge and retain readable muted ink/borders.
- Desktop/tablet retain the existing 9.5rem minimum, original type steps, padding, individual material surfaces and icon/name/time anatomy. Current marker, next emphasis, dated recording and selected details remain independent.
- Now/Next and countdown share one baseline at ordinary widths and reflow naturally at narrow/enlarged measures. The compact disclosure retains its 44px native target, localized accessible name and actual expanded state.
- A content-width split location control replaces the wide bar and separate Change/Refresh labels. City opens existing settings; the crosshair explicitly detects fresh coordinates. Existing busy, failure, protected results and focus recovery remain.

## Files changed

- Presentation: `src/app/components/HomePrayerOverview.tsx`, `HomeLocationRow.tsx`, `home-prayer-overview.css` and `icons.ts`.
- Tests: `src/app/components/HomePrayerOverview.test.tsx`, new `HomeLocationRow.test.tsx`, `e2e/helpers/home-overview.ts`, `e2e/home-prayer-overview.spec.ts` and new `e2e/home-prayer-status.spec.ts`.
- Documentation: `README.md`, architecture/design/quality/prayer/motion/coverage documents, agent index/decision log, the scoped phase, this report and the evidence gallery.

Independent pending Home/Settings/Learn/document changes were preserved. No reviewed content, dependency, calculation, state schema, normalization, persistence or synchronization code was changed in this follow-up.

## Components added or modified

HomePrayerOverview, HomePrayerSummary and HomeLocationRow; existing shared Button and icon-export layer are reused. No new runtime component primitive or dependency is introduced.

## User-visible changes

Corner state indicators replace status text/dividers; the prayer time gets its full width. The original desktop/tablet card presentation is restored. The context strip is shorter where labels fit, and location actions occupy only their content width. Explicit opening, recording, hiding and location selection/detection preserve the existing behavior.

## Accessibility work

Localized hidden descriptions retain each prayer's time, temporal state, recorded meaning, countdown and existing unavailable explanation. Native titles explain icon-only states on hover. Badges are decorative, pointer-transparent and absent from the tab order. City accessible names include their visible label. Detection announces its local busy state, prevents duplicate activation and retains result-dialog focus recovery. Separate 44px controls, visible focus, semantic order, enlarged text and both motion preferences remain.

Browser geometry checks verify badge overlay placement and no time displacement when a badge is removed, original wide-card dimensions/type, whole-word long-location reflow, contained targets and accessibility fallbacks. Automated axe and simulated engines do not establish human screen-reader or physical-device acceptance.

## Tests added or updated

- Units cover independent dated recording, empty future presentation with accessible meaning, preserved disclosure, bilingual city selection/detection, no automatic location request, busy state and honest device-location context.
- The new browser suite covers Arabic/English × Glass/light solid × phone/tablet/desktop/320px-at-200%, recording/reload/focus, zero layout displacement from badges, original desktop/tablet type/size, direction, next accent, location targets and axe.
- Existing overview/helper assertions now describe the approved corner geometry and one-line/reflowing summary while retaining chronology, availability, calendar/Friday, reading position, long names, explicit detection, failed-location retention and protected dialog recovery.

## Commands run

Development diagnostic logs remain beneath ignored `output/`. No assertion, budget, coverage threshold or browser identity was removed or weakened. Results below describe individual runs and are not additive counts of unique cases.

| Command                                                                                                                                                                                                               | Result                                                                                                                                                                                                                          |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm test:run src/app/components/HomePrayerOverview.test.tsx src/app/components/HomeLocationRow.test.tsx src/app/screens/HomeScreen.render.test.tsx`                                                                 | Passed: 3 files / 31 tests in the initial presentation run; the final source also passed the complete enforced-coverage gate below. `output/home-inline-status-units.log`.                                                      |
| Scoped `pnpm exec eslint … --max-warnings 0` over presentation and browser/unit files                                                                                                                                 | Passed, zero warnings. `output/home-prayer-status-lint.log`.                                                                                                                                                                    |
| Scoped `pnpm exec prettier --check …` over changed code and documentation                                                                                                                                             | Passed. Touched Markdown was normalized to the repository's LF contract. Logs: `output/home-prayer-status-doc-format.log`, `output/home-prayer-status-final-format.log`.                                                        |
| `pnpm test:e2e e2e/home-prayer-status.spec.ts e2e/home-prayer-overview.spec.ts e2e/home-prayer-dialog.spec.ts e2e/home-prayer-motion.spec.ts e2e/home-prayer-scroll.spec.ts --project=desktop-chromium --workers=2`   | 64 passed / 1 failed: the English 320px/200% long-city case exposed insufficient city reading width. Its corrective runs are recorded below. `output/home-prayer-status-regression.log`.                                        |
| `pnpm test:e2e e2e/home-prayer-status.spec.ts e2e/home-prayer-overview.spec.ts --project=desktop-chromium --workers=2 --grep '320px                                                                                   | 200 percent'`                                                                                                                                                                                                                   | 9 passed / the same 1 failed while a later base rule still overrode narrow padding. The final fix retains a 44 CSS px crosshair width and gives the scoped narrow padding precedence. `output/home-prayer-status-enlarged.log`. |
| `pnpm test:e2e e2e/home-prayer-overview.spec.ts --project=desktop-chromium --workers=1 --grep 'Home long location.*en 200 percent'`                                                                                   | Passed: the previously failing case, with whole-word reflow, two reachable actions, no clipping/overflow and successful hit-testing. `output/home-prayer-status-long-city.log`.                                                 |
| `pnpm test:e2e e2e/home-prayer-status.spec.ts e2e/home-prayer-overview.spec.ts e2e/home-time-actions.spec.ts --project=desktop-firefox-smoke --project=mobile-webkit-smoke --workers=2 --grep 'corner prayer statuses | Home location uses                                                                                                                                                                                                              | Home long location                                                                                                                                                                                                              | Interval summary'` | Passed: all 46 cases, 23 per engine, on the final source. Includes both languages/materials, all four status viewports, 320px/200%, every long-location case, GPS success/denial/focus and accessibility fallbacks. `output/home-prayer-status-cross-engine.log`. |
| `pnpm test:e2e e2e/home-glass-material.spec.ts e2e/home-time-actions.spec.ts --project=desktop-chromium --workers=2 --grep 'all Home cards retain glass                                                               | Interval summary has stable accessibility'`                                                                                                                                                                                     | Passed: 8 cases, including all three themes × both languages through responsive resizing, plus high-contrast/reduced-transparency geometry and axe. `output/home-prayer-status-materials.log`.                                  |
| `pnpm check`                                                                                                                                                                                                          | Passed: all 14 stages, including complete enforced-coverage units, typecheck, lint, format, content/audio/timing checks, type scale, motion, build, bundle and CSS gates; 160.9 seconds. `output/home-prayer-status-check.log`. |
| `pnpm build:pages`                                                                                                                                                                                                    | Passed, including bundle/CSS gates; startup JavaScript/CSS/HTML 520,534 gzip bytes. `output/home-prayer-status-pages.log`.                                                                                                      |
| `pnpm test:e2e:inventory`                                                                                                                                                                                             | Passed: 3,742 browser identities scheduled exactly once across the nine partitions. `output/home-prayer-status-inventory.log`.                                                                                                  |
| `git diff --check`                                                                                                                                                                                                    | Passed.                                                                                                                                                                                                                         |

Browser tests used a freshly built isolated loopback preview. The final cross-engine/material selections shared that unchanged build via the supported E2E_BASE_URL option; no production visitor/device or snapshot writes were made. The initial inline-design diagnostics remain local under `output/home-inline-status-*.log` and are superseded by the owner-corrected corner presentation. Checks were repeated only for source corrections, unresolved failures, distinct engine/material coverage or the owner's screenshot request.

## Visual/manual evidence

The [actual-app evidence gallery](../evidence/home-prayer-status/README.md) contains Arabic phone (390 × 900), tablet (768 × 900), desktop (1440 × 900), narrow 320px/200% and English light phone/desktop captures. These show the corrected original-size cards and corner badges, not generated concepts. A fixed Cairo clock and synthetic guest records keep state reproducible. No real personal prayer/location record is modified by the fixtures. The owner explicitly requested these responsive screenshots during verification.

## Documentation updated

The scoped phase and decision log record the owner's correction from inline status to passive corner badges and preservation of the original desktop/tablet presentation. Current contract additions supersede the earlier visible status-footer/two-line/location-bar descriptions only. Historical phase records and independent local scopes remain intact.

## Decisions recorded

The latest owner correction takes precedence over the earlier inline concept. Summary and location refinements remain approved. Work stays local under the existing publication hold; no commit, push, deployment or release-note change is performed.

## Known limitations or remaining risks

All required local phase checks completed; this is not exact-commit CI or deployment evidence. Human screen-reader use, native physical-device gestures and final owner visual acceptance remain separate checks. Extremely enlarged text intentionally reflows/scrolls instead of shrinking to fit one line.

## Out-of-scope findings

The shared checkout includes independent Settings, Learn, devotional-document and English-sample work, all preserved. The aggregate pnpm check passed for the tested snapshot. Documentation/evidence completion after that run is not a reusable release receipt; any eventual publication must use the intact current-input hooks and exact-commit CI.

## Recommended next step

Review the actual corrected screens and complete physical-device/screen-reader acceptance. Preserve the publication hold until a separate release is authorized and all intact combined-checkout gates pass.
