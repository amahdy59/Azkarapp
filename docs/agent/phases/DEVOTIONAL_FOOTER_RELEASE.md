# Phase Report — Coordinated devotional footer release

## Objective

Implement all owner-approved visual, UX, accessibility, and consistency recommendations, release the recent local improvements, and verify production.

## Approved plan

1. Inspect existing shared counter, footer, reading surfaces, and concurrent changes.
2. Place quiet guidance above the action rows within the reading surface; use one footer grid and a clearly primary counter.
3. Preserve counting, progress, source content, keyboard behavior, reduced-motion preferences, and audio ownership.
4. Extend responsive/theme/pressed-state accessibility checks and repair regressions without weakening assertions.
5. Integrate origin/main, update bilingual release notes, run all release gates, commit, push, monitor workflows, and smoke-test production.

## Scope completed

Implementation complete; release validation in progress. The earlier no-push restriction was superseded by the owner's explicit release request.

## Files changed

- `src/app/components/ZikrComponents.tsx`, `ZikrComponents.css`: shared guidance, counter emphasis, quiet secondary action styles, common grid, completion geometry, and desktop shortcut spacing.
- `src/app/screens/ReaderScreen.tsx`, `CustomCounterScreen.tsx`, `FridaySalawatScreen.tsx`: screen-specific composition and relocation of guidance above actions.
- `src/app/components/CounterKeyboardHelp.tsx`: merge resolution retaining mobile viewport bounds and upstream desktop auto-sizing.
- `e2e/devotional-footer.spec.ts`: action alignment, guidance placement, Arabic/English arrows, all three themes, and pressed-state contrast checks.
- `e2e/practical-devotional-access.spec.ts`: native checkbox focus and DOM scrollport containment checks for enlarged-text WebKit.
- `public/release-notes.json`: only this release's changes, four matching Arabic/English entries, new release stamp.
- Design system, decision log, index, reports, and screenshots.

The release also preserves the concurrent Home material/mobile keyboard-help, Ayah Al-Kursi title/alignment, and 8px reading-progress improvements described in their separate phase reports.

## Components added or modified

Reuse CounterTapHint, ZikrCounterSurface, CounterShortcutHints, Reader navigation/support actions, and CounterKeyboardHelp. No new runtime dependency, storage key, or remote boundary.

## User-visible changes

Guidance appears at the base of the reading area before Benefit/Listen/Share. Footer guidance and rows share a maximum width and inset. The counter is the dominant filled action with contrasting numerals. Secondary actions have quieter surfaces and consistent labels. Lower controls retain 48px minimum height, outer-edge arrows, pill corners, and 12px row gaps. Desktop keyboard hints retain adequate separation. Masbaha and Salawat share the visual language while keeping their own actions.

## Accessibility work

Preserve native buttons, target sizes, visible focus, RTL/LTR, enlarged-text growth, disabled semantics, and reduced-motion handling. Theme scans include guidance and footer; pressed counter contrast is checked separately. Preserve polite completion feedback and focus restoration. Automated checks do not establish complete accessibility compliance; real-device and assistive-technology review remains a release limitation.

## Tests added or updated

Responsive guidance-before-actions and shared-width assertions; localized arrow positions and symmetric targets; all three themes and pressed counter axe scans. The existing browser regression found insufficient desktop shortcut separation after moving guidance; restored the required 20px spacing. The latest upstream CI failure involved WebKit locator bounds for a scrolled checkbox; the revised test uses native focus and compares DOM rectangles in a single coordinate system, retaining containment assertions.

## Commands run

| Command                             | Result                                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------- |
| `git fetch`, `git pull --ff-only`   | Integrated seven remote commits; all local work restored from retained recovery stash |
| `pnpm install --frozen-lockfile`    | Passed                                                                                |
| Initial targeted browser refinement | 104 passed; three desktop shortcut-spacing failures diagnosed and repaired            |
| Local quality gate                  | pnpm check passed (112.4s); push hook repeats the final release gates                 |

## Visual/manual evidence

Arabic/English phone and desktop Reader, all three themes, enlarged-text layout, Masbaha, and Salawat screenshots in `docs/agent/evidence/footer-redesign/`. Latest evidence is refreshed before release.

## Documentation updated

Design system records the coordinated hierarchy. Decision log records approval and release authority. This report and the earlier local report preserve validation history.

## Decisions recorded

Release recent local improvements on main after verification. Preserve other-session work and remote changes. Keep the recovery stash until release verification is complete. No reviewed devotional content changes.

## Known limitations or remaining risks

Full release gates and production verification are pending. No production result is claimed until deployment metadata and live smoke checks match the release commit.

## Out-of-scope findings

No changes to authentication, synchronization, prayer calculation, or reviewed source text are part of this visual phase.

## Recommended next step

Complete release gates, commit and push, then verify Quality / verify and GitHub Pages build/deploy and the expected live UI.

## Final local verification

- pnpm check: passed; unit, coverage, lint, type, audio, build, CSS utility, and bundle gates succeeded.
- pnpm build:pages: passed, including bundle and CSS utility checks.
- pnpm audit:prod: passed, no vulnerabilities.
- Footer/theme/enlarged-text/navigation focused regressions: 13 passed. Keyboard dialog test initially ran before lazy-screen readiness; added a visible counter readiness assertion.
- Enlarged short-screen keyboard-help regression: 3 passed across Chromium, Firefox, and WebKit after repairing Safari focus scrolling. Native focus now corrects its own scrollport on the next animation frame; all containment assertions remain.
- pnpm check:release-notes: passed.
- Full pnpm test:e2e and final frozen install/check/build run through the mandatory pre-push hook. Workflow and live results are reported after deployment.
