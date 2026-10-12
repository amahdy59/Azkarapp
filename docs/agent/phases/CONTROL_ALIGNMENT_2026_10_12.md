# Phase Report — Shared control alignment

## Objective

Fix the owner-reported Collections/Saved icon/text misalignment and review reusable button alignment, locally only.

## Scope completed

Plan before editing: inspect Library, shared Tabs, SegmentedControl, Button and devotional actions; remove nested inline baseline spacing at the shared label boundary; preserve responsive sizing and behavior; extend real-browser geometry coverage; inspect captures and run local quality checks. The owner requested no planning approval gate. Existing unrelated workspace refinements are preserved.

## Files changed

- `src/app/components/Tabs.tsx`
- `src/app/components/SegmentedControl.tsx`
- `e2e/responsive.spec.ts`
- `docs/DESIGN_SYSTEM.md`
- `docs/agent/INDEX.md`
- This report.

## Components added or modified

TabList and SegmentedControl use centered flex foreground wrappers. Existing Button and DevotionalAction already center icons and labels using flex; no speculative offsets or unrelated redesign were added.

## User-visible changes

Library icon/text groups center within Collections/Saved tabs without inherited inline baseline space. Shared tabs and segmented choices follow the same label anatomy. Mobile icon-only controls, saved-count corner placement, desktop labels and spacing remain.

## Accessibility work

Preserved tab/radio semantics, selected state, localized names, panel associations, direction-aware arrows, focus rings, reduced motion and ordinary target sizes. Checked Arabic/English and enlarged text without document overflow. Automated evidence does not establish complete accessibility compliance; human assistive-technology and physical-device checks remain separate.

## Tests added or updated

Extended Library responsive regressions to measure icon, text and nested group vertical centers, horizontal group centering, containment and document overflow at 640/768/1280px with 100%/200% text. Existing 320/390px icon-center and keyboard assertions remain. Retained shared component unit coverage and segmented-control browser keyboard checks.

## Commands run

| Command                                                                                                                                                   | Result                                                                                                                                                                                                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm verify:toolchain`                                                                                                                                   | Passed: Node 24.x / pnpm 11.19.0.                                                                                                                                                                                                                                   |
| `pnpm test:run src/app/components/Tabs.test.tsx src/app/components/SegmentedControl.test.tsx src/app/screens/AzkarLibraryScreen.test.tsx`                 | 3 files, 32 tests passed (20.36s).                                                                                                                                                                                                                                  |
| `pnpm check`                                                                                                                                              | Exit 1 after 280.7s: toolchain, enforced-coverage unit suite, build, typecheck, lint, format, all audio/timing/type-scale/motion validators and CSS canaries passed. Only bundle baseline failed: initial-route gzip 163,526 bytes versus recorded 159,119 (+2.8%). |
| Diagnostic Vite build excluding only this phase's two component edits, followed by `node scripts/check-bundle-budget.mjs output/alignment-baseline-build` | Build passed; budget still failed at 163,527 bytes (+2.8%). This phase reduces the measured initial load by one byte; the combined unrelated workspace increase is independently confirmed. No source files were temporarily reverted and no budget was changed.    |
| Focused Prettier check and `git diff --check`                                                                                                             | Passed.                                                                                                                                                                                                                                                             |

Final browser command: `E2E_PORT=4198 pnpm test:e2e e2e/responsive.spec.ts e2e/settings-experience.spec.ts --project=desktop-chromium --project=mobile-webkit-smoke --project=desktop-firefox-smoke --grep 'Library mobile pills|Library displays unified|segmented controls'`. All **8 tests passed in 57.8s**, exit 0.

Initial focused browser runs passed Chromium and Firefox but exposed a measurement race in WebKit after responsive resizing: separate protocol reads combined the pre-resize button box with post-resize label boxes. The tests now wait for font/layout frames and read all compared boxes atomically. Every alignment and containment assertion remains intact. The final three-engine run passes all eight cases.

## Visual/manual evidence

Visually inspected font-ready Arabic/English desktop captures. Final passing browser runs produced `output/playwright/library-desktop-alignment-ar.png`, `library-desktop-alignment-en.png`, `library-mobile-pills-ar.png` and `library-mobile-pills-en.png`. Automated assertions cover 320/390px icon-only pills, 640/768/1280px labelled tabs and 100%/200% text; keyboard selection and saved naming remain intact.

## Documentation updated

Shared label layout contract, agent index and this report.

## Decisions recorded

The owner explicitly requested local application and general alignment consistency. No commit, push, deployment or release-note changes.

## Known limitations or remaining risks

The combined workspace does not pass its bundle baseline gate, independently reproduced without this phase's component edits. Integrating/reviewing the other local refinements and their measured growth belongs to the later release phase. No publication is attempted. Physical-device and human screen-reader checks remain separate.

## Out-of-scope findings

No persistence, reviewed content, sync, prayer calculation, dependency or shell-target changes.

## Recommended next step

Review the corrected local controls. Publication requires a later owner instruction.
