# Remembered reading, footer preview and feedback polish — 2026-10-20

## Objective and authority

Owner approves all three follow-up recommendations: remember English main meaning on this device, keep its toggle outside scrolling text, and show a live footer preview in Reading settings. Review and refine shared animation/microinteraction behavior. Keep all changes local, preserving concurrent Progress/material/sharing work and all reviewed content. Physical phone acceptance remains a human task; browser emulation cannot certify it.

## Inspection and plan before editing

1. Add an optional normalized device-only readerMeaningOnly preference to existing settings persistence. App owns it; Reader receives controlled props with a standalone fallback. Partial/remote merges preserve the device choice and explicit remote serializers omit it. Test absence, malformed data, reload and foreign snapshots.
2. Move the existing language action into a stable, non-overlapping flex toolbar outside each ordinary Reader text viewport. Keep focus, count/identity and full Mushaf behavior; reserve the wider label's geometry and reset only the reading scroll when switching text.
3. Reuse DevotionalAction and footer CSS for a non-interactive live settings example, with clear accessible preview copy and real responsive layout. Changing style updates the sample through the same root preference as the actual footer.
4. Make shared color/press feedback consistent, exclude disabled/read-only examples, cover native disclosure/semantic menu keyboard activation and cancellation, and tune labelled tools separately from icon-only targets. Retain finite existing motion tokens, native input behavior and still app/OS reduced-motion feedback.
5. Add targeted persistence/component/browser regressions and screenshots in both directions, narrow/wide/short/enlarged layouts and motion modes. Run relevant feature checks and the complete non-browser gate once after implementation settles. Record exact results and physical acceptance checklist; no commit/push/deployment.

## Physical-phone acceptance checklist

No adb command or default Android SDK device bridge was available during this local check. These rows require actual hardware and are not marked complete from browser emulation.

- [ ] Thumb reach: repeatedly choose adjacent footer tools in both styles without accidental neighbors.
- [ ] Touch: press, slide off, cancel and release; feedback settles and no unintended action/count occurs.
- [ ] Language: switch at the end of a long reading, navigate away/reopen/restart, and confirm the device remembers the choice.
- [ ] Real browser controls: portrait/landscape, safe areas, largest text, short windows and any visible keyboard retain reachable actions.
- [ ] OS/app reduced motion and TalkBack/VoiceOver: stable controls, meaningful names, native focus and no decorative movement.

## Phase report — local implementation

### Objective

Implement the approved reading-preference and footer-preview recommendations and refine shared feedback without changing reviewed content or publishing.

### Scope completed

Remember main English meaning on this device across navigation/reload. Keep its fixed-size action outside the text scroll region. Show a real, noninteractive footer preview in both settings languages. Refine finite color/press feedback, semantic controls, cancellation and reduced motion. Recover enlarged controls in short ordinary Reader windows using native scrolling/focus.

### Files changed

- Preference ownership and boundaries: src/app/App.tsx, types.ts, state.ts and state.test.ts; src/lib/remoteSyncSnapshot.ts, remoteSyncSnapshot.test.ts and auth.test.ts. Shared files also contain unrelated concurrent changes, preserved as found.
- Reader and settings: src/app/screens/ReaderScreen.tsx, ReaderScreen.css, ReaderScreen.readingLanguage.test.tsx; screens/settings/ReadingPanel.tsx and ReadingPanel.test.tsx; i18n/ar.ts and en.ts.
- Shared presentation: src/app/components/ReaderFooterPreview.tsx, DevotionalControls.tsx, devotional-controls.css, reader-footer.css, ZikrComponents.css and countingSurface.test.tsx; src/app/hooks/useControlFeedback.ts and useControlFeedback.test.tsx; src/styles/theme/surfaces.css.
- Browser regressions: e2e/reading-preference-polish.spec.ts and control-feedback-sharing.spec.ts.
- Documentation listed below. Earlier footer/sharing implementation remains covered by CONTROL_FEEDBACK_SHARING_2026_10_20.md; this report describes its approved follow-up.

