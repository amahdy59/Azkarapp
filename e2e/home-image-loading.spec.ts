import { expect, test } from "@playwright/test";

test("a stalled Home image falls back after 15 seconds and a new scene can recover @cross-browser", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-10-16T09:00:00+03:00") });
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "ar", themeMode: "light", reduceTransparency: false, homeWirdImages: true },
        profile: { isGuest: true },
      }),
    );
  });
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/assets/backgrounds/friday-morning/**", async (route) => {
    await pending;
    await route.abort();
  });
  await page.goto("/#/home", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("time-of-day-scene-window")).toBeVisible();
  await page.clock.fastForward(15_001);
  await expect(page.getByTestId("time-of-day-scene-window")).toHaveCount(0);
  await expect(page.locator(".home-wird-photo-caption").first()).toHaveCSS("background-image", /linear-gradient/);
  release();
  await page.clock.setFixedTime(new Date("2026-10-16T14:00:00+03:00"));
  await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
  await expect(page.getByTestId("time-of-day-scene-window").locator("img")).toHaveCSS("opacity", "1");
});

test("failed Home photo uses opaque themed cards without changing the saved preference @cross-browser", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "ar", themeMode: "light", reduceTransparency: false },
        profile: { isGuest: true },
      }),
    );
  });
  await page.route("**/assets/backgrounds/**", (route) => route.abort());
  await page.goto("/#/home");
  await expect(page.getByTestId("time-of-day-scene-window")).toHaveCount(0);
  await expect(page.locator(".home-photo-canvas .hero-glass")).toHaveCount(0);
  await expect(page.getByTestId("wird-category-card").first()).toHaveClass(/bg-card/);
  await expect(page.getByTestId("home-utility-header")).toBeVisible();
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1")!).settings.reduceTransparency),
  ).toBe(false);
});

test("Home keeps a stable placeholder until its photo is decoded @cross-browser", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({ settings: { language: "ar", reduceMotion: true }, profile: { isGuest: true } }),
    );
  });
  let releasePhoto!: () => void;
  const delayed = new Promise<void>((resolve) => {
    releasePhoto = resolve;
  });
  await page.route("**/assets/backgrounds/**", async (route) => {
    if (!route.request().url().includes("placeholder")) await delayed;
    await route.continue();
  });
  await page.goto("/#/home", { waitUntil: "domcontentloaded" });
  const photo = page.getByTestId("time-of-day-scene-window").locator("img");
  await expect(photo).toHaveCSS("opacity", "0");
  await expect(page.getByTestId("home-utility-header")).toBeVisible();
  await page.screenshot({ path: "output/playwright/home-image-loading-pending.png" });
  releasePhoto();
  await expect(photo).toHaveCSS("opacity", "1");
  expect(await photo.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  await page.screenshot({ path: "output/playwright/home-image-loading-decoded.png" });
});
