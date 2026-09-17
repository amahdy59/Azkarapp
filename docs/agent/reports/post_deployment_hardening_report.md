# Phase Report — Post-deployment release hardening

## Objective

Confirm the deployed Quran remediation release, audit the application and its release seams for remaining blockers, and implement only verified reliability and accessibility improvements.

## Scope completed

- Confirmed local `main`, `origin/main`, the successful Quality workflow, the successful Pages workflow, and live production all began on commit `e486633`.
- Reviewed the shipped Quran changes plus shared navigation, dialog, reduced-motion, persistence, PWA, offline, dependency, secret, bundle, and deployment boundaries.
- Contained the expected animation-level rejection produced when a browser skips a View Transition without hiding destination-update failures.
- Made the shared transition boundary safe when an embedded browser does not implement `matchMedia`.
- Removed invented dialog and drawer descriptions that repeated the accessible title while preserving caller-owned descriptions.
- Replaced the deployed release-note manifest with bilingual notes for only this hardening release.

## Files changed

- `src/app/utils/viewTransitions.ts` and its new regression test
- `src/app/components/ResponsiveSheet.tsx` and its new regression test
- `docs/DESIGN_SYSTEM.md`
- `docs/MOTION_SYSTEM.md`
- `docs/agent/DECISION_LOG.md`
- `public/release-notes.json`

## Components added or modified

- Modified the shared screen-transition utility.
- Modified the shared desktop modal and compact responsive-sheet primitive.
- Added focused unit coverage for both shared boundaries.

## User-visible changes

- Navigation remains reliable when a browser declines or aborts an optional transition animation.
- Reduced-motion and older embedded-browser paths no longer depend on `matchMedia` being available.
- Dialog and action-sheet titles are announced once instead of being repeated as their own description.

## Accessibility work

- Preserved reduced-motion bypass behavior.
- Removed redundant accessible descriptions from both centered dialogs and compact drawers.
- Preserved explicit descriptions used by the Ayah, Quran word-meaning, and reader-reference surfaces.
- Re-ran automated WCAG A/AA dialog and Quran-surface scans across desktop, mobile, and tablet projects. Automated results do not replace a named human screen-reader session.

## Tests added or updated

- Added reduced-motion, missing-`matchMedia`, and rejected-transition-readiness unit tests.
- Added accessible dialog-name and caller-owned-description unit tests.
- Re-ran focused Quran, accessibility, PWA-update, and offline browser coverage.

## Commands run

| Command                          | Result                                                                                   |
| -------------------------------- | ---------------------------------------------------------------------------------------- |
| `git fetch origin main`          | Passed; local and remote started at `e486633`                                            |
| `gh run list --limit 8`          | Confirmed successful Quality run `32751048544` and Pages run `32751047413` for `e486633` |
| Focused Vitest suites            | Passed: 7/7                                                                              |
| Focused Chromium browser suites  | Passed: 7/7                                                                              |
| `pnpm audit:prod`                | Passed: no known production vulnerabilities                                              |
| `pnpm install --frozen-lockfile` | Passed; lockfile already up to date                                                      |
| `pnpm check`                     | Passed after the final code and documentation state                                      |
| `pnpm test:e2e`                  | Passed: 312/312 across the full matrix                                                   |
| `pnpm build:pages`               | Passed; Pages build, bundle budget, and CSS utility checks succeeded                     |
| `pnpm run check:release-notes`   | Passed; the manifest describes the commits waiting to deploy                             |

## Visual/manual evidence

- Inspected the live English Home and Quran resume state before editing.
- Reproduced the optional View Transition timeout during successful live navigation in the production browser session.
- Confirmed the deployed Ayah surface contained the duplicated hidden title/description text that the shared primitive generated.
- Full Playwright evidence included the Quran reader, dialogs, reduced motion, offline install, update prompt, RTL, keyboard, zoom, responsive, Firefox-smoke, and WebKit-smoke paths.

## Documentation updated

- `DESIGN_SYSTEM.md` now prohibits repeating a dialog title as its description.
- `MOTION_SYSTEM.md` records View Transitions as progressive enhancement and preserves callback-error observability.
- DEC-101 records the post-deployment decision and acceptance evidence.

## Decisions recorded

- Contain only the animation-level `ready` rejection; do not swallow DOM-update or callback failures.
- Keep descriptions caller-owned and meaningful; a title alone is valid when no separate description adds context.
- Do not add features or unrelated refactors when the release scan finds no evidence for them.

## Known limitations or remaining risks

- Automated accessibility coverage is green, but NVDA, VoiceOver, and TalkBack remain manual evidence activities.
- Optional QCF fonts still depend on the existing remote-font/cache fallback contract; canonical local Unicode remains available when a font cannot load.

## Out-of-scope findings

- No dependency, tracked-secret, state-normalization, release-workflow, bundle, Quran-content, or offline-core blocker was found.
- No reviewed religious content, provider configuration, router architecture, or persistence schema was changed.

## Recommended next step

Deploy this scoped hardening release, verify the new commit and release-note stamp in production, then retain the same evidence-first boundary for future improvements.
