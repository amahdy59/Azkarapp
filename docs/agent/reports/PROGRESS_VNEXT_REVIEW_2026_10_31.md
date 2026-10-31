# Phase Report — Progress vNext recommendation review, 2026-10-31

## Objective

Review the latest application changes against the supplied `Codex_Progress_Plan.md` and ten concept images, assess the recommendations, and prepare a bounded implementation plan.

The attachment is reference material to assess, not independent authorization to replace repository contracts or run its embedded master instruction. The owner's request and repository authority remain controlling. The owner explicitly confirmed in this chat: **keep the existing four metrics** (prayers, routines, Quran pages and Quran-goal days).

## Scope completed

Inspected local `main` at `e5c2ffc802885b52380a3c4bd0c1fd6699f959bb`, recent changes, Progress source/tests, relevant architecture/design/quality/content/motion contracts, current phase notes, and the exact-commit Quality failure logs.

**Assessment: the recommendations are broadly sound, with the adjustments below. A wholesale rebuild would repeat existing work and introduce unnecessary risk.**

| Recommendation                                      | Current evidence                                                                                                                                                                                                       | Assessment                                                                                                                                                                                                                           |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Overview / Trends / Records with one selected range | Already implemented in `ProgressScreen` and `ProgressDashboard`; card-to-trend navigation, shared date picker, reversible drafts and topic disclosures exist.                                                          | Preserve and refine; do not rebuild.                                                                                                                                                                                                 |
| Four clear, independent overview metrics            | Existing cards have independent counts, known denominators, icons and denominator-only bars.                                                                                                                           | Keep all four defaults as the owner confirmed. Improve hierarchy and explanations using current tokens.                                                                                                                              |
| Accurate missing/unknown/zero states                | Historical Quran goals remain unknown without saved evidence; out-of-window cells are null; records are sparse. Indexed daily facts also contain derived zero values.                                                  | Valid priority, but a derived zero alone cannot establish an explicitly saved zero for that practice. Audit source provenance before adding the proposed display-state mapping.                                                      |
| Rate comparisons in percentage points               | Current matched-period panel says more/fewer recorded and shows counts. Fixed-opportunity metrics have equal denominators over the matched days. Quran-goal comparison requires equal nonzero known-goal denominators. | Useful enhancement, not evidence of a current misleading percent-increase calculation. Show both rates and percentage-point difference for supported ratios; keep page counts in pages and retain sample/goal restrictions.          |
| Compact sparse-data charts                          | Existing chart uses fixed rate/count baselines, shorter flat plots, one-point explanation, RTL coordinates, pointer/physical-key selection and a slider.                                                               | Refine density without removing working input alternatives or inventing observations.                                                                                                                                                |
| Exact chart-data alternative                        | `RecordingTimeline` supplies SVG descriptions and a selected-point readout, but no native table of its plotted buckets. Records is a separate daily table with a different scope and aggregation.                      | Strong first addition: optional exact bucket table with dates, recorded values, denominator and availability.                                                                                                                        |
| Neutral empty states and useful actions             | Overview already has an empty-period message and Home/Quran actions; one-day Trends offers a Week action.                                                                                                              | Improve no-history versus empty-period wording and state distinctions; preserve target-only facts. Avoid repeating long explanations on every view.                                                                                  |
| Seven-day recording pattern                         | Existing detailed Progress context already has historical/reflection presentations. A new compact strip would need an explicit presence definition.                                                                    | Optional later enhancement. Saved activity / No record / Unavailable or future; no red failure crosses or implied missed worship. Do not infer prayer attendance from other activity.                                                |
| Sortable, paginated records and scoped JSON export  | Already present; native table headers, sorting, ten-row pages, named keyboard-scroll region, full-scope JSON and save/error feedback.                                                                                  | Improve narrow layouts and explicit unavailable labels. Preserve the single date scope and existing export. No second date search or unimplemented export formats.                                                                   |
| Accessibility controls and pass checklist           | The app already owns accessibility preferences; mockups present broad checkmarks as if compliance were established.                                                                                                    | Reuse existing Settings. Keep chart alternatives available. Do not add a duplicate preference screen or blanket accessibility certification.                                                                                         |
| Warm gold/cream visual treatment                    | The reference is one light-mode direction; the product has approved theme/material, typography and responsive shell contracts. Images also change primary navigation and disagree on tab labels/order.                 | Translate hierarchy, spacing and restrained accents into existing tokens. Preserve app navigation, theme choice, canonical type roles, sticky frost and protected dropdowns. Do not copy image text, dates or sample values as data. |

