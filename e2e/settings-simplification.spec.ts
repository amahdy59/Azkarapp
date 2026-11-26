import { openDownloadManagement, openDownloadSelection } from "./helpers/downloads";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { t } from "../src/app/i18n";

// Capture routine evidence once; every engine keeps the same assertions and failure traces.
async function capture(page: Page, testInfo: TestInfo, name: string) {
  if (testInfo.project.name === "desktop-chromium")
    await page.screenshot({ path: testInfo.outputPath(name), fullPage: true, scale: "css" });
}

for (const scenario of [
  { language: "ar", width: 390, height: 844, scale: 1, theme: "midnight" },
  { language: "en", width: 1440, height: 900, scale: 1, theme: "light" },
  { language: "ar", width: 320, height: 568, scale: 2, theme: "dark" },
  { language: "en", width: 390, height: 844, scale: 2, theme: "light" },
  { language: "ar", width: 1440, height: 900, scale: 1, theme: "midnight" },
  { language: "ar", width: 1024, height: 900, scale: 1, theme: "light" },
  { language: "en", width: 320, height: 568, scale: 2, theme: "midnight" },
] as const) {
  async function openScenario(page: Page, audioRate = 1) {
    await page.setViewportSize(scenario);
    await page.addInitScript(
      ({ language, theme, scale, audioRate }) => {
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem("azkar.audio-preferences.v1", JSON.stringify({ playbackRate: audioRate }));
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: {
              language,
              themeMode: theme,
              reduceMotion: true,
              textSize: audioRate === 1 ? "medium" : "large",
              weeklyGoalDays: 7,
              reminders: { morning: { enabled: language === "en", time: "07:30" } },
              location: {
                latitude: 30.55,
                longitude: 31.06,
                cityName: "30.55°, 31.06°",
                autoDetect: true,
                calculationMethod: 5,
                timeZone: "Africa/Cairo",
              },
            },
            profile: { isGuest: true },
          }),
        );
        if (scale === 2)
          document.addEventListener("DOMContentLoaded", () => {
            document.documentElement.style.fontSize = "32px";
          });
      },
      { ...scenario, audioRate },
    );
    await page.goto("/#/settings");
  }
  test(`Settings preference summaries: ${scenario.language}/${scenario.width}/${scenario.scale} @cross-browser`, async ({
    page,
  }, testInfo) => {
    await openScenario(page);
    for (const id of [
      "appearance",
      "reading",
      "prayer",
      "audio",
      "downloads",
      "progress",
      "accessibility",
      "account-data",
    ])
      await expect(page.getByTestId("settings-sub-" + id)).toBeVisible();
    await expect(page.getByTestId("settings-sub-prayer")).toContainText(
      scenario.language === "ar" ? "بالقرب من القاهرة، مصر" : "Near Cairo, Egypt",
    );
    await expect(page.getByTestId("settings-sub-prayer")).toContainText(
      t(scenario.language, scenario.language === "en" ? "settings.remindersSelected" : "settings.remindersOff"),
    );
    await expect(page.getByTestId("settings-sub-progress")).toContainText(
      scenario.language === "ar" ? "الهدف الأسبوعي: ٧ أيام" : "Weekly goal: 7 days",
    );
    await expect(page.getByTestId("settings-sub-audio")).toContainText(
      scenario.language === "ar" ? "عبد الله محمد · ١×" : "Abdullah Muhammad · 1×",
    );
    await expect(page.getByTestId("settings-sub-downloads")).toContainText(
      t(scenario.language, "settings.downloadsUnchecked"),
    );
    await expect(page.getByTestId("settings-sub-location")).toHaveCount(0);
    await expect(page.getByTestId("settings-sub-notifications")).toHaveCount(0);
    await capture(page, testInfo, "settings-root.png");
    await page.getByTestId("settings-sub-downloads").scrollIntoViewIfNeeded();
    await capture(page, testInfo, "settings-downloads-entry.png");
    await page.getByTestId("settings-sub-reading").click();
    await expect(page.getByTestId("reading-preview")).toBeVisible();
    await page.getByTestId("reading-text-size-large").click();
    await expect(page.getByTestId("reading-text-size-large")).toBeChecked();
    await capture(page, testInfo, "settings-reading.png");
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
    await expect(
      page.getByRole("heading", { name: t(scenario.language, "settings.audioRecitations"), exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "1.25×", exact: true }).click();
    await capture(page, testInfo, "settings-audio.png");
    if (scenario.width < 900) {
      await expect(page.getByTestId("settings-sub-downloads")).toHaveCount(0);
      await page.getByRole("button", { name: t(scenario.language, "common.back"), exact: true }).click();
    }
    await expect(page.getByTestId("settings-sub-audio")).toContainText(scenario.language === "ar" ? "١.٢٥×" : "1.25×");
  });
  test(`compact Settings and three downloads: ${scenario.language}/${scenario.width}/${scenario.scale} @cross-browser`, async ({
    page,
  }, testInfo) => {
    await openScenario(page, 1.25);
    await page.getByTestId("settings-sub-downloads").click();
    await expect(page).toHaveURL(/settings\/downloads$/);
    await expect(page.getByTestId("downloads-scroll")).toBeVisible();
    if (scenario.width >= 900) {
      await expect(page.getByTestId("settings-sub-downloads")).toHaveAttribute("aria-current", "page");
      await expect(page.getByTestId("settings-sub-audio")).not.toHaveAttribute("aria-current", "page");
    }
    const downloads = page.getByTestId("downloads-scroll");
    await expect(page.getByTestId("download-overview-action")).toBeEnabled();
    await expect(page.getByTestId("download-overview-action")).toHaveText(
      t(scenario.language, "downloads.downloadAll"),
    );
    await expect(downloads.locator('[data-testid^="download-category-"]')).toHaveCount(0);
    await capture(page, testInfo, "downloads-overview.png");
    await openDownloadSelection(page);
    await expect(page.getByRole("checkbox")).toHaveCount(3);
    await openDownloadManagement(page);
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
    await capture(page, testInfo, "downloads-three-categories.png");
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
    if (scenario.width < 900)
      await page.getByRole("button", { name: t(scenario.language, "common.back"), exact: true }).click();
    const summary = page.getByTestId("settings-sub-downloads");
    await expect(summary).toContainText(scenario.language === "ar" ? "آخر تحقق:" : "Last check:");
    const usageAvailable = await page.evaluate(async () => {
      try {
        return typeof (await navigator.storage?.estimate?.())?.usage === "number";
      } catch {
        return false;
      }
    });
    const storageLabel = scenario.language === "ar" ? "تخزين التطبيق:" : "app storage";
    if (usageAvailable) await expect(summary).toContainText(storageLabel);
    else await expect(summary).not.toContainText(storageLabel);
    await summary.scrollIntoViewIfNeeded();
    await capture(page, testInfo, "settings-checked-summary.png");
    if (scenario.width < 900) await expect(summary).toBeFocused();
    const menu = page.locator(".settings-root-panel");
    expect(await menu.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
    const rootScan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    expect(rootScan.violations).toEqual([]);
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
    await page.goto("/#/settings");
    await page.getByTestId("settings-sub-downloads").click();
    await expect(page).toHaveURL(/settings\/downloads$/);
    await expect(page.getByTestId("downloads-scroll")).toBeVisible();
    await page.getByRole("button", { name: t(language, "common.back"), exact: true }).click();
    await expect(page).toHaveURL(/#\/settings$/);
    await expect(page.getByTestId("settings-sub-downloads")).toBeFocused();
    await page.goto("/#/settings/prayer");
    await page.getByTestId("settings-sub-location").click();
    await expect(page).toHaveURL(/settings\/location$/);
    // Hash navigation completes before the outgoing animated panel unmounts.
    // Wait for the destination so Back belongs to Location, not Prayer.
    await expect(
      page.getByRole("heading", { name: t(language, "settings.prayerTimesAndLocation"), exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: t(language, "common.back"), exact: true }).click();
    await expect(page).toHaveURL(/settings\/prayer$/);
    await expect(page.getByTestId("settings-sub-location")).toBeFocused();
  });
}
