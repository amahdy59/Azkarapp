import { expect, test } from "@playwright/test";
import { getAzkarForMode } from "../src/app/content/azkar";

for (const language of ["ar", "en"] as const) {
  test(`Benefit stays in the bottom action area for ordinary and surah readers in ${language} @cross-browser`, async ({
    page,
  }) => {
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language, routineMode: "complete", reduceMotion: true },
          routineMode: "complete",
          profile: { isGuest: true },
        }),
      );
    }, language);
    const items = [
      { route: "morning/1", id: null },
      { route: "friday-kahf/1", id: "friday-kahf" },
      {
        route: `illness-ruqyah/${getAzkarForMode("illness_ruqyah", "complete").findIndex((z) => z.id === "ir-baqarah") + 1}`,
        id: "ir-baqarah",
      },
      ...["s-hm-110a", "s-hm-110b"].map((id) => ({
        route: `before-sleep/${getAzkarForMode("before_sleep", "complete").findIndex((z) => z.id === id) + 1}`,
        id,
      })),
    ];
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 844 });
      for (const item of items) {
        await page.goto(`/#/azkar/${item.route}`);
        const benefit = page.getByTestId("reader-benefit-dock-button");
        await expect(benefit).toBeVisible();
        await benefit.scrollIntoViewIfNeeded();
        const bounds = (await benefit.boundingBox())!;
        expect(bounds.height).toBeGreaterThanOrEqual(44);
        expect(bounds.y + bounds.height).toBeLessThanOrEqual(844);
        if (item.id) {
          const actions = page.getByTestId("surah-reading-actions");
          await expect(actions.getByRole("button")).toHaveCount(4);
          await expect(actions.getByRole("button").last()).toHaveAttribute("data-testid", "reader-benefit-dock-button");
        } else await expect(benefit.locator("xpath=ancestor::*[@data-testid='reader-dock']").first()).toBeVisible();
        if (item.id === "friday-kahf") {
          await benefit.click();
          const reference = page.getByTestId("reference-sheet");
          await expect(reference.getByTestId("reference-hadith")).toContainText(
            language === "ar" ? "مَا بَيْنَ الْجُمْعَتَيْنِ" : "following Friday",
          );
          await page.keyboard.press("Escape");
          await expect(benefit).toBeFocused();
          await page.getByTestId("reader-mushaf-button").click();
          await expect(page.getByTestId("mushaf-immersive").getByTestId("reader-benefit-dock-button")).toBeVisible();
          await page.getByTestId("reader-benefit-dock-button").click();
          await expect(reference).toBeVisible();
          await page.keyboard.press("Escape");
          await expect(page.getByTestId("reader-benefit-dock-button")).toBeFocused();
        }
      }
    }
  });
}
