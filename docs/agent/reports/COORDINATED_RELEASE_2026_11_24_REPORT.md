# Phase Report — Coordinated complete release

## Objective

Implement the approved final desktop prayer-card reference and consolidate every pending main-checkout change for one verified release. The owner explicitly supersedes the earlier publication hold and requests coordination, all required checks, a push to main and the complete Quality/Pages/production cycle.

## Scope completed

Preserved and integrated the pending Home overview/location, desktop prayer guidance, Qibla recovery/appearance, Downloads overview/recovery, prayer-location settings, surah entry/artwork, offline acquisition, shared presentation, build-literal consolidation and external-reference documents/tooling. No pending main-checkout feature was omitted merely because another chat created it.

## Files changed

The combined commit contains the complete reviewed Git working-tree inventory. Primary application areas are `src/app/components/`, `src/app/screens/`, Qibla/location hooks, download coordination, prayer calculations, localization and the existing build-literal plugin. Supporting changes include affected unit/browser specs, phase/domain reports, `docs/external-sources/`, third-party geomagnetic attribution, current bilingual release notes and their normal archive. The final commit's stat is the authoritative complete file list; ignored generated builds/test evidence remain in `output/`.

Historical detached worktrees and the separate unreviewed dhikr-source audit branch are not silently imported into this shared-checkout batch. Reviewed religious wording is unchanged.

## Components added or modified

HomePrayerOverview/HomeLocationRow; PrayerActionsCard/PrayerMomentPanel and shared PrayerEvidenceQuote/Sunnah/Rawatib presentation; DownloadOverview/DownloadProgress and existing offline rows; PrayerCalculationPicker/protected ResponsiveSheet; QiblaCompassDial/QiblaScreen; SurahArtwork/Reader entry. Existing application state, acquisition, permission and persistence owners remain authoritative.

## User-visible changes

- Home keeps all five prayer times with a two-line current/next summary and grouped below-timings location actions.
- Expanded desktop prayer cards expose complete guidance, passive references and recording dates, with a tighter heading gap, aligned edges and consistent, quieter hierarchy.
- Downloads presents combined selection, truthful current-group progress, verified resume/recovery and reachable cancel, preserving completed resources.
- Qibla has clearer live/static guidance, honest accuracy/location, direct retry/calibration and protected details/results.
- Surah entry and prayer-location/calculation settings have clearer reading/action hierarchies and protected, wrapping choices.

## Accessibility work

Preserved native semantics, 44px ordinary targets, RTL/LTR order, visible focus, compact modal containment/recovery, reduced motion/material fallbacks and enlarged-text reflow. New card geometry tests prove the close target cannot overlap the checklist and date/title edges align. Complete reference/quotation strings remain readable passive text. Automated axe/keyboard/geometry and screenshots supplement, rather than replace, physical Android and TalkBack/VoiceOver acceptance.

## Tests added or updated

Affected feature suites retain temporal/date/calculation, offline cache/download, Friday/source, location races, menu opacity, focus, artwork fallback and responsive contracts. The final prayer refinement adds explicit heading-gap/control-overlap and shared evidence checks. Mocking tests retain required isolation. Browser inventory and the complete exact-commit CI matrix remain required.

## Commands run

