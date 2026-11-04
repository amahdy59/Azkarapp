# Phase Report — Button family consistency and pending release

## Objective

Give Choose metrics the same neutral appearance as the view pills, define reusable button rules across the application, verify those rules on real screens and publish the complete pending owner-approved batch.

## Scope completed

Added a shared neutral pill action to Button/controlStyles and reused the existing choice-pill CSS. Choose metrics, Quran plan editing, Settings location review and Downloads navigation share it. The Progress filter uses the same paint/state recipe inside its already matched square frame. Progress metric-dialog Apply/Cancel/Reset and day-to-week navigation now use shared Button roles. Primary Apply remains distinct; Reset defaults is ghost. Long Settings labels wrap without overflow. No blanket button override or new dependency is added.

The earlier Glass/reader, audio Mushaf, intrinsic audio footer and homogeneous/aligned Progress work is preserved. The owner explicitly requested **push all changes**, superseding the local-only hold. Fresh release 2026-11-04.6 covers only the pending user-visible batch. Its offline archive preserves committed history and replaces only the never-deployed local draft; lossless recompression keeps the existing bundle limits.

## Files changed

- `src/app/components/ui/button.tsx`, `controlStyles.ts`, `pill-controls.css`: shared variant, default pill size, semantic metadata and neutral hover/press/wrapping rules.
- `src/app/components/ProgressDashboard.tsx`, `src/app/screens/ProgressScreen.tsx`, `progress-screen.css`: remove copied actions, reuse shared roles and keep matched header controls.
- `src/app/screens/QuranWirdScreen.tsx`, `settings/NotificationsPanel.tsx`, `settings/AccountDataPanel.tsx`: equivalent configuration/navigation actions use the same family.
- `e2e/button-family-consistency.spec.ts`, feature-test selector and selector regression: real cross-screen appearance, geometry and keyboard/state checks remain discoverable by Progress/Quran/Settings/controls feature commands.
- Architecture, design system, quality checklist, decision/index/phase records, Android handoff and the screenshot completion ledger document the agreement, implementation and limits.
- Release notes and offline release archive describe this pending release. Earlier pending files remain covered by their Glass/reader and audio Mushaf phase reports; no religious text, recording/timing, persistence schema or native-host change is introduced.

## Components added or modified

Button gains `variant="pill"`, defaulting to its 54px minimum pill size. The shared PILL_ACTION recipe supplies fill, border, radius and local interaction states. IconButton and Tabs retain native action/selection semantics; Progress composes their existing matched outer-frame layout. ProgressDashboard, QuranWirdScreen and the affected Settings panels use the shared variant.

## User-visible changes

Choose metrics uses the same neutral pill surface/edge/radius as the nearby view controls. Related Quran and Settings actions look consistent. Labels can wrap and increase height; action width stays bounded. Dialog confirmation roles are clearer: primary Apply, neutral Cancel and ghost Reset defaults. Existing actions, counts, settings, navigation and stored state remain unchanged.

## Accessibility work

Preserved native buttons, accessible names, full labels, visible focus, dialog semantics and actual keyboard/Escape focus recovery. Empty metric selection disables Apply. Pill actions retain at least 54px height and ordinary targets remain at least 44px. Decorative action glyphs cannot shrink and scale with rem where appropriate. Tested narrow/200% text, RTL/LTR, light solid/dark Glass, Forced Colors and both app/OS reduced motion. Hover preserves text ink, opacity and frame geometry. Automated checks and screenshots do not establish complete WCAG or physical-device compliance.

## Tests added or updated

The new browser spec uses actual Progress, Quran and Settings routes. It compares fill/edge/radius, target size, label overflow and center hit-testing; exercises keyboard entry, empty-selection disabled state, Cancel/Escape recovery, plan modal recovery and Forced Colors; and checks stationary hover with both motion preferences. Feature selector tests keep the new shared regression in each owning screen's focused test command. Existing domain tests still verify state and behavior.

