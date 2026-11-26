import { assertPrayerOverview } from "./helpers/home-overview";
import { expect, test } from "@playwright/test";

for (const [language, width] of [
  ["ar", 820],
  ["en", 1440],
] as const) {
  test(`Home compact tiles stay stable through scroll handoff ${language} ${width} @cross-browser`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.clock.setFixedTime(new Date("2026-10-17T08:00:00+03:00"));
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: {
            language,
            themeMode: "midnight",
            appMaterial: "glass",
            homeMaterial: "glass",
            reduceMotion: false,
          },
          profile: { isGuest: true },
        }),
      );
    }, language);
    await page.goto("/#/home");
    const sticky = page.getByTestId("home-sticky-prayers");
    const card = page.getByTestId("prayer-card-dhuhr");
    await expect(card).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await expect
      .poll(() =>
        page
          .getByTestId("time-of-day-scene-window")
          .last()
          .locator("img")
          .evaluate((image) => image.complete && image.naturalWidth > 0),
      )
      .toBe(true);
    const capture = async (state: string) =>
      page.screenshot({
        path: `output/playwright/glass-refinement/home-motion/${testInfo.project.name}/${language}-${width}-${state}.png`,
        scale: "css",
      });
    const expanded = await assertPrayerOverview(page);
    await capture("expanded");
    await sticky.locator("..").evaluate((node) => {
      node.scrollTop = 150;
    });
    const toggle = page.getByTestId("home-prayer-disclosure");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect
      .poll(() =>
        sticky.evaluate(
          (node) => node.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length,
        ),
      )
      .toBe(0);
    const scrolled = await assertPrayerOverview(page);
    for (const [index, cell] of scrolled.entries()) {
      expect(cell.width).toBeCloseTo(expanded[index].width, 0);
      expect(cell.height).toBeCloseTo(expanded[index].height, 0);
    }
    await expect(page.getByTestId("home-all-prayers-row")).toHaveCSS("animation-name", "none");
    await expect(sticky).toHaveCSS("backdrop-filter", "blur(32px) saturate(1.35)");
    await capture("scrolled");
    const timings = page.locator("#home-prayer-timings");
    await expect(timings).toHaveCSS("transition-duration", "0.22s, 0.22s, 0s");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(timings).toBeHidden();
    await toggle.click();
    await expect(timings).toBeVisible();
    for (const preference of ["app", "os"] as const) {
      if (preference === "app") await page.locator("html").evaluate((node) => node.classList.add("reduce-motion"));
      else {
        await page.locator("html").evaluate((node) => node.classList.remove("reduce-motion"));
        await page.emulateMedia({ reducedMotion: "reduce" });
      }
      for (const expanded of [false, true]) {
        await toggle.click();
        await expect(toggle).toHaveAttribute("aria-expanded", String(expanded));
        await expect(timings).toHaveCSS("transition-duration", "0s");
        await expect
          .poll(() =>
            timings.evaluate(
              (node) => node.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length,
            ),
          )
          .toBe(0);
        if (expanded) await assertPrayerOverview(page);
      }
    }
    await page.locator("html").evaluate((node) => {
      node.style.fontSize = "32px";
    });
    await assertPrayerOverview(page);
    await capture("large-text");
  });
}
