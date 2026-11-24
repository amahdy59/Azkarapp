# Phase Report — Expanded desktop prayer card

## Objective

Present existing prayer information directly in the expanded desktop card, remove redundant reference controls, show the recording date without a modal, and refine spacing using actual screenshot review. Work remains local under the owner's publication hold.

## Scope completed

The owner's rejected full-width lower guidance band was replaced by independently flowing columns. Checklist/date and Rawatib share the first logical column; virtue and prayer-specific Sunnah share the second. Both columns use the same heading, divider, quotation and passive-reference anatomy. Related sections use 12px and the wide gutter is 32px. The existing 40rem card query stacks at enlarged text, while the 1200px shell boundary controls desktop information visibility.

## Files changed

- `src/app/components/PrayerActionsCard.tsx`, `PrayerMomentPanel.tsx`, `prayer-actions-card.css`, `home-prayer-overview.css` — scoped presentation/composition changes; preserve independently pending Home edits.
- `src/app/components/PrayerSunnahDetails.tsx` — presentation-only Sunnah/Rawatib/evidence components consuming existing guidance models.
- `src/app/components/PrayerActionsCard.test.tsx`, `src/app/screens/PrayerMomentScreen.test.tsx`, `src/test/isolatedSuites.ts` — direct evidence/date/Friday regressions and required mock isolation.
- `e2e/prayer-card-desktop.spec.ts` — desktop, complete evidence, geometry, keyboard, compact/modal, resize and 200% regressions.
- `e2e/prayer-actions-responsive.spec.ts`, `home-prayer-moment.spec.ts`, `home-prayer-overview.spec.ts`, `compact-prayer.spec.ts`, `prayer-tracking.spec.ts`, `accessibility-new-surfaces.spec.ts` — reconcile assertions with the owner's changed information/date contract; retain feature assertions and compact overlay coverage.
- Documentation listed below. Other modified/untracked files belong to concurrent work and were preserved.

## Components added or modified

PrayerActionsCard, PrayerMomentPanel, PrayerSunnahDetails, PrayerRawatibDetails and its local PrayerSunnahEvidence helper. No runtime dependency, new clock, layout observer, storage or remote-state boundary.

## User-visible changes

Desktop no longer needs More information or Source/context clicks. Complete existing Sunnah guidance, counts, rank, quotations, grading and references appear directly. The date remains quiet native time metadata beneath the checklist at every width. Fajr sunrise, Friday alternatives and independent Read/completion remain. Compact screens retain their information dialog and virtue disclosure.

## Accessibility work

Native checkbox targets and separate Read remain keyboard accessible. Heading/section associations, quotation language/direction, original dateTime/dayKey, visible focus and 44px controls are preserved. English long virtue labels reflow at 320px/200%. Desktop evidence stays visible when columns stack. Escape restores the compact information opener; resizing an open dialog to desktop recovers focus to Read and clears stale open state. Forced Colors and scoped axe checks supplement geometry/screenshot checks. No physical assistive-technology or device acceptance is claimed.

## Tests added or updated

Five desktop prayers, both Friday alternatives in Arabic/English, unchanged source text/ranks, all original record callbacks/restrictions, calendar/Hijri offset and midnight identity, compact focus recovery, desktop/compact resize, RTL/LTR, Glass/light solid, all three engines and 320/390/834px at enlarged text. Existing date tests compare the visible preferred-calendar header with the date line while independently checking the exact saved key; the header's full ISO timestamp is not a second recording key.

## Commands run

Validation is in progress; exact final outcomes are added below after completion. Commands use the installed pnpm 11.19.0 CLI under Node 24.15.0 because the default pnpm Volta shim did not resolve correctly in this shell.

