import { expect, test } from "@playwright/test";
import { getAzkarForMode } from "../src/app/content/azkar";

for (const language of ["ar", "en"] as const) {
  test(`three years of history survive immediate counter saves and reload in ${language} @cross-browser`, async ({
    page,
  }, testInfo) => {
    await page.clock.setFixedTime(new Date("2026-10-20T12:00:00+03:00"));
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      if (!localStorage.getItem("azkarapp.state.v1")) {
        const dailyCompletions = Array.from({ length: 1095 }, (_, index) => {
          const date = new Date(Date.UTC(2026, 9, 19 - index));
          return ["morning", "evening", "before_sleep"].map((category) => ({
            dayKey: date.toISOString().slice(0, 10),
            category,
            timeZone: "Africa/Cairo",
          }));
        }).flat();
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: { language, reduceMotion: true },
            profile: { isGuest: true },
            dailyCompletions,
            savedZikrIds: ["m-hm-75"],
            khatmahPage: 51,
          }),
        );
      }
    }, language);
    const id = "e-hm-96";
    const position = getAzkarForMode("evening", "complete").findIndex((item) => item.id === id) + 1;
    await page.goto(`/#/azkar/evening/${position}?mode=complete`);
    const counter = page.getByTestId("counter-surface");
    await expect(counter).toBeVisible();
    const before = await page.evaluate(() => {
      const snapshot = JSON.parse(localStorage.getItem("azkarapp.state.v1")!);
      return {
        dailyCompletions: snapshot.dailyCompletions,
        savedZikrIds: snapshot.savedZikrIds,
        khatmahPage: snapshot.khatmahPage,
      };
    });
    expect(before.dailyCompletions).toHaveLength(3285);
    await page.evaluate(() => {
      const block = (event: Event) => event.stopImmediatePropagation();
      window.addEventListener("pagehide", block, { capture: true });
      window.addEventListener("beforeunload", block, { capture: true });
      document.addEventListener("visibilitychange", block, { capture: true });
    });
    for (let count = 1; count <= 3; count++) {
      await counter.click();
      await expect
        .poll(() =>
          page.evaluate((id) => JSON.parse(localStorage.getItem("azkarapp.state.v1")!).partialZikrCounts[id], id),
        )
        .toBe(count);
    }
    await page.reload();
    await expect(page.getByTestId("reader-screen")).toHaveAttribute("data-zikr-id", id);
    const after = await page.evaluate(() => {
      const snapshot = JSON.parse(localStorage.getItem("azkarapp.state.v1")!);
      return {
        dailyCompletions: snapshot.dailyCompletions,
        savedZikrIds: snapshot.savedZikrIds,
        khatmahPage: snapshot.khatmahPage,
        count: snapshot.partialZikrCounts["e-hm-96"],
      };
    });
    expect(after.count).toBe(3);
    expect({
      dailyCompletions: after.dailyCompletions,
      savedZikrIds: after.savedZikrIds,
      khatmahPage: after.khatmahPage,
    }).toEqual(before);
    await page.screenshot({ path: testInfo.outputPath(`history-counter-${language}.png`) });
  });
}
