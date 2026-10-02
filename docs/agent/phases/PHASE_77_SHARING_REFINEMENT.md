# Phase 77 — Complete, readable sharing

## Approved objective and plan

The owner requested all thirty recommendations from the sharing audit on 2026-10-03. This phase is limited to sharing, its tests, documentation and release verification. Unrelated working-tree shell changes are excluded through an isolated checkout.

1. Preserve every selected text section, Arabic RTL and reviewed citations with measured pagination and clearly labelled continuation cards.
2. Introduce readable coordinated olive, gold and lavender export palettes and Story, Square, Portrait and Tall formats.
3. Unify collection and single-zikr previews; offer content options, inspectable text, exact links, optional QR and explicit native-share/save/copy feedback.
4. Generate previews progressively, release object URLs, serialize operations and provide a single ZIP download without new dependencies.
5. Verify corpus reconstruction, layout bounds, cancellation/fallbacks, Arabic/English, accessibility, offline and upgrade behavior. Run all required release gates, release notes, push and workflow/production verification.

Reviewed devotional wording, translations, benefits, counts and attribution remain untouched. Export continuation boundaries are visual, never represented as Mushaf page boundaries. Physical-phone social apps and human screen-reader checks cannot be certified through browser automation and must be recorded as pending.

## Objective

Apply the sharing audit recommendations to both individual azkar and collections, preserving complete reviewed content and offline reading. Implementation is complete; release verification is recorded below.

## Scope completed

| Recommendation                                           | Implementation/evidence                                                                                     |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 1. Never abbreviate sacred text                          | Full selected text is measured and continued; legacy direct exports reject overflow.                        |
| 2. Preserve Arabic shaping and diacritics                | Native canvas shaping, explicit Arabic RTL, grapheme wrapping and generous line spacing.                    |
| 3. Increase readable type                                | Fixed 52px collection / 64px single Arabic at 1080px export width; no body-size shrinking.                  |
| 4. Group by content fit                                  | Up to four genuinely short items; fewer items and continuation pages when necessary.                        |
| 5. Preserve devotional order                             | Sequential layout and numbered archive filenames; corpus reconstruction tests.                              |
| 6. Protect Story overlays                                | Dedicated header, body and footer safe areas; tested glyph bounds.                                          |
| 7. Balance whitespace                                    | Content-based panel heights and restrained centering; readability takes precedence over packing.            |
| 8. Morning visual direction                              | Warm opaque olive surfaces with restrained botanical decoration.                                            |
| 9. Evening visual direction                              | Navy surfaces, warm gold accents and contextual subtitle.                                                   |
| 10. Sleep visual direction                               | Navy/lavender surfaces and contextual subtitle.                                                             |
| 11. Separate single-zikr design                          | Larger type and centered single panel through the same preview flow.                                        |
| 12. Multiple export formats                              | Story, square, portrait and tall reading images.                                                            |
| 13. Preview before sharing                               | Both reader and category sharing open an inspectable preview.                                               |
| 14. Inspect and navigate cards                           | Enlarge control, labelled previous/next, page count, scoped arrows/Home/End.                                |
| 15. Clear repetition count                               | Localized high-contrast repetition label, including once.                                                   |
| 16. Reviewed attribution                                 | Available citations always exported; concise citations repeat on continuation cards.                        |
| 17. Optional supporting content                          | Meaning, transliteration and benefits remain explicit user choices.                                         |
| 18. Accessible text alternative                          | Current-card semantic HTML plus complete copyable text.                                                     |
| 19. Exact share links                                    | Base-path-safe category and individual reader routes.                                                       |
| 20. Optional QR                                          | Existing QR dependency, exact route, quiet zone and opaque contrast.                                        |
| 21. Honest destination guidance                          | Device chooses sharing apps; no promise of direct Status/Stories targeting.                                 |
| 22. Capability-based primary action                      | Native Share when supported, explicit Save otherwise.                                                       |
| 23. Distinguish share/save/copy                          | Specific outcome messages; a triggered download is not reported as a confirmed saved file.                  |
| 24. Handle cancellations and failures                    | Native cancellation is quiet; denied copying/sharing provides recovery without surprise downloads.          |
| 25. Reliable bulk export                                 | One ZIP with ordered PNGs and complete text/sources; supported native multi-file sharing remains available. |
| 26. Prevent duplicate operations                         | Synchronous operation lock and busy/disabled state.                                                         |
| 27. Improve rendering lifetime                           | Progressive generation, abort signals and object URL cleanup; stable parent renders do not restart export.  |
| 28. Accessible responsive controls                       | Labelled native controls, focus indication, 44px targets, scoped status and error announcements.            |
| 29. Offline, browser and update evidence                 | Unit corpus tests and browser matrix; full existing offline/PWA upgrade suite retained.                     |
| 30. Physical destination and assistive-technology checks | Explicit release follow-up below; browser emulation cannot certify these.                                   |

