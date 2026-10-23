import { expect, test } from "@playwright/test";

test("Glass reuses the Home scene across interface routes @cross-browser", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.clock.setFixedTime(new Date("2026-10-17T14:00:00+03:00"));
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: {
          language: "en",
          themeMode: "midnight",
          appMaterial: "glass",
          homeMaterial: "glass",
          reduceMotion: true,
        },
        profile: { isGuest: true },
      }),
    );
  });
  await page.goto("/#/home");
  const scene = await page.getByTestId("time-of-day-scene-window").locator("img").getAttribute("src");
  expect(scene).toBeTruthy();
  for (const route of ["azkar", "progress", "settings", "quran-wird", "qibla", "counter", "more", "benefits"]) {
    await page.goto("/#/" + route);
    await expect(page.getByTestId("app-scene").locator("img")).toHaveAttribute("src", scene!);
    await expect(page.locator("[data-material-ui]")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath("shared-scene-" + route + ".png"), scale: "css" });
  }
});
