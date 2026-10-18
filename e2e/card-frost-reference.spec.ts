import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const [language, width] of [
  ["ar", 390],
  ["en", 1440],
] as const) {
  test(`cards share the Home routine frost ${language} ${width} @cross-browser`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.clock.setFixedTime(new Date("2026-10-18T08:00:00+03:00"));
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
            reduceMotion: true,
          },
          profile: { isGuest: true },
        }),
      );
    }, language);
    await page.goto("/#/home");
    const reference = page.getByTestId("home-routine-card").locator(".home-glass-surface");
    await expect(reference).toBeVisible();
    const material = await reference.evaluate((node) => {
      const style = getComputedStyle(node);
      return { tint: style.backgroundColor, sheen: style.backgroundImage, frost: style.backdropFilter };
    });
    expect(material.tint).toBe("rgba(15, 23, 42, 0.24)");
    expect(material.frost).toBe("blur(22px) saturate(1.35)");

    for (const route of ["home", "azkar", "progress", "settings/appearance"]) {
      await page.goto("/#/" + route);
      const scene = page.getByTestId("time-of-day-scene-window").last().locator("img");
      await expect.poll(() => scene.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
      await expect(scene).toHaveCSS("opacity", "1");
      const cards =
        route === "home"
          ? page.locator(
              ".hero-glass.home-glass-surface:not(.home-glass-header):not(.home-glass-reading):not(.home-prayer-summary-card)",
            )
          : page.locator("[data-material-ui] [data-material-card]");
      await expect(cards.first()).toBeAttached();
      const surfaces = await cards.evaluateAll((nodes) =>
        nodes
          .filter(
            (node) =>
              node.checkVisibility() &&
              !node.parentElement?.closest("[data-material-card], .glass-reading, header") &&
              !node.matches(".glass-reading"),
          )
          .map((node) => {
            const style = getComputedStyle(node);
            return { tint: style.backgroundColor, sheen: style.backgroundImage, frost: style.backdropFilter };
          }),
      );
      expect(surfaces.length).toBeGreaterThan(0);
      for (const surface of surfaces) expect(surface).toEqual(material);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect((await new AxeBuilder({ page }).include(".app-main").analyze()).violations).toEqual([]);
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({
        path: `output/playwright/card-frost-reference/${testInfo.project.name}/${language}-${width}-${route.replaceAll("/", "-")}.png`,
        scale: "css",
      });
      if (route !== "home") {
        await page.locator("html").evaluate((root) => root.classList.add("high-contrast"));
        await expect(cards.first()).toHaveCSS("backdrop-filter", "none");
        await expect(cards.first()).toHaveCSS("background-color", /^rgb\(/);
        await page.locator("html").evaluate((root) => {
          root.classList.remove("high-contrast");
          root.setAttribute("data-app-material-resolved", "solid");
        });
        await expect(cards.first()).toHaveCSS("backdrop-filter", "none");
        await page.locator("html").evaluate((root) => root.setAttribute("data-app-material-resolved", "glass"));
        await expect(cards.first()).toHaveCSS("backdrop-filter", material.frost);
      }
    }
  });
}
