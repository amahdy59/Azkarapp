# Phase Report — Home card alignment

## Objective

Align desktop/tablet Home cards with the top prayer cards, locally only.

## Scope completed

Inspection found the summary's 52rem cap inside a 64rem frame, while lower cards filled that larger frame. Plan: share the narrower measure, include responsive gutters and the summary's focus inset, preserve phone layout, add geometry regressions and capture screenshots.

## Files changed

HomeScreen.tsx; home-wird.css; home-clarity.spec.ts; DESIGN_SYSTEM.md; DECISION_LOG.md; INDEX.md; this report. Existing unrelated pending changes remain.

## Components added or modified

HomeScreen composition and its existing stylesheet; no new component or dependency.

## User-visible changes

At 600px and wider, the expanded prayer panel, context pair, Wird and lower sections follow the outer prayer-card edges. The utility header follows the same frame. Phone geometry is unchanged.

## Accessibility work

Preserve semantic DOM order, keyboard focus inset, full card actions, native scrolling, direction and existing material fallbacks. No new interaction or copy.

## Tests added or updated

Bilingual exact-edge geometry at 600, 820, 1024, 1440 and 1920px with expanded prayer details and lower-section coverage; screenshot evidence.

## Commands run

| Command                                                                                                               | Result                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm exec prettier --check src/app/screens/HomeScreen.tsx src/app/components/home-wird.css e2e/home-clarity.spec.ts` | PASS                                                                                                                                                                                                                                                                                                                                                            |
| `pnpm exec eslint src/app/screens/HomeScreen.tsx e2e/home-clarity.spec.ts --max-warnings 0`                           | PASS, exit 0                                                                                                                                                                                                                                                                                                                                                    |
| `pnpm check`                                                                                                          | FAIL, exit 1 in 565.5s: lint flags PrayerProgressSummary.tsx:70 noninteractive tabIndex; unit suite has 5 failures in ProgressScreen.wirdGoal.test.tsx (287 files/2035 tests passed). A ReadingScreenChrome worker termination timeout was also emitted. Typecheck, format, build, bundle budget, CSS utilities, audio/timing/content and motion checks passed. |
| Alignment browser regression, Chromium/Firefox/WebKit                                                                 | PASS: 30 tests across Chromium, Firefox and WebKit in 8.5m; exit 0.                                                                                                                                                                                                                                                                                             |

Initial Chromium run passed 8 cases and exposed a new test error at 600px: it compared the complete overflowed card set with the visible viewport. The corrected regression compares the visible prayer-row aperture, preserving its existing native horizontal browsing. No application behavior or existing assertion was weakened.

## Visual/manual evidence

Desktop (1440px) and tablet (820px) Arabic Glass screenshots were visually inspected: disclosure, context pair and Wird outer edges follow the prayer row. Durable evidence: output/home-card-alignment-2026-10-18/desktop-ar.png and tablet-ar.png. Tests capture each language and viewport under test-results.

## Documentation updated

Design system, decision log, index and this report.

## Decisions recorded

The owner's requested desktop/tablet alignment supersedes the older 64rem outer measure. Local-only scope; release notes unchanged.

## Known limitations or remaining risks

Shared workspace contains other pending changes; its full gate is not green because of the separately modified Progress components/tests above. Those files were not changed by this phase. Automated emulation does not establish physical-device or assistive-technology acceptance.

## Out-of-scope findings

Pending Reader, Progress and material refinements remain outside this change.

## Recommended next step

Review the local layout; publication requires a later owner request.
