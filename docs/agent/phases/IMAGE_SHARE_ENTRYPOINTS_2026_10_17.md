# Phase Report — Remaining image-share entry points

## Objective and bounded plan

The owner's global image-first request also covers two entry points found in the final audit: session completion still dispatched text immediately, and the ayah menu placed text sharing before image sharing. Complete these without changing session logic, canonical content, recorded metrics, native text sharing or the reviewed ayah renderer.

Plan: compose completion through the already-verified lazy image studio with its existing localized completion phrase and category link; keep the dominant Done action; put the existing ayah-image action before text sharing with stronger theme-token emphasis; retain copy/bookmark/text actions and focus recovery; test the two entry points, run intact release gates and verify exact-commit deployment. No new renderer, dependency, persistence or reviewed source text.

## Verification and evidence

The final combined output/SHARING_FINAL_RELEASE_REPORT.md records targeted tests, full gates, exact commits, CI/deployments and production smoke. This is a separate small commit following the shared studio changes. Existing Quran layout, source/translation policy and offline export contracts remain authoritative.

## Files and components

CompletionScreen and a focused sharing test; AyahInteractionSheet and its test; completion integration cases in image-first-sharing.spec.ts; the required isolated-suite registration; architecture/decision/index/recommendations documentation; release 2026-10-17.2 and its archive. Existing CollectionShareModal, native buttons and the ayah image studio are reused.

## Behavior and accessibility

Completion's Share button advertises a dialog and focuses itself before opening, so Safari pointer activation gives the modal a real focus-return target. The existing Done/Home action, session summary and completion transitions remain unchanged. The lazily loaded studio uses Square initially and the original localized completion phrase, with no new recorded metrics, citation or repetition count. The ayah-image action comes before text with semantic theme-token emphasis; canonical copy, bookmarks, native text sharing and existing preview/renderer behavior are unchanged. No new style utility or runtime dependency.

## Targeted results and findings

Ten targeted unit tests passed in 8.98 seconds, including exact completion phrases in both languages, retained close/Home behavior, no repetition/source fabrication, ayah-image ordering and mock-isolation policy. Six existing ayah image-export cases passed across Chromium, Firefox and WebKit, exercising complete portrait/square output and focus recovery.

The initial combined browser run had eight passes and four failures. Two Chromium comparisons sampled the guest seed before normalization persisted the complete empty category map; the regression now awaits the existing persistence boundary before comparing the unchanged map. Two WebKit cases exposed real missing opener focus after pointer activation; the opener explicitly focuses before opening. Both original assertions remain. The final completion matrix and full release results are recorded in the consolidated output report.

## Documentation and remaining risks

The full sharing recommendations and architecture/decision/index records include both entry points. Preserve manual destination-app/assistive-technology follow-ups and the independent D1 quota limitation. No religious source, stored progress, schema, paid service, renderer replacement or bundle ceiling changes are part of this correction.

Visual review found excessive lower whitespace on short summaries. An explicit summary-only contentAlignment option centers the measured panel while keeping the fixed brand/footer and all default devotional/evidence geometry unchanged. Completion and milestone compositions opt in; no new UI setting is exposed. Forty-seven focused renderer/studio/composition tests passed in 13.49 seconds, including unchanged text/footer and retained default alignment. Six corrected completion browser cases passed across all three engines in 1.4 minutes before this presentation-only refinement; final summary-image evidence follows.

Final summary browser matrix: 12 passed in 1.5 minutes across Chromium, Firefox and WebKit, covering Arabic/English milestone and completion PNGs, 200% method/footer fit, original axe assertions, exact unchanged completed-state comparison and opener focus restoration. Actual centered summary PNGs were inspected; original brand/footer/ornament remain. The six existing ayah portrait/square export cases also passed in the earlier combined run. Stable evidence is preserved in output/image-entrypoints-summary-evidence, with exact final gates and deployment results in the consolidated output report.
