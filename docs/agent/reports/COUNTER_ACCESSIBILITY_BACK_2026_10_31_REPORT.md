# Phase Report — Counter accessibility, Android Back and release headroom

## Objective

Apply the validated review recommendations, test the disputed suggestions and retain the owner's production hold. Local implementation and automated verification are complete. This does not certify Nord 4 hardware behavior, TalkBack usability or universal accessibility conformance.

## Scope completed

- Reading scroll regions now have a restrained keyboard-only inset focus cue and a system-color inset outline in Forced Colors. The approved no-clipped-exterior-outline intention remains.
- Completing the Reader counter preserves keyboard focus through automatic advancement. Completed controls use `aria-disabled` and ignore further counting; explicitly disabled unrelated controls retain native disabling. Counter-held focus permits Reader navigation/reset shortcuts, while Enter/Space remain owned by the button and modal/editing/disabled-shortcut boundaries remain intact.
- Android Back resolves the foremost open accessible overlay before route history or app exit. Shared modal, side-panel, compact sheet and Mushaf index surfaces register existing close callbacks. Library menus/alerts retain their Escape behavior, including busy guards. Nested sheet Escape does not dismiss its parent; listening protection still blocks route exit.
- Reader announces every short-count intermediate step. Masbaha and Friday counters share a small milestone policy/hook, announcing short counts, longer-count milestones and completion. Restored state does not announce as a new action; reset/context changes clear stale messages.
- Removed verified unused horizontal-pulse keyframes/classes, the obsolete element-pop selector and the unused blur selector. Build metadata omits redundant CSS lookup records and transitive import edges only when reachability remains intact. Tests prove cycle safety, CSS preservation and reachability from every record. Actual emitted files and all bundle ceilings remain unchanged.
- Real touch scrolling of overflowing text, light solid/Glass contrast, Arabic/English presentation and existing completion indicators were investigated. The exercised gesture/contrast flows passed; no minimum hold, global palette change, additional completion chip or typography rewrite was introduced.

## Files changed

- Behavior: `src/app/hooks/useOverlayBack.ts`, `src/app/hooks/useAppRouting.ts`, `src/app/counterAnnouncement.ts`, `src/app/hooks/useCounterAnnouncement.ts`, `src/app/hooks/useZikrCounter.ts`, `src/app/keyboardShortcuts.ts`.
- Presentation/composition: `src/app/components/ResponsiveSheet.tsx`, `src/app/components/MushafNavigationModal.tsx`, `src/app/components/ZikrComponents.tsx`, `src/app/components/ZikrComponents.css`, `src/app/screens/ReaderScreen.tsx`, `src/app/screens/CustomCounterScreen.tsx`, `src/app/screens/FridaySalawatScreen.tsx`, `src/styles/theme/surfaces.css`, `src/styles/theme/materials.css`, `src/styles/theme/motion.css`.
- Tooling/tests: `scripts/compact-build-manifest.ts` and its test; overlay, announcement, native routing, keyboard-counter, zikr-counter, counter-surface and ResponsiveSheet tests; `src/test/isolatedSuites.ts`; `e2e/counter-accessibility.spec.ts`; the existing Reader microinteraction focus regression.
- Documentation: architecture/design contracts, decision log, agent index, approved phase brief and this report. Earlier local repairs and the unrelated Android integration brief were preserved.

## Components added or modified

Added focused `useOverlayBack` and `useCounterAnnouncement` hooks and the shared announcement policy. Reused ResponsiveSheet, Modal, SidePanel, ZikrCounterSurface and existing standalone footer/counting primitives. No global Context/provider or state-management replacement was introduced; the review did not establish a benefit for those larger rewrites.

## User-visible changes

Visible keyboard reading position; continuous keyboard use after count completion; Reset/Arrow shortcuts while the counter holds focus; overlay-first Android Back; bounded spoken counter progress. Existing reading text, counts, prayer calculations, saved progress, haptic/sound choices, purposeful motion and offline resources remain intact.

## Accessibility work

Arabic/English keyboard focus, semantic disabled behavior, polite live status, nested modal recovery and Forced Colors checks. Axe checks covered Home, travel Reader and Masbaha in light solid/Glass, plus the ordinary Reader, Masbaha and Friday counter core screens. Real touch input scrolled enlarged overflowing devotional text without changing the count. Screen-reader speech timing and Android hardware Back remain manual-device acceptance items.

## Tests added or updated

- Counter focus retention, no repeated completed actions, preserved navigation/reset and native control boundaries.
- Short-count/milestone announcements, restored/reset/context message behavior.
- Foremost overlay dismissal, hidden layers, menu Escape fallback, actual nested shared modal focus recovery, native App back-listener wiring/cleanup and audio lock.
- Build-manifest reachability from every entry, redundant-edge removal, dependency cycles and retained emitted assets/CSS.
- Browser focus through completion/advancement, Forced Colors, actual overflowing touch scroll, light appearance and existing reader/index/audio regressions.

## Commands run

The final browser run used a freshly built isolated preview at `http://127.0.0.1:4203`. Logs and screenshots are local evidence under `output/`.

