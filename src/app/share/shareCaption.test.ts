import { describe, expect, it } from "vitest";
import { getImageCaption, getReadingLink, SHARED_APP_URL } from "./shareCaption";

describe("image captions and meaningful reading links", () => {
  it("keeps attribution once and preserves the complete prepared reading", () => {
    expect(getImageCaption()).toBe(SHARED_APP_URL);
    expect(getImageCaption("  complete reading  ")).toBe(`complete reading\n\n${SHARED_APP_URL}`);
    const deep = "Complete reading\nhttps://wa-zaker.com/#/azkar/morning/4";
    expect(getImageCaption(deep)).toBe(deep);
  });
  it.each([
    [undefined, false, undefined],
    ["invalid", false, undefined],
    ["javascript:alert(1)", false, undefined],
    [SHARED_APP_URL, false, undefined],
    ["https://wa-zaker.com/?utm_source=test", false, undefined],
    ["https://wa-zaker.com/#/home", false, undefined],
    ["https://wa-zaker.com/#/progress", false, undefined],
    ["https://wa-zaker.com/#/benefits", true, undefined],
    ["https://wa-zaker.com/#/benefits", false, true],
    ["https://wa-zaker.com/#/azkar/morning", true, undefined],
    ["https://wa-zaker.com/#/azkar/morning", false, true],
    ["https://wa-zaker.com/#/azkar/morning/4?mode=complete", true, true],
    ["https://wa-zaker.com/#/quran/42", true, true],
    ["https://quran.com/2/255", true, true],
    ["https://sunnah.com/bukhari:645#reference", true, true],
    ["https://example.com/", true, undefined],
  ] as const)("filters %s (single=%s)", (url, single, accepted) => {
    expect(getReadingLink(url, single)).toBe(accepted ? url : undefined);
  });
});
