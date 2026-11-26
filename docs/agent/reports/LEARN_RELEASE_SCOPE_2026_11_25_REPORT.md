# Phase Report — Learn release-scope remediation, 2026-11-25

## Objective

Prevent confirmed source-conflicted Arabic Al-Mukhtar/Wird adaptations and the unreviewed English Umrah draft from appearing in ordinary production. Preserve every local file, immutable asset, record and review workflow. The combined release owner in chat `01a2148b-c048-7a52-a278-e102040aa364` authorized this remediation and owns final gates, release notes, commit/push and deployment.

## Scope completed

- The existing `draft-for-review` gate now covers Arabic Al-Mukhtar, Arabic Wird and English Umrah. Metadata is recorded in both the catalogue and generator so regeneration preserves exclusions.
- Ordinary production offers only the available Arabic Umrah adaptation. Its catalogue/reader/options identify the 16-source-page scope and excerpt omissions. The source's ellipsis is explicitly distinguished from complete remembrance wording. No religious text was rewritten or inferred; complete original coverage is not claimed.
- Generic review status copy works for Arabic source-review editions; English-specific draft copy is used only for English Umrah. Local/isolated review retains all editions.
- Availability resolves before any reading/offline/PDF/position hook mounts. Withheld direct links render a named, localized recovery screen with Back to Learn and no publication requests or record writes.
- Unavailable English Umrah links recover to the same book's saved Arabic position. Existing Arabic/English positions, bookmarks and remembered language records remain intact; the catalogue ignores unavailable stored selections.
- Previously cached withheld editions appear only for removal under Downloads. No save/read/PDF or available-offline claim is offered for them. Removing an available edition preserves shared photos still needed by a saved hidden edition.
- Empty catalogue/download states show explicit recovery copy with no read/save actions. More/Azkar omit the Learn entry when no book is available.
- Pack loading and explicit offline/PDF requests verify availability before fetching. Local source/asset files and all record identities are retained.

This is a publication-boundary correction, not religious-source approval. The two Arabic corrections, full English Al-Mukhtar/Wird translations and independent content/accessibility acceptance remain outstanding.

## Files changed

- `src/app/learning/catalogue.json`, `catalogue.ts`, `catalogue.test.ts`, `learningAssets.ts`, `learningAssets.test.ts`, `learningDownloads.ts` and `scripts/pack-learning-books.mjs`: production status, available-edition resolution, removal metadata and request guards.
- `src/app/hooks/useLearningLibrary.ts`: PDF availability guard.
- `LearningReaderScreen.tsx`, `LearnScreen.tsx`, `settings/LearningDownloadsPanel.tsx`, `MoreScreen.tsx`, `AzkarLibraryScreen.tsx` and `i18n/learning.ts`: localized recovery, generic notices, honest Umrah scope and removal-only/empty states.
- `LearningAvailability.test.tsx`, `scripts/learning-books.test.mjs`, `src/test/isolatedSuites.ts`: no-hook/no-record-write recovery, empty states, source-status parity and isolated mock registration.
- `e2e/learning-production.spec.ts`, `scripts/serve-learning-production-tests.mjs`, `scripts/run-feature-browser-tests.mjs`: four narrow real-app production-gate regressions included in the Learn feature inventory.
- Approved phase, Learn contract, this report and the retained pre-remediation handoff/audit reference.

No devotional wording, reviewed Quran, translation, attribution, count, citation, source HTML/PDF, asset byte, persistence migration, dependency or release note was changed by this remediation. No commit, push or deployment was performed.

## Components added or modified

`LearningReaderScreen` resolves availability before mounting its available-reader child. The unavailable screen uses existing `ScreenContainer`/Button/icon primitives. Catalogue/download presentation reuses existing components and semantic status text. No alternate reader/window, new state system or dependency is introduced.

## User-visible behavior

Production Learn displays the scoped Arabic Umrah adaptation. Links to withheld books explain their review state and preserve saved records. Existing English review links fall back within the same book to saved Arabic reading. Downloads permits removal of previously saved withheld packs without reopening or acquiring them. Local review continues to offer all current editions.

## Accessibility work

Localized recovery has a named heading, concise status and native Back button. Ordinary product controls retain shared focus/target behavior. Empty states expose no dead read/save actions. Content-language and interface direction remain independent. No complete WCAG/PDF-UA or physical-device/screen-reader acceptance is claimed from these checks.

## Tests added or updated

- Catalogue tests prove only Arabic Umrah is available under ordinary-production flags, all four editions remain in local review, Arabic review notices are generic, absent editions resolve safely and an empty availability list returns no resource.
- Generator/pack tests require the two Arabic review statuses without altering source bytes or the existing 217-unit fidelity assertions.
- Unavailable reader component tests prove no reading/cache/PDF/position hook mounts, no route/record update occurs, and Back works. Empty catalogue/download tests verify no read/save action and a disabled no-op file check.
- Asset tests reject a withheld production pack/download before network/cache writes and retain photos needed by a previously saved hidden edition.
- Four real-browser cases prove actual production availability, withheld direct-link recovery in both interface languages, same-book saved-language fallback, and removal-only cached-edition management. They assert zero hidden publication requests and retained saved records.

