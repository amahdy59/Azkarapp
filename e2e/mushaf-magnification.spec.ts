import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const scenario of [
  { width: 390, height: 844, language: "ar" },
  { width: 1440, height: 900, language: "en" },
] as const) {
  test(`Mushaf magnification preserves content and native scrolling at ${scenario.width}px @cross-browser`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(scenario);
    await page.route("https://verses.quran.foundation/**", (route) => route.abort());
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language, reduceMotion: true, mushafLayout: "single" },
          profile: { isGuest: true },
        }),
      );
    }, scenario.language);
    await page.goto("/#/quran/42");
    const paper = page.locator(".mushaf-paper");
    const line = paper.locator("[data-mushaf-line-content]").first();
    await expect(line).toBeVisible();
    await page.evaluate(async () => {
      const line = document.querySelector<HTMLElement>("[data-mushaf-line-content]")!;
      const style = getComputedStyle(line);
      await document.fonts.load(`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`, line.textContent ?? "");
      await document.fonts.ready;
      // Font loading and ResizeObserver both schedule the line fitter. Wait
      // for its painted font size to settle before recording the reset baseline.
      await new Promise<void>((resolve) => {
        let previous = "";
        let unchanged = 0;
        const sample = () => {
          const size = getComputedStyle(line).fontSize;
          unchanged = size === previous ? unchanged + 1 : 0;
          previous = size;
          if (unchanged >= 12) resolve();
          else requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      });
    });
    const fontSize = () => line.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    const originalFont = await fontSize();
    const originalText = await paper.locator("[data-mushaf-column]").allTextContents();
    const openSettings = async () => {
      const direct = page.getByTestId("mushaf-settings-trigger");
      if (await direct.isVisible()) await direct.click();
      else {
        await page.locator('[data-testid="mushaf-more-actions"], [data-testid="mushaf-rail-more"]').click();
        await page.getByTestId("mushaf-quick-settings").click();
      }
    };
    for (const scale of [125, 150, 175, 200]) {
      await openSettings();
      const slider = page.getByRole("slider", {
        name: scenario.language === "ar" ? "تكبير الصفحة" : "Page magnification",
      });
      await slider.focus();
      await page.keyboard.press("Home");
      for (let step = 100; step < scale; step += 25) await page.keyboard.press("ArrowUp");
      await expect(slider).toHaveValue(String(scale));
      await page.keyboard.press("Escape");
      await expect(paper).toHaveAttribute("data-magnified", "true");
      const isMagnifiedScroll = await paper.evaluate((el) => ({
        horizontal: el.scrollWidth > el.clientWidth + 1,
        vertical: el.scrollHeight > el.clientHeight,
      }));
      expect(isMagnifiedScroll.horizontal).toBe(false);
      expect(isMagnifiedScroll.vertical).toBe(true);
      expect(await paper.locator("[data-mushaf-column]").allTextContents()).toEqual(originalText);
    }
    await expect(paper.locator("[data-mushaf-column] > div")).toHaveCount(15);
    await paper.focus();
    await page.keyboard.press("ArrowLeft");
    await expect(paper.locator("[data-mushaf-page]").first()).toHaveAttribute("data-mushaf-page", "42");
    const scroll = await paper.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
      const last = el.querySelector("[data-mushaf-column]")!.lastElementChild!.getBoundingClientRect();
      const view = el.getBoundingClientRect();
      return {
        horizontal: el.scrollWidth > el.clientWidth + 1,
        vertical: el.scrollHeight > el.clientHeight,
        lastReachable: last.bottom <= view.bottom + 1,
      };
    });
    expect(scroll).toEqual({ horizontal: false, vertical: true, lastReachable: true });
    await page.screenshot({ path: testInfo.outputPath(`mushaf-200-${scenario.width}.png`) });
    await openSettings();
    await page.getByRole("button", { name: scenario.language === "ar" ? "ملاءمة الصفحة" : "Fit page" }).click();
    await page.keyboard.press("Escape");
    await expect(paper).toHaveAttribute("data-magnified", "false");
    await expect.poll(fontSize).toBeLessThanOrEqual(originalFont * 1.1);
    await expect.poll(fontSize).toBeGreaterThan(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test(`Mushaf enlargement settings retain accessible reset at ${scenario.width}px @cross-browser`, async ({
    page,
  }) => {
    await page.setViewportSize(scenario);
    await page.route("https://verses.quran.foundation/**", (route) => route.abort());
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language, reduceMotion: true, mushafLayout: "single" },
          profile: { isGuest: true },
        }),
      );
    }, scenario.language);
    await page.goto("/#/quran/42");
    await expect(page.locator("[data-mushaf-line-content]").first()).toBeVisible();
    const direct = page.getByTestId("mushaf-settings-trigger");
    if (await direct.isVisible()) await direct.click();
    else {
      await page.locator('[data-testid="mushaf-more-actions"], [data-testid="mushaf-rail-more"]').click();
      await page.getByTestId("mushaf-quick-settings").click();
    }
    const slider = page.getByRole("slider", {
      name: scenario.language === "ar" ? "تكبير الصفحة" : "Page magnification",
    });
    await slider.focus();
    await page.keyboard.press("End");
    await expect(slider).toHaveValue("200");
    await page.getByRole("button", { name: scenario.language === "ar" ? "ملاءمة الصفحة" : "Fit page" }).click();
    await expect(slider).toHaveValue("100");
    const scan = await new AxeBuilder({ page }).include('[data-testid="mushaf-settings-sheet"]').analyze();
    expect(scan.violations).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(page.locator(".mushaf-paper")).toHaveAttribute("data-magnified", "false");
  });
}
