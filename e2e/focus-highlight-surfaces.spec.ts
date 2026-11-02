import { expect, test } from "@playwright/test";
import { t } from "../src/app/i18n";

for (const scenario of [
  { language: "ar", width: 1440, scale: 1, material: "solid" },
  { language: "en", width: 834, scale: 2, material: "solid" },
  { language: "ar", width: 320, scale: 2, material: "glass" },
] as const) {
  test(`single focus and continuous grouped highlight ${scenario.language}/${scenario.width}/${scenario.scale} @cross-browser`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: scenario.width, height: 1000 });
    await page.addInitScript(({ language, material }) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language, themeMode: "light", paperTexture: true, reduceMotion: true, appMaterial: material },
          profile: { isGuest: true },
        }),
      );
    }, scenario);
    await page.goto("/#/settings");
    const input = page.locator("#settings-search-input");
    await expect(input).toBeVisible();
    await page.locator("html").evaluate((node, scale) => {
      node.style.fontSize = `${scale * 100}%`;
    }, scenario.scale);
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(
      () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
    );
    await page.keyboard.press("Tab");
    await input.focus();
    await expect
      .poll(() =>
        input.evaluate((node) => {
          const style = getComputedStyle(node);
          return {
            focused: node.matches(":focus-visible"),
            outline: style.outlineStyle,
            ring: style.boxShadow.includes("3px"),
          };
        }),
      )
      .toEqual({ focused: true, outline: "none", ring: true });
    const inputBox = await input.boundingBox();
    expect(inputBox!.x).toBeGreaterThanOrEqual(3);
    expect(inputBox!.x + inputBox!.width).toBeLessThanOrEqual(scenario.width - 3);
    await page.screenshot({ path: info.outputPath("single-search-focus.png") });

    const first = page.getByTestId("settings-sub-appearance");
    await first.focus();
    const wrapper = first.locator("..");
    await expect(wrapper.locator(".settings-row-divider")).toHaveCSS("visibility", "hidden");
    const corners = await first.evaluate((node) => {
      const s = getComputedStyle(node);
      return {
        top: parseFloat(s.borderTopLeftRadius),
        bottom: parseFloat(s.borderBottomLeftRadius),
        outline: s.outlineStyle,
      };
    });
    expect(corners.top).toBeGreaterThan(0);
    expect(corners.bottom).toBe(0);
    expect(corners.outline).toBe("none");
    if (await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches)) {
      await input.focus();
      await first.hover();
      await expect(wrapper.locator(".settings-row-divider")).toHaveCSS("visibility", "hidden");
      await page.screenshot({ path: info.outputPath("rounded-row-hover.png") });
    }

    await page.goto("/#/progress/month");
    const opener = page.getByTestId("progress-filters-toggle");
    await expect(opener).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(
      () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
    );
    await page.keyboard.press("Tab");
    await opener.focus();
    await expect
      .poll(() =>
        opener.evaluate((node) => {
          const s = getComputedStyle(node);
          return s.outlineStyle === "none" && s.boxShadow.includes("3px");
        }),
      )
      .toBe(true);
    await opener.click();
    const close = page
      .getByRole("dialog")
      .getByRole("button", { name: t(scenario.language, "common.close"), exact: true });
    await page.keyboard.press("Tab");
    await close.focus();
    await expect.poll(() => close.evaluate((node) => getComputedStyle(node).boxShadow.includes("3px"))).toBe(true);
    await page.screenshot({ path: info.outputPath("dialog-close-focus.png") });
    await page.keyboard.press("Escape");
    await expect(opener).toBeFocused();
    await page.emulateMedia({ forcedColors: "active" });
    await expect(opener).toHaveCSS("outline-style", "solid");
    await expect(opener).toHaveCSS("outline-width", "3px");
  });
}
