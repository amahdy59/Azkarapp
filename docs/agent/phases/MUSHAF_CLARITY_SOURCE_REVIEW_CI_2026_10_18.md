# Phase Report — Mushaf clarity, source comparison and release feedback

## Objective

Resolve the owner's Glass-mode Mushaf overlap, explain the effective reading material, finish the remaining source comparison and balance CI using recorded timings. No content expansion.

## Scope completed

Plan recorded before editing: three bounded scopes, committed separately: source evidence; duration-based CI scheduling; Mushaf overlay and appearance clarity. Preserve existing religious content, state schema, browser projects and assertions. Reuse previous evidence where inputs match; run affected regressions and mandatory release gates.

The word popover uses tooltip semantics and was excluded from the shared protected overlays. Include its class explicitly without changing its tooltip/dialog semantics. Cross-engine geometry assertions additionally exposed a Firefox anchor/containing-block issue: portal the gloss to the body and measure viewport placement once per opening, preserving the selected page theme. This also places the blur outside nested reading backdrop roots. Apply the same protection to the floating color-shortcut feedback, the other Mushaf surface found with the same translucent-token risk. Keep inline Progress help in normal document flow.

## Files changed

- `docs/agent/evidence/collection-independent-review-2026-10-18.json` and content-authoring guidance: all 20 pending original identities reviewed afresh, with source URLs, wording/context/count comparisons and input fingerprints.
- `scripts/browser-partitions.mjs`, timing baseline, scheduler/tests, inventory verifier; Quality workflow and shared setup action.
- Shared `materials.css`; MushafMaterialHint, QuickMenu, SettingsSheet, both Mushaf readers; Arabic/English i18n; focused browser regressions; release notes/archive.

## Components added or modified

MushafMaterialHint is presentation only. Its visibility follows the same resolved-material CSS selector as the page, including system/high-contrast precedence, without reading storage or duplicating application state. Quick/full settings identify Page color separately from Glass material and direct readers to Settings → Appearance. Both shortcut feedback surfaces identify active Glass material.

## User-visible changes

Word explanations use a protected opaque navy tint with 28px/135% frost; shortcut feedback uses the established 80% tint and the same frost. Visual inspection rejected the 80% tooltip capture because sharp verse shapes still competed through it; the stronger tooltip fill protects readability independently of nested blur compositing. Page-color controls explicitly identify active Glass material and explain how to change it. No reviewed religious wording, translations, benefits, counts, persistence or audio behavior changes.

## Accessibility work

Preserve tooltip/dialog semantics, Escape dismissal, word anchor, native control order, 44px targets, focus styling and opaque/high-contrast fallbacks. Bilingual narrow-screen browser assertions cover material clarity and active-mode explanation. Automated axe evidence does not replace physical-device or human assistive-technology acceptance.

## Tests added or updated

Scheduler tests cover deterministic duration balancing, intact file grouping (including serial suites), new tests/files, project eligibility, missing identities and empty inventories. The inventory gate compares actual Playwright selections to the full inventory; the merged CI report is independently compared again. All original 2,098 cases remain; new Mushaf regressions are additive.

## Commands run

Initial focused Vitest run: 5 files, 26 tests passed. Initial inventory: 2,098 cases, exactly once. An initial new browser test used the wrong translation namespace; corrected the locator to the existing `mushaf.continueReading` key. Targeted viewport-placement/clarity run: 9/9 cases passed across Chromium, Firefox and WebKit (53.4s), including the three existing word-meaning cases. Final opaque-gloss and release results follow in the local evidence report. Inventory: 2,104 selected exactly once, including every original 2,098 identity and six added cases. Preliminary pnpm check passed all stages except the initial-route growth baseline: 174,833 bytes gzip versus recorded 171,382; the last released local Pages build measured 174,707, so this change adds 126 bytes. Record the deliberate current initial-route size in bundle-baseline.json; all hard ceilings, tolerances and other metrics remain unchanged. Final release and deployment results are recorded in `output/MUSHAF_CLARITY_RELEASE_REPORT.md` after execution.

## Visual/manual evidence

New browser captures reproduce page 4 at 390px with Arabic/English gloss and appearance settings. Inspect emitted `mushaf-glass-gloss-*.png` and `mushaf-glass-colors-*.png` captures. Physical phone compositing remains a manual acceptance item.

