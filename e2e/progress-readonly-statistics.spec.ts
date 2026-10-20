import { chooseProgressOption } from "./helpers/progress";
import { mkdir } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const language of ["ar", "en"] as const) {
  for (const width of [320, 390, 1440]) {
    test(`@cross-browser ${language} read-only Progress statistics at ${width}px`, async ({ page }, testInfo) => {
      const ar = language === "ar";
      await page.setViewportSize({ width, height: 1000 });
      await page.clock.setFixedTime(new Date("2026-10-18T12:00:00Z"));
      await page.addInitScript(
        ({ language, width }) => {
          localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
          localStorage.setItem(
            "azkarapp.state.v1",
            JSON.stringify({
              settings: {
                language,
                themeMode: width === 320 ? "light" : "midnight",
                calendarType: "gregorian",
                reduceMotion: true,
                progressDayStartHour: 0,
              },
              profile: { displayName: "Guest", isGuest: true },
              dailyHabits: [],
              dailyCompletions: [
                { dayKey: "2026-10-18", category: "morning", timeZone: "Africa/Cairo", completionLevel: "complete" },
              ],
              prayerTracking: [
                { dayKey: "2026-10-18", prayer: "fajr", mosque: false, location: "home", adhkar: true, sunnah: true },
                { dayKey: "2026-10-17", prayer: "fajr", mosque: true, location: "mosque", adhkar: false },
              ],
            }),
          );
        },
        { language, width },
      );
      await page.goto("/#/progress");
      await page.getByTestId("progress-detailed-context").locator(":scope > summary").click();
      const summary = page.getByTestId("prayer-progress-summary");
      await expect(summary).toBeVisible();
      const before = await page.evaluate(() => {
        const state = JSON.parse(localStorage.getItem("azkarapp.state.v1")!);
        return { prayers: state.prayerTracking, completions: state.dailyCompletions, habits: state.dailyHabits };
      });
      await expect(summary.getByRole("listitem")).toHaveCount(5);
      await expect(summary.getByText(ar ? "في المنزل" : "At home", { exact: true })).toBeVisible();
      await expect(page.locator(".progress-screen input[type=checkbox], .progress-screen textarea")).toHaveCount(0);
      await expect(page.getByRole("button", { name: ar ? "فتح الفجر" : "Open Fajr", exact: true })).toHaveCount(0);
      await expect(summary.locator("details, table")).toHaveCount(0);
      if (width === 320)
        await page.evaluate(() => {
          document.documentElement.style.fontSize = "200%";
        });
      const directory = `output/playwright/progress-statistics/${testInfo.project.name}`;
      await mkdir(directory, { recursive: true });
      await page.screenshot({ path: `${directory}/${language}-${width}-overview.png` });
      await expect(summary.getByRole("listitem")).toHaveCount(5);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
      ).toBe(true);
      await page.screenshot({ path: `${directory}/${language}-${width}-statuses.png` });
      const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      expect(axe.violations).toEqual([]);
      await page.getByRole("button", { name: ar ? "الفترة السابقة" : "Previous period", exact: true }).click();
      await expect(summary.getByRole("listitem").first()).not.toContainText(
        ar ? "أتممت أذكار الصلاة" : "Completed the azkar",
      );
      await expect(summary.getByText(ar ? "في المسجد" : "At the mosque", { exact: true })).toBeVisible();
      await expect(page.locator(".progress-screen input[type=checkbox], .progress-screen textarea")).toHaveCount(0);
      const after = await page.evaluate(() => {
        const state = JSON.parse(localStorage.getItem("azkarapp.state.v1")!);
        return { prayers: state.prayerTracking, completions: state.dailyCompletions, habits: state.dailyHabits };
      });
      expect(after).toEqual(before);
      await chooseProgressOption(page.getByRole("combobox", { name: ar ? "الفترة" : "Period", exact: true }), "week");
      await expect(summary).toHaveCount(0);
      await expect(page.getByTestId("prayer-comparison")).toBeVisible();
    });
  }
}
