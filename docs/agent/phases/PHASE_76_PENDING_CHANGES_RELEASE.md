# Phase Report — Phase 76: Pending changes review and release

## Objective

Review all pending changes, repair regressions, and release to main with successful Quality and GitHub Pages verification, as requested on 2026-10-02.

## Scope completed

Reviewed collection image sharing, botanical single-item cards, Mushaf focus controls, audio mappings, prescribed repetition, and player layout. Restored recording attribution and landscape reciter access. Added complete-text protection and recoverable collection generation errors. Corrected a hosted-audio checksum and invalidated the old audio cache. Removed debug globals and eager startup loading of the share renderer.

## Files changed

- Application/audio: App.tsx; AudioProvider.tsx and its tests; audioArchitecture.test.ts; audioAssetsCore.ts; audioAssetsDuas.ts; audioAssignments.ts; audioManifest.ts; audioTypes.ts; buildPlaybackPlan.ts; resolveAudioAsset.ts; validateAudioCatalog.ts; content/contentReview.ts; types.ts.
- Components/screens: CollectionShareModal.tsx and tests; FloatingAudioPlayer.tsx and tests; floating-audio-player.css; MushafImmersiveReader.tsx; MushafPageViewer.tsx and tests; CategoryScreen.tsx; KhatmahReaderScreen.tsx and tests; ReaderScreen.tsx.
- Sharing: canvasBotanicals.ts; collectionPaginator.ts and tests; collectionShareCard.ts and tests; shareDispatcher.ts and tests; zikrShareCard.ts and tests.
- Localization/test infrastructure: i18n/ar.ts; i18n/en.ts; src/test/isolatedSuites.ts; e2e/accessibility-new-surfaces.spec.ts; playwright.config.ts.
- Release/documentation: public/release-notes.json; ARCHITECTURE.md; DESIGN_SYSTEM.md; audio/architecture.md; agent/DECISION_LOG.md; agent/INDEX.md; this report and evidence.

## Components added or modified

Added CollectionShareModal and canvas/pagination/share helpers. Updated the existing player, Mushaf viewer, reader screens, and CategoryScreen. Reused native controls, shared dialog/buttons/icons, existing themes, and the existing audio controller. No runtime dependencies added.

## User-visible changes

Readers can share collections as image cards, choose daylight/midnight styling, navigate previews, and share/save individual cards or the set. The single-item image design includes botanical decoration. Mushaf centre taps toggle focus mode; Escape restores tools before leaving. New listening runs use the approved prescribed repetition default, with Play Once retained. Voice changes recalculate embedded repetitions; incompatible counts never round up into extra recitations.

## Accessibility work

Restored landscape access to the reciter and recording source menu. Collection controls have 44px targets, a correctly linked description, a scrollable short-window dialog, visible generation errors/retry, and a scoped status region. Axe and geometry checks run after the actual preview image appears. Existing keyboard, focus, reduced-motion, language, and offline checks remain enabled.

## Tests added or updated

Collection pagination/rendering/sharing/dialog coverage; oversized sacred-text rejection and retry; embedded-count voice changes and incompatible-count fallback; checksum-keyed URLs; expanded player attribution; Mushaf focus behavior; actual-preview accessibility and target checks.

## Commands run

| Command                                                                                | Result                                                                                                                                    |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| pnpm install --frozen-lockfile                                                         | PASS, pinned pnpm 11.19.0                                                                                                                 |
| pnpm check                                                                             | PASS on final code, all ten stages, 138.7 seconds                                                                                         |
| pnpm test:e2e                                                                          | PASS after landscape/attribution repair: 432 passed, 1 existing skip, 21.1 minutes; pre-push repeats the entire suite on the final commit |
| pnpm test:run (four affected suites)                                                   | PASS, 40 tests                                                                                                                            |
| pnpm test:run (audio plan/provider)                                                    | PASS, 29 tests                                                                                                                            |
| pnpm test:e2e e2e/audio-expanded-layout.spec.ts --project=desktop-chromium --retries=0 | PASS, 7 scenarios                                                                                                                         |
| pnpm build:pages                                                                       | PASS on final code: production build, PWA, bundle and CSS checks                                                                          |
| pnpm audit:prod                                                                        | PASS, no known vulnerabilities                                                                                                            |
| Changed hosted-audio byte/SHA-256 audit                                                | PASS, 54 recordings after correcting m-hm-95's hash; temporary audit script removed                                                       |
| git diff --check                                                                       | PASS                                                                                                                                      |

The first full browser run exposed missing recording credits and a hidden landscape reciter control; it was stopped and repaired. Subsequent validation caught stale assertions and a declaration-order error, all corrected without weakening gates. A temporary audit script was accidentally included by ESLint despite being Git-ignored; it was removed after the successful checksum audit. Final hooks and remote workflows remain mandatory; their completion is reported in the release chat.

## Visual/manual evidence

The final focused browser matrix passed 33/33 without retries: `pnpm test:e2e e2e/accessibility-new-surfaces.spec.ts e2e/audio-expanded-layout.spec.ts --retries=0` (4.3 minutes). Phone sharing and landscape audio screenshots were visually inspected.

Expanded-player screenshots cover narrow phone, phone, tablet, desktop rail, large desktop, enlarged text, and short landscape. Collection preview screenshots cover the configured Chromium device tiers. Release evidence is retained in agent/evidence/phase76. Real-device screen-reader and cutout testing remain manual.

## Documentation updated

Architecture, design system, audio architecture, decision log, index, and this report document sharing, approved repetition defaults, cache invalidation, and the release review. Release notes contain four matching Arabic/English outcomes for this deployment only.

## Decisions recorded

DEC-215 records the owner's explicit approval of prescribed repetition as the new default and the latest authorization to release all pending changes. Other reviewed content/count contracts remain unchanged.

## Known limitations or remaining risks

An individual item too long for a story slide produces a visible retry/error instead of an incomplete sacred-text image. Native multi-file sharing depends on browser support and otherwise downloads PNGs. Audio manifest 6 retires earlier downloads, requiring audio to be downloaded again; core offline reading/progress is unaffected. The deployed host already replaced bytes at existing paths; checksum-keyed URLs prevent stale HTTP cache reuse, but future uploads must use fresh versioned paths. Human audio/source review and real-device assistive-technology evidence are not established by automated tests.

## Out-of-scope findings

No schema, synchronization, prayer calculation, toolchain, dependency, bundle ceiling, or reviewed devotional wording/count change.

## Recommended next step

Complete physical-device VoiceOver/TalkBack and native sharing checks after the verified release.
