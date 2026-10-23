# Control feedback and sharing usability — 2026-10-20

## Objective and authority

Owner requests larger devotional footer targets, an icon/label preference, consistent sharing actions without redundant Previous controls, non-overlapping mobile previews and a shared interaction/motion audit. Local only: no commit, push or deployment. Preserve concurrent Progress/material/card edits and reviewed content.

## Inspection and plan before editing

1. Reuse ReaderFooterTools/DevotionalAction across Reader and standalone counters. Default to labelled tools; persist an optional icons-only choice through existing normalization/merge boundaries and Reading settings. Retain one ordinary tool row with enlarged-text reflow.
2. Remove unavailable first-step Previous and redundant final export Previous (editable stepper remains). Make export actions equal-height and named. Keep phone preview in normal flow; retain sticky preview only beside a wide two-column form.
3. Reuse motion tokens and existing native press feedback. Strengthen compact action feedback, cover semantic selection controls and range engagement, and verify keyboard/reduced-motion behavior without moving reading text or adding ambient loops.
4. Add regressions and responsive screenshots; run affected unit/browser tests and the non-browser quality gate. Document exact results and remaining physical/assistive-technology acceptance.

## Additional owner request

Add an English-mode main reading toggle using existing translation instead of Arabic. Keep it visit-local, reversible and count/selection-neutral; preserve the full Mushaf's existing translation flow.

## Objective

Complete the owner's footer, sharing geometry, control-feedback and English-reader requests locally.

## Scope completed

Larger labelled devotional tools with an icons-only preference; consistent sharing actions; non-overlapping single-column previews; shared keyboard/compact/selection/range feedback; reversible existing English meaning as the main Reader text. No commit, push, deployment, dependency or religious-content change.

## Files changed

- Application/settings boundaries: App.tsx, types.ts, state.ts/test, theme.ts/test, settings/SettingsScreen.tsx/types, ReadingPanel.tsx/test and bilingual i18n files.
- Shared presentation: DevotionalControls.tsx, HomeCards.tsx, reader-footer.css, SharingSteps.tsx/test, sharing-steps.css, CollectionShareModal.tsx/test and AyahShareStudio.tsx.
- Reading and feedback: ReaderScreen.tsx, useControlFeedback.ts/test and theme/surfaces.css.
- Remote preference boundary only: auth.ts/test and remoteSyncSnapshot.ts/test. No live account/database mutation or migration.
- Browser regressions: new control-feedback-sharing.spec.ts; updated devotional-footer, reader-control-consistency, sharing-arrows and sharing-refinement specs.
- Documentation: architecture, design, motion, quality checklist, decision log, index and this phase report.

Concurrent ProgressScreen, materials.css, collectionShareCard and performance-review edits were present or changed independently during this task and are preserved. They are excluded from this phase's implementation claims.

## Components added or modified

Reuse DevotionalAction/ReaderFooterTools composition, SharingStepNavigation, the existing studios and ReadingPanel. Add one non-rendering delegated useControlFeedback hook; no new visual framework or runtime dependency.

## User-visible changes

- Labelled footer targets default on; Settings → Reading offers Icons with labels / Icons only. Tool targets grow from 44px to at least 52px, with 64px compact labelled tiles. Ordinary phones keep one four-tool row; enlarged text reflows instead of hiding labels. Standalone desktop keyboard help remains available.
- Content omits unavailable Previous. Design retains named Previous/Next. Final exports use Share/Save/Copy image at matching ordinary heights; the persistent editable stepper revisits earlier stages. Copy image retains a wide phone row. Ayah actions use the same sizing/reflow family.
- Single-column previews scroll naturally before form fields. Only sufficiently wide/tall two-column layouts pin a preview beside settings, eliminating phone overlap without an extra scrolling pane or measurement loop.
- English Reader has Show English meaning / Show Arabic. Existing translation replaces the Arabic main text, keeps explicit English direction, and leaves item/count unchanged. This is visit-local; unavailable translations fall back to the existing Arabic view. Full Mushaf translation behavior is preserved.

## Accessibility work

Keep native button/radio/range semantics, complete accessible icon names, keyboard/focus ownership, disabled states, RTL/LTR and safe-area behavior. Keyboard Enter/Space receives finite press feedback without synthesizing clicks or intercepting native keys; text inputs, modified/repeating keys and no-press controls are excluded. Keyup, focus loss, cancellation, visibility change and unmount release the visual state. Both app and OS reduced motion override compact/pointer/keyboard scaling while preserving opacity feedback. Automated axe checks supplement geometry/focus checks; human screen-reader and physical touch acceptance are not claimed.

## Tests added or updated

Preference legacy/corrupt defaults, false preservation, persistence, partial merges, root presentation and safe remote serializers/loaders; Reading choice behavior; keyboard lifecycle/native link semantics; removed Previous and stepper navigation; Arabic/English labels, 52px bounds, 200% reflow, real reload persistence, translation switching without counting, sharing scroll geometry/equal export sizing and independent app/OS reduced-motion feedback.

