# Phase Report — Shared-card hierarchy and content clarity

## Objective

Apply the owner's screenshot recommendations, proportional logo enlargement, cleaner footer, distinct translation/glossary additions and contextual single-zikr titles.

## Scope completed

Approved plan: inspect sharing contracts and reuse the existing renderer, measured layout, reviewed glossary and sharing dialog; refine visual hierarchy and language; add presets and tests; verify Arabic/English exports, full-content recovery and accessibility; integrate concurrent footer work and release together as explicitly authorized by the owner.

## Files changed

`src/app/share/shareLayout.ts`, `shareCardBrand.ts`, `collectionShareCard.ts` and their tests; `src/app/components/CollectionShareModal.tsx` and its tests; Arabic/English dictionaries; `e2e/sharing-refinement.spec.ts`; architecture, design system, quality checklist, agent decisions/index and this report. One release remediation aligns the narrow-screen guidance inset in `ZikrComponents.css` with the existing counter repair. Concurrent footer changes are recorded separately in `SHARING_FOOTER_RELEASE.md`.

## Components added or modified

Existing share brand, canvas renderer, measured layout and CollectionShareModal. Existing Select, Button and glossary helpers are reused. No dependencies or persisted fields added.

## User-visible changes

- The entire crisp vector/font logo grows proportionally from 56 to 64 export pixels.
- Single-zikr cards use “من أذكار الصباح” / “From Morning adhkar”; collection cards retain the category title. Surah reminders retain their reviewed surah name.
- Morning defaults to Olive, with explicit Gold/Lavender choices retained; crescent and website-border accents match the chosen palette.
- Reduced header/panel dead space, 16px badge-to-reading clearance, natural repetition wording, shared 28px supporting-section gaps and subtle separators.
- Citations use larger 34px type and RTL line spacing; numeric reference isolation affects canvas display only, preserving the original citation in text/ZIP.
- English translation has an explicit label. Reviewed Arabic word explanations are a separate opt-in section available only in Arabic exports and only where the shared excerpt has existing glossary entries, with the glossary attribution included.
- Arabic only, Arabic + English translation, Full detail and Custom presets preserve full content, mandatory citations and explicit incompatible-format recovery.
- The scan instruction above the centered website is removed. Ordinary QR stays optional and off by default; mandatory long-surah Mushaf QR remains with its short label immediately above the code.

## Accessibility work

Labelled native choices, keyboard-accessible preset selection above the modal overlay, independent RTL/LTR text, readable fixed-size exports, appropriate glossary availability, full semantic text alternatives, safe areas and scoped feedback remain. Physical-device compression, QR scanning and human screen-reader checks remain pending.

## Tests added or updated

Arabic/English single versus collection titles; independent translation/glossary selections and glossary attribution; English export exclusion; unchanged reviewed source data; complete glossary wrapping; Morning appearance; natural counts including 100; proportional brand scaling and removed scan text; measured 16px glyph clearance; actual preset pointer interaction and full-text recovery.

## Commands run

| Command                                                                        | Result                                                                                                                                                                                              |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`                                               | Passed; pinned pnpm 11.19.0, Node 24.21.0.                                                                                                                                                          |
| `pnpm test:run src/app/share src/app/components/CollectionShareModal.test.tsx` | Initial focused candidate passed: 8 files, 76 tests.                                                                                                                                                |
| `pnpm typecheck`                                                               | Passed before concurrent footer completion.                                                                                                                                                         |
| `pnpm check`                                                                   | Initial combined run passed toolchain/build/types/format/audio/type-scale/bundle/CSS; lint and key-integrity failures caught incomplete concurrent footer edits. No full pass claimed for this run. |
| Focused desktop/WebKit browser run                                             | Caught a new preset popup behind the overlay and the pre-existing narrow guidance inset mismatch. Both repaired; final verification follows.                                                        |

## Visual/manual evidence

Final local release gates passed: `pnpm check` completed all ten stages in 112.2 seconds; `pnpm test:e2e` passed 621 tests across five projects with one existing manual-checklist skip and no retries in 48.6 minutes; `pnpm build:pages` passed production build, bundle and CSS checks. All returned exit 0. The production audit, release-note freshness and diff checks also passed.

Final combined quality verification passed all ten `pnpm check` stages in 112.2s (exit 0). The Pages build/bundle/CSS gates, production audit (no known vulnerabilities) and release-note freshness checks passed. The repaired focused preset/card/compact-footer matrix passed all seven desktop Chromium/mobile WebKit cases without retries in 1.9m. Citation wrapping passed all 18 layout unit tests, preserving the joined reviewed payload. The full browser gate and post-push CI/production checks are tracked by the combined release owner; final logs are retained under `output/card-release-*` and `output/card-artwork-final.log`.

The exact screenshot zikr was exported again from the stable final browser build, passed its full-detail/title assertions without retries, and was visually inspected. The accepted PNG is `docs/agent/evidence/shared-card-content/morning-single-full.png`: enlarged proportional logo, readable Olive crescent, contextual title, distinct translation label, complete benefit/source, final citation kept together and no scan instruction. Responsive footer evidence is preserved under `docs/agent/evidence/sharing-footer/`.

## Documentation updated

Architecture boundary, design/spacing/glossary/QR contracts, quality checks, owner decisions and agent index. Release notes are coordinated with the combined footer release.

The final Pages build deliberately records the combined feature cost in `scripts/bundle-baseline.json`: stylesheet 166,195 bytes / 28,650 gzip bytes, initial route 154,184 gzip bytes. Against the previous baseline, these increases are 685 raw CSS bytes, 280 gzip CSS bytes and 2,351 initial-route gzip bytes. Sharing controls, localized labels, reviewed glossary selection and the combined reader fixes account for the increase. All existing absolute bundle ceilings remain unchanged.

## Decisions recorded

Owner approved all combined visual recommendations and their additions; subsequently required distinct single/collection titles and explicitly authorized integrating concurrent sharing work and releasing together. The new 16px badge gap supersedes the earlier 4px design contract.

## Known limitations or remaining risks

Arabic glossary coverage is limited to existing reviewed content; no new definitions are authored. Large combinations can require Tall or Text/Link recovery. Automated checks do not establish complete accessibility compliance. Local release gates are complete; mandatory pre-push and CI/production results are recorded in `output/RELEASE_REPORT.md` after deployment.

## Out-of-scope findings

The earlier deployment's counter-width and reduced-motion failures are handled by the existing remediation commit. Its narrow inset adjustment also needs the guidance strip to use the same inset; this phase repairs that mismatch without weakening geometry assertions.

## Recommended next step

Record actual phone sharing/compression and human assistive-technology results against the released candidate.
