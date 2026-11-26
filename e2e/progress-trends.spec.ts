import {
  chooseProgressOption,
  chooseProgressDetail,
  openPrayerBreakdown,
  openProgressExport,
} from "./helpers/progress";
import { readFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { dashboardText } from "../src/app/i18n/progressDashboard";

async function seedProgress(page: Page, language: "ar" | "en", theme = "midnight", glass = false) {
  await page.clock.setFixedTime(new Date("2026-10-18T12:00:00+02:00"));
  await page.addInitScript(
    ({ language, theme, glass }) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      if (localStorage.getItem("azkarapp.state.v1")) return;
      const dailyCompletions = [];
      const prayerTracking = [];
      for (let month = 1; month <= 10; month++) {
        const limit = month === 10 ? 19 : new Date(2026, month, 0).getDate();
        for (let day = 1; day <= limit; day++) {
          const dayKey = `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          dailyCompletions.push({ dayKey, category: "morning", timeZone: "Africa/Cairo" });
          if (day % 2 === 0) dailyCompletions.push({ dayKey, category: "evening", timeZone: "Africa/Cairo" });
          if (day % 5 === 0) dailyCompletions.push({ dayKey, category: "before_sleep", timeZone: "Africa/Cairo" });
          prayerTracking.push({
            dayKey,
            prayer: "fajr",
            location: "home",
            mosque: false,
            adhkar: true,
            sunnahBefore: true,
          });
          if (day % 2 === 0)
            prayerTracking.push({ dayKey, prayer: "isha", location: "mosque", mosque: true, adhkar: false });
        }
      }
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: {
            language,
            themeMode: theme,
            appMaterial: glass ? "glass" : "solid",
            calendarType: "gregorian",
            reduceMotion: true,
            progressDayStartHour: 0,
          },
          profile: { displayName: "Guest", isGuest: true },
          dailyCompletions,
          zikrHistory: [1, 2, 3].map((day) => ({
            dayKey: `2026-10-0${day}`,
            category: "morning",
            offeredIds: ["m-hm-77m", "m-hm-78m"],
            completedIds: ["m-hm-77m"],
          })),
          prayerTracking,
        }),
      );
    },
    { language, theme, glass },
  );
}

for (const language of ["ar", "en"] as const) {
  test(`@cross-browser ${language} activity patterns preserve exact data, comparisons and item history`, async ({
    page,
  }, info) => {
    const ar = language === "ar";
    await seedProgress(page, language);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/#/progress/month");
    await expect(page.getByTestId("progress-overview").getByRole("button")).toHaveCount(4);
    await chooseProgressDetail(page, "prayers");
    const prayers = await openPrayerBreakdown(page, language);
    await expect(prayers.locator(":scope > ul > li")).toHaveCount(5);
    await expect(prayers.getByRole("img").first()).toHaveAccessibleName(`${ar ? "الفجر" : "Fajr"}: 17/17`);
    const timeline = page.getByTestId("progress-main-trend");
    await expect(timeline.getByTestId("recording-time-point")).toHaveCount(17);
    await expect(timeline.getByTestId("recording-time-line")).toBeVisible();
    await expect(page.getByRole("table")).toHaveCount(0);
    await chooseProgressOption(prayers.getByRole("combobox"), "rawatib");
    await expect(prayers.getByRole("list").getByRole("img")).toHaveCount(4);
    await expect(prayers.getByTestId("insight-asr")).toHaveCount(0);
    await chooseProgressDetail(page, "routines");
    const routines = page.getByTestId("progress-routine-bars");
    for (const [name, value] of [
      ["morning", "18"],
      ["evening", "9"],
      ["sleep", "3"],
    ] as const) {
      const bar = routines.getByRole("progressbar", { name: dashboardText(language, name), exact: true });
      await expect(bar).toHaveAttribute("aria-valuenow", value);
      await expect(bar).toHaveAttribute("aria-valuemax", "18");
    }
    const slider = timeline.getByRole("slider");
    await slider.focus();
    await page.keyboard.press("Home");
    await expect(slider).toHaveValue("0");
    await page.keyboard.press(ar ? "ArrowLeft" : "ArrowRight");
    await expect(slider).toHaveValue("1");
    await page.keyboard.press("End");
    await expect(slider).toHaveValue("16");
    await expect(page.getByTestId("progress-period-comparison")).toContainText(ar ? "١٧" : "17");
    await timeline.getByText(dashboardText(language, "chartTable"), { exact: true }).click();
    await expect(timeline.getByRole("table").getByRole("rowheader")).toHaveCount(17);
    await expect(timeline.getByRole("row").nth(1)).toContainText(ar ? "٣٣٪" : "33%");
    await chooseProgressDetail(page, "zikr");
    const individual = page.getByTestId("zikr-insights");
    await expect(individual.getByRole("link")).toHaveCount(2);
    await expect(individual.getByRole("img").first()).toHaveAccessibleName(
      ar ? /أُتمّ في ٠ من ٣/ : /Completed on 0 of 3/,
    );
    await page.screenshot({ path: info.outputPath(`${language}-individual-phone.png`) });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await chooseProgressDetail(page, "routines");
    const period = page.getByRole("combobox", {
      name: dashboardText(language, "dateRange"),
      exact: true,
      includeHidden: true,
    });
    await chooseProgressOption(period, "year");
    await expect(timeline.getByTestId("recording-time-point")).toHaveCount(10);
    await chooseProgressOption(period, "custom");
    await page.getByLabel(dashboardText(language, "start"), { exact: true }).fill("2025-01-01");
    await page.getByLabel(dashboardText(language, "end"), { exact: true }).fill("2025-12-31");
    await page.getByRole("button", { name: dashboardText(language, "apply"), exact: true }).click();
    await expect(page.getByTestId("garden-view-date")).toContainText(ar ? "٢٠٢٥" : "2025");
    await expect(timeline.getByTestId("recording-time-point")).toHaveCount(23);
    await slider.press("Home");
    await expect(timeline.getByTestId("timeline-readout")).toContainText(ar ? "٠" : "0");
    await chooseProgressOption(period, "month");
    await page.context().setOffline(true);
    await expect(routines.getByRole("progressbar").first()).toHaveAttribute("aria-valuenow", "18");
    await page.screenshot({ path: info.outputPath(`${language}-month-desktop-offline.png`) });
  });

  test(`@cross-browser ${language} exact JSON export retains routine counts, date boundaries and item history`, async ({
    page,
  }) => {
    await seedProgress(page, language);
    await page.goto("/#/progress/month");
    const menu = await openProgressExport(page, language);
    await menu.getByLabel(dashboardText(language, "start"), { exact: true }).fill("2026-10-01");
    await menu.getByLabel(dashboardText(language, "end"), { exact: true }).fill("2026-10-17");
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      menu.getByRole("button", { name: dashboardText(language, "export"), exact: true }).click(),
    ]);
    const file = JSON.parse(await readFile((await download.path())!, "utf8"));
    expect(file.schema).toBe("azkarapp.progress.v1");
    expect(file.selectedRange).toEqual({ startKey: "2026-10-01", endKey: "2026-10-17" });
    expect(file.calendar).toBe("gregorian");
    expect(file.devotionalDayStartHour).toBe(0);
    expect(file.dailyRecords).toHaveLength(17);
    expect([file.metrics.morning.count, file.metrics.evening.count, file.metrics.sleep.count]).toEqual([17, 8, 3]);
    expect(file.metrics.routines).toMatchObject({ count: 28, possible: 51, days: 17 });
    expect(file.records.dailyCompletions).toHaveLength(28);
    expect(file.zikrHistory).toHaveLength(3);
    for (const row of file.zikrHistory) expect(row.completedIds).toEqual(["m-hm-77m"]);
    expect(file.definitions).toMatchObject({
      prayerDay: "civil",
      routineAndQuranDay: "devotional",
      trendsUseCompleteDays: true,
      missingRecordsAreNotMissedWorship: true,
    });
  });

  for (const width of [320, 390, 900, 1440]) {
    test(`@cross-browser ${language} insight controls, contrast and sticky focus at ${width}px`, async ({
      page,
    }, info) => {
      await seedProgress(page, language, width === 320 ? "light" : width === 900 ? "dark" : "midnight", width === 390);
      await page.setViewportSize({ width, height: width === 320 ? 480 : 900 });
      await page.goto("/#/progress/year");
      if (width === 320)
        await page.locator("html").evaluate((node) => {
          node.style.fontSize = "200%";
        });
      await chooseProgressDetail(page, "prayers");
      const prayers = await openPrayerBreakdown(page, language);
      const controls = page.getByTestId("progress-sticky-controls");
      const viewport = page.locator(".progress-screen");
      const before = await controls.boundingBox();
      await viewport.evaluate((node) => {
        node.scrollTop = 600;
      });
      await expect
        .poll(() => controls.evaluate((node) => node.getBoundingClientRect().top))
        .toBeLessThanOrEqual(before!.y);
      expect(await viewport.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
      await expect(controls.getByRole("heading", { level: 1 })).toBeInViewport();
      expect((await controls.boundingBox())!.height).toBeLessThanOrEqual(
        (await viewport.evaluate((node) => node.clientHeight)) * 0.7,
      );
      const period = page.getByRole("combobox", {
        name: dashboardText(language, "dateRange"),
        exact: true,
        includeHidden: true,
      });
      for (const value of ["day", "week", "month", "year"]) {
        await chooseProgressOption(period, value);
        await expect(page.getByTestId("progress-filters-toggle")).toHaveAttribute("data-progress-value", value);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
      const metric = prayers.getByRole("combobox");
      await metric.focus();
      await page.keyboard.press("Enter");
      await page.keyboard.press("ArrowDown");
      await expect(page.getByRole("option").and(page.locator('[data-progress-value="mosque"]'))).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(metric).toHaveAttribute("data-progress-value", "mosque");
      await expect(metric).toBeFocused();
      await expect
        .poll(
          async () =>
            (await metric.boundingBox())!.y >=
            (await controls.boundingBox())!.y + (await controls.boundingBox())!.height,
        )
        .toBe(true);
      const targets = await page
        .locator(".progress-screen button")
        .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect()).filter((rect) => rect.width));
      expect(targets.every((rect) => rect.width >= 44 && rect.height >= 44)).toBe(true);
      const timeline = page.getByTestId("progress-main-trend");
      const plot = await timeline.getByTestId("recording-time-plot").boundingBox();
      const scale = await timeline.getByTestId("recording-time-scale").boundingBox();
      expect(scale!.y).toBeCloseTo(plot!.y, 0);
      expect(scale!.height).toBeCloseTo(plot!.height, 0);
      expect(
        await timeline.getByTestId("recording-time-point").evaluateAll((nodes) =>
          nodes.every((node) => {
            const box = node.getBoundingClientRect();
            return Math.abs(box.width - box.height) < 0.1;
          }),
        ),
      ).toBe(true);
      await timeline.getByRole("slider").press("Home");
      await expect(timeline.getByRole("slider")).toHaveValue("0");
      expect(
        (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations,
      ).toEqual([]);
      await page.screenshot({ path: info.outputPath(`${language}-insights-${width}.png`) });
    });
  }
}

test("installed Progress restores meaningful charts after an offline reload", async ({ page }) => {
  await seedProgress(page, "en");
  await page.goto("/#/progress/month");
  await chooseProgressDetail(page, "routines");
  await expect(page.getByTestId("progress-main-trend").getByTestId("recording-time-point")).toHaveCount(17);
  await page.evaluate(async () => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await page.context().setOffline(true);
  await page.reload();
  await chooseProgressDetail(page, "routines");
  const routines = page.getByTestId("progress-routine-bars");
  await expect(routines.getByRole("progressbar").first()).toHaveAttribute("aria-valuenow", "18");
  await expect(page.getByTestId("progress-main-trend").getByTestId("recording-time-point")).toHaveCount(17);
  await chooseProgressDetail(page, "prayers");
  const prayers = await openPrayerBreakdown(page, "en");
  await expect(prayers.getByRole("img").first()).toHaveAccessibleName("Fajr: 17/17");
  await chooseProgressDetail(page, "zikr");
  await expect(page.getByTestId("zikr-insights").getByRole("link")).toHaveCount(2);
});
