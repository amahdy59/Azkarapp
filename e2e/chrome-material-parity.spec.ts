import { mkdir } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const language of ["ar", "en"] as const) {
  test(`@cross-browser shared navigation and header frost ${language}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language, appMaterial: "glass", homeMaterial: "glass", reduceMotion: true },
          profile: { isGuest: true },
        }),
      );
    }, language);
    const sidebar = page.locator(".app-sidebar");
    const material = () =>
      sidebar.evaluate((node) => {
        const style = getComputedStyle(node);
        return [style.backgroundColor, style.backgroundImage, style.backdropFilter];
      });
    for (const route of ["home", "azkar", "progress", "quran-wird"]) {
      await page.goto("/#/" + route);
      const header =
        route === "home"
          ? page.getByTestId("home-utility-header")
          : route === "progress"
            ? page.getByTestId("progress-sticky-controls")
            : route === "azkar"
              ? page.locator("[data-material-ui] header").first()
              : page.getByTestId("shared-screen-header").first();
      await expect(header).toBeVisible();
      await expect(page.getByTestId("app-scene").locator("img")).toBeVisible();
      await expect
        .poll(() =>
          header.evaluate((node) => {
            const style = getComputedStyle(node);
            return [style.backgroundColor, style.backgroundImage, style.backdropFilter];
          }),
        )
        .toEqual(await material());
      await expect(sidebar).toHaveCSS("backdrop-filter", "blur(32px) saturate(1.35)");
      if (route === "home") {
        await expect(page.getByTestId("navigation-scene-window")).toBeVisible();
        await expect(page.getByTestId("time-of-day-scene-window")).toHaveCount(1);
      }
      await mkdir(`output/playwright/chrome-parity/${testInfo.project.name}`, { recursive: true });
      await page.screenshot({
        path: `output/playwright/chrome-parity/${testInfo.project.name}/${language}-${route}.png`,
      });
    }
    expect((await new AxeBuilder({ page }).include(".app-sidebar").analyze()).violations).toEqual([]);
  });
}
