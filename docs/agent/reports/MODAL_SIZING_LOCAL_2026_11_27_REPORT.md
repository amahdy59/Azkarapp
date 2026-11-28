# Phase Report — Bounded modal sizing, local 2026-11-27

## Objective

Repair unnecessary full-screen sharing/enlargement dialogs and Android status-bar/Close crowding from the owner's two screenshots. Audit equivalent overlay patterns, apply locally and provide actual-app screenshots. No commit, push or deployment.

## Scope completed

- Audited shared Modal, ResponsiveSheet, SidePanel, Radix alert dialogs, portalled menus/pickers, collection sharing, ayah image sharing, modal excerpt enlargement and canonical inline Mushaf zoom.
- Removed the two phone `100dvh` overrides that defeated shared modal bounds. Both sharing hosts now use a stable bounded editor area; ordinary compact action sheets retain their content sizing.
- Shared modal bounds reserve a physical 16px gutter beyond each normalized safe inset, including asymmetric cutouts. Top-origin sheets start below the top inset plus the same gutter. Horizontal gutters stay physical rather than expanding unnecessarily with text size.
- Short modal Quran excerpts derive height from their hidden full-text measure. Long content retains exact-word portions, readable text and short/enlarged-window scroll recovery. Temporary pagination probes remain absolute so they cannot change layout.
- Kept size/portion icons compact with complete accessible labels and targets. Scoped compact button styling to the reading controls so Close retains the shared 48px target. Removed repeated native-bottom padding inside already protected sharing/enlargement surfaces.
- Preserved native inset normalization, inline Mushaf enlargement, immersive readers, devotional words/counts, offline state, progress, prayer times, audio ownership and all independent working-tree changes.

## Files changed

Only the following portions belong to this phase; several files already contained independent local edits.

- `src/app/components/overlay-surfaces.css`: shared safe bounds/gutters.
- `src/app/components/sharing-steps.css`, `CollectionShareModal.tsx`, `AyahInteractionSheet.tsx`, `ayah-share-studio.css`: bounded sharing hosts and single bottom-inset ownership.
- `src/app/components/QuranReadingZoom.tsx`, `quran-reading-zoom.css`: intrinsic modal excerpt sizing, isolated measurement probes and compact accessible navigation.
- `e2e/modal-safe-sizing.spec.ts`: new responsive/inset/word/focus checks.
- `e2e/mobile-sharing-filters.spec.ts`, `image-first-sharing.spec.ts`, `overlay-consistency.spec.ts`: replace obsolete full-viewport/flush-top expectations with the owner's bounded contract, preserving all other assertions.
- `scripts/run-feature-browser-tests.mjs`: include the new modal suite in controls/sharing selections.
- README, architecture, design system, quality/coverage documentation, agent index/decision/phase/report and evidence gallery.

## Components added or modified

Modified shared overlay styles, CollectionShareModal, AyahInteractionSheet and QuranReadingZoom. No new runtime component, dependency, router or state boundary.

## User-visible changes

Sharing and enlarged excerpts leave visible space around their dialogs, clear of reported system bars. Short readings no longer reserve a full screen of empty space. Collection/ayah editors keep stable header/actions and scrollable work areas; enlarged text and short windows retain recovery. Reader navigation uses labelled directional icons, with full return text and unchanged reviewed words.

## Accessibility work

Retained Radix/Vaul names, modality, focus containment, Escape/native Back and opener restoration. Verified no horizontal overflow, protected picker recovery, hit-testable minimum targets and exact Quran word order. Close retains 48px; ordinary reading controls retain at least 44px. Existing motion tests cover app/OS reduced motion. Browser axe/keyboard evidence does not establish complete accessibility compliance or physical TalkBack acceptance.

## Tests added or updated

The new suite covers Arabic/English; 320px at 200% text with High Contrast; 390px phones; 834px tablet; 1440px desktop; 740×390 landscape; Light/Dark/Midnight; Glass/solid; asymmetric simulated insets, live larger insets and recovery to zero. It asserts modal/picker bounds, touch geometry/hit testing, focus containment/return, unchanged route, content-sized short excerpts, every Quran word exactly once across portions and axe results.

The existing sharing/export tests retain PNG bytes, design choices, collection scope and saved progress assertions. The top-sheet test now expects exactly 16px instead of the superseded flush-top presentation.

## Commands run