| Command                                                                                      | Result                                                                                                                                                                                       |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`                                                             | PASS, exit 0, pnpm 11.19.0 with Node 24.15.0; frozen graph already current.                                                                                                                  |
| Targeted prayer/Home/isolation unit command                                                  | PASS: 4 files, 57 tests, exit 0, 17.47s. `output/release-prayer-units.log`.                                                                                                                  |
| `pnpm test:e2e e2e/prayer-card-desktop.spec.ts` across Chromium, Firefox and WebKit          | PASS: all 18 cases, exit 0, 3.5m. `output/release-prayer-browser.log` and JSON report.                                                                                                       |
| Affected responsive-prayer, Downloads, Qibla, prayer-settings and surah-entry Chromium specs | PASS: all 77 cases, exit 0, 1.8m. `output/release-affected-browser.log` and JSON report.                                                                                                     |
| External-reference scoped lint and formatting                                                | PASS, exit 0; Node Buffer/fetch and page-evaluation document boundaries made explicit, unused values removed without changing templates.                                                     |
| External-reference semantic content comparison                                               | PASS: all 13 existing HTML/JSON files retained parsed JSON values and non-whitespace HTML text through formatting. `output/release-external-content-hashes.json`; PDFs were not regenerated. |
| `pnpm audit:prod`                                                                            | PASS, exit 0: no known vulnerabilities. `output/release-audit.log`.                                                                                                                          |

The intact final quality/core-smoke/Pages gates are enforced by the tracked pre-push hook. Their exact results and the subsequent exact-commit CI/deployment/production results are recorded in the live release evidence at `output/COORDINATED_RELEASE_2026_11_24_RESULTS.md` and the final owner-facing release handoff. No full quality or release success is claimed before those results exist. No receipt is fabricated or hook bypassed.

## Visual/manual evidence

Actual final implementation captures are under `output/playwright/prayer-card-polish/`, including Arabic Glass and English light solid Asr/Dhuhr and cross-engine 320px/200% captures. The final implemented Arabic Dhuhr screenshot was shared with the owner during consolidation. Earlier concept images are explicitly distinguished from application screenshots. Home, Qibla, Downloads, settings and surah phase reports retain their own visual evidence.

## Documentation updated

README and architecture, design, prayer, motion, quality, test-strategy and offline-audio domain documents retain all pending approved changes. The decision log and agent index identify this coordinated release as the active authority. Current release notes were completely rewritten for this batch with four matching Arabic/English outcomes and a new stamp, then archived with the existing script.

## Decisions recorded

The owner's current push-all instruction supersedes the 2026-11-24 publication hold. `Review homepage redesign progress` supplied and froze the final two-line/location handoff. `Create mobile homepage redesign mockups` was instructed to preserve the newer layout and freeze source edits. This chat alone owns combined commit/push and workflow recovery.

## Known limitations or remaining risks

Physical compass/location, Android background/process-death behavior, signing/store readiness and assistive-technology acceptance retain the explicit phase/device checklists. Browser simulation is not physical acceptance. External reference prototypes are included as documentation; their source material is not newly integrated into reviewed application devotional content. No dependency, content, persisted schema, force push or budget/coverage reduction is introduced.

## Out-of-scope findings

Earlier lint/format failures in external-reference scripts/documents are repaired as part of the requested all-changes consolidation. Historical failures remain in the earlier phase reports. Independent source-audit worktrees retain their review boundary.

## Recommended next step

Complete the final intact local hook, exact-commit CI, deployment and production checks, then retain the final release identity and evidence. Perform the separately documented physical-device and assistive-technology acceptance when suitable devices are available.

## Final integration repairs

The first combined gate passed all units/coverage but caught additional external-reference helper files written after the initial cleanup and a 1,126-byte total-output overrun. The Node/browser evaluation globals and formatting are repaired without executing document generators. The existing build-only literal sharing now covers the two interface dictionaries as well as the previously included authoring/audio data. Nine tooling tests pass, including byte-exact equality for both actual language dictionaries and smaller actual minified output. No source translation or religious string was changed. The measured release sizes are recorded in scripts/bundle-baseline.json as required for the deliberate full-batch change; all hard ceilings and the existing 2% growth guard remain unchanged. The final gate below supersedes this failed intermediate snapshot; its earlier logs remain preserved.

All added document Markdown hard breaks and template-string whitespace are preserved by Prettier; Git's generic whitespace diagnostic flags some of these documentation-source constructs. Product and test source whitespace is checked separately. These artifacts are included as requested, and no lint/format rule is disabled to admit them.

The external document author regenerated the three Book 1 HTML files during early consolidation, after the first semantic snapshot. Those authored changes are retained in the all-changes batch; the first snapshot is not claimed to describe them. A second snapshot of the final 13 HTML/JSON files verifies the final formatting pass preserves their current text/values exactly (`output/release-external-content-hashes-final.json`). No document generator or quotation-cleanup script was run by this release task.
