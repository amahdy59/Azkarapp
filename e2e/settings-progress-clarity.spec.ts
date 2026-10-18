import { mkdir } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const language of ["ar", "en"] as const) {
  for (const width of [320, 390, 900, 1440]) {
    test(`@cross-browser ${language} Settings and Progress clarity at ${width}px`, async ({ page }, testInfo) => {
      const ar = language === "ar";
      await page.setViewportSize({ width, height: 900 });
      await page.clock.setFixedTime(new Date("2026-01-02T12:00:00+02:00"));
      await page.addInitScript(
        ({ language, width }) => {
          localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
          localStorage.setItem(
            "azkarapp.state.v1",
            JSON.stringify({
              settings: {
                language,
                themeMode: width === 320 ? "light" : width === 900 ? "dark" : "midnight",
                calendarType: "gregorian",
                reduceMotion: true,
              },
              profile: { displayName: "Guest", isGuest: true },
              dailyCompletions: ["morning", "evening", "before_sleep"].map((category) => ({
                dayKey: "2026-01-01",
                category,
                timeZone: "Africa/Cairo",
              })),
            }),
          );
        },
        { language, width },
      );
      await page.goto("/#/progress");
      const garden = page.getByTestId("today-garden-card");
      await expect(garden).toBeVisible();
      await expect(garden.locator("img")).toHaveCount(0);
      await page.getByRole("tab", { name: ar ? "شهر" : "Month", exact: true }).click();
      const monthChart = page.getByTestId("today-garden-card");
      await expect(monthChart).toBeVisible();
      const prayerBounds = await page.getByTestId("progress-prayer-group").boundingBox();
      const chartBounds = await monthChart.boundingBox();
      expect(Math.abs(prayerBounds!.x - chartBounds!.x)).toBeLessThanOrEqual(1);
      expect(Math.abs(prayerBounds!.width - chartBounds!.width)).toBeLessThanOrEqual(1);
      await expect(monthChart.getByTestId("insight-morning").getByRole("img")).toHaveAccessibleName(
        ar ? /١٠٠٪/ : /100%/,
      );
      await expect(page.getByRole("table")).toHaveCount(0);
      const directory = `output/playwright/settings-progress-clarity/${testInfo.project.name}`;
      await mkdir(directory, { recursive: true });
      await page.screenshot({ path: `${directory}/${language}-${width}-month.png` });
      await page.getByRole("tab", { name: ar ? "سنة" : "Year", exact: true }).click();
      const chart = page.getByTestId("today-garden-card");
      await expect(chart).toBeVisible();
      await expect(page.getByRole("combobox")).toHaveCount(0);
      const exportButton = chart.getByRole("button", {
        name: ar ? "تنزيل بيانات الأذكار (JSON)" : "Download routine data (JSON)",
      });
      await exportButton.focus();
      await expect(exportButton).toBeFocused();
      const axeProgress = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(axeProgress.violations).toEqual([]);
      await page.screenshot({ path: `${directory}/${language}-${width}-year.png` });
      if (width === 320) {
        await page.evaluate(() => {
          document.documentElement.style.fontSize = "200%";
        });
        await exportButton.focus();
        await expect(exportButton).toBeFocused();
        const exportBounds = await exportButton.boundingBox();
        expect(exportBounds!.width).toBeGreaterThanOrEqual(44);
        expect(exportBounds!.height).toBeGreaterThanOrEqual(44);
        expect(exportBounds!.x).toBeGreaterThanOrEqual(0);
        expect(exportBounds!.x + exportBounds!.width).toBeLessThanOrEqual(321);
        await page.keyboard.press("Escape");
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
        ).toBe(true);
        await page.screenshot({ path: `${directory}/${language}-320-year-200.png` });
        await page.evaluate(() => {
          document.documentElement.style.fontSize = "";
        });
      }
      await page.goto("/#/settings/location");
      await expect(
        page.getByRole("searchbox", { name: ar ? "البحث في المدن والدول" : "Search cities and countries" }),
      ).toBeVisible();
      await expect(
        page.getByRole("switch", { name: ar ? "تذكيرات مواقيت الصلاة" : "Prayer-time reminders" }),
      ).toHaveCount(0);
      await page.screenshot({ path: `${directory}/${language}-${width}-location.png` });
      await page.goto("/#/settings/accessibility");
      const shortcut = page.getByRole("button", {
        name: ar ? "حجم النص والخط وخيارات القراءة" : "Text size, fonts & reading options",
      });
      await expect(shortcut).toBeVisible();
      await expect(page.getByRole("radiogroup", { name: ar ? "حجم النص" : "Text size" })).toHaveCount(0);
      await shortcut.click();
      await expect(page).toHaveURL(/#\/settings\/reading$/);
      await expect(page.locator("[data-settings-subheading]")).toBeFocused();
      await expect(page.getByTestId("reading-text-size-medium")).toBeChecked();
      await page.screenshot({ path: `${directory}/${language}-${width}-reading.png` });
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      expect(results.violations).toEqual([]);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
      ).toBe(true);
    });
  }
}
