# Phase Report — Home scrolling and relevant reminders

## Objective

Deliver the owner's stable prayer badge, calm scroll transition, restored active-visitor footer and authenticated reminder expansion with both contextual and broader-topic plans.

## Scope completed

Inspected the current Home, reminder selectors, source library, motion and persistence contracts. Planned stable summary columns/header spacing, finite scroll handoffs, existing-provider footer restoration, then the separately authorized authenticated content/relevance expansion. The owner's later message supersedes the original workbook approval gate. No uncontrolled religious-content, architecture or storage replacement is included.

## Files changed

HomeScreen, App reduced-motion wiring, home-wird.css, useHomePrayerScroll with tests; authenticatedReminders with source tests; relevantNowLibrary metadata, dailyEvidence, reminderPlan with tests; HomeCards, Arabic/English copy; Home render tests; home-prayer-scroll and contextual-reminder-plan browser specs; content, motion, design, architecture and decision documentation. Release integration preserves the already approved pending appearance/audio/Qibla work, documented in its own phases.

## Components added or modified

The original prayer cards retain their compact/expanded states. useHomePrayerScroll coordinates finite card/sticky height transitions with opacity feedback, finalized by the coordinated Home refinement phase. HomeCards shows source links, accurate excerpt/action attribution and reviewed titles. VisitorCount consumes the existing app-wide provider. The broader content remains deferred and precached. This reminder phase adds no dependency, count, sync schema or database; the separately approved reward phase owns its versioned state changes.

## User-visible changes

The next-prayer badge and header spacing stay anchored on scroll. The compact countdown spans both natural name/time columns so it cannot resize the badge's timing column or force narrow English times to wrap. Card and sticky-shell heights settle together over 260ms with arriving-detail opacity feedback. Flexible header space keeps all five footers aligned when English times wrap at 200% text size. The visitor estimate returns after a successful heartbeat. Thirty authenticated entries supplement the forty-one baseline sources. Four existing duas reuse canonical complete text and meanings. General-topic selection shifts by day to avoid starvation behind recurring prayer windows. A 45-minute Wednesday/Sunday preparation window starts 45 minutes after Asr, with narrow prayer moments taking priority. Ramadan/Eid/Tashriq exclusions and a one-day calendar uncertainty margin honor the Hijri adjustment. Morning/evening, Dhuha, bedtime and last-third selection remain; Friday's last-hour context is actually limited to that last hour. Manual refresh can leave a one-item context. No notifications or invented prescribed timing/counts are added.

## Accessibility work

OS and application reduced motion apply the final scroll state immediately and cancel active effects. Height interpolation is bounded to the discrete scroll-state handoff; ordinary scroll does not restart effects. No text scaling, padding/blur animation or loop. Keyboard/DOM order, native progress and non-live timing remain. Source links have ordinary 44px targets, focus indicators and clear labels. Arabic/English text semantics and enlarged/narrow reflow are retained. Automated scans do not establish complete accessibility compliance.

## Tests added or updated

Hook tests cover hysteresis, no animation on ordinary scroll, interruptions, preferences and unsupported animation APIs. Home coverage verifies footer/provider ownership. Plan tests cover civil timezone/midnight, narrow prayer priority, advance fasting boundaries, exclusions/adjustment/calendar failure, Friday's actual last hour, retained extended slots and topic reachability. Content tests check all source IDs, grading, exact fasting wording, canonical dua fidelity and rotation/refresh. Browser tests cover bilingual phone/desktop scrolling in three engines, fasting/refresh/date changes and first offline use of the precached extension.

## Commands run

| Command                                                             | Result                                       |
| ------------------------------------------------------------------- | -------------------------------------------- |
| Home/visitor/scroll-hook targeted unit tests                        | 3 files, 23 passed                           |
| Reminder-plan/source/Home targeted unit tests                       | 3 files, 27 passed                           |
| Initial scrolling `pnpm check`                                      | Passed in 83.5s before the new content phase |
| Initial `home-prayer-scroll.spec.ts` across Chromium/Firefox/WebKit | 12 passed                                    |
| Targeted typecheck, Prettier and zero-warning lint                  | Passed before final integration              |

Final local integration results:

