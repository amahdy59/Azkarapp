import { expect, test } from "@playwright/test";

for (const width of [390, 1440]) {
  test(`native scrolling remains direct under constrained CPU and network ${width}`, async ({ page }, testInfo) => {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 150,
      downloadThroughput: 200_000,
      uploadThroughput: 100_000,
    });
    await page.setViewportSize({ width, height: 844 });
    await page.addInitScript(() => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language: "en", appMaterial: "solid", homeMaterial: "solid", reduceMotion: true },
          profile: { isGuest: true },
        }),
      );
      Object.defineProperty(navigator, "connection", { configurable: true, value: { saveData: true } });
    });
    const started = Date.now();
    await page.goto("/#/home");
    await expect(page.getByTestId("home-tool-masbaha")).toBeAttached();
    const interactiveMs = Date.now() - started;
    await expect(page.getByTestId("time-of-day-scene-window").locator("img")).toHaveCount(0);
    const samples = [];
    for (const tab of ["home", "azkar", "progress", "settings"] as const) {
      await page.getByTestId(`nav-${tab}`).click();
      await expect(page.getByTestId(`nav-${tab}`)).toHaveAttribute("aria-current", "page");
      if (tab === "home") await expect(page.getByTestId("home-tool-masbaha")).toBeAttached();
      if (tab === "azkar") await expect(page.getByTestId("category-card-morning")).toBeVisible();
      if (tab === "progress") await expect(page.getByTestId("progress-sticky-controls")).toBeVisible();
      if (tab === "settings") await expect(page.getByTestId("settings-screen")).toBeVisible();
      const sample = await page.locator(".app-main-view").evaluate(async (root) => {
        const candidates = [root, ...root.querySelectorAll<HTMLElement>("*")].filter(
          (node) => /auto|scroll/.test(getComputedStyle(node).overflowY) && node.scrollHeight > node.clientHeight + 100,
        );
        const region = candidates.sort((a, b) => b.clientHeight - a.clientHeight)[0];
        if (!region) return { scrollable: false };
        region.setAttribute("data-scroll-performance-probe", "true");
        const before = region.scrollTop;
        region.scrollTop = before + 120;
        const down = region.scrollTop;
        region.scrollTop = before;
        return {
          scrollable: true,
          before,
          down,
          restored: region.scrollTop,
          behavior: getComputedStyle(region).scrollBehavior,
        };
      });
      if (sample.scrollable) {
        expect(sample.down).toBeGreaterThan(sample.before!);
        expect(sample.restored).toBe(sample.before);
        expect(sample.behavior).toBe("auto");
        const region = page.locator('[data-scroll-performance-probe="true"]');
        await region.hover();
        const inputAt = Date.now();
        await page.mouse.wheel(0, 120);
        await expect.poll(() => region.evaluate((node) => node.scrollTop)).toBeGreaterThan(sample.before!);
        samples.push({ tab, wheelResponseMs: Date.now() - inputAt });
        await region.evaluate((node) => {
          node.scrollTop = 0;
          node.removeAttribute("data-scroll-performance-probe");
        });
      }
      samples.push({ tab, ...sample });
    }
    expect(await page.locator(".app-shell").evaluate((node) => getComputedStyle(node, "::after").content)).toBe("none");
    await testInfo.attach("constrained-device-observation", {
      contentType: "application/json",
      body: JSON.stringify({ interactiveMs, cpuSlowdown: 4, latencyMs: 150, bytesPerSecond: 200000, samples }),
    });
  });
}