### Numerical and date contracts to retain

- Prayer uses civil days; routines/Quran use the configured devotional boundary. Current-day Overview and complete-day analytical scopes remain distinct.
- Fixed practice denominators use all applicable elapsed dates in the selected scope, including dates without saved activity. A zero recording rate is not evidence of missed worship. Do not globally turn every absent date into a chart gap: unknown opportunity/goal data and absent saved activity have different meanings.
- Quran pages are deduplicated within each day. Current goals never become retroactive historical goals. Explicit manual completions retain their existing meaning.
- Rate axes stay at 0–100%; page-count axes start at zero. Preserve unavailable-data line breaks and ascending source/export chronology, with Arabic plotted right to left.
- The concept's change from 49% to 61% is **12 percentage points**; calling that a 12% relative increase would be incorrect. The current app's count-change labels do not make that claim.
- Existing normalized daily facts are sufficient for totals and plotted bucket tables, but do not provide per-practice provenance for every zero. No persistence migration or new historical inference is justified by these references.

## Files changed

Only this review report was added by this chat. No production source, tests, religious content, release notes, deployment configuration or saved data was changed.

The shared working tree was actively changing during inspection. Observed existing edits included `e2e/progress-trends.spec.ts`, `src/app/components/ProgressRangeToolbar.tsx` and `src/styles/theme/layout.css`. These edits were preserved and are not claimed as this chat's work.

## Components added or modified

None. Existing reusable components identified: `TabList`, `ProgressRangeToolbar`, `ProgressSelectField`, `ProgressBar`, `RecordingTimeline`, `ProgressRecordsTable`, and the shared responsive sheet/dialog primitives.

## User-visible changes

None yet. The default-metric decision is recorded here for subsequent implementation.

## Accessibility work

Source review identified the missing exact plotted-bucket table and the need to retain keyboard/slider readouts, 44px actions, non-color status, semantic tables, bidi isolation and theme/reflow fallbacks. This review does not certify accessibility or replace human assistive-technology testing.

## Tests added or updated

None: this is the baseline/recommendation review. Existing targeted tests were executed without changing their assertions.

## Commands run

| Command                                                                                                                                                                                                         | Result                                                                                                                             |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `node --version`                                                                                                                                                                                                | `v24.15.0`                                                                                                                         |
| `pnpm --version`                                                                                                                                                                                                | `11.19.0`                                                                                                                          |
| `git status --short`, `git diff`, `git log`, `git show -1 --stat`, `git branch --show-current`, `git rev-parse HEAD`                                                                                            | Inspected `main` at `e5c2ffc8`; concurrent edits observed and preserved.                                                           |
| `gh run list --limit 6 --json workflowName,status,conclusion,headSha,url`                                                                                                                                       | Latest local-HEAD Quality run failed; its Pages workflow was skipped. Other listed runs had other commit identities.               |
| `gh run view 41209706749 --json jobs` and `gh run view 41209706749 --log-failed` with focused output filters                                                                                                    | Non-browser checks and Android passed. Three browser jobs failed the same English 320px Progress case; `verify` failed.            |
| `pnpm test:run src/app/progressDashboard.test.ts src/app/progressTrend.test.ts src/app/progressInsights.test.ts src/app/components/ProgressDashboard.test.tsx src/app/components/ProgressRecordsTable.test.tsx` | Exit 0; **5 files, 39 tests passed**, 14.50s.                                                                                      |
| `pnpm test:run src/app/components/RecordingTimeline.test.tsx`                                                                                                                                                   | Exit 0; **1 file, 7 tests passed**, 7.65s.                                                                                         |
| `pnpm exec prettier --check docs/agent/reports/PROGRESS_VNEXT_REVIEW_2026_10_31.md`                                                                                                                             | Initial check reported formatting warnings. The report was formatted with the scoped `--write` command and rechecked successfully. |