The first diagnostics identified a missing plan-action migration, a test that expected a rem icon to remain 20px after 200% text enlargement, a Firefox Settings-label overflow, tests closing a modal before its autofocus settled and a last-control Tab sequence that handed focus to Firefox browser chrome. The actual migration and shared text wrapping are fixed. Tests now check the intended scaled icon size, real dialog focus before dismissal and keyboard entry from the preceding control, retaining the same focus/containment assertions and original timeouts. Diagnostic logs/traces remain under the earlier button-family output prefixes.

## Commands run

| Command                                                               | Result / evidence                                                                                                                                          |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Settled affected-screen and feature-selector units                    | Exit 0; 51 tests passed in 13.88s. `output/button-family-settled-units.log`.                                                                               |
| Initial Chromium cross-screen correction                              | Exit 0; 4 cases passed in 42.9s. `output/button-family-fixed-browser.log`.                                                                                 |
| Final three-engine family matrix                                      | Exit 0; 15 passed in 2.8m. `output/button-release-family-browser.log`. All original assertions/timeouts retained.                                          |
| Frozen install                                                        | Exit 0; existing lockfile unchanged, pnpm 11.19.0. `output/button-release-install.log`.                                                                    |
| `pnpm audit:prod`                                                     | Exit 0; no known production vulnerabilities. `output/button-release-audit.log`.                                                                            |
| `pnpm check:release-notes`                                            | Exit 0; fresh bilingual manifest/archive validated.                                                                                                        |
| Final inventory, complete quality, hook browser smoke and Pages build | Required before push; exact outputs are retained under `output/button-release-*` and the tracked pre-push hook. Do not treat this row as a completed gate. |

## Visual/manual evidence

The final cross-screen screenshots are in `output/playwright/button-release-family`; prior diagnostic and corrected captures remain separate. Inspect Progress Choose metrics, Quran plan Edit and Settings location review in Arabic/English and normal/enlarged sizes. Gold rings in keyboard-focused captures indicate focus, not selection. The preceding [comment completion ledger](COMMENT_COMPLETION_2026_11_04.md) retains current-word/Focus, footer, header/control-frame and dark-paper comparisons with screenshot source provenance.

## Documentation updated

The design system now has a role/primitive/geometry/state matrix and a concrete audit/migration list. Primary, secondary pill, confirmation, icon, view-choice, row/card, reading/transport and menu/native/date/link roles remain intentional. Shared hover/focus/disabled/motion rules apply across those families without replacing domain-specific geometry. The quality checklist names actual browser/unit checks and screenshot review. Architecture, decisions, phase/index and Android handoff record boundaries and release authority.

## Decisions recorded

The user authorized the shared button-family work and subsequently publishing all pending changes. This supersedes earlier local-only holds. Run intact hooks, push main without force, inspect all failed workflow jobs and verify exact-commit Quality/Pages and the production application.

## Known limitations or remaining risks

The audit covers shared primitives and representative real product journeys; it does not claim every legacy literal class or every hardware/AT state was exhaustively reviewed. Physical Android notification delivery, haptics, WebView material/word paint, native upgrade safety, TalkBack/VoiceOver and owner aesthetic acceptance remain separate. Release gating must not claim those are established by desktop automation.

## Out-of-scope findings

No runtime dependencies, religious-content interpretation, native signing/version, persistence migration or router/state-system replacement. Existing Home/continuation design proposals require separate scope.

## Recommended next step

Complete the authorized main release through exact-commit Quality and Pages, then review the updated browser/Android application on the owner's target device using the handoff checklist.

The settled family matrix passes 15/15 across Chromium, Firefox and WebKit. The real Progress-header matrix also passed every case in the preceding family run (its two failed diagnostics were confined to the corrected family fixtures/wrapping). Final neutral appearance captures without keyboard focus are in `output/comment-completion-evidence/button-family/progress-neutral-pills.png` and `choose-metrics-neutral.png`; they were visually inspected. The 51 affected units and production audit pass. Final quality and push-hook results are recorded in the release evidence logs before publication.
