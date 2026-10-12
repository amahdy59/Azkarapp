# Phase Report — Mobile Library toggle sizing

## Objective

Make the mobile Collections/Saved controls visually coherent with category pills, aligned with the title, and compact without visible text or additional toggle spacing. Local application only; no commit, push or deployment.

## Scope completed

Plan before editing: inspect Library and shared Tabs; remove mobile enclosing padding/surface, use category-pill geometry on individual tabs, quiet the saved count, reduce the search-heading gap, preserve wider styling and existing semantics, and verify focused unit/browser coverage plus the non-browser gate.

## Files changed

- `src/app/screens/AzkarLibraryScreen.tsx`
- `src/app/screens/AzkarLibraryScreen.css`
- `e2e/responsive.spec.ts`
- `docs/DESIGN_SYSTEM.md`
- `docs/agent/INDEX.md`
- This report.

## Components added or modified

Modified AzkarLibraryScreen presentation; reused TabList unchanged. No dependency or content changes.

## User-visible changes

Mobile tabs remove the outer capsule and extra padding, retain adjacent spacing and icons, and match filter-pill shape/surfaces. Saved count becomes plain inline text. Title and tabs remain vertically centered. Search-heading gap decreases from 12px to 8px; wider styling is preserved.

## Accessibility work

Preserved 44px minimum targets, localized accessible names including saved counts, APG selection/focus/RTL arrows, focus indicators, and associated panels. Browser coverage includes Arabic/English, 320/390px widths and 200% text resizing. No complete manual accessibility claim.

## Tests added or updated

Added responsive regressions for icon-only labels, compact dimensions, centered alignment, search spacing, overflow, saved count naming, direction-aware keyboard activation and retained desktop labels/container padding.

## Commands run

| Command                                                                                                                   | Result                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm verify:toolchain`                                                                                                   | Passed: Node 24.x / pnpm 11.19.0.                                                                                                                                                                                                                                        |
| `pnpm test:run src/app/screens/AzkarLibraryScreen.test.tsx src/app/components/Tabs.test.tsx`                              | 25 tests passed before stylesheet extraction and again on the final implementation (9.93s).                                                                                                                                                                              |
| `pnpm test:e2e e2e/responsive.spec.ts --project=desktop-chromium --grep 'Library mobile pills\|Library displays unified'` | 3 passed in 58.1s after correcting an invalid seeded saved ID rejected by normalization.                                                                                                                                                                                 |
| `pnpm test:e2e e2e/responsive.spec.ts --project=mobile-webkit-smoke --grep 'Library mobile pills'`                        | 2 passed in 38.1s.                                                                                                                                                                                                                                                       |
| `pnpm check`                                                                                                              | All stages except bundle budget passed, including enforced-coverage unit tests, build, typecheck, lint, format, content/timing/motion/type-scale validators and CSS canaries. Initial new responsive utilities exceeded the 28 KiB stylesheet ceiling by 152 gzip bytes. |
| `pnpm build:pages` after style simplification                                                                             | Global placement still exceeded the ceiling by 100 bytes. Moved the scoped mobile rules into the Library's lazy-loaded CSS; ceilings and baseline were not changed.                                                                                                      |
| Final `pnpm build:pages` and combined targeted Chromium/WebKit rerun                                                      | Blocked before verification by concurrent deletion of `src/app/components/AyahShareStudio.tsx`, still imported by `AyahInteractionSheet.tsx`. Unrelated changes left untouched. Final integrated bundle/build/browser status remains unverified.                         |

## Visual/manual evidence

Inspected the Arabic and English captures at `output/playwright/library-mobile-pills-ar.png` and `output/playwright/library-mobile-pills-en.png`. Both show compact controls centered beside the title and a tighter search-heading gap. The captures precede the equivalent lazy-stylesheet extraction; final integrated recapture is blocked by the concurrent missing sharing component.

## Documentation updated

Design system mobile geometry contract, agent index and this phase report.

## Decisions recorded

Owner requested icon-only mobile controls, no increased toggle spacing, title alignment, reduced title-to-search spacing, and local-only implementation.

## Known limitations or remaining risks

Physical-device and human screen-reader verification remain separate. Release notes and publication gates belong to the later owner-controlled release. Concurrent Quran/sharing edits appeared during verification, including a deleted component still imported elsewhere; no repair or reversal of that work was attempted. Final full gate and budget confirmation require those edits to settle.

## Out-of-scope findings

No persisted data, reviewed content, search/filter behavior, wider layouts or shared tab implementation changed.

## Recommended next step

After the concurrent sharing work settles, rerun the focused Library browser cases and `pnpm check`, review the local mobile appearance, then perform the owner's later release gates. Nothing was committed or pushed.

## Owner-requested centering correction

The owner reported that the icons looked off-center in the preview. Plan before editing: inspect the nested tab labels; center the icons independently of the saved count; enforce equal mobile button dimensions without adding spacing; add actual icon-center geometry assertions; inspect fresh font-ready screenshots. The Library's mobile CSS now gives each grid column the compact control height, removes button padding, and makes both nested wrappers fill and flex-center the button. Saved count uses the logical upper-end corner, outside the icon's centering group. Desktop styling, the reduced search gap, localized naming and keyboard behavior remain.

Files changed in this correction: `src/app/screens/AzkarLibraryScreen.css`, `e2e/responsive.spec.ts`, `docs/DESIGN_SYSTEM.md` and this report. Browser assertions compare both icon centers with button centers, equal widths/heights and title alignment at 320/390px in Arabic/English and at 100%/200% text sizing.

Validation:

- Targeted Library/Tabs units: **25 passed** (79.18s).
- Focused Prettier, ESLint and `git diff --check`: **passed**.
- Shared-workspace browser startup: failed on an unrelated mid-edit syntax error in `AyahInteractionSheet.tsx`.
- Shared-workspace `pnpm check`: typecheck, build and domain validators passed; lint failed on undefined `fetch`/`AbortSignal` in the concurrent `scripts/prepare-imran-passage.mjs`. Stopped this already-failed gate without changing other work.
- Created an ignored verification snapshot from Git HEAD with only the candidate Library screen/CSS and responsive spec overlaid; reused installed dependencies through a directory junction. Disabled pnpm's automatic dependency-reinstallation attempt only in this temporary snapshot, avoiding any mutation of the shared installed modules. No dependency, lockfile, hook, test or release gate was changed.
- Snapshot `pnpm build:pages`: **passed**, including bundle budgets and CSS canaries.
- Snapshot targeted responsive Chromium/WebKit suite: **5 passed** (3.4m), including direction-aware keyboard behavior and retained desktop labels. These are isolated feature results, not a claim that the combined shared workspace passes its full gate.
- Visually inspected the fresh Arabic capture after font readiness. Evidence copied to `output/playwright/library-mobile-centered-ar.png` and `output/playwright/library-mobile-centered-en.png`.

Remaining limitation: the combined workspace still needs its full gate after concurrent work settles. No commit, push or deployment. Next step: owner reviews the centered mobile controls locally.
