# Phase Report — Notification review and programmer contacts

## Objective

Prepare a source-checked notification catalogue and rotation/destination proposal for approval, and the requested local programmer/contact information. Preserve the local Mushaf work. No commit or push.

## Scope completed

- Reviewed actual browser/Android prayer, routine and contextual schedules, shared copy, Home-only reminder planning and routing.
- Extended V2 with prayer/group rotation candidates, 18 time-based proposals and 11 broader good-deed ideas, authentic-source links, named grades, eligibility, destination readiness and staged approval gates.
- Distinguished existing Friday dua/pre-Fajr reminders from fasting topics currently shown on Home without OS reminders.
- Identified raw browser category-slug mismatch and absent browser click navigation as proposed fixes requiring approval. Kept notification runtime unchanged.
- Prepared both programmer credits, public contact links and separately named bug/feature email actions in Information/About.

## Files changed

`docs/NOTIFICATION_CATALOG_APPROVAL_2026_11_05.md`, phase/decision/index/report documents; `src/app/screens/settings/AboutPanel.tsx`, its unit tests, Arabic/English About labels; `e2e/settings-programmers.spec.ts`.

## Components added or modified

AboutPanel composes the existing shared Button as native anchors. Contact data stays static and local. No new runtime dependency, visual primitive, network call or message-sending service.

## User-visible changes

Local Information/About shows Ahmed Mahdy / أحمد مهدي and Mohamed Hussien / محمد حسين as programmers. Ahmed's existing Yahoo support address and public LinkedIn are available; Mohamed's public GitHub email is available. Report a bug / Suggest a feature open a user-controlled email draft addressed to both, with a localized subject. The application sends nothing itself. No notification copy or behavior changed.

## Accessibility work

Native link semantics, localized unique accessible names, safe external-link attributes, keyboard focus, shared 44px-minimum actions and wrapping addresses at 320px/200% text. Scoped axe checks passed. Real device/mail-client and assistive-technology acceptance remain separate.

## Tests added or updated

Bilingual units verify names, exact email/profile destinations, external-link attributes and localized report/feature subjects. Three responsive scenarios across Chromium, Firefox and WebKit verify target geometry, overflow, keyboard focus, native link destinations and scoped axe. Screenshots cover Arabic phone, English desktop and English 320px/200%.

## Commands run

| Command                                                             | Exact result                                                                                  |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `pnpm exec vitest run src/app/screens/settings/AboutPanel.test.tsx` | 5 passed, 12.71s                                                                              |
| `pnpm typecheck`                                                    | Passed                                                                                        |
| Targeted ESLint for About component/unit/browser spec               | Passed, zero warnings                                                                         |
| Programmer browser matrix, Chromium/Firefox/WebKit                  | 9 passed, 1.4m                                                                                |
| `pnpm build:pages`                                                  | Passed, bundle budget passed                                                                  |
| Document URL validation through the actual routing module           | See `output/notification-route-review.log`; all listed live app links resolve to known routes |
| Prettier on changed files; `git diff --check`                       | Passed                                                                                        |

Further full-check output is recorded in `output/notification-contacts-check.log` when completed; notification drafts do not run or modify the scheduler. No release notes changed and no release was attempted.

## Visual/manual evidence

Actual contact screenshots are under `output/playwright/programmer-credits/`, one directory per viewport/language/engine. Each includes `programmers.png` and `contact-actions.png`. Notification screenshots for new wording remain a later acceptance step after selection/approval.

Public contact provenance: [Ahmed's GitHub profile](https://github.com/amahdy59) lists the LinkedIn URL; [Mohamed's GitHub profile](https://github.com/mohamed0017) lists his public email, corroborated by repository contributions. Ahmed's support address already existed in AboutPanel. No private email endpoint was queried.

## Documentation updated

Approval catalogue, phase brief, decision log, agent index and this report. V2 remains an unapproved source-text shortlist; the first editorial draft remains explicitly rejected.

## Decisions recorded

The latest owner instruction requires approval before committing. Local contact preparation is explicitly requested. Notification copy/rotation/scheduling and future sections remain review-only.

## Known limitations or remaining risks

- Hadith source/grade comparison is not independent scholarly certification. Full context, counts and attribution remain required before incorporation.
- Existing browser notification click/routing and duplicate-delivery behavior need the separately proposed diagnostic/fix stage. Native/background/cold-start behavior needs device evidence.
- Calendar-sensitive fasting needs approved local Hijri confirmation, exclusions and personal choices. Missing guides/routes are labelled rather than fabricated.
- Email requires a configured client; visible addresses remain available. No email was sent and no external contact profile was modified.
- Full release gates, exact-commit CI and production verification must run after approval for any later publication.

## Out-of-scope findings

Friday's exact response period and calendar-sensitive worship must not be reduced to an arbitrary clock offset. Current 20-/60-minute offsets are product reminder choices. Duha and the after-zawal/pre-obligatory Dhuhr prayer are distinct. These distinctions are explicit in the proposal.

## Recommended next step

Owner selects texts, rotation rules, time-based topics/destinations and future sections; reviews contact names/addresses and local Mushaf screenshots. Implement only the approved notification stage, then provide actual notification/device evidence before committing or publishing.
