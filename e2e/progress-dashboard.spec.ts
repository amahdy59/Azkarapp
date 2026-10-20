import { chooseProgressDetail, chooseProgressOption, expectProgressFilterFocus } from "./helpers/progress";
import { readFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function seed(page: Page, language: "ar" | "en", theme = "midnight", glass = true) {
  await page.clock.setFixedTime(new Date("2026-10-20T12:00:00+03:00"));
  await page.addInitScript(
    ({ language, theme, glass }) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      const dailyCompletions = [],
        prayerTracking = [],
        wirdHistory: Record<string, number[]> = {},
        quranWirdDailyGoals: Record<string, number> = {};
      for (let index = 1; index <= 20; index++) {
        const dayKey = `2026-10-${String(index).padStart(2, "0")}`;
        dailyCompletions.push({ dayKey, category: "morning", timeZone: "Africa/Cairo" });
        if (index % 2 === 0) dailyCompletions.push({ dayKey, category: "evening", timeZone: "Africa/Cairo" });
        prayerTracking.push({ dayKey, prayer: "fajr", location: "home", adhkar: true, sunnahBefore: true });
        if (index % 2 === 0) prayerTracking.push({ dayKey, prayer: "isha", location: "mosque", mosque: true });
        wirdHistory[dayKey] = index % 2 ? [1, 2] : [1, 2, 3, 4];
        quranWirdDailyGoals[dayKey] = 4;
      }
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: {
            language,
            themeMode: theme,
            appMaterial: glass ? "glass" : "solid",
            calendarType: "gregorian",
            progressDayStartHour: 3,
            reduceMotion: true,
          },
          profile: { isGuest: true },
          dailyCompletions,
          prayerTracking,
          wirdHistory,
          quranWirdDailyGoals,
          quranWirdPlan: { kind: "daily", dailyPages: 4 },
        }),
      );
    },
    { language, theme, glass },
  );
}
for (const language of ["ar", "en"] as const) {
  test(`one shared date picker controls day, month, range and records in ${language} @cross-browser`, async ({
    page,
  }, info) => {
    const ar = language === "ar";
    await seed(page, language);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/#/progress/month");
    await page.getByTestId("progress-tab-records").click();
    await expect(page.getByRole("searchbox")).toHaveCount(0);
    await expect(page.locator(".progress-records-surface")).toHaveCSS("background-color", /0\.82/);
    const dateButton = page.getByRole("button", { name: ar ? /^اختيار التواريخ:/ : /^Choose dates:/ });
    await dateButton.click();
    await expect(page.getByTestId("progress-date-sheet").getByTestId("modal-close-button")).toBeFocused();
    await page.getByRole("radio", { name: ar ? "تاريخ واحد" : "One date", exact: true }).check();
    await page.getByLabel(ar ? "التاريخ الميلادي" : "Gregorian date", { exact: true }).fill("2026-10-03");
    await page.getByRole("button", { name: ar ? "تطبيق" : "Apply", exact: true }).click();
    await expect(page.getByTestId("progress-range-disclosure")).not.toHaveAttribute("open");
    await expect(page.getByRole("table").getByRole("rowheader")).toHaveCount(1);
    await expect(page.getByRole("rowheader").locator("time")).toHaveAttribute("datetime", "2026-10-03");
    const selected = await page.getByTestId("garden-view-date").textContent();
    await page.getByTestId("progress-tab-overview").click();
    await expect(page.getByTestId("progress-metric-pages")).toContainText(ar ? "٢" : "2");
    await page.getByTestId("progress-tab-trends").click();
    await expect(page.getByTestId("progress-main-trend")).toHaveCount(0);
    await expect(page.getByRole("button", { name: ar ? "عرض هذا الأسبوع" : "View this week" })).toBeVisible();
    await expect(page.getByTestId("garden-view-date")).toHaveText(selected!);
    await dateButton.click();
    await page.getByRole("radio", { name: ar ? "شهر" : "Month", exact: true }).check();
    await page.getByLabel(ar ? "الشهر الميلادي" : "Gregorian month", { exact: true }).fill("2026-09");
    await page.getByRole("button", { name: ar ? "تطبيق" : "Apply", exact: true }).click();
    await expect(
      page.getByRole("combobox", { name: ar ? "الفترة" : "Period", exact: true, includeHidden: true }),
    ).toHaveAttribute("data-progress-value", "month");
    await page.getByTestId("progress-tab-records").click();
    await expect(page.getByRole("rowheader")).toHaveCount(0);
    await expect(
      page.getByText(ar ? "لا توجد سجلات محفوظة في هذه الفترة." : "No saved records in this period."),
    ).toBeVisible();
    await page.getByRole("button", { name: ar ? "اليوم" : "Today", exact: true }).click();
    await expect(page.getByRole("rowheader").locator("time")).toHaveAttribute("datetime", "2026-10-20");
    await dateButton.click();
    await page.getByRole("radio", { name: ar ? "تواريخ مخصصة" : "Custom dates", exact: true }).check();
    await page.getByLabel(ar ? "تاريخ البداية" : "Start date", { exact: true }).fill("2026-10-02");
    await page.getByLabel(ar ? "تاريخ النهاية" : "End date", { exact: true }).fill("2026-10-08");
    await page.getByRole("button", { name: ar ? "تطبيق" : "Apply", exact: true }).click();
    await expect(page.getByRole("rowheader")).toHaveCount(7);
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: ar ? "تصدير JSON" : "Export JSON", exact: true }).click(),
    ]);
    const file = JSON.parse(await readFile((await download.path())!, "utf8"));
    expect(file.selectedRange).toEqual({ startKey: "2026-10-02", endKey: "2026-10-08" });
    expect(file.dailyRecords).toHaveLength(7);
    await page.screenshot({ path: info.outputPath(`progress-${language}-clean-records.png`), scale: "css" });
    await page.getByTestId("progress-tab-overview").click();
    await page.getByTestId("progress-detailed-context").locator("summary").click();
    await expect(page.getByRole("region", { name: ar ? "حسب الصلاة" : "By prayer", exact: true })).toBeVisible();
    await expect(page.getByTestId("zikr-insights")).toHaveCount(0);
    await chooseProgressDetail(page, "routines");
    await expect(page.getByRole("region", { name: ar ? "حسب الصلاة" : "By prayer", exact: true })).toHaveCount(0);
    await expect(page.getByTestId("zikr-insights")).toBeVisible();
    await chooseProgressDetail(page, "friday");
    await expect(page.getByTestId("zikr-insights")).toHaveCount(0);
    await expect(
      page.getByRole("combobox", { name: ar ? "استكشاف التفاصيل" : "Explore details", exact: true }),
    ).toBeFocused();
    await page.setViewportSize({ width: 320, height: 700 });
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    await dateButton.click();
    await expect(page.getByTestId("progress-date-sheet").getByTestId("modal-close-button")).toBeFocused();
    await page.getByRole("radio", { name: ar ? "تاريخ واحد" : "One date", exact: true }).check();
    const enlargedDate = page.getByLabel(ar ? "التاريخ الميلادي" : "Gregorian date", { exact: true });
    await enlargedDate.click();
    await enlargedDate.fill("2026-10-06");
    await expect(enlargedDate).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    await page.screenshot({ path: info.outputPath(`progress-${language}-date-editor-320.png`), scale: "css" });
    expect(
      (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations,
    ).toEqual([]);
    await page.getByRole("radio", { checked: true }).press("Escape");
    await expect(page.getByTestId("progress-range-disclosure")).not.toHaveAttribute("open");
    await expect(dateButton).toBeFocused();
  });
  test(`Progress cards open their own trend and preserve the range across keyboard tabs in ${language} @cross-browser`, async ({
    page,
  }, info) => {
    await seed(page, language);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/#/progress/month");
    const date = page.getByTestId("garden-view-date");
    const included = await date.textContent();
    const summary = page.getByTestId("progress-range-disclosure").locator("summary");
    await expect(summary).toContainText(language === "ar" ? "الفترة والتقويم" : "Date range and calendar");
    await expect(summary).toContainText(language === "ar" ? "توسيع" : "Expand");
    await expect(page.getByTestId("progress-metric-pages").getByRole("progressbar")).toHaveCount(0);
    await expect(page.getByTestId("progress-metric-prayers").getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "30",
    );
    await page.getByTestId("progress-metric-pages").getByRole("button").click();
    const trends = page.getByTestId("progress-tab-trends");
    await expect(trends).toBeFocused();
    await expect(trends).toHaveAttribute("aria-selected", "true");
    await expect(
      page.getByRole("combobox", { name: language === "ar" ? "عرض اتجاه" : "Show trend for", exact: true }),
    ).toHaveAttribute("data-progress-value", "pages");
    await expect(date).toHaveText(included!);
    await trends.press("End");
    await expect(page.getByTestId("progress-tab-records")).toBeFocused();
    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.getByTestId("progress-main-trend")).toHaveCount(0);
    await page.getByTestId("progress-tab-records").press("Home");
    await expect(page.getByTestId("progress-tab-overview")).toBeFocused();
    await expect(page.getByTestId("progress-overview")).toBeVisible();
    await expect(date).toHaveText(included!);
    await page.screenshot({ path: info.outputPath(`progress-${language}-tabs.png`), scale: "css" });
  });
  test(`focused Progress applies Custom dates, reconciles smart records and exports all data in ${language} @cross-browser`, async ({
    page,
  }, testInfo) => {
    const ar = language === "ar";
    await seed(page, language);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/#/progress/month");
    const period = page.getByRole("combobox", { name: ar ? "الفترة" : "Period", exact: true, includeHidden: true });
    await expect(period).toHaveAttribute("data-progress-value", "month");
    await expect(page.getByTestId("progress-overview").locator(":scope > div")).toHaveCount(4);
    await expect(page.getByTestId("progress-metric-prayers")).toContainText(ar ? "٣٠ من ١٠٠" : "30 of 100");
    await expect(page.getByTestId("progress-metric-routines")).toContainText(ar ? "٣٠ من ٦٠" : "30 of 60");
    await expect(page.getByTestId("progress-metric-pages")).toContainText(ar ? "٦٠" : "60");
    await expect(page.getByTestId("progress-main-trend")).toHaveCount(0);
    await expect(page.getByRole("table")).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath(`progress-${language}-overview.png`), scale: "css" });
    const overviewBounds = (await page.getByTestId("progress-overview").boundingBox())!;
    expect(overviewBounds.y + overviewBounds.height).toBeLessThan(780);
    await chooseProgressOption(period, "custom");
    await page.getByLabel(ar ? "تاريخ البداية" : "Start date", { exact: true }).fill("2026-10-09");
    await page.getByLabel(ar ? "تاريخ النهاية" : "End date", { exact: true }).fill("2026-10-02");
    await page.getByRole("button", { name: ar ? "تطبيق" : "Apply", exact: true }).click();
    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page.getByTestId("progress-metric-prayers")).toContainText(ar ? "٣٠ من ١٠٠" : "30 of 100");
    await page.getByLabel(ar ? "تاريخ البداية" : "Start date", { exact: true }).fill("2026-10-02");
    await page.getByLabel(ar ? "تاريخ النهاية" : "End date", { exact: true }).fill("2026-10-08");
    await page.getByRole("button", { name: ar ? "تطبيق" : "Apply", exact: true }).click();
    await expectProgressFilterFocus(period);
    await expect(period).toHaveAttribute("data-progress-value", "custom");
    await expect(page.getByTestId("progress-metric-prayers")).toContainText(ar ? "١١ من ٣٥" : "11 of 35");
    await expect(page.getByTestId("progress-metric-routines")).toContainText(ar ? "١١ من ٢١" : "11 of 21");
    await expect(page.getByTestId("progress-metric-pages")).toContainText(ar ? "٢٢" : "22");
    await expect(page.getByTestId("progress-metric-quranGoals")).toContainText(ar ? "٤ من ٧" : "4 of 7");
    await page.getByTestId("progress-tab-trends").click();
    await chooseProgressOption(
      page.getByRole("combobox", { name: ar ? "عرض اتجاه" : "Show trend for", exact: true }),
      "pages",
    );
    const chart = page.getByTestId("progress-main-trend");
    await expect(chart.getByTestId("recording-time-point")).toHaveCount(7);
    expect(
      await chart.getByTestId("recording-time-point").evaluateAll((nodes) =>
        nodes.every((node) => {
          const box = node.getBoundingClientRect();
          return Math.abs(box.width - box.height) < 0.1;
        }),
      ),
    ).toBe(true);
    await expect(chart.getByTestId("recording-time-scale")).not.toContainText(/%|٪/);
    const slider = chart.getByRole("slider");
    await slider.focus();
    await page.keyboard.press("Home");
    await expect(slider).toHaveValue("0");
    await expect(chart.getByTestId("timeline-readout")).toContainText(ar ? "٤" : "4");
    await page.keyboard.press("End");
    await expect(slider).toHaveValue("6");
    const pointControl = chart.getByRole("button", { name: /اختر تاريخًا|Choose a date/ });
    const pointBounds = (await pointControl.boundingBox())!;
    await pointControl.click({ position: { x: ar ? pointBounds.width - 8 : 8, y: 40 } });
    await expect(slider).toHaveValue("0");
    await pointControl.focus();
    await page.keyboard.press(ar ? "ArrowLeft" : "ArrowRight");
    await expect(slider).toHaveValue("1");
    await slider.focus();
    await page.keyboard.press("End");
    await expect(slider).toHaveValue("6");
    await page.keyboard.press(ar ? "ArrowRight" : "ArrowLeft");
    await expect(slider).toHaveValue("5");
    await page.getByTestId("progress-tab-records").click();
    const table = page.getByRole("table");
    await expect(table.getByRole("rowheader")).toHaveCount(7);
    await expect(page.getByRole("searchbox")).toHaveCount(0);
    await expect(table.getByRole("rowheader")).toHaveCount(7);
    const exportButton = page.getByRole("button", {
      name: ar ? "تصدير JSON" : "Export JSON",
      exact: true,
    });
    const [download] = await Promise.all([page.waitForEvent("download"), exportButton.click()]);
    const file = JSON.parse(await readFile((await download.path())!, "utf8"));
    expect(file.selectedRange).toEqual({ startKey: "2026-10-02", endKey: "2026-10-08" });
    expect(file.dailyRecords).toHaveLength(7);
    expect(file.metrics.prayers.count).toBe(11);
    expect(file.metrics.pages.count).toBe(22);
    expect(file.records.dailyCompletions).toHaveLength(11);
    expect(file.metrics.quranGoals).toMatchObject({ count: 4, possible: 7 });
    await chooseProgressOption(
      page.getByRole("combobox", {
        name: ar ? "عرض التواريخ بالتقويم" : "Show dates in",
        exact: true,
        includeHidden: true,
      }),
      "hijri",
    );
    await page.getByTestId("progress-tab-overview").click();
    await expect(page.getByTestId("progress-metric-prayers")).toContainText(ar ? "١١ من ٣٥" : "11 of 35");
    await page.getByTestId("progress-tab-records").click();
    await page.screenshot({ path: testInfo.outputPath(`progress-${language}-custom-records.png`), scale: "css" });
    expect(
      (
        await new AxeBuilder({ page })
          .include(".app-main")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  });
  for (const width of [320, 834, 1280]) {
    test(`focused Progress reflows, keeps keyboard focus and readable chart/table in ${language} at ${width} @cross-browser`, async ({
      page,
    }, testInfo) => {
      const ar = language === "ar";
      await seed(page, language, width === 320 ? "light" : "midnight", width !== 320);
      await page.setViewportSize({ width, height: width === 320 ? 600 : 900 });
      await page.goto("/#/progress/month");
      const disclosure = page.getByTestId("progress-range-disclosure");
      if (!(await disclosure.evaluate((node) => (node as HTMLDetailsElement).open)))
        await disclosure.locator("summary").click();
      if (width === 320) await page.locator("html").evaluate((root) => (root.style.fontSize = "200%"));
      await expect(page.getByTestId("progress-overview")).toBeVisible();
      const choose = page.getByRole("button", { name: ar ? "اختيار المقاييس" : "Choose metrics", exact: true });
      await choose.click();
      const checkbox = page.getByRole("checkbox", { name: ar ? "صلوات المسجد" : "Prayers at the mosque", exact: true });
      await checkbox.check();
      await page
        .getByRole("button", { name: ar ? "تقديم صلوات المسجد" : "Move Prayers at the mosque up", exact: true })
        .click();
      await page.getByRole("button", { name: ar ? "تطبيق" : "Apply", exact: true }).click();
      await expect(choose).toBeFocused();
      await expect(page.getByTestId("progress-overview").locator(":scope > div")).toHaveCount(5);
      await page.getByTestId("progress-tab-trends").click();
      const metric = page.getByRole("combobox", { name: ar ? "عرض اتجاه" : "Show trend for", exact: true });
      await metric.focus();
      await expect
        .poll(
          async () =>
            (await metric.boundingBox())!.y -
            ((await page.getByTestId("progress-sticky-controls").boundingBox())!.y +
              (await page.getByTestId("progress-sticky-controls").boundingBox())!.height),
        )
        .toBeGreaterThanOrEqual(0);
      await chooseProgressOption(metric, "pages");
      const chart = page.getByTestId("progress-main-trend");
      await chart.getByRole("slider").focus();
      await page.keyboard.press("Home");
      await expect(chart.getByRole("slider")).toHaveValue("0");
      await page.getByTestId("progress-tab-records").click();
      await expect(page.getByRole("table")).toBeVisible();
      await expect(page.getByRole("rowheader")).toHaveCount(10);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const targets = await page
        .locator(".progress-screen button, .progress-screen select, .progress-screen summary")
        .evaluateAll((nodes) =>
          nodes
            .filter((node) => node.checkVisibility())
            .map((node) => ({
              w: node.getBoundingClientRect().width,
              h: node.getBoundingClientRect().height,
              name: node.textContent,
            })),
        );
      expect(targets.filter((target) => target.w < 44 || target.h < 44)).toEqual([]);
      expect(
        (
          await new AxeBuilder({ page })
            .include(".app-main")
            .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
      await page.screenshot({ path: testInfo.outputPath(`progress-${language}-${width}-table.png`), scale: "css" });
      await page.getByTestId("progress-tab-overview").click();
      await page.locator(".progress-screen").evaluate((node) => (node.scrollTop = 0));
      await page.screenshot({ path: testInfo.outputPath(`progress-${language}-${width}-overview.png`), scale: "css" });
    });
  }
}

for (const language of ["ar", "en"] as const) {
  for (const width of [320, 834]) {
    test(`Progress menus align, wrap and support keyboard dismissal in ${language} at ${width} @cross-browser`, async ({
      page,
    }, testInfo) => {
      const ar = language === "ar";
      await seed(page, language, width === 320 ? "light" : "midnight", width !== 320);
      await page.setViewportSize({ width, height: 700 });
      await page.goto("/#/progress/month");
      if (width === 320) await page.locator("html").evaluate((root) => (root.style.fontSize = "200%"));
      if (width === 320) {
        await page.getByTestId("progress-range-disclosure").locator("summary").click();
        const fields = page.getByTestId("progress-range-fields");
        const controls = fields.getByRole("combobox");
        const first = (await controls.nth(0).boundingBox())!;
        const second = (await controls.nth(1).boundingBox())!;
        expect(Math.abs(first.x - second.x)).toBeLessThan(1);
        expect(Math.abs(first.width - second.width)).toBeLessThan(1);
        expect(second.y).toBeGreaterThanOrEqual(first.y + first.height);
      }
      const period = page.getByRole("combobox", { name: ar ? "الفترة" : "Period", exact: true, includeHidden: true });
      const panel = page.getByTestId("progress-range-disclosure");
      if (!(await panel.evaluate((node) => (node as HTMLDetailsElement).open))) await panel.locator("summary").click();
      await period.focus();
      const trigger = (await period.boundingBox())!;
      await page.keyboard.press("Enter");
      const menu = page.getByRole("listbox");
      await expect(menu).toBeVisible();
      await expect(menu).toHaveAttribute("dir", ar ? "rtl" : "ltr");
      await expect(page.getByRole("option", { selected: true })).toHaveText(ar ? "شهر" : "Month");
      const box = (await menu.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(11);
      expect(box.x + box.width).toBeLessThanOrEqual(width - 11);
      expect(Math.abs(box.width - trigger.width)).toBeLessThan(2);
      expect(box.y).toBeGreaterThanOrEqual(11);
      expect(box.y + box.height).toBeLessThanOrEqual(689);
      expect(
        await menu.getByRole("option").evaluateAll((nodes) =>
          nodes.every((node) => {
            const text = node.querySelector("[data-radix-select-item-text]") ?? node.querySelector("span > span");
            const range = document.createRange();
            if (text) range.selectNodeContents(text);
            return (
              node.clientHeight >= 44 &&
              node.scrollWidth <= node.clientWidth &&
              (!text || range.getClientRects().length === 1)
            );
          }),
        ),
      ).toBe(true);
      await page.keyboard.press("End");
      await expect(page.getByRole("option").last()).toBeFocused();
      await page.screenshot({
        path: testInfo.outputPath(`progress-${language}-${width}-period-menu.png`),
        scale: "css",
      });
      expect(
        (
          await new AxeBuilder({ page })
            .include(".progress-select-content")
            .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
      await page.keyboard.press("Escape");
      await expect(menu).toHaveCount(0);
      await expect(period).toBeFocused();
      await expect(period).toHaveAttribute("data-progress-value", "month");
      await page.getByTestId("progress-tab-trends").click();
      const metric = page.getByRole("combobox", { name: ar ? "عرض اتجاه" : "Show trend for", exact: true });
      await metric.focus();
      await page.keyboard.press("Enter");
      await expect(menu.getByRole("option")).toHaveCount(10);
      await page.keyboard.press("End");
      await expect(menu.getByRole("option").last()).toBeFocused();
      await expect(menu.getByRole("option").last()).toBeInViewport();
      await page.keyboard.press("Home");
      await expect(menu.getByRole("option").first()).toBeFocused();
      await page.keyboard.press("ArrowDown");
      await expect(menu.getByRole("option").nth(1)).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(metric).toHaveAttribute("data-progress-value", "routines");
      const selectedValue = metric.locator('[data-slot="select-value"]');
      expect(await selectedValue.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
      const chartPoints = page.getByTestId("progress-main-trend").getByTestId("recording-time-point");
      const firstPoint = (await chartPoints.first().boundingBox())!;
      const lastPoint = (await chartPoints.last().boundingBox())!;
      expect(firstPoint.x > lastPoint.x).toBe(ar);
      await expect(metric).toBeFocused();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
}
