import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const language of ["ar", "en"] as const) {
  test(`Quran wird uses readable tablet and desktop columns in ${language} @cross-browser`, async ({
    page,
  }, testInfo) => {
    await page.clock.setFixedTime(new Date("2026-10-19T13:00:00+03:00"));
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language, reduceMotion: true, themeMode: "midnight" },
          profile: { isGuest: true },
          quranReadingPosition: { page: 42, surahNumber: 2, ayahNumber: 256, juzNumber: 3 },
          quranWirdPlan: { kind: "daily", dailyPages: 4, startedDayKey: "2026-10-01" },
          wirdHistory: {},
        }),
      );
    }, language);
    await page.goto("/#/quran-wird");
    const content = page.getByTestId("quran-wird-content");
    const today = content.locator('section[aria-labelledby="wird-today-title"]');
    const plan = content.locator('section[aria-labelledby="wird-plan-title"]');
    const week = content.locator('section[aria-labelledby="wird-week-title"]');
    await expect(today).toBeVisible();
    for (const width of [390, 834, 1280, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      const todayBox = (await today.boundingBox())!;
      const planBox = (await plan.boundingBox())!;
      if (width === 390) expect(planBox.y).toBeGreaterThan(todayBox.y + todayBox.height);
      else {
        expect(Math.abs(todayBox.y - planBox.y)).toBeLessThanOrEqual(1);
        expect(await content.evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(" ").length)).toBe(2);
        expect(Math.abs(todayBox.x - planBox.x)).toBeGreaterThan(250);
        const first = (await week.getByRole("listitem").first().boundingBox())!;
        const last = (await week.getByRole("listitem").last().boundingBox())!;
        expect(Math.abs(first.y - last.y)).toBeLessThanOrEqual(1);
      }
      expect(await content.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
      await page.screenshot({ path: testInfo.outputPath(`quran-wird-${language}-${width}.png`), fullPage: true });
    }
    await page.setViewportSize({ width: 320, height: 700 });
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    expect(await content.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
    expect((await new AxeBuilder({ page }).include('[data-testid="quran-wird-content"]').analyze()).violations).toEqual(
      [],
    );
    await page.screenshot({ path: testInfo.outputPath(`quran-wird-${language}-320-enlarged.png`), fullPage: true });
  });
}
