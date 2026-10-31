# Phase Report — Recognizable Home reminder label

## Objective

Apply the owner's approved clarity recommendation and verify reminder behavior. Local implementation and checks are complete; production remains on hold.

## Scope completed

The existing localized feature label appears above a specific reminder title. Untitled reminders retain one generic heading, avoiding duplicate text. Header content and actions can wrap when enlarged. Reminder selection, refresh, focus-pinned reading, source links and devotional content are unchanged.

## Files changed

`src/app/components/HomeCards.tsx`, `src/app/components/HomeCards.test.tsx`, `e2e/contextual-reminder-plan.spec.ts`, `docs/DESIGN_SYSTEM.md`, `docs/agent/INDEX.md`, the phase brief and this report. All earlier pending work was preserved.

## Components added or modified

Modified DailyEvidenceCardContent using existing typography, layout and theme utilities. No component library, dependency or runtime state boundary was added.

## User-visible changes

Arabic titled reminders show the small “تذكير لك الآن” label above their title. The existing English label is “Relevant now”; current reminders without separate English titles display it once as the heading. No new religious translations were authored. Normal phone appearance remains compact; enlarged header content can reflow.

## Accessibility work

The title remains a heading and the small feature label describes the card region. Tests cover both languages, non-duplicated generic headings, horizontal clipping and label/title ordering at 320px/200% text. Existing source and refresh controls retain their names, targets and keyboard behavior. Axe checks passed within the focused browser scenarios; this is not complete assistive-technology certification.

## Tests added or updated

Component tests cover specific/untitled reminders in Arabic and English. The existing contextual browser regression now checks recognition before and after refreshing, the screenshot's Saturday afternoon context, enlarged text, source fidelity, changing date contexts and absence of an obsolete fasting reminder. Initial draft assertions incorrectly assumed every reminder/language had a separate title; they were corrected against the existing locale/content contract. No existing product assertion was removed.

## Commands run

| Command                                                                                                                                                                                                                                    | Result                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm test:run src/app/components/HomeCards.test.tsx src/app/reminderPlan.test.ts src/app/screens/HomeScreen.render.test.tsx`                                                                                                              | 3 files, 34 tests passed.                                                                                                                                                                                                        |
| `pnpm check`                                                                                                                                                                                                                               | Final application revision: all stages passed in 233.3s, including enforced coverage, lint, formatting, type/content/timing/motion checks, build, CSS utilities and bundle budgets. See `output/reminder-label-final-check.log`. |
| `pnpm test:e2e e2e/contextual-reminder-plan.spec.ts --grep 'advance fasting evidence' --project=desktop-chromium --project=desktop-firefox-smoke --project=mobile-webkit-smoke --output=output/playwright/reminder-label-verified-browser` | 6 passed, 1.9 minutes; Arabic/English in all three engines, no retries.                                                                                                                                                          |
| `pnpm build:pages`                                                                                                                                                                                                                         | Built in 48.38s; bundle and CSS utility checks passed. See `output/reminder-label-final-pages.log`.                                                                                                                              |
| Targeted final documentation Prettier check and `git diff --check`                                                                                                                                                                         | Passed.                                                                                                                                                                                                                          |

The initial automatic browser-server launch exited before tests began. A fresh isolated preview at `http://127.0.0.1:4204` built and served successfully for the final run. Failed draft test results and server logs remain under `output/playwright/reminder-label-*`; none were counted as passes. The existing motion-rule warning remains unchanged, with zero motion-rule errors.

## Visual/manual evidence

`output/playwright/reminder-label-phone.png` was captured at 390×900 and visually inspected: the Arabic label is visible above “أحبّ لأخيك الخير”. The preview used verified local catalogue bytes through a request fixture. The final browser directory contains bilingual 320px/200% captures and passing text-width/order checks; those checks do not certify the entire Home viewport's sticky geometry or a physical phone.

## Documentation updated

The design system records reminder recognition and generic-heading behavior. The index points to the approved phase brief, which records the plan before editing.

## Decisions recorded

Reuse existing bilingual copy and preserve scheduling/content. Keep all changes local under the existing production hold. No commit, push or deployment occurred.

## Known limitations or remaining risks

The new label has not been deployed; the earlier live-site refresh verification remains separate from this local change. Full physical-device/TalkBack acceptance remains outstanding from preceding phases. Bundle/CSS ceilings passed without alteration, but existing tight headroom remains.

## Out-of-scope findings

No further reminder-selection or refresh defect was confirmed. Untitled English reminders are an existing content contract, not a missing translation introduced by this change.

## Recommended next step

Review the local phone preview alongside the other pending repairs. Keep production on hold until the owner explicitly authorizes publication.
