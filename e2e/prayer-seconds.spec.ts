import { assertPrayerOverview } from "./helpers/home-overview";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const seed = Date.parse("2026-10-20T14:00:00+03:00");
for (const language of ["ar", "en"] as const) {
  for (const width of [320, 390, 768, 1440]) {
    test(`prayer countdown stays readable and updates by the minute ${language} ${width} @cross-browser`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.clock.install({ time: new Date(seed) });
      await page.addInitScript(
        ({ language }) => {
          localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
          localStorage.setItem(
            "azkarapp.state.v1",
            JSON.stringify({
              settings: { language, themeMode: "midnight", homeMaterial: "glass", reduceMotion: false },
              profile: { isGuest: true },
            }),
          );
        },
        { language },
      );
      await page.goto("/#/home");
      await page.evaluate(() => document.fonts.ready);
      const card = page.locator('[data-density="summary"][data-prayer-state="next"]');
      const countdown = page.locator("#home-prayer-countdown");
      const wording = language === "ar" ? /متبقٍ.*[٠-٩]+\sد/u : /\d+m remaining/u;
      await expect(countdown).toHaveCSS("font-size", "12px");
      await expect(countdown).toHaveText(wording);
      const fits = (node: HTMLElement) => {
        // Firefox exposes scrollWidth but no clientWidth on inline text.
        // Measure the actual text fragments against their owning line instead.
        const bounds = (node.closest("[data-prayer-countdown-line]") ?? node).getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(node);
        const fragments = [...range.getClientRects()].filter((rect) => rect.width > 0);
        return (
          fragments.length > 0 &&
          fragments.every((rect) => rect.left >= bounds.left - 1 && rect.right <= bounds.right + 1)
        );
      };
      await expect.poll(() => countdown.evaluate(fits)).toBe(true);
      await expect(card.locator(".prayer-countdown-seconds, .prayer-countdown-ring")).toHaveCount(0);
      const before = (await countdown.textContent())!;
      await page.clock.fastForward(2000);
      await expect(countdown).toHaveText(before);
      await page.clock.fastForward(60_000);
      await expect(countdown).not.toHaveText(before);
      await expect(countdown).toHaveText(wording);
      await expect(card.locator("[aria-live], [role=timer], [role=progressbar]")).toHaveCount(0);
      await expect(card.locator("button")).toHaveAccessibleDescription(wording);
      const assertFit = async () => {
        await assertPrayerOverview(page);
        const summary = page.getByTestId("home-prayer-interval");
        expect(await summary.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
      };
      await assertFit();
      await page.screenshot({ path: testInfo.outputPath(`countdown-${language}-${width}.png`), scale: "css" });
      await page.locator("html").evaluate((node) => {
        node.style.fontSize = "200%";
      });
      await assertFit();
      await expect.poll(() => countdown.evaluate(fits)).toBe(true);
      await page.locator("html").evaluate((node) => {
        node.style.fontSize = "";
      });
      const sticky = page.getByTestId("home-sticky-prayers");
      await sticky.locator("..").evaluate((node) => {
        node.scrollTop = 180;
      });
      await expect(sticky).toHaveAttribute("data-prayer-cards-condensed", "true");
      if (width < 768) {
        const compact = page.getByTestId("home-compact-prayer");
        await expect(compact).toBeInViewport();
        await expect(compact).toContainText(wording);
        await expect(compact.locator(".prayer-countdown-seconds, .prayer-countdown-ring")).toHaveCount(0);
      } else {
        const compact = page.getByTestId("home-prayer-interval");
        await expect(compact).toBeVisible();
        await expect(compact).toContainText(wording);
        await expect(compact.locator(".prayer-countdown-seconds, .prayer-countdown-ring")).toHaveCount(0);
        await assertFit();
      }
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "200%";
      });
      await page.evaluate(() => document.fonts.ready);
      if (width >= 768) await assertFit();
      const activeCountdown =
        width < 768 ? page.getByTestId("home-compact-prayer").locator("[data-prayer-countdown-line]") : countdown;
      await expect.poll(() => activeCountdown.evaluate(fits)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({
        path: testInfo.outputPath(`countdown-enlarged-condensed-${language}-${width}.png`),
        scale: "css",
      });
      expect(
        (await new AxeBuilder({ page }).include('[data-testid="home-prayer-strip"]').analyze()).violations,
      ).toEqual([]);
    });
  }
}

for (const source of ["app", "os"] as const) {
  test(`prayer minute updates respect ${source} reduced motion @cross-browser`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: source === "os" ? "reduce" : "no-preference" });
    await page.clock.install({ time: new Date(seed) });
    await page.addInitScript(
      ({ source }) => {
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({ settings: { language: "en", reduceMotion: source === "app" }, profile: { isGuest: true } }),
        );
      },
      { source },
    );
    await page.goto("/#/home");
    const footer = page.getByTestId("home-prayer-interval");
    await expect(footer.locator(".prayer-countdown-arc, .prayer-countdown-seconds")).toHaveCount(0);
    const countdown = page.locator("#home-prayer-countdown");
    const before = (await countdown.textContent())!;
    await page.clock.fastForward(60_000);
    await expect(countdown).not.toHaveText(before);
  });
}
