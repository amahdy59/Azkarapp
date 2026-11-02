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
    const panels = await page.evaluate(() => {
      const nodes = [
        document.querySelector('[data-testid="progress-heatmap"]')!,
        document.querySelector('[data-testid="progress-routine-bars"]')!,
      ];
      return nodes.map((node) => {
        const rect = node.getBoundingClientRect(),
          css = getComputedStyle(node);
        return {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          radius: css.borderTopLeftRadius,
          padding: css.paddingInlineStart,
          font: getComputedStyle(node.querySelector("h2")!).fontSize,
          overflow: node.scrollWidth > node.clientWidth + 1,
        };
      });
    });
    expect(panels[0]!.radius).toBe(panels[1]!.radius);
    expect(panels[0]!.padding).toBe(panels[1]!.padding);
    expect(panels[0]!.font).toBe(panels[1]!.font);
    expect(panels.every((panel) => !panel.overflow)).toBe(true);
    if (scenario.width === 1440) {
      expect(Math.abs(panels[0]!.y - panels[1]!.y)).toBeLessThanOrEqual(1);
      expect(panels[0]!.width + panels[1]!.width).toBeLessThan(1281);
      const aligned = await page.locator(".progress-rhythm-panel").evaluate((panel) => {
        const calendar = document.querySelector('[data-testid="progress-heatmap"]')!.getBoundingClientRect();
        const card = panel.getBoundingClientRect();
        const plot = panel.querySelector(".recorded-pages-chart")!.getBoundingClientRect();
        return {
          bottomGap: Math.abs(card.bottom - calendar.bottom),
          plotInset: card.bottom - plot.bottom,
          padding:
            parseFloat(getComputedStyle(panel).paddingBottom) + parseFloat(getComputedStyle(panel).borderBottomWidth),
          bars: [...panel.querySelectorAll(".recorded-pages-track")].map((track) => ({
            height: track.getBoundingClientRect().height,
            fill: track.firstElementChild!.getBoundingClientRect().height,
          })),
        };
      });
      expect(aligned.bottomGap).toBeLessThanOrEqual(1);
      expect(Math.abs(aligned.plotInset - aligned.padding)).toBeLessThanOrEqual(1);
      expect(aligned.bars).toHaveLength(7);
      expect(aligned.bars.filter((bar) => bar.fill > 1)).toHaveLength(1);
      expect(Math.max(...aligned.bars.map((bar) => bar.fill))).toBeGreaterThanOrEqual(aligned.bars[0]!.height - 3);
    } else expect(panels[1]!.y).toBeGreaterThan(panels[0]!.y);
    await calendar.scrollIntoViewIfNeeded();
    await page.screenshot({ path: info.outputPath("calendar-routines.png"), scale: "css" });
    expect((await new AxeBuilder({ page }).include('[data-testid="progress-dashboard"]').analyze()).violations).toEqual(
      [],
    );
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
