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

for (const width of [390, 1440]) {
  test(`loaded Glass records wheel and touch frame diagnostics ${width}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.clock.setFixedTime(new Date("2026-10-17T08:00:00+03:00"));
    await page.addInitScript(() => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language: "ar", appMaterial: "glass", homeMaterial: "glass", reduceMotion: false },
          profile: { isGuest: true },
        }),
      );
      Object.defineProperty(navigator, "connection", { configurable: true, value: { saveData: false } });
    });
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    const observations = [];
    for (const route of ["home", "azkar", "progress", "settings"]) {
      await page.goto("/#/" + route);
      await expect
        .poll(() =>
          page
            .getByTestId("time-of-day-scene-window")
            .last()
            .locator("img")
            .evaluate((image) => image.complete && image.naturalWidth > 0),
        )
        .toBe(true);
      await page.evaluate(() => document.fonts.ready);
      const viewport = page.locator(".app-main-view");
      await viewport.evaluate((root) => {
        const region = [root, ...root.querySelectorAll<HTMLElement>("*")]
          .filter(
            (node) =>
              /auto|scroll/.test(getComputedStyle(node).overflowY) && node.scrollHeight > node.clientHeight + 100,
          )
          .sort((a, b) => b.clientHeight - a.clientHeight)[0];
        if (region) {
          region.scrollTop = 0;
          region.setAttribute("data-glass-scroll-probe", "true");
        }
      });
      const region = page.locator('[data-glass-scroll-probe="true"]');
      await expect(region).toHaveCount(1);
      const trace = await page.evaluateHandle(() => {
        const intervals: number[] = [];
        const longTasks: number[] = [];
        let last = performance.now();
        let frame = 0;
        const sample = (time: number) => {
          intervals.push(time - last);
          last = time;
          frame = requestAnimationFrame(sample);
        };
        frame = requestAnimationFrame(sample);
        const observer = new PerformanceObserver((list) =>
          longTasks.push(...list.getEntries().map((entry) => entry.duration)),
        );
        observer.observe({ type: "longtask", buffered: false });
        return {
          finish: () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
            const sorted = intervals.slice(1).sort((a, b) => a - b);
            return {
              frames: sorted.length,
              p95FrameMs: sorted[Math.floor(sorted.length * 0.95)] ?? 0,
              maxFrameMs: sorted.at(-1) ?? 0,
              longTasks,
            };
          },
        };
      });
      await region.hover();
      const before = await region.evaluate((node) => node.scrollTop);
      await page.mouse.wheel(0, 180);
      await expect.poll(() => region.evaluate((node) => node.scrollTop)).toBeGreaterThan(before + 50);
      const firstWheelTop = await region.evaluate((node) => node.scrollTop);
      await page.mouse.wheel(0, 180);
      // Short records can reach their native end on the first wheel. Require
      // another 50px only where that much scroll range actually remains.
      await expect
        .poll(() =>
          region.evaluate((node, firstTop) => {
            const end = node.scrollHeight - node.clientHeight;
            return node.scrollTop - Math.min(firstTop + 50, end);
          }, firstWheelTop),
        )
        .toBeGreaterThanOrEqual(0);
      const wheelTop = await region.evaluate((node) => node.scrollTop);
      await page.mouse.wheel(0, -180);
      await expect.poll(() => region.evaluate((node) => node.scrollTop)).toBeLessThan(wheelTop);
      let touchTop: number | undefined;
      if (width === 390 && route === "home") {
        await region.evaluate((node) => {
          node.scrollTop = 0;
        });
        await expect(page.getByTestId("home-sticky-prayers")).not.toHaveAttribute("data-prayer-cards-condensed");
        await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
        await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 180, y: 720 }] });
        for (let y = 690; y >= 390; y -= 30) {
          await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 180, y }] });
          await page.evaluate(() => new Promise(requestAnimationFrame));
        }
        await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
        await expect.poll(() => region.evaluate((node) => node.scrollTop)).toBeGreaterThan(96);
        await expect(page.getByTestId("home-sticky-prayers")).toHaveAttribute("data-prayer-cards-condensed", "true");
        touchTop = await region.evaluate((node) => node.scrollTop);
        await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: false });
      }
      const frames = await trace.evaluate((handle) => handle.finish());
      await trace.dispose();
      expect(frames.frames).toBeGreaterThan(0);
      expect(Number.isFinite(frames.p95FrameMs)).toBe(true);
      observations.push({ route, wheelTop, touchTop, ...frames });
      await page.screenshot({ path: testInfo.outputPath(`glass-${route}-scroll.png`), scale: "css" });
    }
    await testInfo.attach("glass-frame-diagnostics", {
      contentType: "application/json",
      body: JSON.stringify({
        cpuSlowdown: 4,
        width,
        note: "Observed timings, not a physical-device performance certification",
        observations,
      }),
    });
  });
}
