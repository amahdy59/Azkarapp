# Android reliability plan — 31 October 2026

Status: investigation and proposed implementation plan; await owner review before starting this new scope. Production hold remains in force. Preserve the existing uncommitted download/layout repairs and the untracked Android brief.

## Owner evidence and target

Six supplied screenshots show Mushaf normal/focus views, expanded audio, the Reader collection drawer, Home and the Mushaf index. The owner reports an update installed today on a OnePlus Nord 4. Android/OxygenOS version, native versionCode and active web/live-update bundle are not yet known; “updated today” alone does not prove which source commit is running.

Requested outcomes: eliminate unnecessary top space without hiding system bars or putting controls behind them; make Play all work immediately and continuously; restore dependable counting haptics and finite interaction feedback; stabilize Home motion; open the index at the current reading location; cover related defects.

## Findings and confidence

| Area                       | Evidence                                                                                                                                                                                                                            | Diagnosis                                                                                                                                                                                                                                                  |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home/Mushaf top gap        | surfaces.css reserves env(safe-area-inset-top) at .app-shell; HomeScreen and multiple MushafPageViewer/KhatmahReaderScreen controls add it again.                                                                                   | Confirmed duplicate CSS ownership. Native MainActivity also calls setDecorFitsSystemWindows(true); actual WebView viewport/inset delivery needs device measurement before removing any root protection.                                                    |
| Overlay system-bar overlap | Screenshot 4 collection header and screenshot 6 index title extend into status icons. MushafNavigationModal is portalled with top-2/bottom-2 and no safe-area bound.                                                                | Confirmed portalled overlay differs from the inset app-shell coordinate system. Audit SidePanel and all related overlays too.                                                                                                                              |
| Play all                   | App.startPlayAllAudio starts full-session plan without setAutoAdvance(true); AudioProvider correctly stops independent entries when the remembered flag is false. Handler returns immediately if audio module/controller is absent. | Confirmed command/preference and cold-module gaps. Device-specific ended/play rejection or source-switch failures remain hypotheses until reproduced. Defaults already normalize autoAdvance to true; do not just change the default or erase preferences. |
| Android vibration          | Reader/Masbaha/Salawat call vibrateIfEnabled; it only invokes navigator.vibrate. No native haptics adapter; main manifest does not declare VIBRATE.                                                                                 | Confirmed missing dependable native path. Need actual merged manifest and device runtime validation; cannot establish all Android vibration behavior from browser mocks.                                                                                   |
| Home motion                | Collapse uses 96px/8px hysteresis, interaction/focus holds, registered inherited CSS state, and both app/OS reduced-motion gates. Earlier profile found forced layout in sticky measurement; local fix batches reads before writes. | Confirmed expensive layout path already addressed locally. Screenshot alone cannot establish whether the remaining intermittency is a setting, Android WebView behavior, stale focus, geometry change or update mismatch.                                  |
| Mushaf index position      | Modal receives displayPage, expands its current juz on open and styles current surah/quarter. No explicit current-item scrolling on open/tab change; juz header lacks corresponding aria-current.                                   | Existing highlight is partially implemented, not absent. Need guarantee correct host page, reveal current row after layout, and distinguish current location from hovered/expanded/selected navigation choices.                                            |

PR #15 contains some top-inset and WAV work but also unrelated branding/reminder changes and failing CI. Compare focused fixes; do not merge that PR wholesale or treat it as deployed.

## Implementation sequence and acceptance gates

### A. Establish the device baseline and one inset owner

1. Record Nord 4 native versionCode/name, Android/OxygenOS/WebView version and active live-update bundle. Reproduce using the matching source candidate. Capture native window insets, WebView rectangle, CSS safe-area values and root/header/dialog geometry.
2. Keep one application viewport/system-inset contract. Determine whether native decor has already consumed the inset; expose only residual WebView insets. Screens inside the protected shell use ordinary internal padding, not another system top inset.
3. Portalled overlays apply their own viewport-safe bounds once. Protect top and bottom controls in the index, Reader drawer, sharing, menus, confirmation dialogs, settings sheets and audio overlays. Do not use larger z-index to conceal underlying text or system bars.
4. Preserve visible status/navigation bars, contrast in light/dark themes, gestures and cutouts. Check Android API 24 compatibility; version-specific window attributes belong in version-qualified resources or guarded native code.

Acceptance: no duplicated blank band; no app controls/text behind status icons or gesture bar. Test shown/hidden Mushaf chrome, meanings, focus mode, navigation drawer, audio expanded/collapsed, Home top/scrolled, short landscape, rotation, keyboard/IME, enlarged text, and re-open after backgrounding.

### B. Make Play all an explicit reliable command

1. Separate explicit Play all intent from the remembered continuous-play toggle. Proposal: pressing Play all enables/persists continuous advance and creates the intended full-session queue. Manually playing an item continues to honor the reader's choice. Keep prescribed repetition and ritual-group semantics.
2. Queue cold-start audio intent while loading the module; show genuine pending/error feedback instead of silently returning. Cancel stale intent when its route/context no longer applies.
3. Trace natural ended -> next segment/repetition/entry -> native cached/remote source -> play promise. Retain generation ownership and object-URL cleanup; surface blocked playback or unavailable audio with a recovery action.
4. Keep approved-coverage disclosure and selected voice/language; never substitute content or mark a skipped/failed item complete.

