# Phase Report — Coordinated implementation and release, 2026-11-25

## Objective

Publication status and exact-commit browser remediation continue in the [CI remediation report](COORDINATED_RELEASE_CI_REMEDIATION_2026_11_26.md). The initial verified batch is pushed as `974cb93d`; its first complete CI browser matrix correctly blocks Pages pending repairs. The current release manifest is `2026-11-26.1` for the forthcoming remediation.

Coordinate the pending shared-checkout phases, finish approved implementation, validate the combined result, push main and verify the exact production deployment. The owner supersedes prior local publication holds; source-review and physical-device boundaries remain.

## Scope completed

All eight feature handoffs are finished and frozen. Integration repairs and affected browser verification are complete; aggregate local gates and publication follow. The deployed starting commit is `885ce257fa9cb86ce20b0be11f8a5a7ea802ccfe`. Quality 45495500512 and Pages 45503908028 succeeded for that baseline.

| Working chat                            | Handoff / release scope                                                                                                                                                                         |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Capture home screen evidence            | [Home rail/motion report](HOME_PRAYER_RAIL_MOTION_LOCAL_2026_11_25_REPORT.md); compact grouped timings, intrinsic wide cards, dated tracking, deliberate disclosure and split location          |
| Improve settings and prayer location    | [Settings summaries](SETTINGS_SUMMARIES_LOCAL_2026_11_25_REPORT.md) and [Audio/location](SETTINGS_AUDIO_LOCATION_LOCAL_2026_11_25_REPORT.md); separated destinations and honest saved summaries |
| Redesign the feedback page              | [Completion reflection](COMPLETION_REFLECTION_LOCAL_2026_11_25_REPORT.md); existing reviewed reminder and actual collection sharing                                                             |
| Plan consistent menu behavior           | [Global overlays](GLOBAL_OVERLAY_CONSISTENCY_LOCAL_2026_11_25_REPORT.md); shared origins, reader content-slot panels, protected text and focus recovery                                         |
| Improve mobile header contrast          | [Seamless headers](SEAMLESS_PAGE_HEADERS_LOCAL_2026_11_25_REPORT.md) and [System bars](SEAMLESS_LIGHT_SYSTEM_BARS_LOCAL_2026_11_25_REPORT.md); theme-aware chrome and native contrast           |
| Improve document design and readability | [Learn release scope](LEARN_RELEASE_SCOPE_2026_11_25_REPORT.md); source-conflicted editions withheld, scoped Arabic Umrah available, direct-link/cache recovery verified and frozen             |
| Plan UX and Quran Zoom Improvements     | [Sharing/Masbaha/Quran report](SHARING_MASBAHA_QURAN_UX_2026_11_26_REPORT.md); approved implementation finished, frozen and verified across three engines                                       |
| Find reusable Quran audio               | [Additional-audio pilot](ADDITIONAL_AUDIO_PILOT_2026_11_25_REPORT.md); 45 focused tests/12 browser scenarios pass, production isolation verified and frozen                                     |

One release owner handles the combined gates, commit, push and workflows. Other working chats were asked to finish their scopes and freeze files without competing aggregate checks or publication.

## Files changed

Root integration additionally repairs artwork-radio focus, prepared-arrow/footer bounds and explicit long-surah reminder initialization. It completes quiet Masbaha gesture suppression, six-digit direction/fitting, enlarged header/action reflow, 64px dhikr rows, surviving-opener recovery and scroll-end space, with corresponding unit/browser migrations. Shared contract documentation records prepared-first choices and bounded custom-field scrolling. The batch preserves the shared checkout's completed feature changes, tests, source assets, documentation and actual screenshots; unrelated historical worktrees remain separate.

## Components added or modified

Home prayer/location/tracking; Settings audio/download summaries; completion reflection/collection sharing; shared sheet/menu/reader-panel primitives; reading header surfaces/native system-bar adapters; deferred Learn readers/download services; sharing, Masbaha and enlarged Quran reading; development-only audio review.

## User-visible changes

