import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const language of ["ar", "en"] as const) {
  test(`stable modal editors and visible card feedback ${language} @cross-browser`, async ({ page }, info) => {
    await page.setViewportSize({ width: language === "ar" ? 1280 : 320, height: 900 });
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language, themeMode: "midnight", appMaterial: "glass", reduceMotion: true },
          profile: { isGuest: true },
          quranWirdPlan: { kind: "daily", dailyPages: 4, startedDayKey: "2026-10-01" },
          wirdHistory: { "2026-10-18": [1, 2] },
        }),
      );
    }, language);
    await page.goto("/#/progress/month");
    const card = page.getByTestId("progress-metric-prayers");
    await expect(card).toBeVisible();
    const paint = () =>
      card.evaluate((node) => ({
        border: getComputedStyle(node).borderColor,
        shadow: getComputedStyle(node).boxShadow,
      }));
    const resting = await paint();
    if (await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches)) {
      await card.hover();
      await expect.poll(paint).not.toEqual(resting);
    }
    const choose = page.getByRole("button", {
      name: language === "ar" ? "اختيار المقاييس" : "Choose metrics",
      exact: true,
    });
    const before = await card.boundingBox();
    await choose.click();
    const dialog = page.getByTestId("progress-metric-dialog");
    await expect(dialog).toBeVisible();
    expect(await card.boundingBox()).toEqual(before);
    expect(
      (await new AxeBuilder({ page }).include('[data-testid="progress-metric-dialog"]').analyze()).violations,
    ).toEqual([]);
    await page.screenshot({ path: info.outputPath("metric-modal.png") });
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(choose).toBeFocused();
    await page.goto("/#/quran-wird");
    const today = page.locator('section[aria-labelledby="wird-today-title"]');
    const plan = page.locator('section[aria-labelledby="wird-plan-title"]');
    const edit = plan.getByRole("button");
    await expect(edit).toBeVisible();
    const planBefore = await plan.boundingBox();
    if (language === "ar")
      expect(Math.abs(planBefore!.height - (await today.boundingBox())!.height)).toBeLessThanOrEqual(1);
    await edit.click();
    const planDialog = page.getByTestId("quran-plan-dialog");
    await expect(planDialog).toBeVisible();
    expect(await plan.boundingBox()).toEqual(planBefore);
    await page.screenshot({ path: info.outputPath("plan-modal.png") });
    await page.keyboard.press("Escape");
    await expect(planDialog).toBeHidden();
    await expect(edit).toBeFocused();
  });
}
