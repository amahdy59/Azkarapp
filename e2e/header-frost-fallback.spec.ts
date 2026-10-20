import { expect, test } from "@playwright/test";

for (const [language, width] of [
  ["ar", 390],
  ["en", 1280],
] as const) {
  test(`Progress protects all header controls when frost is unavailable in ${language} @cross-browser`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 700 });
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language, appMaterial: "glass", themeMode: "midnight", reduceMotion: true },
          profile: { isGuest: true },
        }),
      );
    }, language);
    // Exercise the actual CSS fallback with positive frost feature queries
    // unavailable, retaining the chosen material and every ordinary rule.
    await page.route("**/assets/*.css", async (route) => {
      const response = await route.fetch();
      const body = (await response.text()).replace(
        /@supports\s*\(\s*backdrop-filter\s*:\s*blur\(1px\)\s*\)/g,
        "@supports (unknown-frost: unsupported)",
      );
      await route.fulfill({ response, body });
    });
    await page.goto("/#/progress");
    const controls = page.getByTestId("progress-sticky-controls");
    const viewport = page.locator(".progress-screen");
    await expect(controls).toBeVisible();
    await expect(controls).toHaveCSS("background-color", /^rgb\(/);
    await expect(controls).toHaveCSS("backdrop-filter", "none");
    const bounds = await controls.boundingBox();
    for (const top of [240, 96, 48, 12]) {
      await viewport.evaluate((node, top) => {
        node.scrollTop = top;
      }, top);
      await expect(controls).toHaveAttribute("data-scrolled", "true");
      await expect(controls).toHaveCSS("background-color", /^rgb\(/);
      expect(await controls.boundingBox()).toEqual(bounds);
    }
    await page.screenshot({
      path: testInfo.outputPath(`progress-${language}-frost-unavailable-scroll-up.png`),
      scale: "css",
    });
  });
}
