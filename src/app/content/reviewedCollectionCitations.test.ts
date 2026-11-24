import { describe, expect, it } from "vitest";
import { ALL_AZKAR } from "./azkar";
import citations from "./reviewedCollectionCitations.json";
import fallbacks from "./homeReminderFallbacks.json";
import review from "../../../docs/agent/evidence/collection-citation-review-2026-10-18.json";
import corrections from "../../../docs/agent/evidence/dhikr-source-review-2026-11-24.json";

describe("reviewed collection citations", () => {
  it("uses precise bilingual citations and explicitly records corrections to historical references", () => {
    expect(Object.keys(citations)).toHaveLength(165);
    for (const row of review.updated) {
      const zikr = ALL_AZKAR.find((item) => item.id === row.id)!;
      const citation = citations[row.id as keyof typeof citations];
      expect(zikr.sourceUrl, row.id).toBe(citation.url);
      if (decodeURIComponent(citation.url) === row.sourceUrl && citation.reference === row.preciseReference) {
        expect(zikr.sourceReference, row.id).toContain(row.originalReference);
      } else {
        const correction = corrections.entries.find((entry) => entry.id === row.id);
        expect(correction?.status, row.id).toBe("corrected");
        expect(correction?.sourceUrl, row.id).toBe(citation.url);
        expect(zikr.sourceReference, row.id).toBe(citation.reference);
      }
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
