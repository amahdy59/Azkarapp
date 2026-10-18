# Phase Report — Stable prayer cards and scrolling, 2026-10-18

## Objective

Apply the owner's approved small-card/scroll recommendations locally while preserving the existing visual identity and the in-progress release. Include the subsequent requirement for consistent, sufficient padding in expanded and compact cards.

## Plan before implementation

Inspect the existing Home sticky boundary, prayer summary anatomy, 96px/8px hysteresis, CSS expansion handoff, natural-footer measurement, selected-card light and responsive tests. Reuse those boundaries. Protect the complete sticky ground, keep text geometry stable, fade footer text before contracting, preserve next countdown, keep page-flow coordinates stable without synthetic scroll writes, and hold geometry during prayer interaction. Verify Arabic/English, phone/desktop, enlarged text, reduced motion and material recovery. No timing, recording, content, persistence or dependency changes.

## Scope completed

Prepared in an isolated source copy based on 2b1e6414 while the release coordinator froze the shared checkout. The coordinator subsequently allowed local uncommitted integration after pushing 2b1e641435a68e50d17ef0c22ce99e01071551dd. These changes are excluded from that release; no commit, push or release-note edit is authorized here. Preserve the concurrent content session's edits.

## Files changed

- src/app/components/home-wird.css
- src/app/components/PrayerTrackerCards.tsx and PrayerTrackerCards.test.tsx
- src/app/hooks/useHomePrayerScroll.ts and useHomePrayerScroll.test.tsx
- src/app/screens/HomeScreen.tsx
- e2e/home-prayer-scroll.spec.ts, home-scroll-material.spec.ts, home-prayer-motion.spec.ts, sticky-prayer-cards.spec.ts, home-clarity.spec.ts
- e2e/prayer-scroll-padding.spec.ts
- This phase report.

## Components added or modified

Existing PrayerTrackerCards, HomeScreen, useHomePrayerScroll and scoped Home CSS. No new product component, icon system, dependency or stored setting. Preserve shared max-w-7xl/px-page alignment, equal desktop columns, 8px minimum time/footer clearance, top-aligned icons and existing subpixel selection-light normalization.

## User-visible changes

The scrolled sticky region covers its entire width, including card gaps and gutters. Glass uses a protected 88% existing on-media ground with one stationary shared chrome frost; individual cards retain their tint, borders and sheen without nested blur while scrolled. At the top they keep their independent frost. Opaque, high contrast, reduced-transparency and forced-color recovery remain.

Names and times keep their existing expanded font sizes/columns while icon badges and whitespace compact. The next countdown remains visible below its time in compact mode; its duplicate visual copy is hidden from assistive technology and references continue to expose the original footer description. Non-next statuses retain their established expanded pills/current dot.

Card side padding is consistently 0.75rem (12px at ordinary text size), expanded top 0.75rem, compact top 0.5rem, and text/footer lower clearance at least 0.5rem. Footer content uses 0.5rem vertical and 0.75rem horizontal padding. Spacing scales with text enlargement. Container-dependent icon sizes remain square.

Footer text fades over 60ms before a 160ms contraction. Expansion reverses the order. Native CSS handles reversals and reduced-motion cancellation. The original expanded flow footprint is reserved below the sticky element as it contracts, so content coordinates/scrollTop stay steady. Existing ResizeObserver updates a CSS margin only; no React frame loop or synthetic scrollTop adjustment. Native horizontal browsing stays untouched. Prayer focus or open details hold the current geometry; leaving interaction reconciles at the next scroll or blur.

## Accessibility work

Preserve native buttons, expanded/controls/described-by semantics, 44px targets, focus rings, RTL/LTR, natural keyboard scrolling, short-viewport ordinary-scroll recovery and app/OS reduced motion. Countdown duplication is aria-hidden rather than a duplicate live region. New browser geometry checks cover side/top/bottom insets and enlarged text. Automated axe checks supplement, and do not replace, physical-device/screen-reader acceptance.

## Tests added or updated

