import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  const later = page.getByRole("button", { name: /^(Later|لاحقاً)$/ });
  await page.addLocatorHandler(later, async () => later.click());
});

for (const language of ["ar", "en"] as const) {
  for (const width of [390, 1440]) {
    test(`stable prayer badge and scroll handoff ${language} ${width} @cross-browser`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.clock.setFixedTime(new Date("2026-10-16T13:40:00+03:00"));
      await page.route("**/v1/visitors", (route) => route.fulfill({ json: { active: 12 } }));
      await page.addInitScript((language) => {
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: { language, themeMode: "midnight", reduceMotion: false },
            profile: { isGuest: true },
          }),
        );
      }, language);
      await page.goto("/#/home");
      const sticky = page.getByTestId("home-sticky-prayers");
      const scroll = sticky.locator("..");
      const activeHandoffAnimations = () =>
        page.evaluate(() => {
          const elements = document.querySelectorAll(
            '[data-testid="home-sticky-prayers"], [data-density="summary"], [data-prayer-compact-countdown], [data-prayer-footer]',
          );
          return [...elements].flatMap((element) => element.getAnimations()).length;
        });
      const next = page.locator('[data-density="summary"][data-prayer-state="next"]');
      const label = next.locator("[data-prayer-state-label]");
      await expect(label).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await expect
        .poll(() =>
          sticky.evaluate(
            (node) =>
              node.getAnimations({ subtree: true }).filter((animation) => animation.playState === "running").length,
          ),
        )
        .toBe(0);
      const original = (await label.boundingBox())!;
      const expandedHeight = (await next.boundingBox())!.height;
      await page.screenshot({ path: testInfo.outputPath(`expanded-${language}-${width}.png`), scale: "css" });
      await scroll.evaluate((element) => (element.scrollTop = 150));
      await expect(sticky).toHaveAttribute("data-prayer-cards-condensed", "true");
      await expect.poll(activeHandoffAnimations).toBe(0);
      const compact = (await label.boundingBox())!;
      for (const key of ["x", "y", "width", "height"] as const) expect(compact[key]).toBeCloseTo(original[key], 0);
      expect((await next.boundingBox())!.height).toBeLessThan(expandedHeight);
      await expect(next.locator("[data-prayer-compact-countdown]")).toBeVisible();
      await expect(next.locator("progress")).not.toBeVisible();
      await expect.poll(activeHandoffAnimations).toBe(0);
      await page.screenshot({ path: testInfo.outputPath(`compact-${language}-${width}.png`), scale: "css" });
      // Reverse repeatedly without waiting for the previous animation. The latest state wins.
      await scroll.evaluate((element) => (element.scrollTop = 0));
      await expect(sticky).not.toHaveAttribute("data-prayer-cards-condensed");
      await scroll.evaluate((element) => (element.scrollTop = 150));
      await expect(sticky).toHaveAttribute("data-prayer-cards-condensed", "true");
      await page.emulateMedia({ reducedMotion: "reduce" });
      await expect.poll(activeHandoffAnimations).toBe(0);
      await scroll.evaluate((element) => (element.scrollTop = 0));
      await expect(sticky).not.toHaveAttribute("data-prayer-cards-condensed");
      await expect(next.locator("progress")).toBeVisible();
      await expect(next.locator("[data-prayer-compact-countdown]")).not.toBeVisible();
      const footer = page.getByTestId("home-visitor-footer");
      await footer.scrollIntoViewIfNeeded();
      await expect(footer).toBeInViewport();
      await expect(footer).toContainText(language === "ar" ? "١٢" : "12");
      expect(
        (await new AxeBuilder({ page }).include('[data-testid="home-sticky-prayers"]').analyze()).violations,
      ).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
}
