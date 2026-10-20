# Mobile sharing, compact filters and listening protection — 2026-10-20

## Objective and authority

The owner approves all recommendations from the screenshot review and explicitly requests implementation and publication. This supersedes earlier local-only publication holds for this work. Preserve the already committed integration repair at 6a51209e and include it in the verified release.

## Inspection and plan before editing

1. Reuse CollectionShareModal, the Ayah studio host and existing modal/step primitives. Fill the mobile viewport with stable sharing chrome, safe-area clearance and native short/enlarged-window recovery. Increase the ordinary preview without obscuring controls.
2. Add a distinct This zikr / Entire collection content choice to individual Reader sharing using its actual mode/prayer-filtered collection. Preserve design/language choices, cancel obsolete generation and keep card-export scope distinct from content scope.
3. Refine measured generated-card hierarchy and short-passage balance, with stable reading sizes, complete text, repeatable headings/citations and quiet numbered footers. Do not modify reviewed content or supplied artwork.
4. Reuse one native responsive filter disclosure for Progress and Library. Phones start compact with visible selected context. Completed preset/category choices collapse; search typing and Custom drafts stay open. Preserve selections, clear actions, native keyboard/focus and portalled dropdown protection.
5. Keep the two-second listening unlock and Escape recovery. Add actual hold progress, cancellation on release/pointer loss/blur/background and protection against internal route changes. Explain optional Android App pinning/iOS Guided Access honestly; do not simulate OS confinement or trap browser history.
6. Add meaningful unit/browser regressions, inspect screenshots across directions/viewport sizes/enlarged text, run affected feature suites and all required local release gates. Rewrite/archive newest-only bilingual notes, commit/push through intact hooks, monitor exact-commit Quality and Pages and smoke-test production.

## Acceptance limits

Browser automation does not establish physical-device touch, TalkBack/VoiceOver or OS pinning acceptance. Device navigation remains controlled by the operating system. No runtime dependency, storage schema, prayer calculation, audio timing/queue ownership or religious wording change is planned.

## Implementation and verification evidence

- CollectionShareModal/Reader and the Ayah studio host retain the existing export boundaries. Full-screen compact chrome, larger previews, separate content scope and measured short-card balance are implemented without replacing artwork or editing reviewed wording.
- ResponsiveFilters is shared by Library and Progress. Native disclosures preserve applied context and input values; portalled Select focus returns to the summary after automatic collapse. Custom drafts stay open through calendar changes.
- AudioControlLock shows factual hold progress and acquires a transient routing/surface guard. The new hash regression exposed and repaired AudioPlayerSurface's separate navigation-collapse listener. Official pinning guidance is optional Audio options content.
- Targeted unit selection: eight files, 114 passed; the additional mobile Custom/calendar/cancel regression then passed with the complete six-case ProgressRangeToolbar file. Full final coverage remains part of the unchanged release gate.
- Corrected sharing/filter/header matrix: 24 passed across Chromium, Firefox and mobile WebKit in 6.3 minutes. Earlier lock matrix: all six Arabic/English engine cases passed, including the internal hash attempt, half-hold progress, cancellation and Escape. Initial CSS positioning and obsolete test geometry/selector failures were diagnosed and retained in local reports; assertions were updated to the approved full-screen/scroll contract, not removed to hide failures. WebKit full-screen height uses subpixel precision for its 1/64px dvh quantization.
- Frozen install and pinned-toolchain verification passed. Production audit found no known vulnerabilities. The complete browser inventory proved 2,401 cases distributed exactly once across nine CI shards.
- Screenshots and failure traces: output/playwright/mobile-refinements and output/playwright/mobile-refinements-corrected. Corrected machine-readable report: output/mobile-refinements-corrected-browser.json. Wider integration evidence is saved separately under output/playwright/mobile-refinements-integration.
- Final release report, exact gate/CI results and production smoke evidence are retained in output/mobile-sharing-filters-lock-release-2026-10-20. The full report follows the repository PHASE_REPORT template. Publication is complete only after exact-commit Quality, Pages build/deploy and production checks succeed.

## Responsive CI fixture follow-up

The first published candidate cf87c598 passed CI quality and Android but its phone/tablet shard exposed nine outdated fixture expectations: the hidden range fields were counted before expansion, Library filters were assumed always open, and the title spacing check still measured the hidden search form. An immediate isVisible check also raced tablet route loading. Keep the six-control inventory assertion and original spacing/target/tab assertions; open disclosures explicitly, measure the visible filter boundary and await the mounted input before interaction. The correction changes tests and this report only. All 15 affected cases then passed locally across desktop, phone and tablet Chromium in 54.5 seconds. Existing assertions, inventory, timeouts and coverage remain intact; the full exact-commit CI gate is still required.

The desktop CI partition also identified the same visible-control inventory expectation in optional patterns/clarity fixtures and a search geometry fixture that resized from wide to compact without reopening search. These fixtures now explicitly expose the controls before asserting their unchanged inventory/bounds. No runtime change or fresh user-visible release note is needed for this tests/documentation-only remediation.

The remaining inspected partition logs identified equivalent legacy entry points in completion sharing, Glass search and large-text period selection. Completion now asserts the owner-approved zero-inset full-screen bounds while retaining its unchanged-progress/PNG/focus/axe checks; search and period fixtures explicitly open the native disclosure. Corrected local evidence totals 68 passing cases: 15 desktop/phone/tablet responsive cases (54.5s), 31 optional-pattern/clarity cases across three engines (4.4m), and 22 completion/search/Glass/large-text cases (2.8m). Reports use the mobile-refinements-*-remediation names under output. No test, assertion, timeout, coverage threshold or inventory entry was removed.

## Recommended follow-up

Physical phone safe-area, touch, screen-reader and device-pinning acceptance. Keep those separate from automated browser evidence.
