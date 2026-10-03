# Phase Report — 77 Header scroll containment

## Objective

Fix scrolling content showing through or above ordinary screen headers, including the owner's Quran Wird screenshot. Keep this change local; no commit, push, or deployment is requested.

## Scope completed

Inspected the shared Header, ScreenContainer, screen and nested scroll owners, Settings, Progress, Quran Wird, Friday, Qibla, and Home. The ordinary header used a transparent resting surface and a 95% opaque blurred scrolled surface. Direct-child sticky headers also left the container's top padding exposed above the stuck header. Use an opaque semantic background throughout and move direct-child top spacing into the header. Preserve scroll divider/shadow and the separate documented Home photographic overlay.

## Files changed

- `src/app/components/LayoutShells.tsx`
- `src/app/components/LayoutShells.test.tsx`
- `src/styles/theme/surfaces.css`
- `e2e/responsive.spec.ts`
- `docs/DESIGN_SYSTEM.md`
- `docs/agent/DECISION_LOG.md`
- `docs/agent/INDEX.md`
- This phase report and screenshot evidence.

## Components added or modified

Modified the existing shared Header and the direct-child ScreenContainer CSS contract. No component, runtime dependency, persistence, content, or routing change.

## User-visible changes

Scrolling content is covered by the ordinary header's solid theme surface. Quran Wird and Qibla no longer expose a strip above the sticky header. Friday and other nested scrolling screens retain fixed header access. Header actions, title, navigation, and scroll feedback remain available.

## Accessibility work

Stable opaque header contrast in Light, Midnight, and Dark themes, with no reliance on backdrop-filter support. Preserve keyboard order, focus indicators, localized headings, 44px actions, reduced-motion preferences, and the shell's safe-area ownership. Arabic/English and browser geometry checks supplement existing accessibility scans; they do not establish full manual WCAG compliance.

## Tests added or updated

Updated the Header unit regression to require an opaque background before, during, and after nested scrolling. Updated the Progress browser regression and added Quran Wird/Qibla/Friday coverage across three themes, Arabic/English, desktop/tablet/phone Chromium, desktop Firefox, and mobile WebKit. Verify real scrolling, divider activation, opaque background parity, no blur, and the header flush with the screen's top edge.

## Commands run

| Command                                                           | Result                                                                                                                                                                                                                                                         |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm test:run src/app/components/LayoutShells.test.tsx`          | PASS, 2 tests                                                                                                                                                                                                                                                  |
| `pnpm test:e2e e2e/responsive.spec.ts --grep headers --retries=0` | PASS, 13 scenarios, 5.1 minutes; initial phone-width checks                                                                                                                                                                                                    |
| `pnpm check`                                                      | PASS, all ten stages, 515.0 seconds                                                                                                                                                                                                                            |
| `pnpm build:pages`                                                | PASS, build/PWA/bundle/CSS gates                                                                                                                                                                                                                               |
| `E2E_BASE_URL=http://127.0.0.1:4175 pnpm test:e2e`                | NOT GREEN: 441 passed, 1 flaky, 1 skipped, 1 failed, 28.7 minutes. All header regressions passed. Failure: concurrent temporary `page-grid-verify.spec.ts`, subsequently removed by the other work; WebKit navigation passed on retry.                         |
| Focused final adaptive-width checks against frozen preview        | Phone/tablet/Firefox/WebKit: 8 passed; desktop startup raced server readiness (2 connection-refused failures), then desktop-only rerun passed 2/2 without retries. Earlier focused run against the crashing shared preview had 10 connection-refused failures. |
| Scoped Prettier check and `git diff --check`                      | PASS                                                                                                                                                                                                                                                           |

## Visual/manual evidence

Scrolled Arabic Quran Wird phone and English tablet screenshots visually inspected: header covers the top edge and cards disappear below its opaque surface. Saved evidence: `../evidence/phase77/wird-scrolled-ar-phone.png`, `../evidence/phase77/wird-scrolled-en-tablet.png`, and `../evidence/phase77/wird-scrolled-ar-desktop.png`.

## Documentation updated

Design system documents ordinary-header opacity and top-edge coverage. Decision log records DEC-216-H and local-only authority; index links this report. Release notes remain unchanged because this is not a deployment.

## Decisions recorded

DEC-216-H records the owner's requested scroll repair and prohibition on pushing. The small shared change is confined to this repair, without implementing another roadmap phase.

## Known limitations or remaining risks

Physical-device notch/cutout and assistive-technology checks remain manual. Home deliberately retains its existing controlled photographic glass contract. Changes remain uncommitted and undeployed.

Other local work began modifying unrelated picker, Mushaf navigation, localization, and state files during verification. Those edits are preserved and excluded from this phase's scope. Browser verification uses the frozen production build containing this header repair; it does not certify later concurrent changes.

The full-suite failure is in the concurrent temporary page-grid test, whose expected navigation redesign was absent from the frozen build. That test no longer exists in the working tree. Existing WebKit navigation timed out on its first attempt and passed on retry. No assertions, timeouts, coverage thresholds, or checks were weakened, and no unrelated changes were made to turn the suite green. The full command is reported as failed despite the header-specific matrix passing.

## Out-of-scope findings

No additional application behavior change was needed. The quality gate's existing hosted-audio range probes took 298.5 seconds and passed. Two browser attempts were stopped after the local Vite preview exited: the captured server error was an `ENOENT` reading a local image, followed by connection-refused failures. Concurrent work was also rebuilding the shared preview directory. Verification resumed using a frozen copy of `.playwright-dist` outside the synchronized workspace on port 4175; no repository test/server policy was weakened.

## Recommended next step

Review the local fix on the owner's installed device before authorizing any release.
