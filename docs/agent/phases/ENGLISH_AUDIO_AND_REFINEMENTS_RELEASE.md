# Phase Report — English audio and pending refinements release

## Objective

Implement the approved English-first expanded audio player, review the pending changes, and publish a verified release to GitHub. The owner's 2026-10-04 instruction supersedes the earlier no-push restriction.

## Scope completed

Plan: inspect the existing player and release contracts; add a native Arabic disclosure using local presentation state and existing translation content; cover keyboard and fallback behavior; review the complete pending diff; run frozen install, quality, full browser and Pages gates; refresh release notes, commit and push; monitor both workflows and production.

Implementation and complete diff review are finished. Publication is protected by the repository full pre-push gate; its final browser results and GitHub deployment verification are recorded in the task release report and workflow runs.

## Files changed

Audio player, unit/browser tests, Arabic/English product copy and design/audio documentation. Release also includes the previously documented sharing, counter, control alignment and audit refinements. See their individual phase reports for file and component details. Test cleanup respects an external preview instead of terminating another session's default-port server. MushafPageViewer and its regression test also remove the reduced-motion opacity dip found by the complete browser sweep.

## Components added or modified

FloatingAudioPlayer uses a labelled native disclosure button with local React state and a stable controlled-region ID. Existing typography, icons and semantic theme tokens are reused; no dependencies added.

## User-visible changes

English translation is primary in the English audio player. Arabic starts hidden and can be shown or hidden without changing playback. Recording language is explicit. Missing translations show an explanation and Arabic fallback. Existing spacing, transport ordering and reciter-only identity refinements are included.

## Accessibility work

Native keyboard activation, aria-expanded/aria-controls, hidden text removed from the accessibility tree, accurate language/direction, scalable text, visible focus and minimum 44px target. The toggle retains focus and its mounted-player preference across tracks. Arabic mode remains Arabic-first. Reduced-motion Mushaf page changes now preserve full contrast throughout late font/layout updates.

## Tests added or updated

Unit tests cover primary text, disclosure, unchanged playback, track continuation, Arabic mode and missing-translation fallback. Browser matrix covers Enter/Space, focus and hidden text alongside existing geometry, themes, text enlargement and axe checks.

## Commands run

| Command                                 | Result                                                                                                                                                                                                                                  |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pnpm install --frozen-lockfile          | Passed; dependency graph unchanged.                                                                                                                                                                                                     |
| pnpm check                              | Passed every stage after the final runtime repair in 174.7 seconds; unit coverage, typecheck, lint, format, production build, audio manifest, type scale and unchanged bundle/CSS budgets.                                              |
| Targeted FloatingAudioPlayer unit suite | 23 passed.                                                                                                                                                                                                                              |
| Targeted MushafPageViewer unit suite    | 20 passed, including the reduced-motion contrast regression.                                                                                                                                                                            |
| pnpm build:pages                        | Passed after the final repair, including bundle/CSS gates.                                                                                                                                                                              |
| pnpm audit:prod                         | No known vulnerabilities found.                                                                                                                                                                                                         |
| pnpm check:release-notes                | Passed with four parallel Arabic/English entries and release stamp 2026-10-04.                                                                                                                                                          |
| Full browser suite                      | The rebuilt preview passed desktop and phone sweeps and reached tablet checks without failures. The complete suite runs in the mandatory pre-push gate before upload; the preparatory sweep was stopped to avoid duplicating that gate. |

## Visual/manual evidence

Inspected 320px English, Arabic phone and other responsive player captures from the browser matrix. Manually played the real English recording, paused it, disclosed Arabic and inspected both states at 390×844. Evidence: `../evidence/audio-refinement/english-translation-primary.png` and `english-arabic-disclosed.png`. Earlier audio, sharing, counter and audit screenshots remain in their respective evidence directories.

## Documentation updated

Design system, architecture, motion system, audio QA, decision log, agent index, this report and release notes.

## Decisions recorded

Publish the complete reviewed pending diff, preserving reviewed content, persistence and existing phase scope.

## Known limitations or remaining risks

Automated checks do not certify screen-reader or physical-device behavior. Those checks remain manual.

## Out-of-scope findings

The browser sweep caught four transient contrast violations caused by the Mushaf's 160ms reduced-motion fade to 40% opacity. The trace identified page furniture controls; removing that fade corrects the source of the failure without changing contrast assertions. Reviewed content, persistence, remote state and dependencies are unchanged.

## Recommended next step

Monitor Quality / verify and Deploy GitHub Pages / build, deploy and verify-production, then confirm the deployed revision and smoke-test the production audio player. Completion is reported with the final commit and workflow links in the task.
