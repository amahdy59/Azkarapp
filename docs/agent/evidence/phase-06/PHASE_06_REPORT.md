# Phase 06 — Azkar Library and Search

## Summary

The Library index and category cards were largely in good shape. Search was not: **Arabic search did not work at all** for ordinary typing, in an Arabic-first app.

## Primary finding — Arabic search was broken

`SearchScreen` matched Arabic with a raw `zikr.arabicText.includes(query)`. Two facts make that fail:

- Sampled against the corpus, **100% of azkar carry diacritics** and 56% use hamza-alef variants.
- Nobody types tashkeel into a search box.

Confirmed in a real browser before touching any code: searching `باسمك اللهم` — text that _is_ in the corpus as `بِاسْمِكَ اللَّهُمَّ` — returned "لم يتم العثور على أذكار".

**Fix:** `content/searchNormalization.ts` builds a comparison key — strips tashkeel and tatweel, folds alef variants, taa marbuta, alef maqsura and hamza carriers, lowercases Latin, collapses whitespace.

Three deliberate properties:

1. **Content is never mutated.** Normalization produces a _match key only_. The acceptance criterion "content text is not altered by normalization" is satisfied structurally rather than by convention. Verified in the browser — results still render `بِاسْمِكَ اللَّهُمَّ` with diacritics intact — and asserted by an e2e test.
2. **Folding is conservative.** Only variants routinely dropped when typing are folded. A unit test asserts distinct roots (`كتب`/`كسب`, `نور`/`نار`) do **not** collapse. In devotional content a false match is worse than a missed one, so no stemming was added.
3. **Keys are cached per zikr id**, not recomputed per keystroke. The corpus is static.

## Secondary findings fixed

- **Internal roadmap messaging in production UI.** The Library footer read "New collections will appear after their content review is complete." Removed with its i18n keys (Step 3 item 6). The separate `legal.reviewNotice` in Settings was left alone — it belongs to Phase 09.
- **Category cards marked completion by colour alone.** A finished collection differed from an in-progress one only by the chevron's hue. Added a check glyph. Same defect class as DEC-027's `BottomNav` finding.

## Verified as already correct — no change made

- `CategoryCard` already suppressed the progress bar for not-started collections, which is an explicit acceptance criterion.
- The Library tabs already used the APG `TabList` from Phase 03, with correct `aria-label` and panel wiring.

## Verification

Full `pnpm check` + `pnpm test:e2e`. Ten unit tests for the normalizer, a `CategoryCard` test asserting the completion cue is non-colour, and four e2e tests (undiacritized matching, content-not-altered, live-region count, empty state). The search defect was proven in a browser _before_ the fix and re-verified after.

## Not done

**Taxonomy grouping (Step 1 item 4).** Presentation-only grouping needs product input on the group names; inventing them would be a content decision outside this phase's authority. No search dependency was added, per the phase's prohibited list.

## Known limitations

No before/after screenshots — shared with Phases 02–05.
