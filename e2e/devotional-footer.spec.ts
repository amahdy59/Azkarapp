import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { getAzkarForMode } from "../src/app/content/azkar";

for (const language of ["ar", "en"] as const) {
  test(`compact devotional footer in ${language} @cross-browser`, async ({ page }) => {
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
    const index = getAzkarForMode("morning", "complete").findIndex((zikr) => zikr.id === "m-hm-91");
    await page.goto(`/#/azkar/morning/${index + 1}`);
    const actions = page.getByTestId("reader-support-actions");
    const counter = page.getByTestId("counter-surface");
    for (const width of [320, 390, 820, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(actions).toBeVisible();
      await expect(actions.getByRole("button")).toHaveCount(3);
      for (const button of await actions.getByRole("button").all()) {
        const box = (await button.boundingBox())!;
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.width).toBeGreaterThanOrEqual(44);
      }
      const box = (await counter.boundingBox())!;
      expect(Math.round(box.height)).toBe(64);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: `output/playwright/footer-redesign/reader-${language}-${width}.png` });
    }
    await counter.click();
    await expect(counter).toHaveAttribute("aria-label", language === "en" ? /1 \/ 100$/ : /١ \/ ١٠٠$/);
    await page.getByTestId("reader-share-dock-button").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(counter).toHaveAttribute("aria-label", language === "en" ? /1 \/ 100$/ : /١ \/ ١٠٠$/);
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("reader-share-dock-button")).toBeFocused();
    const scan = await new AxeBuilder({ page })
      .include('[data-testid="reader-dock"]')
      .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
      .analyze();
    expect(scan.violations).toEqual([]);
    for (const [route, testId] of [
      ["counter", "custom-counter-surface"],
      ["friday/salawat", "salawat-counter"],
    ]) {
      await page.goto(`/#/${route}`);
      const surface = page.getByTestId(testId);
      await expect(surface).toBeVisible();
      expect(Math.round((await surface.boundingBox())!.height)).toBe(64);
      await page.screenshot({ path: `output/playwright/footer-redesign/${testId}-${language}.png` });
    }
  });
}
