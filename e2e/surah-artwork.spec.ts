import { expect, test } from "@playwright/test";
import { getAzkarForMode } from "../src/app/content/azkar";

test.use({ serviceWorkers: "block" });

test("surah thumbnails load their hosted artwork and recover from an unavailable image @cross-browser", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({ settings: { language: "en", reduceMotion: true, routineMode: "complete" } }),
    );
  });
  for (const [id, artwork] of [
    ["friday-kahf", "al-kahf"],
    ["s-hm-110a", "as-sajdah"],
    ["s-hm-110b", "al-mulk"],
  ]) {
    const position = getAzkarForMode("before_sleep", "complete").findIndex((zikr) => zikr.id === id) + 1;
    await page.goto(id === "friday-kahf" ? "/#/azkar/friday-kahf/1" : `/#/azkar/before-sleep/${position}`);
    const image = page.getByTestId("surah-reading-actions").locator("img");
    await expect(image).toBeVisible();
    const title = page.getByTestId("reader-zikr-title");
    await expect(title).toHaveCount(1);
    const titleBounds = (await title.boundingBox())!;
    const artworkBounds = (await image.boundingBox())!;
    expect(titleBounds.y + titleBounds.height).toBeLessThanOrEqual(artworkBounds.y);
    expect(artworkBounds.height).toBeGreaterThanOrEqual(200);
    expect(artworkBounds.width / artworkBounds.height).toBeCloseTo(4 / 3, 1);
    await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.naturalWidth)).toBeGreaterThan(0);
    expect(await image.evaluate((node: HTMLImageElement) => node.currentSrc)).toContain(`/${artwork}-`);
    await page.screenshot({ path: info.outputPath(`${artwork}.png`) });
  }
  await page.route("**/visuals/surah/**", (route) => route.abort());
  await page.reload();
  const image = page.getByTestId("surah-reading-actions").locator("img");
  await expect(image).toHaveAttribute("src", /assets\/cards\/wird-quran-720.webp$/);
  await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.naturalWidth)).toBeGreaterThan(0);
});
