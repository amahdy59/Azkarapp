import { progressText } from "../src/app/i18n/progressInsights";
import { chooseProgressOption, chooseProgressDetail } from "./helpers/progress";
import { mkdir, readFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

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
  test(`@cross-browser ${language} optional patterns preserve exact data, rankings and complete exports`, async ({
    page,
  }, testInfo) => {
    const ar = language === "ar";
    await seedProgress(page, language);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/#/progress/month");
    await page.getByTestId("progress-detailed-context").locator(":scope > summary").click();
    const garden = page.getByTestId("today-garden-card");
    const prayers = page.getByTestId("prayer-comparison");
    await expect(prayers.getByRole("list").getByRole("img")).toHaveCount(5);
    const prayerTimeline = prayers.getByTestId("prayer-trends");
    await expect(prayerTimeline.getByTestId("recording-time-line")).toBeVisible();
    await chooseProgressOption(
      prayerTimeline.getByRole("combobox", { name: progressText(language, "insights.prayerFilter"), exact: true }),
      "fajr",
    );
    await expect(prayerTimeline.getByTestId("timeline-readout")).toContainText(ar ? "١٠٠٪" : "100%");
    await expect(page.getByRole("table")).toHaveCount(0);
    const rangeFilters = page.getByTestId("progress-range-disclosure");
    if (!(await rangeFilters.evaluate((node) => (node as HTMLDetailsElement).open)))
      await rangeFilters.locator("summary").click();
    // Range, topic and the two prayer selectors remain independently available.
    await expect(page.getByRole("combobox")).toHaveCount(5);
    await expect(page.getByTestId("prayer-coverage-hint")).toContainText(ar ? "١٧" : "17 complete days");
    await expect(prayers.getByTestId("insight-fajr").getByRole("img")).toHaveAccessibleName(
      ar ? /١٠٠٪/ : /100%; 17 days/,
    );
    await expect(prayers.getByTestId("insight-isha").getByRole("img")).toHaveAccessibleName(ar ? /٤٧٪/ : /47%; 8 days/);
    await chooseProgressDetail(page, "routines");
    await expect(garden.getByTestId("insight-morning").getByRole("img")).toHaveAccessibleName(
      ar ? /١٠٠٪/ : /100%; 17 days/,
    );
    await expect(garden.getByTestId("insight-before_sleep").getByRole("img")).toHaveAccessibleName(
      ar ? /١٨٪/ : /18%; 3 days/,
    );
    await expect(garden.getByRole("definition").first()).toContainText(ar ? "الصباح" : "Morning");
    const routineTimeline = page.getByTestId("routine-trends");
    await expect(routineTimeline.getByRole("img")).toHaveCount(1);
    await expect(routineTimeline.getByTestId("recording-time-line")).toBeVisible();
    await expect(routineTimeline.getByTestId("recording-time-point")).toHaveCount(3);
    for (const [label, percentage] of ar
      ? [
          ["الصباح", "١٠٠٪"],
          ["المساء", "٣٣٪"],
          ["النوم", "٣٣٪"],
        ]
      : [
          ["Morning", "100%"],
          ["Evening", "33%"],
          ["Sleep", "33%"],
        ]) {
      await chooseProgressOption(
        routineTimeline.getByRole("combobox", { name: progressText(language, "insights.routineFilter"), exact: true }),
        (
          {
            Morning: "morning",
            Evening: "evening",
            Sleep: "before_sleep",
            الصباح: "morning",
            المساء: "evening",
            النوم: "before_sleep",
          } as Record<string, string>
        )[label!]!,
      );
      await expect(routineTimeline.getByTestId("timeline-readout")).toContainText(percentage!);
    }
    const scrubber = routineTimeline.getByRole("slider");
    await scrubber.focus();
    await page.keyboard.press("Home");
    await expect(scrubber).toHaveValue("0");
    await expect(routineTimeline.getByTestId("timeline-readout")).toContainText(ar ? "١٤٪" : "14%");
    await page.keyboard.press(ar ? "ArrowLeft" : "ArrowRight");
    await expect(scrubber).toHaveValue("1");
    await expect(routineTimeline.getByTestId("timeline-change")).toContainText(ar ? "لم تتغيّر" : "unchanged");
    const chart = routineTimeline.getByRole("button", {
      name: ar ? /الأذكار عبر الوقت: اختر تاريخًا/ : /Remembrance over time: Choose a date/,
    });
    const chartBox = (await chart.boundingBox())!;
    await chart.click({ position: { x: ar ? chartBox.width - 8 : 8, y: 80 } });
    await expect(scrubber).toHaveValue("0");
    await chart.focus();
    await page.keyboard.press("End");
    await expect(scrubber).toHaveValue("2");
    await expect(routineTimeline.getByTestId("timeline-change")).toHaveCount(0);
    await expect(garden.getByTestId("period-comparison")).toContainText(ar ? "١٧" : "first 17 days of each");
    const individual = garden.getByTestId("zikr-insights");
    await expect(individual.getByRole("link")).toHaveCount(2);
    await expect(individual.getByRole("img").first()).toHaveAccessibleName(
      ar ? /أُتمّ في ٠ من ٣/ : /Completed on 0 of 3/,
    );
    await chooseProgressOption(
      routineTimeline.getByRole("combobox", { name: progressText(language, "insights.routineFilter"), exact: true }),
      "all",
    );
    await chooseProgressDetail(page, "prayers");
    await chooseProgressOption(
      prayers.getByRole("combobox", { name: progressText(language, "insights.practiceFilter"), exact: true }),
      "rawatib",
    );
    await expect(prayers.getByRole("list").getByRole("img")).toHaveCount(4);
    await expect(prayers.getByTestId("insight-asr")).toHaveCount(0);
    await prayerTimeline
      .getByRole("combobox", { name: progressText(language, "insights.prayerFilter"), exact: true })
      .click();
    await expect(page.getByRole("option", { name: ar ? "العصر" : "Asr", exact: true })).toHaveCount(0);
    await expect(page.getByRole("option")).toHaveCount(5);
    await page.keyboard.press("Escape");
    const directory = `output/playwright/progress-refinements/${testInfo.project.name}`;
    await mkdir(directory, { recursive: true });
    await page.getByTestId("progress-prayer-group").evaluate((node) => node.scrollIntoView({ block: "start" }));
    await page.screenshot({ path: `${directory}/${language}-prayer-phone.png` });
    await prayerTimeline
      .getByTestId("recording-time-plot")
      .evaluate((node) => node.scrollIntoView({ block: "center" }));
    await page.screenshot({ path: `${directory}/${language}-prayer-chart-phone.png` });
    await chooseProgressDetail(page, "routines");
    await garden.evaluate((node) => node.scrollIntoView({ block: "start" }));
    await page.screenshot({ path: `${directory}/${language}-month-phone.png` });
    await individual.evaluate((node) => node.scrollIntoView({ block: "start" }));
    await page.screenshot({ path: `${directory}/${language}-zikr-phone.png` });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await chooseProgressOption(
      page.getByRole("combobox", { name: ar ? "الفترة" : "Period", exact: true, includeHidden: true }),
      "year",
    );
    await expect(page.getByTestId("routine-trends").getByTestId("recording-time-point")).toHaveCount(10);
    await page.getByRole("button", { name: ar ? "الفترة السابقة" : "Previous period", exact: true }).click();
    await expect(page.getByTestId("garden-view-date")).toContainText(ar ? "٢٠٢٥" : "2025");
    await expect(page.getByTestId("routine-trends").getByTestId("recording-time-point")).toHaveCount(12);
    await expect(garden.getByTestId("recording-pattern-message")).toContainText(ar ? "لا توجد سجلات" : "No records");
    await page.getByRole("button", { name: ar ? "الفترة التالية" : "Next period", exact: true }).click();
    await garden.evaluate((node) => node.scrollIntoView({ block: "start" }));
    await page.screenshot({ path: `${directory}/${language}-year-desktop.png` });
    await page.context().setOffline(true);
    await chooseProgressOption(
      page.getByRole("combobox", { name: ar ? "الفترة" : "Period", exact: true, includeHidden: true }),
      "month",
    );
    await expect(garden.getByTestId("insight-morning").getByRole("img")).toHaveAccessibleName(ar ? /١٠٠٪/ : /100%/);
  });

  test(`@cross-browser ${language} exact JSON export retains routine counts, matched periods and item history`, async ({
    page,
  }) => {
    await seedProgress(page, language);
    await page.goto("/#/progress/month");
    await page.getByTestId("progress-detailed-context").locator(":scope > summary").click();
    await chooseProgressDetail(page, "routines");
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page
        .getByTestId("today-garden-card")
        .getByRole("button", {
          name: language === "ar" ? "تصدير الأوراد" : "Azkar JSON",
        })
        .click(),
    ]);
    const file = JSON.parse(await readFile((await download.path())!, "utf8"));
    expect(file.days).toBe(17);
    expect(file.endKey).toBe("2026-10-17");
    expect(file.calendarType).toBe("gregorian");
    expect(file.progressDayStartHour).toBe(0);
    expect(file.rows.map((row: { count: number }) => row.count)).toEqual([17, 8, 3]);
    expect(file.matchedPeriods.previous).toEqual({ startKey: "2026-09-01", endKey: "2026-09-17", days: 17 });
    expect(file.matchedCounts).toEqual({ current: 28, previous: 28, possible: 51 });
    expect(file.zikrHistory).toHaveLength(3);
    expect(file.zikrItems).toEqual([
      { id: "m-hm-78m", category: "morning", recorded: 0, possible: 3 },
      { id: "m-hm-77m", category: "morning", recorded: 3, possible: 3 },
    ]);
  });

  for (const width of [320, 390, 900, 1440]) {
    test(`@cross-browser ${language} insight controls, contrast and sticky focus at ${width}px`, async ({
      page,
    }, testInfo) => {
      const ar = language === "ar";
      await seedProgress(page, language, width === 320 ? "light" : width === 900 ? "dark" : "midnight", width === 390);
      await page.setViewportSize({ width, height: width === 320 ? 480 : 900 });
      await page.goto("/#/progress/year");
      if (width === 320)
        await page.evaluate(() => {
          document.documentElement.style.fontSize = "200%";
        });
      const controls = page.getByTestId("progress-sticky-controls");
      const scrollport = page.locator(".progress-screen");
      const before = await controls.boundingBox();
      await scrollport.evaluate((node) => {
        node.scrollTop = 600;
      });
      await expect.poll(() => controls.evaluate((node) => node.getBoundingClientRect().top)).toBeCloseTo(before!.y, 0);
      expect(await scrollport.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
      await expect(page.getByRole("heading", { name: ar ? "التقدم" : "Progress", exact: true })).toBeInViewport();
      await page.getByTestId("progress-detailed-context").locator(":scope > summary").click();
      const height = await scrollport.evaluate((node) => node.clientHeight);
      expect((await controls.boundingBox())!.height).toBeLessThanOrEqual(height * 0.7);
      for (const name of ar ? ["يوم", "أسبوع", "شهر", "سنة"] : ["Day", "Week", "Month", "Year"]) {
        const period = page.getByRole("combobox", { name: ar ? "الفترة" : "Period", exact: true, includeHidden: true });
        const value = (
          {
            يوم: "day",
            أسبوع: "week",
            شهر: "month",
            سنة: "year",
            Day: "day",
            Week: "week",
            Month: "month",
            Year: "year",
          } as Record<string, string>
        )[name]!;
        await chooseProgressOption(period, value);
        await expect(period).toHaveAttribute("data-progress-value", value);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
        ).toBe(true);
      }
      const metric = page
        .getByTestId("prayer-comparison")
        .getByRole("combobox", { name: progressText(language, "insights.practiceFilter"), exact: true });
      await metric.focus();
      await page.keyboard.press("Enter");
      await page.keyboard.press("ArrowDown");
      await expect(page.getByRole("option").and(page.locator('[data-progress-value="rawatib"]'))).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(metric).toHaveAttribute("data-progress-value", "rawatib");
      await expect
        .poll(async () => {
          const target = await metric.boundingBox();
          const chrome = await controls.boundingBox();
          return target!.y >= chrome!.y + chrome!.height;
        })
        .toBe(true);
      const targets = await page
        .locator(".progress-screen button")
        .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect()).filter((rect) => rect.width));
      expect(targets.every((rect) => rect.width >= 44 && rect.height >= 44)).toBe(true);
      const timeline = page.getByTestId("prayer-trends");
      if (width < 768) {
        const firstFilter = (await metric.boundingBox())!;
        const prayerFilter = (await timeline
          .getByRole("combobox", { name: progressText(language, "insights.prayerFilter"), exact: true })
          .boundingBox())!;
        expect(prayerFilter.y).toBeGreaterThanOrEqual(firstFilter.y + firstFilter.height);
        expect(Math.abs(prayerFilter.width - firstFilter.width)).toBeLessThan(1);
        expect(
          await metric
            .locator('[data-slot="select-value"]')
            .evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
        ).toBe(true);
      }
      const plot = await timeline.getByTestId("recording-time-plot").boundingBox();
      const scale = await timeline.getByTestId("recording-time-scale").boundingBox();
      expect(scale!.y).toBeCloseTo(plot!.y, 0);
      expect(scale!.height).toBeCloseTo(plot!.height, 0);
      const lineFocus = timeline.getByRole("combobox", {
        name: progressText(language, "insights.prayerFilter"),
        exact: true,
      });
      await lineFocus.focus();
      await page.keyboard.press("Enter");
      await page.keyboard.press("ArrowDown");
      await expect(page.getByRole("option").and(page.locator('[data-progress-value="fajr"]'))).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(lineFocus).toHaveAttribute("data-progress-value", "fajr");
      await expect(timeline.getByTestId("recording-flat-summary")).toBeVisible();
      expect(
        await timeline.getByTestId("recording-time-point").evaluateAll((nodes) =>
          nodes.every((node) => {
            const box = node.getBoundingClientRect();
            return Math.abs(box.width - box.height) < 0.1;
          }),
        ),
      ).toBe(true);
      const scrubber = timeline.getByRole("slider");
      await scrubber.focus();
      await page.keyboard.press("Home");
      await expect(scrubber).toHaveValue("0");
      const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      expect(axe.violations).toEqual([]);
      await page.screenshot({ path: testInfo.outputPath(`${language}-insights-${width}.png`) });
    });
  }
}

