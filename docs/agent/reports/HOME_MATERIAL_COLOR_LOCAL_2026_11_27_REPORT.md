# Phase Report — Home material color pairing, local 2026-11-27

## Objective

Correct the owner's screenshot-reported light sharing card on Glass Home and pale books-button text on a pale background. Keep the desktop horizontal/mobile-simple sharing design and apply locally only.

## Scope completed

Home already resolves its material independently of the application theme. Sharing now receives that resolved value and uses the same existing Glass companion as the books/tools; it returns to solid when scenery is disabled/unavailable. The shared Home Glass companion now pairs on-media foreground and background tokens for nested outline controls, preventing light-theme fills beneath white labels. The adjacent More action and books/sharing icon accents now use their matching Home material roles. The QR keeps its unchanged black-on-white pixels.

## Files changed

- `src/app/screens/HomeScreen.tsx`: pass resolved material to sharing; opt More into the same Glass family.
- `src/app/screens/HomeAppShareSection.tsx`, `src/app/components/HomeAppShareCard.tsx`: forward/use the presentation flag without creating appearance state.
- `src/app/components/HomeLearningCard.tsx`: matching on-media books accent.
- `src/styles/theme/layout.css`: shared Home Glass background/foreground pairing for nested controls.
- `src/app/components/home-wird.css`: matching sharing accent/ink pair.
- `src/app/screens/HomeScreen.render.test.tsx`: surviving trigger/material integration regression.
- `e2e/home-material-colors.spec.ts`: theme/material/contrast/fallback regression matrix.
- `e2e/home-app-sharing.spec.ts`: intentional Glass card uses exact peer material/ink checks; solid card/QR/overlay protection and every geometry/hit/focus assertion remain.
- README, architecture, design system, quality checklist, design coverage, working index, phase brief, this report and evidence gallery.

Existing independent modifications to shared files are preserved and are not attributed to this phase.

## Components added or modified

HomeAppShareSection/HomeAppShareCard now consume the parent's resolved presentation. HomeLearningCard keeps the existing HomeCard and Button. The shared Home Glass companion supplies a coherent nested control palette. No new runtime component or dependency was added.

## User-visible changes

- Glass sharing/More match the surrounding Home surfaces even over a solid Light app theme.
- The books button has light text on a dark control ground; its icon and sharing cue remain visible.
- Light/Dark/Midnight solid surfaces retain their own palette. High-contrast/reduced-transparency and unavailable-photo behavior remain intact.
- The QR stays white for reliable scanning. Sharing behavior, desktop columns, mobile actions and all devotional content remain unchanged.

## Accessibility work

Explicit books-action foreground/background contrast at least 4.5:1, actual focus/hover regression checks, matching Glass text/tint/frost across peer cards, protected sheet/QR preservation, and card-level axe checks. Existing enlarged layout, hit testing and responsive focus assertions remain active. Matching the material is asserted independently of contrast because the previous white sharing card could pass axe while still using the wrong appearance family. No complete WCAG, physical scanning or human assistive-technology pass is inferred.

## Tests added or updated

- Unit integration proves changing the resolved Home presentation changes the existing sharing trigger without replacing it.
- New browser matrix covers Light/Dark/Midnight solid/Glass, independent App/Home choices, explicit Glass under reduced transparency, system reduced-transparency fallback, high contrast, 320px/200% text and real aborted-photo recovery, Arabic/English.
- Existing sharing checks compare intended Glass card paint/ink to the neighboring Home reading card; solid opacity and protected modal/QR contracts remain unchanged.

## Commands run

