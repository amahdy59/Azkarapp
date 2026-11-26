import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  const later = page.getByRole("button", { name: /^(Later|لاحقاً)$/ });
  await page.addLocatorHandler(later, async () => later.click());
});

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
      const summary = page.getByTestId("home-prayer-interval");
      await expect(strip.locator("article")).toHaveCount(5);
      await expect(summary).toBeVisible();
      await expect(page.getByTestId("home-location")).toBeVisible();
      const originalCards = await strip.textContent();
      const scroll = sticky.locator("..");
      const toggle = page.getByTestId("home-prayer-disclosure");
      for (const position of [650, 350, 900]) {
        await scroll.evaluate((node, top) => {
          node.scrollTop = top;
        }, position);
        await expect.poll(() => scroll.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
        await expect(summary).toBeInViewport();
        await expect(sticky).toHaveAttribute("data-scrolled", "true");
        await expect(toggle).toHaveAttribute("aria-expanded", "true");
        await expect(strip).toHaveText(originalCards!);
        const geometry = await summary.evaluate((node) => {
          const box = node.getBoundingClientRect();
          const header = document.querySelector('[data-testid="home-utility-header"]')!.getBoundingClientRect();
          const sticky = node.closest('[data-testid="home-sticky-prayers"]')!;
          return {
            top: box.top,
            headerBottom: header.bottom,
            left: box.left,
            right: box.right,
            padding: parseFloat(getComputedStyle(sticky.parentElement!).scrollPaddingTop),
            height: sticky.getBoundingClientRect().height,
          };
        });
        expect(geometry.top).toBeGreaterThanOrEqual(geometry.headerBottom);
        expect(geometry.top - geometry.headerBottom).toBeLessThan(20);
        expect(geometry.left).toBeGreaterThanOrEqual(0);
        expect(geometry.right).toBeLessThanOrEqual(width);
        expect(geometry.padding).toBeGreaterThan(geometry.height);
      }
      expect(
        (await new AxeBuilder({ page }).include('[data-testid="home-sticky-prayers"]').analyze()).violations,
      ).toEqual([]);
      await page.screenshot({ path: testInfo.outputPath(`sticky-prayers-${language}-${width}.png`) });
      await toggle.focus();
      await toggle.press("Enter");
      await expect(toggle).toHaveAttribute("aria-expanded", "false");
      await toggle.press("Enter");
      await expect(toggle).toHaveAttribute("aria-expanded", "true");
      await page.locator("html").evaluate((node) => {
        node.style.fontSize = "200%";
      });
      await expect
        .poll(() =>
          sticky.evaluate((node) => {
            const scroll = node.parentElement!,
              height = node.getBoundingClientRect().height;
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
      await expect(strip.locator("article")).toHaveCount(5);
      await expect(page.getByTestId("home-location")).toBeVisible();
      await page.locator("html").evaluate((node) => {
        node.style.fontSize = "";
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
