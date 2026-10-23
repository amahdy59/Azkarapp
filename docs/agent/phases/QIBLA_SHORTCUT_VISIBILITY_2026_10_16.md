# Phase Report — Qibla shortcut visibility

## Objective

Hide Qibla shortcuts in desktop layouts while retaining phone/tablet access. Originally local-only; the owner subsequently explicitly approved inclusion after verification in the combined release.

## Scope completed

Inspected responsive shell ownership, Home utilities, legacy More, sidebar and existing route tests. Plan: use the existing 900px shell boundary, omit optional Qibla callbacks on desktop, preserve direct routes, fill the remaining Home utility row and update regression coverage. Implemented locally.

## Files changed

- `src/app/App.tsx`
- `src/app/screens/HomeScreen.tsx`
- `src/app/screens/MoreScreen.tsx` and its test
- `e2e/navigation.spec.ts`
- `e2e/accessibility.spec.ts`
- `e2e/home-glass-material.spec.ts`
- `e2e/practical-devotional-access.spec.ts`
- Architecture, design-system, decision log, phase index and this report

## Components added or modified

App supplies Qibla only to compact/medium Home and More. Sidebar receives no Qibla callback. Home fills the remaining utility row; More supports an omitted Qibla action. No new component or dependency.

## User-visible changes

Qibla shortcuts appear below 900px and disappear at 900px and wider. Existing direct Qibla URLs and already-open screens continue working. Wide tablets follow the responsive desktop tier. Masbaha remains available.

## Accessibility work

Absent actions are unmounted, leaving no hidden focusable target. Existing native controls, names, focus styling and semantic order remain. No claim of complete accessibility compliance.

## Tests added or updated

More unit test verifies omission without losing other tools. Arabic/English browser regression covers resize through 390, 834, 899, 900, 1199, 1200 and 1440px, shortcut absence and full-width Masbaha. Existing navigation expects desktop omission while retaining its direct-route assertion. Material tests cover available utilities; the two-card palette test explicitly uses tablet width. Situational material reference uses the always-available Masbaha surface.

## Commands run

| Command                                                                                                                                 | Result                                                                                                                       |
| --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `pnpm test:run src/app/screens/MoreScreen.test.tsx src/app/screens/HomeScreen.render.test.tsx src/app/components/LayoutShells.test.tsx` | Passed: 3 files, 20 tests                                                                                                    |
| `pnpm exec prettier --check` with all changed application/browser/contract files                                                        | Passed                                                                                                                       |
| `pnpm typecheck`                                                                                                                        | Passed, exit 0                                                                                                               |
| `pnpm exec eslint` with all changed application/browser files and `--max-warnings 0`                                                    | Passed, exit 0                                                                                                               |
| `pnpm test:e2e e2e/navigation.spec.ts --project=desktop-chromium --grep 'Qibla\|wide utilities'`                                        | Blocked before browser startup: invalid audio manifest, `comprehensive-dua-39` lacks approved default voice coverage; exit 1 |

## Visual/manual evidence

Browser screenshots are configured at 834px and 1440px in the new regression but were not produced because the preview build failed. No visual pass claimed.

## Documentation updated

Architecture, design system, decision log and phase index record shortcut visibility and preserved route compatibility.

## Decisions recorded

Use existing layout tiers rather than device detection. No commit, push or deployment performed. Release notes remain unchanged for this unpublished follow-up.

## Known limitations or remaining risks

Browser verification and full quality/build gates remain pending the audio-manifest repair. Do not treat unit/static checks as production acceptance. Wide tablets at 900px or above follow desktop visibility.

## Out-of-scope findings

Audio manifest/assets had uncommitted edits before work began. Further audio, Home material, settings and state changes appeared concurrently during verification; they are outside this phase and were preserved. Do not attribute the complete workspace diff to this Qibla change or repair unrelated audio coverage without a decision.

## Recommended next step

Resolve the unrelated audio manifest failure, then run the focused browser regression and inspect its phone/tablet/desktop evidence. The owner has superseded the no-push hold in the combined release chat; publish only after complete verification.

## Combined release verification update

The shared audio manifest now validates with English default coverage for the quarantined guidance asset. Targeted responsive Qibla navigation passes at the documented widths in Chromium; Firefox/WebKit and final hook/CI results are recorded by the combined Desktop Home materials and audio controls lock report. The owner explicitly approved inclusion after verification.