| Command                                                                                                                                                                                        | Result                                                                                                                                                                                                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm test:run src/app/screens/HomeScreen.render.test.tsx src/app/share/appSharing.test.ts src/app/components/AppShareSheet.test.tsx src/app/screens/HomeLearningSection.test.tsx`             | All 4 files / 32 tests passed. Log: `output/home-material-unit-final.log`.                                                                                                                                                             |
| `E2E_BASE_URL=http://127.0.0.1:4198 pnpm test:e2e e2e/home-material-colors.spec.ts --project=desktop-chromium --output=output/home-material-final-artifacts`                                   | All 24 final matrix cases passed. Report: `output/home-material-final-chromium.json`.                                                                                                                                                  |
| Same spec, Firefox/WebKit projects, `--grep 'light Glass over solid\|solid Home over App Glass'`                                                                                               | All 8 final cross-engine independent-material cases passed. Report: `output/home-material-cross-final.json`. The preceding broader 16-case cross-engine matrix also passed before the final More/icon additions.                       |
| `pnpm test:e2e e2e/home-app-sharing.spec.ts --project=desktop-chromium --grep 'fits (320\|1440)px\|preserves focus' --output=output/home-material-sharing-artifacts` with the isolated preview | All 7 affected sharing layout/contrast/focus regressions passed. Report: `output/home-material-sharing-regression.json`.                                                                                                               |
| Targeted ESLint and Prettier for source, CSS and tests                                                                                                                                         | Passed, zero lint warnings.                                                                                                                                                                                                            |
| `pnpm typecheck` during implementation                                                                                                                                                         | Failed only at the concurrently modified `src/app/components/LearningDiagram.tsx:89` (`string \| undefined` argument). No error in this phase's files; independent work was left untouched. Log: `output/home-material-typecheck.log`. |

The final feature selection therefore passes 39 browser cases and 32 focused units. The isolated browser build is in `output/home-material-final-preview/` (loopback-only test backend), avoiding competing writes to the shared browser build directory. Final aggregate gate/build/inventory results are recorded after completion; no aggregate pass is inferred from the feature checks.

### Aggregate results and final local status

| Command                                                                          | Recorded result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm check`                                                                     | Failed on its shared-checkout snapshot: 409 files / 2,882 tests passed, 3 files / 4 tests failed. Failures are the independent book source audit, two Khatmah page-magnification assertions and one QuranListeningReader magnification assertion. Typecheck failed in LearningDiagram; lint failed on LearningDiagram inline copy and CollectionShareModal's unused import; formatting reported eight shared/independent files. Build, timing/manifest/type-scale/motion and CSS-utility stages passed. Total output exceeded the existing ceiling. Log: `output/home-material-check.log`. |
| `pnpm build:pages`                                                               | Vite/PWA compilation passed; the total-output budget failed: 12,599,355 versus 12,582,912 bytes (16,443 over). Home startup 537,682 gzip bytes passes its baseline allowance. Log: `output/home-material-pages.log`.                                                                                                                                                                                                                                                                                                                                                                       |
| `pnpm test:e2e:inventory`                                                        | Passed: 4,989 tests exactly once across nine partitions, counts `[664,601,590,760,729,498,485,506,156]`. Independent tests changed during this local phase. Log: `output/home-material-inventory.log`.                                                                                                                                                                                                                                                                                                                                                                                     |
| Targeted final source/CSS/test lint, formatting and phase diff whitespace checks | Passed. Broad shared-document formatting drift is retained separately rather than formatting unrelated sections.                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

All reported Home color defects are corrected locally and the actual screenshot gallery is refreshed. The feature tests pass; the aggregate checkout is not represented as release-ready. No commit, push, release-note edit, dependency change, hook bypass, receipt fabrication, limit increase or deployment was performed.

## Visual/manual evidence

The [actual-app gallery](../evidence/home-material-colors/README.md) includes corrected Glass-over-Light, Midnight Glass, solid Light and narrow/enlarged captures. Further actual output is retained under `output/playwright/home-material-colors/`. Screenshots were inspected separately from automated contrast/material tests.

## Documentation updated

README, architecture, design system (including the corrected sharing-card material contract), quality checklist, design coverage, index, phase brief, report and gallery. Earlier intentional opaque QR/overlay rules remain; only the mistakenly forced-solid sharing card is superseded.

## Decisions recorded

The owner's screenshots establish the material mismatch; the local corrective plan is recorded in `phases/HOME_MATERIAL_COLOR_LOCAL_2026_11_27.md`. Home/App remain independently selectable. No commit, push, publication, release notes, content or schema changes are authorized by this phase.

## Known limitations or remaining risks

The shared checkout has independent Learn/content/format/build work and previously recorded total-output budget pressure. Final aggregate results must be read separately below. Native display, physical QR scanning and human screen-reader acceptance remain separate; no release or deployment is performed.

## Out-of-scope findings

The unrelated LearningDiagram typing error was reported rather than silently repaired. No religious wording, prayer behavior, audio controller, data persistence, synchronization, native plugin, dependency, threshold or coverage contract changed.

## Recommended next step

Review the corrected local Home in the selected theme/material; preserve the publication hold. Resolve remaining independent aggregate checks as part of a separately coordinated release before publishing.
