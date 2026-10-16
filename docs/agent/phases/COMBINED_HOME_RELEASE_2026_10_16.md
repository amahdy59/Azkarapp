# Phase Report — Combined Home release, 2026-10-16

## Objective

Publish all pending owner-approved changes after the owner's explicit “push all changes” instruction. This supersedes the earlier local-only holds recorded in the individual phase reports.

## Scope completed

Combine the independently scoped Home material/audio protection, automatic daily path, prayer-card transitions, sourced contextual reminders, visitor footer and Qibla shortcut changes. Preserve offline reading, existing stored/synchronized record shapes and reviewed repetition counts. The last successful deployment was 9ad064b4 (release 2026-10-16.4); e3c4ef4c failed Quality and did not deploy. Notes 2026-10-16.8 describe the combined delta from that deployed baseline. Unpublished draft .6/.7 archive entries are replaced by the combined entry; the committed earlier history is retained.

## Files changed

Application and test files listed in the associated phase reports: AUTOMATIC_PATH_AND_HOME_POLISH_2026_10_16, HOME_PRAYER_SCROLL_AND_PRESENCE_2026_10_16, HOME_RELEVANT_REMINDERS_2026_10_16, DESKTOP_GLASS_AUDIO_LOCK_2026_10_16 and QIBLA_SHORTCUT_VISIBILITY_2026_10_16. Also release notes/history and current release authority in the decision log and index. The release includes all pending repository changes; generated local reports, browser artifacts and the external review workbook remain outside the tracked application.

## Components added or modified

TodaysPathSheet, PathRewardMark, Home/Progress composition, prayer overview, useHomePrayerScroll, AudioControlLock, player/modal, AppearancePanel, source-reminder planning/content and existing Qibla navigation surfaces. No runtime dependency or architecture replacement.

## User-visible changes

Automatic regular/golden/oasis palms; read-only daily path; clearer remaining-time/selection indicators; coordinated scrolling and one-layer frost; remembered Glass/Follow device/Solid appearance; audio touch lock and preserved continuation choice; embedded-three playback fix and precise mismatched-recording/timing quarantine; sourced topic/advance-fasting reminders; restored estimated visitor footer; responsive Qibla shortcuts. Existing Home routine sharing/photo improvements since the last deployment are included.

## Accessibility work

Native modal/focus recovery, keyboard and hold/Escape lock interaction, textual reward/countdown states, 44px targets, reduced motion/transparency, high contrast/forced colors, bilingual/narrow/enlarged-text layout. Axe scans supplement screenshots and keyboard checks; full accessibility certification is not claimed.

## Tests added or updated

Domain policy thresholds/history, audio voice/repetition safety, normalization/merge, touch-lock recovery, sourced reminders and calendar exclusions, scroll hysteresis/reversal/preferences, material fallbacks, daily-path read-only guide, prayer geometry and existing responsive navigation. Original assertions, coverage and budgets remain intact; stale hidden-countdown expectations and one-frame WebKit pseudo-style sampling were corrected without weakening the intended visible states or exact accent equality.

## Commands run

Prior phase reports retain exact local unit/browser evidence, including 107 targeted unit tests, 70 Chromium cases, 12 cross-engine scroll cases and final production-preview offline/material checks. Two previous complete quality passes (236.1s and 120.3s) preceded only the final material-selector delta; a fresh build/budget/CSS/motion and production-preview check covered that delta. Current release runs the full tracked pre-push gates again for its final release notes/documentation/source contents. Exact final hook/CI/deployment results will be reported in the release chat and GitHub workflow records.

## Visual/manual evidence

Reviewed bilingual phone/desktop golden-tier, compact scrolling and Home material screenshots under output/local-home-path-review and output/local-home-material-specificity-browser. Cross-engine artifacts and production-preview checks are recorded in the individual phase reports. The release additionally verifies the public production commit and core browser smoke after Pages succeeds.

## Documentation updated

Architecture, content, design, motion, audio contracts, individual phase reports, decision log and phase index. Fresh bilingual notes and compressed offline release history cover this combined release.

## Decisions recorded

The owner's latest release instruction supersedes the local hold. One coordinating chat owns the release while the other chat keeps source frozen. No independent concurrent build or git mutation is used.

## Known limitations or remaining risks

The mismatched Arabic guidance recording stays unavailable until a correctly reviewed replacement exists. The three-occurrence repentance recording plays correctly but its incompatible word timings remain quarantined. Visitor counts are estimates. Fasting calendar uncertainty suppresses invitations around uncertain excluded dates. Physical-device and human assistive-technology checks remain separate.

## Out-of-scope findings

The preceding Quality failure concerned prayer-card geometry and stale condensed-strip expectations; current Firefox/WebKit reproduction plus exact-commit CI must prove the repairs. No unrelated dependency/schema/content changes are introduced to obtain green checks.

## Recommended next step

Monitor the exact pushed commit through Quality/verify and Pages build/deploy, then verify public metadata and production UI. Preserve any failure evidence and apply only the smallest correct remediation if needed.

## CI fixture remediation — 2026-10-16

The first pushed commit 1e70b624 failed Quality/checks in the Home reminder rotation unit test; Android passed and the browser matrix correctly remained gated. Reproduced locally with TZ=UTC: the unqualified 09:05 host-local fixture selected Cairo's 45-minute Duha window rather than the intended 30-minute regular slot. The second describe also retained the previous test's getContextualEvidence spy history. The repair is test-only: restore spies after each test and use offset-qualified instants plus the selected Cairo location. Assert exact initial/next keys for both regular 30-minute and retained Duha 45-minute slots, and retain the changed-key assertion. No scheduler/product behavior, durations, assertions, coverage or budgets are relaxed. Focused Home/planner tests pass under UTC and America/Los_Angeles. The complete hook/CI is rerun for the remediation commit. Release notes remain .8 because this follow-up changes only tests and this report; the same application release is still awaiting successful CI/deployment.
