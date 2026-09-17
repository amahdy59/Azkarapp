import { describe, expect, it } from "vitest";
import { getAzkarByCategory } from "./azkar";
import { FRIDAY_KAHF } from "./fridayKahf";
import { isLongSurah, splitMushafPages } from "./mushafPages";

describe("reviewed Mushaf pages", () => {
  it("uses reviewed multi-page metadata as the only long-surah signal", () => {
    expect(isLongSurah({ mushafPages: [{ page: 1, startAyah: 1, endAyah: 4 }] })).toBe(false);
    expect(
      isLongSurah({
        mushafPages: [
          { page: 1, startAyah: 1, endAyah: 4 },
          { page: 2, startAyah: 5, endAyah: 6 },
        ],
      }),
    ).toBe(true);
    expect(isLongSurah(undefined)).toBe(false);
  });

  it("splits at reviewed ayah boundaries without changing Quran text", () => {
    const source = "الأول ﴿١﴾ الثاني ﴿٢﴾ الثالث ﴿٣﴾";
    const pages = splitMushafPages(source, [
      { page: 10, startAyah: 1, endAyah: 2 },
      { page: 11, startAyah: 3, endAyah: 3 },
    ]);

    expect(pages.map(({ page, startAyah, endAyah }) => ({ page, startAyah, endAyah }))).toEqual([
      { page: 10, startAyah: 1, endAyah: 2 },
      { page: 11, startAyah: 3, endAyah: 3 },
    ]);
    expect(pages.map((page) => page.text).join("")).toBe(source);
  });

  it("covers every reviewed page and preserves each complete long surah", () => {
    const sleepSurahs = getAzkarByCategory("before_sleep").filter((zikr) => isLongSurah(zikr));
    const longSurahs = [...sleepSurahs, FRIDAY_KAHF[0]!];

    expect(longSurahs.map((zikr) => zikr.id)).toEqual(["s-hm-110a", "s-hm-110b", "friday-kahf"]);
    expect(longSurahs.map((zikr) => zikr.mushafPages?.length)).toEqual([3, 3, 12]);

    for (const zikr of longSurahs) {
      const pages = splitMushafPages(zikr.arabicText, zikr.mushafPages ?? []);
      expect(pages).toHaveLength(zikr.mushafPages!.length);
      expect(pages.map((page) => page.text).join("")).toBe(zikr.arabicText);
      expect(pages.at(-1)?.endAyah).toBe(zikr.verseCount);
    }
  });

  it("fails closed when page metadata does not match the source markers", () => {
    expect(
      splitMushafPages("الأول ﴿١﴾", [
        { page: 1, startAyah: 1, endAyah: 1 },
        { page: 2, startAyah: 3, endAyah: 3 },
      ]),
    ).toEqual([]);
  });
});