### Components added or modified

ReaderFooterPreview reuses DevotionalAction and footer geometry; ReaderScreen owns a stationary language-action row; ReadingPanel composes the preview. useControlFeedback shares keyboard confirmation without dispatching clicks or manipulating native values.

### User-visible changes

- English meaning remains selected on this device; unavailable translations safely retain the Arabic reading. Account synchronization cannot replace this choice.
- Switching text leaves counts and selection intact, resets only text scrolling, and keeps the action in the same place and size.
- Reading settings immediately illustrates the selected footer style with actual shared controls.
- Labelled controls press to 0.97; compact icons press to 0.92. Color changes settle using existing finite motion tokens. Keyboard cancellation releases WebKit's native lingering pressed appearance too.
- Short windows and 200% text retain a native way to reach every control without shrinking targets.

### Accessibility work

Native buttons, radio choices and disclosures retain their own actions. The language action controls the named reading region, has a current destination label and visible keyboard focus, and never increments the reading count. The preview is disabled, hidden from assistive technology and accompanied by accessible explanatory copy. Disabled/read-only/editable controls are excluded from delegated engagement. OS/app reduced motion suppresses scaling and retains still feedback. Browser checks include Arabic/English, narrow/wide/short layouts, 200% text, cancellation and axe scans; these do not establish complete accessibility compliance or replace the physical-phone checklist above.

### Tests added or updated

Device defaults, malformed settings, storage persistence, foreign merge preservation, remote payload omission, controlled Reader rendering/fallback/count neutrality, disabled real preview anatomy, keyboard/disclosure/semantic cancellation and compact-token coverage. Eight new browser cases cover remembered meaning at three widths, both settings languages, feedback cancellation and two short/enlarged layouts. The mobile WebKit short-window case uses actual keyboard focus because wheel input is unsupported by that engine's automation.

### Commands run

| Command                                                                                                    | Result                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Affected Vitest selection across eight files                                                               | 119 tests passed; final feedback-only refinement then passed useControlFeedback/countingSurface again: 2 files, 12 tests.                                                                                                                                                                                                                                                                                                                       |
| Scoped ESLint on affected TypeScript/TSX; final feedback hook/test/browser file repeat                     | Passed, zero errors/warnings.                                                                                                                                                                                                                                                                                                                                                                                                                   |
| pnpm typecheck                                                                                             | Passed after concurrent recovery typing was completed.                                                                                                                                                                                                                                                                                                                                                                                          |
| Four affected browser specs, selected narrow/wide/motion/sharing cases, Chromium + Firefox + mobile WebKit | Initial final matrix: 73 passed, 2 failed. Diagnosed WebKit stale native :active and unsupported mobile wheel API.                                                                                                                                                                                                                                                                                                                              |
| reading-preference-polish.spec.ts --grep 'shared feedback\|short Reader', same three engines               | After correction: all 9 passed in 1.1 minutes, including both previous failures. No assertions weakened or cases skipped.                                                                                                                                                                                                                                                                                                                       |
| pnpm check                                                                                                 | Initial attempt failed in concurrent Progress tests/lint, recovery typing and bundle budgets; own draft lint/format issues were corrected. Second attempt failed in 201.5s: 3 Progress lint errors, 8 Progress tests across 3 files; 2,216 tests/310 files passed. Build, typecheck, format, content/timing/motion and CSS utilities passed. Its artifact exceeded total/CSS budgets; the later final Pages build passed both unchanged limits. |
| pnpm build:pages                                                                                           | Passed: Vite build 23.38s, service worker generated, unchanged bundle budgets and CSS utility checks passed. Read-only budget recheck passed too.                                                                                                                                                                                                                                                                                               |
| git diff --check                                                                                           | Passed.                                                                                                                                                                                                                                                                                                                                                                                                                                         |

