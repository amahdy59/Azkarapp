import { expect, test } from "@playwright/test";

for (const language of ["ar", "en"] as const) {
  test(`Progress title and filters remain reachable with enlarged text in ${language} @cross-browser`, async ({
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
    const header = page.getByRole("heading", { name: language === "ar" ? "التقدم" : "Progress", exact: true });
    await expect(header).toBeVisible();
    await expect(controls.getByTestId("shared-screen-header")).toHaveCount(1);
    await page.locator("html").evaluate((node) => (node.style.fontSize = "200%"));
    await expect(page.locator("html")).toHaveCSS("font-size", "32px");
    await page.locator(".progress-screen").evaluate((node) => (node.scrollTop = 250));
    await expect(controls).toHaveAttribute("data-scrolled", "true");
    await expect(controls).toHaveCSS("backdrop-filter", "none");
    await expect(controls).toHaveCSS("background-color", /^rgb\(/);
    await expect(page.getByTestId("shared-screen-header")).toHaveCount(1);
    await page.getByTestId("progress-filters-toggle").click();
    const sheet = page.getByTestId("progress-filter-sheet");
    const period = sheet.getByRole("combobox").first();
    await period.focus();
    await expect(period).toBeFocused();
    // Native focus scrolling can finish after focus capture (notably WebKit).
    await expect
      .poll(async () => {
        const focused = (await period.boundingBox())!;
        const bounds = (await sheet.boundingBox())!;
        return { top: focused.y >= bounds.y - 1, bottom: focused.y + focused.height <= bounds.y + bounds.height + 1 };
      })
      .toEqual({ top: true, bottom: true });
    await page.screenshot({ path: testInfo.outputPath(`progress-${language}-compact-controls.png`), scale: "css" });
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
    const header = page.getByRole("heading", { name: language === "ar" ? "التقدم" : "Progress", exact: true });
    await expect(header).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const scene = page.getByTestId("time-of-day-scene-window").last().locator("img");
    await expect.poll(() => scene.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
    await expect(controls).toHaveCSS("background-color", /^rgb\(/);
    await expect(controls).toHaveCSS("background-image", "none");
    await expect(controls).toHaveCSS("backdrop-filter", "none");
    await page.screenshot({ path: testInfo.outputPath(`progress-${language}-rest.png`), scale: "css" });
    for (const top of [240, 96, 48, 12]) {
      await page.locator(".progress-screen").evaluate((node, top) => (node.scrollTop = top), top);
      await expect(controls).toHaveAttribute("data-scrolled", "true");
      await expect(controls).toHaveCSS("background-color", /^rgb\(/);
      await expect(controls).toHaveCSS("background-image", "none");
      await expect(controls).toHaveCSS("backdrop-filter", "none");
      await expect(page.getByTestId("shared-screen-header")).toHaveCount(1);
      const coverage = await controls.evaluate((header) => {
        const bounds = header.getBoundingClientRect();
        const viewport = header.closest(".progress-screen")!.getBoundingClientRect();
        return {
          fullWidth: Math.abs(bounds.left - viewport.left) <= 1 && Math.abs(bounds.right - viewport.right) <= 1,
          ownsGutters: [bounds.left + 1, (bounds.left + bounds.right) / 2, bounds.right - 1].every((x) =>
            header.contains(document.elementFromPoint(x, bounds.bottom - 2)),
          ),
        };
      });
      expect(coverage).toEqual({ fullWidth: true, ownsGutters: true });
    }
    await page.screenshot({ path: testInfo.outputPath(`progress-${language}-scroll-frost.png`), scale: "css" });
  });
}
