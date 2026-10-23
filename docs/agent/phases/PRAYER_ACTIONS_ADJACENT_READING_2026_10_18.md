# Phase Report — Adjacent after-prayer reading action

## Objective

Implement the approved mobile/desktop concept using existing mode colors, Glass material and responsive contracts. Owner explicitly requires local changes only; no commit or push.

## Scope completed

Plan before editing: inspect current card, reuse HomeCard/theme and checkbox primitives, group checkbox/label pairs, place independent reading inside the adhkar row, unify header and separate date/sunrise, make evidence responsive to available card width, verify interactions, modes, text scaling and existing prayer regressions. Preserve concurrent Progress and chrome work.

Implementation complete, including whitespace, sunrise alignment and wider reading-button follow-ups; final alignment verification passed.

## Files changed

src/app/components/PrayerActionsCard.tsx, PrayerMomentPanel.tsx, prayer-actions-card.css, home-wird.css and PrayerActionsCard.test.tsx; src/app/i18n/ar.ts and en.ts; e2e/prayer-actions-responsive.spec.ts, home-prayer-moment.spec.ts and compact-prayer.spec.ts. Documentation additions in ARCHITECTURE, DESIGN_SYSTEM, PRAYER_TIMES, decision log and phase index. Existing edits by other sessions remain separate in the shared checkout.

## Components added or modified

PrayerActionsCard and PrayerMomentPanel reuse HomeCard, TrackingCheckMark, existing icons and shared theme/material rules. No runtime dependency or shared palette/frost change.

## User-visible changes

Checkboxes sit beside labels at logical start. The adhkar row includes a compact قراءة / Read button, replacing the standalone CTA. After owner screenshot feedback, desktop title/checklist share the first logical column, date/sunrise occupy the upper second column, and evidence aligns with the checklist below. Removing the full-width context row shortens the card. The reading button follows its checkbox/label group with an 8px gap and 112px minimum width. The owner then requests sunrise directly under the title; it now shares the exact title text edge in RTL/LTR, while the record date retains the upper evidence-column space. Explicit record date and Fajr sunrise use separate lines. Complete source evidence is beside the checklist at 40rem available card width, and in a collapsed disclosure below it on narrower cards. Completed text remains readable, and reading remains available independently of saved completion or recording eligibility.

## Accessibility work

Native label/checkbox and separate sibling button avoid overlapping actions. Retain 44px minimum targets, input-to-indicator keyboard focus, RTL/LTR order, aria-expanded/aria-controls on the evidence button and full evidence/source text. Shared reduced-motion, reduced-transparency, theme and forced-color behavior remains. Browser verification does not certify manual assistive-technology acceptance.

## Tests added or updated

Unit regression proves reading a completed, non-recordable prayer never toggles completion. Updated inline label/layout expectations preserve all original mosque field semantics. Browser coverage checks six theme/language combinations in Glass and Solid, four widths, 200% text, separate control bounds, keyboard completion/disclosure, navigation and scoped axe. Existing alignment regression now checks adjacent RTL indicators and aligned identity/checklist column bounds.

## Commands run

| Command                                                                                                                                                                                                                                                           | Result                                                                                                                                                                                                            |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pnpm test:run src/app/components/PrayerActionsCard.test.tsx src/app/screens/PrayerMomentScreen.test.tsx                                                                                                                                                           | 31 passed, 14.36s, exit 0                                                                                                                                                                                         |
| pnpm typecheck                                                                                                                                                                                                                                                    | Passed, exit 0                                                                                                                                                                                                    |
| pnpm test:e2e e2e/prayer-actions-responsive.spec.ts e2e/home-prayer-moment.spec.ts --project=desktop-chromium                                                                                                                                                     | Initial 23 passed / 2 failed; superseded hidden-target/placement assertions corrected; corrected rerun 2 passed, 31.3s, exit 0                                                                                    |
| pnpm test:e2e e2e/prayer-actions-responsive.spec.ts e2e/compact-prayer.spec.ts --project=desktop-firefox-smoke --project=mobile-webkit-smoke --grep "responsive ar midnight\|Friday deeds" --workers=1                                                            | Initial design: 8 passed, 3.4m, exit 0                                                                                                                                                                            |
| pnpm test:e2e e2e/prayer-actions-responsive.spec.ts e2e/home-prayer-moment.spec.ts e2e/compact-prayer.spec.ts --project=desktop-chromium --grep "prayer actions responsive\|owns its own centre\|mirrors in RTL\|compact prayer panels reflow across ar 320 view" | First spacing correction 15 passed, 53.2s. Final compact layout 9 passed / 6 failed on an earlier compiled 240px English height assertion; natural English wrapping allowance was already corrected in the source |
| pnpm test:e2e e2e/prayer-actions-responsive.spec.ts --project=desktop-chromium --grep "responsive en"                                                                                                                                                             | Final English cases 6 passed, 31.4s, exit 0. All 15 selected Chromium cases have passing final checks                                                                                                             |
| pnpm test:e2e e2e/prayer-actions-responsive.spec.ts --project=desktop-firefox-smoke --project=mobile-webkit-smoke --grep "responsive ar midnight" --workers=1                                                                                                     | Final compact layout outcome: output/prayer-actions-compact-engines.json                                                                                                                                          |
| pnpm check:serial (coordinated prior snapshot)                                                                                                                                                                                                                    | Passed, 155.5s, exit 0; output/progress-insights-combined-quality.log                                                                                                                                             |
| pnpm check (final compact snapshot)                                                                                                                                                                                                                               | Terminal outcome in output/prayer-actions-compact-quality.log; reported with completion                                                                                                                           |
| pnpm exec prettier --write (phase files); git diff --check                                                                                                                                                                                                        | Passed, exit 0                                                                                                                                                                                                    |

