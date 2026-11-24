import { expect, test } from "@playwright/test";
import { getAzkarForMode } from "../src/app/content/azkar";

for (const language of ["ar", "en"] as const) {
  for (const id of ["m-hm-89m", "m-hm-93"]) {
    test(`source-specific evidence ${id} ${language} @cross-browser`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width: 390, height: 844 });
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
      const index = getAzkarForMode("morning", "complete").findIndex((z) => z.id === id) + 1;
      await page.goto(`/#/azkar/morning/${index}?mode=complete`);
      const trigger = page.getByTestId("reader-benefit-dock-button");
      await expect(trigger).toBeVisible();
      await trigger.click();
      const sheet = page.getByTestId("reference-sheet");
      await expect(sheet).toBeVisible();
      const evidence = sheet.getByTestId("reference-hadith");
      if (id === "m-hm-89m") {
        await expect(evidence).toContainText(language === "ar" ? "فَتْحَهُ وَنَصْرَهُ" : "opening, victory");
        await expect(evidence).not.toContainText(language === "ar" ? "مَسْعُود" : "Mas‘ud");
        await expect(sheet.getByTestId("reference-source")).toContainText(language === "ar" ? "٥٠٨٤" : "5084");
      } else {
        await expect(evidence).toContainText(language === "ar" ? "مِائَةُ حَسَنَةٍ" : "a hundred good deeds");
        await expect(evidence).toContainText(language === "ar" ? "مِائَةُ سَيِّئَةٍ" : "a hundred sins");
      }
      await page.screenshot({ path: testInfo.outputPath(`${id}-${language}.png`) });
      await page.keyboard.press("Escape");
      await expect(sheet).not.toBeVisible();
      await expect(trigger).toBeFocused();
    });
  }
}