Older assertions requiring a circular compact tool or hidden labels are updated to the owner's new labelled-tile contract. Assertions for primary pill geometry, counting, complete text, overflow, focus, exports and accessibility remain. Standalone enlarged-text checks account for their retained fifth keyboard-help target rather than assuming four cells.

## Commands run

| Command / scope                                                                                                                 | Exact result                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Initial `pnpm typecheck`                                                                                                        | Failed on a draft English-font helper argument; reused the existing computed reading size, corrected before final verification.                                                                                                                                                                                                                  |
| Targeted unit selection: state, theme, ReadingPanel, feedback, steps, collection/Ayah studio and footer                         | 8 files: 114 passed, 2 outdated Back-action expectations failed. Both updated to verify stepper revisiting.                                                                                                                                                                                                                                      |
| `pnpm test:run src/app/components/CollectionShareModal.test.tsx src/lib/auth.test.ts src/lib/remoteSyncSnapshot.test.ts`        | 3 files / 65 passed in 37.12s.                                                                                                                                                                                                                                                                                                                   |
| `pnpm check`                                                                                                                    | All stages passed in 229.4s; after final reduced-motion/link refinements, all stages passed again in 274.1s. Includes complete unit coverage, production build, typecheck, lint, formatting, local audio/content/timing validators, type scale, motion rules and unchanged bundle/CSS gates. Final log: output/control-feedback-check-final.log. |
| Chromium: control-feedback-sharing, devotional-footer, standalone-counter-footer, sharing-steps, sharing-arrows                 | 36 passed / 4 obsolete compact-radius expectations failed in 3.9m; corrected radius cases all passed in the next selection.                                                                                                                                                                                                                      |
| Chromium: control-feedback-sharing, reader-control-consistency, sharing-refinement, devotional-footer with affected-case filter | 28 passed / 4 standalone desktop enlarged-row expectations failed in 3.3m; no product failure.                                                                                                                                                                                                                                                   |
| Chromium: `reader-control-consistency.spec.ts --grep 'Shared reader controls (counter                                           | friday/salawat).*1440px'`                                                                                                                                                                                                                                                                                                                        | Corrected retained-keyboard-help reflow expectations: all 4 passed in 1.1m. Every case from the preceding two selections now has passing coverage. |
| Firefox/WebKit: control-feedback-sharing, sharing-board-layout and standalone desktop reflow filter                             | 20 passed in 3.8m (10 Firefox, 10 WebKit); JSON: output/control-feedback-cross-browser.json.                                                                                                                                                                                                                                                     |
| `git diff --check`                                                                                                              | Exit 0.                                                                                                                                                                                                                                                                                                                                          |

Intermediate runs are retained: initial targeted units had 114 passes and two expectations for the removed sharing Back action; corrected CollectionShareModal/auth/remoteSyncSnapshot units passed all 65 cases. Initial browser fixture incorrectly overwrote saved preferences on every reload; correcting fixture initialization preserved a real persistence assertion. Broader Chromium runs passed 36/40 and then 28/32; remaining failures were the superseded compact-radius and standalone enlarged-row expectations described above. No timeouts, assertions, coverage thresholds or budgets were relaxed.

## Visual/manual evidence

output/playwright/control-feedback-final/ and output/playwright/control-feedback-verification/ contain normal/enlarged Arabic/English footers, icons-only views, the English main meaning and sharing action screenshots. Representative Arabic 200% footer, English labelled footer/main translation, Arabic sharing footer and Firefox 200% sharing footer were opened and visually inspected. Cross-engine evidence is in output/playwright/control-feedback-cross-browser/.

## Documentation updated

Architecture/state ownership, footer/sharing geometry, motion matrix application, quality acceptance, owner decision and phase index. Release notes are unchanged because publication is withheld.

## Decisions recorded

This request supersedes automatic compact label hiding and the redundant final export Previous. Preserve finite purposeful motion and transient translation display. All work stays local under the owner's explicit hold.

## Known limitations or remaining risks

Browser emulation cannot establish physical Android/iOS touch performance or human assistive-technology acceptance. English-only display uses existing per-item meaning and does not replace full canonical Mushaf pages. Native share/copy support continues to depend on the browser and device. The complete release browser inventory and deployment are intentionally not triggered for this local review.

## Out-of-scope findings

Existing prayer/persistence/audio ownership and concurrent Progress/header/card work are preserved. No further decorative loops, haptics, animated blur or sacred-text motion are warranted by this audit. Future motion should explain actual loading, selection or completion states.

## Recommended next step

Owner reviews labelled versus icons-only footer and English meaning on a physical phone, then decides whether to authorize a release. Complete exact-commit release gates and refreshed release notes only after that authorization.

## Image-evidence follow-up

The owner's image request exposed an earlier icons-only screenshot captured during lazy loading. Strengthened the existing capture regression to require all four actions, the visible counter and settled fonts after reload before taking the picture. Reused the unchanged production preview; the Arabic/English Chromium selection passed both tests in 7.2s. Fresh reviewed images are in output/playwright/control-feedback-evidence/. No application behavior or publication changed.
