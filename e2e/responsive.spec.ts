import { expect, test } from "@playwright/test";

test("the app canvas stays phone-sized on large viewports and fills phone viewports", async ({ page }) => {
  await page.goto("/");

  const shell = page.locator(".app-shell");
  await expect(shell).toBeVisible();

  const viewport = page.viewportSize();
  const box = await shell.boundingBox();
  expect(viewport).not.toBeNull();
  expect(box).not.toBeNull();

  if (!viewport || !box) return;

  if (viewport.width <= 430) {
    expect(box.width).toBeCloseTo(viewport.width, 0);
    expect(box.height).toBeCloseTo(viewport.height, 0);
    await expect(shell).toHaveCSS("border-radius", "0px");
  } else {
    expect(box.width).toBeCloseTo(390, 0);
    expect(box.height).toBeLessThanOrEqual(882);
    expect(box.x).toBeCloseTo((viewport.width - box.width) / 2, 0);
    await expect(shell).toHaveCSS("border-radius", "40px");
  }
});

test("the typography contract assigns each content type to its approved family", async ({ page }) => {
  await page.goto("/");

  const families = await page.evaluate(() => {
    const fixture = document.createElement("div");
    fixture.innerHTML = `
      <span data-font="english">English interface</span>
      <span data-font="arabic">واجهة عربية</span>
      <span data-font="mixed-english" class="latin-ui" lang="en" dir="ltr">English inside Arabic UI</span>
      <span data-font="zikr" class="zikr-text" lang="ar" dir="rtl">سُبْحَانَ اللَّهِ</span>
    `;
    document.body.append(fixture);

    document.documentElement.lang = "en";
    const english = getComputedStyle(fixture.querySelector('[data-font="english"]')!).fontFamily;

    document.documentElement.lang = "ar";
    const arabic = getComputedStyle(fixture.querySelector('[data-font="arabic"]')!).fontFamily;
    const mixedEnglish = getComputedStyle(fixture.querySelector('[data-font="mixed-english"]')!).fontFamily;
    const zikr = getComputedStyle(fixture.querySelector('[data-font="zikr"]')!).fontFamily;

    fixture.remove();
    return { english, arabic, mixedEnglish, zikr };
  });

  expect(families.english).toContain("Inter");
  expect(families.arabic).toContain("Noto Sans Arabic");
  expect(families.mixedEnglish).toContain("Inter");
  expect(families.zikr).toContain("IBM Plex Sans Arabic");
});
