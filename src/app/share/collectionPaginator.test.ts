import { describe, expect, it } from "vitest";
import { paginateCollection, estimateZikrCardWeight } from "./collectionPaginator";
import { getAzkarByCategory } from "../content/azkar";

describe("collectionPaginator", () => {
  it("returns empty array for empty items", () => {
    expect(paginateCollection([])).toEqual([]);
  });

  it("handles items less than target pages gracefully", () => {
    const items = [
      { arabicText: "الحمد لله", benefitArabic: "فائدة", repetitionCount: 1 },
      { arabicText: "سبحان الله", benefitArabic: "فائدة", repetitionCount: 3 },
    ];
    const pages = paginateCollection(items, { targetPages: 5 });
    expect(pages).toHaveLength(2);
    expect(pages[0].pageNumber).toBe(1);
    expect(pages[0].totalPages).toBe(2);
    expect(pages[0].items).toHaveLength(1);
  });

  it("partitions morning azkar (25 items) into 3-4 cards per group by default (7 pages)", () => {
    const morningAzkar = getAzkarByCategory("morning");
    expect(morningAzkar.length).toBe(25);

    const pages = paginateCollection(morningAzkar);
    expect(pages).toHaveLength(7);

    // Verify all 25 items are accounted for and in original sequence order
    const flattened = pages.flatMap((p) => p.items);
    expect(flattened).toHaveLength(25);
    expect(flattened.map((z) => z.id)).toEqual(morningAzkar.map((z) => z.id));

    // Verify every page strictly has 3 to 4 cards
    pages.forEach((page) => {
      expect(page.items.length).toBeGreaterThanOrEqual(3);
      expect(page.items.length).toBeLessThanOrEqual(4);
      expect(page.totalPages).toBe(7);
    });
  });

  it("partitions evening azkar (23 items) into 3-4 cards per group by default (6 pages)", () => {
    const eveningAzkar = getAzkarByCategory("evening");
    expect(eveningAzkar.length).toBe(23);

    const pages = paginateCollection(eveningAzkar);
    expect(pages).toHaveLength(6);

    const flattened = pages.flatMap((p) => p.items);
    expect(flattened).toHaveLength(23);
    expect(flattened.map((z) => z.id)).toEqual(eveningAzkar.map((z) => z.id));

    pages.forEach((page) => {
      expect(page.items.length).toBeGreaterThanOrEqual(3);
      expect(page.items.length).toBeLessThanOrEqual(4);
      expect(page.totalPages).toBe(6);
    });
  });

  it("supports explicit targetPages when requested", () => {
    const morningAzkar = getAzkarByCategory("morning");
    const pages = paginateCollection(morningAzkar, { targetPages: 5 });
    expect(pages).toHaveLength(5);
    expect(pages.flatMap((p) => p.items)).toHaveLength(25);
  });

  it("computes reasonable weights for short vs long azkar", () => {
    const shortItem = { arabicText: "سبحان الله وبحمده", repetitionCount: 100 };
    const longItem = {
      arabicText:
        "اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلاَّ بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلاَ يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلاَّ بِمَا شَاء وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالأَرْضَ وَلاَ يَؤُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ",
      repetitionCount: 1,
    };

    const shortWeight = estimateZikrCardWeight(shortItem);
    const longWeight = estimateZikrCardWeight(longItem);

    expect(longWeight).toBeGreaterThan(shortWeight);
  });
});
