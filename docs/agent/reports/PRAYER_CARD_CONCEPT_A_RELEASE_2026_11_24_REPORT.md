# Phase report — Concept A and coordinated release repair

## Objective

Implement the newly selected Concept A, preserve the entire combined pending release, repair every failed exact-commit CI job and publish only after intact local, CI and production verification.

## Scope completed

The selected card presentation is implemented and visually inspected. Every failed browser/aggregate job from c28fa0ca Quality run 45470206082 was inspected; its 63 failed and six retried cases remain in preserved logs. The first commit did not deploy. A controlled follow-up repairs obsolete Home/card/Reader expectations and actual Home grain/scroll defects. The Home chat supplied a frozen, explicitly scoped handoff; this chat owns final publication.

## Files changed

PrayerActionsCard.tsx and prayer-actions-card.css; HomeScreen.tsx, home-prayer-overview.css and paper-grain.css; affected browser specs; current bilingual release notes and existing release archive; measured bundle baseline; phase/index/decision/design/motion/prayer documentation. All additionally pending external-reference documents, PDFs and helpers are preserved in the same all-changes release, with lint/format-only integration repairs. No reference generator or quote-cleanup script was executed by this release task.

## Components added or modified

PrayerActionsCard gains one checklist/date presentation wrapper. Existing native checkbox/Read callbacks and shared complete quotation/Sunnah/Rawatib presentation are unchanged. Home's existing intrinsic overview and compact-row measurements supply synchronous fold-space reservation through the current expansion scalar.

## User-visible changes

- One lighter opaque desktop checklist surface, spacious wrapping rows, independent outlined Read, complete inline date and guidance, 18px quotations, 24px section spacing and far-edge Collapse.
- Theme-driven solid/Glass surfaces, natural card height and unchanged compact information recovery.
- New filled Home surfaces retain the existing optional paper texture and accessibility fallbacks.
- Rapid Home folding/scrolling preserves the page footprint and reachable footer without corrective scroll writes.
- The combined Home, downloads, Qibla, settings and surah-entry improvements from the preceding commit remain included.

## Accessibility work

Retained native semantics, independent checkbox/read state, 44px ordinary targets, visible focus and focus recovery. Browser geometry checks verify opaque surfaces, lighter inset separation, aligned group/content edges, 48px wrapping rows and no Collapse overlap with either checkbox or virtue ink. RTL/LTR, Glass/solid, three engines, compact 320px/200%, desktop enlarged stacking and forced colors retain complete content and bounded geometry. Manual physical-device and assistive-technology acceptance remains separate.

## Tests added or updated

Existing assertions are reconciled with the approved new presentation rather than removed. Home tests cover all filled material owners, contrast/transparency/grain fallbacks, same-frame date geometry, real center hit testing and stable footer coordinates after repeated folding. Compact keyboard evidence disclosure and fully visible desktop evidence are both retained. Reader title checks the selected foreground token. Release-history keys target the actual summary to avoid an intervening focus race. An intermediate browser run mixed a newly archived release with an already compiled test build; the fresh final run supersedes that invalid snapshot.

## Commands run

| Command / selection                                                                      | Exact result                                                                                                                                                   |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Final card + responsive prayer cases, Chromium/Firefox/WebKit                            | PASS 54/54, exit 0, 10.3m; output/concept-a-final-browser.log.                                                                                                 |
| Counter feedback, Reader polish, release history and first-use cases in required engines | PASS 56/56, exit 0, 5.7m; output/release-non-home-final-regressions.log.                                                                                       |
| Home targeted units                                                                      | PASS 22/22, 3 files, 41.48s; output/home-ci-units.log.                                                                                                         |
| Home scroll/date/motion/grain, three engines, isolated production-style test build       | PASS 27/27, 7.5m; output/home-ci-production.log and JSON.                                                                                                      |
| Home sticky/date keyboard selection, three engines                                       | PASS 15/15: 13 completed before stopping concurrent WebKit contention; remaining two passed in 31.9s. Both logs retained under output/home-ci-final-keyboard*. |
| Home final grain regression, three engines                                               | PASS 3/3, 50.1s; also included in the final 27-case selection.                                                                                                 |
| pnpm build:pages                                                                         | PASS, exit 0; fixed budgets unchanged. Home startup 518,990 gzip bytes, total output 12,579,621 bytes. output/concept-a-pages-budget.log.                      |
| Final external-reference formatting semantic comparison                                  | PASS: 13 HTML/JSON files retain text/values against their current authored snapshot. output/concept-a-external-content-hashes.json.                            |

The final complete pnpm check, intact pre-push frozen install/core-smoke/Pages build, exact-commit CI and production outcomes are appended to output/COORDINATED_RELEASE_2026_11_24_RESULTS.md and the owner-facing final handoff. No pending outcome is represented as passed here. No receipt is fabricated or hook bypassed.

## Visual/manual evidence

Actual Concept A Arabic Glass and English light solid card captures, plus all final engine/theme/enlarged captures, are under output/playwright/prayer-card-polish/. The implemented Arabic card was shared with the owner. Home's Firefox footer capture is output/playwright/home-ci-remediation/firefox-footer-recovered.png. Concept imagery is not used as implementation evidence. The unchanged translucent scrolled header is not newly certified as an opaque overlay by that capture.

## Documentation updated

Owner decision, active follow-up brief/index, design presentation, prayer and motion domain addenda, this report and current release notes/archive. The full preceding phase report and logs remain intact. Notes describe everything since the last successful deployment, with four replaced bilingual entries and a new 2026-11-24-2 stamp. The measured startup baseline records the deliberate 424-byte gzip increase; no ceiling or growth tolerance changes.

## Decisions recorded

The owner-selected Concept A supersedes only prior card density/surface/Collapse details. The explicit all-changes main release authority remains active. All Home handoffs are frozen before final verification and only this chat commits/pushes.

## Known limitations or remaining risks

Physical Android sensors/background behavior, signing/store readiness and TalkBack/VoiceOver checks retain their documented acceptance limits. The fixed total-output ceiling has 3,291 bytes of headroom in the measured Pages build. External source prototypes are documentation, not newly reviewed/integrated devotional content. Exact-commit Linux CI is required despite successful Windows browser checks.

## Out-of-scope findings

Additional pending external-reference authored changes were preserved; final formatting is validated against the new current snapshot, not against the older first-commit text. Historical audit worktrees remain independent. No reviewed religious string, persisted schema, dependency, calculation, coverage requirement, browser inventory or release gate was changed.

## Recommended next step

Finish the final exact-snapshot hook, full Quality and Pages workflows and production identity/UI smoke. Retain final commit/run identity and actual production captures, then perform the separately documented physical-device and assistive-technology acceptance.
