# Phase Report — Phase 12 accessibility audit and remediation

## Objective

Audit the core Azkarapp flows against the WCAG 2.2 accessibility requirements, remediate evidence-backed findings, and record automated and manual evidence without claiming that automation proves complete accessibility.

## Scope completed

- Audited onboarding, guest entry, Home, Library, full search, Reader, Benefit dialog, Progress, and Settings in English and Arabic.
- Reviewed accessible names, roles, states, live regions, landmarks, headings, direction/language metadata, target size, responsive reflow, text zoom, reduced motion, and contrast coverage.
- Corrected the Progress heading hierarchy in every tab while preserving Home's nested hierarchy.
- Added localized, polite result-count announcements to in-place Library filtering.
- Removed duplicate same-name headings from the Reader Benefit dialog.
- Aligned the Reader counter's accessible instruction with the visible desktop instruction.
- Disambiguated the expanded Settings Accessibility detail heading without changing other Settings destinations.
- Preserved one-line mobile page and Progress headings, with explicit 320px, 390px, and OnePlus Nord 4 representative coverage in English and Arabic.

## Files changed

Progress, Reader, Library, shared/header and Settings components; English and Arabic i18n bundles; focused unit and browser coverage; quality/evidence/release documentation; and this report.

## Components added or modified

- `ProgressDayView`, `ProgressWeekView`, `ProgressMonthView`, `ProgressYearView`, and `TodayRoutineGarden`
- `AzkarLibraryScreen`
- `ReaderScreen`, `ReaderReferenceSheet`, and `ResponsiveSheet` consumers
- Shared `Header` and Settings `SubHeader`

## User-visible changes

- Mobile headings stay on one line and remain at or below 20 CSS px in the phone checks; the narrow Week heading uses 16 CSS px so its full English label fits at 320px.
- Collection filtering now gives screen-reader users a localized result count.
- Desktop Reader counter guidance consistently communicates click and Space-key operation.
- Visual styling and religious content are otherwise unchanged.

## Accessibility work

- Progress tabs now expose a page `h1` followed by level-two view headings; nested card headings follow beneath them.
- Home retains its existing level-three Wird heading because the card is nested inside a Home section.
- Benefit dialog exposes one unambiguous dialog heading and a separately named Benefit details subsection.
- Expanded Settings uses `Accessibility settings` for the detail-pane heading while the navigation pane retains `Accessibility`.
- Library filter changes use a narrowly scoped `role="status"`, `aria-live="polite"`, and `aria-atomic="true"` region.
- Existing native controls, focus containment, 44px product targets, RTL direction, mixed-language markup, and reduced-motion contracts remain intact.

## Tests added or updated

- Unit assertions for Library live-region copy and Home/Progress heading levels.
- Browser assertions for all four Progress tab heading levels.
- Benefit-dialog unique heading assertion.
- Desktop Reader accessible-instruction assertion.
- One-line, non-clipped, non-oversized Progress heading assertions at 320×720, 390×844, and 412×924 CSS pixels.
- Arabic OnePlus Nord 4 representative heading coverage.

## Commands run

| Command                               | Result                                                                                                                          |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Focused Vitest                        | Passed — 2 files / 20 tests                                                                                                     |
| Focused ESLint and formatting         | Passed                                                                                                                          |
| Focused Playwright remediation matrix | Passed after catching and correcting the 320px Week-title and dialog-name edge cases                                            |
| `pnpm check`                          | Passed — formatting, lint, typecheck, audio validation, 89 files / 433 tests with coverage, production build, and budgets       |
| `pnpm test:e2e`                       | Passed — 393 passed, 4 intentional skips, retries disabled; Chromium desktop/mobile/tablet plus Firefox and mobile WebKit smoke |

## Visual/manual evidence

- Automated English heading checks passed at 320×720, 390×844, and a 412×924 representative OnePlus Nord 4 CSS viewport.
- Automated Arabic heading checks passed at the OnePlus representative viewport.
- The OnePlus Nord 4 physical display is 1240×2772 pixels; Android display scaling determines its CSS viewport, so the real device remains the authority for the final physical check.
- Production semantic inspection confirmed one main landmark, localized navigation, correct `lang`/`dir`, Reader progress semantics, global-search result status, and no sampled mobile horizontal overflow.
- A real TalkBack core-flow session and physical cutout/safe-area inspection remain pending. Automation is not recorded as a substitute.

## Documentation updated

- `docs/QUALITY_CHECKLIST.md`
- `docs/agent/DECISION_LOG.md` (DEC-057)
- `public/release-notes.json`
- This report

## Decisions recorded

DEC-057 records the accessibility remediation, one-line mobile heading constraint, responsive sizes, and the requirement to keep real TalkBack and physical safe-area evidence pending until performed.

## Known limitations or remaining risks

- Core-flow screen-reader completion is not yet certified because a real TalkBack/NVDA/VoiceOver session has not been recorded.
- Safe-area behavior is implemented and automated at representative sizes but is not certified on the OnePlus Nord 4 cutout until physically checked.
- One-line headings intentionally truncate as a last-resort safeguard under unusual translated copy or extreme platform font scaling; current English and Arabic product strings fit without clipping at every asserted viewport.

## Out-of-scope findings

- No persistence, prayer calculation, religious content, route contract, runtime dependency, or synchronization behavior changed.
- Runtime performance measurement remains Phase 13 work.

## Recommended next step

Run the short TalkBack and cutout checklist on the OnePlus Nord 4, record the dated result, then close Phase 12 and begin Phase 13 release hardening.