| Command                                                                                                                                                                              | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm test:run src/app/components/PrayerActionsCard.test.tsx src/app/screens/PrayerMomentScreen.test.tsx src/app/screens/HomeScreen.render.test.tsx src/test/isolatedSuites.test.ts` | PASS: 4 files, 57 tests; exit 0, 9.68s.                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Three-engine `pnpm test:e2e e2e/prayer-card-desktop.spec.ts` on the final column implementation                                                                                      | Chromium and Firefox: all 12 cases passed. WebKit hit its ordinary 90s deadline during repeated element screenshot captures; no deadline increased. Final bounded capture run recorded below. `output/playwright/prayer-card-polish/final-browser.log`.                                                                                                                                                                                                                                                             |
| Selected existing prayer/Home Chromium regression command                                                                                                                            | 25 cases passed; 4 date tests exposed the obsolete two-identical-time-attributes assumption. Corrected without changing the product's timestamp/record identity. `existing-regressions.log`/`.json`.                                                                                                                                                                                                                                                                                                                |
| `pnpm test:e2e e2e/home-prayer-moment.spec.ts --grep 'prayer record respects' --project=desktop-chromium`                                                                            | PASS: all 4 corrected calendar/date cases, exit 0, 7.2s. `calendar-final.log`/`calendar-final-results.json`.                                                                                                                                                                                                                                                                                                                                                                                                        |
| `pnpm check`, first full checkpoint                                                                                                                                                  | FAIL: build, typecheck, toolchain, content/timing/type/motion/CSS validations passed. Lint failed on unrelated `docs/external-sources/snapshot_p14.mjs`; format reported 15 files, including a phase file subsequently formatted. Six unit failures came from the newly mocked suite lacking required isolation; the suite is now registered and all 57 targeted tests pass. Total bundle was 12,588,443 bytes vs unchanged 12,582,912-byte ceiling. No budget/threshold/assertion weakened. Full log: `check.log`. |
| Isolated browser preview build                                                                                                                                                       | PASS: Vite build to `output/playwright/prayer-card-polish/preview` with loopback API at port 4212; exit 0. `preview-build.log`.                                                                                                                                                                                                                                                                                                                                                                                     |

## Visual/manual evidence

Actual locally rendered screenshots were shared throughout implementation and inspected, including the rejected intermediate band and the revised independent columns:

- `output/playwright/prayer-card-polish/01-desktop-asr-ar.png` — initial fully visible information; rejected lower empty band.
- `02-desktop-asr-ar.png` — short guidance moved under its virtue.
- `05-revised-desktop-dhuhr-ar.png` — final independent columns after owner rejection of the fuller band.
- `desktop-chromium-ar-glass-dhuhr.png` / `desktop-chromium-en-solid-dhuhr.png` — final Arabic/English fuller guidance and material treatments.
- `03-phone-ar.png` — compact card/date, direct from actual browser.
- Per-engine normal Asr/Dhuhr and 320px/200% captures in the same directory. Only representative short/full and enlarged captures are repeated; all prayer and viewport assertions remain intact.

No generated concept, composited image or modified religious lettering is used as implementation evidence. Screenshot acceptance is visual review, not a complete accessibility/performance claim.

## Documentation updated

`docs/ARCHITECTURE.md`, `docs/DESIGN_SYSTEM.md`, `docs/PRAYER_TIMES.md`, `docs/QUALITY_CHECKLIST.md`, `docs/agent/INDEX.md`, `docs/agent/DECISION_LOG.md`, `docs/agent/phases/PRAYER_CARD_DESKTOP_LOCAL_2026_11_24.md`, and this report. Concurrent additions are preserved.

## Decisions recorded

The desktop dialog/date-in-sheet/source-preview presentation is superseded by the owner's direct request. Their subsequent screenshot rejection supersedes the full-width lower guidance band. Keep two independent columns and all source text. The existing global publication hold applies: no commit, push, deployment or release-note rewrite.

## Known limitations or remaining risks

The checkout includes active unrelated feature/prototype/tooling edits and is not a frozen release candidate. Earlier whole-checkout lint/format/budget findings remain distinguishable from this feature's targeted results; final quality results are recorded below. Physical Android, TalkBack/VoiceOver and actual field performance remain pending. Browser Forced Colors/axe/keyboard evidence does not establish complete WCAG compliance.

## Out-of-scope findings

Unrelated document prototypes, Home overview/location, Qibla, downloads, prayer settings, surah and build-literal consolidation remain separately owned work. No source-content edits, data migration or deployment remediation was undertaken here.

## Recommended next step

Review the actual revised card screenshots, retain the local-only checkpoint and consolidate all pending work in the owner-selected release chat. Physical-device and assistive-technology acceptance remain separate.

## Final local validation checkpoint

| Command                                                                                                                                                                             | Exact final result                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm test:e2e e2e/prayer-card-desktop.spec.ts --project=mobile-webkit-smoke --output=output/playwright/prayer-card-polish/webkit-final-results` against the isolated built preview | PASS: all 6 cases, exit 0, 2.7m. Both languages/materials, every prayer, 200% reflow, all compact widths, Escape/resize recovery and Forced Colors retained. `webkit-final.log`, `webkit-final-results.json`.                                                                                                                                                                                                                                                                                  |
| Selected existing Chromium prayer/Home regression command plus corrected calendar run                                                                                               | PASS coverage: 25 unchanged successful cases plus all 4 corrected date cases. This covers the existing 12 language/theme/material responsive cases, 8 Home overview widths/languages, Friday alternatives, checkbox focus, compact undo/reading and dialog axe. No new product edits followed these passes.                                                                                                                                                                                    |
| `pnpm check` final                                                                                                                                                                  | FAIL overall, exit 1, 151.1s. Complete unit suite with coverage PASS (147.5s); toolchain, production build, typecheck, audio manifest, Quran/listening/owner timings, type scale, motion, bundle budget and CSS utilities PASS. Only lint and formatting fail, exclusively in unrelated `docs/external-sources/` files. Lint: 4 errors across `download_holy_sites.mjs`, `generate_book2_dalil_al_mutamir.mjs`, `snapshot_p14.mjs`. Formatting: 17 files in that directory. `final-check.log`. |
| `pnpm build:pages`                                                                                                                                                                  | PASS, exit 0, including bundle budget and CSS utilities. Vite built in 14.93s. Home startup reported 517,536 gzip bytes. `pages-build.log`.                                                                                                                                                                                                                                                                                                                                                    |
| `git -c core.fsmonitor=false diff --check`                                                                                                                                          | PASS, exit 0.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

