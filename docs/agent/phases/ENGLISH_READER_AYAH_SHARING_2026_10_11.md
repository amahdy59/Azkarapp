# Phase Report — English reader and ayah sharing refinement

Publication follow-up: the owner's later “push all changes after completion” instruction supersedes this report's historical local-only hold. Combined verification and release results are recorded in [the combined release report](COMBINED_REFINEMENTS_RELEASE_2026_10_12.md).

## Objective

Apply the owner's approved UX, accessibility, visual-design and performance recommendations for English Quran reading, the share-ayah dialog, and exported cards. Local only: no commit, push, deployment or release-note edits.

## Scope completed

Latest owner follow-up: place surah/juz at opposite header ends, move page into the source footer, reduce compact padding and number gutter, and reuse verified Mushaf glyphs in action/share text and image exports. Plan: preserve independent reading/paired geometry and exact semantic copy text, reuse existing cached page/font and glyph components, then verify narrow/enlarged/desktop layouts and actual PNGs. No publication is authorized.

Further card follow-up: center shared card/preview text only, fit complete Ayat al-Kursi together and expose bounded user text sizing. Plan: use measured 48–72px Arabic with a default automatic fit option, retain a minimum 36px English/30px meaning size, verify complete Arabic reconstruction and ink capacity, then inspect actual portrait/square exports. Sizes and fit choices stay transient. Exceptionally long content still uses explicit complete continuations if it cannot fit within the readable floor; no arbitrary shrinking or omission.

Plan before editing: retain the recent approved reader geometry, scalable type, independent English scrolling and follow controls; improve heading/metadata readability; reorganize sharing around the preview with fixed header/actions and one scroll body; clarify content, format and sharing scope; align translation identity with the reader; improve card typography/header balance; add asynchronous PNG encoding and cancellable generation; verify content reconstruction, interaction, browser geometry and exports.

## Files changed

- `src/app/components/AyahShareStudio.tsx`, `ayah-share-studio.css`, `AyahInteractionSheet.tsx`, `QuranPageTranslationPanel.tsx`, and `QuranTranslationText.tsx`.
- `src/app/share/ayahShareCard.ts`.
- `src/app/components/AyahMushafText.tsx`, `src/app/share/ayahMushafRendering.ts` and its regression tests, `src/app/screens/KhatmahReaderScreen.tsx`, the listening translation CSS and isolated test registry.
- `src/app/i18n/ar.ts` and `en.ts`.
- `AyahShareStudio.test.tsx`, `QuranPageTranslationPanel.test.tsx`, `ayahShareCard.test.ts`, `e2e/ayah-image-sharing.spec.ts`, and `e2e/ayah-sharing-offline.spec.ts`.
- Architecture, design system, agent index, decision log, and this report.

## Components added or modified

Reused ResponsiveSheet, Button, official icons, existing translation loader/cache, share dispatcher and ZIP archive. Added only scoped studio CSS. No runtime dependency, persistence field, synchronization change, canonical text edit or application-shell replacement.

## User-visible changes

Owner follow-up implemented on 2026-10-12: tighter 0.375rem paragraph gaps and 0.125rem block padding; surah heading with grouped page/range metadata; removed redundant visible translation title and attribution prefix; quiet header/footer dividers. Mobile sharing preview height is reduced to 34dvh (45dvh wide), keeping more settings visible, and Previous/Next labels wrap in bounded columns. Exact devotional and translation content remains unchanged.

The preview appears before customization. Close/Back and export actions stay outside the single scrolling body. Wider dialogs pair preview with options. Short windows or enlarged text leaving under 120px for the body use one scroll surface for the whole dialog, keeping all controls reachable. Portrait/Square show ratios; optional Arabic explanations are explicitly named. Loading/unavailable translation and retry are visible. Cards use the same reviewed Saheeh International meaning as the Quran reader, with its attribution, instead of silently selecting a different stored passage translation. Back/reopening within the mounted ayah flow retains transient options. Complete selectable/copyable text includes the reference and selected sources. Multi-card sharing names the full set; individual saving names the displayed card. Unsupported native sharing explicitly offers PNG saving or one ZIP containing all ordered cards and matching text. Cancellation never downloads automatically and handoff/download-start feedback makes no recipient/save claim.

Exports retain cream/olive/gold styling with one frame, a smaller header footprint, 64px Arabic and larger 46px English, 32px section labels, bounded centering, repeated references/section attribution and continuation numbering. Complete reviewed text is preserved at fixed type sizes across measured continued cards.

## Accessibility work