| Command                                                                                                                                                                                                                                                             | Result                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Focused unit run covering overlay, announcements, counting, ResponsiveSheet, Masbaha, Friday and manifest                                                                                                                                                           | 9 files, 85 tests passed.                                                                                                                                    |
| `pnpm test:run src/app/components/ResponsiveSheet.test.tsx`                                                                                                                                                                                                         | 13 tests passed, including nested modal Back/focus recovery.                                                                                                 |
| `pnpm test:run src/app/hooks/useAppRouting.native.test.tsx`                                                                                                                                                                                                         | 1 test passed; native App listener was mocked, not physical hardware.                                                                                        |
| `pnpm test:run src/app/keyboardShortcuts.counter.test.ts src/app/components/ZikrComponents.test.tsx src/app/hooks/useAppRouting.native.test.tsx`                                                                                                                    | 3 files, 11 tests passed.                                                                                                                                    |
| `pnpm test:run scripts/compact-build-manifest.test.mjs`                                                                                                                                                                                                             | 8 tests passed.                                                                                                                                              |
| `pnpm check` with `CHECK_VERBOSE=1`                                                                                                                                                                                                                                 | Final application snapshot: all stages passed in 274.9s; 332 test files, 2,360 tests passed with enforced coverage. See `output/counter-verified-check.log`. |
| `pnpm test:e2e e2e/counter-accessibility.spec.ts e2e/android-reliability.spec.ts e2e/reader-microinteractions.spec.ts --project=desktop-chromium --project=desktop-firefox-smoke --project=mobile-webkit-smoke --output=output/playwright/counter-verified-browser` | Final application snapshot: 53 passed in 4.3 minutes. No retries.                                                                                            |
| `pnpm build:pages`                                                                                                                                                                                                                                                  | Built in 45.68s; bundle budget and CSS utility checks passed. See `output/counter-verified-pages.log`.                                                       |
| `pnpm test:e2e:inventory`                                                                                                                                                                                                                                           | 2,528 identities preserved across 9 partitions; no missing, duplicate or extra coverage.                                                                     |
| `pnpm report:unused-css`                                                                                                                                                                                                                                            | 380 hand-written classes; 0 reported unreferenced. This static report is advisory, not runtime coverage proof.                                               |
| `pnpm audit:prod`                                                                                                                                                                                                                                                   | No known vulnerabilities found.                                                                                                                              |
| `git diff --check`                                                                                                                                                                                                                                                  | Passed.                                                                                                                                                      |

Development failures were repaired and retained in logs: a test fixture lacked a focusable menu target; the first build exceeded the unchanged output ceiling; counter focus retention initially blocked global Reset/Arrow shortcuts. The original reset regression remained unchanged and passed after the handler repair. Four WebKit results were invalidated when the preview was restarted too early; those interrupted results were not counted, and the final stable-server run passed every case. No assertions, coverage or budgets were weakened. The motion checker retains one existing `overscroll-behavior: none` warning at `layout.css:511`, with zero errors.

## Visual/manual evidence

`output/playwright/counter-verified-browser/` includes `reading-focus-ar.png`, `reading-focus-en.png`, light solid/Glass counter captures, Home touch recovery and enlarged Mushaf quarter captures across the selected engines. The keyboard-focus screenshot was visually inspected. Actual touch gesture geometry and computed overflow were asserted; audio uses controlled media events, and nonzero system insets remain a simulation.

## Documentation updated

The phase brief records the plan before implementation. The decision log records the owner-approved focus treatment superseding DEC-062 for keyboard-operable reading regions. Architecture describes overlay-first Back, announcement ownership and manifest reachability reduction; the design contract describes focus, completion and speech behavior.

## Decisions recorded

Apply the validated review repairs with small shared behavior extractions. Preserve existing components where investigation found the recommendation already covered or unsupported. No new runtime dependencies, content/count changes, persistence schemas, palette replacement, toolchain replacement or production actions.

## Known limitations or remaining risks

- Normal build: 12,580,034 bytes, leaving 2,878 bytes below the unchanged 12 MiB ceiling. Pages: 12,575,195 bytes, leaving 7,717 bytes. This improves the previous 159-byte normal-build headroom while adding the fixes.
- Pages initial CSS is 165,883 bytes / 28,499 gzip bytes, leaving only 173 gzip bytes. Further CSS growth needs another measured reduction; ceilings were not raised.
- Real OnePlus Nord 4 Back gestures, haptics, system bars and TalkBack speech remain unverified. The earlier native Gradle attempt is still blocked by missing Java; no new native build success is claimed.
- Local selected-engine checks and complete inventory verification do not replace the complete exact-commit CI matrix when publication is eventually authorized.

## Out-of-scope findings

Existing Home completion tiles already retain completion status after the celebration. Light-theme primary already uses the darker semantic token; tested solid/Glass cases passed. Real overflowing scrolling did not reproduce accidental counting. Broad screen decomposition and Context introduction were deferred because line counts and unmeasured duplication do not establish a user-visible or performance benefit. No additional confirmed functional defect remains in the exercised flows.

## Recommended next step

Install a fresh test Android build with a configured toolchain and validate the combined pending changes on the Nord 4, including nested-sheet Back, listening protection, counting/completion haptics and TalkBack feedback. Retain the production hold until the owner explicitly releases it. No commit, push or deployment was performed.