### Visual/manual evidence

Reviewed screenshots from Chromium and mobile WebKit for the fixed English toolbar and actual labelled settings preview. Final broad browser output is output/playwright/reading-polish-final; corrected WebKit/short-window output is output/playwright/reading-polish-webkit-fix. JSON reports: output/reading-polish-final-browser.json and output/reading-polish-webkit-fix.json. Representative files:

- output/playwright/reading-polish-final/reading-preference-polish--43411-load-at-390px-cross-browser-mobile-webkit-smoke/english-toolbar-390.png
- output/playwright/reading-polish-final/reading-preference-polish--fa81f-preview-in-en-cross-browser-mobile-webkit-smoke/footer-preview-en-iconsWithLabels.png

### Documentation updated

README.md, docs/ARCHITECTURE.md, DESIGN_SYSTEM.md, MOTION_SYSTEM.md, QUALITY_CHECKLIST.md, agent/DECISION_LOG.md, agent/INDEX.md and this phase report. Contracts describe device-only persistence, stationary language action, real footer preview, restrained shared feedback and physical acceptance limits.

### Decisions recorded

Remembered device-only English meaning supersedes the earlier visit-local decision. Keep finite existing animation vocabulary. The owner will push later: no commit, push or deployment was performed, and release notes were not rewritten for an unshipped release.

### Known limitations or remaining risks

Actual phone touch, OS browser chrome, TalkBack/VoiceOver and thumb reach remain unchecked because no device bridge was available. No claim of universally perfect motion or complete accessibility compliance is made. Other chats are editing Progress and reliability files concurrently, so full-workspace results cannot be attributed solely to this change.

### Out-of-scope findings

Concurrent Progress implementation caused earlier whole-gate failures. The final full check completed in 505.5s: all unit/coverage, build, typecheck, lint, content/timing/motion, bundle and CSS utility stages passed; formatting alone failed on ProgressRangeToolbar.tsx. On the owner's continuation, only Prettier formatting was applied to that file; no Progress behavior was changed and no budgets/assertions were weakened. Full logs are output/reading-polish-check.log and output/reading-polish-check-final.log.

### Recommended next step

Finish the physical-phone checklist before the owner publishes. Reuse successful scoped evidence where inputs are unchanged; run the required intact release gates against the final combined snapshot before pushing.

Removed redundant overridden footer target/appearance declarations and grouped shared keyboard selectors under one enabled-state guard. This preserves press depths and disabled behavior while keeping final production CSS within its existing ceiling. Concurrent Progress changes also reduced the combined build enough to pass the total-output ceiling. No bundle ceilings or baseline files changed.

### Final verification update

Final shared selector cleanup passed all three browser engines again (output/reading-polish-final-css.json: 3 passed in 3.0 minutes). The preceding complete feedback/short-window selection passed all 9 cases in 2.7 minutes (output/reading-polish-final-feedback.json). The final pnpm check passed its full unit/coverage suite and every stage except formatting, as detailed above; formatting was then corrected without behavior changes. No full-check receipt or exact-current-snapshot green result is claimed after concurrent edits.

Final formatting correction verified with pnpm format:check: passed, all matched files use Prettier code style. git diff --check also passed. Whole-suite coverage from coverage/check-28828/coverage-summary.json: lines 82.77%, statements 80.77%, functions 77.51%, branches 77.10%; the configured coverage gate passed unchanged. The full gate was not rerun after the formatting-only correction because every behavioral stage had passed and no new behavioral change required repeating it. Concurrent workspace edits remain outside this phase and still require exact-final-snapshot release verification before publication.

Concurrent-edit caveat: ProgressRangeToolbar.tsx changed again after the successful repository formatting scan. Its latest contents were formatted once more and the scoped formatting check passed. This demonstrates why no immutable final-workspace release receipt is claimed while the other work continues.