test("installed Progress restores meaningful charts after an offline reload", async ({ page }) => {
  await seedProgress(page, "en");
  await page.goto("/#/progress/month");
  await page.getByTestId("progress-detailed-context").locator(":scope > summary").click();
  await chooseProgressDetail(page, "routines");
  await expect(page.getByTestId("routine-trends").getByTestId("recording-time-point")).toHaveCount(3);
  await page.evaluate(async () => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await page.context().setOffline(true);
  await page.reload();
  await page.getByTestId("progress-detailed-context").locator(":scope > summary").click();
  await chooseProgressDetail(page, "routines");
  await expect(page.getByTestId("today-garden-card")).toBeVisible();
  await chooseProgressOption(page.getByRole("combobox", { name: "Period", exact: true, includeHidden: true }), "month");
  await expect(page.getByTestId("routine-trends").getByTestId("recording-time-point")).toHaveCount(3);
  await chooseProgressDetail(page, "prayers");
  await expect(page.getByTestId("prayer-trends").getByTestId("recording-time-line")).toBeVisible();
  await chooseProgressDetail(page, "routines");
  await expect(
    page.getByTestId("today-garden-card").getByTestId("insight-morning").getByRole("img"),
  ).toHaveAccessibleName(/100%; 17 days/);
});