Shared links also carry transient validated routine/prayer context, preventing a recipient's different saved routine from changing which zikr a position names. Existing links remain compatible.

The same temporary mode reaches completion, advance, reset and collection-ledger handlers, and stays active through the completion screen. Explicitly choosing a routine mode clears the override and preserves the current item by identity where available, otherwise returning to the first item. Regression tests verify completion is stored for the displayed zikr, the correct completion level is recorded, reload remains stable and the recipient's saved preference stays unchanged until an explicit selection.

## Files changed

- Sharing layout, renderer, archive and dispatcher under `src/app/share/`, including their tests.
- `CollectionShareModal.tsx` and tests; reader/category integration; Arabic and English i18n.
- Routing, its hook and App composition for transient shared reading context, with route and recipient regression tests.
- `e2e/sharing-refinement.spec.ts`, device-matrix registration and release notes.
- Architecture, design system, design coverage, agent index/decision log and this report.

## Components added or modified

The existing collection dialog now provides a unified individual/collection sharing studio. The layout and ZIP helpers are pure export utilities. Existing button, select, modal, icon and localization layers remain in use. No runtime dependencies were added.

## User-visible changes

Complete readable image cards, coordinated themes, format and content choices, preview inspection, exact text/link alternatives and one-file collection saving. Sharing does not modify reading progress or reviewed content.

## Accessibility work

Semantic controls and text alternatives; proper Arabic/English direction; one named dialog heading; minimum target sizes; controlled focus and keyboard navigation; scoped progress/error announcements; opaque high-contrast export surfaces. Automated scans and resize checks support the review but do not establish complete WCAG compliance.

Calculated text/citation/accent/count contrast ratios are all above 4.5:1; the lowest tested pair is 6.89:1. Decoration does not sit behind devotional text. Browser glyph measurements confirm readable Arabic stays inside its panel and above the footer.

## Tests added or updated

Corpus reconstruction and geometry across all formats; whitespace/diacritic preservation; long English sections; repeated citations; exact links; PNG encoding and overflow rejection; archive CRC/ordering; native rejection without fallback; retry, copying denial, operation serialization and stable parent renders. Browser checks cover real font measurements, offline exports, single-reader routing, narrow layouts, all formats, ZIP, QR, keyboard and enlarged text.

## Commands run

