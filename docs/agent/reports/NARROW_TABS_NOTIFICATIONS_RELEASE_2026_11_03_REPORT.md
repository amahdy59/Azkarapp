# Phase Report — Narrow tabs, notification wording and combined release

## Objective

Repair blank narrow Progress tabs and make notification enablement clear on Android and browsers. The owner authorizes publishing all pending local changes, superseding the previous publication hold.

## Scope completed

Removed the obsolete 24rem icon suppression. Generic notification permission/enable wording is shared by Settings and first-use setup; blocked Android permission has device app-settings guidance. Existing native/browser adapters and delivery limits remain authoritative. The release includes the preceding pending final-touch work documented in its phase reports.

## Files changed

This bounded fix changes progress-screen.css, NotificationsPanel.tsx, Arabic/English i18n, notification/onboarding tests, and adds progress-narrow-tabs.spec.ts and NotificationsPanel.native.test.tsx. Decision log, active phase/index, design and quality guidance, release notes and this report record the release. The full pending release inventory is available from the resulting commit diff and preceding reports.

## Components added or modified

Progress tab presentation and NotificationsPanel permission guidance. Existing shared notification copy also serves FirstUseSetup; no new runtime component or dependency.

## User-visible changes

Progress tabs retain their icons at 384px and below. Enable notifications and Notification permission apply to mobile apps and browsers. Android denial points to Android notification settings. Pending navigation, reading, material, progress and download refinements are described in the bilingual release manifest.

## Accessibility work

Retained accessible names, tab selection/keyboard semantics and 44px targets. Browser regression covers 100%/200% text and RTL/LTR. Permission failures retain scoped announcements and saved reminder choices. Automated results do not establish physical-device or complete accessibility acceptance.

## Tests added or updated

Narrow tab coverage at 320/360/375/384/390px in both languages, including icon visibility, hidden visual labels, target dimensions, pointer selection and End-key navigation. Native adapter tests exercise permission requests and denied/revoked permission recovery in both languages. Existing onboarding and notification expectations use the generic labels. The new native mock suite is registered in src/test/isolatedSuites.ts. The initial full quality run caught that missing registration (2,489 other tests passed); after repair, both the isolation-policy suite and native suite passed (6 tests).

## Commands run

| Command                                                                           | Result                                                                      |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Targeted Vitest notification panel, native panel, onboarding and native reminders | 4 files, 19 tests passed                                                    |
| Targeted Playwright narrow tabs, Chromium/Firefox/WebKit                          | 6 tests passed (1.7m)                                                       |
| Required hook, inventory, affected browser checks and audit                       | Exact command logs and exit results retained in output/narrow-tabs-release/ |

Final quality and deployment success must be assessed from the exact commit's GitHub Actions runs and production smoke evidence, not this implementation record.

## Visual/manual evidence

Playwright writes Arabic/English 384px/200% screenshots in test-results. Generated release evidence is retained under output/narrow-tabs-release/. Existing final-touch screenshots and owner references remain preserved. Physical Android notification delivery and TalkBack/VoiceOver checks remain pending.

## Documentation updated

Decision log records publication authorization. Active phase/index, design and quality contracts, this report and bilingual release notes describe the bounded fixes and combined release.

## Decisions recorded

The owner's 2026-11-03 request supersedes the local publication hold. No native storage, reminder scheduling, persistence, reviewed content, toolchain or dependency change is introduced by this fix.

## Known limitations or remaining risks

Browser and mocked native-adapter tests cannot establish real Android OS permission/delivery acceptance. Existing native-file migration, signing/Play acceptance and human assistive-technology gaps remain as documented in the preceding reports.

## Out-of-scope findings

The broader pending-tree browser run passed 72 of 78 cases and exposed an actual 320px/200% listening-control overlap: the new Focus actions intercepted Auto-continue. Below 20rem of available control width, transport, continuation and focus/lock now occupy separate rows, with shrinkable focus text. The audio continuity regression additionally verifies actual hit-testing. Five older shared-card cases still expected centered icons despite the owner's approved compact icon/label row; their geometry assertion now verifies centered vertical alignment and no icon/label overlap in compact rows, preserving centered wide-card, quantity, focus, opacity and accessibility assertions. All 14 affected Chromium cases pass after these repairs (47.6s). A WebKit app-reduced-motion diagnostic sampled a CSS animation before its startTime was assigned (null → 620ms); the no-replay assertion now waits for the animation ready promise before comparing the same start times. Duration limits and exact no-replay equality remain unchanged. Original diagnostics remain under output/narrow-tabs-release/.

The final quality run passed all tests, formatting and static checks but exceeded total output by 476 bytes after release archiving. ProgressRecordsTable has no current application caller; its unchanged table-only CSS now loads from that component instead of every Progress visit. This preserves reusable presentation and removes inactive styling from the live bundle without raising any budget. No new database or native binary change is needed. Existing pending work is released as authorized; its historical evidence remains tied to its own source checkpoints.

## Recommended next step

Complete remaining physical-device and human assistive-technology acceptance using the deployed release, preserving documented native storage boundaries.

## Exact-commit CI remediation