Native labelled radios/checkboxes with full-row targets, visible focus and non-color selection indicators, named modal/focus recovery, explicit language/direction, scoped status/error announcements, readable text alternative, safe-area actions and resize recovery. Focused controls scroll into the active scroll surface, including Firefox and layout transitions; body resize also schedules recovery after late font/content reflow, with frame/observer cleanup covered by regression tests. English fieldsets and long option labels wrap within 320px at 200% text. Existing 18/20/24px reader type, 1.65 leading, fixed number gutter, bounded measure and manual-follow recovery remain. Native keyboard listeners bind before paint so initial keyboard following behavior is available immediately. Physical screen-reader and device checks are not certified by automation.

## Tests added or updated

Regression coverage for stale preview export rejection, superseded work cancellation, object-URL cleanup, asynchronous encoding failure, translation retry and source identity, full-set sharing/current-card saving, native failure without automatic downloads, and complete text copying. Pure layout tests retain exact reconstruction and ink/capacity limits with larger English type. Browser checks cover both UI languages, portrait/square PNGs, fixed actions/header, 320px/200% text in all themes, desktop/short-window presentation, focus return and axe scans. An offline reload verifies the cached reader translation and PNG export. Continuation previews and complete ZIP exports are retained for visual review.

## Commands run

Latest surah/juz/gutter and Mushaf-font follow-up: scoped ESLint/typecheck/Prettier exit 0; seven targeted suites pass 32/32; production/PWA build and bundle/CSS gates exit 0. Chromium reader/share checks pass 14/14 (3.9m), including both UI languages, 320–430px, 200% text, keyboard geometry, exact semantic Arabic and real exports. The first browser attempt exposed two outdated assertions (RTL flex-box geometry and hidden glyph characters); corrected checks retain explicit opposite-edge positions and unchanged semantic content.

Centered card and sizing follow-up: four targeted suites pass 24/24 (43.18s), typecheck/scoped ESLint exit 0. Centered-card production/PWA build, bundle/CSS and scoped Prettier exit 0. Sharing browser suite passes 4/4 (3.6m), plus fresh English sizing/export evidence 1/1 (1.5m): whole Ayat al-Kursi is one card, range keys exercise 75–112.5% and fitting, portrait/square exports and complete ZIPs remain, enlarged text/all themes/short windows and axe pass. An intermediate build lacked the fit hint's wrapping copy and Arabic enlarged text overflowed; the completed hint build passes the unchanged overflow assertion. Final visual inspection found single-card reference/website overlap; reserved another 12px of body clearance and moved footer rows apart. Renderer tests pass 7/7 (11.97s); fresh build exits 0. Full release limitations below remain; no commit/push/deploy or release-note edit.

Follow-up verification: `pnpm typecheck` exits 0; scoped ESLint and Prettier exit 0; reader panel tests pass 5/5 after updating Arabic/English heading expectations; related listening/studio tests passed 12/12 during the same targeted run (the superseded heading expectation was the only initial failure). `pnpm build --outDir output/english-reader-polish-preview` exits 0; bundle and CSS checks both exit 0. Reader layout browser suite passes 10/10 with no skips/flakes, including header/source and 6px gap assertions, 320–430px widths, 200% text, independent keyboard scrolling and axe checks. Sharing browser suite passes 4/4 in both languages, covering complete PNG/ZIP exports, 320px/200% text in three themes, short windows, focus return and axe. Actual mobile screenshots were inspected: header/reference fixed, preview bounded, 44px continuation controls, clear option groups and bottom actions. A fresh ready-state options capture follows. The earlier full-check formatting limitation and incomplete WebKit release verification remain; no full-release compliance claim.

| Command                                                             | Exact result                                                                                                                                                                                                               |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Targeted Vitest, six feature files                                  | Exit 0: 6 files, 28 tests passed (38.92s final run).                                                                                                                                                                       |
| Reader panel/listening Vitest after keyboard binding repair         | Exit 0: 2 files, 9 tests passed.                                                                                                                                                                                           |
| Scoped ESLint, changed source/tests/browser specs                   | Exit 0.                                                                                                                                                                                                                    |
| Scoped Prettier source/test check                                   | Exit 0; all matched files formatted.                                                                                                                                                                                       |
| `pnpm build:pages`                                                  | Exit 0; Pages build, bundle budget and CSS checks passed.                                                                                                                                                                  |
| Final isolated `pnpm build --outDir output/ayah-accessible-preview` | Exit 0; production/PWA build, 208 precached entries.                                                                                                                                                                       |
| Bundle/CSS checks against final isolated output                     | Both exit 0; unchanged ceilings.                                                                                                                                                                                           |
| Latest `pnpm check`                                                 | Exit 1 (489.2s): unit tests with coverage, typecheck, lint, build, content/timing/type/motion and bundle/CSS checks passed; format failed only on concurrent `docs/agent/phases/MUSHAF_COMPACT_TRANSLATION_2026_10_11.md`. |
| Chromium offline and reader layout specs against complete preview   | Exit 0: 7 tests passed (2.7m), including offline export and six reader checks.                                                                                                                                             |
| Earlier Chromium image sharing and reader layout verification       | Exit 0: 8 tests passed (3.3m). Superseded visual evidence identified and repaired enlarged-text header/action layout.                                                                                                      |

