import { describe, expect, it } from "vitest";
import { AUTHENTIC_AZKAR_COLLECTION } from "./authenticAzkar";

describe("reviewed Masbaha narration references", () => {
  it.each([
    ["auth_subhanallah_wabihamdihi", "bukhari:6405", "6405"],
    ["auth_baqiyat_salihat", "muslim:2137a", "2137a"],
  ])("keeps %s linked to the report supporting its displayed narration", (id, reference, number) => {
    const item = AUTHENTIC_AZKAR_COLLECTION.find((entry) => entry.id === id);
    expect(item).toBeDefined();
    expect(item!.sourceUrl).toBe(`https://sunnah.com/${reference}`);
    expect(item!.sourceRefAr).toContain(`#${number}`);
    expect(item!.sourceRefEn).toContain(`#${number}`);
    expect(item!.hadithTextAr).toBeTruthy();
    expect(item!.hadithTextEn).toBeTruthy();
  });
});
