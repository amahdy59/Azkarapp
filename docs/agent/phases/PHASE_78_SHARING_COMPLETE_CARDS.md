# Phase Report — Phase 78: Complete sharing cards

## Objective

Apply the owner's eighteen sharing-review recommendations, preserve reviewed content, and provide actual local samples before publication. DEC-217 supersedes the previous continuation-card policy. No commit, push or deployment is authorized for this phase.

## Scope completed

| Recommendation                           | Implementation/evidence                                                                                                                                                                                                  |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1. Never split a zikr                    | Indivisible measured blocks, including selected extras and available citation; corpus and real-font browser bounds.                                                                                                      |
| 2. Explicit incompatible-format recovery | Disabled incompatible formats, explanatory copy and compatible-size/Text/Link recovery; no clipping, tiny body font or silent removal.                                                                                   |
| 3. Long-surah reminders                  | Reviewed multi-page metadata classifies Al-Mulk/Tabarak, As-Sajdah and other eligible surahs. Standalone reminder includes localized name, exact reviewed benefit/source, reading instruction and mandatory Mushaf QR.   |
| 4. Consistent export policy              | One adapter feeds image, semantic HTML, Text and ZIP. Full surah verses/translation/pronunciation never enter those payloads. Link targets the first reviewed Mushaf page.                                               |
| 5. Supporting sections stay complete     | Measurement includes every selected section before any PNG encoding; incompatible content fails explicitly.                                                                                                              |
| 6. Pack shorter azkar                    | Up to four short whole blocks fit by measurement, with compact gaps; reminders stay standalone for exact QR destinations.                                                                                                |
| 7. Persistent actions                    | Compact header and action footer; explanation/customization/status remain in the scrolling body. The 320px/200% regression caught and repaired header/footer crowding.                                                   |
| 8. Preview prominence                    | Preview precedes themes/content options, wider desktop dialog, enlarged inspection and visible enlargement control.                                                                                                      |
| 9. Explicit scope                        | This card / Selected cards / Entire collection and image count; only scoped files and matching text reach native share or ZIP.                                                                                           |
| 10. Independent language                 | Export-label language is independent from the optional reviewed English meaning.                                                                                                                                         |
| 11. Visual theme choices                 | Three named pressed buttons with olive, gold and lavender palette swatches.                                                                                                                                              |
| 12. Format clarity                       | Named aspect ratios, measured compatibility and visible explanation of unavailable sizes.                                                                                                                                |
| 13. Progressive disclosure               | One Customize content disclosure for meaning, pronunciation, benefit and ordinary-card QR. Reminder benefit/source/QR remain mandatory.                                                                                  |
| 14. Overview and continuity              | Numbered thumbnail navigation/selection; cosmetic changes restore the active item.                                                                                                                                       |
| 15. Artwork hierarchy                    | Larger single-zikr text, restrained botanical corners, opaque reading surfaces, no repeated single-item heading, concise site footer and QR clearance.                                                                   |
| 16. Honest device behavior               | Capability checks use actual chosen files/text/link; Share/Save/Copy actions remain distinct. Status reports handoff, not delivery; cancellation never downloads.                                                        |
| 17. Accessible dialog and content        | Shared modal focus containment/Escape/restore, 44px targets, Arabic direction, selectable HTML and Text, scoped announcements, narrow/200% and axe checks.                                                               |
| 18. Meaningful verification              | Corpus, reminder/QR, fit recovery, independent meaning, selected-payload and browser regressions; actual exports and dialog screenshots. Physical-device and human assistive-technology work remains explicitly pending. |

## Files changed

- Product: CollectionShareModal.tsx, CategoryScreen.tsx, shareLayout.ts, collectionShareCard.ts, Arabic/English dictionaries, semantic theme palette tokens.
- Tests: sharing-refinement.spec.ts, CollectionShareModal.test.tsx, shareLayout.test.ts, collectionShareCard.test.ts.
- Contracts: README.md, ARCHITECTURE.md, DESIGN_SYSTEM.md, DESIGN_SPEC_COVERAGE.md, QUALITY_CHECKLIST.md, agent INDEX.md and DECISION_LOG.md.
- Evidence/governance: this report and phase78-sharing evidence; scripts/bundle-baseline.json records intended measured growth.

## Components added or modified

Existing CollectionShareModal and its canvas renderer/layout were refined. CategoryScreen now opens the same modal lazily, following the Reader boundary. No runtime dependency, router, persistence or design-system replacement.

## User-visible changes

Complete individual azkar never continue on a second image. Long surahs share reading reminders rather than verse posters. Users can preview, inspect, choose specific cards, change export language/theme/size and share or save exactly their selection. Incompatible combinations provide explicit recovery.

## Accessibility work

