import { expect, test } from "@playwright/test";

test("cached ayah cards and the reader translation remain available after an offline reload", async ({
  page,
  context,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("https://verses.quran.foundation/**", (route) => route.abort());
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({ settings: { language: "en", reduceMotion: true }, profile: { isGuest: true } }),
    );
    Object.defineProperty(navigator, "canShare", { configurable: true, value: () => false });
  });
  await page.goto("/#/quran/42");
  const openStudio = async () => {
    await page.getByRole("button", { name: "Open actions for ayah 255", exact: true }).click();
    await page.getByRole("button", { name: "Share ayah as an image", exact: true }).click();
    const studio = page.getByTestId("ayah-share-studio");
    await expect(studio.getByRole("checkbox", { name: "Include English translation" })).toBeEnabled();
    await studio.getByRole("checkbox", { name: "Include English translation" }).check();
    await expect(studio.getByRole("button", { name: "Save this card", exact: true })).toBeEnabled();
    return studio;
  };
  await openStudio();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await context.setOffline(true);
  try {
    await page.reload();
    const studio = await openStudio();
    await studio.locator("summary").click();
    await expect(studio.locator('div[lang="en"]')).toContainText("Allah - there is no deity except Him");
    await expect(studio.locator('div[lang="en"]')).toContainText("Saheeh International");
    const downloadPromise = page.waitForEvent("download");
    await studio.getByRole("button", { name: "Save this card", exact: true }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("ayah-2-255-portrait-1.png");
    await download.saveAs(testInfo.outputPath("offline-ayah-card.png"));
  } finally {
    await context.setOffline(false);
  }
});
