# Phase Report — After-salat learning order (2026-10-12)

## Objective

Apply the owner's local-only request for a memorable sequence and combined related passages. No commit, push, deployment or release-note changes.

## Scope completed

Inspected content, identity indexes, grouped progress, shared list anatomy and audio plans. Plan stated before editing: opening forgiveness/peace, tawhid/giving, tasbih/conclusion, supplication, then Quran. Preserve original IDs, wording, sources, counts, core membership and prayer filters.

## Files changed

src/app/content/azkar.ts, azkarIds.ts and azkar.test.ts; src/app/types.ts; src/app/components/AzkarListLayout.tsx, AzkarListLayout.test.tsx and AzkarListItem.tsx; src/app/screens/CategoryScreen.tsx; src/app/i18n/ar.ts and en.ts; e2e/after-prayer-arrangement.spec.ts; docs/CONTENT_AUTHORING.md, docs/DESIGN_SYSTEM.md, docs/agent/INDEX.md, docs/agent/DECISION_LOG.md and this report.

## Components added or modified

AzkarListLayout adds numbered stages, instructions and shared grouped surfaces. AzkarListItem adds a grouped row variant used by CategoryScreen. No dependencies or persistence migration.

## User-visible changes

Forgiveness/peace form one block; tawhid/Allahumma la mani form one block; tasbih and concluding tawhid form one block with a 33 + 33 + 33 + 1 reminder. Quran follows supplication, with three surahs then Ayat al-Kursi. Labels describe a learning arrangement rather than a prescribed complete order. After-prayer tasbih is no longer labelled Tasbih Fatimah. Each original reader/counter/saved/audio entry remains independent. Existing audio continuation within groups applies without changing counts or autoplay on entry.

## Accessibility work

Preserved section headings, native buttons, focus rings, 44px targets and independent completion actions. Core group completion requires every member. Automated scans do not establish full accessibility compliance.

## Tests added or updated

Content checks cover exact order, grouping, counts and prayer-specific totals. Presentation checks cover both languages, independent reader indexes and partial/full group completion. Browser checks cover mobile containment, grouping, keyboard reading, axe and screenshots.

## Commands run

| Command                                                                    | Result                                                                                                                                                                                                                                                                                       |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| node --version; pnpm --version                                             | v24.21.0; 11.19.0                                                                                                                                                                                                                                                                            |
| Targeted Vitest: azkar, AzkarListLayout, CategoryScreen, audioArchitecture | 4 files, 48 tests passed, exit 0.                                                                                                                                                                                                                                                            |
| Chromium after-prayer browser spec                                         | 2 passed, exit 0, 24.5s.                                                                                                                                                                                                                                                                     |
| pnpm check                                                                 | Exit 1 in 126.8s: every stage passed except bundle growth. Initial route is 162866 gzip bytes, 2.4% above the recorded 159119 bytes. Build, format, lint, types, complete unit suite, content/audio/timing/type/motion validators and CSS checks passed. Log: output/after-prayer-check.log. |
| git diff --check                                                           | Passed, exit 0.                                                                                                                                                                                                                                                                              |

## Visual/manual evidence

Final additional commands: pnpm exec vite build --outDir output/after-prayer-preview passed, exit 0. With E2E_BASE_URL=http://127.0.0.1:4196, pnpm test:e2e e2e/after-prayer-arrangement.spec.ts --project=desktop-firefox-smoke --project=mobile-webkit-smoke --workers=1 --output=output/after-prayer-cross-browser passed: 4/4 in 28.3s. Together with Chromium this is 6/6 browser checks; all include Arabic/English grouping, keyboard selection, containment and axe scans. The earlier shared-directory build failed before executing tests; no browser assertion was weakened.

Arabic/English phone and desktop screenshots under output/after-prayer-evidence. Physical-device and human screen-reader checks remain unclaimed.

Visually inspected the Arabic phone and English desktop screenshots: combined opening rows, count reminders, stage headings and actions fit their shared surfaces with no overlap. The phase-specific production preview is available at http://127.0.0.1:4196/#/azkar/after-prayer.

## Documentation updated

Content authoring and design system describe structural grouping. INDEX links this phase; DECISION_LOG records local authorization.

## Decisions recorded

The attached poster is a visual reference, not authority to add religious wording. Checked connected opening against https://sunnah.com/muslim:591, tawhid/giving against https://sunnah.com/muslim:593a, and tasbih conclusion against https://sunnah.com/muslim:597. Original reviewed wording and citations are untouched. These comparisons support grouping, not a new independent content review.

## Known limitations or remaining risks

Combining is presentation and step grouping: the reader retains original passages and counters. Replacing these with concatenated records would need separately reviewed content and persistence migration. Position-based URLs follow the new sequence; ID-based saved state/counts remain. Poster wording absent from the reviewed corpus was not added. Unrelated local audio/Mushaf work is preserved.

The complete shared-workspace gate is not green because initial bundle growth exceeds the recorded baseline tolerance. No ceiling or baseline was changed. Other sessions are also changing the tree, so this is not attributed solely to this phase. Publication remains blocked pending review of that measured combined increase. A cross-engine browser attempt encountered ENOTEMPTY while clearing the shared .playwright-dist directory; a phase-specific preview isolates subsequent verification without deleting shared artifacts.

## Out-of-scope findings

No religious content, prayer calculation, synchronized data migration or deployment change.

## Recommended next step

Review the local learning flow. Publication requires a new owner instruction and release verification.
