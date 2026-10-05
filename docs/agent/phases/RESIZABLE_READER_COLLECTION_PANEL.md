# Phase Report — Resizable Reader collection panel

## Objective

Apply the owner-approved familiar sidebar toggle and resizing behavior to the zikr-group navigator. Verify locally and do not commit, push or deploy.

## Scope completed

The same panel icon appears beside the panel boundary in the Reader toolbar and in the panel's own collapse control. The icon mirrors to represent the physical panel side. Dragging and keyboard resizing preserve the preferred width across collapse/reopen. Initial width is 336px; minimum 288px; maximum is the smallest of 480px, 40% of the measured Reader workspace, or the remaining width after reserving 480px for reading and a 12px divider gutter. Only a wide viewport with sufficient measured workspace docks both panes. Tablets, phones and insufficient workspaces use the existing modal SidePanel with focus containment and Escape recovery. Phone access uses the existing overflow menu to avoid crowding the header.

## Files changed

ReaderScreen.tsx and its CSS/audio integration tests; CollectionPanelResizeHandle.tsx and tests; useCollectionPanelSize.ts and tests; keyboardShortcuts.ts and tests; ResponsiveSheet.tsx; ui/dropdown-menu.tsx; Arabic/English i18n; reader-collection-panel.spec.ts; design-system/decision/index additions, screenshots and this report. Concurrent collection-scene and prayer-companion work is outside this phase and is preserved.

## Components added or modified

A reusable presentation-only splitter, a visit-local measured-size hook, and Reader integration using the existing SidePanel. SidePanel exposes Radix's close-focus lifecycle; the existing dropdown trigger now forwards its reference so phone drawer dismissal can restore focus to the menu button. No runtime dependency or persisted/synchronized field added.

## User-visible changes

Following the owner's screenshot review, the Reader toolbar toggle is hidden while the docked panel is open. Its header button collapses the panel; the toolbar button then appears to reopen it. Focus transfers after React commits each transition, preventing focus on a hidden control. Both directions are covered by unit and browser assertions.

A stable edge-adjacent toggle, mirrored panel glyph, resize grip, pointer drag, keyboard arrows (16px, Shift 32px), Home/End limits, Enter/Escape collapse, and double-click default reset. Hidden docked content stays mounted to preserve list state and scrolling. Expanded previews are controlled by stable zikr identity so they survive drawer transitions. Opening brings the selected zikr into view. Drawer selection closes the drawer and continues reading the selected entry. Supporting toolbar actions wrap instead of shrinking targets or changing sacred text.

## Accessibility work

Focusable vertical separator with localized name, current/min/max width, announced width, visible focus and 44px-wide pointer area. Resize keys are isolated from Reader counting/navigation. Existing drawer semantics, focus containment and dismissal are reused. Toggle retains expanded/controls semantics; close restores toggle focus. Automated scans supplement manual assistive-technology checks. No complete WCAG compliance claim.

## Tests added or updated

Workspace bounds and minimum reading space; physical RTL/LTR key movement; Home/End limits, collapse/reset and width semantics; existing audio/selection behavior; real pointer drag, reopen restoration, independent Reader index, axe, tablet/phone drawer dismissal and controls. Existing fixed-width assertion now checks the owner-approved default and measured maximum.

## Commands run

| Command                                  | Result                                                                                                                            |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Targeted unit suite                      | 4 files, 23 tests passed; initial integration fixtures updated to supply actual workspace geometry instead of jsdom's zero bounds |
| Targeted lint/typecheck                  | Development runs completed; final quality gate results below                                                                      |
| Reader collection/guidance browser specs | 12 passed across Chromium, Firefox and WebKit, Arabic/English, including 200% text; output/sidebar-accepted-browser.log           |
| DownloadsPanel diagnostic                | 6 unchanged tests passed in isolation after the first parallel gate hit loading-state timeouts                                    |
| pnpm check:serial                        | Passed all 11 stages in 149.6s; output/sidebar-accepted-check.log                                                                 |

The initial browser invocation found another session's server at 4173. Final verification uses E2E_PORT=4192 and leaves that server untouched. Browser verification exposed a real phone focus-recovery defect, repaired through the dialog close lifecycle and forwarded trigger reference. The first parallel quality gate had six unchanged DownloadsPanel loading-state timeouts while browser verification was running; all six passed in isolation. The complete gate is repeated serially without browser contention. Focusable separator semantics use a documented local lint exception because the static role classifier does not recognize the WAI-ARIA interactive splitter pattern; browser accessibility assertions remain enforced.

## Visual/manual evidence

The single-control refinement passes the 16-test Reader unit suite (output/sidebar-single-toggle-unit.log). Core navigation, settings, legal and offline smoke coverage passes all 26 tests (output/sidebar-core-browser.log). Chromium and Firefox pass all eight affected browser cases. The concurrent matrix passed 11 of 12; its English WebKit layout case exceeded the unchanged 90-second overall timeout, then an isolated attempt timed out at a different point while other agents' quality/browser runners were active. After contention subsided, all four unchanged WebKit cases passed in 3.2 minutes (output/sidebar-final-webkit.log). No assertions, coverage thresholds or timeouts were weakened. The final complete pnpm check:serial passed all 11 stages in 659.8 seconds (output/sidebar-single-toggle-check.log), including coverage, production build, types, lint, format, content/audio checks and bundle/CSS budgets. No commit, push or deployment was performed.

Desktop Arabic/English and phone drawer screenshots are saved in docs/agent/evidence/resizable-reader-collection-panel/. Arabic desktop and phone screenshots were visually inspected: controls, sacred text, panel borders and the resize grip have clear separation. Keyboard focus recovery, resizing and reduced-motion behavior were exercised by browser tests. Physical-device and screen-reader review remains a human follow-up.

## Documentation updated

Design-system width/interaction contract, owner decision, agent index and this report. Release notes are unchanged because no push or deployment is authorized.

## Decisions recorded

Owner agrees to the recommendations and explicitly requests a familiar Codex/Antigravity-style collapsible, resizable panel. Owner explicitly instructs not to push changes yet.

## Known limitations or remaining risks

Width is visit-local; no cross-device persistence or synchronization. Native phone drawer is not resizable. Real screen-reader/device review remains pending. Other simultaneous workspace edits are retained and may appear in the shared full quality snapshot.

## Out-of-scope findings

Concurrent Reader header scene work is not part of this phase. No content, progress, prayer-time, audio-manifest or deployment behavior is changed.

## Recommended next step

Review the local screenshots and interactions; only publish when the owner subsequently authorizes release.