Unit checks cover held interaction geometry and accessible countdown duplication. Browser checks cover unchanged time size and reading edge, content coordinates and scroll stability, horizontal position, reversals, interaction release, protected full-width backing, one frost, material fallbacks and 320px/200% Arabic/English padding. Existing sticky/hierarchy cases retain their original scope; expectations are updated only for the approved retained countdown and protected-ground contracts.

## Commands run

| Command                                                                                                       | Result                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Pinned Vitest run: PrayerTrackerCards, useHomePrayerScroll, HomeScreen.render                                 | 3 files, 37 tests passed (13.61s)                                                                                                    |
| Pinned TypeScript --noEmit and scoped ESLint                                                                  | Both passed, exit 0                                                                                                                  |
| Playwright: final handoff, material, padding, motion and sticky cases, desktop-chromium                       | 13 passed, 26.5s, exit 0                                                                                                             |
| Playwright: final motion and 320px/200% Arabic/English padding, desktop-firefox-smoke and mobile-webkit-smoke | 8 passed, 44.7s, exit 0                                                                                                              |
| pnpm check on combined local prayer + settled Benefits changes                                                | PASSED, 161.3s; unit/coverage, build, TypeScript, lint, format, domain/motion/type-scale, bundle budget and CSS utilities all passed |
| git diff --check                                                                                              | Passed                                                                                                                               |

Earlier mixed-engine diagnostic: nine Chromium/Firefox cases and the first WebKit phone case passed; the WebKit 1440px case captured expanded/compact views but stalled during the remaining diagnostic. Stopped only this test process and isolated final WebKit motion/padding cases, which all passed. No assertion, timeout, browser project or coverage threshold was removed. The final Chromium run also passes all original handoff/axe cases. Earlier isolated type-scale invocation could not run without Git metadata; the actual combined pnpm check subsequently passed that gate in the real repository.

Targeted isolated tests use the repository-pinned local binaries and existing unchanged dependency graph. pnpm initially attempted to reinstall through the external dependency junction and aborted without a TTY; no dependency install was allowed through that junction. The final combined check uses ordinary pnpm in the shared repository. No lockfile, dependencies, quality receipt or hook was fabricated or bypassed. This phase report's result section is finalized after the successful gate; a later release must validate its final snapshot through the existing hook.

## Visual/manual evidence

Main-workspace output/prayer-scroll-refinement/prayer-padding-motion-evidence contains expanded/compact Arabic/English phone/desktop, protected-gap and 320px/200% padding captures. output/prayer-scroll-refinement/prayer-engine-padding-evidence contains final Firefox/WebKit evidence. Inspected final desktop compact, phone Glass and enlarged-text captures. Logs: output/prayer-scroll-refinement/prayer-padding-motion.log, prayer-engine-padding.log and the preserved interrupted mixed-run prayer-final-browser.log. Combined gate: output/prayer-combined-quality.log. No claim of physical touch or screen-reader acceptance.

## Documentation updated

This dedicated approved phase records the superseding prayer scroll contract, keeping the frozen release documents untouched as requested by the coordinator. It supersedes the prior no-shared-ground/no-compact-countdown/280ms handoff descriptions only for this local refinement.

## Decisions recorded

Keep existing appearance, card identities, free horizontal browsing and prayer state semantics. Do not redesign the row or replace it with a next-prayer bar. Integration remains local and uncommitted; the current release proceeds independently.

## Known limitations or remaining risks

Human screen-reader, physical touch/inertial-scrolling and older-device compositor acceptance remain manual. The isolated source copy and screenshot evidence do not establish exact-commit release readiness. Complete mandatory gates and refreshed release notes are required if this local work is later published. Reflow during viewport/text-size changes remains natural; fixed-flow compensation applies to the collapse handoff, not arbitrary responsive reflow.

## Out-of-scope findings

None; reviewed religious content, prayer calculations, reminders, optional sync and persisted records are unchanged.

## Recommended next step

Owner visual review of expanded/compact cards and scrolling on a physical phone, followed by a separately authorized release with the intact gates.
