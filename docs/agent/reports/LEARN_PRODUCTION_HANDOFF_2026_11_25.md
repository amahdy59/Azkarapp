# Phase Report — Learn production-readiness handoff, 2026-11-25

**Historical audit, superseded by [the completed release-scope remediation](LEARN_RELEASE_SCOPE_2026_11_25_REPORT.md).** The exposure assessment below records the state before the release owner authorized gating Arabic Al-Mukhtar and Wird. Those editions are now review-only alongside English Umrah. Only the scoped Arabic Umrah adaptation remains in ordinary production. Source corrections/translations remain unfinished; all local files/records are preserved.

## Objective

Give the combined release owner an accurate handoff of the completed document/Learn implementation, intentional review-only exclusions and unfinished authoring/source work. This report does not approve religious content for publication. The release owner in chat `01a2148b-c048-7a52-a278-e102040aa364` owns combined gates, release notes, commit/push and deployment.

## Scope completed

The approved local reader implementation is complete for the available editions: More → Learn/Azkar shortcut, integrated selectable HTML, contents/search, independent reading positions/bookmarks, explicit verified offline packs, three PDF appearances, book-language selection, bilingual Quran and source-bound native diagrams. No implementation gap was found in this narrow audit. See the [integration report](ENGLISH_LEARN_INTEGRATION_LOCAL_2026_11_25_REPORT.md) for the implementation/evidence inventory.

Fresh checks validate the current catalogue, exact optional asset bytes, authoring/source fidelity and the existing ordinary-production English exclusion. They do **not** resolve the source differences below. No religious wording, translation, source, count, publication flag or runtime component was changed during this handoff.

## Production assessment — content hold required

**Do not treat the current three Arabic books as original-source-approved because the software gates pass.** The present ordinary-production catalogue still exposes all three Arabic adaptations. Only the English Umrah draft has a review-only status. Therefore the English gate alone is insufficient to clear the source-conflicted Arabic books for release.

| Edition                | Current code exposure                                        | Actual readiness / required boundary                                                                                                                                                                                                                                 |
| ---------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Arabic Al-Mukhtar      | Ordinary production: visible; 64 source units, 3 PDFs        | Confirmed original/adaptation differences remain unapplied. Hold/exclude this edition until the separately traceable source restoration/review is complete.                                                                                                          |
| Arabic Prophetic Wird  | Ordinary production: visible; 137 source units, 3 PDFs       | Broken narrator boundaries and abbreviated travel text remain in the adaptation. Original-based corrections are prepared only as English review data. Hold/exclude this edition pending restoration/review.                                                          |
| Arabic Umrah           | Ordinary production: visible; 16 source units, 3 PDFs        | The owner permits use of the available adaptation. It is not the inaccessible 138-page original; preserve limited scope and the known al-Safa ellipsis. Independent source/accessibility acceptance remains unrecorded. Do not certify a full original reproduction. |
| English Umrah          | Development/isolated review only; 16 units, 3 × 27-page PDFs | Complete adaptation **draft**, not independently approved translation. Keep `draft-for-review` and the ordinary-production exclusion.                                                                                                                                |
| English Al-Mukhtar     | No complete catalogue edition                                | Genuinely unfinished. The accepted sample is not a full translation. Do not add a production option or claim coverage.                                                                                                                                               |
| English Prophetic Wird | No complete catalogue edition                                | Genuinely unfinished. The bedtime sample and two prepared source-restoration passages are not a full translation.                                                                                                                                                    |

The release owner has been informed of this production-exposure distinction. A safe combined release must protect the publishing boundary for the source-conflicted editions, or wait for their source-restoration/review. If no edition is cleared, keep the production Learn entry absent rather than presenting an empty/unfinished catalogue. Runtime gating and any final release-scope decision belong to the release owner; this handoff does not silently change the shared App/navigation or claim content approval.

## Source blockers and evidence

The owner explicitly identifies the original references as authoritative for **both** languages. The [source ledger](../../learning/SOURCE_REVIEW_2026_11_25.md) records visually confirmed differences and distinguishes them from uncompleted diagnostics:

- **Al-Mukhtar:** confirmed substituted Quran selections include p9/items 2–4 and p12/items 17–26, with further differences on pp15–18. Items 27, 45 and 58 lack their original numbered prayer cards. Items 69–71 have broken/merged extraction. Nine absent dedicated card numbers are a diagnostic inventory; do not automatically call all nine missing matn or hide gaps by renumbering. The existing 19 source-compared restorations on pp32–35 must be preserved.
- **Wird:** the p18 narrator/introduction boundary and complete travel supplication on original PDF pp125–126 require restoration. `english-wird-source-overrides.json` records the original-based English draft, exact Quran pairings, three declarations of Allah's greatness, return wording, glossary and following report. It does not apply Arabic corrections or complete English authoring.
- **Umrah:** only the current 16-page adaptation is available for the English draft. The expired full-original download is not a reason to request a new link again: the owner directs proceeding with available evidence. Keep the al-Safa ellipsis explicitly identified; do not invent its omitted text or claim complete original coverage.

The cached originals are still present and their digests match the ledger:

| Original   | Local evidence                                                            | SHA-256                                                            |
| ---------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Al-Mukhtar | `output/pdf/book-improvements-2026-11-25/sources/al_mukhtar_original.pdf` | `bad86e98b231009379cf29c3b19d2cfba04ff6145af5d32fd47b5cebed0e9e51` |
| Wird       | `output/english-editions/wird-original.pdf`                               | `8b8d8482ed0c7f1a8a9c3714414a0c1c4488bfd87567c644837f0979c06d5816` |

