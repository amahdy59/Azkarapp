# Phase Report — Phase 75: Integrated expanded audio player

## Objective

Replace the expanded audio modal with an integrated responsive listening canvas, remove the redundant information icon, and support the existing prescribed counts above ten. Keep all changes local as requested.

## Scope completed

- Expand into the Reader canvas directly below the session header/progress area, preserving the surrounding header, collection navigator, and app navigation.
- Replace the modal, scrim, rounded outer frame, and nested reading card with one opaque theme surface.
- Keep recording attribution inside the existing reciter menu.
- Keep long devotional text independently scrollable above reachable native audio controls. Use columns in short landscape windows; enlarged text may scroll the whole surface.
- Remove the implementation-only ten-repetition cutoff. Play Once remains the default; prescribed repeat uses the existing reviewed count, including 100-count istighfar. Show repetition and queue positions together.
- Load player-specific CSS with the existing lazy audio component to preserve the unchanged initial CSS budget.

## Files changed

- Player: `src/app/components/FloatingAudioPlayer.tsx`, new `AudioPlayerSurface.tsx`, new `floating-audio-player.css`.
- Reader integration: `src/app/screens/ReaderScreen.tsx`, `src/styles/theme/layout.css`.
- Repeat eligibility: `src/app/content/contentReview.ts`.
- Tests: player component tests, audio provider tests, audio architecture tests, `e2e/audio.spec.ts`, new `e2e/audio-expanded-layout.spec.ts`.
- Shared UI/test support: `src/app/components/ui/select.tsx` adds an optional option description; `src/test/setup.ts` supplies jsdom's missing scrollIntoView API.
- Documentation: design system, audio architecture/QA, decision log, agent index, this report, and screenshots under `docs/agent/evidence/phase75/`.

## Components added or modified

Added AudioPlayerSurface for canvas replacement and reversible inert handling. Updated FloatingAudioPlayer and the Reader canvas wrapper. Extended SelectItem with an optional description for the current recording source, preserving the reciter name in the trigger. Reused existing icons, theme tokens, native range inputs, and shared audio controller. No dependencies added.

## User-visible changes

The expanded player reaches the Reader header without floating above a darkened page. Reading gets a larger, flat surface. Reciter selection and attribution share one dropdown. Repeat is available for high-count azkar, and the active repetition remains visible during queued playback.

## Accessibility work

Native labelled sliders, 44px controls, visible focus, keyboard text scrolling, surrounding-shell keyboard access, nested-menu Escape, collapse focus restoration, stopped-player counter focus restoration, covered-content inert/aria-hidden cleanup, reduced-motion transitions, RTL/LTR, safe-area padding, and 200% text-size coverage. Automated axe scans supplement manual review; they do not establish full WCAG conformance.

## Tests added or updated

- Canvas replacement, covered-control access restoration, no dialog/info action, attribution in the reciter menu, and queued high-count position display.
- Every existing high-count item builds a plan with its full prescribed count while default plans play once.
- A 100-repeat provider run records completion only on the final natural ending.
- Browser coverage at 320, 390, 768, 1024, 1440px, 844×390 landscape, and 200% root text size; Arabic/English and Light/Midnight/Dark; geometry, keyboard scrolling, native targets, menu/focus restoration, and axe.
- Browser regression for the actual m-hm-96 entry and repeat toggle.

## Commands run

| Command                                                                                                                                    | Result                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| pnpm check                                                                                                                                 | PASS on final implementation, all 10 stages, 248.9s                                                                              |
| pnpm test:run src/app/components/FloatingAudioPlayer.test.tsx src/app/audio/AudioProvider.test.tsx src/app/audio/audioArchitecture.test.ts | PASS, 46 tests                                                                                                                   |
| pnpm test:e2e                                                                                                                              | Before the final nested highlight-color fix: 427 passed, 1 existing skipped test, 2 WebKit reciter-menu contrast failures, 25.7m |
| pnpm test:e2e e2e/audio-expanded-layout.spec.ts e2e/audio.spec.ts --retries=0                                                              | PASS on final implementation, 30/30 without retries across Chromium, Firefox, and WebKit, 3.8m                                   |
| pnpm build:pages                                                                                                                           | PASS, build, PWA, bundle budget, CSS utilities                                                                                   |
| pnpm audit:prod                                                                                                                            | PASS, no known vulnerabilities                                                                                                   |
| pnpm format:check                                                                                                                          | PASS after formatting the report                                                                                                 |
| git diff --check                                                                                                                           | PASS                                                                                                                             |

The full browser run identified the two dark-theme WebKit menu failures. Explicit highlighted text colors on the nested reciter text fixed them; the final audio matrix reran every affected layout and audio flow. All axe rules and assertions remain enabled. The entire 430-case suite was not repeated after this local color fix.

Intermediate verification also caught the initial CSS budget overrun, invalid listbox children, scrollable-menu keyboard access, and outdated attribution assertions. These were corrected without changing budgets, reviewed content, test coverage, or runtime dependencies.

## Visual/manual evidence

Screenshots in `docs/agent/evidence/phase75/` cover phone, narrow phone, tablet, desktop rail, large desktop, short landscape, and enlarged text. Inspected phone, desktop, narrow, and landscape captures and refined short-window spacing. Cross-browser verification includes Chromium, Firefox, and WebKit. Real screen-reader and cutout-device testing remains manual.

## Documentation updated

Design system and audio architecture describe the canvas replacement instead of the prior modal. Audio QA now verifies shell access, covered-content exclusion, and attribution in the reciter menu. DEC-214 records the owner's request and high-count repetition follow-up.

## Decisions recorded

DEC-214 supersedes only the expanded modal/sheet presentation and the high-count repeat eligibility restriction. Reviewed devotional text, counts, audio mappings, persistence, and completion rules remain unchanged.

## Known limitations or remaining risks

No commit, push, deployment, or release-note update performed. Release notes must be rewritten for the actual release before a future deploying push. Real-device screen-reader and safe-area checks remain manual. The final cross-browser audio matrix passes; the broader suite result and the scope of its rerun are recorded above.

## Out-of-scope findings

No unrelated refactor, dependency, content edit, or deployment change.

## Recommended next step

Owner review of the local player on a physical phone with TalkBack or VoiceOver before authorizing a future release.