| Command                                                                                                                                                                              | Result                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`                                                                                                                                                     | Passed.                                                                                                                                                        |
| `pnpm test:run src/app/hooks/useAppRouting.test.tsx src/app/hooks/useSessionHandlers.test.ts src/app/share src/app/components/CollectionShareModal.test.tsx src/app/routing.test.ts` | Passed: 10 files, 80 tests.                                                                                                                                    |
| `pnpm check`                                                                                                                                                                         | Passed all ten stages; correction gate passed in 151.4s. Final type/lint/format checks and focused 80-test suite also passed; mandatory pre-push hook repeats. |
| `pnpm test:e2e`                                                                                                                                                                      | 447 passed, one existing skip; nine server connection failures corrected by the fresh WebKit run. Full suite repeats in the mandatory pre-push gate.           |
| `pnpm build:pages`                                                                                                                                                                   | Passed, including bundle and CSS utility gates.                                                                                                                |
| `pnpm exec playwright test --project=mobile-webkit-smoke`                                                                                                                            | Passed: 13/13.                                                                                                                                                 |
| `pnpm audit:prod`                                                                                                                                                                    | Passed: no known vulnerabilities.                                                                                                                              |

Earlier verification failures were repaired, not skipped: select popup stacking, missing mocks, duplicate-heading test ambiguity, scoped keyboard semantics and unused imports. A targeted browser run also recorded two retries during concurrent heavy checks; the final full run is reported separately.

The initial push was deliberately cancelled before reaching GitHub when the final review found session handlers had not received the temporary reading mode. The correction and completion-identity regression are included in a separate coherent commit. The mandatory release gates restart against that completed candidate.

## Visual/manual evidence

Evidence is preserved in `docs/agent/evidence/phase77-sharing/`: olive and lavender collections, a gold collection with QR, single-zikr PNG, desktop/narrow/enlarged-text previews and WebKit collection/single previews. Visual inspection confirmed full readable Arabic, separate citations, visible contextual titles, inset botanical corners, clear count labels and reserved Story footer space. The narrow and 200% text dialogs retain scrolling rather than hiding controls.

The preliminary full browser run recorded 447 passes, one existing skip and nine late WebKit failures caused by `page.goto: Could not connect to server`. A fresh unchanged WebKit run passed all 13 checks. These infrastructure failures remain reported; the mandatory pre-push hook reruns the entire suite before the commit can reach `main`. That final run uses the supported `E2E_BASE_URL` override against the same final built artifact served on a separate local port (4277), isolating it from the shared default preview port. No tests or assertions are skipped by this override.

The next complete gate exposed a test setup error in the new recipient regression: its identity, completion-storage and saved-preference assertions passed on mobile, then it waited for a routine selector that exists only in the desktop reader sidebar. The run was stopped before pushing. The test now retains those assertions at each supplied device width and resizes to desktop before explicitly changing the routine preference. No product assertion or coverage was removed; the targeted recipient test and complete mandatory release gates are rerun.

The corrected test also exposed a genuine timing race: the counter's delayed advance could retain the previous shared routine after an immediate explicit mode change. Session handlers now reject delayed advances belonging to an earlier category, prayer or routine context. A unit regression verifies the stale callback cannot move the reader while a current-context advance still works. The browser recipient regression is repeated three times across desktop, phone and tablet before the final full gate.

That final focused unit subset passed all 81 tests in ten files. The repeated recipient browser regression passed 9/9 in 24.0s without retries. Final mandatory pre-push gates and deployment verification are recorded with the release evidence after completion.

## Documentation updated

README capabilities, architecture ownership and shared-route context, design/typography/feedback contracts, design coverage and active phase index.

## Decisions recorded

DEC-216 records the owner's authorization and sharing-only scope.

## Known limitations or remaining risks

- Manual NVDA/VoiceOver/TalkBack checks and actual Android/iPhone destination-app tests remain pending. Check cancellation, PNG/multi-file acceptance, clipboard permissions, compressed readability, QR scanning, Story overlays and archive extraction on real devices.
- Destinations and their file limits are controlled by the operating system and installed apps.
- Reviewed sources are included when present; this phase does not invent missing attribution or change religious content.
- A readable complete collection can require more pages than the old seven/six-page samples. This is intentional.

## Out-of-scope findings

The original checkout's unrelated shell/responsive modifications are preserved. No prayer-time, persisted-state, synchronization or devotional-content contract changed.

## Recommended next step

Complete the physical-device and human assistive-technology matrix using the deployed release, and record findings without claiming compliance from automated scans alone.
