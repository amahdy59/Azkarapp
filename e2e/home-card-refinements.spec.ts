import { expect, test } from "@playwright/test";
import { getAzkarForMode } from "../src/app/content/azkar";

for (const language of ["ar", "en"] as const) {
  for (const enlarged of [false, true]) {
    test(`completed Home cards keep their badge clear in ${language}${enlarged ? " enlarged" : ""} @cross-browser`, async ({
      page,
    }, testInfo) => {
      await page.clock.setFixedTime(new Date("2026-10-15T09:00:00+03:00"));
      await page.setViewportSize({ width: enlarged ? 320 : 390, height: 844 });
      await page.addInitScript(
        ({ language, ids }) => {
          localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
          localStorage.setItem(
            "azkarapp.state.v1",
            JSON.stringify({
              settings: { language, reduceMotion: true, themeMode: "midnight" },
              profile: { isGuest: true },
              completed: { morning: ids },
              dailyCompletions: [
                { dayKey: "2026-10-15", category: "morning", timeZone: "Africa/Cairo", completionLevel: "complete" },
              ],
            }),
          );
        },
        { language, ids: getAzkarForMode("morning", "complete").map((zikr) => zikr.id) },
      );
      await page.goto("/#/home");
      if (enlarged) await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
      const card = page.locator('[data-category="morning"][data-testid="wird-category-card"]');
      await expect(card).toHaveAttribute("data-complete", "true");
      // Read relative geometry in one frame: optional Home content can settle between protocol calls.
      const geometry = await card.evaluate((node) => {
        const card = node.getBoundingClientRect();
        const badge = node.querySelector(".home-wird-completed-badge")!.getBoundingClientRect();
        const text = node.querySelector(".home-wird-caption > span")!.getBoundingClientRect();
        return {
          top: badge.top - card.top,
          side: getComputedStyle(node).direction === "rtl" ? badge.left - card.left : card.right - badge.right,
          textClearance: text.top - badge.bottom,
        };
      });
      expect(geometry.top).toBeLessThanOrEqual(16);
      expect(geometry.side).toBeLessThanOrEqual(16);
      expect(geometry.textClearance).toBeGreaterThanOrEqual(0);
      await expect(card).toHaveAccessibleName(/(مكتملة|Completed)/);
      const shortcuts = page.getByTestId("situational-shortcuts");
      await shortcuts.getByRole("button").click();
      if (language === "ar") await expect(shortcuts.getByRole("link", { name: "أذكار الطعام" })).toBeVisible();
      for (const link of await shortcuts.getByRole("link").all()) {
        const box = (await link.boundingBox())!;
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.width).toBeGreaterThanOrEqual(44);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
      await card.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: testInfo.outputPath(`home-cards-${language}${enlarged ? "-enlarged" : ""}.png`),
        fullPage: true,
      });
    });
  }
}
