import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const scenario of [
  { width: 390, height: 844, language: "ar", theme: "dark", owner: "wird" },
  { width: 834, height: 1112, language: "ar", theme: "light", owner: "wird" },
  { width: 1440, height: 900, language: "ar", theme: "dark", owner: "wird" },
  { width: 1920, height: 1080, language: "en", theme: "midnight", owner: "surah" },
  { width: 320, height: 800, language: "en", theme: "light", owner: "wird", enlarged: true },
] as const) {
  test(`approved Mushaf tools and centered reading ${scenario.owner}-${scenario.width}-${scenario.language} @cross-browser`, async ({
    page,
  }, info) => {
    await page.setViewportSize(scenario);
    await page.addInitScript((scenario) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: {
            language: scenario.language,
            themeMode: scenario.theme,
            mushafTheme: scenario.theme,
            mushafLayout: "spread",
            reduceMotion: true,
            appMaterial: "solid",
          },
          profile: { isGuest: true },
          khatmahPage: 42,
          mushafLayout: "spread",
          mushafTheme: scenario.theme,
        }),
      );
    }, scenario);
    await page.goto(scenario.owner === "surah" ? "/#/azkar/friday-kahf/1" : "/#/quran/42");
    if (scenario.owner === "surah") await page.getByTestId("reader-mushaf-button").click();
    const reader = page.locator(".mushaf-reader-viewer");
    const desktop = scenario.width >= 1024;
    await expect(reader.locator("[data-mushaf-column] > div")).toHaveCount(desktop ? 30 : 15);
    await page.evaluate(() => document.fonts.ready);
    if ("enlarged" in scenario) await page.locator("html").evaluate((node) => (node.style.fontSize = "200%"));
    await expect(reader).toHaveAttribute("data-desktop-chrome", String(desktop));
    if (scenario.width === 834) {
      const frame = await reader.locator(".mushaf-page-frame").evaluate((node) => {
        const style = getComputedStyle(node);
        return { padding: parseFloat(style.paddingBlockStart), radius: parseFloat(style.borderTopLeftRadius) };
      });
      expect(frame.padding).toBeGreaterThanOrEqual(28);
      expect(frame.radius).toBeGreaterThanOrEqual(20);
    }
    if (desktop) {
      const outward = await reader.getByTestId("mushaf-rail-back").evaluate((node) => {
        const path = node.querySelector("path")!;
        const tail = path.getPointAtLength(0).matrixTransform(path.getScreenCTM()!);
        const tip = path.getPointAtLength(path.getTotalLength() / 2).matrixTransform(path.getScreenCTM()!);
        return node.getBoundingClientRect().x > innerWidth / 2 && tip.x > tail.x;
      });
      expect(outward).toBe(true);
      await expect(reader.locator(".mushaf-page-furniture")).toHaveCount(0);
      const footer = page.getByTestId("mushaf-desktop-page-range");
      await expect(footer).not.toContainText(/604|٦٠٤/u);
      const footerCenter = await footer.evaluate((node) => {
        const capsule = node.getBoundingClientRect();
        const bar = node.closest(".mushaf-desktop-footer")!.getBoundingClientRect();
        return Math.abs((capsule.left + capsule.right - bar.left - bar.right) / 2);
      });
      expect(footerCenter).toBeLessThanOrEqual(1);
      await expect(reader.getByTestId("mushaf-tool-rail").getByTestId("mushaf-rail-index")).toHaveCount(0);
      const position = await reader.locator(".mushaf-paper").evaluate((paper) => {
        const r = paper.getBoundingClientRect();
        const pages = [...paper.querySelectorAll("[data-mushaf-page]")].map((node) => node.getBoundingClientRect());
        return {
          x: Math.abs(
            (Math.min(...pages.map((p) => p.left)) + Math.max(...pages.map((p) => p.right)) - r.left - r.right) / 2,
          ),
          y: Math.abs((pages[0].top + pages[0].bottom - r.top - r.bottom) / 2),
        };
      });
      expect(position.x).toBeLessThanOrEqual(2);
      expect(position.y).toBeLessThanOrEqual(2);
      await expect(reader.locator("kbd")).toHaveCount(2);
      await page.getByTestId("mushaf-desktop-juz").click();
      await expect(page.getByTestId("mushaf-index-modal")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.getByTestId("mushaf-desktop-juz")).toBeFocused();
    }
    const focus = desktop ? reader.locator('[data-tool="focus"]') : page.getByTestId("mushaf-focus-toggle");
    await expect(focus).toBeVisible();
    const bounds = (await focus.boundingBox())!;
    expect(bounds.width).toBeGreaterThanOrEqual(44);
    expect(bounds.height).toBeGreaterThanOrEqual(44);
    expect(await reader.evaluate((n) => n.scrollWidth - n.clientWidth)).toBeLessThanOrEqual(1);
    const chromePosition = () =>
      reader.evaluate((node) => {
        const outer = node.getBoundingClientRect();
        const top = node.querySelector(".mushaf-desktop-top, .mushaf-control-band--top")!.getBoundingClientRect();
        const bottom = node
          .querySelector(".mushaf-desktop-bottom, .mushaf-control-band--bottom")!
          .getBoundingClientRect();
        return [outer.top, outer.bottom, top.top, top.bottom, bottom.top, bottom.bottom];
      });
    await page.mouse.move(0, 0);
    const before = await chromePosition();
    await page.screenshot({ path: info.outputPath("reading.png") });
    const firstPage = reader.locator("[data-mushaf-page]").first();
    const currentPage = await firstPage.getAttribute("data-mushaf-page");
    await page.keyboard.press("ArrowLeft");
    await expect(firstPage).not.toHaveAttribute("data-mushaf-page", currentPage!);
    await expect.poll(chromePosition).toEqual(before);
    await page.screenshot({ path: info.outputPath("after-page-turn.png") });
    await focus.click();
    await expect(page.getByTestId("mushaf-focus-exit")).toBeFocused();
    await expect(page.getByTestId("mushaf-desktop-header")).toHaveCount(0);
    await page.screenshot({ path: info.outputPath("focus.png") });
    await page.getByTestId("mushaf-focus-exit").click();
    await expect(focus).toBeVisible();
    expect(
      (
        await new AxeBuilder({ page })
          .include(".mushaf-reader-viewer")
          .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  });
}
