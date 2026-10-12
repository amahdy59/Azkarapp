import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

test("mobile UI resists browser pinch magnification while scrolling and enlarged text remain usable @cross-browser", async ({
  page,
  browserName,
}, info) => {
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({ settings: { language: "ar", reduceMotion: true }, profile: { isGuest: true } }),
    );
  });
  await page.goto("/#/azkar");
  await expect(page.getByTestId("nav-azkar")).toBeVisible();
  expect(await page.locator("body").evaluate((element) => getComputedStyle(element).touchAction)).toBe("pan-x pan-y");
  expect(await page.locator('meta[name="viewport"]').getAttribute("content")).not.toMatch(
    /user-scalable\s*=\s*no|maximum-scale\s*=\s*1/,
  );
  if (browserName === "chromium") {
    const session = await page.context().newCDPSession(page);
    await session.send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true,
    });
    const touch = async (
      type: "touchStart" | "touchMove" | "touchEnd",
      points: { x: number; y: number; id: number }[],
    ) => {
      await session.send("Input.dispatchTouchEvent", { type, touchPoints: points });
    };
    await touch("touchStart", [
      { x: 165, y: 350, id: 1 },
      { x: 225, y: 350, id: 2 },
    ]);
    for (let step = 1; step <= 6; step++)
      await touch("touchMove", [
        { x: 165 - step * 20, y: 350, id: 1 },
        { x: 225 + step * 20, y: 350, id: 2 },
      ]);
    await touch("touchEnd", []);
    await expect.poll(() => page.evaluate(() => visualViewport?.scale ?? 1)).toBe(1);
    await session.detach();
  }
  const scroll = page.locator(".app-main .overflow-y-auto").first();
  await expect(scroll).toBeVisible();
  await page.screenshot({ path: info.outputPath("mobile-library-normal.png") });
  await page.locator("html").evaluate((element) => {
    element.style.fontSize = "32px";
  });
  await expect
    .poll(() => page.locator("html").evaluate((element) => parseFloat(getComputedStyle(element).fontSize)))
    .toBe(32);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  const scrollable = await scroll.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
    return element.scrollHeight <= element.clientHeight || element.scrollTop > 0;
  });
  expect(scrollable).toBe(true);
  await page.screenshot({ path: info.outputPath("mobile-library-enlarged-text.png") });
  const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(scan.violations).toEqual([]);
});
