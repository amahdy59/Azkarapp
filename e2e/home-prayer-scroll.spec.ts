import { assertPrayerOverview } from "./helpers/home-overview";
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
          const sticky = document.querySelector('[data-testid="home-sticky-prayers"]')!;
          return sticky.getAnimations({ subtree: true }).filter((animation) => animation.playState === "running")
            .length;
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
      const expanded = await assertPrayerOverview(page);
      const grid = page.getByTestId("home-context-grid");
      const documentTop = () =>
        grid.evaluate((node) => node.getBoundingClientRect().top + node.closest(".home-content-scroll")!.scrollTop);
      const contentBefore = await documentTop();
      const toggle = page.getByTestId("home-prayer-disclosure");
      for (const top of [150, 0, 180]) {
        await scroll.evaluate((node, top) => {
          node.scrollTop = top;
        }, top);
        await expect(toggle).toHaveAttribute("aria-expanded", "true");
        await expect.poll(documentTop).toBeCloseTo(contentBefore, 0);
        const cards = await assertPrayerOverview(page);
        expect(cards.map((cell) => [cell.width, cell.height])).toEqual(
          expanded.map((cell) => [cell.width, cell.height]),
        );
        await expect.poll(activeHandoffAnimations).toBe(0);
      }
      await expect(next.locator("progress")).toHaveCount(0);
      await page.screenshot({ path: testInfo.outputPath(`scrolled-${language}-${width}.png`) });
      await toggle.click();
      await expect(toggle).toHaveAttribute("aria-expanded", "false");
      await expect(page.locator("#home-prayer-timings")).toHaveAttribute("inert", "");
      await scroll.evaluate((node) => {
        node.scrollTop = 0;
      });
      await expect(toggle).toHaveAttribute("aria-expanded", "false");
      await toggle.click();
      await expect(toggle).toHaveAttribute("aria-expanded", "true");
      await assertPrayerOverview(page);
      const footer = page.getByTestId("home-visitor-footer");
      await expect(footer).toContainText(language === "ar" ? "١٢" : "12");
      const footerBefore = await footer.evaluate(
        (node) => node.getBoundingClientRect().bottom + node.closest(".home-content-scroll")!.scrollTop,
      );
      await footer.scrollIntoViewIfNeeded();
      await expect(footer).toBeInViewport();
      expect(
        await footer.evaluate(
          (node) => node.getBoundingClientRect().bottom + node.closest(".home-content-scroll")!.scrollTop,
        ),
      ).toBeCloseTo(footerBefore, 0);
      await expect(toggle).toHaveAttribute("aria-expanded", "true");
      expect(
        (await new AxeBuilder({ page }).include('[data-testid="home-sticky-prayers"]').analyze()).violations,
      ).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await toggle.focus();
      await expect(toggle).toBeFocused();
      await page.emulateMedia({ reducedMotion: "reduce" });
      await toggle.press("Enter");
      await expect(toggle).toHaveAttribute("aria-expanded", "false");
      await expect.poll(activeHandoffAnimations).toBe(0);
    });
  }
}
