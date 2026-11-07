import { expect, test } from "@playwright/test";

for (const language of ["ar", "en"] as const) {
  test(`Progress tabs keep visible icons on narrow screens in ${language} @cross-browser`, async ({ page }, info) => {
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({ settings: { language, reduceMotion: true }, profile: { isGuest: true } }),
      );
    }, language);
    await page.setViewportSize({ width: 384, height: 844 });
    await page.goto("/#/progress");
    const tabs = page.locator(".progress-view-tabs");
    await expect(tabs.getByRole("tab")).toHaveCount(2);
    for (const width of [320, 360, 375, 384, 390]) {
      await page.setViewportSize({ width, height: 844 });
      for (const scale of [100, 200]) {
        await page.locator("html").evaluate((node, scale) => (node.style.fontSize = `${scale}%`), scale);
        for (const id of ["overview", "trends"]) {
          const tab = page.getByTestId(`progress-tab-${id}`);
          await expect(tab).toHaveAccessibleName(/\S/);
          await expect(tab.locator(".progress-tab-icon")).toBeVisible();
          await expect(tab.locator(".section-tab-label")).toBeHidden();
          const bounds = await tab.boundingBox();
          expect(bounds!.width).toBeGreaterThanOrEqual(44);
          expect(bounds!.height).toBeGreaterThanOrEqual(44);
          await tab.click();
          await expect(tab).toHaveAttribute("aria-selected", "true");
        }
      }
    }
    await page.setViewportSize({ width: 384, height: 844 });
    await page.screenshot({ path: info.outputPath(`progress-tabs-${language}-384-200.png`) });
    await page.getByTestId("progress-tab-overview").focus();
    await page.keyboard.press("End");
    await expect(page.getByTestId("progress-tab-trends")).toBeFocused();
    await expect(page.getByTestId("progress-tab-trends")).toHaveAttribute("aria-selected", "true");
  });
}
