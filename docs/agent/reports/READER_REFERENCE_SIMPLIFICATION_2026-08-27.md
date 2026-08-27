# Phase Report — Reader reference simplification

## Objective

Make the reader reference surface compact, visually cohesive, Arabic-safe, and limited to the supporting hadith and citation requested by the owner.

## Scope completed

The shared reader reference sheet/dialog, its labels, responsive height, localization boundaries, tests, release notes, and decision record.

## Files changed

- `src/app/components/ReaderReferenceSheet.tsx`
- `src/app/screens/ReaderScreen.css`
- `src/app/i18n/ar.ts`
- `src/app/i18n/en.ts`
- Reader accessibility, responsive, navigation, capture, and microinteraction tests
- `docs/agent/DECISION_LOG.md`
- `public/release-notes.json`

## Components added or modified

- Modified `ReaderReferenceSheet`; no new component or dependency.

## User-visible changes

- The phone drawer has one handle instead of two and sizes to its content.
- The action is named Reference/dalil instead of Benefit.
- The sheet shows only the hadith, its copy action, and its source.
- Repeated identity, benefit, timing, translation, and authenticity copy are removed.
- Arabic mode contains no English-labelled fallback content.

## Accessibility work

- Preserved the named modal, semantic level-three section headings, focus containment/restoration, Escape dismissal, 48px close/copy controls, logical RTL layout, and explicit Arabic language/direction on the hadith.
- The visible title and accessible action name now describe the remaining content accurately.

## Tests added or updated

- Updated reader hierarchy, language isolation, short-height, bottom-edge, focus, target-size, accessibility, and navigation expectations.

## Commands run

| Command                                           | Result                                                                                                |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Focused Reader unit tests                         | 4 passed                                                                                              |
| Focused Playwright reference/accessibility checks | 8 passed                                                                                              |
| `pnpm check`                                      | Passed; 632 unit tests plus typecheck, build, lint, format, audio, bundle, and CSS gates              |
| `pnpm test:e2e`                                   | 321 passed across the configured desktop, mobile, tablet, Firefox, and WebKit projects                |
| `pnpm build:pages`                                | Passed; 1,931 modules transformed, PWA generated, and the bundle and CSS utility budget checks passed |

## Visual/manual evidence

- Visually inspected at 390x844: one handle, Arabic hadith/source only, no English leakage, content-sized drawer.
- Visually inspected at 1280x800: compact centered dialog with balanced hierarchy and no unused height.

## Documentation updated

- Decision log and this phase report.

## Decisions recorded

- DEC-108.

## Known limitations or remaining risks

- Screen-reader announcement quality still requires the repository's pending real-device/manual assistive-technology pass.

## Out-of-scope findings

- None.

## Recommended next step

- Verify the deployed release on production and retain manual screen-reader review as a separate human evidence item.
