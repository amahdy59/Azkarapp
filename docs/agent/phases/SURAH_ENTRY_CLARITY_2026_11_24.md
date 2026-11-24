# Approved surah entry clarity — 2026-11-24

The owner approves the recommendations following the screenshot, code/performance review, dark/light concept board and actual-font comparison: “apply recommendations”. This supersedes the 2026-11-06 image-led entry's Mushaf title face, large edge-to-edge cover and title-side Share placement. Apply the shared presentation to Al-Kahf, As-Sajdah and Al-Mulk; preserve their exact reviewed title strings, text, metadata, page canvas, progress, completion, playback and offline contracts.

## Plan

1. Use the existing Noto Sans Arabic UI family at 600, 28px on ordinary phones and at most 36px on desktop; retain natural text enlargement. Group title and metadata, use theme foreground and a bounded inset 16:9 cover, and preserve safe-area/reflow recovery.
2. Move Share into the two-action entry header in place of text appearance. Keep appearance in actual reading, existing More/collection navigation, primary reading, secondary listening and a quiet 44px manual-completion target. Omit collection percentages/counts for single-surah entry; only show completion when recorded. Keep real multi-item collection progress.
3. Paint bundled cover art first. Optional sharper desktop artwork must never replace a pending/failed local image with blank content. Remove timeout-driven source switching. Avoid mounting a long-surah navigator while it is closed; retain explicit opening, selection, focus and screen-owned scroll recovery.
4. Add/update unit and browser regressions for named/generic covers, stalled/error detail, all three identities, sharing, completion, navigator opening, exact title preservation, RTL/LTR, phone/tablet/desktop, 320px/200% text, theme/material/accessibility fallbacks and offline reopening. Capture actual UI screenshots and compare controlled cold-entry diagnostics against a pre-change build.
5. Run targeted unit/browser checks, intact `pnpm check`, core browser smoke and Pages build as feasible in the mixed working tree. Report unrelated existing failures separately; do not weaken assertions, coverage or bundle ceilings. Update the relevant contracts and produce the phase report.

## Publication

Keep all work local under the owner's 2026-11-24 publication hold. No commit, push, deployment or release-note rewrite. Preserve concurrent Qibla, downloads and Home changes. No dependency, religious-content, persistence or synchronization change is authorized. Physical Android and assistive-technology acceptance remain separate from simulated browser evidence.

## Local implementation and evidence

Completed locally. See [phase report](../reports/SURAH_ENTRY_CLARITY_2026_11_24_REPORT.md) for changed files, 84 targeted unit tests, 53 distinct focused browser cases, actual Arabic dark/light/desktop screenshots, offline-install evidence and controlled loading diagnostics. The complete unit/coverage stage and type/content/motion/CSS checks passed. Repository-wide lint/format and bundle gates remain red; the broad core smoke run's one stale prayer-settings heading was subsequently confirmed with its independently updated assertion. The report preserves the original failures, exact follow-up results and concurrent-snapshot limitations. No release pass is claimed.
