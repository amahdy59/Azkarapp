# Content authoring guide

Azkarapp keeps reviewed devotional content in `src/app/content` and treats wording, benefits, repetition counts, and citations as product data. Content changes should be small, traceable, bilingual, and independently reviewable.

## Add an item to an existing collection

1. Open the collection in `src/app/content/azkar.ts`, or its dedicated file such as `comprehensiveDuas.ts`.
2. Copy a nearby `Zikr` object and change every field deliberately.
3. Add or update the colocated tests in `azkar.test.ts` and `localizedZikr.test.ts`.
4. Run `pnpm format`, `pnpm typecheck`, `pnpm test:run`, and `pnpm build`.

Use this minimal shape:

```ts
{
  id: "collection-topic-01",
  arabicText: "النص العربي المراجع",
  transliteration: "Reviewed transliteration, or an empty string until reviewed",
  translation: "Reviewed English meaning.",
  benefit: "English explanatory benefit; never present editorial prose as revelation.",
  benefitArabic: "فائدة عربية تحريرية واضحة.",
  repetitionCount: 1,
  sourceReference: "Sahih Muslim 0000.",
  sourceReferenceArabic: "صحيح مسلم ٠٠٠٠.",
  hadithText: "النص أو السياق العربي الداعم عند توفره.",
  attributionType: "taught_by_prophet",
  category: "existing_category",
  orderIndex: 1,
}
```

### Field rules

- `id`: permanent, unique, lowercase, and independent of display order. Never recycle an ID because favorites and progress store it.
- `arabicText`: exact reviewed Arabic. Do not silently normalize Qur’anic spelling or remove diacritics.
- `translation`: faithful meaning, not a source quotation unless explicitly licensed and attributed.
- `transliteration`: add only after review. Leave it empty rather than inventing one; the UI hides an empty value.
- `benefit` / `benefitArabic`: concise editorial explanation or established virtue. Keep it separate from the sacred text and source.
- `repetitionCount`: use a number greater than `1` only when the cited evidence establishes that count for the displayed context.
- `sourceReference` / `sourceReferenceArabic`: cite collection and number precisely. Arabic content should use the direct Arabic field instead of relying on automatic name replacement.
- `hadithText`: supporting Arabic evidence or context shown under “Evidence”; do not use it for an uncited claim.
- `attributionType`: distinguish what the report actually says: the Prophet ﷺ said, taught, or approved the words; reported them from another prophet; or the dua is Qur'anic or from a Companion.
- `orderIndex`: unique inside the category. Reordering must not change IDs.
- `sourceUrl`, `preferredTiming`, `authenticityNote`, and `notes`: optional; add only when reviewed and useful to the reader.

### Benefits evidence catalogue

The dedicated Benefits screen reads `src/app/content/zikrBenefits.ts`; it must not scrape general editorial `benefit` fields from every collection.

- Keep the display order Qur’an, authenticated hadith, then concise hadith-derived benefits.
- A Qur’an record must carry an exact surah/ayah reference and a direct Quran source URL. An excerpt must remain contiguous and must not be presented as the complete ayah.
- A hadith record must identify the collection and number. Reports outside Sahih al-Bukhari and Sahih Muslim must also record the named authentication relied upon.
- Every derived benefit must reference a stable hadith evidence ID. It may split multiple promises stated in one hadith, but must not infer a new promise or count.
- The 30-item derived collection is a reviewed product set, not a target to fill with generic encouragement. Changing its wording, count, or evidence mapping requires content review and invariant tests.
- Keep source links visible and include the same source in shared text so a benefit is never detached from its evidence.

### Mushaf page metadata for complete surahs

`mushafPages` is optional structural metadata for a reviewed, complete surah. It controls page separators and long-surah reader behavior; it is not devotional text and must never be used to rewrite, normalize, or reflow `arabicText`.