The new component mock suite is registered in the existing isolated-test list so it cannot leak mocked catalogue/hooks into unrelated shared-registry tests.

## Commands run and exact results

| Command                                                                                                                                                                                                                                                              | Result                                                                                                                                                                                                                                                                                                        |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm exec vitest run src/app/learning src/app/screens/LearningAvailability.test.tsx src/app/components/LearningOfflineActions.test.tsx scripts/learning-books.test.mjs scripts/english-book-editions.test.mjs scripts/english-book-samples.test.mjs --maxWorkers=1` | PASS: 8 files, **43 tests**, 16.08 s. This supersedes the earlier 42-test run after adding the hidden-edition/shared-photo regression.                                                                                                                                                                        |
| `E2E_BASE_URL=http://127.0.0.1:1 pnpm exec playwright test e2e/learning-production.spec.ts --project=desktop-chromium --workers=1`                                                                                                                                   | PASS: **4 cases**, 30.9 s. Each case uses the spec-owned real app server, not the unused external URL.                                                                                                                                                                                                        |
| Targeted `pnpm exec eslint` on affected Learn runtime/test/generator/production-fixture files                                                                                                                                                                        | PASS, exit 0 after correcting the fixture's empty callback binding.                                                                                                                                                                                                                                           |
| Targeted Prettier checks for changed source/test/docs and audit files                                                                                                                                                                                                | PASS after formatting.                                                                                                                                                                                                                                                                                        |
| `pnpm typecheck` during remediation                                                                                                                                                                                                                                  | FAIL in concurrent `CustomCounterScreen.tsx`/Masbaha settings prop signatures only (`items`, callback argument and `haptics`/`sound` mismatches). No Learn diagnostic appeared. The release owner was informed and is coordinating that separate scope; this is not reported as a passing combined typecheck. |
| `pnpm exec vitest run src/test/isolatedSuites.test.ts src/app/screens/LearningAvailability.test.tsx --maxWorkers=1`                                                                                                                                                  | PASS: 2 files, 5 tests, 3.96 s; isolation inventory and unavailable/empty-state component regressions pass.                                                                                                                                                                                                   |

No broad `pnpm check`, Pages build, full browser matrix, audit or deployment was duplicated. Final combined validation belongs to the release owner after other scopes freeze. Earlier complete-gate/integration results remain historical and do not certify the final combined checkout.

## Evidence

`e2e/learning-production.spec.ts` builds one isolated real-app fixture with the ordinary-production review flag forced false. The existing loopback backend and immutable local assets isolate it from production writes. The four cases inspect actual availability and network/state effects; successful page responses are not mocked. Build output is under the test results directory, outside release output.

The [pre-remediation catalogue audit](../evidence/learn-production-handoff/catalogue-audit.json) is intentionally preserved as before-state evidence. It verified 22 asset references/19 distinct files and confirmed the initial source-exposure issue. Its original production-exposure flags are superseded by this remediation and the current catalogue tests.

## Documentation updated

The approved release-scope phase and Learn delivery contract describe current production exclusions, generic draft semantics, direct-link behavior and removal-only cached editions. The earlier [handoff](LEARN_PRODUCTION_HANDOFF_2026_11_25.md) is explicitly marked historical/superseded. Existing source ledger and earlier integration/report evidence are preserved without rewriting history.

## Decisions recorded

The release owner confirms withholding the two source-conflicted Arabic adaptations and preserving review-only English. Only the available, explicitly limited Arabic Umrah adaptation is in scope for production. No new source interpretation or independent approval is inferred. Combined publication operations remain solely with the release owner.

## Remaining risks and genuinely unfinished work

- Al-Mukhtar original-source restoration and full English authoring remain unfinished. The ledger records confirmed substitutions/missing cards and separates diagnostics from verified findings.
- Wird narrator/travel-boundary restoration and full English authoring remain unfinished. Prepared English source overrides are not complete translated books or applied Arabic fixes.
- English Umrah is a complete draft of the available 16-source-page adaptation, not the inaccessible full original. It remains review-only.
- Arabic Umrah retains the known source ellipsis with explicit scope/omission disclosure. No additional confirmed source substitution is recorded for this adaptation; unavailable-original comparison and independent acceptance remain incomplete.
- Real TalkBack/VoiceOver, physical-device and PDF-reader reading-order acceptance remain pending.
- Review gating prevents app access but does not make repository assets private. Release notes must not advertise withheld books or three complete English translations.
- The concurrent Masbaha typecheck failure requires combined verification by its owner/release coordinator; no unrelated source edit was made here.

## Out-of-scope findings

All unrelated shared-checkout changes, release notes, other app servers and original religious sources are preserved. No further UI/content expansion, broad-gate worker or publication action is planned in this chat.

## Recommended next step

This scope is frozen. The release owner should run final combined gates once all scopes are settled, verify the ordinary-production gate remains false, include required immutable assets and confirm the cleared Arabic Umrah reader/PDF/offline URLs after publication. Complete source restoration/independent review before lifting any excluded edition's status.
