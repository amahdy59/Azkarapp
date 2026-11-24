import { assertPrayerOverview } from "./helpers/home-overview";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { t } from "../src/app/i18n";

for (const language of ["ar", "en"] as const) {
  for (const width of [390, 480, 1440]) {
    test(`frosted prayer hierarchy ${language} ${width} @cross-browser`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.clock.setFixedTime(new Date("2026-10-17T14:00:00+03:00"));
      await page.addInitScript((language) => {
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: {
              language,
              appMaterial: "glass",
              homeMaterial: "glass",
              themeMode: "midnight",
              reduceMotion: true,
            },
            profile: { isGuest: true },
          }),
        );
      }, language);
      await page.goto("/#/home");
      const row = page.getByTestId("home-all-prayers-row");
      const current = row.locator('[data-prayer-state="current"]');
      const next = row.locator('[data-prayer-state="next"]');
      for (const card of [current, next]) {
        await expect(card).toHaveCSS("backdrop-filter", width >= 1200 ? "blur(22px) saturate(1.35)" : "none");
        await expect
          .poll(() =>
            card.evaluate((n) => {
              const box = n.getBoundingClientRect();
              const frame = n.parentElement!.getBoundingClientRect();
              return box.left >= frame.left - 1 && box.right <= frame.right + 1;
            }),
          )
          .toBe(true);
      }
      const summary = page.getByTestId("home-prayer-interval");
      await expect(summary.locator('[data-prayer-summary-state="current"] .home-prayer-summary-label')).toHaveText(
        t(language, "prayerTracking.nowPill"),
      );
      await expect(current).toHaveAttribute("aria-current", "step");
      await expect(summary).toContainText(language === "ar" ? "متبقٍ" : "remaining");
      await expect(next.getByRole("progressbar")).toHaveCount(0);
      await page.evaluate(() => document.fonts.ready);
      const sizes = await assertPrayerOverview(page);
      expect(Math.max(...sizes.map((s) => s.height))).toBeLessThanOrEqual(width >= 1200 ? 160 : 140);
      if (width < 1200) {
        await expect(page.getByTestId("prayer-tracker-cards")).toHaveCSS(
          "backdrop-filter",
          "blur(22px) saturate(1.35)",
        );
      }
      if (width === 1440) {
        const grid = (await page.getByTestId("home-context-grid").boundingBox())!;
        const summary = (await row.boundingBox())!;
        expect(summary.width).toBeCloseTo(grid.width, 0);
        expect(summary.x).toBeCloseTo(grid.x, 0);
        const icon = current.locator("[data-prayer-icon]");
        await expect(icon).toHaveCSS("width", "40px");
      }
      if (width === 480) expect(sizes[0]!.width * 3 + 16).toBeLessThanOrEqual(await row.evaluate((n) => n.clientWidth));
      await page.screenshot({ path: testInfo.outputPath("prayer-hierarchy.png"), scale: "css" });
      await row.screenshot({
        path: `output/playwright/compact-prayer-cards/${testInfo.project.name}-${language}-${width}.png`,
        scale: "css",
      });
      expect(
        (await new AxeBuilder({ page }).include('[data-testid="home-prayer-strip"]').analyze()).violations,
      ).toEqual([]);
      if (width < 600) {
        const last = row.locator("article").last();
        await last.scrollIntoViewIfNeeded();
        const manual = await row.evaluate((n) => n.scrollLeft);
        await page.clock.setFixedTime(new Date("2026-10-17T14:01:00+03:00"));
        await expect.poll(() => row.evaluate((n) => n.scrollLeft)).toBe(manual);
      }
      await page.locator("html").evaluate((n) => {
        n.style.fontSize = "32px";
      });
      await next.scrollIntoViewIfNeeded();
      expect(await next.evaluate((n) => n.scrollWidth <= n.clientWidth + 1)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath("prayer-hierarchy-enlarged.png"), scale: "css" });
      await page.locator("html").evaluate((n) => {
        n.style.fontSize = "";
      });
      await page.locator(".home-content-scroll").evaluate((node) => {
        node.scrollTop = 0;
      });
      await expect(page.getByTestId("home-prayer-strip")).not.toHaveAttribute("inert");
      await current.getByRole("button").click();
      const panel = page.getByTestId("home-prayer-moment");
      await expect(panel.getByTestId("prayer-open-adhkar")).toBeVisible();
      if (width < 600) {
        const action = (await panel.getByTestId("prayer-open-adhkar").boundingBox())!;
        const evidence = (await panel.getByTestId("prayer-moment-virtue").boundingBox())!;
        expect(action.y + action.height).toBeLessThanOrEqual(evidence.y);
      }
      await panel.screenshot({ path: testInfo.outputPath("expanded-prayer.png"), scale: "css" });
    });
  }
}

test("overnight current and next stay adjacent in the initial phone viewport @cross-browser", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.clock.setFixedTime(new Date("2026-10-17T21:00:00+03:00"));
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "en", themeMode: "midnight", homeMaterial: "glass", reduceMotion: true },
        profile: { isGuest: true },
      }),
    );
  });
  await page.goto("/#/home");
  const row = page.getByTestId("home-all-prayers-row");
  await expect(row.locator("article").first()).toHaveAttribute("data-prayer", "fajr");
  await expect(row.locator('[data-prayer-state="current"]')).toHaveAttribute("data-prayer", "isha");
  await expect(row.locator('[data-prayer-state="next"]')).toHaveAttribute("data-prayer", "fajr");
  for (const state of ["current", "next"]) {
    const card = row.locator(`[data-prayer-state="${state}"]`);
    await expect
      .poll(() =>
        card.evaluate((n) => {
          const box = n.getBoundingClientRect();
          const frame = n.parentElement!.getBoundingClientRect();
          return box.left >= frame.left - 1 && box.right <= frame.right + 1;
        }),
      )
      .toBe(true);
  }
});
