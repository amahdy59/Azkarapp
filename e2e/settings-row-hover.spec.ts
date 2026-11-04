import { expect, test } from "@playwright/test";

// Hover requires a fine pointer; cover each engine with desktop pointer semantics.
test.use({ hasTouch: false, isMobile: false });

for (const scenario of [
  { language: "ar", width: 390, themeMode: "midnight", appMaterial: "glass", enlarged: false },
  { language: "en", width: 1440, themeMode: "dark", appMaterial: "glass", enlarged: false },
  { language: "en", width: 320, themeMode: "light", appMaterial: "solid", enlarged: true },
] as const) {
  test(`Settings row hover preserves ink, frame and separators ${scenario.language}-${scenario.width} @cross-browser`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: scenario.width, height: 900 });
    await page.addInitScript((settings) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({ settings: { ...settings, reduceMotion: true }, profile: { isGuest: true } }),
      );
    }, scenario);
    await page.goto("/#/settings");
    if (scenario.enlarged)
      await page.locator("html").evaluate((root) => {
        root.style.fontSize = "200%";
      });
    const rows = page.locator(".settings-row-item > button[data-card-action]");
    await expect(rows.first()).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    // First, middle and last of an actual Settings group, including its rounded edge.
    for (const index of [0, 1, 2, 3, 4, 5]) {
      const row = rows.nth(index);
      await row.scrollIntoViewIfNeeded();
      await page.mouse.move(0, 0);
      await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
      const before = await row.evaluate((node) => {
        const s = getComputedStyle(node),
          r = node.getBoundingClientRect();
        return {
          shadow: s.boxShadow,
          color: getComputedStyle(node.querySelector("p")!).color,
          opacity: s.opacity,
          box: [r.x, r.y, r.width, r.height],
          radius: s.borderRadius,
        };
      });
      await row.hover();
      await expect.poll(() => row.evaluate((node) => getComputedStyle(node).boxShadow)).not.toBe(before.shadow);
      const after = await row.evaluate((node) => {
        const s = getComputedStyle(node),
          r = node.getBoundingClientRect();
        return {
          color: getComputedStyle(node.querySelector("p")!).color,
          opacity: s.opacity,
          box: [r.x, r.y, r.width, r.height],
          radius: s.borderRadius,
          overflow: s.overflow,
        };
      });
      expect(after.color).toBe(before.color);
      expect(after.opacity).toBe("1");
      expect(after.box).toEqual(before.box);
      expect(after.radius).toBe(before.radius);
      expect(after.overflow).toBe("clip");
      const divider = row.locator("..").locator(":scope > .settings-row-divider");
      if (await divider.count()) await expect(divider).toHaveCSS("visibility", "visible");
      await page.screenshot({ path: info.outputPath(`settings-hover-${index}.png`), scale: "css" });
      await row.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      await expect(row).toBeFocused();
      await expect.poll(() => row.evaluate((node) => getComputedStyle(node).boxShadow)).not.toBe("none");
      await page.screenshot({ path: info.outputPath(`settings-focus-${index}.png`), scale: "css" });
    }
  });
}
