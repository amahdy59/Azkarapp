import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const [language, width] of [
  ["ar", 390],
  ["en", 1440],
] as const) {
  for (const appMaterial of ["solid", "glass"] as const) {
    test(`@cross-browser Home glass independent of App ${appMaterial} ${language}`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.clock.setFixedTime(new Date("2026-10-18T17:00:00+03:00"));
      await page.addInitScript(
        ({ language, appMaterial }) => {
          localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
          localStorage.setItem(
            "azkarapp.state.v1",
            JSON.stringify({
              settings: { language, appMaterial, homeMaterial: "glass", reduceTransparency: true, reduceMotion: true },
              profile: { isGuest: true },
            }),
          );
        },
        { language, appMaterial },
      );
      await page.goto("/#/home");
      const scene = page.getByTestId("time-of-day-scene-window").locator("img");
      await expect(scene).toHaveCSS("opacity", "1");
      const routine = page.getByTestId("home-routine-card").locator(".hero-glass");
      await expect(routine).toHaveCSS("background-color", "rgba(15, 23, 42, 0.24)");
      await expect(routine).toHaveCSS("backdrop-filter", "blur(22px) saturate(1.35)");
      const header = page.getByTestId("home-utility-header");
      const sticky = page.getByTestId("home-sticky-prayers");
      await expect(header).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await expect(header).toHaveCSS("backdrop-filter", "none");
      await expect(sticky).toHaveCSS("backdrop-filter", "none");
      await page.screenshot({ path: testInfo.outputPath(`home-${language}-${appMaterial}-rest.png`) });
      await page.locator(".home-content-scroll").evaluate((node) => {
        node.scrollTop = 220;
      });
      await expect(header).toHaveAttribute("data-scrolled", "true");
      // One shared strip owns the scrolled frost, including header and gutters.
      // Independent Home Glass must keep that frost even with App Solid and
      // reduced transparency, without stacking filters on its children.
      await expect(sticky).toHaveCSS("backdrop-filter", "blur(32px) saturate(1.35)");
      await expect(header).toHaveCSS("backdrop-filter", "none");
      const prayerCards = sticky.locator("article.hero-glass.home-glass-surface");
      await expect(prayerCards).toHaveCount(5);
      for (const card of await prayerCards.all()) await expect(card).toHaveCSS("backdrop-filter", "none");
      await expect(header).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await page.screenshot({ path: testInfo.outputPath(`home-${language}-${appMaterial}-scroll.png`) });
      await page.locator(".home-content-scroll").evaluate((node) => {
        node.scrollTop = 0;
      });
      await expect(header).not.toHaveAttribute("data-scrolled");
      await expect(header).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await expect(sticky).toHaveCSS("backdrop-filter", "none");
      for (const card of await prayerCards.all())
        await expect(card).toHaveCSS("backdrop-filter", "blur(22px) saturate(1.35)");
      expect(
        (await new AxeBuilder({ page }).include('[data-testid="home-routine-card"]').analyze()).violations,
      ).toEqual([]);
    });
  }
  test(`@cross-browser Reader text has no pointer highlight ${language}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language, appMaterial: "glass", reduceMotion: true },
          profile: { isGuest: true },
        }),
      );
    }, language);
    await page.goto("/#/azkar/fasting-ramadan/2");
    const text = page.locator("article.bg-transparent");
    await expect(text).toBeVisible();
    await expect(text.getByTestId("zikr-text")).not.toBeEmpty();
    await text.hover();
    await expect(text).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await page.screenshot({ path: testInfo.outputPath(`reader-${language}-no-highlight.png`) });
    await page.mouse.down();
    await expect(text).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await page.mouse.up();
  });
}