Full `pnpm check`, browser tests, build/Pages/audit and release gates were not rerun by this chat. No application code was changed; the shared toolbar/browser baseline was under active repair. Existing focused unit success is not a claim that the browser baseline or release is green.

## Visual/manual evidence

Reviewed all ten supplied concept images visible in the conversation. These are illustrative samples, not actual app screenshots or responsive/contrast acceptance evidence. No new application screenshots were captured against the moving shared baseline. Fresh before/after captures belong to the implementation phase after its baseline is stable.

## Documentation updated

This report records the recommendation assessment, approved metric choice, current failure and proposed file-level scope. No product contract or historical decision was overwritten.

## Decisions recorded

- Keep the four existing default metrics, as explicitly selected by the owner in this chat.
- Treat the references as an evolution of the existing page, preserving analytical meaning, the primary shell and current theme/material system.
- No authority to override the repository's existing production hold is inferred from an attachment.

## Known limitations or remaining risks

The pre-existing failure is directly relevant to this redesign. [Quality run 41209706749](https://github.com/amahdy59/Azkarapp/actions/runs/41209706749) failed `@cross-browser en insight controls, contrast and sticky focus at 320px` in Chromium, Firefox and WebKit. Logs show timeout while the helper attempts to click the range disclosure summary. This establishes an interaction failure, not its complete root cause. A locally changing toolbar layout is not yet proof of remediation. [Pages run 41212052568](https://github.com/amahdy59/Azkarapp/actions/runs/41212052568) was skipped for the same commit.

`AGENTS.md` section 12 requires a decision when tests expose a pre-existing failure that makes the phase result ambiguous. Source implementation is therefore paused at the baseline decision, preserving the concurrent repair. No commit, push or deployment was performed.

## Out-of-scope findings

The latest commit repairs audio/image ZIP archive bounds and narrow navigation, not a new Progress redesign. Neither this source review nor the unit tests establishes that the latest local code is deployed or that every unrelated latest change is correct. Native/device and production smoke acceptance were not performed.

## Recommended next step

Resolve ownership of the active Progress baseline repair first. If it belongs to another chat, retain its source ownership and wait for its verified baseline; if this chat is to own it, reproduce and repair the exact failing case before redesigning. Keep existing tests, timeouts and thresholds intact.

After the baseline is stable, use separate bounded phases:

1. **Trustworthy trend presentation.** `progressDashboard.ts` only if a reusable pure comparison selector is needed; `ProgressDashboard.tsx`, `RecordingTimeline.tsx`, paired i18n files and their unit/browser tests. Add the exact bucket table, supported rate/percentage-point presentation with explicit denominators, and truthful sparse/unavailable wording. Keep current data, match requirements, page-count units and slider. Verify source-to-table/export agreement and both languages before broader visual edits.
2. **Overview and empty-state hierarchy.** `ProgressDashboard.tsx`, `ProgressScreen.tsx` only for existing navigation/source-context props, `progress-screen.css`, paired copy and scoped tests. Preserve four cards and customization; refine values, units, source-specific empty/target states and one main action. Add a compact presence strip or factual insight only if it answers a distinct question without repeating detailed context. Review actual phone/desktop captures before moving on.
3. **Records readability.** `ProgressRecordsTable.tsx`, narrowly scoped CSS/i18n and tests. Keep native sorting/pagination and the shared date picker. Improve 320px/200% access and unavailable-value explanation, retain complete JSON export and recovery. Add day cards only if testing shows a concrete benefit over the accessible scrolling table.
4. **Cross-browser visual acceptance.** Capture Arabic/English at 320/390/768/1024/1440px, ordinary/enlarged text, Glass/solid/light/dark, reduced motion/transparency and high/forced contrast. Test real focus, hit targets, protected menus and chronological keys. Run the repository's required unchanged quality gates; distinguish automated results from pending physical-device/screen-reader checks.

Do not combine these into an uncontrolled rewrite, add runtime dependencies, change reviewed devotional text, infer historical practices, or introduce new export formats.
