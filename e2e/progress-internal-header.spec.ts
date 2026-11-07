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
    const edge = page.locator(".progress-scroll-edge");
    await expect(edge).toHaveCSS("pointer-events", "none");
    await expect(edge).toHaveCSS("height", "12px");
    if (!(await page.evaluate(() => matchMedia("(prefers-reduced-transparency: reduce)").matches))) {
      const controlsBox = (await controls.boundingBox())!;
      const edgeBox = (await edge.boundingBox())!;
      expect(Math.abs(edgeBox.y - controlsBox.y - controlsBox.height)).toBeLessThanOrEqual(1);
      expect(edgeBox.height).toBe(12);
    }
    const viewportTop = (await page.locator(".progress-screen").boundingBox())!.y;
    await expect.poll(async () => Math.abs((await controls.boundingBox())!.y - viewportTop)).toBeLessThanOrEqual(1);
    await expect(controls).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
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

  test(`Progress retains shared material and sticky geometry while scrolling in ${language} @cross-browser`, async ({
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
    const initialTop = (await header.boundingBox())!.y;
    if (await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches)) {
      await page.mouse.move(200, 600);
      await page.mouse.wheel(0, 1200);
    } else {
      await page.locator(".progress-screen").evaluate((node) => {
        node.scrollTop = 1200;
      });
    }
    await expect.poll(async () => Math.abs((await header.boundingBox())!.y - initialTop)).toBeLessThanOrEqual(1);
    await page.locator(".progress-screen").evaluate((node) => {
      node.scrollTop = node.scrollHeight;
    });
    await expect.poll(async () => Math.abs((await header.boundingBox())!.y - initialTop)).toBeLessThanOrEqual(1);
    await page.locator(".progress-screen").evaluate((node) => {
      node.scrollTop = 0;
    });
    const scene = page.getByTestId("time-of-day-scene-window").last().locator("img");
    await expect.poll(() => scene.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
    await expect(controls).not.toHaveAttribute("data-scrolled", "true");
    const resolvedGlass = (await page.locator("html").getAttribute("data-app-material-resolved")) === "glass";
    if (resolvedGlass) {
      await expect(controls).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await expect(controls).toHaveCSS("backdrop-filter", "none");
    }
    await page.screenshot({ path: testInfo.outputPath(`progress-${language}-rest.png`), scale: "css" });
    for (const top of [240, 96, 48, 12]) {
      await page.locator(".progress-screen").evaluate((node, top) => (node.scrollTop = top), top);
      await expect(controls).toHaveAttribute("data-scrolled", "true");
      await expect(controls).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await expect(controls).toHaveCSS("background-image", /paper-grain/);
      if (resolvedGlass) await expect(controls).not.toHaveCSS("backdrop-filter", "none");
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