- Use the page numbering and ayah ranges from one identified, authoritative Madani Mushaf pagination source. Record the source, edition/version, review date, and reviewer in the change report or decision evidence.
- Add a range as `{ page, startAyah, endAyah }`. Page numbers must increase, ranges must be contiguous and non-overlapping, the first range must start at ayah 1, and the final range must end at the reviewed `verseCount`.
- Do not infer page boundaries from character count, line wrapping, viewport height, screenshots, or generated visual layout. A visual wrap is not a Mushaf page boundary.
- Every `endAyah` must match an existing ayah marker in the untouched `arabicText`. Do not add, remove, replace, normalize, or reposition Quran text or ayah markers to make metadata fit.
- Splitting by `mushafPages` must be byte-preserving: concatenating every generated page string in order must reproduce the original `arabicText` byte-for-byte.
- Multi-page metadata is the explicit signal for long-surah behavior. Short surahs continue to use the ordinary reader interaction unless separately reviewed multi-page metadata exists.
- Generators that rewrite content modules must preserve this metadata. Add tests for contiguous coverage, expected page ranges, generator preservation, and byte-for-byte reconstruction.

### The 604-page Mushaf layout files

`public/data/mushaf/<page>.json` holds the layout of one printed page: for each word, its position
in the verse, its line number on the page, whether it is the ayah marker, its reviewed Uthmani
text, and its QCF v2 `code_v2` glyph. The reference is fixed by DEC-089 — the King Fahd Complex
Madani Mushaf, fifteen lines a page — and nothing else may be used as a layout source.

- Regenerate with `pnpm prepare:mushaf` (needs network access to api.quran.com; nothing at runtime
  does). `--pages 1-10` limits the range and `--dry-run` writes nothing.
- The script only ever rewrites the **layout metadata**: line number and glyph. Each word's
  reviewed Uthmani `text` is carried through untouched, and a page is written only when every one
  of its words matches the reference one-to-one. A page with any mismatch is left alone and
  reported.
- Reviewing a regeneration means reviewing a layout change, not a text change. `git diff` on these
  files should show no change to any Arabic word; if it does, stop and treat it as a content change
  under the rules above.

Changing a page range requires the same independent source review as adding it. It does not authorize any change to Quran wording, spelling, diacritics, verse markers, translation, attribution, or repetition count.

## Add a new collection

1. Add its literal ID to `CategoryId` in `src/app/types.ts`.
2. Register its names and existing icon key in `src/app/content/categories.ts`.
3. Add the same ID to `CATEGORY_IDS` in `src/app/progress.ts` so persisted state is normalized safely.
4. Prefer a dedicated file for a substantial collection, export a typed `Zikr[]`, then import and spread it into `ALL_AZKAR` in `azkar.ts`.
5. Add a collection introduction with `isCollectionIntroduction: true` when readers need scope, timing, or non-prescription guidance. Introductions do not count toward totals.
6. Add a test for the total, stable IDs, ordering, and any core/additional split.

## Review checklist

- Compare Arabic wording, translation, source number, grading, timing, and count against primary or authoritative references.
- Distinguish a general dua from a practice specifically established for a time or event.
- Do not promise a reward, protection, or guaranteed response beyond the cited evidence.
- Keep Arabic UI fields free of English fallback text and verify both RTL and LTR views.
- Search for duplicate wording before adding it; reuse canonical reviewed text where practical, while keeping context-specific counts and benefits local.
- Confirm every category has content, IDs and order indexes are unique, and no displayed text contains placeholders or truncation.
- Run `pnpm check`; for layout or interaction changes also run the relevant Playwright spec or `pnpm test:e2e`.

The comprehensive dua collection is the reference example for lazy session content: `comprehensiveDuas.ts` contains an optional introduction, 20 essential items, and reviewed additional items with direct Arabic benefits, sources, contexts, and attribution types. Its Azkar Library category opens the standard collection, counter, completion, progress, and saved-item flow; Friday Mode references that same content and can start the same session. Keep large optional collections lazy and inject them into the shared session components rather than duplicating either content or UI.
