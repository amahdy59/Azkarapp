import { chooseProgressDetail, chooseProgressOption } from "./helpers/progress";
import { dashboardText } from "../src/app/i18n/progressDashboard";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const scenario of [
  { language: "en", width: 1440, theme: "midnight", material: "solid", enlarged: false },
  { language: "ar", width: 1440, theme: "midnight", material: "glass", enlarged: false },
  { language: "en", width: 834, theme: "light", material: "solid", enlarged: false },
  { language: "ar", width: 320, theme: "light", material: "solid", enlarged: true },
] as const) {
  test(`compact Progress panels and stable card hit geometry ${scenario.language}-${scenario.width} @cross-browser`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: scenario.width, height: 1000 });
    await page.clock.setFixedTime(new Date("2026-10-20T12:00:00+03:00"));
    await page.addInitScript((settings) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: {
            language: settings.language,
            themeMode: settings.theme,
            appMaterial: settings.material,
            calendarType: "gregorian",
            reduceMotion: true,
          },
          profile: { isGuest: true },
          wirdHistory: { "2026-10-19": [1, 2] },
        }),
      );
    }, scenario);
    await page.goto("/#/progress");
    if (scenario.enlarged)
      await page.locator("html").evaluate((node) => {
        node.style.fontSize = "200%";
      });
    await expect(page.getByTestId("progress-filters-toggle")).toHaveAttribute("data-progress-value", "month");
    await expect(page.getByText(/Saved records only;|غياب السجل لا يعني/)).toHaveCount(0);
    await page.evaluate(() => document.fonts.ready);
    const card = page.getByTestId("progress-metric-prayers");
    const link = card.getByRole("button");
    await card.scrollIntoViewIfNeeded();
    const geometry = () =>
      card.evaluate((node) => {
        const card = node.getBoundingClientRect();
        const action = node.querySelector("button")!;
        const arrow = node.querySelector(".progress-metric-arrow")!.getBoundingClientRect();
        const pseudo = getComputedStyle(action, "::after");
        return {
          height: card.height,
          width: card.width,
          arrowX: arrow.x - card.x,
          arrowY: arrow.y - card.y,
          actionFilter: getComputedStyle(action).filter,
          actionTransform: getComputedStyle(action).transform,
          inset: [pseudo.top, pseudo.right, pseudo.bottom, pseudo.left],
        };
      });
    const before = await geometry();
    if (!scenario.enlarged) expect(before.height).toBeLessThan(240);
    await link.hover();
    expect(await geometry()).toEqual(before);
    await page.screenshot({ path: info.outputPath("compact-metrics.png"), scale: "css" });
    await link.focus();
    expect(await link.evaluate((node) => getComputedStyle(node, "::after").outlineStyle)).toBe("solid");
    const calendar = page.getByTestId("progress-heatmap");
    const routines = page.getByTestId("progress-routine-bars");
    const panelGeometry = (testId: string) =>
      page.getByTestId(testId).evaluate((node) => {
        const rect = node.getBoundingClientRect(),
          css = getComputedStyle(node);
        return {
          width: rect.width,
          radius: css.borderTopLeftRadius,
          padding: css.paddingInlineStart,
          font: getComputedStyle(node.querySelector("h2")!).fontSize,
          overflow: node.scrollWidth > node.clientWidth + 1,
        };
      });
    const calendarGeometry = await panelGeometry("progress-heatmap");
    await calendar.scrollIntoViewIfNeeded();
    await page.screenshot({ path: info.outputPath("calendar-overview.png"), scale: "css" });
    await chooseProgressDetail(page, "routines");
    await expect(routines).toBeVisible();
    const routineGeometry = await panelGeometry("progress-routine-bars");
    expect(routineGeometry.radius).toBe(calendarGeometry.radius);
    expect(routineGeometry.padding).toBe(calendarGeometry.padding);
    expect(routineGeometry.font).toBe(calendarGeometry.font);
    expect(calendarGeometry.overflow || routineGeometry.overflow).toBe(false);
    expect(Math.abs(calendarGeometry.width - routineGeometry.width)).toBeLessThanOrEqual(1);
    expect(routineGeometry.width).toBeLessThanOrEqual(1280);
    await expect(routines.getByRole("progressbar")).toHaveCount(3);
    await chooseProgressOption(
      page.getByRole("combobox", { name: dashboardText(scenario.language, "metric"), exact: true }),
      "pages",
    );
    await chooseProgressOption(
      page.getByRole("combobox", {
        name: dashboardText(scenario.language, "dateRange"),
        exact: true,
        includeHidden: true,
      }),
      "custom",
    );
    await page.getByLabel(dashboardText(scenario.language, "start"), { exact: true }).fill("2026-10-13");
    await page.getByLabel(dashboardText(scenario.language, "end"), { exact: true }).fill("2026-10-19");
    await page.getByRole("button", { name: dashboardText(scenario.language, "apply"), exact: true }).click();
    const timeline = page.getByTestId("progress-main-trend");
    await expect(timeline.getByTestId("recording-time-column")).toHaveCount(7);
    const columns = await timeline
      .getByTestId("recording-time-column")
      .evaluateAll((nodes) => nodes.map((node) => Number(node.getAttribute("height"))));
    expect(columns.filter((height) => height > 0)).toHaveLength(1);
    await timeline.getByText(dashboardText(scenario.language, "chartTable"), { exact: true }).click();
    await expect(timeline.getByRole("table").getByRole("rowheader")).toHaveCount(7);
    await expect(timeline.getByRole("row").last()).toContainText(scenario.language === "ar" ? "٢" : "2");
    expect((await new AxeBuilder({ page }).include('[data-testid="progress-dashboard"]').analyze()).violations).toEqual(
      [],
    );
    await page.screenshot({ path: info.outputPath("page-trend-exact-data.png"), scale: "css" });
    await page.getByTestId("nav-quran").click();
    await expect(page.getByTestId("quran-wird-content")).toBeVisible();
    await expect(page.getByTestId("shared-screen-header").getByRole("button")).toHaveCount(0);
    const quran = page.getByTestId("quran-wird-content");
    expect(await quran.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
    await page.screenshot({ path: info.outputPath("quran-overview.png"), scale: "css" });
    await expect(routines).toHaveCount(0);
    await page.getByTestId("nav-azkar").click();
    await page.getByTestId("category-card-morning").click();
    // A Reader may open directly for a routine. Its immersive recovery stays;
    // ordinary category titles use the sidebar/rail when present.
    await page.goto("/#/azkar/morning");
    const back = page.getByTestId("shared-screen-header").getByRole("button", { name: /Back|رجوع/, exact: true });
    if (scenario.width >= 900) await expect(back).toBeHidden();
    else await expect(back).toBeVisible();
  });
}
