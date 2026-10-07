import { expect, test } from "@playwright/test";

test("Home retains a usable viewport without dynamic viewport units @cross-browser", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({ settings: { language: "ar" }, profile: { isGuest: true } }),
    );
  });
  await page.route("**/assets/*.css", async (route) => {
    const response = await route.fetch();
    const body = (await response.text())
      .replace(/@supports\s+not\s*\(\s*height:\s*100dvh\s*\)/g, "@supports (height:100vh)")
      .replace(/(?:min-|max-)?height:[^;{}]*dvh[^;{}]*(?=[;}])/g, "");
    await route.fulfill({ response, body });
  });
  await page.goto("/#/home");
  await expect(page.getByTestId("home-utility-header")).toBeVisible();
  for (const viewport of [
    { width: 360, height: 640 },
    { width: 1280, height: 720 },
  ]) {
    await page.setViewportSize(viewport);
    await expect.poll(async () => (await page.locator(".app-viewport").boundingBox())?.height).toBe(viewport.height);
    expect((await page.locator(".app-main").boundingBox())?.height).toBeGreaterThan(400);
  }
});

test("slow application code loading shows localized feedback instead of a blank screen @cross-browser", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({ settings: { language: "ar" }, profile: { isGuest: true } }),
    ),
  );
  let release!: () => void;
  const delayed = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/assets/App-*.js", async (route) => {
    await delayed;
    await route.continue();
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("status")).toContainText("جارٍ التحميل");
  await expect(page.getByRole("status")).toHaveAttribute("aria-busy", "true");
  release();
  await expect(page.getByRole("status").filter({ hasText: "جارٍ التحميل" })).toHaveCount(0);
});

test("Home opens under a six-times slower CPU and constrained connection", async ({ page, browserName }, testInfo) => {
  test.skip(browserName !== "chromium", "CPU throttling requires Chromium CDP.");
  await page.setViewportSize({ width: 360, height: 640 });
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({ settings: { language: "ar" }, profile: { isGuest: true } }),
    );
    const tasks: number[] = [];
    (window as unknown as { startupTasks: number[] }).startupTasks = tasks;
    new PerformanceObserver((list) => tasks.push(...list.getEntries().map((entry) => entry.duration))).observe({
      type: "longtask",
      buffered: true,
    });
  });
  const session = await page.context().newCDPSession(page);
  await session.send("Emulation.setCPUThrottlingRate", { rate: 6 });
  await session.send("Network.enable");
  await session.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 100,
    downloadThroughput: 200_000,
    uploadThroughput: 100_000,
  });
  await page.goto("/#/home", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("home-utility-header")).toBeVisible();
  const metrics = await page.evaluate(() => ({
    homeVisibleMs: Math.round(performance.now()),
    longTasksMs: (window as unknown as { startupTasks: number[] }).startupTasks,
    resources: performance
      .getEntriesByType("resource")
      .filter((entry) => entry.name.endsWith(".js"))
      .map((entry) => ({ file: entry.name.split("/").pop(), duration: Math.round(entry.duration) })),
  }));
  await testInfo.attach("throttled-startup", {
    body: JSON.stringify(metrics, null, 2),
    contentType: "application/json",
  });
  console.log(JSON.stringify(metrics));
  expect(metrics.resources.some((resource) => /^audio(?:-|OfflineCache)/.test(resource.file ?? ""))).toBe(false);
});
