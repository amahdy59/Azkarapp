# Phase Report — Audio clarity and continuity

## Objective

Apply the agreed audio recommendations and inspect the result before release, preserving content integrity, offline reading, natural completion and one audio controller. Initial tree was clean at deployed 44b56ec0. This phase remains local for owner review.

## Scope completed

Visible persistent Auto-continue switch (المتابعة التلقائية), independent accurate repetition feedback/help, optional selectable queue with current item, validated device-only paused session restoration from Settings → Audio & downloads, 15/30/60-minute sleep timer with cancellation/foreground reconciliation, and identical speed choices in Settings/player. Repetition-mode changes preserve pause. New queue reflows at enlarged text, has an independently scrolling body and focuses the current item. Stop/clear/sign-out prevent stale restore/bookmark resurrection. No new dependency, recording, devotional text, remote schema or app-state migration.

## Files changed

AudioProvider and tests; listeningBookmark service/tests; FloatingAudioPlayer and tests/styles; new AudioQueueSheet; AudioSettingsPanel; bilingual i18n; state erasure event/tests; audio-continuity, audio and audio-expanded-layout browser specs; active phase/index, decision log, architecture/design/audio/quality/device/retry documentation and this report.

## Components added or modified

AudioQueueSheet composes the shared Modal/SheetHeader/Button. Existing ToggleTrack paints the fixed-label switch. Existing themed Select handles the timer, without a second popup system. Settings delegates storage/restore to AudioProvider. AudioProvider still owns one media element.

## User-visible changes

Auto-continue remains visible when off and does not start/pause/seek playback. Prescribed repetitions and ritual-round integrity retain their existing progression. Queue selection preserves a paused state and never marks skipped content complete. Current repetition feedback now says Play once when repeat is off. Sleep timer pauses without recording completion and displays its actual end time. Resume rebuilds the original queue from current reviewed entries and requires Play; unavailable/changed/expired positions recover honestly, with a Forget action. Existing seamless audio header remains.

## Accessibility work

Native buttons, fixed switch name with aria-checked and described behavior, current-item semantics, wrapping queue labels, shared modal focus/return/Escape behavior, actual 44px minimum targets and enlarged lock-column reservation. Queue guidance scrolls with its options; no control disappears behind a fixed explanatory block at 200%. Timer status is a fixed factual deadline, not a recurring live countdown. Default/shared finite motion and both reduced-motion paths remain.

## Tests added or updated

Bounded/expired/malformed bookmark parsing, recording fingerprints and rebuilding against real reviewed content; stale recording/invalid repetition rejection; sleep expiry/cancellation/foreground/late playing events without completion; paused mode change; new play intent cancelling old restore; private erase suppressing later checkpoints; queue selection; fixed-label toggle without autoplay; speed menu identity; browser saved position after reload, actual native seek value, paused restore, footer non-overlap, queue current-item viewport/selection/Escape, timer selection and axe.

## Commands run

| Command / selection                                        | Result                                                                                                                                                      |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript and targeted ESLint during development          | Passed, exit 0                                                                                                                                              |
| First focused audio suite                                  | Existing expectations exposed new label/speed count; updated exact semantics and preserved progression assertions                                           |
| Focused AudioProvider/bookmark/player/state/Settings suite | 134 passed, exit 0                                                                                                                                          |
| Real reviewed-content bookmark rebuild suite               | 11 passed, exit 0                                                                                                                                           |
| First browser continuity selection                         | 3 failed from incorrect test play/pause names; repaired to use the i18n accessible names                                                                    |
| Narrow browser reproduction                                | Reproduced 320px/200% lock overlap; intrinsic-width column repaired without reducing text or targets                                                        |
| Initial three-engine continuity matrix                     | 9 passed, exit 0; screenshot review then caught oversized queue guidance/header, repaired with scrolling body/current focus and stronger viewport assertion |

Final browser/quality/build/audit outcomes are recorded in output/audio-continuity-review/PHASE_REPORT.md. Generated evidence is outside tracked inputs to keep final exact-snapshot validation valid. No release/push/CI success for this local phase is claimed.

## Visual/manual evidence

Phone, 320px/200%, desktop, RTL/LTR, solid/Glass, light/dark/midnight audio footer/queue screenshots. Original screenshot review identified the enlarged queue's unusable header/guidance; the regression now requires the current item to be fully in the viewport rather than merely present. Physical phones, TalkBack/VoiceOver, native screen-lock/background timing and field p75 remain unverified.

## Documentation updated

Architecture, design system, audio architecture, quality checklist, active index/phase/decision log, device checklist, retry register and this report.

## Decisions recorded

Owner requests all agreed recommendations and a pre-release assessment. Keep one visible auto-continue control; retain Play all wording only for immediate collection-start actions. Store device-only position identifiers/checksum, rebuild current content, pause before playback and preserve erasure boundaries. No speculative core reading/cache redesign or remote migration.

## Known limitations or remaining risks

Sleep timing depends on the browser/OS allowing JavaScript to execute; suspended engines reconcile the deadline on return, and native/lock-screen timing requires physical acceptance. Resume is device-only, offered in Audio Settings, expires after 30 days, and rejects changed current recordings; it is not included in account backup/sync. A few seconds can be lost on an abrupt process kill between checkpoints. Previously documented Reader WebKit focus/viewport retry remains separate; keep full assertion and investigate repeated failures. No automated suite establishes full WCAG conformance or real-world performance percentiles.

## Out-of-scope findings

Real-phone/OEM delivery, assistive technology and user comprehension acceptance remain release inputs. The existing single-monitor diagnostics and offline installation policies are retained. No claim that every aspect is now state of the art.

## Recommended next step

Review the verified local audio UI and complete device/assistive-technology/background acceptance before publishing. A release still requires fresh bilingual notes/archive, intact local hook and exact-commit complete Quality/Pages/production smoke.

## Review continuation — 2026-11-02

The new queue's missing focus-return coverage exposed a real defect: selecting an item after an unfocused opening did not restore the queue opener. The added component assertion fails before repair. Focus the trigger on accepted activation before opening so Modal captures the correct return target, using the established WebKit pointer-focus convention. Component coverage now requires the return target; audio-continuity requires it after both selecting an item and Escape in every existing responsive/language scenario. No playback, content, timer or saved-position contract changes. Preserve the pre-release publication hold; final integrated local evidence is in output/progress-card-design/PHASE_REPORT.md.

Late-media review also reproduces a buffering-state regression after sleep expiry. Delayed waiting/stalled events now retain the timer's paused state, and a delayed ended event cannot advance the queue or emit entry completion after that pause. The foreground-expiry test retains the existing late-playing check and adds all three events plus unchanged completion sequence/expiry announcement. These guards enforce the existing sleep contract; no timer duration or recording rule changes.

Actual WebKit 320px/200% screenshots expose listening text through the queue's ordinary translucent Glass fill, which axe misses. The queue now shares the existing protected-overlay opaque base with filter/date/Mushaf overlays; stationary reflection/frost remain. audio-continuity asserts an opaque root in every scenario and captures enlarged text again. The earlier three-engine artifact is preserved as superseded evidence; final rebuilt results and physical-device limitations remain in the integrated generated report.
