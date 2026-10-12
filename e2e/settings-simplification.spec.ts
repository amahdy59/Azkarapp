import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { t } from "../src/app/i18n";

for (const scenario of [
  { language: "ar", width: 390, height: 844, scale: 1, theme: "midnight" },
  { language: "en", width: 1440, height: 900, scale: 1, theme: "light" },
  { language: "ar", width: 320, height: 568, scale: 2, theme: "dark" },
  { language: "en", width: 390, height: 844, scale: 2, theme: "light" },
] as const) {
  test(`compact Settings and three downloads: ${scenario.language}/${scenario.width}/${scenario.scale} @cross-browser`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(scenario);
    await page.addInitScript(({ language, theme, scale }) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({ settings: { language, themeMode: theme, reduceMotion: true }, profile: { isGuest: true } }),
      );
      if (scale === 2)
        document.addEventListener("DOMContentLoaded", () => {
          document.documentElement.style.fontSize = "32px";
        });
    }, scenario);
    await page.goto("/#/settings");
    for (const id of ["appearance", "reading", "prayer", "audio", "progress", "accessibility", "account-data"])
      await expect(page.getByTestId("settings-sub-" + id)).toBeVisible();
    await expect(page.getByTestId("settings-sub-location")).toHaveCount(0);
    await expect(page.getByTestId("settings-sub-notifications")).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath("settings-root.png"), fullPage: true });
    await page.getByTestId("settings-sub-reading").click();
    await expect(page.getByTestId("reading-preview")).toBeVisible();
    await page.getByTestId("reading-text-size-large").click();
    await expect(page.getByTestId("reading-text-size-large")).toBeChecked();
    await page.screenshot({ path: testInfo.outputPath("settings-reading.png"), fullPage: true });
    await page.goto("/#/settings/prayer");
    await page.getByTestId("settings-sub-location").click();
    await expect(page).toHaveURL(/settings\/location$/);
    const advanced = page.locator("summary").filter({ hasText: t(scenario.language, "settings.advancedPrayer") });
    await expect(
      page.getByRole("spinbutton", { name: t(scenario.language, "notifications.fajr"), exact: true }),
    ).toBeHidden();
    await advanced.click();
    await expect(
      page.getByRole("spinbutton", { name: t(scenario.language, "notifications.fajr"), exact: true }),
    ).toBeVisible();
    await page.goto("/#/settings/audio");
    await page.getByTestId("settings-sub-downloads").click();
    await expect(page).toHaveURL(/settings\/downloads$/);
    const downloads = page.getByTestId("downloads-scroll");
    await expect(downloads.locator('[data-testid^="download-category-"]')).toHaveCount(3);
    await expect(
      page.getByRole("button", {
        name:
          t(scenario.language, "downloads.downloadResource") + " · " + t(scenario.language, "downloads.adhkarTitle"),
        exact: true,
      }),
    ).toBeEnabled();
    await expect(
      downloads.getByRole("button", {
        name: new RegExp("^" + t(scenario.language, "downloads.downloadResource") + " ·"),
      }),
    ).toHaveCount(3);
    await expect(downloads.getByRole("progressbar")).toHaveCount(0);
    await expect(
      downloads.getByRole("button", { name: t(scenario.language, "downloads.prepareTravel"), exact: true }),
    ).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath("downloads-three-categories.png"), fullPage: true });
    const manage = page.getByTestId("download-category-recitations").locator(":scope > details > summary");
    await manage.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("offline-resource-kahf")).toBeVisible();
    await expect(page.getByTestId("offline-resource-baqarah")).toBeVisible();
    await manage.focus();
    await page.keyboard.press("Enter");
    await expect(manage).toBeFocused();
    await expect(page.getByTestId("offline-resource-kahf")).toBeHidden();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    expect(await downloads.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
    const controls = await downloads
      .locator("button, summary")
      .evaluateAll((elements) =>
        elements
          .filter((el) => el.getClientRects().length)
          .map((el) => ({ width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height })),
      );
    for (const control of controls) {
      expect(control.width).toBeGreaterThanOrEqual(44);
      expect(control.height).toBeGreaterThanOrEqual(44);
    }
    const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    expect(scan.violations).toEqual([]);
  });
}

for (const language of ["ar", "en"] as const) {
  test(`nested Settings Back restores the opening control in ${language} @cross-browser`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({ settings: { language, reduceMotion: true }, profile: { isGuest: true } }),
      );
    }, language);
    await page.goto("/#/settings/audio");
    await page.getByTestId("settings-sub-downloads").click();
    await expect(page).toHaveURL(/settings\/downloads$/);
    await page.getByRole("button", { name: t(language, "common.back"), exact: true }).click();
    await expect(page).toHaveURL(/settings\/audio$/);
    await expect(page.getByTestId("settings-sub-downloads")).toBeFocused();
    await page.goto("/#/settings/prayer");
    await page.getByTestId("settings-sub-location").click();
    await expect(page).toHaveURL(/settings\/location$/);
    await page.getByRole("button", { name: t(language, "common.back"), exact: true }).click();
    await expect(page).toHaveURL(/settings\/prayer$/);
    await expect(page.getByTestId("settings-sub-location")).toBeFocused();
  });
}
