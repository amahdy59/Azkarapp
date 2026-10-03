# Devotional footer redesign

## Objective

Implement the owner-approved compact counter and Reader action redesign across Reader, Masbaha, and Friday Salawat, and repair verification issues locally.

## Approved plan

1. Preserve other-session changes using an isolated checkout based on the deployed main branch.
2. Reuse the shared counter and existing evidence, audio, and single-zikr sharing boundaries.
3. Reduce tally height and navigation glyphs, add visible responsive labels and a quiet three-action Reader row, retain mode-specific controls.
4. Verify counting isolation, completion, keyboard focus, RTL/LTR, enlarged text, responsive targets, and the existing WebKit help regression.
5. Run full local gates, inspect screenshots, and report evidence. Do not commit or push.

## Scope completed

Implemented the local Reader, Masbaha, and Salawat refinement. No commit, push, or deployment was performed.

## Files changed

- Shared presentation: `src/app/components/ZikrComponents.tsx`, `ZikrComponents.css`, `CounterKeyboardHelp.tsx`.
- Screens: `ReaderScreen.tsx`, `CustomCounterScreen.tsx`, `FridaySalawatScreen.tsx`.
- Localization: `src/app/i18n/ar.ts`, `en.ts`.
- Tests: `ReaderScreen.audio.test.tsx`, `e2e/devotional-footer.spec.ts`, `counter-feedback.spec.ts`, `reader-microinteractions.spec.ts`.
- Documentation: design system, decision log, agent index, this report, and screenshot evidence.

The shared checkout also contains another session's Home glass, Reader title, mobile keyboard-help, and related test changes. Those changes were preserved rather than replaced.

## Components added or modified

The existing shared counter, Reader support/navigation controls, and keyboard-help scrolling container were modified. No new runtime dependency or state boundary was introduced.

## User-visible changes

- Reader provides labelled Benefit, Listen, and Share actions using existing flows.
- Counter and phone Previous/Next controls align at 48px minimum height. Tally numerals are 24px, with room around them.
- All footer boxes use the owner-requested shared pill radius with quieter Reader action borders. Support actions use equal horizontal padding; labelled navigation has equal widths and symmetric padding.
- The two rows are separated by 12px, increased by 4px. Masbaha and Salawat use the same counter treatment and spacing while retaining their existing actions.
- Arabic tally ordering is isolated correctly; Safari sharing restores focus to its launching button.

## Accessibility work

Targets retain at least 44px dimensions. Direction-aware navigation, semantic buttons, visible focus, keyboard counting, disabled states, and existing completion announcements are preserved. Support actions wrap at enlarged text sizes and counters grow to fit labels. The keyboard-help body scrolls on short WebKit screens. Automated axe checks are scoped to the footer; they do not establish complete accessibility compliance.

## Tests added or updated

New Arabic/English tests cover 320/390/820/1440 widths, shared counter heights, matched navigation height and width, border radii, symmetric padding, the 12px row gap, counting isolation during sharing, focus restoration, footer axe results, and Masbaha/Salawat surfaces. A 320px/200% Arabic text regression checks reachable controls and label clipping. Existing counter geometry and visible Share expectations were updated to the approved behavior.

## Commands run