## Documentation updated

This report, content-authoring/source evidence, CI scheduling contract, design-system overlay contract, decision log and phase index.

## Decisions recorded

Glass is a surface material, separate from the saved page color. Do not add a misleading fifth color radio that changes an unrelated global preference. Follow the existing protected-overlay contract and preserve all fallback selectors. CI uses longest-duration-first file assignment within the same engine partitions; three CI workers and all existing projects/retries/assertions remain unchanged.

## Known limitations or remaining risks

Source comparison is complete for 20/20 identities; this is not independent scholarly sign-off. The owner requested checking Dorar and preserving sources already shown within cards. That follow-up supports 12 source-attributed entries; eight identities have concrete citation, narrator, wording-route or grade-strength mismatches (including two versions of the same morning/evening report). The initial 19-unresolved classification was overbroad and is superseded. There is no blanket hold for a documented grading disagreement. Preserve original content while presenting the specific corrections for review. The prior Home alternatives never authenticate the original collection claims.

The timing baseline records successful run 39146690337 at e84435b0: 2,098 cases, 295 project/files, no failed/skipped/flaky cases. Aggregate duration estimates are not promised elapsed-time reductions; compare the new complete CI run before claiming speed gains. New files use the project mean per-test cost; stale baseline files cannot add tests.

## Out-of-scope findings

Ibn Majah 299 does not contain pur-ref-2's dua; the matching Nasai route and chain concerns are documented for review. Hisn numbering differs across editions (the local pur-ref-6 number 10 is not Sunnah.com's number 10). The original clothing citation 4023 is correct; Home's 4020 alternative is a different supplication. These are evidence findings, not permission to rewrite reviewed content.

## Recommended next step

Resolve the eight concrete content mismatches through the content-review process, retaining supported attributed scholarly views; inspect the repaired gloss on a physical phone in Glass mode.

Final Firefox inspection also found competing verse shapes through the Mushaf quick/full settings panels. These two named reading overlays share the opaque navy text-protection ground with the gloss, retaining the existing sheen/frost; other application overlays retain the approved 80% tint. Both panels now have explicit cross-engine background assertions.

## Owner follow-up: Home width parity

Expand Home to Library's max-w-7xl frame and px-page gutters, removing the narrower 52rem cap and secondary 4px horizontal inset. Existing contextual columns, prayer disclosure, compact/mobile browsing and container-driven lower grids remain. HomeScreen and home-wird.css are modified; existing Home alignment, prayer disclosure and browse gutter tests gain direct Library geometry coverage. No new component or content/state change. Quality run 39157862563 was cancelled because this newly requested change supersedes cd1d612d. Targeted results and final release gates are recorded in output/MUSHAF_CLARITY_RELEASE_REPORT.md.

The widened companion exposed an existing intrinsic-width shrink on DailyEvidenceCard; add w-full to that card so it fills its grid column. Existing Home alignment tests assert its rendered width as well as outer frame parity. Library geometry comparisons cover Arabic/English at 390, 600, 820, 1024, 1440 and 1920 CSS pixels across Chromium, Firefox and WebKit without adding or removing browser inventory identities. Existing compact-prayer tests retain all disclosure/tracking assertions with the new zero additional horizontal inset.

Exact-commit CI exposed older geometry expectations in three additional browser specs: a 52rem/832px prayer cap and an 8px content inset, both superseded by the owner's width-parity request. Update compact-prayer, counter-feedback and prayer-glass-hierarchy to assert exact shared grid width/position. Preserve every accessibility, overflow, keyboard, prayer and enlarged-text assertion; no inventory identities or coverage thresholds change. This follow-up changes tests/docs only and keeps release .9's application notes. Local targeted reproduction and the replacement full CI results are recorded in the evidence report.

The widened row also exposes real geometry defects beyond obsolete tests: keep at least 8px below prayer times and align icons to the top inset, preserving existing assertions. Normalize subpixel-only clipping below 0.01 CSS px in the selection-light calculation so a fully visible Firefox card has full opacity, while partially visible cards still fade. Add a focused hook regression. Wait for document fonts before prayer-actions geometry assertions; all alignment assertions remain exact. Release .10 describes this application remediation together with the still-undeployed .9 outcomes. No religious text/state or browser inventory identities change.
