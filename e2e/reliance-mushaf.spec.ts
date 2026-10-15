import { expect, test } from "@playwright/test";
import { getAzkarForMode } from "../src/app/content/azkar";

for (const language of ["ar", "en"] as const) {
  test(`@cross-browser ${language} reliance dhikr preserves its text with Mushaf lettering`, async ({ page }) => {
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({ settings: { language, reduceMotion: true }, profile: { isGuest: true } }),
      );
    }, language);
    for (const category of ["morning", "evening"] as const) {
      const entries = getAzkarForMode(category, "complete");
      const index = entries.findIndex((item) => item.id.endsWith("hm-83"));
      await page.goto(`/#/azkar/${category}/${index + 1}`);
      const text = page.getByTestId("zikr-text");
      await expect(text.locator("[data-quran-glyph]").first()).toBeVisible();
      expect(await text.textContent()).toContain(entries[index]!.arabicText.split(" ")[0]);
      expect(
        await text
          .locator("[data-quran-glyph]")
          .first()
          .evaluate((node) => getComputedStyle(node).fontFamily),
      ).toContain("qcf-v2-page-207");
      await expect(text.locator("[data-quran-glyph]")).toHaveCount(12);
      for (const width of [320, 390, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        expect(await text.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
      }
    }
  });
}
