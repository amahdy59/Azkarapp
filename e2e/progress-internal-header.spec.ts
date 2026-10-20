import { expect, test } from "@playwright/test";

for (const language of ["ar", "en"] as const) {
  test(`Progress title protects internally scrolling controls in ${language} @cross-browser`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 320, height: 480 });
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
    await page.goto("/#/progress");
    const controls = page.getByTestId("progress-sticky-controls");
    const header = controls.getByTestId("shared-screen-header");
    await expect(header).toBeVisible();
    await page.locator("html").evaluate((node) => (node.style.fontSize = "200%"));
    await expect(page.locator("html")).toHaveCSS("font-size", "32px");
    await expect.poll(() => controls.evaluate((node) => node.scrollHeight - node.clientHeight)).toBeGreaterThan(100);
    await expect(header).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    const bounds = await header.boundingBox();
    const tabs = controls.getByTestId("progress-range-fields");
    const originalTabs = await tabs.boundingBox();
    await controls.evaluate((node) => (node.scrollTop = 70));
    await expect.poll(() => controls.evaluate((node) => node.scrollTop)).toBe(70);
    expect((await tabs.boundingBox())!.y).toBeLessThan(bounds!.y + bounds!.height);
    expect((await tabs.boundingBox())!.y).toBeLessThan(originalTabs!.y);
    await expect(header).toHaveAttribute("data-scrolled", "true");
    await expect(header).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(header).toHaveCSS("backdrop-filter", "blur(32px) saturate(1.35)");
    expect(await header.boundingBox()).toEqual(bounds);
    await page.screenshot({ path: testInfo.outputPath(`progress-${language}-internal-frost.png`), scale: "css" });
    // The independent scroll owners frost their own passing content without
    // adding a dark fill or changing the visible canvas color.
    await page.locator(".progress-screen").evaluate((node) => (node.scrollTop = 180));
    await expect(controls).toHaveAttribute("data-scrolled", "true");
    await expect(controls).toHaveCSS("backdrop-filter", "blur(32px) saturate(1.35)");
    await expect(controls).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(controls).toHaveCSS("background-image", "none");
    await expect(header).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    for (const top of [40, 12, 3]) {
      await controls.evaluate((node, top) => (node.scrollTop = top), top);
      await expect(header).toHaveAttribute("data-scrolled", "true");
      await expect(header).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await expect(header).toHaveCSS("backdrop-filter", "blur(32px) saturate(1.35)");
      expect(await header.boundingBox()).toEqual(bounds);
    }
    await page.screenshot({
      path: testInfo.outputPath(`progress-${language}-internal-scroll-protected.png`),
      scale: "css",
    });
    await controls.evaluate((node) => (node.scrollTop = 0));
    await expect(header).not.toHaveAttribute("data-scrolled");
    await expect(header).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(header).toHaveCSS("backdrop-filter", "none");
    await expect(controls).toHaveAttribute("data-scrolled", "true");
    await header.getByRole("button").focus();
    await controls.evaluate((node) => (node.scrollTop = 70));
    await page.keyboard.press("Tab");
    const selectedTab = controls.getByRole("combobox").first();
    await expect(selectedTab).toBeFocused();
    await expect
      .poll(async () => {
        const title = (await header.boundingBox())!;
        return (await selectedTab.boundingBox())!.y - (title.y + title.height);
      })
      .toBeGreaterThanOrEqual(0);
    const focused = (await selectedTab.boundingBox())!;
    const controlBounds = (await controls.boundingBox())!;
    expect(focused.y + focused.height).toBeLessThanOrEqual(controlBounds.y + controlBounds.height + 1);
  });

  test(`Progress keeps its background color while scrolling in ${language} @cross-browser`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.clock.setFixedTime(new Date("2026-10-20T08:00:00+03:00"));
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
    await page.goto("/#/progress");
    const controls = page.getByTestId("progress-sticky-controls");
    const header = controls.getByTestId("shared-screen-header");
    await expect(header).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const scene = page.getByTestId("time-of-day-scene-window").last().locator("img");
    await expect.poll(() => scene.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
    await expect(controls).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(controls).toHaveCSS("background-image", "none");
    await expect(controls).toHaveCSS("backdrop-filter", "none");
    await page.screenshot({ path: testInfo.outputPath(`progress-${language}-rest.png`), scale: "css" });
    for (const top of [240, 96, 48, 12]) {
      await page.locator(".progress-screen").evaluate((node, top) => (node.scrollTop = top), top);
      await expect(controls).toHaveAttribute("data-scrolled", "true");
      await expect(controls).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await expect(controls).toHaveCSS("background-image", "none");
      await expect(controls).toHaveCSS("backdrop-filter", "blur(32px) saturate(1.35)");
      await expect(header).toHaveCSS("backdrop-filter", "none");
    }
    await page.screenshot({ path: testInfo.outputPath(`progress-${language}-scroll-frost.png`), scale: "css" });
  });
}
