# Phase Report — Routine-card frost reference

## Objective

Use the owner's supplied Home morning-routine card as the ordinary Glass material benchmark throughout the application. Local changes only; nothing committed, pushed or deployed.

## Scope completed

Inspection confirmed ordinary Home and interface cards already shared 24% navy tint and stationary 22px/135% frost. The remaining ordinary interface mismatch was the brighter reflection. Interface cards now use the routine card's 5.5%/1.2% white gradient stops. Shared tokens own reflection stops and ordinary/hover edges, alongside the existing shared tint, frost and shallow shadow.

## Files changed

This phase changes src/styles/theme/tokens.css, src/styles/theme/materials.css and src/app/components/home-wird.css; adds e2e/card-frost-reference.spec.ts; and updates the design system, decision log, index, phase brief and this report. These files already contain separately authorized pending local work, which is preserved. Their total Git diff includes that earlier work.

## Components added or modified

No component API or markup changes. Existing HomeCard, Card, CategoryCard and explicitly owned feature surfaces consume the shared material recipe through CSS.

## User-visible changes

Ordinary interface cards have the same calmer reflection as the reference Home card. Reading surfaces, scrolled headers, overlays, flat elevation and selected prayer emphasis retain their existing hierarchy. Buttons and fields do not receive extra blur layers.

## Accessibility work

Preserve high-contrast, opaque, forced-color, unsupported-filter and independent App/Home behavior. Browser coverage compares ordinary card material against the live routine card, scans core pages with axe and checks horizontal overflow at Arabic phone and English desktop sizes. These checks do not certify human assistive-technology or physical-device performance.

## Tests added or updated

New browser coverage compares computed tint, reflection and frost for ordinary Home, Library, Progress and Appearance cards; requires loaded scene imagery; verifies opaque/high-contrast recovery and return to Glass; and captures actual screenshots. Existing reading/overlay parity cases additionally verify the deliberate contrast hierarchy.

## Commands run

| Command                                                                                                                                             | Result                                                                                                                                                                                                                                                         |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Scoped Prettier write/check                                                                                                                         | Passed                                                                                                                                                                                                                                                         |
| Initial new Chromium comparison                                                                                                                     | 2 failed: test selector included a transparent Home section wrapper; corrected to require actual hero-glass surfaces.                                                                                                                                          |
| New comparison plus selected existing parity cases, Chromium                                                                                        | 2 existing parity cases passed; 2 new cases failed because the test left the document in Solid after its fallback check before SPA navigation. Corrected test cleanup restores Glass and verifies it. One failed trace also reported an artifact unlink error. |
| pnpm test:e2e e2e/card-frost-reference.spec.ts --project=desktop-chromium --project=desktop-firefox-smoke --project=mobile-webkit-smoke --workers=1 | 6 passed, 3.6m                                                                                                                                                                                                                                                 |
| pnpm check                                                                                                                                          | Passed all stages, 305.3s; unit coverage, build, lint, types, format, content/timing validation and unchanged bundle/CSS budgets.                                                                                                                              |

Browser inventory: pnpm test:e2e:inventory passed with 1,899 cases assigned exactly once across nine shards.

## Visual/manual evidence

Actual browser screenshots are saved under output/playwright/card-frost-reference, grouped by engine. Phone Home and Library images were visually inspected, and the Library preview was shared in chat. The material retains soft scene visibility, white text and restrained rims. All six reference cases passed across Chromium, Firefox and WebKit. Desktop Progress and Appearance screenshots were also visually inspected.

## Documentation updated

docs/DESIGN_SYSTEM.md, docs/agent/DECISION_LOG.md, docs/agent/INDEX.md and docs/agent/phases/CARD_FROST_REFERENCE_2026_10_18.md record the benchmark and local-only scope.

## Decisions recorded

The supplied routine-card surface is the ordinary material reference. Consistency means shared material tokens while preserving semantic selected states and stronger reading/overlay contrast. No release notes are changed for an unpublished local preview.

## Known limitations or remaining risks

Physical Safari blur rendering and human screen-reader acceptance remain unverified. Earlier Windows WebKit diagnostics already documented that computed blur can exist without visible native rendering on this host. Matching filter assertions alone do not establish physical Safari appearance. No application data, reviewed content, dependencies or deployment configuration changed.

## Out-of-scope findings

Existing pending prayer selection, compact-card and scrolling refinements remain intact.

## Recommended next step

Review the local Glass previews on the owner's device before any separately authorized publication.
