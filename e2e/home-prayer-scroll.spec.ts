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
            settings: {
              language,
              themeMode: "midnight",
              appMaterial: "glass",
              homeMaterial: "glass",
              reduceMotion: false,
            },
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
      const label = next.locator("h3");
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
      const assertInsets = async () => {
        for (const card of await sticky.locator('[data-density="summary"]').all()) {
          const bounds = await card.boundingBox();
          const heading = await card.locator("h3").boundingBox();
          const time = await card.locator("[data-prayer-timing] p").boundingBox();
          const icon = await card.locator("[data-prayer-icon]").boundingBox();
          expect(icon!.x - bounds!.x).toBeGreaterThanOrEqual(11);
          expect(bounds!.x + bounds!.width - heading!.x - heading!.width).toBeGreaterThanOrEqual(11);
          expect(heading!.y - bounds!.y).toBeGreaterThanOrEqual(7);
          expect(bounds!.y + bounds!.height - time!.y - time!.height).toBeGreaterThanOrEqual(8);
        }
      };
      await assertInsets();
      const expandedHeight = (await next.boundingBox())!.height;
      const originalTime = await next.locator("[data-prayer-timing] p").boundingBox();
      const grid = page.getByTestId("home-content-grid");
      await scroll.evaluate((element) => (element.scrollTop = 96));
      const contentBefore = (await grid.boundingBox())!.y + 96;
      await page.screenshot({ path: testInfo.outputPath(`expanded-${language}-${width}.png`), scale: "css" });
      const horizontal = await page.getByTestId("home-all-prayers-row").evaluate((node) => node.scrollLeft);
      await scroll.evaluate((element) => (element.scrollTop = 150));
      await expect(sticky).toHaveAttribute("data-prayer-cards-condensed", "true");
      await expect.poll(activeHandoffAnimations).toBe(0);
      expect(await page.getByTestId("home-all-prayers-row").evaluate((node) => node.scrollLeft)).toBe(horizontal);
      await assertInsets();
      const compact = (await label.boundingBox())!;
      // The owner now explicitly wants smaller icon/padding geometry. Keep
      // the title's reading edge and type stable through that deliberate shift.
      expect(compact.x + compact.width).toBeCloseTo(original.x + original.width, 0);
      expect(compact.height).toBeCloseTo(original.height, 0);
      await expect(label).toHaveCSS("font-size", "14px");
      expect((await next.boundingBox())!.height).toBeLessThan(expandedHeight);
      await expect(next.locator("[data-prayer-compact-countdown]")).toHaveCSS("opacity", "1");
      expect((await next.locator("[data-prayer-timing] p").boundingBox())!.height).toBeCloseTo(originalTime!.height, 0);
      expect((await grid.boundingBox())!.y + (await scroll.evaluate((node) => node.scrollTop))).toBeCloseTo(
        contentBefore,
        0,
      );
      const stableTop = await scroll.evaluate((node) => node.scrollTop);
      await page.waitForTimeout(100);
      expect(await scroll.evaluate((node) => node.scrollTop)).toBe(stableTop);
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
      await expect(next.locator("progress")).toHaveCount(0);
      await expect(next.locator("[data-prayer-compact-countdown]")).toHaveCSS("opacity", "0");
      const footer = page.getByTestId("home-visitor-footer");
      await footer.scrollIntoViewIfNeeded();
      await expect(footer).toBeInViewport();
      await expect(footer).toContainText(language === "ar" ? "١٢" : "12");
      expect(
        (await new AxeBuilder({ page }).include('[data-testid="home-sticky-prayers"]').analyze()).violations,
      ).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const currentButton = sticky.locator('[data-prayer-state="current"] button');
      await currentButton.focus();
      await scroll.evaluate((node) => (node.scrollTop = 0));
      await expect(sticky).toHaveAttribute("data-prayer-cards-condensed", "true");
      await currentButton.evaluate((node) => (node as HTMLElement).blur());
      await expect(sticky).not.toHaveAttribute("data-prayer-cards-condensed");
    });
  }
}
