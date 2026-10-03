import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { getAzkarForMode } from "../src/app/content/azkar";

for (const language of ["ar", "en"] as const) {
  test(`compact devotional footer in ${language} @cross-browser`, async ({ page }) => {
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language, reduceMotion: true, routineModes: { morning: "complete" } },
          profile: { isGuest: true },
        }),
      );
    }, language);
    const index = getAzkarForMode("morning", "complete").findIndex((zikr) => zikr.id === "m-hm-91");
    await page.goto(`/#/azkar/morning/${index + 1}`);
    const actions = page.getByTestId("reader-support-actions");
    const counter = page.getByTestId("counter-surface");
    const hint = page.getByTestId("counter-tap-hint");
    for (const width of [320, 390, 820, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(actions).toBeVisible();
      await expect(actions.getByRole("button")).toHaveCount(3);
      await expect(hint).toBeVisible();
      await expect(hint.locator("svg")).toHaveCount(1);
      await expect(async () => {
        const hintBox = (await hint.boundingBox())!;
        const supportBox = (await actions.boundingBox())!;
        const panelBox = (await page.getByTestId("counter-panel").boundingBox())!;
        expect(hintBox.y + hintBox.height).toBeLessThanOrEqual(supportBox.y);
        expect(Math.abs(hintBox.x - supportBox.x)).toBeLessThanOrEqual(1);
        expect(Math.abs(panelBox.x - supportBox.x)).toBeLessThanOrEqual(1);
        expect(Math.abs(panelBox.width - supportBox.width)).toBeLessThanOrEqual(1);
        expect(await hint.evaluate((element) => element.closest('[data-testid="reader-dock"]') === null)).toBe(true);
        for (const button of await actions.getByRole("button").all()) {
          const box = await button.boundingBox();
          expect(box).not.toBeNull();
          expect(box!.height).toBeGreaterThanOrEqual(44);
          expect(box!.width).toBeGreaterThanOrEqual(44);
        }
        const box = await counter.boundingBox();
        expect(box).not.toBeNull();
        expect(Math.round(box!.height)).toBe(48);
        const surfaceRadius = await counter.evaluate((element) => getComputedStyle(element).borderRadius);
        const padding = [];
        for (const button of await actions.getByRole("button").all()) {
          const style = await button.evaluate((element) => ({
            radius: getComputedStyle(element).borderRadius,
            left: getComputedStyle(element).paddingLeft,
            right: getComputedStyle(element).paddingRight,
          }));
          expect(style.radius).toBe(surfaceRadius);
          expect(style.left).toBe(style.right);
          padding.push(style.left);
        }
        expect(new Set(padding).size).toBe(1);
        if (width < 768) {
          const navigation = page.getByTestId("counter-panel").locator("button:not([data-counter-variant])");
          const navigationWidths = [];
          for (const [position, button] of (await navigation.all()).entries()) {
            const navigationBox = (await button.boundingBox())!;
            navigationWidths.push(Math.round(navigationBox.width));
            expect(Math.round(navigationBox.height)).toBe(Math.round(box!.height));
            expect(Math.abs(navigationBox.y - box!.y)).toBeLessThanOrEqual(1);
            expect(await button.evaluate((element) => getComputedStyle(element).borderRadius)).toBe(surfaceRadius);
            if (width >= 360) {
              const iconBox = (await button.locator("svg").boundingBox())!;
              const labelBox = (await button.locator("span").boundingBox())!;
              const outerLeft = language === "ar" ? position === 1 : position === 0;
              if (outerLeft) {
                expect(iconBox.x + iconBox.width).toBeLessThanOrEqual(labelBox.x);
              } else {
                expect(iconBox.x).toBeGreaterThanOrEqual(labelBox.x + labelBox.width);
              }
            }
          }
          expect(new Set(navigationWidths).size).toBe(1);
          const supportBox = (await actions.boundingBox())!;
          expect(Math.round(box!.y - supportBox.y - supportBox.height)).toBe(12);
        }
      }).toPass({ timeout: 15000 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: `output/playwright/footer-redesign/reader-${language}-${width}.png` });
    }
    await hint.click();
    await expect(counter).toHaveAttribute("aria-label", language === "en" ? /1 \/ 100$/ : /١ \/ ١٠٠$/);
    await page.getByTestId("reader-share-dock-button").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(counter).toHaveAttribute("aria-label", language === "en" ? /1 \/ 100$/ : /١ \/ ١٠٠$/);
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("reader-share-dock-button")).toBeFocused();
    const scan = await new AxeBuilder({ page })
      .include('[data-testid="reader-dock"]')
      .include('[data-testid="counter-tap-hint"]')
      .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
      .analyze();
    expect(scan.violations).toEqual([]);
    for (const [route, testId] of [
      ["counter", "custom-counter-surface"],
      ["friday/salawat", "salawat-counter"],
    ]) {
      await page.goto(`/#/${route}`);
      const surface = page.getByTestId(testId);
      await expect(surface).toBeVisible();
      await expect(page.getByTestId("counter-tap-hint")).toBeVisible();
      const hintBox = (await page.getByTestId("counter-tap-hint").boundingBox())!;
      const dockBox = (await page.getByTestId("reader-dock").boundingBox())!;
      expect(hintBox.y + hintBox.height).toBeLessThanOrEqual(dockBox.y);
      expect(Math.round((await surface.boundingBox())!.height)).toBe(48);
      await page.screenshot({ path: `output/playwright/footer-redesign/${testId}-${language}.png` });
    }
  });
}

