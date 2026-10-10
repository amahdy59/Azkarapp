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
      const calendar = page.getByRole("region", { name: ar ? "تواريخ التقويم" : "Calendar dates" });
      await expect(calendar).toBeVisible();
      const days = calendar.getByRole("button");
      await expect(days).toHaveCount(31);
      for (const target of await days.evaluateAll((nodes) =>
        nodes.map((node) => {
          const rect = node.getBoundingClientRect();
          return { width: rect.width, height: rect.height };
        }),
      )) {
        expect(target.width).toBeGreaterThanOrEqual(44);
        expect(target.height).toBeGreaterThanOrEqual(44);
      }
      await days.first().focus();
      await expect(days.first()).toBeFocused();
      await days.last().focus();
      await expect(days.last()).toBeInViewport();
      await page.keyboard.press("Enter");
      await expect(days.last()).toHaveAttribute("aria-pressed", "true");
      const directory = `output/playwright/settings-progress-clarity/${testInfo.project.name}`;
      await mkdir(directory, { recursive: true });
      await page.screenshot({ path: `${directory}/${language}-${width}-month.png` });
      await page.getByRole("tab", { name: ar ? "سنة" : "Year", exact: true }).click();
      const chart = page.getByTestId("year-monthly-chart");
      await expect(chart).toBeVisible();
      const label = chart.locator(":scope > div > span").first();
      await expect(label).toHaveText(ar ? "٥٠٪" : "50%");
      const labelFits = await label.evaluate((node) => node.scrollWidth <= node.clientWidth + 1);
      expect(labelFits).toBe(true);
      await page.screenshot({ path: `${directory}/${language}-${width}-year.png` });
      if (width === 320) {
        await page.evaluate(() => {
          document.documentElement.style.fontSize = "200%";
        });
        const labelsFit = await chart
          .locator(":scope > div > span")
          .evaluateAll((nodes) => nodes.every((node) => node.scrollWidth <= node.clientWidth + 1));
        expect(labelsFit).toBe(true);
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
