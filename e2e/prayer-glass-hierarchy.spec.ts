import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

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
        await expect(card).toHaveCSS("backdrop-filter", "blur(16px) saturate(1.35)");
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
      await expect(current.locator(".home-prayer-status-pill")).toContainText(language === "ar" ? "الآن" : "Now");
      await expect(next.getByRole("progressbar")).toHaveCount(1);
      const sizes = await row.locator("article").evaluateAll((nodes) =>
        nodes.map((n) => {
          const box = n.getBoundingClientRect();
          const time = n.querySelector('[id^="prayer-summary-time-"]')!;
          const pill = n.querySelector(".home-prayer-status-pill")!;
          return {
            width: box.width,
            height: box.height,
            timeFits: time.scrollWidth <= time.clientWidth + 1,
            pillFits: pill.scrollWidth <= pill.clientWidth + 1,
          };
        }),
      );
      expect(
        sizes.every((s) => s.width >= 130 && s.timeFits && s.pillFits),
        JSON.stringify(sizes),
      ).toBe(true);
      expect(Math.max(...sizes.map((s) => s.height)) - Math.min(...sizes.map((s) => s.height))).toBeLessThanOrEqual(1);
      if (width === 480) expect(sizes[0]!.width * 3 + 16).toBeLessThanOrEqual(await row.evaluate((n) => n.clientWidth));
      await page.screenshot({ path: testInfo.outputPath("prayer-hierarchy.png"), scale: "css" });
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
  await expect(row.locator("article").first()).toHaveAttribute("data-prayer", "isha");
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