Final browser reports: output/prayer-actions-compact-final.json, output/prayer-actions-compact-english.json and output/prayer-actions-compact-engines.json. Shared all-five-prayers ar320 integration passed Chromium, Firefox and WebKit in the 65-case shared browser run (3.8m, exit 0); output/progress-insights-verified-browser.log.

Final alignment follow-up:15 Chromium cases passed 1.6m. Selected Firefox/WebKit run 3 passed / 1 failed only because Firefox represented 112 CSS px as111.999992; rounding to three decimals retains the 112px minimum and removes only floating-point noise. Corrected Firefox case passed (19.9s, exit 0) in output/prayer-actions-alignment-firefox.json; all four selected Firefox/WebKit alignment cases have passing final checks. Final alignment follow-up verifies title/sunrise logical text edges at every tested width and a 112px minimum reading-button width. Final commands/results are recorded in output/prayer-actions-alignment-browser.json, output/prayer-actions-alignment-engines.json and output/prayer-actions-alignment-quality.log. The compact-layout pnpm check passed 130.8s before this follow-up. Final alignment snapshot: pnpm check passed all stages in 116.4s (exit 0), including the full unit suite with enforced coverage (114.2s), build, typecheck, lint, formatting, content/timing/motion checks, bundle budget and CSS utilities. Final output/prayer-actions-alignment-quality.log.

## Visual/manual evidence

Actual browser captures: output/playwright/prayer-actions/. Phone/tablet/desktop theme/material screenshots accompany browser results. Inspected actual Arabic Light/Solid phone, Arabic Midnight/Glass phone and desktop, and English Dark/Glass desktop captures. Final Arabic desktop is226px high versus276px in the initial implementation; record context fills the formerly empty upper-left area. Layouts use existing mode-specific colors and material; captured focus rings were verified separately. Imagegen references remain proposal artifacts outside the repository.

## Documentation updated

Architecture, design system, prayer contract, owner decision log, phase index and this report.

## Decisions recorded

Follow-up owner screenshot rejects empty desktop space above evidence and between reading/label. Use the upper evidence-column space for date/sunrise, align evidence with the checklist, and use intrinsic label sizing with an 8px button gap. This supersedes the initial shared-header visual guide.

Owner approved implementation while requiring established colors, Glass and responsiveness; explicitly withheld push. Preserve the concurrent owner-approved mosque wording.

## Known limitations or remaining risks

The coordinated prior snapshot and both subsequent compact/alignment snapshots passed the full quality gate. Report-only completion updates follow verification; an earlier receipt is not claimed for later edited inputs. Physical-device and human assistive-technology acceptance remain manual. Existing unrelated source edits are not part of this phase. No release manifest edits, commits or pushes.

## Out-of-scope findings

Concurrent Progress insights and chrome/release work remain owned by their respective sessions.

## Recommended next step

Review the verified local card in the running app before authorizing any release.

## Latest owner follow-up — evidence and record context

Plan: reuse the existing information-sheet composition for the same record date, align wide evidence with the title, render unchanged citation inline after the complete hadith, retain narrow disclosure and sunrise/title alignment, and update targeted unit/browser checks before the full gate. Implemented via an optional infoContext presentation prop; no date ownership, persistence, source wording or shared material changes. Screenshots and final results: output/prayer-actions-evidence-browser.json, output/prayer-actions-evidence-engines.json and output/prayer-actions-evidence-quality.log. Final outcome reported with completion. The earlier record-position statements describe superseded iterations.

Latest verification: initial 31 targeted unit checks passed 7.12s; a subsequent focused assertion verifies the exact complete quotation and inline source plus date-in-dialog behavior. Chromium 25/25 passed 1.1m across all theme/material/language cases and the existing Home/calendar regressions. Actual English desktop capture inspected: title and virtue share their top edge; reference follows the last narration line; record date no longer occupies the main card. Final unit coverage and quality outcome are in output/prayer-actions-evidence-quality.log. Selected cross-engine calendar/layout checks are in output/prayer-actions-evidence-engines.json.

Final selected Firefox/WebKit calendar and responsive evidence checks: 12/12 passed 1.7m, exit 0. Updated source snapshot frozen for pnpm check; final terminal result is recorded in output/prayer-actions-evidence-quality.log.

Completion result: pnpm check passed every stage in 105.7s (exit 0), including full units with enforced coverage 103.6s, build, typecheck, lint, formatting, content/timing/motion checks, bundle budget and CSS utilities. Final source was unchanged during verification. Report-only outcome appended afterward; no receipt reuse claimed for later changed inputs. No commits or pushes.

## Matching heading and secondary-text rows

Owner requests more exact column alignment and a slightly larger attribution. Use the existing 17px title step for both headings, 13px for attribution/sunrise, normal line heights and identical 4px secondary gaps. Browser assertions measure heading heights, title tops, attribution/sunrise tops and logical text edges, alongside existing modes/overflow/target checks. Final evidence: output/prayer-actions-type-browser.json, output/prayer-actions-type-engines.json and output/prayer-actions-type-quality.log. No source wording, shared material, persistence or release change.

Matching-row verification: 12 Chromium cases passed 1.0m; 4 selected Firefox/WebKit cases passed 1.3m, both exit 0. Assertions verify equal heading tops/heights, equal sunrise/attribution tops, logical text edges and 13px attribution, along with modes, four widths, 200% text, targets, keyboard and axe checks. Desktop screenshot inspected. Final pnpm check result: output/prayer-actions-type-quality.log.

Matching-row completion: pnpm check passed all stages in 116.2s (exit 0), including full unit coverage 114.1s, build, types, lint, format, content/timing, motion, bundle and CSS checks. Code held unchanged through verification; this result-only report addition follows it. No commit or push.