The 2026-11-26 bilingual manifest describes clearer prayer timings/tracking/location, simplified Masbaha and prepared collection sharing, enlarged Quran portions/theme-aware chrome, scoped Umrah reading/offline resources, Settings summaries and sourced completion. Four matching-language entries replace all old notes; the current/offline archive and freshness check pass. Withheld English/audio and source-conflicted editions are not advertised.

## Accessibility work

Per-feature reports cover Arabic/English, RTL/LTR, 44px actions, keyboard/focus/Back, narrow/enlarged text, theme/material protection and app/OS reduced motion. Saved Home, completion, Settings and enlarged overlay screenshots were inspected during coordination. Affected combined-browser verification passes; aggregate and production verification follow. Automated evidence does not establish complete accessibility compliance or physical-device acceptance.

## Tests added or updated

Feature owners' colocated and browser regressions remain intact. Root preserves explicit long-surah reminder intent and repairs stale sharing roles/default assumptions, waits for the lazy modal before entering custom design, explicitly selects individual text in single-reader tests, and verifies native radio focus. Two obsolete no-vertical-scroll assertions for explicit expanded customization become per-field full-viewport/44px/body/footer/horizontal-bound checks; export, text, geometry, focus and axe assertions remain. No timeout or threshold changed.

## Commands run

| Command                                                | Result                                                                                                                      |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Repository, relevant chat and Actions/Pages inspection | Baseline main matches successful deployed commit `885ce257`; Pages uses Actions/main                                        |
| `git fetch origin`                                     | Exit 0                                                                                                                      |
| `git diff --check`                                     | Exit 0; Git reports ordinary CRLF-to-LF normalization notices for several touched files                                     |
| `pnpm audit:prod`                                      | Exit 0; no known vulnerabilities                                                                                            |
| Changed-text private-key/token signature check         | Exit 0 for 330 changed text files at the inspected checkpoint; no matching private-key or GitHub/Supabase secret signatures |

Additional focused coordination checks:

