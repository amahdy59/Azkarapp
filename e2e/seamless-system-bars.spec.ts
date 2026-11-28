import { expect, test, type Page } from "@playwright/test";

async function reserveNativeTopInset(page: Page) {
  // Browser engines expose no physical Android status bar. Exercise the real
  // CSS ownership with a nonzero inset, without drawing fake system icons.
  await page.evaluate(() => {
    document.documentElement.style.setProperty("--safe-area-inset-top", "32px");
    document.querySelector(".app-shell")?.setAttribute("data-native-android", "true");
  });
}

test("system ground follows forced colors while the reader stays mounted @cross-browser", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 872 });
  await page.emulateMedia({ forcedColors: "none" });
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "ar", themeMode: "light", appMaterial: "glass", paperTexture: true },
        profile: { isGuest: true },
      }),
    );
  });
  await page.goto("/#/azkar/evening/2");
  const reader = page.getByTestId("reader-screen");
  const color = page.locator('meta[name="theme-color"]');
  await expect(reader).toBeVisible();
  await expect(color).toHaveAttribute("content", "#020617");
  const zikrId = await reader.getAttribute("data-zikr-id");
  await page.emulateMedia({ forcedColors: "active" });
  await expect(color).toHaveAttribute("content", "#f8f5f0");
  await expect(reader).toHaveAttribute("data-zikr-id", zikrId!);
  await page.emulateMedia({ forcedColors: "none" });
  await expect(color).toHaveAttribute("content", "#020617");
  await expect(reader).toHaveAttribute("data-zikr-id", zikrId!);
});

for (const language of ["ar", "en"] as const) {
  test(`ordinary wide browser has no mobile status-bar gap ${language} @cross-browser`, async ({ page }, info) => {
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language, themeMode: "light", appMaterial: "solid", paperTexture: true },
          profile: { isGuest: true },
        }),
      );
    }, language);
    for (const width of [768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/#/azkar/evening/2");
      const reader = page.getByTestId("reader-screen");
      const header = page.getByTestId("reader-desktop-hero");
      await expect(reader).toBeVisible();
      await expect(header).toBeVisible();
      await expect(page.locator(".app-shell")).toHaveCSS("padding-top", "0px");
      await expect(page.locator(".app-shell")).not.toHaveAttribute("data-native-android");
      expect((await reader.boundingBox())!.y).toBeCloseTo(0, 0);
      expect((await header.boundingBox())!.y).toBeCloseTo(0, 0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
      await page.screenshot({ path: info.outputPath(`ordinary-wide-${language}-${width}.png`), scale: "css" });
    }
  });
}

for (const language of ["ar", "en"] as const) {
  for (const variant of [
    { name: "light-paper", themeMode: "light", appMaterial: "solid", highContrast: false },
    { name: "light-glass", themeMode: "light", appMaterial: "glass", highContrast: false },
    { name: "dark", themeMode: "dark", appMaterial: "solid", highContrast: false },
    { name: "midnight", themeMode: "midnight", appMaterial: "solid", highContrast: false },
    { name: "high-contrast", themeMode: "light", appMaterial: "glass", highContrast: true },
  ] as const) {
    test(`protected seamless system inset ${variant.name} ${language} @cross-browser`, async ({ page }, info) => {
      await page.setViewportSize({ width: 390, height: 872 });
      await page.addInitScript(
        ({ language, variant }) => {
          localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
          localStorage.setItem(
            "azkarapp.state.v1",
            JSON.stringify({
              settings: { language, ...variant, paperTexture: true },
              profile: { isGuest: true },
            }),
          );
        },
        { language, variant },
      );
      await page.goto("/#/azkar/evening/2");
      const reader = page.getByTestId("reader-screen");
      await expect(reader).toBeVisible();
      await expect(page.getByTestId("reader-session-chrome")).toBeVisible();
      await reserveNativeTopInset(page);
      await expect(page.locator(".app-shell")).toHaveCSS("padding-top", "32px");
      const ground = await page.locator(".app-shell").evaluate((node) => {
        const surface = getComputedStyle(node, "::before");
        const probe = document.createElement("span");
        probe.style.color = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')!.content;
        document.body.appendChild(probe);
        const metaColor = getComputedStyle(probe).color;
        probe.remove();
        return {
          background: surface.backgroundColor,
          height: surface.height,
          pointer: surface.pointerEvents,
          metaColor,
        };
      });
      expect(ground.background).toBe(ground.metaColor);
      expect(ground.background).not.toBe("rgba(0, 0, 0, 0)");
      expect(ground.height).toBe("32px");
      expect(ground.pointer).toBe("none");
      expect((await reader.boundingBox())!.y).toBeCloseTo(32, 0);
      if (variant.name === "light-paper") {
        await expect(reader).toHaveCSS("background-color", ground.background);
        await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", "#f2f0eb");
        const track = page.getByTestId("reader-session-chrome").getByRole("progressbar");
        expect(await track.evaluate((node) => getComputedStyle(node).backgroundColor)).not.toBe(ground.background);
      }
      if (variant.name === "light-glass") {
        await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", "#020617");
      }
      await page.screenshot({ path: info.outputPath(`reader-${variant.name}-${language}.png`), scale: "css" });
      await page.setViewportSize({ width: 320, height: 740 });
      await page.locator("html").evaluate((node) => {
        node.style.fontSize = "200%";
      });
      expect(await reader.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
      const actions = page.getByTestId("reader-actions");
      for (const button of await actions.getByRole("button").all()) {
        const box = (await button.boundingBox())!;
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
      const menu = actions.getByRole("button").last();
      await menu.click();
      const popup = page.getByRole("menu");
      await expect(popup).toBeVisible();
      expect(
        await popup.evaluate((node) => {
          const r = node.getBoundingClientRect();
          const c = getComputedStyle(node).backgroundColor;
          return c !== "transparent" && !c.startsWith("rgba(") && r.left >= 0 && r.right <= innerWidth + 1;
        }),
      ).toBe(true);
      await page.keyboard.press("Escape");
      await expect(popup).toBeHidden();
      await expect(menu).toBeFocused();
      await page.screenshot({ path: info.outputPath(`reader-${variant.name}-${language}-320-200.png`), scale: "css" });
    });
  }
}
