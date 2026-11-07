# Phase Report — Approved Mushaf chrome, local review

## Objective

Implement the approved responsive Mushaf presentation, center the desktop page range, and refine the tablet frame following screenshot feedback. Deliver actual local evidence before publication.

## Scope completed

- Shared desktop header/footer, centered canonical paper/spread and centered page range without total count.
- Visible Focus in both reader owners, familiar compact capsules, no duplicated desktop navigation/furniture or redundant Quran tile.
- Portrait tablet frame with 28px block padding, existing horizontal gutter, 20px corners and bounded page turns outside the text.
- Paired translation alignment, menu/search focus recovery, existing audio/manual zoom/offline behavior retained.
- Representative Home, Library, Progress and Settings screenshot review; notification wording is a separate **proposal only** in `docs/NOTIFICATION_COPY_REVIEW_2026_11_05.md`.

## Files changed

- New `src/app/components/MushafReadingChrome.tsx`, its CSS and unit tests.
- Modified `MushafPageViewer`, `MushafToolRail`, `MushafFocusExit`, `MushafNavigationModal`, `MushafImmersiveReader`, and `screens/KhatmahReaderScreen`.
- Arabic/English i18n: page-range/search labels and accurate independent-paper/Glass guidance.
- New `e2e/mushaf-approved-chrome.spec.ts`; updated existing reader sizing, immersive, Khatmah and parity tests for approved direct Focus entry.
- Existing build-only `scripts/compact-audio-literals.ts` and its exact-value tests.
- Architecture, design system, quality checklist, decision log, active phase and agent index.

## Components added or modified

MushafDesktopHeader, MushafDesktopFooter and MushafFocusButton are pure presentation. Existing owners supply state and callbacks. No new runtime dependencies, timers, persistence fields, network boundaries or religious-content transformations.

## User-visible changes

Desktop location controls appear once in the header. The range capsule is centered within the reading footer, excluding the rail; measured offset is at most 1px in regression coverage. Arrow hints use styled keycaps at the edge. Tablet paper has softer corners and more internal space. Phone keeps its familiar controls with visible Focus. Theme feedback uses the desktop header location without moving scripture.

The complete check initially exceeded the 12MiB output ceiling by 7,501 bytes. Extending the existing audio literal interning to repeated medium-length values restores the budget without changing any catalogue values or raising limits. Exact before/after equality and frozen-catalogue tests pass.

## Accessibility work

44px action targets, visible keyboard focus, direct Focus entry/exit recovery, index/Juz Escape recovery, native semantics, bidi-isolated range digits, 320px/200% reflow and existing Forced Colors fallbacks. DOM order follows header, reading content, footer. Automated axe checks passed for the approved reader matrix. This is not complete assistive-technology or physical-device certification.

## Tests added or updated

New responsive browser matrix measures desktop page/footer centering, no duplicated furniture/total count, canonical slot counts, Focus geometry/recovery, keyboard index entry and axe results. Tablet follow-up asserts at least 28px block padding and 20px radius. Updated existing expectations reflect the newly visible Focus action rather than removing behavioral coverage. New build-compaction regression checks medium-length sharing and exact values.

## Commands run

