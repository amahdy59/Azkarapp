import { expect, test } from "@playwright/test";

for (const language of ["ar", "en"] as const) {
  test(`counter numerals follow ${language} reading order @cross-browser`, async ({ page }) => {
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language, reduceMotion: true, routineModes: { morning: "complete" } },
          profile: { isGuest: true },
        }),
      );
    }, language);
    await page.setViewportSize({ width: 390, height: 900 });
    for (const [route, id] of [
      ["azkar/morning/21", "counter-surface"],
      ["counter", "custom-counter-surface"],
      ["friday/salawat", "salawat-counter"],
    ]) {
      await page.goto(`/#/${route}`);
      const counter = page.getByTestId(id);
      await expect(counter).toBeVisible();
      await counter.click();
      const tally = counter.locator("p");
      const current = tally.locator("bdi").nth(0);
      const target = tally.locator("bdi").nth(1);
      await expect(current).toHaveText(language === "ar" ? "١" : "1");
      await expect(target).toHaveText(language === "ar" ? "١٠٠" : "100");
      const currentBox = (await current.boundingBox())!;
      const targetBox = (await target.boundingBox())!;
      if (language === "ar") expect(currentBox.x).toBeGreaterThan(targetBox.x + targetBox.width);
      else expect(currentBox.x + currentBox.width).toBeLessThan(targetBox.x);
      await expect(counter).toHaveAttribute("aria-label", language === "ar" ? /١ \/ ١٠٠$/ : /1 \/ 100$/);
      await page.screenshot({ path: `output/playwright/counter-direction/${id}-${language}.png` });
    }
  });
}
