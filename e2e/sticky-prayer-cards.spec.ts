import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const language of ["ar", "en"] as const) {
  for (const width of [320, 1440]) {
    test(`prayer cards stay sticky ${language} ${width}px @cross-browser`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 800 });
      await page.clock.setFixedTime(new Date("2026-10-16T14:00:00+03:00"));
      await page.addInitScript((language) => {
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
      const strip = page.getByTestId("home-prayer-strip");
      const sticky = page.getByTestId("home-sticky-prayers");
      await expect(strip.locator("article")).toHaveCount(5);
      await expect(strip.locator("[data-prayer-footer]").first()).toBeVisible();
      const originalCards = await strip.textContent();
      const scroll = sticky.locator("..");
      // Down the page, then back up: the original row stays below its header.
      for (const position of [650, 350, 900]) {
        await scroll.evaluate((node, top) => {
          node.scrollTop = top;
        }, position);
        await expect.poll(() => scroll.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
        await expect(strip).toBeInViewport();
        await expect(sticky).toHaveAttribute("data-prayer-cards-condensed", "true");
        await expect(strip.locator("[data-prayer-footer]").first()).toBeHidden();
        await expect(strip.locator("[data-prayer-compact-countdown]")).toHaveCount(0);
        await expect(strip).toHaveText(originalCards!);
        const geometry = await strip.evaluate((node) => {
          const box = node.getBoundingClientRect();
          const header = document.querySelector('[data-testid="home-utility-header"]')!.getBoundingClientRect();
          const scroll = document.querySelector('[data-testid="home-sticky-prayers"]')!.parentElement!;
          return {
            top: box.top,
            headerBottom: header.bottom,
            left: box.left,
            right: box.right,
            padding: parseFloat(getComputedStyle(scroll).scrollPaddingTop),
            stickyHeight: document.querySelector('[data-testid="home-sticky-prayers"]')!.getBoundingClientRect().height,
          };
        });
        expect(geometry.top).toBeGreaterThanOrEqual(geometry.headerBottom);
        expect(geometry.top - geometry.headerBottom).toBeLessThan(20);
        expect(geometry.left).toBeGreaterThanOrEqual(0);
        expect(geometry.right).toBeLessThanOrEqual(width);
        expect(geometry.padding).toBeGreaterThan(geometry.stickyHeight);
      }
      expect(
        (await new AxeBuilder({ page }).include('[data-testid="home-prayer-strip"]').analyze()).violations,
      ).toEqual([]);
      await page.screenshot({ path: testInfo.outputPath(`sticky-prayers-${language}-${width}.png`) });
      // Existing card actions and native keyboard operation remain usable while pinned.
      const current = strip.locator('[data-prayer-state="current"] button');
      await current.focus();
      await page.keyboard.press("Enter");
      await expect(current).toHaveAttribute("aria-expanded", "true");
      await expect(strip).toBeInViewport();
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "200%";
      });
      await expect
        .poll(() =>
          sticky.evaluate((node) => {
            const scroll = node.parentElement!;
            const height = node.getBoundingClientRect().height;
            const fits = height + 44 < scroll.clientHeight;
            return fits
              ? getComputedStyle(node).position === "sticky" &&
                  parseFloat(getComputedStyle(scroll).scrollPaddingTop) > height
              : getComputedStyle(node).position === "relative" && getComputedStyle(scroll).scrollPaddingTop === "8px";
          }),
        )
        .toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await scroll.evaluate((node) => {
        node.scrollTop = 0;
      });
      await expect(strip).toBeInViewport();
      await expect(strip.locator("article")).toHaveCount(5);
      await expect(sticky).not.toHaveAttribute("data-prayer-cards-condensed", "true");
      await expect(strip.locator("[data-prayer-footer]").first()).toBeVisible();
      // Very short windows must allow the full cards to scroll away rather
      // than covering every reachable action below them.
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "";
      });
      await page.setViewportSize({ width: 643, height: 150 });
      await expect(sticky).toHaveCSS("position", "relative");
      await scroll.evaluate((node) => {
        node.scrollTop = node.scrollHeight;
      });
      await expect(strip).not.toBeInViewport();
    });
  }
}
