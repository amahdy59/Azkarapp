import { describe, expect, it } from "vitest";
import { ALL_AZKAR } from "../content/azkar";
import { getSharingBenefitExcerpt, getSharingWordMeanings } from "./shareDetails";
import { getShareSections, toShareItem } from "./shareLayout";

describe("reviewed sharing details", () => {
  const kursi = ALL_AZKAR.find((entry) => entry.canonicalKey === "quran-002-255")!;
  it("does not turn editorial benefits into hadith quotations", () => {
    expect(getSharingBenefitExcerpt(kursi, "ar")).toBeUndefined();
    expect(toShareItem(kursi, "ar").benefit).toBeUndefined();
    const narration = "A complete narration with a benefit and its conditions.";
    const record = { ...kursi, hadithTextEnglish: narration, sharingBenefitExcerptEnglish: narration };
    expect(getSharingBenefitExcerpt(record, "en")).toBe(narration);
    expect(
      getSharingBenefitExcerpt({ ...record, sharingBenefitExcerptEnglish: "An invented promise" }, "en"),
    ).toBeUndefined();
  });
  it("selects only vocabulary actually matched in the reviewed Quran passage", () => {
    const meanings = getSharingWordMeanings(kursi, "ar");
    expect(meanings).toHaveLength(3);
    expect(meanings.every((entry) => entry.source.includes("مجمع الملك فهد"))).toBe(true);
    expect(getSharingWordMeanings(kursi, "en")).toEqual([]);
    for (const canonicalKey of ["quran-112", "quran-113"]) {
      const zikr = ALL_AZKAR.find((entry) => entry.canonicalKey.startsWith(canonicalKey))!;
      expect(getSharingWordMeanings(zikr, "ar").length).toBeGreaterThan(0);
    }
  });
  it("retains citations when optional benefit or glossary evidence is included", () => {
    const item = { ...toShareItem(kursi, "ar"), benefitEvidence: "An explicitly reviewed excerpt" };
    const sections = getShareSections(item, { sources: false, benefit: true, wordMeanings: true });
    const source = sections.find((section) => section.key === "source")!;
    expect(source.text).toContain(item.sourceReference);
    expect(source.text).toContain(item.wordMeanings![0]!.source);
    expect(sections.filter((section) => section.key === "wordMeanings")).toHaveLength(3);
  });
  it("never infers a primary source by splitting a citation", () => {
    const item = { id: "reference", arabicText: "سبحان الله", sourceReference: "Book A 1; Book B 2" };
    expect(getShareSections(item, { primarySource: true }).find((section) => section.key === "source")?.text).toBe(
      item.sourceReference,
    );
    expect(
      getShareSections({ ...item, primarySourceReference: "Book A 1" }, { primarySource: true }).find(
        (section) => section.key === "source",
      )?.text,
    ).toBe("Book A 1");
  });
});
