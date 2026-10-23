# Phase Report — Compact devotional title rows

> Verification update, 2026-10-18: the later combined `output/playwright/seamless-quality.log` passed the complete non-browser gate, including unit coverage, lint, types, formatting and bundle checks. Earlier failures and pending-gate statements below are historical. Subsequent gap fixes have their own report: [Session gap closure](SESSION_GAP_CLOSURE_2026_10_18.md). Physical-device and human assistive-technology acceptance remain pending.

## Objective

Apply the owner's screenshot correction locally: collection titles share the top control row, progress moves upward and all similar devotional heroes become shorter. Implemented locally; no commit, push or deployment.

## Scope completed

Inspection found separate h1 rows in ReaderScreen and ReadingScreenChrome despite the earlier alignment request. The plan was to share one centered toolbar, retain native responsive wrapping and existing controls, tighten standalone progress spacing, update regression geometry and capture bilingual tablet/desktop evidence. No planning gate was requested.

## Files changed

ReadingHeroToolbar.tsx (new); ReadingScreenChrome.tsx; ReaderScreen.tsx; compact-reading-headers.spec.ts (new); reader-header-refinement.spec.ts; reader-guidance-layout.spec.ts; DESIGN_SYSTEM.md; DECISION_LOG.md; INDEX.md; this report. Existing pending edits are preserved.

## Components added or modified

ReadingHeroToolbar supplies equal side tracks around the centered h1, shared by ReaderScreen and ReadingScreenChrome. No dependency or state boundary changes.

## User-visible changes

Collection titles now align vertically with toolbar buttons. Progress immediately follows that row, reclaiming the separate title row and gap. Masbaha and Salawat use the same anatomy with a 4px internal progress/selector rhythm. Formula and target selectors remain visible. Phone headers retain their existing layout.

## Accessibility work

Preserve h1 semantics, logical Back/actions focus order, 44px targets, focus rings and localized controls. Titles wrap without truncation; actions wrap at enlarged text sizes. Browser checks cover RTL/LTR and 200% text. Automated accessibility results do not establish complete manual compliance.

## Tests added or updated

Shared toolbar/title/control alignment, centered title with unequal action counts, non-overlap, hero density, progress position, target sizes, enlarged-text overflow and scoped axe checks across collections, prayer supplications, Masbaha and Salawat. Existing Reader geometry checks now enforce the requested shared row.

## Commands run

| Command                                                                                                   | Result                                                                                    |
| --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| pnpm test:run src/app/components/ReadingScreenChrome.test.tsx src/app/screens/ReaderScreen.audio.test.tsx | 2 files, 26 tests passed                                                                  |
| Focused browser checks on port 4198                                                                       | Server startup refused because the port was already occupied; no existing process stopped |
| Focused browser checks on unused port 4279                                                                | In progress                                                                               |
| pnpm check                                                                                                | Pending                                                                                   |

## Visual/manual evidence

Browser captures are in output/playwright/compact-reading-headers and the existing Reader guidance/header evidence folders. Inspected Arabic desktop Morning Reader, Masbaha and Salawat captures: title/control centers align, progress is directly below, artwork stays bounded and selectors remain visible. Reader hero measures 96px versus its previous 127px (31px reclaimed).

## Documentation updated

Design contract, owner decision, phase index and this report.

## Decisions recorded

The owner explicitly requests local-only global devotional title alignment, superseding the separate wide-header title row. Preserve all unrelated pending work.

## Known limitations or remaining risks

Long/enlarged titles can increase header height deliberately to avoid clipping. Human assistive-technology and physical-device acceptance remain separate. Full quality checks include the pre-existing shared working tree.

## Out-of-scope findings

No content, persistence, audio, prayer calculations, release notes or deployment changes. Existing pending Home, prayer, Progress and material work remains outside this phase. Full-gate failures belong to the concurrently modified Progress surface and its older Wird-goal assertions; do not modify those under this header phase. Per AGENTS.md stop conditions, request an owner decision before expanding into that unrelated remediation.

## Recommended next step

Review the local responsive result. Before expanding scope, obtain the owner's decision on the unrelated concurrent Progress lint/unit failures required by the repository stop condition. Further artwork or control styling can be reviewed separately after this spacing correction.