| Command / check                                                                        | Result                                                                                                                                                                                                           |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`                                                       | Exit 0; installed graph already matches pnpm 11.19.0                                                                                                                                                             |
| `pnpm typecheck`                                                                       | Exit 0 on the current shared checkout; earlier temporary Masbaha signatures are resolved                                                                                                                         |
| `pnpm exec vitest run src/app/content/mushafOfflineCache.test.ts --maxWorkers=1`       | 1 file / 7 tests passed, 9.94s; no source/test change                                                                                                                                                            |
| `pnpm exec vitest run src/app/components/CollectionShareModal.test.tsx --maxWorkers=1` | Initial 38 tests passed; after the explicit long-surah reminder repair, 1 file / 39 tests passed in 11.49s                                                                                                       |
| Quran enlarged-reading specs                                                           | Five Chromium cases passed in the first mixed run; all 10 Firefox/WebKit cases passed in 2.2m, exit 0. Covers four viewport/text scenarios plus pinch per engine                                                 |
| Sharing curated/board/arrows matrix                                                    | First complete run: 37 passed / 6 failed in 11.3m. All six failures were the confirmed prepared-arrow/footer overlap                                                                                             |
| Corrected prepared-arrow follow-up                                                     | Chromium/Firefox: 4 passed in 17.5s; WebKit: 2 passed in 34.6s; all original geometry/keyboard assertions retained                                                                                               |
| Individual sharing/source-link regressions                                             | Three passed; preserve actual selected text/counter and recipient identity/routine preferences                                                                                                                   |
| Expanded custom step regressions                                                       | Arabic/English Chromium: 2 passed in 24.6s with strict field reachability, PNG export, focus, dropdown and axe checks                                                                                            |
| Firefox/WebKit custom-step/single-reader follow-up                                     | All 6 passed in 2.8m, exit 0; both languages retain strict field reachability and focus/export assertions                                                                                                        |
| Remaining sharing refinement/caption cases                                             | 14 passed / 1 failed in 55.4s. The failure exposed explicit long-surah sharing incorrectly selecting the prepared routine; the corrected real sourced-reminder/PNG/exact-Mushaf-link case passes in 4.5s, exit 0 |
| Latest private-build budgets / audio isolation                                         | Budget passed with 524,979 gzip bytes for Home startup; 1,163 output files scanned against 11 pilot markers, zero leaks. Final production build is verified again by release gates                               |
| Scoped root sharing ESLint/Prettier/diff checks                                        | Exit 0                                                                                                                                                                                                           |

Additional final integration evidence:

| Check                                                       | Exact result                                                                                                                           |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Focused Masbaha/helpers/portion units                       | 5 files / 31 tests passed in 9.96s, exit 0; includes synthetic scroll/pinch click suppression and reference focus return               |
| Migrated counting acceptance across Chromium/Firefox/WebKit | 49 passed / 3 failed in 6.8m; all three failures were the same confirmed fractional scroll-end clipping of the last English action     |
| Final scroll-end/quiet-layout regression                    | 12 passed in 1.8m, exit 0, across Chromium/Firefox/WebKit; all original full-visibility assertions retained                            |
| Browser shard inventory                                     | Exit 0; 3,992 tests assigned exactly once across nine shards                                                                           |
| Changed-file review                                         | 541 pending paths, about 99 MiB; no file above 10 MiB and no private-key/GitHub/Supabase secret signature among 373 changed text files |

The first complete `pnpm check` finished in 160.8s: 385 test files / 2,753 tests passed, one date-sensitive ProgressViews assertion failed, and lint found a missing effect dependency plus the reading region's explicit keyboard-entry annotation. Build, typecheck, formatting, content/timing/motion checks and unchanged bundle/CSS budgets passed. The Progress fixture now pins the fixture week's Saturday, August 8 instead of letting the real date produce a legitimate `0 / 78` denominator matching its placeholder-data guard; every assertion is retained. The effect dependency is fixed and the scrollable region uses the existing Reader/Salawat justified keyboard-entry exception. Scoped lint passes. All 13 ProgressViews tests pass in 3.39s with the complete seven-day fixture and all 21 CustomCounterScreen tests pass in the repaired focused run. A fresh complete gate is required after these repairs.

The exact-input final aggregate gate and publication results are preserved in release execution logs and the final user report. No failed required gate is accepted for publication.

## Visual/manual evidence

Existing actual-app galleries: [Home](../evidence/home-prayer-rail/README.md), [Settings](../evidence/settings-summaries/README.md), [Completion](../evidence/completion-reflection/README.md), [Overlays](../evidence/global-overlays/README.md), [Headers](../evidence/seamless-page-headers/README.md), [System bars](../evidence/seamless-system-bars/README.md), [Learn](../evidence/english-learn-integration/README.md). Root [before/after sharing evidence](../evidence/coordinated-release-2026-11-25/README.md) records the actual arrow occlusion and correction. Final production smoke evidence will be recorded separately.

## Documentation updated

The [coordinated phase](../phases/COORDINATED_RELEASE_2026_11_25.md) records current release authority, plan and boundaries. This report will retain the exact final verification and publication evidence.

## Decisions recorded

The owner's coordination/push request supersedes earlier local-only holds for verified work. Known original/adaptation differences in Al-Mukhtar and Wird are a concrete publication issue: retain their local review material and exclude those editions from ordinary production until correction/review. No religious source text is rewritten by release integration. The source-limited Umrah adaptation must retain its honest available-page scope. Unreviewed English/audio remain excluded.

## Known limitations or remaining risks

- Approved application implementation is finished. Publication remains conditional on all mandatory local gates and exact-commit CI/Pages success.
- Full Al-Mukhtar/Wird English translations and Arabic original-source reconciliation remain separate authoring work; incomplete or source-conflicted editions must not be announced as available production content.
- Three OpenDua samples require independent named Arabic listening acceptance; external-provider availability is not approval for catalogue/download integration.
- Real TalkBack/VoiceOver, physical system-icon/hardware delivery, PDF reading-order and low-end-device acceptance retain their existing pending status.
- Native Java/plugin changes require a compatible new Android binary; Pages/OTA alone cannot update an older native host.

## Out-of-scope findings

No changes are silently imported from the separate source-audit worktree or unrelated historical checkouts. Production smoke must remain separate from loopback-isolated general UI tests.

## Recommended next step

Complete the authorized local/CI/Pages/production release cycle with the frozen implementation and retain the independent content/device review boundaries.
