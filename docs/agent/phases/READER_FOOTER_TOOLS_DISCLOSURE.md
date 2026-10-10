# Phase Report — Reader footer tools disclosure

## Objective

Implement the owner's approved collapsible Benefit, Listen and Share row, locally only. Preserve the existing roomy Previous / Count or Complete / Next row, counting-guidance meaning, audio ownership and offline reading.

## Scope completed

Plan before editing: inspect the Reader's compact/wide branches and existing footer, introduce one controlled presentation component, retain expansion state in the Reader across item navigation, reuse the shared focus-mode hiding contract, add bilingual copy, and verify keyboard, geometry, navigation and playback. The owner approved this recommendation on 2026-10-09. Earlier publication holds remain in force.

The tools start expanded. A labelled native chevron disclosure hides/shows the entire row in normal layout, reclaiming reading space without overlaying the passage. The Reader owns the transient choice across items. Focus mode hides both tools and disclosure and now hides counting guidance consistently at compact and wide widths. Playback keeps its independent dock and transport controls.

## Files changed

- `src/app/components/ReaderFooterTools.tsx` and `.test.tsx`
- `src/app/components/CounterGuidance.tsx`
- `src/app/screens/ReaderScreen.tsx`
- `src/app/i18n/ar.ts` and `en.ts`
- `e2e/devotional-footer.spec.ts`
- This report, `docs/DESIGN_SYSTEM.md`, `docs/ARCHITECTURE.md`, `docs/agent/INDEX.md`, and `docs/agent/DECISION_LOG.md`

## Components added or modified

Added ReaderFooterTools; integrated it into the existing shared Reader dock. CounterGuidance participates in focus hiding in either placement. No dependency, stored schema, content or audio-controller change.

## User-visible changes

Frequently used tools remain together in the footer, available through Show tools / Hide tools. Primary counting/navigation buttons retain their sizes and placement. Choice survives moving between items and returning from audio/focus mode while the Reader remains mounted.

## Accessibility work

Native 44px disclosure target, visible focus, localized labels, `aria-expanded`, unique `aria-controls`, and native hidden content excluded from tab/accessibility order. Keyboard activation does not change counts. No auto-hiding or motion is introduced. RTL follows application direction.

## Tests added or updated

Component keyboard/hidden-content/focus tests in Arabic and English. Browser cases cover both languages at 320, 390, 820 and 1440px, preserved choice across navigation, unchanged counts, reclaimed reading height, focus-mode recovery, no page overflow, axe checks and screenshots. Existing footer, Reader options and expanded audio layout tests remain in scope.

## Commands run

| Command                                                          | Result                                                                                                                                                                                                                                                           |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Targeted Vitest: ReaderFooterTools and ReaderScreen audio suites | 21 passed, 6.01 seconds.                                                                                                                                                                                                                                         |
| Targeted browser suites                                          | 24 new disclosure cases passed across Chromium, Firefox and WebKit in 1.9 minutes. Final desktop run: 28 footer, Reader-options and audio-layout cases passed in 2.0 minutes. Initial changing-label locator errors were corrected without weakening assertions. |
| Complete quality gate and Pages build                            | Both exit 0. pnpm check passed in 110.4 seconds, including coverage, content integrity, format, lint, types and bundle/CSS gates. Pages production build passed.                                                                                                 |

## Visual/manual evidence

Expanded/collapsed Arabic and English screenshots at four widths are in output/footer-tools/final-evidence; cross-browser images are in output/footer-tools/evidence. The Arabic 390px expanded and collapsed screenshots were visually inspected. JSON reports are output/footer-tools/verified-results.json and final-desktop.json. Additional CounterGuidance/ReaderFooterTools unit run: 8 passed in 4.61 seconds. git diff --check passed. No human screen-reader or physical-device compliance claim is made.

## Documentation updated

Reader footer disclosure contract, phase index and owner decision.

## Decisions recorded

The owner identifies Benefit, Listen and Share as frequently used and approves retaining them in an explicitly collapsible footer row. They are not moved into the overflow menu. The hand continues to mean counting guidance; the tools use a separate chevron. No commit, push, deployment or release-note changes under the continuing local-only hold.

## Known limitations or remaining risks

Choice is transient within the mounted Reader, not a new persisted/synchronized preference. Expanded tools add a labelled disclosure target; collapsing reclaims the tools-row height. Quran snippet spacing and a broader all-controls-hidden focus mode remain separate proposals.

## Out-of-scope findings

Preserve all earlier pending changes and personal files. No sharing artwork, palette, religious content, Quran page geometry or publication change.

## Recommended next step

Review the local footer evidence, then consider the separately proposed Quran snippet spacing refinement.
