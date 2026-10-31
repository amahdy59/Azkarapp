import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { chooseProgressOption } from "./helpers/progress";

async function seed(page: Page, language: "ar" | "en", theme = "light", material = "solid") {
  await page.clock.setFixedTime(new Date("2026-10-20T12:00:00+03:00"));
  await page.addInitScript(
    ({ language, theme, material }) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: {
            language,
            themeMode: theme,
            appMaterial: material,
            calendarType: "gregorian",
            progressDayStartHour: 3,
            reduceMotion: true,
          },
          profile: { isGuest: true },
          dailyCompletions: ["2026-09-01", "2026-10-01", "2026-10-08", "2026-10-15"].map((dayKey) => ({
            dayKey,
            category: "morning",
            timeZone: "Africa/Cairo",
          })),
          prayerTracking: [],
          dailyHabits: [],
          wirdHistory: { "2026-10-01": [1, 2], "2026-10-15": [3] },
          quranWirdDailyGoals: { "2026-10-15": 4 },
        }),
      );
    },
    { language, theme, material },
  );
}

for (const language of ["ar", "en"] as const) {
  test(`Progress overview and selected dates reflow across themes in ${language} @cross-browser`, async ({
    page,
  }, info) => {
    await seed(page, language, "midnight", "glass");
    await page.goto("/#/progress/month");
    const pattern = page.getByTestId("progress-recording-pattern");
    await expect(pattern.getByRole("listitem")).toHaveCount(7);
    await expect(pattern.locator("time").first()).toHaveAttribute("datetime", "2026-10-14");
    await expect(pattern.locator("time").last()).toHaveAttribute("datetime", "2026-10-20");
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const enlarged of [false, true]) {
        await page.evaluate((enlarged) => {
          document.documentElement.style.fontSize = enlarged ? "200%" : "100%";
        }, enlarged);
        const date = page.getByTestId("garden-view-date");
        await expect(date).toBeVisible();
        expect(
          await date.evaluate(
            (node) =>
              node.scrollWidth <= node.clientWidth + 1 &&
              getComputedStyle(node).overflow === "visible" &&
              node.getBoundingClientRect().height <= node.parentElement!.getBoundingClientRect().height,
          ),
        ).toBe(true);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
        await pattern.scrollIntoViewIfNeeded();
        expect(await pattern.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
        await page.screenshot({
          path: info.outputPath(`progress-${language}-${width}-${enlarged ? "200" : "100"}.png`),
          scale: "css",
        });
      }
    }
  });
  test(`Progress exact chart buckets and rate comparison stay coherent in ${language} @cross-browser`, async ({
    page,
  }, info) => {
    const ar = language === "ar";
    await seed(page, language);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/#/progress/month");
    await page.getByTestId("progress-metric-routines").getByRole("button").click();
    const chart = page.getByTestId("progress-main-trend");
    await expect(page.getByTestId("progress-period-comparison")).toContainText(ar ? "نقطة مئوية" : "percentage points");
    await chart.getByText(ar ? "بيانات الرسم الدقيقة" : "Exact chart data", { exact: true }).click();
    const table = chart.getByRole("table");
    await expect(table.getByRole("rowheader")).toHaveCount(3);
    await expect(table.getByRole("row").nth(1)).toContainText(ar ? "٢١" : "21");
    await expect(table.getByRole("row").nth(3)).toContainText(ar ? "١٥" : "15");
    await chooseProgressOption(
      page.getByRole("combobox", { name: ar ? "عرض اتجاه" : "Show trend for", exact: true }),
      "quranGoals",
    );
    await chart.getByText(ar ? "بيانات الرسم الدقيقة" : "Exact chart data", { exact: true }).click();
    await expect(chart.getByRole("table")).toContainText(ar ? "غير متاح" : "Unavailable");
    await expect(chart.getByTestId("recording-time-line")).toHaveCount(0);
    await page.screenshot({ path: info.outputPath(`progress-${language}-chart-data.png`), fullPage: true });
    expect(
      (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations,
    ).toEqual([]);
  });
}