| Command / scope                                                    | Exact result                                                                                                                                                                          |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focused reader units, five files                                   | 129 passed; final targeted run 21.97s                                                                                                                                                 |
| New chrome units                                                   | 4 passed                                                                                                                                                                              |
| Build-only audio compaction tests                                  | 4 passed, 1.11s; included in final full check                                                                                                                                         |
| Balanced/approved/sizing browser matrix, three engines             | 48 passed, 5.4m                                                                                                                                                                       |
| Broader Chromium reader integration                                | Initially 42 passed / 2 failed; exposed real paired-translation offset, corrected by retaining matching internal furniture                                                            |
| Approved/translation/Glass final matrix, three engines             | 63 passed, 6.9m after that correction                                                                                                                                                 |
| Approved chrome + settings/navigation/legal/offline core, Chromium | 33 passed, 2.0m after tablet follow-up and bundle correction                                                                                                                          |
| Tablet follow-up, Firefox and WebKit                               | 2 passed, 1.5m                                                                                                                                                                        |
| `pnpm check`                                                       | Initial total bundle failure above; corrected full run passed every stage in 184.3s, including coverage, build, lint, typecheck, format, content/timing, motion, CSS and bundle gates |
| `pnpm build:pages`                                                 | Passed; bundle budget passed                                                                                                                                                          |
| `pnpm test:e2e:inventory`                                          | Passed: 3,264 cases across nine shards                                                                                                                                                |
| `pnpm audit:prod`                                                  | No known vulnerabilities found                                                                                                                                                        |
| `git diff --check`                                                 | Passed                                                                                                                                                                                |

Logs are under ignored `output/mushaf-approved-*.log`; exact final gate: `output/mushaf-approved-check-final.log`. No assertions, coverage thresholds, bundle limits or hooks were weakened. The complete CI browser inventory has not run for this unpublished working tree.

## Visual/manual evidence

Actual browser screenshots, not mockups:

- Desktop: `output/playwright/mushaf-approved-review/mushaf-approved-chrome-app-4c454--wird-1440-ar-cross-browser-desktop-chromium/reading.png`.
- Rounded/padded tablet: `output/playwright/mushaf-approved-review/mushaf-approved-chrome-app-f62a8-g-wird-834-ar-cross-browser-desktop-chromium/reading.png`.
- Phone: `output/playwright/mushaf-approved-review/mushaf-approved-chrome-app-4de40-g-wird-390-ar-cross-browser-desktop-chromium/reading.png`.
- English 1920px, 320px/200%, Focus and three-engine equivalents in `output/playwright/mushaf-approved-final/`; final tablet engine checks in `output/playwright/mushaf-approved-tablet-engines/`.
- Eight representative surrounding-screen captures: `output/playwright/app-review-{phone|desktop}-{home|azkar|progress-day|settings}.png`.

Reviewed screenshots preserve canonical fifteen-line pages and the existing distinct Mushaf button family. Tablet controls remain outside the frame; moving them inside would compete with its new breathing space. This is a recommendation, not a further geometry change.

## Documentation updated

Architecture, design system, quality checklist, active phase, decision log, index and this report. Notification draft explicitly separates proposed editorial copy, source conditions and delivery diagnostics from implemented application changes.

## Decisions recorded

Owner approved the concept and implementation, then requested a centered desktop range and more padded/rounded tablet borders. Actual result screenshots must be reviewed before pushing. No commit, push, release-note rewrite, CI trigger or deployment was performed for this phase.

## Known limitations or remaining risks

- Physical Android/iOS, screen-reader and real touch acceptance remain separate from browser automation.
- Compact Focus intentionally removes the tablet frame to maximize reading space. Manual magnification retains its prior scroll recovery.
- Readonly audio views do not inherit tablet reading frames or dead navigation buttons.
- Source review preserves current functionality; no Tafsir feature was invented from an illustrative mockup.
- Local preview captures can show unavailable remote Home evidence. Review loading/retry behavior with offline and delayed requests before treating a blank evidence card as a stable visual design.

## Out-of-scope findings

Representative app screens retain consistent configuration pills, row alignment and theme material. Recommended follow-ups: a clearer actionable Progress empty state for new readers; bounded, explicit loading/retry presentation for unavailable Home evidence; and the separate notification relevance/duplicate-delivery review requested by the owner. These suggestions are not additional implemented changes or a claim of exhaustive app-wide visual acceptance.

## Recommended next step

Owner reviews actual desktop/tablet/phone evidence and the separate notification proposal. Incorporate only approved notification wording/delivery scope. Publication remains held until screenshot review; a later release must update release notes, pass required hook gates and complete exact-commit Quality/Pages/production verification.