for (const themeMode of ["light", "dark", "midnight"] as const) {
  test(`devotional footer hierarchy remains readable in ${themeMode}`, async ({ page }) => {
    await page.addInitScript((themeMode) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language: "ar", themeMode, reduceMotion: true, routineModes: { morning: "complete" } },
          profile: { isGuest: true },
        }),
      );
    }, themeMode);
    await page.setViewportSize({ width: 390, height: 844 });
    const index = getAzkarForMode("morning", "complete").findIndex((zikr) => zikr.id === "m-hm-91");
    await page.goto(`/#/azkar/morning/${index + 1}`);
    const counter = page.getByTestId("counter-surface");
    await expect(counter).toBeVisible();
    await counter.click();
    const scan = await new AxeBuilder({ page })
      .include('[data-testid="reader-dock"]')
      .include('[data-testid="counter-tap-hint"]')
      .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
      .analyze();
    expect(scan.violations).toEqual([]);
    await page.screenshot({ path: `output/playwright/footer-redesign/reader-${themeMode}-ar-390.png` });
    const box = (await counter.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    const pressedScan = await new AxeBuilder({ page })
      .include('[data-testid="counter-surface"]')
      .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
      .analyze();
    await page.mouse.up();
    expect(pressedScan.violations).toEqual([]);
  });
}

test("Reader footer preserves reachable controls with enlarged Arabic text", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "ar", themeMode: "light", reduceMotion: true, textSize: "large" },
        profile: { isGuest: true },
      }),
    );
  });
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/#/azkar/waking-up/1");
  await expect(page.getByTestId("counter-surface")).toBeVisible();
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  for (const button of await page.getByTestId("reader-dock").getByRole("button").all()) {
    if (!(await button.isVisible())) continue;
    await button.scrollIntoViewIfNeeded();
    const box = (await button.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(320);
    // Check text boxes rather than decorative pseudo-elements: the ready ring
    // deliberately scales beyond the button while its opacity falls to zero.
    for (const label of await button.locator("span").all()) {
      const dimensions = await label.evaluate((element) => ({
        text: element.textContent,
        scroll: element.scrollWidth,
        client: element.clientWidth,
      }));
      if (dimensions.client > 0) {
        expect(dimensions.scroll, JSON.stringify(dimensions)).toBeLessThanOrEqual(dimensions.client + 1);
      }
    }
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "output/playwright/footer-redesign/reader-light-ar-enlarged.png" });
});
