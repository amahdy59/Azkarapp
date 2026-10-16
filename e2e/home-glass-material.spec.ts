import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { getPrayerTimeline } from "../src/app/prayerTimeline";
import { DEFAULT_LOCATION } from "../src/app/content/prayerCalculation";

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
      insideFooter: bar.top >= footer.top && bar.bottom <= footer.bottom,
      gapBelowText: bar.top - text.bottom,
    };
  });
  expect(bounds.outsideButton).toBe(true);
  expect(bounds.insideFooter).toBe(true);
  expect(bounds.gapBelowText).toBeGreaterThanOrEqual(2);
});

for (const width of [390, 1440]) {
  test(`prayer surface emphasis transfers calmly at ${width}px`, async ({ page }, testInfo) => {
    const boundary = getPrayerTimeline(new Date("2026-10-14T14:00:00+03:00"), DEFAULT_LOCATION).next.at;
    await page.clock.setFixedTime(new Date(boundary - 45 * 60_000));
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/#/home");
    const current = page.getByTestId("prayer-card-dhuhr");
    const next = page.getByTestId("prayer-card-asr");
    const strength = (card: typeof current) =>
      card.evaluate((node) => Number(getComputedStyle(node).getPropertyValue("--prayer-focus")));
    await expect(current).toHaveAttribute("data-prayer-state", "current");
    const originalTextColors = await next
      .locator("h3, p")
      .evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).color));
    for (const [minutes, expectedCurrent, expectedNext] of [
      [45, 1, 0.15],
      [15, 0.75, 0.575],
      [1, 0.5166667, 0.9716667],
    ]) {
      await page.clock.setFixedTime(new Date(boundary - minutes * 60_000));
      await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
      await expect.poll(() => strength(current)).toBeCloseTo(expectedCurrent, 5);
      await expect.poll(() => strength(next)).toBeCloseTo(expectedNext, 5);
      expect(
        await next.locator("h3, p").evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).color)),
      ).toEqual(originalTextColors);
      for (const card of await page.locator('[data-density="summary"]').all()) {
        await expect(card).toHaveCSS("opacity", "1");
        await expect(card).toHaveCSS("filter", "none");
        await expect(card).toHaveCSS("backdrop-filter", "blur(16px) saturate(1.35)");
      }
      const a11y = await new AxeBuilder({ page }).include('[data-testid="home-prayer-strip"]').analyze();
      expect(a11y.violations).toEqual([]);
      await page.screenshot({ path: testInfo.outputPath(`focus-${width}-${minutes}m.png`), scale: "css" });
    }
    await page.clock.setFixedTime(new Date(boundary));
    await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
    await expect(next).toHaveAttribute("data-prayer-state", "current");
    await expect.poll(() => strength(next)).toBe(1);
    await expect(page.getByTestId("prayer-card-maghrib")).toHaveAttribute("data-prayer-state", "next");
    await expect(next.getByRole("progressbar")).toHaveCount(0);
    await expect(page.getByTestId("home-prayer-strip").getByRole("progressbar")).toHaveCount(1);
  });
}

for (const width of [390, 834, 1440]) {
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
      if (scene === "friday") {
        const noon = page.getByTestId("prayer-card-dhuhr");
        await expect(noon.getByRole("heading")).toHaveText("الجمعة");
        await expect(noon.getByRole("button")).toHaveAccessibleName("فتح صلاة الجمعة");
        await expect(noon.locator("[data-prayer-footer]")).toContainText("باقي");
      }
      const standard = page
        .getByTestId("prayer-tracker-cards")
        .locator('article[data-prayer-state="past"], article[data-prayer-state="upcoming"]')
        .first();
      await expect(standard).toHaveCSS("background-color", "rgba(15, 23, 42, 0.2)");
      await expect(standard).toHaveCSS("backdrop-filter", "blur(16px) saturate(1.35)");
      await expect(standard).toHaveCSS("--prayer-focus", "0");
      const quietBorder = await standard.evaluate((node) => getComputedStyle(node).borderTopColor);
      expect(quietBorder).not.toBe("rgba(0, 0, 0, 0)");
      expect(await standard.evaluate((node) => getComputedStyle(node).boxShadow)).toContain("0px 8px 24px");
      // Verify the whole Home material inventory, not just the prayer strip.
      const surfaces = page.locator(".home-photo-canvas .hero-glass.home-glass-surface");
      expect(await surfaces.count()).toBeGreaterThan(10);
      for (const surface of await surfaces.all()) {
        await expect(surface).toHaveCSS("backdrop-filter", "blur(16px) saturate(1.35)");
        const material = await surface.evaluate((node) => {
          const style = getComputedStyle(node);
          return { fill: style.backgroundColor, sheen: style.backgroundImage };
        });
        expect(material.fill).toMatch(/^rgba\(/);
        const peak = Number(material.sheen.match(/rgba\([^)]*,\s*([\d.]+)\)/)?.[1]);
        expect(peak).toBeGreaterThanOrEqual(0.015);
        expect(peak).toBeLessThanOrEqual(0.055);
      }
      await expect(page.locator(".hero-glass .hero-glass")).toHaveCount(0);
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
  const card = page.getByTestId("prayer-tracker-cards").locator('article[data-prayer-state="current"]');
  await expect(card).toHaveCSS("background-color", "rgba(15, 23, 42, 0.2)");
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-transparency", value: "reduce" }],
  });
  await expect(card).toHaveCSS("background-color", "rgb(2, 6, 23)");
  await expect(card).toHaveCSS("backdrop-filter", "none");
  await expect(card).toHaveCSS("box-shadow", "none");
  await cdp.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-transparency", value: "no-preference" }],
  });
  await expect(card).toHaveCSS("background-color", "rgba(15, 23, 42, 0.2)");
  await page.locator("html").evaluate((node) => node.classList.add("high-contrast"));
  await expect(card).toHaveCSS("background-color", "rgb(2, 6, 23)");
  await expect(card).toHaveCSS("backdrop-filter", "none");
  await expect(card).toHaveCSS("box-shadow", "none");
});

for (const themeMode of ["light", "dark", "midnight"]) {
  for (const language of ["ar", "en"]) {
    test(`all Home cards retain glass in ${themeMode}/${language} through responsive resizing`, async ({ page }) => {
      await page.addInitScript(
        ({ themeMode, language }) => {
          localStorage.setItem(
            "azkarapp.state.v1",
            JSON.stringify({ settings: { themeMode, language, reduceMotion: true }, profile: { isGuest: true } }),
          );
        },
        { themeMode, language },
      );
      await page.goto("/#/home");
      for (const width of [320, 390, 834, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        const surfaces = page.locator(".home-photo-canvas .hero-glass.home-glass-surface");
        await expect.poll(() => surfaces.count()).toBeGreaterThan(10);
        for (const surface of await surfaces.all()) {
          await expect(surface).toHaveCSS("backdrop-filter", "blur(16px) saturate(1.35)");
          expect(await surface.evaluate((node) => getComputedStyle(node).backgroundColor)).toMatch(/^rgba\(/);
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
      }
    });
  }
}
