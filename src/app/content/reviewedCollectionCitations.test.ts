import { describe, expect, it } from "vitest";
import { ALL_AZKAR } from "./azkar";
import citations from "./reviewedCollectionCitations.json";
import fallbacks from "./homeReminderFallbacks.json";
import review from "../../../docs/agent/evidence/collection-citation-review-2026-10-18.json";

describe("reviewed collection citations", () => {
  it("uses precise bilingual citations for all 165 verified originals and preserves their previous references", () => {
    expect(Object.keys(citations)).toHaveLength(165);
    for (const row of review.updated) {
      const zikr = ALL_AZKAR.find((item) => item.id === row.id)!;
      const citation = citations[row.id as keyof typeof citations];
      expect(zikr.sourceUrl, row.id).toBe(citation.url);
      expect(zikr.sourceReference, row.id).toContain(row.originalReference);
      expect(zikr.sourceReference, row.id).toContain(citation.reference);
      expect(zikr.sourceReferenceArabic, row.id).toContain(citation.referenceArabic);
      expect(zikr.sourceReferenceArabic, row.id).not.toMatch(/[A-Za-z]/);
    }
  });
  it("never promotes a Home alternative into the original collection's supporting citation", () => {
    expect(review.pending).toHaveLength(20);
    for (const [id, mapping] of Object.entries(fallbacks)) {
      expect(id in citations, id).toBe(!mapping.replacement);
    }
  });
});
