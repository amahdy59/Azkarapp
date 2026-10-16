# Phase Report — Image-first sharing

## Objective and approved plan

The owner requests global sharing improvements with image export as the dominant action and quieter Text/Link alternatives. Inspect shared dialogs and export contracts; simplify their hierarchy and give the actual image more room; retain existing approved art, source controls, readable export metrics and full content; remove unnecessary alternate-art fetching; keep image copy honest; verify Arabic/English, narrow/large/text-resized layouts, browser fallbacks, accessibility and offline behavior; finish intact release gates.

## Scope

CollectionShareModal serves collection, single zikr and evidence sharing. Its existing image renderer and supplied artwork remain authoritative. Ayah sharing already puts image export first and keeps text in a disclosure; preserve that structure. Progress milestone sharing previously sent only text despite showing a visual card. Compose it through the same studio with explicit local summary items, existing localized counts/date, no repetition metadata, and no auto-sharing or new persistence.

## Intended behavior

Image remains the default and has the strongest method control. Text and Link remain directly reachable but quieter. Artwork source choices move beside customization, after the preview on phones. The preview frame is simpler and larger. The existing Share/Save/Copy footer retains concise labels, with greater space for image handoff and quieter Copy. Unsupported copying in Image mode is explicitly disabled and explained; Text mode owns text copying. Ready-made artwork is fetched only when selected, preserving the generated-studio default and offline fallback.

## Integrity and accessibility

No reviewed text, attribution, repetition, source selection, layout font minimum, image dimension or approved artwork changes. Semantic button groups, pressed states, 44px targets, native disclosures, focus recovery, fixed actions, reduced motion and 200% reflow remain. No new dependency or remote service. Native share cancellation must never download a file silently.

## Verification and release report

Record exact commands/results, screenshots, changed files, limitations and final CI/deployment identities in the final release evidence. Physical destination-app compression, QR scanning and screen-reader acceptance remain manual checks.

## Files and components changed

CollectionShareModal and its tests; ShareableCardModal composition and its tests; Arabic/English copy; image-first-sharing browser spec; architecture/design/decision/index documentation; the linked sharing recommendations report; current release notes and archive. Existing Button, Modal, SharingChoiceLabel, native disclosures, image renderer and dispatchers are reused. Ayah export, quick routine sharing and approved source assets are unchanged.

## Accessibility and integrity work

Named method group and explicit pressed indicators remain. Image has a filled surface and more flexible width, while all methods wrap at enlarged text rather than forcing narrow equal columns. Copy retains an associated capability explanation and no longer substitutes text in Image mode. Generated/curated source controls follow the preview in phone DOM order; desktop keeps the existing mirrored composition. Matching readable HTML, 44px actions, footer reachability, keyboard behavior, contrast scans and original content/source checks remain.

## Targeted commands and exact results

| Command                                                                                                                                                                                                                                                                                                              | Result                                                                                                                                                               |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pnpm exec vitest run src/app/components/CollectionShareModal.test.tsx src/app/components/ShareableCardModal.test.tsx                                                                                                                                                                                                 | 32 tests passed, 18.46 seconds; capability behavior, source fallback/lazy fetching, serialized actions, source/content policy and exact localized milestone mapping. |
| pnpm exec playwright test e2e/image-first-sharing.spec.ts e2e/sharing-curated.spec.ts e2e/sharing-refinement.spec.ts --project=desktop-chromium --project=mobile-webkit-smoke --project=desktop-firefox-smoke --grep 'image-first\|curated evening\|sharing footer stays concise\|sharing preview supports readable' | 14 passed, 2.4 minutes; real PNG signatures/downloads, approved image byte preservation in ZIP, readable HTML, sources, axe and footer/text-resize checks.           |
| pnpm exec playwright test e2e/image-first-sharing.spec.ts --project=desktop-chromium --project=mobile-webkit-smoke --project=desktop-firefox-smoke                                                                                                                                                                   | Final method-wrap correction: 6 passed, 1.5 minutes; Arabic/English, 200% method/footer fit and real milestone PNGs.                                                 |

An initial browser run caught three English test expectations using Latin zero while the existing export renderer intentionally displays Arabic-Indic digits. Expectations now match that existing display contract; raw count values and renderer policy are unchanged. No failed result is reported as a pass. The final full check, push-hook, exact-commit CI and production results are recorded in the consolidated output report after completion.

The original selection/mirroring regressions also passed: six cases in 1.6 minutes across desktop Chromium and phone WebKit, retaining right-aligned markers, invariant label geometry, 200% fit, mirrored columns and focus recovery. Command: pnpm exec playwright test e2e/sharing-refinement.spec.ts --project=desktop-chromium --project=mobile-webkit-smoke --grep 'sharing choice marks stay|sharing layout mirrors'.

The first complete gate passed all stages except the isolation-policy test: the revised milestone suite newly mocks the shared studio and therefore requires its own module registry. It is now listed in src/test/isolatedSuites.ts, as required. No test is excluded or assertion weakened. The complete gate is rerun on that finished snapshot.

## Visual evidence and recommendations

Actual exported Arabic milestone PNG and phone dialog were visually inspected; the image is the real measured canvas file, with no repetition badge. Broad/reflow browser evidence is preserved under output/image-first-sharing-*-evidence. [Full sharing recommendations](../reports/IMAGE_FIRST_SHARING_RECOMMENDATIONS_2026_10_17.md) explains hierarchy, visual continuity, formats, capability recovery and future measured-memory work.

## Remaining risks and next step

Physical destination-app compression and assistive-technology acceptance are pending. The existing D1 write-quota diagnosis is independent of local image generation; this phase adds no cloud upload or paid service. Preserve the exact image renderer and content policy while checking the largest collections on actual older devices before redesigning generation scheduling.
