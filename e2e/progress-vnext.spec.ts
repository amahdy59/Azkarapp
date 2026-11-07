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
    const pattern = page.getByTestId("progress-heatmap");
    await expect(pattern.locator('[data-day="2026-10-15"]')).toHaveAttribute("data-kind", "recorded");
    await expect(pattern.locator('[data-day="2026-10-20"]')).toHaveAttribute("data-kind", "none");
    await expect(pattern.locator('[data-day="2026-10-21"]')).toBeDisabled();
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const enlarged of [false, true]) {
        await page.evaluate((enlarged) => {
          document.documentElement.style.fontSize = enlarged ? "200%" : "100%";
        }, enlarged);
        const date = page.getByTestId("garden-view-date");
        const filters = page.getByTestId("progress-filters-toggle");
        await expect(filters).toBeVisible();
        await expect(filters).toHaveAttribute("aria-expanded", "false");
        await expect(date).toBeVisible();
        expect(
          await date.evaluate(
            (node) =>
              node.scrollWidth <= node.clientWidth + 1 &&
              getComputedStyle(node).overflowX === "visible" &&
              node.getBoundingClientRect().height <= node.parentElement!.getBoundingClientRect().height,
          ),
        ).toBe(true);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
        // A reflowed month can be taller than the viewport. Reveal its title,
        // including after the responsive shell finishes replacing its scrollport.
        // Scroll only the page's owner: native scrollIntoView can also scroll
        // clipped outer shell ancestors during Firefox/WebKit shell replacement.
        const calendarTitle = pattern.getByRole("heading", { level: 2 });
        await expect(async () => {
          await calendarTitle.evaluate((node) => {
            const viewport = node.closest<HTMLElement>(".progress-screen")!;
            const controls = viewport.querySelector<HTMLElement>('[data-testid="progress-sticky-controls"]')!;
            viewport.scrollTop +=
              node.getBoundingClientRect().top - viewport.getBoundingClientRect().top - controls.clientHeight - 16;
          });
          // Font/layout reflow can finish after the scroll assignment. Prove
          // actual intersection and reveal again within the same 15s deadline.
          await expect(calendarTitle).toBeInViewport({ timeout: 250 });
        }).toPass({ timeout: 15_000 });
        await expect
          .poll(() => pattern.evaluate((node) => node.scrollWidth - node.clientWidth), {
            message: `Calendar overflow at ${language}/${width}/${enlarged ? "200" : "100"}%`,
          })
          .toBeLessThanOrEqual(1);
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
    await expect(table.getByRole("rowheader")).toHaveCount(19);
    await expect(table.getByRole("row").nth(1)).toContainText(ar ? "٣" : "3");
    await expect(table.getByRole("row").nth(15)).toContainText(ar ? "١٥" : "15");
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

for (const language of ["ar", "en"] as const) {
  test(`Progress reference visual review in ${language} @cross-browser`, async ({ page }, info) => {
    await seed(page, language, "light", "solid");
    for (const width of [390, 1280]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto("/#/progress/month");
      await page.getByTestId("progress-tab-overview").click();
      await expect(page.getByTestId("progress-overview")).toBeVisible();
      await page.screenshot({ path: info.outputPath(`reference-${language}-${width}-overview.png`), fullPage: true });
      await page.getByTestId("progress-tab-trends").click();
      await chooseProgressOption(
        page.getByRole("combobox", { name: language === "ar" ? "عرض اتجاه" : "Show trend for", exact: true }),
        "routines",
      );
      await expect(page.getByTestId("recording-time-column").first()).toBeVisible();
      await page.screenshot({ path: info.outputPath(`reference-${language}-${width}-trends.png`), fullPage: true });
      await expect(page.getByRole("tab")).toHaveCount(2);
      await expect(page.getByTestId("progress-tab-records")).toHaveCount(0);
    }
  });
}
