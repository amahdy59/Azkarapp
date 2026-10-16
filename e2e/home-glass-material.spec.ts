import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Chromium's real host may request reduced transparency. Explicitly exercise
// both preference values instead of mistaking an opaque fallback for glass.
test.beforeEach(async ({ page }) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-transparency", value: "no-preference" }],
  });
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "ar", themeMode: "midnight", reduceMotion: true },
        profile: { isGuest: true },
      }),
    );
  });
});

test("next-prayer remaining time updates without live announcements or phone overflow", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-14T14:00:00+03:00") });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/#/home");
  const strip = page.getByTestId("home-prayer-strip");
  await expect(strip.locator('[data-density="summary"]')).toHaveCount(5);
  const progress = strip.getByRole("progressbar");
  await expect(progress).toHaveCount(1);
  await expect(progress).toHaveAttribute("aria-label", "الوقت المتبقي حتى صلاة العصر");
  expect(await progress.evaluate((node) => getComputedStyle(node).color)).toBe(
    await strip
      .locator('[data-prayer-state="next"] [data-prayer-detail]')
      .evaluate((node) => getComputedStyle(node).color),
  );
  const first = await progress.evaluate((node) => (node as HTMLProgressElement).value);
  const countdown = await progress.getAttribute("aria-valuetext");
  await page.clock.fastForward(60_000);
  await expect.poll(() => progress.getAttribute("aria-valuetext")).not.toBe(countdown);
  expect(await progress.evaluate((node) => (node as HTMLProgressElement).value)).toBeLessThan(first);
  expect(
    await progress.evaluate((node) => Boolean(node.closest('[aria-live="polite"], [aria-live="assertive"]'))),
  ).toBe(false);
  await page.setViewportSize({ width: 320, height: 740 });
  await expect(strip.locator('[data-density="summary"]')).toHaveCount(5);
  expect(await strip.evaluate((node) => node.scrollWidth - node.clientWidth)).toBe(0);
  const row = page.getByTestId("home-all-prayers-row");
  await row.evaluate((node) => {
    node.scrollLeft = 0;
  });
  const manualPosition = await row.evaluate((node) => node.scrollLeft);
  await page.clock.fastForward(60_000);
  expect(await row.evaluate((node) => node.scrollLeft)).toBe(manualPosition);
  const bounds = await progress.evaluate((node) => {
    const bar = node.getBoundingClientRect();
    const card = node.closest("article")!;
    const footer = card.querySelector("[data-prayer-footer]")!.getBoundingClientRect();
    const text = card.querySelector("[data-prayer-detail]")!.getBoundingClientRect();
    return {
      outsideButton: !node.closest("button"),
      gapAboveFooter: footer.top - bar.bottom,
      gapBelowText: bar.top - text.bottom,
    };
  });
  expect(bounds.outsideButton).toBe(true);
  expect(bounds.gapAboveFooter).toBeGreaterThanOrEqual(2);
  expect(bounds.gapBelowText).toBeGreaterThanOrEqual(2);
});

for (const width of [390, 1440]) {
  for (const [scene, date] of [
    ["morning", "2026-10-14T08:00:00+03:00"],
    ["evening", "2026-10-14T18:00:00+03:00"],
    ["sleep", "2026-10-14T23:00:00+03:00"],
    ["friday", "2026-10-16T12:00:00+03:00"],
  ]) {
    test(`Home glass reveals ${scene} scenery at ${width}px`, async ({ page }, testInfo) => {
      await page.clock.setFixedTime(new Date(date!));
      await page.setViewportSize({ width, height: 1000 });
      await page.goto("/#/home");
      const sceneWindow = page.getByTestId("time-of-day-scene-window");
      const photo = sceneWindow.locator("img");
      await expect(photo).toHaveCSS("opacity", "1");
      await expect(photo).toHaveJSProperty("complete", true);
      await expect(photo).toHaveAttribute("src", new RegExp(`/${scene}/`));
      const standard = page
        .getByTestId("prayer-tracker-cards")
        .locator('article:not([data-prayer-state="next"])')
        .first();
      await expect(standard).toHaveCSS("background-color", "rgba(15, 23, 42, 0.2)");
      await expect(standard).toHaveCSS("backdrop-filter", "blur(12px) saturate(1.15)");
      await expect(standard).toHaveCSS("border-top-color", "rgba(255, 255, 255, 0.18)");
      expect(await standard.evaluate((node) => getComputedStyle(node).boxShadow)).toContain("0px 8px 24px");
      await expect(page.getByTestId("home-daily-evidence")).toHaveCSS("background-color", "rgba(15, 23, 42, 0.32)");
      const header = page.getByTestId("home-utility-header");
      await expect(header).toHaveCSS("background-color", "rgba(15, 23, 42, 0.28)");
      await page.screenshot({ path: testInfo.outputPath(`${scene}-${width}.png`), scale: "css" });
      // Scroll-edge contrast changes without adding a second blurred layer.
      const region = page.locator('[role="region"]').filter({ has: header });
      await region.evaluate((node) => {
        node.scrollTop = 300;
      });
      await expect(header).toHaveAttribute("data-scrolled", "true");
      await expect(header).toHaveCSS("background-color", "rgba(15, 23, 42, 0.48)");
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
      const axe = await new AxeBuilder({ page }).include("#main-content").analyze();
      expect(axe.violations).toEqual([]);
    });
  }
}

test("Home glass respects live system preference and high contrast without changing saved appearance", async ({
  page,
}) => {
  await page.goto("/#/home");
  const card = page.getByTestId("prayer-tracker-cards").locator("article").first();
  await expect(card).toHaveCSS("background-color", "rgba(15, 23, 42, 0.2)");
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-transparency", value: "reduce" }],
  });
  await expect(card).toHaveCSS("background-color", "rgb(2, 6, 23)");
  await expect(card).toHaveCSS("backdrop-filter", "none");
  await cdp.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-transparency", value: "no-preference" }],
  });
  await expect(card).toHaveCSS("background-color", "rgba(15, 23, 42, 0.2)");
  await page.locator("html").evaluate((node) => node.classList.add("high-contrast"));
  await expect(card).toHaveCSS("background-color", "rgb(2, 6, 23)");
  await expect(card).toHaveCSS("backdrop-filter", "none");
});
