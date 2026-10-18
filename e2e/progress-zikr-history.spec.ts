import { expect, test, type Page } from "@playwright/test";
import { getAzkarForMode } from "../src/app/content/azkar";

async function recordFromDirectReader(page: Page) {
  await page.clock.setFixedTime(new Date("2026-10-18T12:00:00+02:00"));
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    if (!localStorage.getItem("azkarapp.state.v1"))
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: {
            language: "en",
            themeMode: "midnight",
            reduceMotion: true,
            progressDayStartHour: 0,
            calendarType: "gregorian",
          },
          profile: { isGuest: true },
          dailyCompletions: [],
        }),
      );
  });
  const index = getAzkarForMode("morning", "complete").findIndex((item) => item.id === "m-hm-77m");
  await page.goto(`/#/azkar/morning/${index + 1}?mode=complete`);
  await expect(page.getByTestId("reader-screen")).toBeVisible();
  const history = () => page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1") ?? "{}").zikrHistory);
  await expect.poll(history).toEqual([
    expect.objectContaining({
      dayKey: "2026-10-18",
      category: "morning",
      completedIds: [],
      offeredIds: expect.arrayContaining(["m-hm-77m"]),
    }),
  ]);
  await page.getByTestId("counter-surface").click();
  await expect.poll(history).toEqual([expect.objectContaining({ completedIds: ["m-hm-77m"] })]);
  await page.reload();
  await expect(page.getByTestId("reader-screen")).toBeVisible();
  await expect.poll(history).toEqual([expect.objectContaining({ completedIds: ["m-hm-77m"] })]);
  return history;
}

test("@cross-browser individual zikr recording survives direct reader entry and reload", async ({ page }) => {
  await recordFromDirectReader(page);
});

// Service-worker automation is supported by Playwright's Chromium engine.
// Keep every cold-offline assertion here; all engines retain the entry/reload
// coverage above. https://playwright.dev/docs/service-workers
test("installed app preserves item records and loads cold Progress offline", async ({ page, context }) => {
  const history = await recordFromDirectReader(page);
  await page.evaluate(async () => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  try {
    await context.setOffline(true);
    await page.goto("/#/progress/month");
    await expect(page.getByTestId("zikr-insights")).toContainText("Patterns appear after three recorded days");
    await expect.poll(history).toEqual([expect.objectContaining({ completedIds: ["m-hm-77m"] })]);
  } finally {
    await context.setOffline(false);
  }
});
