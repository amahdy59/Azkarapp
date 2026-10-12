import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const language of ["ar", "en"] as const) {
  test(`after-salat groups keep their order and reader counters in ${language} @cross-browser`, async ({
    page,
  }, testInfo) => {
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({ settings: { language, reduceMotion: true }, profile: { isGuest: true } }),
      );
    }, language);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("./#/azkar/after-prayer");
    const overview = page.getByTestId("category-overview");
    await expect(overview).toBeVisible();
    const headings = overview.getByRole("heading", { level: 2 });
    await expect(headings).toHaveCount(5);
    expect((await headings.allTextContents()).map((text) => text.split(" · ")[0])).toEqual(
      language === "ar" ? ["١", "٢", "٣", "٤", "٥"] : ["1", "2", "3", "4", "5"],
    );
    const opening = overview.locator('[data-ritual-group="prayer_opening"]');
    await expect(opening.locator("[data-zikr-select]")).toHaveCount(2);
    await expect(overview.locator('[data-ritual-group="prayer_tahlil"] [data-zikr-select]')).toHaveCount(2);
    await expect(overview.locator('[data-ritual-group="prayer_tasbih"] [data-zikr-select]')).toHaveCount(4);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(
      (
        await new AxeBuilder({ page })
          .include('[data-testid="category-overview"]')
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`after-prayer-${language}-phone.png`) });
    const secondPassage = opening.locator("[data-zikr-select]").nth(1);
    await secondPassage.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("reader-screen")).toHaveAttribute("data-zikr-index", "1");
    await expect(page.getByTestId("counter-surface")).toBeVisible();
    await page.goto("./#/azkar/after-prayer");
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(overview).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath(`after-prayer-${language}-desktop.png`) });
  });
}
