# Phase Report — Shared chrome frost and accurate mosque wording

## Objective

Apply the owner's requested common sidebar/header Glass material and exact Arabic mosque label. Existing push authority continues for this follow-up; supersede the first release candidate after inspecting its failed jobs.

## Plan before implementation

Reuse header tint/sheen and one common fixed 32px chrome frost for navigation and headers, preserving ordinary cards and opaque/accessibility fallbacks. Render the existing cached scene behind Home navigation too, with a distinct diagnostic scene identifier to preserve the Home scene's existing contract. Keep independent App/Home material settings. Rename mosque actions to صليتها في المسجد / Prayed at the mosque; home records remain independent and do not tick mosque attendance. Keep the statistics table's general record heading distinct. Inspect CI failure logs, repair obsolete Progress browser routes/scroll-owner assertions, test locally, refresh/archive release notes and push via intact hooks. Require exact-commit Quality/Pages and live smoke.

## Scope completed

Implementation and verification in progress in isolated worktree chrome-mosque-release. Concurrent original-checkout Progress insights files are preserved and not included.

## Files changed

App scene composition, AppSceneBackground/TimeOfDayBackground, shared material tokens/CSS and Home header override; Arabic/English strings, prayer tracker summary/test and existing action/screen label tests. New chrome parity browser checks; existing glass/accessibility/responsive regressions. This report and design/decision/index notes.

## Components added or modified

Existing scene components, shared chrome, PrayerTrackerCards and read-only PrayerProgressSummary. No dependencies or persisted schema changes.

## User-visible changes

Sidebar, rail and navigation/header surfaces share 36% tint, restrained sheen and fixed 32px/135% frost in App Glass. Home navigation has actual scenery behind it. Home's independent solid/Glass choices remain. Mosque recording actions explicitly name the mosque; a home record remains shown as home without being counted as mosque attendance. The statistics breakdown continues distinguishing mosque/home from absent records.

## Accessibility work

Preserve native semantics, focus, targets, complete text, direction and existing forced-color/high-contrast/reduced-transparency/unsupported-filter recovery. Fixed frost does not animate. Exact material/contrast and visible-scene browser assertions are required; physical device appearance remains manual.

## Tests added or updated

Mosque/home/legacy record units; exact shared material and scene browser checks. CI responsive failures came from a removed Progress recording-dialog route and observing the inner Progress header instead of its owning controls; replace these with the reachable prayer information dialog and actual sticky owner, preserving axe/opacity/geometry assertions.

## Commands run

25 focused units passed (6.77s, exit 0). The full check passed all stages except the initial-route baseline comparison; unit coverage passed (285.0s), typecheck, lint, format, content and build passed. A source-ownership audit subsequently found unused Progress-session dictionary strings copied into the isolated patch; these have been removed and the original baseline restored for fresh measurement. A corrected isolated Chromium run passed all 16 desktop prayer-geometry/persistence and header scroll/material cases; its remaining shared-link case exposed an obsolete desktop menu selector, corrected to the existing header sidebar button. The corrected shared-link case then passed (8.6s; complete single-case run39.4s). Final release gates pending.

## Visual/manual evidence

Arabic and English chrome-parity captures are available under output/playwright/chrome-parity/desktop-chromium/; ar-quran-wird.png was visually inspected for a continuous navigation/header material. The earlier warm text-area patch is scenery beneath reading Glass; this phase does not change reviewed glyphs or content.

## Documentation updated

This report, design/decision/index. The bilingual 2026-10-18.3 release notes and archive cover the combined changes since the last deployed commit.

## Decisions recorded

Owner explicitly requests matching sidebar/header frost and accurate mosque wording. Supersedes scroll-strength-varying header frost while retaining native scroll state and focus recovery.

## Known limitations or remaining risks

Frost appearance depends on actual background detail and device compositing. Complete browser inventory remains mandatory CI. No automated-only compliance claim.

## Out-of-scope findings

Prior candidate responsive CI failures are documented above and repaired within the release obligation.

## Recommended next step

Finish verified follow-up release and production smoke.

## Exact first-candidate CI findings

Responsive job 117631066743 failed its removed Progress virtue-dialog route and inner-header scroll-state assertion. Chromium job 117631066736 additionally required explicitly opening the now-collapsed Reader sidebar in shared-link tests. Chromium job 117631066694 exposed old interactive Progress prayer-card tests, old clickable/two-column daily routine expectations, and a Home scroll fixture set exactly to the new 8px entry threshold. These are replaced by current Home recording/info flows and read-only Progress exact-record checks; fixture scroll moves beyond the threshold. Full failed-job logs were inspected. No test is skipped or timeout raised. Earlier full-card auto-virtue tests target a presentation that is no longer mounted; the current optional information dialog retains reviewed evidence/accessibility coverage.

## Bundle measurement

The first full gate measured 176,478 bytes gzip. Source-ownership review identified unrelated unused Progress dictionaries copied with the original patch; these were removed before commit. The original bundle baseline and all fixed ceilings remain intact. A fresh gate will measure the final source.

## Concurrent-session coordination

The owner explicitly requested cross-session coordination. This release uses the managed chrome-mosque-release worktree. The Improve progress insights session owns the local-only chart redesign in the original checkout; its source, tests and coverage repair are not included here. Review card design improvements confirmed it has made no source edits and remains concept-only. Both sessions were notified of ownership, overlapping dictionary/summary/docs paths and release-file responsibility. Full quality gates are sequenced to avoid resource contention, with separate browser ports, transform caches and output directories.
