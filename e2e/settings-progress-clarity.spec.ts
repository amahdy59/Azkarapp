import {
  chooseProgressOption,
  chooseProgressDetail,
  openPrayerBreakdown,
  openProgressExport,
} from "./helpers/progress";
import { mkdir } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { t } from "../src/app/i18n";

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
      await page.goto("/#/progress/day");
      await chooseProgressDetail(page, "routines");
      const garden = page.getByTestId("progress-routine-bars");
      await expect(garden).toBeVisible();
      await expect(garden.locator("img")).toHaveCount(0);
      await chooseProgressOption(
        page.getByRole("combobox", { name: ar ? "نطاق التاريخ" : "Date range", exact: true, includeHidden: true }),
        "month",
      );
      const monthChart = page.getByTestId("progress-routine-bars");
      await expect(monthChart).toBeVisible();
      const chartBounds = await monthChart.boundingBox();
      await chooseProgressDetail(page, "prayers");
      const prayerBounds = await (await openPrayerBreakdown(page, language)).locator("xpath=..").boundingBox();
      await chooseProgressDetail(page, "routines");
      expect(Math.abs(prayerBounds!.x - chartBounds!.x)).toBeLessThanOrEqual(1);
      expect(Math.abs(prayerBounds!.width - chartBounds!.width)).toBeLessThanOrEqual(1);
      await expect(monthChart.getByRole("progressbar").first()).toHaveAttribute("aria-valuenow", "1");
      await expect(monthChart.getByRole("progressbar").first()).toHaveAttribute("aria-valuemax", "2");
      await expect(page.getByRole("table")).toHaveCount(0);
      const directory = `output/playwright/settings-progress-clarity/${testInfo.project.name}`;
      await mkdir(directory, { recursive: true });
      await page.screenshot({ path: `${directory}/${language}-${width}-month.png` });
      await chooseProgressOption(
        page.getByRole("combobox", { name: ar ? "نطاق التاريخ" : "Date range", exact: true, includeHidden: true }),
        "year",
      );
      const chart = page.getByTestId("progress-routine-bars");
      await expect(chart).toBeVisible();
      await expect(page.getByRole("combobox", { includeHidden: true })).toHaveCount(1);
      await expect(page.getByTestId("progress-filters-toggle")).toHaveAttribute("aria-expanded", "false");
      const activity = page.getByRole("combobox", { name: ar ? "عرض اتجاه" : "Show trend for", exact: true });
      await activity.focus();
      await expect(activity).toBeFocused();
      const axeProgress = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(axeProgress.violations).toEqual([]);
      await page.screenshot({ path: `${directory}/${language}-${width}-year.png` });
      const exportMenu = await openProgressExport(page, language);
      const exportButton = exportMenu.getByRole("button", { name: ar ? "تصدير JSON" : "Export JSON", exact: true });
      await exportButton.focus();
      await expect(exportButton).toBeFocused();
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
      await page.getByRole("button", { name: t(language, "prayerLocation.chooseAnotherCity") }).click();
      await expect(
        page.getByRole("searchbox", { name: t(language, "prayerLocation.citySearchOptional") }),
      ).toBeVisible();
      await page.getByRole("button", { name: t(language, "common.close"), exact: true }).click();
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