Initial full-check run (before concurrent geometry tests were updated) also failed formatting and three unrelated Mushaf/verse style assertions: 1719 passed, 3 failed. The later full unit run passed. Browser downloads initially stalled on repeated continuation saves; continuation preview capture and one complete ZIP retain review evidence while PNG saving is still verified for both formats. A trial fetch of preview blobs was blocked by the existing CSP and removed from the test; no CSP change was made. Final Chromium/Firefox result: 8 tests passed (3.9m), split into export and responsive/accessibility cases while preserving assertions/timeouts. Latest WebKit responsive run: 2 tests timed out; Arabic remained in the application loading fallback before opening the studio, and English passed focus/overflow checks but timed out reading target bounds. Earlier WebKit Arabic export passed (1.1m); full WebKit verification remains incomplete. No retries, timeout increases, skips or weakened assertions were added.

## Visual/manual evidence

Latest actual captures: `output/playwright/mushaf-polish-reviewed` contains the opposite-end header and tighter gutter at mobile/desktop; `output/playwright/centered-ayah-final` contains centered glyph previews, complete Arabic exports and responsive sharing. The card-size control is captured under `output/playwright/centered-ayah-sizing-evidence`. Final footer-clearance exports are retained under `output/playwright/ayah-card-final-evidence`. Reviewed copies for owner display live in `output/english-sharing-review`. Actual PNGs, not mockups, are used. Mobile sizing remains keyboard reachable, with named percentage values and the fit scope described; readable-floor/complete reconstruction regressions are tested. Arabic source text remains untouched.

Reviewed evidence is copied to ignored `output/english-sharing-review/`: `english-reader-mobile.png` (390px, first English ayah), `share-dialog-desktop.png` (preview/settings/actions), and `shared-card-with-english.png` (actual 1080×1350 exported continuation, Arabic and larger English with attribution). Originals and theme/enlarged/short-window captures are retained under `output/playwright/ayah-offline-reader` and `output/playwright/ayah-reviewed-final`. Inspected reader gutter/leading, source attribution, reference hierarchy, restrained card frame/header, complete Arabic marks and English continuation clearance. Follow-up mobile evidence is retained under `output/playwright/english-polish-reader` and `output/playwright/english-polish-sharing`: organized surah/page/range, quieter source footer and visibly tighter ayah gaps, plus sharing preview/settings and enlarged/short-window captures. The owner requested images and actual local captures were displayed; no mockups or image-generation edits were substituted.

## Documentation updated

Design and architecture contracts record preview-first sharing, reader-consistent translation, asynchronous generation and explicit save/share scope. The decision log records approval and the local publication hold.

## Decisions recorded

The owner approved all preceding recommendations and explicitly instructed keeping changes local without pushing. This approves consistent selection of the existing reviewed reader translation for Quran ayah cards; no reviewed translation wording or other devotional content is modified.

## Known limitations or remaining risks

The full check has an unrelated phase-document formatting failure and complete WebKit verification remains unfinished because of browser timeouts; this phase does not claim a green release gate. Physical Android/iPhone native share targets, social compression, human TalkBack/VoiceOver and device performance profiles remain manual follow-up. No measured performance speedup is claimed. Nearby concurrent Reader/Library/source work is preserved and not attributed to this phase.

## Out-of-scope findings

A later intermediate build caught another session between adding AudioFileExports and its getSavedAudioFiles export; once that export appeared, the final build passed. No audio implementation was changed by this phase. The shared default browser build initially failed before running tests with Windows EPERM on `.playwright-dist/assets`. Verification uses a separate build and the supported E2E_BASE_URL override; no test infrastructure, assertions or budgets are weakened.

## Recommended next step

Owner reviews local appearance and actual shared cards, then physical-device/accessibility checks before a separately authorized release.