The first checkpoint's bundle and mock-isolation failures are resolved in the final check; the concurrent bundle consolidation is not claimed as this phase's work. No ceiling, coverage threshold, assertion or timeout was raised. Screenshot work was reduced to representative short/full/enlarged captures inside browser tests while retaining every prayer/viewport assertion; this resolved WebKit's redundant capture overhead within the existing deadline. All 18 new browser cases are covered by the 12 successful Chromium/Firefox cases and six final WebKit cases on the unchanged final application code.

The unrelated lint/format failures mean the whole-checkout merge gate is **not green**. This local feature checkpoint does not authorize or claim release readiness. Physical-device and assistive-technology acceptance remain pending. No commit, push, deployment or release-note change was made.

## Approved final refinement — coordinated release follow-up

The owner approved the rendered recommendation images and then requested implementing them, coordinating the other working chat and releasing all pending work. This supersedes the historical local-only instructions above. The approved 18px identity/16px foreground section hierarchy, approximately 16–20px title-to-row gap, aligned logical edges and uniform quotation/reference component are now implemented. Ordinary controls remain at least 44px and narrowed/enlarged layouts retain wrapping flow.

Final targeted evidence for these refinements: 57 unit/isolation tests passed, all 18 desktop-card cases passed across Chromium/Firefox/WebKit in 3.5m, and 77 affected Chromium cases passed in 1.8m. The latter cover the existing responsive prayer-card matrix plus downloads, Qibla, prayer settings and surah entry. Sources, counts, records and temporal contracts are unchanged. Current logs: output/release-prayer-units.log, output/release-prayer-browser.log and output/release-affected-browser.log. Release gates and deployment evidence are owned by the coordinated release report; no earlier full-check failure is misrepresented as a pass.
