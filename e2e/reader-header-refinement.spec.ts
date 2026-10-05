import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const language of ["ar", "en"] as const) {
  test(`header refinement preserves borderless mobile, reading alignment and geometry in ${language} @cross-browser`, async ({
    page,
    browserName,
  }, testInfo) => {
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language, themeMode: language === "ar" ? "midnight" : "light", reduceMotion: true },
          profile: { isGuest: true },
        }),
      );
    }, language);
    if (browserName === "chromium") {
      const cdp = await page.context().newCDPSession(page);
      await cdp.send("Emulation.setEmulatedMedia", {
        features: [{ name: "prefers-reduced-transparency", value: "no-preference" }],
      });
    }
    await page.goto("/#/azkar/before-sleep/1");
    for (const width of [320, 390, 820, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const selector = width < 768 ? '[data-testid="shared-screen-header"]' : '[data-testid="reader-desktop-hero"]';
      const header = page.locator(selector);
      await expect(header).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const bounds = (await header.boundingBox())!;
      // Existing compact padding/border and wide toolbar/title/progress geometry.
      // Preserve the fractional CSS height rather than its rounded screenshot value.
      expect(bounds.height).toBeCloseTo(width < 768 ? 57 : 165.5, 1);
      const buttons = header.getByRole("button");
      const styles = await buttons.evaluateAll((elements) =>
        elements.map((element) => {
          const style = getComputedStyle(element);
          const bounds = element.getBoundingClientRect();
          return {
            width: bounds.width,
            height: bounds.height,
            radius: style.borderRadius,
            border: parseFloat(style.borderTopWidth),
            color: style.color,
          };
        }),
      );
      for (const style of styles) {
        expect(style.width).toBeGreaterThanOrEqual(44);
        expect(style.height).toBeGreaterThanOrEqual(44);
        expect(style.radius).toBe(styles[0]!.radius);
        expect(style.color).toBe(styles[0]!.color);
        if (width < 768) expect(style.border).toBe(0);
      }
      const tools = page.getByTestId("reader-entry-tools");
      await expect(tools).toBeVisible();
      await expect(header.getByRole("switch")).toHaveCount(0);
      if (width >= 768) {
        const toolBounds = (await tools.boundingBox())!;
        const readingBounds = (await page.getByTestId("reader-card").locator(".reading-measure").boundingBox())!;
        expect(Math.abs(toolBounds.x - readingBounds.x)).toBeLessThanOrEqual(8);
        expect(Math.abs(toolBounds.width - readingBounds.width)).toBeLessThanOrEqual(16);
        expect(toolBounds.y).toBeGreaterThanOrEqual(bounds.y + bounds.height);
        const sky = page.locator(".reader-scene__skyline");
        expect((await sky.boundingBox())!.width).toBeLessThanOrEqual(bounds.width * 0.24 + 1);
        const moon = (await page.locator(".reader-scene__celestial").boundingBox())!;
        const progress = (await header.getByRole("progressbar").boundingBox())!;
        expect(moon.y + moon.height).toBeLessThan(progress.y);
      }
      const menu = header.getByRole("button", { name: language === "ar" ? "خيارات القارئ" : "Reader options" });
      await menu.focus();
      await menu.press("Enter");
      await expect(page.getByRole("menu")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(menu).toBeFocused();
      expect(
        (await new AxeBuilder({ page }).include(selector).include('[data-testid="reader-entry-tools"]').analyze())
          .violations,
      ).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({
        path: `output/playwright/reader-header-refinement/${testInfo.project.name}/${language}-${width}.png`,
      });
    }
  });
}
