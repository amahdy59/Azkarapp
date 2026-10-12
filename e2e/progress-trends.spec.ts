import { mkdir } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function seedProgress(page: Page, language: "ar" | "en") {
  await page.clock.setFixedTime(new Date("2026-10-12T12:00:00+02:00"));
  await page.addInitScript((language) => {
    const records = [];
    for (let month = 0; month < 10; month++) {
      const days = month === 9 ? 12 : new Date(2026, month + 1, 0).getDate();
      for (let day = 1; day <= days; day++) {
        for (const [index, category] of ["morning", "evening", "before_sleep"].entries()) {
          if ((day + index) % (4 + (month % 3)) !== 0)
            records.push({
              dayKey: `2026-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
              category,
              timeZone: "Africa/Cairo",
            });
        }
      }
    }
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    if (!localStorage.getItem("azkarapp.state.v1"))
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language, themeMode: "midnight", calendarType: "gregorian", reduceMotion: true },
          profile: { displayName: "Guest", isGuest: true },
          dailyCompletions: records,
        }),
      );
  }, language);
}

for (const language of ["ar", "en"] as const) {
  test(`@cross-browser ${language} progress trends preserve exact data, details and month navigation`, async ({
    page,
  }, testInfo) => {
    const ar = language === "ar";
    await page.setViewportSize({ width: 390, height: 844 });
    await seedProgress(page, language);
    await page.goto("/#/progress");
    const directory = `output/progress-review-2026-10-12/after/${testInfo.project.name}`;
    await mkdir(directory, { recursive: true });
    await expect(page.getByTestId("today-garden-card")).toBeVisible();
    await expect(page.getByTestId("thimar-progress-badge")).toHaveCount(0);
    const geometry = await page.evaluate(() => {
      const header = document.querySelector('[data-testid="shared-screen-header"]')!.getBoundingClientRect();
      const tabs = document.querySelector('[role="tablist"]')!.getBoundingClientRect();
      const navigation = document.querySelector('[data-testid="progress-period-navigation"]')!.getBoundingClientRect();
      return { headerGap: tabs.top - header.bottom, controlGap: navigation.top - tabs.bottom };
    });
    expect(geometry.headerGap).toBeGreaterThanOrEqual(12);
    expect(geometry.controlGap).toBeGreaterThanOrEqual(12);
    await page.screenshot({ path: directory + "/" + language + "-day.png" });
    await page.getByRole("tab", { name: ar ? "أسبوع" : "Week", exact: true }).click();
    await expect(page.getByRole("table")).toBeVisible();
    await page.screenshot({ path: `${directory}/${language}-week.png` });
    await page.getByText(ar ? "مقارنة الأوراد" : "Compare routines", { exact: true }).click();
    await expect(page.getByRole("img", { name: ar ? /^الصباح:/ : /^Morning:/ })).toBeVisible();
    await page.screenshot({ path: `${directory}/${language}-week-comparison.png`, fullPage: true });
    await page.getByRole("tab", { name: ar ? "سنة" : "Year", exact: true }).click();
    const chart = page.getByTestId("year-monthly-chart");
    await expect(chart).toBeVisible();
    await expect(chart.locator("circle")).toHaveCount(10);
    await chart.getByRole("combobox").click();
    await page.getByRole("option", { name: language === "ar" ? "فبراير" : "February", exact: true }).click();
    await expect(chart.getByRole("status")).toContainText(ar ? "٨١٪" : "81%");
    await page.screenshot({ path: `${directory}/${language}-year-phone.png` });
    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(axe.violations).toEqual([]);
    await chart.getByText(ar ? "عرض بيانات الرسم" : "View chart data", { exact: true }).click();
    const data = chart.getByRole("table");
    await expect(data.getByRole("row").filter({ hasText: ar ? "فبراير" : "February" })).toContainText(
      ar ? "٨١٪" : "81%",
    );
    await chart.getByRole("button", { name: ar ? "استكشف هذا الشهر" : "Explore this month" }).click();
    await expect(page.getByRole("tab", { name: ar ? "شهر" : "Month", exact: true })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(page.getByTestId("garden-view-date")).toContainText(ar ? "فبراير" : "February");
    await expect(page.getByTestId("month-weekly-chart")).toBeVisible();
    await expect(page.getByTestId("garden-month-calendar")).toBeHidden();
    await page.screenshot({ path: `${directory}/${language}-month-phone.png` });
    await page.getByText(ar ? "التقويم" : "Calendar", { exact: true }).click();
    await expect(page.getByTestId("garden-month-calendar")).toBeVisible();
    await expect(page.getByTestId("month-weekly-chart")).toHaveCount(0);
    await page.getByTestId("garden-month-calendar").scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${directory}/${language}-month-heatmap.png`, fullPage: true });
    const heatmapAxe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(heatmapAxe.violations).toEqual([]);
    await page.getByRole("button", { name: ar ? "الاتجاه" : "Trend", exact: true }).click();
    await expect(page.getByTestId("month-weekly-chart")).toBeVisible();
    await expect(page.getByTestId("garden-month-calendar")).toBeHidden();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    ).toBe(true);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.getByRole("tab", { name: ar ? "سنة" : "Year", exact: true }).click();
    await expect(chart).toBeVisible();
    await page.screenshot({ path: `${directory}/${language}-year-desktop.png` });
    await page.context().setOffline(true);
    await page.getByRole("tab", { name: ar ? "يوم" : "Day", exact: true }).click();
    await expect(page.getByTestId("today-garden-card")).toBeVisible();
    await page.getByRole("tab", { name: ar ? "سنة" : "Year", exact: true }).click();
    await expect(chart.locator("circle")).toHaveCount(10);
  });
}

test("installed Progress restores recorded trends after an offline reload", async ({ page }) => {
  await seedProgress(page, "en");
  await page.goto("/#/progress");
  await page.getByRole("tab", { name: "Year", exact: true }).click();
  await expect(page.getByTestId("year-monthly-chart").locator("circle")).toHaveCount(10);
  await page.evaluate(async () => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await page.context().setOffline(true);
  await page.reload();
  await expect(page.getByTestId("today-garden-card")).toBeVisible();
  await page.getByRole("tab", { name: "Year", exact: true }).click();
  const chart = page.getByTestId("year-monthly-chart");
  await expect(chart.locator("circle")).toHaveCount(10);
  await chart.getByRole("combobox").click();
  await page.getByRole("option", { name: "February", exact: true }).click();
  await expect(chart.getByRole("status")).toContainText("81%");
});

for (const language of ["ar", "en"] as const) {
  test(`@cross-browser ${language} period headings reflow at 320px with 200% text`, async ({ page }, testInfo) => {
    await seedProgress(page, language);
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto("/#/progress");
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    const labels = language === "ar" ? ["يوم", "أسبوع", "شهر", "سنة"] : ["Day", "Week", "Month", "Year"];
    for (const label of labels) {
      await page.getByRole("tab", { name: label, exact: true }).click();
      await expect(page.getByRole("tabpanel")).toHaveAccessibleName(label);
      if (label === "Week" || label === "أسبوع") await expect(page.getByRole("table")).toBeVisible();
      if (label === "Month" || label === "شهر") await expect(page.getByTestId("month-weekly-chart")).toBeVisible();
      if (label === "Year" || label === "سنة") await expect(page.getByTestId("year-monthly-chart")).toBeVisible();
      const navigation = page.getByTestId("progress-period-navigation");
      await expect
        .poll(() =>
          navigation.evaluate((node) => {
            const buttons = [...node.querySelectorAll("button")].map((button) => button.getBoundingClientRect());
            const text = node.querySelector('[data-testid="garden-view-date"]')!;
            const rect = text.getBoundingClientRect();
            const bounds = buttons.sort((a, b) => a.left - b.left);
            return (
              text.scrollWidth <= text.clientWidth + 1 &&
              rect.left >= bounds[0]!.right &&
              rect.right <= bounds[1]!.left &&
              buttons.every((button) => button.width >= 44 && button.height >= 44)
            );
          }),
        )
        .toBe(true);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
      ).toBe(true);
    }
    await page.screenshot({ path: testInfo.outputPath(`${language}-period-200.png`) });
  });
}
