import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
for (const language of ["ar", "en"] as const) {
  for (const outcome of ["shared", "cancelled", "error", "download"] as const) {
    test(`Home approved cards quick share ${language}/${outcome}`, async ({ page }) => {
      await page.clock.setFixedTime(new Date("2026-10-14T17:00:00+03:00"));
      await page.addInitScript(
        ({ language, outcome }) => {
          localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
          localStorage.setItem(
            "azkarapp.state.v1",
            JSON.stringify({ settings: { language, reduceMotion: true }, profile: { isGuest: true } }),
          );
          Object.defineProperty(navigator, "canShare", { configurable: true, value: () => outcome !== "download" });
          Object.defineProperty(navigator, "share", {
            configurable: true,
            value: async (data: ShareData) => {
              Object.assign(window, {
                __sharedFiles: data.files?.map((file) => ({ name: file.name, type: file.type, size: file.size })),
              });
              if (outcome === "cancelled") throw new DOMException("Cancelled", "AbortError");
              if (outcome === "error") throw new DOMException("Failed", "NotAllowedError");
            },
          });
        },
        { language, outcome },
      );
      await page.setViewportSize({ width: 390, height: 900 });
      await page.goto("/#/home");
      const button = page.getByTestId("home-quick-share");
      await expect(button).toBeVisible();
      const downloads: string[] = [];
      page.on("download", (file) => downloads.push(file.suggestedFilename()));
      const download = outcome === "download" ? page.waitForEvent("download") : null;
      await button.click();
      await expect(button).toBeEnabled();
      await expect(page.getByRole("dialog")).toHaveCount(0);
      if (download) {
        expect((await download).suggestedFilename()).toBe("azkar-cards.zip");
      } else {
        await expect
          .poll(() => page.evaluate(() => (window as unknown as { __sharedFiles?: unknown[] }).__sharedFiles?.length))
          .toBe(2);
        expect(downloads).toEqual([]);
        const files = await page.evaluate(
          () => (window as unknown as { __sharedFiles: { size: number; name: string }[] }).__sharedFiles,
        );
        expect(files.every((file) => file.size > 0 && file.name.endsWith(".webp"))).toBe(true);
        if (outcome === "error") await expect(page.getByRole("alert")).toBeVisible();
      }
      expect(
        (await new AxeBuilder({ page }).include('[data-testid="home-routine-card"]').analyze()).violations,
      ).toEqual([]);
    });
  }
}
for (const preference of ["no-preference", "reduce"] as const) {
  test(`photo cards remain visible with ${preference} transparency`, async ({ page }, testInfo) => {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-transparency", value: preference }],
    });
    await page.addInitScript(() => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language: "ar", homeWirdImages: true, themeMode: "midnight", reduceMotion: true },
          profile: { isGuest: true },
        }),
      );
    });
    await page.goto("/#/home");
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.getByTestId("today-garden-card").scrollIntoViewIfNeeded();
      for (const tile of await page.getByTestId("wird-category-card").all()) {
        const image = tile.locator("img");
        await image.evaluate((node: HTMLImageElement) => node.decode());
        expect(await image.evaluate((node: HTMLImageElement) => node.currentSrc.endsWith(".avif"))).toBe(true);
        const band = await tile.evaluate((node) => {
          const card = node.getBoundingClientRect(),
            caption = node.querySelector(".home-wird-caption")!.getBoundingClientRect();
          return { height: card.height, captionHeight: caption.height, top: caption.top - card.top };
        });
        expect(Math.abs(band.height - band.captionHeight)).toBeLessThanOrEqual(2);
        expect(band.top).toBeLessThanOrEqual(2);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(
        (await new AxeBuilder({ page }).include('[data-testid="today-garden-card"]').analyze()).violations,
      ).toEqual([]);
      await page.screenshot({ path: testInfo.outputPath(`photos-${preference}-${width}.png`), scale: "css" });
    }
  });
}
