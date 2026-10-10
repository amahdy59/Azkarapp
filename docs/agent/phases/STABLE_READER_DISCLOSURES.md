# Phase Report — Stable Reader disclosures

## Objective

Apply the owner's 2026-10-09 screenshot feedback locally: tools and counting guidance must not move or resize text when toggled; refine their presentation and standardize sharing icons.

## Scope completed

Plan before editing: inspect the controlled footer and shared guidance; reserve the same natural dimensions in both disclosure states; preserve hidden-content semantics and native keyboard behavior; style controls with semantic tokens; use the existing standard Share07 export; verify geometry in both directions and refresh the local preview. This supersedes reclaiming reading space on collapse.

## Files changed

ReaderFooterTools.tsx, ZikrComponents.tsx, CounterGuidance.test.tsx, icons.ts, ReaderScreen.tsx, e2e/devotional-footer.spec.ts, domain/decision/index documentation and this report. Prior pending work is preserved.

## Components added or modified

ReaderFooterTools and CounterTapHint; shared ShareExport alias uses the same standard Share07 icon as Share2. No dependency or persistent-state change.

## User-visible changes

Hidden tools/instruction reserve their natural dimensions. Tools use a centered pill with quiet dividers and stable label width; hand guidance uses a bordered circular target. Share controls use the familiar connected-nodes symbol. No overlay, text rewrapping or automatic hiding.

## Accessibility work

Native disclosure semantics, 44px targets, visible focus, themed contrast surfaces, hidden-content exclusion and explicit activation remain. Focus mode is separate and retains its existing layout behavior. No automated-only compliance claim.

## Tests added or updated

Updated bilingual responsive browser assertions for unchanged reading height/top under both tools and hand toggles; retained item-choice/count/focus/axe assertions. Eight component tests passed.

## Commands run

| Command                        | Result                                                                                                           |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| Targeted component tests       | 8 passed, 19.20s.                                                                                                |
| Cross-browser disclosure tests | 24 passed across Chromium, Firefox and WebKit in 4.4 minutes; unchanged reading height/top for both disclosures. |
| `pnpm check`                   | Exit 0, 118.5s: full coverage/content/type/lint/format/bundle gates passed.                                      |
| Pages build / preview refresh  | Exit 0; local tested build refreshed at localhost:5174, HTTP 200 verified.                                       |

## Visual/manual evidence

Responsive browser images under output/footer-tools/stable-evidence. Inspect the updated local preview before approving publication. Physical-device and human screen-reader review remain separate.

## Documentation updated

Design System, Architecture, decision log, phase index and this report record the superseding stable-geometry contract.

## Decisions recorded

All changes local for owner feedback. No commit, push, release notes or deployment.

## Known limitations or remaining risks

Collapsing reduces visual clutter but deliberately retains empty layout space to prevent text movement. Separate focus mode can still change layout. Guidance refinements apply to the existing shared counters as well as Reader.

## Out-of-scope findings

No reviewed content, Quran layout, sharing artwork, audio behavior or persisted schema changes.

## Recommended next step

Owner review of the refreshed local preview.
