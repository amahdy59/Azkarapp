# Phase Report — Seamless headers and shared-card links

## Objective

Apply the owner's four screenshot refinements locally only. No commit, push or deployment.

## Plan before editing

Remove Reader text-area hover/press fills without changing counting or text. Inspect actual Home material and backdrop ancestry and repair only the cause of opaque Glass. Reuse existing header scroll ownership: blend resting headers into their canvas and apply shared frost only after scroll, including Home, Library, Settings and Progress. Keep opaque/accessibility recovery. Include the canonical app URL with every native image share and with downloaded quick-pack text, preserving original approved artwork. Add focused regression tests, capture phone/desktop evidence and run targeted browsers and the non-browser quality gate. Preserve unrelated pending changes.

## Scope completed

Removed the rectangular Reader text-area hover/press fill. Verified the current shared Home Glass tokens in the actual browser and independent App/Home combinations, including saved reduced transparency. Resting Glass headers blend into the canvas; existing scroll state activates their protected material. Opaque Home chrome now uses the same background as its content. Added the app URL to native single/multiple image captions and a plain-text link inside quick-pack ZIPs. Existing unrelated local changes are preserved.

## Files changed

Application: `src/app/screens/ReaderScreen.tsx`, `HomeScreen.tsx`; `src/styles/theme/materials.css`; `src/app/components/home-wird.css`; `src/app/share/shareDispatcher.ts`, its test, `quickRoutineShare.ts`, its test, and `zikrShareCard.ts`.

Browser tests: `e2e/seamless-home-material.spec.ts`, `chrome-material-parity.spec.ts`, `glass-refinement.spec.ts`, `home-quick-share.spec.ts`. Documentation: this report, architecture, design system, agent index and decision log.

## Components added or modified

Existing Reader reading article and Home utility header; CSS presentation of existing shared Header, Library, Settings search/subheaders and owning Progress controls. No new UI component, dependency or persisted schema.

## User-visible changes

Text no longer gains a rectangular pointer highlight. Home retains its shared translucent frost. Resting page headers match their canvas; scrolled content receives the existing protective frost. Image shares include `https://wa-zaker.com/` as accompanying text. Quick-pack downloads include `wa-zaker.txt`; supplied image bytes remain unchanged. Existing generated-image printed branding remains.

## Accessibility work

Preserved keyboard focus, semantic controls, target sizes, RTL/LTR, scroll hysteresis and high-contrast/opaque recovery. Existing header tests retain nested-scroll isolation, threshold reversal, focus/material checks and scoped axe scans. Independent Home Glass tests add phone/desktop axe checks. Automated checks do not establish complete accessibility compliance or real-device acceptance.

## Tests added or updated

Image caption preservation/deduplication, non-image payload handling, ZIP link contents, real Home native-share payload, independent Home Glass with App Opaque/Glass plus saved reduced transparency, resting/scrolled/recovered headers and Reader hover/press backgrounds. Existing cancellation/error/no-silent-download assertions remain intact.

## Commands run

| Command                                                                                                                                                                                                                             | Result                                                                                                                                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm exec vitest run src/app/share/shareDispatcher.test.ts src/app/share/quickRoutineShare.test.ts src/app/share/zikrShareCard.test.ts src/app/components/LayoutShells.test.tsx src/app/screens/HomeScreen.render.test.tsx`        | Pass: 5 files, 45 tests, exit 0.                                                                                                                                                                                                |
| `pnpm test:e2e e2e/home-quick-share.spec.ts --project=desktop-chromium` within the initial combined run                                                                                                                             | All 10 sharing/photo cases passed, including both languages and shared/cancelled/error/download outcomes.                                                                                                                       |
| `pnpm test:e2e e2e/seamless-home-material.spec.ts e2e/chrome-material-parity.spec.ts e2e/glass-refinement.spec.ts --project=desktop-chromium --project=desktop-firefox-smoke --project=mobile-webkit-smoke` with isolated port 4198 | Pass: all 54 cases, exit 0, 9.8m; `output/playwright/seamless-final-results.json`.                                                                                                                                              |
| `pnpm check --serial`                                                                                                                                                                                                               | Pass, exit 0, 487.8s: toolchain, full unit/coverage suite, build, types, lint, formatting, audio/Quran/listening/timing integrity, type scale, motion, bundle and CSS utilities. Log: `output/playwright/seamless-quality.log`. |
| `git diff --check`                                                                                                                                                                                                                  | Pass, exit 0.                                                                                                                                                                                                                   |

The initial browser run had four test setup failures: Library uses a native header rather than the shared-header class, and category route slugs use hyphens rather than underscores. Corrected selectors/route preserve the same material assertions. That run's 24 passing cases and failures are retained in `output/playwright/seamless-first-run/`. The Reader screenshot is captured before pointer counting advances the card; the pointer assertions remain. No application failure was hidden, no assertions skipped and no budgets changed.

## Visual/manual evidence

Phone/desktop Arabic/English resting/scrolled headers and Home material captures, plus Reader no-highlight images, are retained in `output/playwright/seamless-final/artifacts/`; shared header captures also live in `output/playwright/glass-refinement/` and `output/playwright/chrome-parity/`. Inspected the actual Arabic phone Home and desktop Reader images. Browser UI inspection also confirmed actual Home card tint/frost and a decoded photograph. Screenshots establish visual output, not physical-device compositing or human assistive-technology acceptance.

## Documentation updated

Architecture, design-system contract, decision log, agent index and this structured phase report describe the latest local-only policy.

## Decisions recorded

The owner's latest request supersedes always-frosted resting headers. Existing stationary navigation remains. Sharing adds a caption/link without modifying reviewed religious content or supplied artwork. The explicit no-push instruction governs this phase.

## Known limitations or remaining risks

Receiving apps control whether accompanying share text is retained; a receiving app that drops captions will retain only the original supplied image. Generated cards retain their existing printed website. Native share sheets and physical-device frost/assistive technology remain manual acceptance. No new scholarly/content claim or production verification is made.

## Out-of-scope findings

Other sessions' existing local application/content/footer/Progress changes remain untouched except for the specific shared files and small scoped edits listed above. No release notes, commit, push or deployment.

## Recommended next step

Review the local visual evidence and representative-device share caption behavior. Publish only after separate owner authorization.
