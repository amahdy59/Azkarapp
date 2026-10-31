# Download, layout and performance repair — 2026-10-31

## Objective and authority

The owner requests “fix all issues” from the review of main f59f27f1. Repair the five confirmed defects and investigate/remediate the measured startup/Glass performance and intermittent scroll behavior. Preserve the untracked Android brief and unrelated PR #15 work.

The owner's subsequent instruction on 2026-10-31 withholds production while they resolve and validate further items. Keep this work local: no commit, push or deployment. Complete local validation and retain evidence for review; this hold supersedes the release step below.

## Inspection and plan before implementation

1. Download reliability: use native response metadata before exposing audio, settle aborted bridge waits promptly with bounded native timeouts, preserve complete-file checksum/checkpoint semantics. Validate Mushaf resources before caching/counting and evict only invalid entries with bounded online recovery. Add native WAV/stall and invalid-cache regressions.
2. Responsive presentation: repair Settings heading and compact navigation reflow at Arabic/English 320px and 200% text; keep all labels, focus and 44px targets. Give Mushaf pages resource-appropriate bilingual download states. Verify solid/Glass, phone/tablet/desktop and overlays.
3. Performance: profile startup's long task and Home scrolling, make measured focused changes without rewriting the content/state architecture or reducing purposeful motion. Diagnose the failed scroll input and retain the original assertions. Compare consistent before/after lab metrics and use browser regressions for behavioral improvements.
4. Finish documentation and fresh bilingual release notes, run affected unit/browser checks, then the complete non-browser gate and required pre-push gates. Commit/push the verified result and monitor exact-commit full Quality, Pages and production smoke. Do not merge unrelated PR work or claim physical Android acceptance.

## Boundaries

No reviewed devotional text, repetition counts, persistent progress schema, prayer calculation, dependency, quality threshold or bundle ceiling changes. Invalid cache eviction is scoped to unusable derived download resources; verified saved audio and user progress remain intact.

## Evidence

Original review and disposable reproductions: output/playwright/app-review/PHASE_REPORT.md. Repair evidence/report: output/playwright/app-repair/. Physical Android acceptance remains separate.