Commit ba6277fb passed local full quality, all 28 hook browser cases and Pages build, and was pushed through the intact hook. Quality 41543882687 passed checks and Android verification, but its responsive shard found ten failures (five identities repeated on phone/tablet) and two intermittent search cases. The pending local implementations had left older test expectations behind:

- First launch now defaults to Arabic; initial-flow and skip-link tests must wait for its localized heading before scanning or focusing.
- Compact search is inside the filter sheet. A synchronous isVisible probe before the Library mounts can omit opening it; the test now waits for the compact trigger at the known phone viewport.
- Library filters sit beside the tabs, and complete titles may wrap above them as space/font/scrollbar metrics require. The regression retains complete labels, actual geometry, equal tab/filter heights, independent hit areas, icon/text alignment, keyboard selection and no horizontal overflow. It uses the current section-tab-label selector in both narrow and wide layouts.
- A facing Mushaf has equal outer paper canvases. Each inner ink frame follows its own fitted measure, especially in the explicitly font-blocked Unicode fallback; comparing inner text widths was the wrong geometry target. The original equal-page width/height limits remain, with added inner-frame containment, retained word-gap/aspect/viewport/interaction assertions and screenshots.

The corrected identities pass 21 desktop/phone/tablet Chromium cases. The Mushaf case passes Firefox/WebKit, the Library cases pass Chromium/WebKit and the final Firefox reflow correction passes both languages. Raw diagnostic and final reports remain under output/narrow-tabs-release/. These are test-contract repairs; no application behavior, assertion tolerance, browser inventory, coverage threshold or bundle limit is weakened.

The complete shards subsequently exposed the same maintenance gaps across labelled-tool fixtures, compact metric geometry, capsule radius, finite icon cues, deliberate Tab focus, relocated keyboard help, packaged reminder acquisition, optional navigation, protected menu highlights and modal date controls. Tests explicitly select labelled tools when testing that preference; actual defaults stay icon-only. Compact quantities use the approved 24px token/inline anatomy, wide quantities retain their earlier minimum and centering. Native/pseudo-element focus ownership and still-mode assertions remain. Picker tests retain full target/viewport/hit checks and now assert complete wrapping labels rather than the superseded two-line clamp. Test-side scene clocks remove the accidental pre-Fajr mode-selector dependency. Re-selecting the current preset dismisses its unchanged editor through Escape before testing the background page.

Confirmed application repairs in this remediation: searchable picker Escape is consumed before document-level dialog handlers and compact parent sheets defer to protected dropdowns; shared Header subtitle leading scales with text, and the Progress date span is a block so its box matches its complete line layout. The real parent-Modal unit regression and header/sheet suites pass 33 cases. Original failures and passing reproductions remain separately retained. Physical-device delivery and human assistive-technology acceptance remain pending.

Additional final reproductions: the cross-engine repair batch passed all 16 Firefox cases and 12 WebKit cases; its four WebKit diagnostics identified picker-animation sampling and deferred footer measurement. All four picker cases pass with unchanged 64px minima after polling settled geometry. The next 27-case batch passes 23 cases, including both languages of WebKit enlarged prayer footers, all wide reader controls, semantic tint/grain recipes and constrained scrolling. Its four remaining scroll-material assertions were the second occurrence of the older background-image:none expectation; they now compare the exact resting paper image before/after scrolling. The final timer/header batch passes all 14 non-audio cases across all three engines, including deliberate-Tab reading focus, Library boundaries and the opaque textured header. Pausing audio hold time exposed a deferred reopened-dialog autofocus; the pointer test now advances the mounting frame, verifies initial focus and zero hold progress, and checks unlock before releasing the pointer. Exact halfway, cancellation and 2001ms hold checks remain unchanged. Final audio results and full gates are retained in paused-lock-final.log and remediation-check.log.

No target threshold, coverage percentage, bundle ceiling, test inventory, retry policy or CI gate was reduced. The compact filter's clipped assistive-only text is excluded from paint geometry; the actual button, viewport overflow and visible text checks remain. Raw original and final failures are retained separately; the retry intake in FLAKY_TESTS.md records all attempts, exact commit/run, evidence and unresolved causes. Release notes 2026-11-03.1 replace the manifest with four matching Arabic/English outcomes covering the entire range since the last deployed commit.

The remediation gate passed every stage except total bundle size (408 bytes over the unchanged ceiling). Removed only unreferenced adaptive-counter-pulse keyframes/rules and obsolete audio-auto-advance selectors after confirming no source DOM uses either class. Existing counter and audio regressions remain intact; no visible animation or control was removed.

Quality 41554146380 passed neither release verification nor deployment: two ResponsiveFilters unit tests expected focus restoration without first focusing their opener. fireEvent.click does not supply browser pointer focus. The fixture now focuses the opener before activation, retaining exact return-focus assertions. Both affected suites pass 13 tests; product code is unchanged in this follow-up. The next exact-commit Quality run remains authoritative.

Quality 41555135154 repeated the fixture failure. The phone-sheet test now awaits focus entering the mounted dialog before performing its synchronous edit/close sequence. This preserves both opening focus and exact opener restoration checks; the targeted three cases pass. The earlier opener-focus correction alone was insufficient.
