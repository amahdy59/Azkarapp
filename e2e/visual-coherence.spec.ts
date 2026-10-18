import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { t } from "../src/app/i18n";

for (const language of ["ar", "en"] as const) {
  test(`ordinary choice controls retain consistent paint and keyboard selection in ${language} @cross-browser`, async ({
    page,
  }) => {
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem("azkarapp.state.v1", JSON.stringify({ settings: { language, reduceMotion: true } }));
    }, language);
    await page.setViewportSize({ width: 390, height: 844 });
    for (const theme of ["midnight", "light", "dark"] as const) {
      await page.goto("/#/settings/appearance");
      await page.getByTestId(`theme-option-${theme}`).click();
      const paint = await page.getByTestId(`theme-option-${theme}`).evaluate((element) => {
        const style = getComputedStyle(element);
        return { radius: style.borderRadius, border: style.borderColor, background: style.backgroundColor };
      });
      await page.goto("/#/settings/reading");
      const medium = page.getByTestId("reading-text-size-medium");
      await expect(medium).toBeChecked();
      const readingPaint = await medium.evaluate((element) => {
        const style = getComputedStyle(element);
        return { radius: style.borderRadius, border: style.borderColor, background: style.backgroundColor };
      });
      expect(readingPaint).toEqual(paint);
      await medium.focus();
      await page.keyboard.press(language === "ar" ? "ArrowLeft" : "ArrowRight");
      await expect(page.getByTestId("reading-text-size-large")).toBeChecked();
      await expect(medium).not.toBeChecked();
      await page.getByTestId("reading-text-size-medium").click();
      const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      expect(scan.violations).toEqual([]);
    }
  });

  test(`browse page gutters align in ${language} without changing Library mobile tabs @cross-browser`, async ({
    page,
  }) => {
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem("azkarapp.state.v1", JSON.stringify({ settings: { language, reduceMotion: true } }));
    }, language);
    for (const width of [390, 820]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/#/azkar");
      const library = await page.locator(".field-shell").boundingBox();
      expect(library).not.toBeNull();
      if (width === 390) {
        for (const tab of await page.getByRole("tab").all()) {
          const box = await tab.boundingBox();
          expect(box?.width).toBe(44);
          expect(box?.height).toBe(44);
        }
      }
      await page.goto("/#/home");
      const home = await page.getByTestId("home-context-grid").boundingBox();
      expect(home).not.toBeNull();
      expect(home!.x).toBeCloseTo(library!.x, 0);
      expect(home!.width).toBeCloseTo(library!.width, 0);
      await page.goto("/#/settings");
      const settings = await page
        .getByRole("searchbox", { name: t(language, "settings.searchPlaceholder") })
        .boundingBox();
      expect(settings).not.toBeNull();
      expect(settings!.x).toBeCloseTo(library!.x, 0);
      expect(settings!.width).toBeCloseTo(library!.width, 0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });
}
