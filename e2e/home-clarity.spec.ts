import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { t } from "../src/app/i18n";

for (const language of ["ar", "en"] as const) {
  for (const width of [320, 390, 900, 1920]) {
    test(`@cross-browser ${language} clear Home and independent appearance at ${width}px`, async ({
      page,
    }, testInfo) => {
      await page.clock.setFixedTime(new Date("2026-10-14T14:00:00+03:00"));
      await page.setViewportSize({ width, height: width === 320 ? 568 : 1000 });
      await page.addInitScript((language) => {
        if (localStorage.getItem("azkarapp.state.v1")) return;
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: { language, themeMode: "midnight", reduceMotion: true },
            profile: { isGuest: true },
          }),
        );
      }, language);
      await page.goto("/#/home");
      const header = page.getByTestId("home-utility-header");
      const frame = await header.evaluate((element) => {
        const outer = element.getBoundingClientRect();
        const canvas = element.closest('[role="region"]')!.getBoundingClientRect();
        const inner = element.querySelector('[data-testid="home-header-content"]')!.getBoundingClientRect();
        const grid = document.querySelector('[data-testid="home-content-grid"]')!.getBoundingClientRect();
        return {
          outerLeft: outer.left,
          outerRight: outer.right,
          canvasLeft: canvas.left,
          canvasRight: canvas.right,
          innerLeft: inner.left,
          innerRight: inner.right,
          gridLeft: grid.left,
          gridRight: grid.right,
        };
      });
      expect(Math.abs(frame.outerLeft - frame.canvasLeft)).toBeLessThanOrEqual(1);
      expect(Math.abs(frame.outerRight - frame.canvasRight)).toBeLessThanOrEqual(1);
      expect(Math.abs(frame.innerLeft - frame.gridLeft)).toBeLessThanOrEqual(1);
      expect(Math.abs(frame.innerRight - frame.gridRight)).toBeLessThanOrEqual(1);
      const strip = page.getByTestId("home-prayer-strip");
      await expect(strip.locator('[data-density="summary"]')).toHaveCount(2);
      await expect(page.getByTestId("prayer-card-dhuhr")).toHaveAttribute("data-prayer-state", "current");
      await expect(page.getByTestId("prayer-card-asr")).toHaveAttribute("data-prayer-state", "next");
      await strip.getByRole("button", { name: t(language, "settings.showAllPrayers") }).click();
      await expect(strip.locator('[data-density="summary"]')).toHaveCount(5);
      await strip.getByRole("button", { name: t(language, "settings.showFocusedPrayers") }).click();
      await expect(strip.locator('[data-density="summary"]')).toHaveCount(2);
      const path = page.getByTestId("home-header-routine-summary");
      if (width >= 900) await expect(path).toBeVisible();
      else await expect(path).toBeHidden();
      const cards = page.getByTestId("wird-category-card");
      await expect(cards).toHaveCount(4);
      await expect(cards.locator("img")).toHaveCount(0);
      await expect(page.getByTestId("daily-evidence-hadith")).toBeVisible();
      await expect(page.getByTestId("open-wird-benefits")).toBeVisible();
      await expect(page.getByTestId("situational-shortcuts").locator("a svg")).toHaveCount(3);
      await page.goto("/#/settings/appearance");
      const images = page.getByRole("switch", { name: new RegExp(t(language, "settings.homeWirdImages")) });
      const transparency = page.getByRole("switch", {
        name: new RegExp("^" + t(language, "settings.homeTransparency")),
      });
      await expect(images).toHaveAttribute("aria-checked", "false");
      await expect(transparency).toHaveAttribute("aria-checked", "true");
      await images.click();
      await expect(transparency).toHaveAttribute("aria-checked", "true");
      await page.goto("/#/home");
      await expect(cards.locator("img")).toHaveCount(4);
      const caption = cards.first().locator(".home-wird-caption");
      const material = await caption.evaluate((node) => ({
        filter: getComputedStyle(node).backdropFilter,
        reduced: matchMedia("(prefers-reduced-transparency: reduce)").matches,
      }));
      expect(material.filter).toEqual(material.reduced ? "none" : expect.stringContaining("blur"));
      await page.goto("/#/settings/appearance");
      await transparency.click();
      await expect(images).toHaveAttribute("aria-checked", "true");
      await page.goto("/#/home");
      await page.reload();
      await expect(cards.locator("img")).toHaveCount(4);
      expect(await caption.evaluate((node) => getComputedStyle(node).backdropFilter)).toBe("none");
      await page.goto("/#/settings/appearance");
      await images.click();
      await page.goto("/#/home");
      await expect(cards.locator("img")).toHaveCount(0);
      if (width === 320)
        await page.locator("html").evaluate((node) => {
          node.style.fontSize = "32px";
        });
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth))
        .toBeLessThanOrEqual(0);
      expect(await cards.evaluateAll((nodes) => nodes.every((node) => node.scrollWidth <= node.clientWidth + 1))).toBe(
        true,
      );
      await cards.first().focus();
      await expect(cards.first()).toBeFocused();
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
      await page.screenshot({ path: testInfo.outputPath(`${language}-home-clear-${width}.png`) });
    });
  }
}
