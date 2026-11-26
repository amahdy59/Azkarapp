# Phase Report — Consolidated main release, 2026-11-26

## Objective

Consolidate all pending approved developments into main, audit every branch/worktree and complete the verified release. This report records the integrated scope; final command, workflow and production results are retained in the release session and local `output/consolidation-20261126/` evidence.

## Scope completed

Integrated notification-first welcome, Quran/Progress clarity, exact-source dhikr corrections, six accepted optional audio recordings, compact automatic Qibla, shared location/focus repairs and Home book discovery. Reconciled with deployed cc34d473. Historical already-integrated and superseded branches were explicitly audited and recorded without reverting newer behavior. [Branch/worktree audit](CONSOLIDATION_BRANCH_AUDIT_2026_11_26.md) identifies every source and preservation decision.

## Files changed

Application changes span App composition; shared Progress, location, focus and audio components; prayer/Qibla/Learn hooks and content adapters; bilingual copy; welcome, Quran, Progress, Home, Qibla and Settings screens; audio metadata/waveforms and approved-file evidence; existing content authoring modules and timing-preview package. Tests, authoring tools and architecture/design/quality/domain guidance accompany those changes. The exact inventory is `git diff --name-status cc34d473..main`; snapshots preserve every original input. Release notes/history describe only this combined delta.

## Components added or modified

Added PrayerCitySearch, StorageProtection, HomeLearningCard and HomeLearningSection. Modified ProgressDashboard, ProgressRoutineComparison, ProgressPrayerBreakdown, ResponsiveSheet/ToolbarPanel, HomeLocationRow, FloatingAudioPlayer and the affected screen compositions. Existing semantic themes, icons, routing, normalized state and service boundaries remain authoritative. No runtime dependency or persistence schema was added.

## User-visible changes

Optional welcome permissions have clear recovery and city confirmation. Quran continuation/daily planning and Progress summaries/calendar/activity trends are simpler. Exports remain in Settings. Location names and results are consistent; phone Qibla is compact with permission-owned automatic activation. Home offers available books and continuation while review-only editions remain withheld. Corrected dhikr text/count/evidence retains permanent IDs and history; changed-text audio is suspended. The owner-accepted three dua and three Al-Mulk recordings are optional with existing defaults unchanged.

## Accessibility work

Preserved shared opaque overlays, bounded scrolling, RTL/LTR, keyboard/focus recovery, enlarged text, visible controls, native disclosure/tab semantics and both motion preferences. Migrated obsolete Progress tests to the retained calendar, activity selector, exact chart tables, prayer/routine breakdowns and Settings export. Quran sharing checks distinguish semantic source words from aria-hidden verified QCF glyphs. Automated axe, geometry and hit testing remain separate from physical assistive-technology acceptance.

## Tests added or updated

Feature branches supply content/count/audio suspension, optional-voice identity/default, shared focus/location, Qibla lifecycle and welcome permission regressions. Integration repairs retain exact records, matched comparisons, clock/date boundaries, JSON/PNG bytes, offline reload, focus, sticky geometry and responsive assertions. Preserved the old sharing branch's independent-QR boundary regression using the current 2920px tall format; existing QR/source/pagination assertions remain.

## Commands run