Acceptance: fresh install and remembered off/on, first tap before module loads, start from first/current item, repeated taps, embedded repetitions, ritual boundaries, gaps in coverage, Arabic/English, remote/cached/offline mix, seek near end, pause/resume, next/back, close/reopen, error and retry. Screen-on continuous playback is required. Screen-off/background playback must be tested separately; a dependable background service must not be implied or introduced silently.

### C. Native counting haptics and coherent control feedback

1. Keep one shared haptics boundary honoring the existing Haptic Feedback setting. Add a small Android adapter using platform feedback/vibration APIs and the normal VIBRATE declaration if required. Prefer the existing native bridge pattern; no new runtime dependency unless justified.
2. Use the synchronous platform guard for browser fallback. Unsupported, denied or unavailable hardware must never interrupt counting, duplicate a count or report a false success.
3. Differentiate quiet tap feedback and completion feedback; avoid long overlapping patterns on rapid taps. Stop stale feedback on background/teardown and do not vibrate from render effects.
4. Audit touch pointerdown/up/cancel, lost capture, drag-off, disabled states, keyboard Enter/Space, release/reversal and focus recovery across Reader, Masbaha, Salawat and Home actions. Hover-only cues must not be the only touch feedback.
5. Preserve both reduced-motion preferences for visual effects and the independent Haptic Feedback setting; never force animation back on to hide a state bug.

Acceptance: Nord 4 hardware count taps, completion, rapid taps, preference off/on, OS haptic policy, app resume and no-hardware fallback. Count/progress correctness is invariant. Native bridge/manifest changes require a new Android binary; a web live-update alone cannot install the capability.

### D. Stabilize Home animation and verify performance

1. Reproduce transitions on the Nord 4 with app/OS motion preferences and Android animation/battery settings recorded. Distinguish expected still alternatives from failures.
2. Instrument scroll threshold transitions, active element, interaction hold, expanded prayer, visibility, ResizeObserver notifications and reversal. Ensure a stale focused/removed control cannot indefinitely pin expanded geometry.
3. Retain one geometry owner, the approved 220ms transition, reserved footprint, touch-native scrolling and numerical countdown. Check OS/app preference changes mid-transition, font/photo late load, orientation and viewport changes.
4. Preserve the existing read-before-write layout repair. Profile remaining prayer-footer startup sizing, Motion shared layout measurements and eager full-surah startup content. Only make optimizations backed by traces and invariant tests.

Acceptance: repeat up/down/reverse cycles on touch and keyboard; no jump, dead scroll area, missing header, stuck half-state or unexpected motion under reduced motion. Compare cold and warm startup, scroll-frame distributions and long tasks with the same workload. Existing finite-value performance tests alone are not a smoothness guarantee.

### E. Open the index at the real reading position

1. Derive current surah, juz, hizb/quarter and page from the actually displayed settled page in both Mushaf hosts, including facing-page mode.
2. On open, retain the requested tab, expand the current juz, and scroll the current marker into the modal's own list after mount/layout. Focus must not jump to the page or unexpectedly navigate.
3. Provide an explicit current-location cue and appropriate aria-current; keep accordion expansion distinct from the current reading position. Preserve search, bookmarks and manual browsing.
4. Reopening after reading elsewhere recomputes the current location. Do not repeatedly auto-scroll during search or while the owner is exploring the list.

Acceptance: pages 1, 9, mid-juz, 562 and 604; exact surah/juz/quarter boundaries; same-page surah starts; all index tabs; reopen after page turn; phone/desktop spread; RTL/LTR, enlarged labels and keyboard recovery. In particular, a highlighted starting quarter must not be mistaken for the user's precise current page.

## Related issues to cover in the same investigation

- Header/drawer clipping under system UI, and bottom gesture-bar clearance; screenshot 4's drawer is a system-inset overlap rather than just empty spacing.
- Tiny close/search controls in the index: current Close uses 40px dimensions and the clear action 32px. Verify/restore the ordinary 44px target floor without losing enlarged-text fit.
- Safe-area changes with rotation, IME and system navigation mode; full-window portals must share a durable protected surface and focus contract.
- Stale native binary plus newer live-update bundle, rollback and repeated prompts; surface actual build identity during diagnostics rather than guessing from install date.
- Media error/buffering/permission recovery, object-URL release, cancellation after a queued Play all action, and unexpected duplicate completion writes.
- Any duplicate counting/press feedback across pointer/click listeners; audibility and haptics must remain preferences.

## Verification and delivery

Implement one bounded stage at a time with a scoped diff and regressions. Local unit targets: audio provider/preferences/planner, haptics gate/adapter/counters, Home scroll/motion and Mushaf index. Browser targets: audio continuity/recovery, Home transition/hierarchy, overlay geometry, index/current-location, Reader drawer and 320px/200% reflow across Chromium, Firefox and WebKit. Native build: sync Android mode, compile, lint, unit tests and debug APK; inspect merged manifest. Test the actual Nord 4 build with a physical checklist/video and exact version identity.

Finish a structured phase report with exact passes/failures, screenshots/trace evidence and remaining hardware limitations. Run pnpm check and required local feature coverage; retain every assertion, coverage threshold and output ceiling. Full exact-commit CI/Pages/release checks occur only after the owner explicitly lifts the production hold. No commit, push, deployment or test notification to other people is authorized by this plan.
