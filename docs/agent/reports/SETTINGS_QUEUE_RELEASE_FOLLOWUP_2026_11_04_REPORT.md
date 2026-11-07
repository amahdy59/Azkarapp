# Phase Report — Settings hover, anchored queue and release follow-up

## Objective

Complete the owner's control-family follow-up and push-all release, preserving the preceding Mushaf, header, material and reader work.

## Scope completed

Settings rows retain their ink/opacity, geometry, inherited corners and separators during hover. A local 10% inset primary tint covers the row, with separate keyboard focus; enabled-row press no longer fades text. The listening queue uses the existing Radix portalled popover at its own trigger with an 8px gap, flipping, viewport bounds and an opaque protected surface. Current-recording focus/reveal follows resolved popup height, including 320px/200% text. Entry selection, pause/play state and saved listening position remain under the existing controller.

CI remediation reconciles superseded Progress header/filter paint assertions with the approved shared material contract; repairs the real 48px translation-column offset; keeps compact view labels on one line in Firefox while constrained layouts hide optional labels; and waits for real Quran word/font readiness before geometry measurements. No assertions, coverage limits, inventory checks or release gates are removed.

## Files changed

Shared SettingsRow/settings-rows.css; AudioQueueSheet/FloatingAudioPlayer/floating-audio-player.css; pill-controls.css and quran-listening-translation.css; the affected browser specifications and feature selector; release notes/archive and the linked design/quality/phase/decision/completion documentation. The release history retains the preceding committed .6 manifest and adds the current .7 notes, as the archive contract requires; lossless gzip content remains validated.

## Components added or modified

SettingsRowItem, SettingsToggleRow and SettingsSelectRow styling; AudioQueueSheet now composes the existing Radix popup in the real trigger's root; shared tab geometry and listening translation sticky placement. No runtime dependency or state schema is added.

## User-visible changes

Hover identifies a whole Settings row without disappearing separators or faded text. The listening list opens beside its own button. Enlarged users can scroll recordings inside the popup and reach the current recording immediately. Progress/Library compact controls keep matching heights in Firefox, and paired listening translation starts beside the Arabic column.

## Accessibility work

Preserve 44px minimum ordinary targets, native buttons/dialog semantics, named heading/close action, keyboard focus entry/return, Escape and opaque overlay text. Fine-pointer hover is tested with explicit desktop pointer semantics in all three engines; touch behavior remains covered in queue tests. RTL/LTR and 320px/200% reading remain in the browser matrix. Automated checks do not establish physical-device or assistive-technology acceptance.

## Tests added or updated

New Settings hover browser regression measures stable ink/opacity/geometry/corners and dividers across both row groups. Existing audio continuity adds actual trigger-gap/collision/viewport/opacity/current-recording checks and screenshots while retaining its selection, pause, sleep and resume assertions. Existing material/header/compact/Quran tests retain their behavioral and geometry assertions with updated contracts/readiness. Feature controls selection includes the new hover regression.

## Commands run

| Command / stage                      | Result / evidence                                                                                                                                                                                                                                                                                                |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Initial release local quality / hook | Full serial quality passed in 243.4s; tracked pre-push hook passed frozen install, 28 fast browser cases and Pages build; pushed 0388fe1. Earlier report/logs retain details.                                                                                                                                    |
| Initial exact-commit CI              | checks and Android passed; full browser inventory exposed failures. Every failed shard log retained under output/ci-job-*.log. This was not a successful release.                                                                                                                                                |
| Targeted units after queue observer  | 62 tests in 3 files passed in 32.04s; output/settings-queue-final-units.log.                                                                                                                                                                                                                                     |
| Material/layout Chromium remediation | 50 browser cases passed in 3.3m; output/release-remediation-browser.log.                                                                                                                                                                                                                                         |
| Settled control follow-up            | Exact results and screenshots retained in output/control-followup-final.log and output/playwright/control-followup-final. The complete local quality/hook and exact-commit CI/Pages/production results are retained in output/control-followup-release*. These stages must succeed before reporting publication. |

Diagnostic runs remain separate. In particular, early popup placement clipped an enlarged current row before the final-height reveal; nearest-edge scrolling also exposed fractional clipping, corrected by centering it. An early hover fixture used touch pointer semantics where hover is intentionally absent; the final hover test requests a fine pointer. Concurrent Windows WebKit diagnostics timed out and do not count as passing results.

## Visual/manual evidence

Generated screenshots show whole-row hover/focus for first/middle/last rows in the two Settings groups and queue anchoring at phone/tablet/desktop and 320px/200%. Preserve final inspected captures under output/comment-completion-evidence/settings-queue and production screenshots beside the release smoke result. The preceding comment-completion ledger links Mushaf/footer/header/dark-paper comparisons and original screenshot provenance.

## Documentation updated

Design system, quality checklist, active phase, decision log, comment completion ledger and this phase report. The bilingual current release manifest is rewritten for the full unpublished batch with stamp 2026-11-04.7 and four entries per language.

## Decisions recorded

Latest owner instructions authorize these corrections and publishing all changes. Complete intact hooks, exact-commit Quality, Pages build/deploy and production smoke; no additional approval gate applies.

## Known limitations or remaining risks

Physical Android haptics/notifications/WebView painting, upgrade behavior, TalkBack/VoiceOver and owner aesthetic acceptance remain separate. Browser automation does not claim those results. Publication remains conditional on actual final release evidence, never on an earlier successful local run alone.

## Out-of-scope findings

No reviewed devotional content, timing annotations, persistence/sync schema, runtime dependency, native signing/version or router architecture change.

## Recommended next step

Finish exact-commit release verification, then review the deployed UI on the owner's target device using the existing Android handoff.

## Existing focus regression reconciliation

CI for df961cb2 passed the main checks, Android, responsive and the first two Chromium shards, then exposed three old focus-surface assertions that explicitly required Settings separators to disappear. The current owner follow-up requires stable separators. Update both hover/focus expectations to visible; keep every corner, single-focus, enlarged-layout, dialog, Forced Colors and keyboard recovery assertion. The missing legacy test selection was a local coverage gap, not evidence that the product should restore disappearing separators. Run the complete nine-case focus specification across all three engines and intact release gates before the test/documentation correction push. The application and current .7 release notes remain unchanged by this correction.
