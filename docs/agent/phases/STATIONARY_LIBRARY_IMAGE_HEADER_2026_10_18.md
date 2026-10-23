# Phase Report — Stationary Library image header

## Objective

Apply the owner's unchanged image-backed header idea to the pictured Azkar Library locally. No commit, push or deployment.

## Plan before editing

Keep title/search/filter controls outside a bounded collection list viewport. Remove Library scroll elevation ownership; retain the scene and transparent header, opaque/accessibility fallbacks and keyboard semantics. Add short-height recovery, update browser regression coverage, run targeted tests and the non-browser gate, and inspect responsive evidence. Preserve unrelated pending changes.

## Scope completed

Library uses a bounded flex layout instead of a viewport-minimum wrapper that could scroll the full screen. Only the list below the header scrolls. The header does not change material while browsing. Short-height or enlarged controls have their own bounded native scroll area.

## Files changed

AzkarLibraryScreen.tsx, AzkarLibraryScreen.css, e2e/glass-refinement.spec.ts; architecture, design system, decision log, agent index and this report.

## Components added or modified

Existing AzkarLibraryScreen composition and header; no new component or dependency.

## User-visible changes

The photograph remains visible through the stationary Library header. Collection cards scroll below the controls without frost appearing.

## Accessibility work

Preserve native tabpanel focus, semantic control order, focus rings and opaque/high-contrast recovery. Browser coverage checks keyboard End reaches the list end without displacing the header and runs scoped axe scans. Short control areas independently scroll. No human assistive-technology acceptance is claimed.

## Tests added or updated

Library browser assertions now require a separate list viewport, invariant header geometry/material after scrolling, keyboard access to the final list content and high-contrast fallback. Other routes retain existing scroll-elevation assertions.

## Commands run

- pnpm test:run src/app/screens/AzkarLibraryScreen.test.tsx — passed, 1 file / 14 tests.
- pnpm test:e2e e2e/glass-refinement.spec.ts --project=desktop-chromium --project=desktop-firefox-smoke --project=mobile-webkit-smoke --grep "scroll ownership azkar" (E2E_PORT=4207) — passed, 6 tests / 42.1s, exit 0.
- pnpm test:e2e e2e/responsive.spec.ts --project=desktop-chromium --grep Library — passed, 3 tests / 3.5m, exit 0; includes Arabic/English, 320/390px, 100–200% text and desktop controls.
- pnpm check --serial — exit 1, 423.7s: 2071 unit tests passed and 4 sharing/isolation assertions failed. All other stages passed: toolchain, production build, types, lint, formatting, audio/Quran/listening/owner-timing integrity, type scale, motion, bundle budget and CSS utilities. Log: output/stationary-library-quality.log. No green full-gate claim.
- git diff --check — passed, exit 0.

## Visual/manual evidence

Resting/scrolled Arabic phone (390px) and English desktop (1440px), at 520px height, captured across all three tested engines in output/playwright/glass-refinement/header-consistent/. Inspected the Chromium phone and desktop scrolled images: photograph stays visible through the controls, list is clipped below the header, native keyboard focus remains visible. Keyboard End reaches the list bottom without header displacement.

## Documentation updated

Architecture, design system, decision log, agent index and this report.

## Decisions recorded

Owner's no-push instruction supersedes standing release authority. This focused implementation applies to the pictured Library; other screen headers retain their existing contracts.

## Known limitations or remaining risks

Physical-device and human assistive-technology checks remain pending. Full-suite unit verification found 4 failures in 3 sharing/test-isolation files outside this header change: curatedRoutineCards mock-isolation registration, missing image.decode in its test environment, clipboard success assertion, and curated-card rendering in CollectionShareModal. 2071 tests passed across 293 passing files. These files were already being changed independently; no clean-baseline reproduction is claimed. Existing unrelated working-tree changes are preserved. Owner explicitly requested session coordination. Reported exact failures to Review session for improvements and Fix highlight area and sidebar, asking the owning sessions to coordinate repair and avoid duplicate full gates. This phase does not change their sharing code.

## Out-of-scope findings

No release notes, content, persisted state, synchronization or deployment changes.

## Recommended next step

Review the local Library interaction. Coordinate the outstanding sharing/isolation repairs with their owning session, then use one full gate on a stable combined working tree. Decide separately whether to extend this layout to other screen headers.