| Command / scope                                                  | Exact result                                                                                                                                                                                                                                                                                                               |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm check` after source integration                            | Passed in 236.1s; subsequent combined run passed in 120.3s. All unit/coverage, build, type, lint, format, content/audio/timing, motion, type-scale, bundle and CSS stages passed. Logs: `output/combined-local-check.log`, `output/combined-final-local-check.log`.                                                        |
| Coordinated Home/path/material Chromium selection                | 70 passed before the final root-frost adjustment. Report: `output/local-home-path-e2e.json`.                                                                                                                                                                                                                               |
| Scroll and contextual reminder checks, three engines             | All 12 scroll and six contextual cases passed. One additional dev-server offline test timed out because dev has no production service worker; it passed separately against production output. Report: `output/local-home-scroll-final-e2e.json`.                                                                           |
| Enlarged-text/geometry Chromium and Firefox                      | Six passed; production offline also passed. Three WebKit accent checks initially exposed a style-settlement sampling race. The exact unchanged predicate now waits for settlement; all three WebKit rechecks passed in 1.1m. Reports: `output/reminder-final-repair-browser.json`, `output/reminder-webkit-repaired.json`. |
| Final selector-only follow-up                                    | Fresh `vite build --outDir output/reminder-final-build` passed in 7.02s; bundle and CSS checks passed. Targeted Prettier passed. Motion check: zero errors, one existing overscroll warning. Final CSS/spec hashes match the coordinated frozen snapshot.                                                                  |
| Final production offline + scrolled material/fallback/axe checks | Two passed in 11.1s against the final isolated production output. Report: `output/reminder-final-production.json`.                                                                                                                                                                                                         |
| Workbook verification                                            | Six sheets, 37 formulas, valid ZIP/XML, no spreadsheet error cells; render previews and review-state workflow inspected.                                                                                                                                                                                                   |

The final selector-only adjustment followed the full quality gate. Its fresh build/budget/CSS/motion/format and production browser checks cover that delta; no exact-input release receipt is claimed for the final documentation/CSS snapshot. No commit, push, CI release, deployment or production smoke was performed under the current publication hold. Earlier intermediate failures are retained in tool output: a missing test matchMedia fixture; an overbroad document-animation assertion; a test sampling only odd half-hour slots. Corrections target the actual fixture/behavior without skipping assertions or lowering thresholds.

The first combined content/reward gate exposed in-progress shared edits and an incomplete one-occurrence audio preview for an owner-confirmed three-recitation recording. The two incompatible Arabic preview candidates were quarantined without fabricating timestamps; the validator now passes for 285 candidates, and the loader/source/planner targeted run passes 15 tests. An interrupted production browser run is not final acceptance: its preview index/assets disappeared mid-run, invalidating later blank-page failures. The current combined snapshot is local only under the latest owner instruction; no release is claimed.

## Visual/manual evidence

Browser artifacts include expanded/compact Arabic/English phone/desktop views and sourced fasting views. The badge's x/y/width/height are compared across both scroll states in the browser tests. Source/visitor browser tests use explicit API fixtures rather than claiming a production count. External Excel review pack remains an optional editorial review artifact; its original gate is superseded by the owner's explicit criteria-based authorization.

Final visual evidence includes `output/local-home-path-review/ar-390-compact.png`, bilingual/phone/desktop gold-tier views, expanded/compact and fasting images under `output/local-home-scroll-final-browser`, and the final scrolled-frost production image under `output/reminder-final-production`. The editable workbook is `C:/Users/AhmedMahdy/.codex/visualizations/2026/10/16/01a14523-012e-7793-9a68-3d8a32fa5e7d/outputs/reminder-review/Azkarapp-Reminder-Content-Review.xlsx`.

## Documentation updated

Architecture, design-system, motion, content-authoring, decision log and phase index describe the source, timing, storage and accessibility boundaries. Separate approved phases retain appearance/audio/Qibla details.

## Decisions recorded

The owner authorizes authenticated content and both plans. New material is Sahih Bukhari/Muslim, except Tirmidhi 747 with its named Hasan gharib grading. Dorar is used for research; no bulk import, private API token, commentary redistribution or third-party contact.

## Known limitations or remaining risks

Calendar dates are estimates; uncertain boundaries suppress voluntary-fast invitations. No calendar-specific white-day/Arafah/Ashura schedule or closed-app delivery is introduced. Active visitors is an estimate and may be unavailable. Source comparison does not claim independent scholarly review. Physical-device and human assistive-technology checks remain separate.

## Out-of-scope findings

The checkout contained a previously approved interrupted appearance/audio/Qibla release with prior browser failures. Its tests must pass before publication; the scrolling suite cannot establish its acceptance.

## Recommended next step

Review the workbook for further editorial preferences and obtain physical-device/assistive-technology evidence. Remote content publishing remains optional future scope.