| Command/check                                                                      | Result recorded at integration checkpoint                                                                                                                                   |
| ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git fetch --all --prune`; branch/worktree audits                                  | Complete; all original refs and snapshots represented in main ancestry.                                                                                                     |
| `pnpm install --frozen-lockfile`                                                   | Passed with Node 24.15.0 / pnpm 11.19.0.                                                                                                                                    |
| `pnpm typecheck`; scoped ESLint                                                    | Passed.                                                                                                                                                                     |
| Seven affected Vitest suites                                                       | 71 tests passed.                                                                                                                                                            |
| Final sharing-card suite                                                           | 21 tests passed, including restored QR clearance.                                                                                                                           |
| Initial integration browser attempts                                               | Retained failures from obsolete controls, hidden-disclosure lookup and old labels; repaired without disabling tests or changing product contracts.                          |
| Broad Chromium migration pass                                                      | 47 passed; three stale test locators corrected for focused rerun. Exact-data/export, offline charts, all read-only responsive cases and configuration/motion checks passed. |
| `pnpm test:e2e:inventory`                                                          | Passed: all 4,629 cases assigned exactly once across nine jobs.                                                                                                             |
| `pnpm audit:prod`                                                                  | Passed: no known vulnerabilities.                                                                                                                                           |
| Final selected cross-engine features                                               | Passed: 61 cases across Chromium, Firefox and WebKit. See `feature-final.log/json`.                                                                                         |
| Complete non-browser quality, core smoke, Pages build, browser inventory and audit | Required before publication; final exact commands/results retained in this release session and evidence directory.                                                          |
| Exact-commit Quality/Pages/production smoke                                        | Required after push; no success is claimed by this pre-publication checkpoint.                                                                                              |

## Visual/manual evidence

### Pages bundle measurement and deliberate baseline update

The first push was blocked before upload: the Pages build measured initial-route gzip at 193,043 bytes against the recorded 189,241 (+3,802 bytes, just over the 2% growth allowance). The initial graph contains the entry, stylesheet, preload helper and core reviewed-content chunk; deferred audio/Al-Baqarah remain excluded. This release deliberately ships expanded exact-source dhikr evidence plus the approved welcome, Quran/Progress, Home/location and Qibla presentation changes. Removing reviewed source clauses to reduce bytes would violate the source-correction contract; moving startup content boundaries is a separate architectural/performance change.

Updated only the recorded measurement baseline, as required by the repository's deliberate-growth policy: CSS 164,887 raw / 28,401 gzip bytes (+442 / +62); initial route 193,043 gzip (+3,802); complete Home startup 527,852 gzip (+8,862). Date: 2026-11-26. The 250KiB initial ceiling, all per-file/total ceilings and the 2% tolerance are unchanged. Current CSS is 271 gzip bytes below its unchanged 28KiB ceiling; a later focused shared-style cleanup is recommended. The production budget check passes against these measured values. The changed input invalidates the prior quality receipt, so the complete hook must run again; no receipt or hook was bypassed.

Inherited [Qibla/location/Home gallery](../evidence/recommendations-next-release/README.md) and [optional audio gallery](../evidence/optional-audio/README.md) were retained and inspected. Fresh integrated Progress/Settings and cross-engine screenshots are under `output/playwright/` and Playwright test artifacts. Sensor/permission/media fixtures are labelled; screenshots do not establish physical direction, native delivery, complete Quran coverage or word-timing approval.

## Documentation updated

Active consolidated phase, decision log/index, branch audit, architecture/design/quality/content/prayer/motion/audio/Learn domain contracts, feature reports and current bilingual release manifest/archive. Historical local-only reports retain their dated evidence; the owner's current instruction lifts their publication hold, not independent review boundaries.

## Decisions recorded

The owner explicitly requests all changes consolidated/pushed and main brought up to date. Content/source and exact-recording acceptances are taken from their existing owner decisions. No new religious interpretation, recording approval or native-device acceptance was invented. Original dirty worktrees were verified against saved trees, then HEAD/index advanced to those already-integrated snapshots without changing working files.

## Known limitations or remaining risks

Physical Android/iPhone permission/delivery, sensor accuracy, TalkBack/VoiceOver and performance acceptance remain independent. Withheld books still require source/translation review. Suspended recordings require review/replacement. New Quran voices cover Al-Mulk only and the optional dua voice covers three exact readings. Browser reminders retain full-closure limits.

## Out-of-scope findings

Post-push local integration verification exposed one migrated prayer-test fixture selecting an empty completed-week range on its fixed date. Selecting the elapsed month preserves every five-prayer, resize and no-recording-controls assertion; its focused rerun passed (1 case, 5.9s). The superseded CI run 45816709146 was cancelled before the browser matrix to avoid knowingly running that stale fixture; its Android job had passed. A fresh exact-commit run is required for the repair. This is a browser-test correction only; application behavior and current release notes are unchanged.

Exact-commit run 45818354811 passed non-browser checks and Android verification. Its responsive job 139905462569 passed 154 cases but failed the two bilingual header-scroll cases because ordinary phone Qibla now correctly fits without scrolling. Inspected its complete job log, annotations, retained retry traces and snapshots, then reproduced both failures locally. The header test now uses Qibla's genuine 320px-high recovery viewport and restores the ordinary height for other routes. All original opaque-paint, no-blur, sticky-geometry, theme and scroll assertions remain. The focused final run passed all 10 cases across the five browser/device projects (1.2m). Dedicated normal-phone no-scroll Qibla coverage is unchanged. No application code, assertion, timeout, coverage threshold or release-note entry changed for this remediation.

Older worktrees contained already integrated drafts. Their source snapshots and historical branch ancestry are retained; no stale CSS, old native implementation or former Progress gamification was replayed over newer approved work. No branch was deleted or force-pushed.

## Recommended next step

Complete the exact-commit release cycle, then prioritize physical-device notification/Qibla/assistive-technology acceptance and independent review of withheld books/suspended recordings. Keep further voice expansion tied to exact-file acceptance.
