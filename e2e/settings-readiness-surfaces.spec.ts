import { readFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const scenario of [
  {
    name: "phone-ar-solid",
    width: 390,
    height: 844,
    language: "ar",
    theme: "light",
    material: "solid",
    enlarged: false,
    fallback: false,
  },
  {
    name: "narrow-en-glass",
    width: 320,
    height: 800,
    language: "en",
    theme: "midnight",
    material: "glass",
    enlarged: true,
    fallback: false,
  },
  {
    name: "tablet-ar-glass",
    width: 768,
    height: 1024,
    language: "ar",
    theme: "dark",
    material: "glass",
    enlarged: false,
    fallback: false,
  },
  {
    name: "desktop-en-fallback",
    width: 1440,
    height: 900,
    language: "en",
    theme: "light",
    material: "glass",
    enlarged: false,
    fallback: true,
  },
] as const) {
  test(`readiness and data safety remain usable: ${scenario.name} @cross-browser`, async ({ page }, testInfo) => {
    await page.setViewportSize(scenario);
    await page.addInitScript((scenario) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: {
            language: scenario.language,
            themeMode: scenario.theme,
            appMaterial: scenario.material,
            reduceTransparency: scenario.fallback,
            reduceMotion: true,
          },
          profile: { isGuest: true },
        }),
      );
    }, scenario);
    await page.goto("/#/settings/notifications");
    if (scenario.enlarged)
      await page.locator("html").evaluate((el) => {
        el.style.fontSize = "32px";
      });
    const summary = page.getByTestId("reminder-readiness");
    await expect(summary).toBeVisible();
    await expect(summary).toContainText("Africa/Cairo");
    const review = page.getByRole("button", {
      name: scenario.language === "ar" ? "مراجعة الموقع والمنطقة الزمنية" : "Review location and timezone",
    });
    await review.scrollIntoViewIfNeeded();
    await review.focus();
    await expect(review).toBeFocused();
    const geometry = await review.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      return { width: r.width, height: r.height, hit: el === hit || el.contains(hit) };
    });
    expect(geometry.height).toBeGreaterThanOrEqual(44);
    expect(geometry.hit).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`reminder-${scenario.name}.png`) });
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/settings\/location/);
    await page.goto("/#/settings/account-data");
    if (scenario.enlarged)
      await page.locator("html").evaluate((el) => {
        el.style.fontSize = "32px";
      });
    const safety = page.getByTestId("data-safety-summary");
    await expect(safety).toBeVisible();
    await expect(safety).toContainText(scenario.language === "ar" ? "اكتمل آخر حفظ" : "The latest save completed");
    const backup = page.getByRole("button", {
      name: scenario.language === "ar" ? "تصدير نسخة احتياطية للاستعادة" : "Export a restorable backup",
    });
    await backup.scrollIntoViewIfNeeded();
    const download = page.waitForEvent("download");
    await backup.click();
    const file = await download;
    expect(file.suggestedFilename()).toMatch(/^azkar-data-.*\.json$/);
    const payload = JSON.parse(await readFile((await file.path())!, "utf8"));
    expect(payload).toMatchObject({
      format: "azkarapp-backup",
      version: 1,
      state: { settings: { language: scenario.language } },
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    const scan = await new AxeBuilder({ page })
      .include('[data-testid="settings-screen"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(scan.violations).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`safety-${scenario.name}.png`) });
  });
}
