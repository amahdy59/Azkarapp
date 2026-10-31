import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { getAzkarForMode } from "../src/app/content/azkar";

for (const language of ["ar", "en"] as const) {
  for (const material of ["solid", "glass"] as const) {
    test(`light appearance remains readable on Home and counters ${language} ${material}`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.clock.setFixedTime(new Date("2026-10-31T08:00:00+02:00"));
      await page.addInitScript(
        ({ language, material }) => {
          localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
          localStorage.setItem(
            "azkarapp.state.v1",
            JSON.stringify({
              settings: {
                language,
                themeMode: "light",
                appMaterial: material,
                homeMaterial: material,
                reduceMotion: true,
              },
              profile: { isGuest: true },
            }),
          );
        },
        { language, material },
      );
      for (const route of ["/#/home", "/#/azkar/travel/1", "/#/counter"]) {
        await page.goto(route);
        await expect(page.locator("#main-content")).toBeVisible();
        if (route.includes("home")) await expect(page.getByTestId("home-sticky-prayers")).toBeVisible();
        else await expect(page.locator(".reader-text-scroll")).toBeVisible();
        expect((await new AxeBuilder({ page }).include("#main-content").analyze()).violations).toEqual([]);
      }
      await page.screenshot({ path: testInfo.outputPath(`light-${language}-${material}.png`) });
    });
  }
  test(`counter keyboard focus survives completion and reading focus is visible ${language} @cross-browser`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language, reduceMotion: true, appMaterial: "solid" },
          profile: { isGuest: true },
        }),
      );
    }, language);
    await page.goto("/#/azkar/waking-up/1");
    const counter = page.getByTestId("counter-surface");
    await counter.focus();
    await page.keyboard.press("Space");
    await expect(counter).toBeFocused();
    await expect(page.getByTestId("reader-screen")).toHaveAttribute("data-zikr-index", "1");
    await expect(counter).toBeFocused();
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe("BODY");
    for (const route of ["/#/azkar/morning/1", "/#/counter", "/#/friday/salawat"]) {
      await page.goto(route);
      const region = page.locator(".reader-text-scroll");
      await region.focus();
      await page.keyboard.press("ArrowDown");
      await expect(region).toBeFocused();
      expect(await region.evaluate((node) => getComputedStyle(node).boxShadow)).toContain("inset");
      const results = await new AxeBuilder({ page }).include("#main-content").analyze();
      expect(results.violations).toEqual([]);
    }
    await page.screenshot({ path: testInfo.outputPath(`reading-focus-${language}.png`) });
    await page.emulateMedia({ forcedColors: "active" });
    const region = page.locator(".reader-text-scroll");
    await region.focus();
    await page.keyboard.press("ArrowDown");
    await expect(region).toHaveCSS("outline-style", "solid");
    await expect(region).toHaveCSS("outline-offset", "-2px");
  });
}

test("actual touch scrolling of overflowing devotional text never increments the count", async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== "chromium", "CDP sends physical touch input");
  const items = getAzkarForMode("morning", "complete");
  const longest = items.reduce((best, z, i) => (z.arabicText.length > items[best].arabicText.length ? i : best), 0);
  await page.setViewportSize({ width: 320, height: 700 });
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "ar", reduceMotion: true, routineModes: { morning: "complete" } },
        profile: { isGuest: true },
      }),
    );
  });
  await page.goto(`/#/azkar/morning/${longest + 1}`);
  const region = page.locator(".reader-text-scroll"),
    counter = page.getByTestId("counter-surface");
  await expect(region).toBeVisible();
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  await expect.poll(() => region.evaluate((node) => node.scrollHeight - node.clientHeight)).toBeGreaterThan(100);
  const before = await counter.getAttribute("aria-label");
  const box = (await region.boundingBox())!;
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
  const x = box.x + box.width / 2,
    start = box.y + box.height - 15,
    end = box.y + 15;
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y: start }] });
  for (let y = start - 15; y > end; y -= 15) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y }] });
    await page.evaluate(() => new Promise(requestAnimationFrame));
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect.poll(() => region.evaluate((node) => node.scrollTop)).toBeGreaterThan(20);
  await expect(counter).toHaveAttribute("aria-label", before!);
});
