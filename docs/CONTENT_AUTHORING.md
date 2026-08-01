# Content authoring guide

Azkarapp keeps reviewed devotional content in `src/app/content` and treats wording, benefits, repetition counts, and citations as product data. Content changes should be small, traceable, bilingual, and independently reviewable.

## Add an item to an existing collection

1. Open the collection in `src/app/content/azkar.ts`, or its dedicated file such as `fridayDuas.ts`.
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
- `orderIndex`: unique inside the category. Reordering must not change IDs.
- `sourceUrl`, `preferredTiming`, `authenticityNote`, and `notes`: optional; add only when reviewed and useful to the reader.

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

The Friday collection is the reference example for route-specific content: `fridayDuas.ts` contains an optional introduction, 20 essential items, and 15 additional items with direct Arabic benefits and sources. It is imported only by the lazy Friday screen, keeping substantial occasional content out of the initial app bundle.
