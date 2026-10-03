# Phase Report — Concise Ayah Al-Kursi heading

## Objective

Apply the owner's screenshot request: display only “آية الكرسي” and align the difficult-word switch beside the passage heading. Keep this change local, without committing, pushing, or deploying.

## Scope completed

Use the existing `quran-002-255` canonical identity for the localized Reader heading. Combine the passage heading and switch in one vertically centered, direction-aware wrapping row in compact and desktop Reader compositions. Preserve reviewed text, source metadata, citations, counting, and persistence.

## Files changed

`src/app/screens/ReaderScreen.tsx`, `src/app/screens/ReaderScreen.audio.test.tsx`, `src/app/i18n/ar.ts`, `src/app/i18n/en.ts`, `e2e/reader-microinteractions.spec.ts`, `docs/DESIGN_SYSTEM.md`, and this report. Concurrent Home/keyboard-help changes belong to a separate owner request and were preserved.

## Components added or modified

Modified ReaderScreen's existing heading/switch composition; no new component or dependency.

## User-visible changes

Ayah Al-Kursi has a concise Arabic/English heading. Its word-highlighting switch sits beside it when space permits; narrow or enlarged-text layouts can wrap.

## Accessibility work

Retain native button switch semantics, accessible checked state, localized label, keyboard activation, visible focus, semantic heading order, and logical RTL/LTR alignment. Ensure a minimum 44px switch height. Automated verification does not establish complete manual accessibility compliance.

## Tests added or updated

Three collection regressions verify the concise heading, unchanged source metadata, and switch behavior. Arabic/English browser regressions verify centered/non-overlapping controls, keyboard toggling, 44px target height, and no overflow at 320, 390, 820, and 1440px; 200% text checks cover wrapping at 320px.

## Commands run

| Command                                                                                                                  | Result                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm exec prettier --write` on scoped source/test/docs files                                                            | Passed.                                                                                                                                                                                                                              |
| `pnpm test:run src/app/screens/ReaderScreen.audio.test.tsx`                                                              | Passed: one file, 16 tests.                                                                                                                                                                                                          |
| `pnpm test:e2e e2e/reader-microinteractions.spec.ts --grep 'Ayah Al-Kursi title' --project=desktop-chromium --retries=0` | Passed: two tests, 2.8 minutes; each covers four widths and enlarged text.                                                                                                                                                           |
| `git diff --check`                                                                                                       | Passed.                                                                                                                                                                                                                              |
| `pnpm check`                                                                                                             | Exit 1: final run passed toolchain, format, lint, types, build, audio manifest, type scale, bundle budget, and CSS utilities. Unit coverage could not complete because a concurrent Vitest run removed shared `coverage/.tmp` files. |

`pnpm test:coverage --coverage.reportsDirectory=output/reader-title-coverage` subsequently passed with exit 0: 173 files, 1,272 tests, and unchanged coverage thresholds, in 265.38 seconds. The separate output directory avoided the concurrent coverage deletion. All individual quality stages therefore passed, while the aggregate `pnpm check` result remains recorded accurately above.

The first regressions exposed a draft-name mismatch; the fix uses the existing canonical verse identity. Browser coverage also exposed the documented wrap fallback for the longer English label at 320px; assertions now require that fallback to stay separated and readable. No product contract or quality threshold was weakened.

## Visual/manual evidence

Browser screenshots are written to `output/playwright/reader-title/` for both languages and each width, plus enlarged text at 320px.

## Documentation updated

Updated the Reader contract in `docs/DESIGN_SYSTEM.md` and recorded this scoped report.

## Decisions recorded

The owner's explicit screenshot request authorizes the concise UI label and row alignment. It overrides the old full-surah heading presentation for this passage only. No change to reviewed religious content is authorized or made.

## Known limitations or remaining risks

Human screen-reader and real-device checks remain pending. At 200% root text size, the scoped heading/switch remains readable and contained, but the surrounding existing Reader header and counter clip text; those controls were not changed by this request. No release is requested, so release notes remain unchanged.

## Out-of-scope findings

Concurrent modifications from another local owner request were preserved.

## Recommended next step

Review the local Reader change; keep it unpushed as requested.