Persistent reachable actions, compact resizing-safe header, scrollable focus targets, labelled controls, palette names beyond color, mandatory available attribution, selectable semantic text and scoped statuses. Unit and browser scans do not establish full WCAG compliance.

## Tests added or updated

Atomic corpus and grapheme integrity; long-surah policy in both languages; mandatory exact QR and layout clearance; complete extras overflow; selected-file capability/payload; fit recovery and independent meaning; real Arabic font bounds, offline alternatives, single counter continuity, reminder Mushaf destinations, theme continuity, selected download, 320px/200% footer geometry, keyboard containment/Escape and automated WCAG checks.

## Commands run

| Command                                                                                                              | Result                                                                                                                                                                                                                                                                       |
| -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pnpm test:run src/app/share src/app/components/CollectionShareModal.test.tsx src/app/screens/CategoryScreen.test.tsx | Passed: 8 files, 69 tests; 12.84 seconds.                                                                                                                                                                                                                                    |
| Final sharing browser matrix                                                                                         | Passed: 32 sharing cases across desktop/mobile/tablet Chromium, desktop Firefox and mobile WebKit. Four projects passed 28 cases in 3 minutes; WebKit sharing plus navigation rerun passed 6 cases in 2.5 minutes.                                                           |
| pnpm check                                                                                                           | Passed all 10 stages; 113 seconds. Initial unused test import was fixed and intended bundle baseline growth recorded; no gate was weakened.                                                                                                                                  |
| E2E_BASE_URL=http://127.0.0.1:4277 pnpm test:e2e                                                                     | 463 passed, 1 existing skipped, 1 failed; 22 minutes. Unrelated WebKit navigation timed out. The unchanged isolated navigation/sharing rerun passed all 6 cases. Final sharing matrix above also passed after the last refinements. The full suite is not reported as clean. |
| pnpm build:pages                                                                                                     | Passed; build 31.57 seconds, including bundle budgets and CSS utility checks.                                                                                                                                                                                                |

## Visual/manual evidence

Actual PNG exports and dialog captures are preserved in docs/agent/evidence/phase78-sharing:

- olive-group.png: Arabic morning collection with three complete azkar, repetition counts and citations.
- single-zikr.png: complete Ayat al-Kursi in the gold/navy single-zikr design.
- mulk-reminder-ar.png: Arabic Al-Mulk reminder with the exact reviewed benefit/source and mandatory Mushaf QR; the benefit uses the primary readable type size.
- sajdah-reminder-ar.png: Arabic As-Sajdah reminder preserving the reviewed qualification about the narration and its source.
- s-hm-110a-reminder.png and s-hm-110b-reminder.png: English As-Sajdah and Al-Mulk reminders.
- sharing-phone.png and sharing-mulk-phone.png: actual Arabic dialog at 320×700, complete preview and persistent action footer.
- sharing-selection-200percent.png: resized selection controls, wrapping labels and reachable footer.

Visual inspection confirmed complete devotional text, readable attribution, restrained decoration, opaque reading surfaces and QR clearance. Selectable HTML includes item names and repetition/reminder context. Browser automation includes Chromium desktop/phone/tablet, Firefox and WebKit. Manual keyboard checks supplement automation; physical assistive-technology sessions remain pending.

## Documentation updated

Sharing ownership, atomic content policy, mandatory reminder QR/link, visual anatomy, scope matching, language independence, verification checklist, design coverage, active phase and approved decision.

## Decisions recorded

DEC-217 records the approved eighteen recommendations and explicitly retains the no-push restriction. The initial-route gzip baseline is recorded at 151301 bytes (+2.6% from the September 27 baseline); hard bundle ceilings and growth tolerance stay unchanged. Category-level lazy loading avoids loading sharing code merely by opening a collection.

## Known limitations or remaining risks

- The full browser run had one unrelated WebKit navigation timeout. Its unchanged rerun passed but remained near the timeout; a clean full merge gate is still required before future publication.
- Actual Android/iPhone share sheets, destination limits, WhatsApp/Instagram compression, Story overlays, physical QR scans, archive extraction and clipboard permissions need device evidence.
- NVDA/VoiceOver/TalkBack sessions and user usability testing remain pending; automated scans cannot certify complete accessibility.
- All sources/benefits/counts are existing reviewed content. This phase neither invents religious claims nor modifies reviewed reading data.
- Some complete content-plus-extras combinations cannot fit any image preset at readable sizes. Text and Link remain available; nothing is silently removed.
- Local screenshots/QRs target the local preview base. Deployed exports use the existing configured deployment base after an authorized release.

## Out-of-scope findings

The original checkout's unrelated dirty work remains untouched. Release notes and deployment state remain unchanged.

## Recommended next step

Review the local samples and complete real-device/assistive-technology evidence. Keep publication paused until the owner explicitly authorizes pushing.
