# Benefits authenticity correction report

## Objective completed

Replace the flat Benefits list with a conservative, source-led catalogue containing only Qur’anic evidence, authenticated hadith, and 30 benefits directly traceable to those hadith records.

## Files changed

- `src/app/content/zikrBenefits.ts`
- `src/app/content/zikrBenefits.test.ts`
- `src/app/screens/BenefitsScreen.tsx`
- `src/app/screens/BenefitsScreen.test.tsx`
- `src/app/i18n/en.ts`
- `src/app/i18n/ar.ts`
- `e2e/pre-phase-nine.spec.ts`
- `docs/CONTENT_AUTHORING.md`
- `docs/agent/DECISION_LOG.md`
- this report

## User-visible behavior

- Qur’an appears first, followed by authenticated hadith, then the 30 hadith-derived benefits.
- Generic collection notes are no longer imported into the Benefits page.
- The 30 summaries are grouped by forgiveness, reward, protection, Paradise, and the heart/remembrance gatherings.
- Every card retains a visible, linked source and includes that source in WhatsApp sharing.
- Lists use keyboard-accessible tabs and incremental rendering instead of showing more than 20 cards at once.

## Content review

The user supplied a conservative research dossier on 2026-08-08. It prioritizes exact Qur’an references, Sahih al-Bukhari, Sahih Muslim, and reports explicitly authenticated by named hadith specialists, with Dorar al-Saniyyah and Islamweb cross-checks. The implementation preserves the dossier’s caution against attaching unsupported counts or promises.

The implementation agent cross-checked the linked Quran.com verse records and Dorar al-Saniyyah hadith records on 2026-08-08. This change does not alter any existing Qur’an string, canonical zikr text, repetition count, saved state, progress state, or synchronization data.

## Accessibility work

- Reused the WAI-ARIA tab primitive with roving keyboard focus and RTL-aware arrow behavior.
- Kept the scroll region keyboard-focusable.
- Preserved visible focus rings, semantic headings/articles, 44px controls, source link text, and non-color selected states.
- Kept Arabic/English direction and localized numerals under application state.

## Tests and commands

| Command                                                                                            | Result                                                                                     |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `pnpm typecheck`                                                                                   | Passed                                                                                     |
| `pnpm test:run -- src/app/content/zikrBenefits.test.ts src/app/screens/BenefitsScreen.test.tsx`    | Passed — 2 files / 8 tests                                                                 |
| `pnpm test:e2e -- e2e/pre-phase-nine.spec.ts --project=desktop-chromium --project=mobile-chromium` | Passed — 12/12                                                                             |
| `pnpm install --frozen-lockfile`                                                                   | Passed — 639 locked packages installed/reused                                              |
| `pnpm check`                                                                                       | Passed — format, lint, type, audio, 63 files / 329 tests with coverage, build, and budgets |
| `CI=true pnpm test:e2e`                                                                            | Passed — 295/295 across desktop, mobile, tablet, Firefox, and WebKit                       |
| `pnpm build:pages`                                                                                 | Passed — 1,886 modules, PWA precache, and bundle budget                                    |

## Browser evidence

- Arabic mobile at 390×844: the three groups stack, the first seven Qur’an cards render, the derived tab initially renders 15 cards, and document overflow is 0px.
- English desktop at 1440×900: all three tabs share one row, derived cards use a two-column grid, and document overflow is 0px.
- WhatsApp links retained line breaks through URL encoding and included the visible source.

The first two non-CI Playwright attempts exposed three unrelated browser-startup/onboarding timeouts while 293/295 and 294/295 tests passed. Each timed-out test passed immediately in isolation. The final full run used the repository's CI retry configuration and passed 295/295; no application assertion failed.

## Remaining verification

- Record GitHub Quality and Pages workflow URLs after push.
- Confirm the deployed production page and source/share behavior in a smoke test.

## Recommended next phase

Complete this isolated content correction release, then return to the approved Phase 09 planning gate.