These originals need visual/semantic comparison: their extracted glyphs/order are unreliable. Some printed selections are excerpts or noncontinuous quotations, so a blanket OCR/nearest-verse replacement is not a safe deployment remediation. Follow `AGENTS.md` source-integrity and source-conflict rules; preserve counts, attributions, boundaries, source-page identities and a correction ledger. Do not rewrite the religious source during combined-gate repair.

## Files changed in this handoff

- This report.
- `docs/agent/evidence/learn-production-handoff/catalogue-audit.json`: timestamped snapshot of current exposure, units and verified asset identities.

No runtime/source file, release-note manifest, dependency, commit or deployment was changed. Earlier phase files remain part of the combined uncommitted batch; preserve them and every independent working scope.

## Components added or modified

None in this continuation. The completed native reader/data/offline/PDF components are documented in the integration report. Combined shared-overlay/header edits happened after that checkpoint and require the release owner's combined validation; historical reader checks are not an exact-commit release certificate.

## User-visible behavior

Unchanged in this handoff. Local review still offers Arabic books and the complete English Umrah adaptation. The production review gate hides English Umrah; it is not an access-control mechanism for public repository files. Committing optional draft assets/source to a public repository makes those files directly accessible even when the app omits their catalogue entry. Do not describe the UI gate as private storage or as independent source approval.

## Accessibility work

No new accessibility implementation in this handoff. Existing keyboard, focus, opaque overlay, 320px/200% text, RTL/LTR, language tags and diagram evidence remain in the [gallery](../evidence/english-learn-integration/README.md). Actual TalkBack/VoiceOver, physical-device and PDF-reader reading-order acceptance is not recorded. Do not claim complete WCAG/PDF-UA conformance from automated results.

## Tests added or updated

No assertions were changed. Existing targeted tests were rerun with a single worker to avoid competing with combined gates. Packaging tests compare the 217 Arabic units with the **current adaptations**, plus 16 English units and the exact corpus-bound Quran pairs. They do not compare every unit with the authentic printed originals and must not be used to clear the source blockers.

## Commands run and exact results

| Command / check                                                                                                                                                                       | Result                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm exec vitest run src/app/learning/catalogue.test.ts scripts/learning-books.test.mjs scripts/english-book-editions.test.mjs scripts/english-book-samples.test.mjs --maxWorkers=1` | PASS: 4 files, 21 tests, 22.37 s. Catalogue gate, source-adaptation fidelity, English pairing/geometry and manifest identities remain intact. |
| Narrow Node catalogue/asset audit                                                                                                                                                     | PASS: 4 edition records, 22 asset references, 19 distinct immutable assets. Every recorded size and SHA-256 matches its local file.           |
| Cached original digest check                                                                                                                                                          | PASS: both original PDFs are present and match the ledger digests above.                                                                      |
| Targeted report/audit formatting                                                                                                                                                      | Recorded after writing this handoff; no broad gate requested.                                                                                 |

No broad `pnpm check`, Pages build, browser matrix, audit, commit/push or deployment is duplicated here. The earlier integration checkpoint passed 56 focused tests, an 18-case three-engine Learn suite, three consecutive WebKit origin-outage cases, nine appearance reviews, the complete local non-browser gate and Pages build. The release owner must prove the final combined snapshot and hosted asset availability.

## Evidence and delivery requirements

The fresh [catalogue snapshot](../evidence/learn-production-handoff/catalogue-audit.json) records what was actually exposed at this audit before any subsequent release-owner changes. The existing source/integration reports remain historical evidence.

For any edition the release owner clears:

1. Include every referenced immutable asset in `docs/learning/assets/`; preserve old addressed files while cached clients may reference them.
2. The ordinary production build must keep `__LEARNING_REVIEW__` false. Do not deploy `.playwright-dist` or a build using the browser-test API namespace.
3. Production resolves optional assets from the repository's raw-content host. Verify the exact cleared pack/image/PDF URLs, lengths and hashes after the combined commit is public, then smoke-test opening, navigation, offline saving and an explicit PDF export.
4. PDFs stay outside the installation precache. Do not move draft HTML/PDF/ZIP artifacts from ignored `output/` into `public/` to make links work.
5. Release notes must describe only actual cleared capabilities. They must not advertise three complete English books, full 138-page Umrah coverage, finished source reconciliation or complete accessibility approval.

## Documentation updated

This bounded handoff and audit snapshot supplement the existing phase/report/source ledgers. The shared active index, architecture, runtime catalogue and release manifest are left for the release owner to coordinate.

## Decisions recorded

The owner authorizes coordination and a verified combined release. The release owner is solely responsible for publication operations; this chat remains a specialist handoff. Existing source/translation review boundaries remain intact. No new religious-source acceptance is inferred from the release request or from a green software gate.

## Known limitations or remaining work

- Full English Al-Mukhtar and Wird authoring remains unfinished, as explicitly reported to the owner previously.
- Arabic original-source reconciliation is unfinished, including the confirmed differences above; unrestricted publication of those editions is not cleared by this handoff.
- English Umrah remains a complete limited-scope review draft, intentionally excluded from ordinary production.
- Prayer, ablution and Forty Nawawi modules are planned IA/content kinds, not completed modules or authorized new religious-text authoring in this implementation phase. Do not add placeholders or imply those modules ship.
- Independent language/religious-source and physical-device assistive-technology acceptance remains pending.

## Out-of-scope findings

The large shared checkout contains independently approved UI/audio/native changes. This audit does not certify or alter them. No additional broad-gate worker or release operation was started.

## Recommended next step

The release owner should settle the Learn publication boundary before the combined commit/deployment. Keep source-conflicted/unreviewed editions in local review while completing the traceable restoration and unfinished translations in their own content checkpoints. Run combined final gates once against the chosen release scope, then verify only the cleared editions in production.
