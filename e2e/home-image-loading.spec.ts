import { expect, test } from "@playwright/test";

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
