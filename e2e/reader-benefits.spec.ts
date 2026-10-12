import { expect, test } from "@playwright/test";
import { getAzkarForMode } from "../src/app/content/azkar";

const routes = [
  "friday-kahf/1",
  ...["s-hm-110a", "s-hm-110b"].map(
    (id) => `before-sleep/${getAzkarForMode("before_sleep", "complete").findIndex((z) => z.id === id) + 1}`,
  ),
  `illness-ruqyah/${getAzkarForMode("illness_ruqyah", "complete").findIndex((z) => z.id === "ir-baqarah") + 1}`,
];

for (const language of ["ar", "en"] as const) {
  for (const width of [320, 1440]) {
    for (const route of routes) {
      test(`Surah benefits stay in options ${route} in ${language} at ${width}px @cross-browser`, async ({ page }) => {
        await page.setViewportSize({ width, height: 844 });
        await page.addInitScript((language) => {
          localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
          localStorage.setItem(
            "azkarapp.state.v1",
            JSON.stringify({
              settings: { language, reduceMotion: true, routineModes: { before_sleep: "complete" } },
              profile: { isGuest: true },
            }),
          );
        }, language);
        await page.goto(`/#/azkar/${route}`);
        await expect(page.getByTestId("surah-reading-actions")).toBeVisible();
        await expect(page.getByTestId("surah-reading-actions").locator(":scope > button")).toHaveCount(3);
        await expect(page.getByTestId("reader-benefit-dock-button")).toHaveCount(0);
        await page.getByTestId("reader-mushaf-button").click();
        const mushaf = page.getByTestId("mushaf-immersive");
        await expect(mushaf).toBeVisible();
        await expect(mushaf.locator("footer")).toHaveCount(0);
        const rail = page.getByTestId("mushaf-rail-benefit");
        const usesRail = await rail.isVisible();
        if (usesRail) await rail.click();
        else {
          await page.getByTestId("mushaf-immersive-more").click();
          await page.getByTestId("mushaf-quick-benefit").click();
        }
        await expect(page.getByTestId("reference-sheet")).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(page.getByTestId("reference-sheet")).not.toBeVisible();
        await expect(mushaf).toBeVisible();
        await expect(usesRail ? rail : page.getByTestId("mushaf-immersive-more")).toBeFocused();
        await page.goto("/#/azkar/morning/1");
        await expect(page.getByTestId("reader-dock").getByTestId("reader-benefit-dock-button")).toBeVisible();
      });
    }
  }
}
