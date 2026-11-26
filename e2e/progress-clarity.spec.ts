import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { chooseProgressOption } from "./helpers/progress";

for (const language of ["ar", "en"] as const) {
  test(`@cross-browser ${language} focused progress and Quran responsive journeys`, async ({ page }) => {
    test.setTimeout(180000);
    await page.clock.setFixedTime(new Date("2026-11-26T12:00:00+02:00"));
    await page.addInitScript(
      ({ language }) => {
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: {
              language,
              themeMode: "midnight",
              calendarType: "gregorian",
              reduceMotion: true,
              progressDayStartHour: 0,
            },
            profile: { isGuest: true },
            quranWirdPlan: { kind: "daily", dailyPages: 4, startedDayKey: "2026-11-21" },
            quranWirdDailyGoals: { "2026-11-26": 4 },
            wirdHistory: { "2026-11-26": [1, 2, 3, 4, 5, 6] },
            prayerTracking: [{ dayKey: "2026-11-26", prayer: "fajr", location: "home", mosque: false }],
            dailyCompletions: [],
          }),
        );
      },
      { language },
    );
    await mkdir("output/playwright/progress-clarity", { recursive: true });
    for (const width of [1440, 834, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto("/#/progress/month");
      await expect(page.getByTestId("progress-overview").locator(":scope > div")).toHaveCount(4);
      await expect(page.getByTestId("progress-heatmap")).toBeVisible();
      await expect(page.getByTestId("progress-choose-metrics")).toHaveCount(0);
      await expect(page.getByTestId("progress-detailed-context")).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({
        path: `output/playwright/progress-clarity/progress-${language}-${width}.png`,
        fullPage: true,
      });
      await page.getByTestId("progress-tab-trends").click();
      const activity = page.getByRole("combobox", { name: language === "ar" ? "عرض اتجاه" : "Show trend for" });
      await chooseProgressOption(activity, "routines");
      await expect(page.getByTestId("progress-routine-bars")).toBeVisible();
      await expect(page.getByTestId("progress-routine-composition")).toHaveCount(0);
      await chooseProgressOption(activity, "zikr");
      await expect(page.getByTestId("zikr-insights")).toBeVisible();
      await page.goto("/#/quran-wird");
      await expect(page.getByTestId("quran-wird-content")).toBeVisible();
      await expect(
        page.getByRole("button", { name: language === "ar" ? "متابعة القراءة" : "Continue reading", exact: true }),
      ).toBeVisible();
      await expect(page.locator(".quran-wird-week-day")).toHaveCount(7);
      await expect(page.locator(".recorded-pages-chart")).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({
        path: `output/playwright/progress-clarity/quran-${language}-${width}.png`,
        fullPage: true,
      });
    }
    const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(scan.violations).toEqual([]);
  });
}