| Command                                                                      | Result                                                                                                                                                                                       |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile` (isolated checkout)                         | Passed                                                                                                                                                                                       |
| `pnpm check`                                                                 | Passed earlier (182.6s). Final run passed every stage except unit coverage, which hit a shared-directory collision after another process removed `coverage/.tmp`; rerun independently below. |
| `pnpm build:pages`                                                           | Passed, including bundle ceiling and CSS utility checks                                                                                                                                      |
| `pnpm test:run --coverage.reportsDirectory=output/footer-unit-coverage`      | 174 files / 1276 tests passed (32.79s); coverage gate rerun separately                                                                                                                       |
| `pnpm test:coverage --coverage.reportsDirectory=output/footer-unit-coverage` | Passed; statements 74.06%, branches 70.8%, functions 70.15%, lines 76.15%; existing thresholds retained                                                                                      |
| `pnpm audit:prod`                                                            | Passed; no known vulnerabilities                                                                                                                                                             |
| `pnpm test:e2e`                                                              | Initial broad run: 524 passed, 1 skipped, 8 failed. Six failures were obsolete geometry/Share expectations; two exposed WebKit timing/focus issues. Corrected and rerun below.               |
| Existing Reader/counting browser specs                                       | 97 passed (4.8m), before the final symmetry refinement                                                                                                                                       |
| New devotional-footer browser spec                                           | 7 passed (1.1m) across Chromium, Firefox, and WebKit, including final width-symmetry and shared radius checks                                                                                |
| `pnpm format:check`, `git diff --check`                                      | Passed                                                                                                                                                                                       |

Failures were investigated rather than suppressed. The enlarged-text assertion now checks text boxes instead of the intentionally oversized invisible ready-glow pseudo-element.

## Visual/manual evidence

Saved Arabic/English phone Reader, desktop Reader, Masbaha, Salawat, and enlarged light-theme screenshots in `docs/agent/evidence/footer-redesign/`. Arabic/English phone and enlarged light layouts were visually inspected. Browser tests exercise keyboard and dialog return focus. Real-device and assistive-technology release review remains outstanding.

## Documentation updated

The design system records the compact shared geometry, control radius, action semantics, enlarged-text behavior, and spacing. The owner-approved implementation and symmetry refinement are recorded in the decision log and linked from the agent index.

## Decisions recorded

Use outer-edge navigation glyphs mirrored in RTL/LTR. Keep reviewed content, persistence, audio ownership, long-surah completion, and screen-specific actions intact. Use Lightbulb for the footer Benefit action and Share01 for its Share action, as requested in the reference refinement. Keep BookOpen in evidence headings. Leave all changes local as requested.

## Known limitations or remaining risks

The full browser suite was not repeated after every small repair; the affected browser specs and final footer checks were rerun. The primary checkout contains concurrent edits and is behind the fetched remote baseline; reconcile it deliberately before any future release. No production verification is claimed for these unpublished changes. Below 360px navigation retains accessible names but hides visible text to preserve space. Enlarged text can increase footer height and wrap actions.

## Out-of-scope findings

No reviewed religious content, synchronized data model, or deployment configuration changed. Existing unrelated work was retained.

## Recommended next step

Review the local footer and screenshots, then reconcile concurrent work and run the complete release gate if the owner later requests publication.

## Final reference refinement

The owner requested a shorter lower row, fuller rounded corners, outer-edge arrows, and iconography matching the reference. The final counter/navigation minimum is 48px, with 24px numerals and 8px vertical padding. All footer buttons have pill-shaped corners. Benefit, Listen, and Share use Lightbulb, Headphones, and Share01 at 20px; navigation remains 18px. Browser assertions verify glyph placement in Arabic and English. Final follow-up validation results are recorded after completion.

The final reference refinement passed all 104 targeted browser tests (7.2m) and `pnpm check` (274.1s). Subsequent guidance-strip work adds shared CounterTapHint and HandTap presentation through the existing icon layer. The localized plain hint is replaced across Reader, Masbaha, and Salawat; the themed strip remains persistent, with no new settings or persisted state. Long-surah instruction remains on its counter face. Browser tests now check strip presence/icon and counting by tapping the strip. Follow-up gates are recorded below.

Guidance-strip browser validation: 104 passed (9.0m). Final `pnpm check`: typecheck, build, lint, formatting, type scale, audio manifest, bundle budget, and CSS utilities passed; one unrelated DownloadsPanel alert assertion timed out during the concurrent run (1275 tests passed). Its unchanged five-test spec passed independently. The full coverage suite was rerun separately with its own report directory, preserving thresholds. Updated screenshots replace the earlier evidence. No commit, push, or deployment occurred.

Standalone full coverage gate passed: statements 74.07%, branches 70.81%, functions 70.2%, lines 76.16%, with the existing thresholds unchanged.
