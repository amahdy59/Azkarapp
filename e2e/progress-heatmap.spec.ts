import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { chooseProgressOption } from "./helpers/progress";

async function seed(page: Page, language: "ar" | "en") {
  await page.clock.setFixedTime(new Date("2026-10-20T12:00:00+03:00"));
  await page.addInitScript((language) => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: {
          language,
          calendarType: "gregorian",
          progressDayStartHour: 3,
          themeMode: language === "ar" ? "midnight" : "light",
          appMaterial: language === "ar" ? "glass" : "solid",
          reduceMotion: true,
        },
        profile: { isGuest: true },
        dailyCompletions: ["2026-09-21", "2026-10-01", "2026-10-19"].flatMap((dayKey) => [
          { dayKey, category: "morning", timeZone: "Africa/Cairo" },
          { dayKey, category: "evening", timeZone: "Africa/Cairo" },
        ]),
        prayerTracking: [],
        dailyHabits: [],
        wirdHistory: { "2026-10-19": [1, 2, 3] },
        quranWirdDailyGoals: { "2026-10-19": 4 },
      }),
    );
  }, language);
}

for (const language of ["ar", "en"] as const) {
  test(`Progress rolling range, heatmap and aligned toolbar in ${language} @cross-browser`, async ({ page }, info) => {
    await seed(page, language);
    await page.setViewportSize({ width: 834, height: 1112 });
    await page.goto("/#/progress");
    const range = page.getByRole("combobox", { name: language === "ar" ? "نطاق التاريخ" : "Date range", exact: true });
    await expect(range).toHaveAttribute("data-progress-value", "last30");
    const date = page.getByTestId("garden-view-date");
    const dates = await date.textContent();
    expect(dates).toContain(language === "ar" ? "آخر ٣٠ يومًا" : "Last 30 days");
    const heatmap = page.getByTestId("progress-heatmap");
    const recorded = heatmap.locator('[data-day="2026-10-19"]');
    await expect(recorded).toHaveAttribute("data-kind", "recorded");
    await recorded.click();
    await expect(page.getByTestId("progress-date-details").getByRole("status")).toContainText(
      language === "ar" ? "٢ من ٣" : "2 of 3",
    );
    await recorded.press(language === "ar" ? "ArrowRight" : "ArrowLeft");
    await expect(heatmap.locator('[data-day="2026-10-18"]')).toBeFocused();
    await page.keyboard.press("Home");
    await expect(heatmap.locator('[data-day="2026-09-21"]')).toBeFocused();
    await page.keyboard.press("End");
    await expect(heatmap.locator('[data-day="2026-10-20"]')).toBeFocused();
    await expect(date).toHaveText(dates!);
    for (const width of [834, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await range.scrollIntoViewIfNeeded();
      const control = (await range.boundingBox())!;
      const tabs = (await page.getByRole("tablist").boundingBox())!;
      expect(Math.abs(control.y + control.height - tabs.y - tabs.height)).toBeLessThanOrEqual(2);
      expect(language === "ar" ? tabs.x + tabs.width <= control.x : control.x + control.width <= tabs.x).toBe(true);
      await page.screenshot({ path: info.outputPath(`heatmap-${language}-${width}.png`) });
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await recorded.click();
    const dateSheet = page.getByTestId("progress-date-sheet");
    await expect(dateSheet).toBeVisible();
    await expect(dateSheet.getByRole("status")).toContainText(language === "ar" ? "٢ من ٣" : "2 of 3");
    expect(
      (await new AxeBuilder({ page }).include('[data-testid="progress-date-sheet"]').analyze()).violations,
    ).toEqual([]);
    await page.screenshot({ path: info.outputPath(`heatmap-${language}-phone-details.png`) });
    await page.keyboard.press("Escape");
    await expect(dateSheet).toBeHidden();
    await expect(recorded).toBeFocused();
    await page.getByTestId("progress-metric-routines").getByRole("button").click();
    await expect(page.getByTestId("recording-time-column")).toHaveCount(29);
    await chooseProgressOption(
      page.getByRole("combobox", { name: language === "ar" ? "عرض الرسم" : "Chart display" }),
      "line",
    );
    await expect(page.getByTestId("recording-time-line")).toBeVisible();
    await page.getByTestId("progress-tab-records").click();
    await expect(page.getByRole("table")).toContainText(language === "ar" ? "٢١" : "21");
    await expect(date).toHaveText(dates!);
    await page.getByTestId("progress-tab-overview").click();
    const composition = page.getByTestId("progress-routine-bars").locator("summary");
    await composition.click();
    await expect(page.getByTestId("progress-routine-composition").getByRole("img")).toBeVisible();
    expect(
      (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations,
    ).toEqual([]);
    await page.screenshot({ path: info.outputPath(`heatmap-${language}-phone.png`) });
    await page.setViewportSize({ width: 320, height: 700 });
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    await range.scrollIntoViewIfNeeded();
    const control = (await range.boundingBox())!;
    const tabs = (await page.getByRole("tablist").boundingBox())!;
    expect(tabs.y).toBeGreaterThanOrEqual(control.y + control.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    const target = heatmap.locator('[data-day="2026-10-19"]');
    await target.scrollIntoViewIfNeeded();
    const box = (await target.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    await target.click();
    await expect(target).toHaveAttribute("aria-pressed", "true");
    await expect(dateSheet).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dateSheet).toBeHidden();
    await expect(target).toBeFocused();
    // Every date must fit horizontally; no hidden swipe is required.
    expect(await heatmap.locator(".heatmap-scroll").evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(
      true,
    );
    expect(
      await heatmap.locator("[data-day]:not(:disabled)").evaluateAll((nodes) =>
        nodes.every((node) => {
          const box = node.getBoundingClientRect();
          const grid = node.closest(".heatmap-scroll")!.getBoundingClientRect();
          return box.width >= 44 && box.height >= 44 && box.left >= grid.left && box.right <= grid.right;
        }),
      ),
    ).toBe(true);
    for (let step = 0; step < 3; step++) await page.keyboard.press(language === "ar" ? "ArrowRight" : "ArrowLeft");
    const focused = heatmap.locator('[data-day="2026-10-16"]');
    await expect(focused).toBeFocused();
    const visible = await focused.evaluate((node) => {
      const bounds = node.getBoundingClientRect();
      const viewport = node.closest(".heatmap-scroll")!.getBoundingClientRect();
      return bounds.left >= viewport.left - 1 && bounds.right <= viewport.right + 1;
    });
    expect(visible).toBe(true);
    await page.screenshot({ path: info.outputPath(`heatmap-${language}-320-200.png`) });
  });
}

test("Progress calendar marks future and unknown goals and bounds long ranges @cross-browser", async ({ page }) => {
  await seed(page, "en");
  await page.goto("/#/progress/year");
  const heatmap = page.getByTestId("progress-heatmap");
  await expect(heatmap.locator("[data-day]")).toHaveCount(35);
  await expect(heatmap.getByRole("button", { name: "November", exact: true })).toBeDisabled();
  await heatmap.getByRole("button", { name: "January", exact: true }).click();
  await expect(heatmap.getByRole("button", { name: "Previous calendar month" })).toBeDisabled();
  await chooseProgressOption(heatmap.getByRole("combobox", { name: "Activity" }), "quranGoals");
  await expect(heatmap.locator('[data-day="2026-01-01"]')).toHaveAttribute("data-kind", "unavailable");
  await expect(heatmap.locator('[data-day="2026-01-01"]')).toHaveAccessibleName(/Unavailable/);
  await heatmap.getByRole("button", { name: "October", exact: true }).click();
  await expect(heatmap.locator('[data-day="2026-10-21"]')).toBeDisabled();
  await expect(heatmap.locator('[data-day="2026-10-19"]')).toHaveAccessibleName(/0 of 1/);
  await chooseProgressOption(page.getByRole("combobox", { name: "Date range", exact: true }), "custom");
  await page.getByLabel("Start date").fill("1900-01-01");
  await page.getByLabel("End date").fill("2026-10-20");
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  expect(await heatmap.locator("[data-day]").count()).toBeLessThanOrEqual(42);
});
