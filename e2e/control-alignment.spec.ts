import { expect, test } from "@playwright/test";
import { t } from "../src/app/i18n";

for (const language of ["ar", "en"] as const) {
  test(`shared control alignment and spacing in ${language} @cross-browser`, async ({ page }) => {
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({ settings: { language, reduceMotion: true }, profile: { isGuest: true } }),
      );
    }, language);
    for (const width of [390, 820, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/#/home");
      const cards = page.locator('[data-density="summary"]');
      await expect(cards).toHaveCount(5);
      await page.evaluate(() => document.fonts.ready);
      await expect(async () => {
        const geometry = await cards.evaluateAll((cards) =>
          cards.map((card) => {
            const icon = card.querySelector("[data-prayer-icon]")!.getBoundingClientRect();
            const heading = card.querySelector("h3")!.getBoundingClientRect();
            return { icon: icon.y, heading: heading.y };
          }),
        );
        expect(
          Math.max(...geometry.map((item) => item.icon)) - Math.min(...geometry.map((item) => item.icon)),
        ).toBeLessThanOrEqual(1);
        expect(
          Math.max(...geometry.map((item) => item.heading)) - Math.min(...geometry.map((item) => item.heading)),
        ).toBeLessThanOrEqual(1);
      }).toPass({ timeout: 15000 });
      await page.goto("/#/settings");
      await expect(page.getByTestId("theme-option-midnight")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.goto("/#/counter");
      await page.getByTestId("counter-target-filter").click();
      await page.getByRole("menuitem", { name: t(language, "counter.custom"), exact: true }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.getByRole("dialog")).toHaveCSS("animation-name", "none");
      const ordinaryButtons = page.locator('[data-slot="button"]');
      expect(await ordinaryButtons.count()).toBeGreaterThanOrEqual(2);
      for (const button of await ordinaryButtons.all()) {
        if (!(await button.isVisible())) continue;
        const insets = await button.evaluate((element) => {
          const style = getComputedStyle(element);
          return { left: style.paddingLeft, right: style.paddingRight, height: element.getBoundingClientRect().height };
        });
        expect(insets.left).toBe(insets.right);
        expect(insets.height).toBeGreaterThanOrEqual(44);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });
}