| Command                                                                                                                                                               | Result                                                                                                                                                           |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm exec vitest run src/app/components/ResponsiveSheet.test.tsx src/app/components/quranReadingPortions.test.ts src/app/hooks/useSafeAreaCollisionPadding.test.tsx` | Passed: 3 files, 20 tests.                                                                                                                                       |
| `pnpm typecheck`                                                                                                                                                      | Passed, exit 0.                                                                                                                                                  |
| Targeted `pnpm exec prettier --check` over all changed implementation/browser files                                                                                   | Passed.                                                                                                                                                          |
| `git diff --check`                                                                                                                                                    | Passed.                                                                                                                                                          |
| `pnpm check`                                                                                                                                                          | Failed: 406 unit files/2,861 tests passed; one independent book-audit test failed. Formatting and bundle budget also failed; other stages passed. Details below. |
| `pnpm build:pages`                                                                                                                                                    | Vite/PWA generation succeeded; bundle budget rejected the current combined checkout. Final numeric result recorded below.                                        |

Browser development runs exposed and repaired narrow enlarged control overflow, the obsolete flush-top assertion and Close's inherited minimum. Two broader runs were stopped after follow-up changes superseded their built artifact; they are not claimed as complete passes. The first also hit 90s timeouts waiting for ayah export downloads; the subsequent complete collection/evidence PNG cases passed in Chromium and Firefox. No timeout, assertion, coverage or budget was weakened.

Final targeted browser command:

```powershell
pnpm exec playwright test e2e/modal-safe-sizing.spec.ts e2e/overlay-consistency.spec.ts e2e/ayah-image-sharing.spec.ts e2e/quran-enlarged-reading.spec.ts --grep 'sharing respects|enlarged excerpt|global top sheets|ayah sharing enlarged|enlarged Quran fits|two fingers' --project=desktop-chromium --project=desktop-firefox-smoke --project=mobile-webkit-smoke --output=output/playwright/modal-sizing-final
```

Final targeted browser result: **60 passed in 9.5 minutes, exit 0** — 20 each in Chromium, Firefox and WebKit. This includes all 36 new modal-sizing cases, six ayah responsive/theme cases, three global top-sheet cases and fifteen canonical inline-reading/pinch cases. Final detailed results are retained in `output/modal-sizing-final-results.json`; browser artifacts are in `output/playwright/modal-sizing-final/`.

The final `pnpm build:pages` attempt exited 1 after successful Vite/PWA generation: 12,584,945 total bytes exceeds 12,582,912. Home startup gzip was 537,312 bytes. The earlier attempt also failed the unchanged total ceiling. The final build log is `output/modal-sizing-pages-final.log`.

### Complete-gate limitations

- `scripts/audit-learning-book-content.test.mjs:9` rejects the saved book audit against the independently modified learning pack identity. The run reported 1 failed/406 passed files and 1 failed/2,861 passed tests. This phase does not change book source/audit data.
- Prettier reports `docs/learning/english-wird-source-overrides.json`, already modified before this phase. It remains untouched by the modal work.
- Generic build budget: 12,603,800 total bytes against 12,582,912; startup gzip 538,688 against recorded 527,852 (2.1% growth). Current local changes include substantial independent books/audio/native/UI work. No baseline or ceiling was raised and no assets were removed to obtain a pass.
- The full gate passed toolchain, compilation, typecheck, lint, audio manifest, Quran/listening/owner timings, type scale, motion rules and CSS utility validation. It does not establish a full quality pass or release readiness.

## Visual/manual evidence

[Twelve-image actual-app gallery](../evidence/modal-sizing/README.md), with both languages, all responsive tiers, short landscape and 200% text/High Contrast. Captures are unedited browser renders with explicitly labelled simulated Capacitor insets. No Android icons were fabricated. Screenshot inspection supplements the geometry, hit-testing, keyboard and axe checks.

Physical Vivo/Android 16, real keyboard/IME, gesture/three-button navigation, cutouts and TalkBack remain unverified. No APK was rebuilt or installed for this web presentation phase; the earlier safe-area debug APK predates these web changes.

## Documentation updated

README capability wording; architecture sizing/measurement ownership; design-system contract; quality and design-spec coverage; agent index/decision log; local phase, this structured report and screenshot gallery.

## Decisions recorded

The latest owner request supersedes earlier full-screen phone sharing/modal excerpt presentation. Canonical inline Mushaf and intentional immersive readers keep their existing roles. No commit, push, deployment or release-note rewrite.

## Known limitations or remaining risks

Full repository gates remain blocked by the book-audit, formatting and aggregate bundle findings above. Automated evidence is browser-based and cannot certify Android native inset delivery or complete WCAG compliance. No physical device was connected for acceptance.

## Out-of-scope findings

Independent content/source reconciliation and aggregate bundle growth remain in the existing working tree. No reviewed devotional content, persisted/synchronized schema, native Java, permission, CI configuration or dependency was changed by this phase.

## Recommended next step

Review the local screenshots, then verify the corrected web bundle in the rebuilt Android host on the affected device, including TalkBack and both navigation modes. Reconcile the independent book and bundle gates before a separately authorized release.
