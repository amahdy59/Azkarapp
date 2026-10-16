import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { getPrayerTimeline } from "../src/app/prayerTimeline";
import { DEFAULT_LOCATION } from "../src/app/content/prayerCalculation";
import { locationTime } from "../src/app/content/locationTime";

function advanceFastingTime(day: string) {
  const zone = DEFAULT_LOCATION.timeZone!;
  const calendar = new Date(`${day}T12:00:00`);
  const midday = new Date(locationTime(calendar, "12:00", zone));
  const asr = getPrayerTimeline(midday).prayerTimes.asr;
  return new Date(locationTime(calendar, asr, zone) + 50 * 60_000);
}

for (const language of ["ar", "en"] as const) {
  test(`advance fasting evidence and contextual refresh ${language} @cross-browser`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: language === "ar" ? 390 : 1440, height: 900 });
    await page.clock.setFixedTime(advanceFastingTime("2026-10-14"));
    await page.route("**/v1/visitors", (route) => route.fulfill({ json: { active: 4 } }));
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({ settings: { language, reduceMotion: true }, profile: { isGuest: true } }),
      );
    }, language);
    await page.goto("/#/home");
    const card = page.getByTestId("home-daily-evidence");
    await expect(card).toHaveAttribute("data-evidence-id", "tirmidhi:747");
    await expect(card.getByTestId("daily-evidence-grading")).toContainText(language === "ar" ? "حسن غريب" : "Hasan");
    await expect(card.locator("a")).toHaveAttribute("href", "https://sunnah.com/tirmidhi:747");
    await expect(card.getByTestId("daily-evidence-hadith")).toContainText(
      language === "ar" ? "وَأَنَا صَائِمٌ" : "fasting",
    );
    await card.scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath(`fasting-${language}.png`), scale: "css" });
    await card.getByTestId("daily-evidence-refresh").click();
    await expect(card).not.toHaveAttribute("data-evidence-id", "tirmidhi:747");
    // A late loader or minute tick must not put an obsolete tomorrow card back.
    await page.clock.setFixedTime(advanceFastingTime("2026-10-15"));
    await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
    await expect(card).not.toHaveAttribute("data-evidence-id", "tirmidhi:747");
    await page.clock.setFixedTime(advanceFastingTime("2026-02-25"));
    await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
    await expect(card).not.toHaveAttribute("data-evidence-id", "tirmidhi:747");
    await expect(card.getByTestId("daily-evidence-hadith")).not.toBeEmpty();
    expect(
      (await new AxeBuilder({ page }).include('[data-testid="home-daily-evidence"]').analyze()).violations,
    ).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("authenticated extension is precached before its first offline use", async ({ page, context }) => {
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({ settings: { language: "en", reduceMotion: true }, profile: { isGuest: true } }),
    );
  });
  // Install at an immediate prayer moment before the optional evidence loader runs.
  await page.clock.setFixedTime(new Date("2026-10-14T12:45:00+03:00"));
  await page.goto("/");
  await page.evaluate(() => navigator.serviceWorker.ready);
  const cached = await page.evaluate(async () => {
    const requests = await Promise.all(
      (await caches.keys())
        .filter((key) => key.startsWith("workbox-precache"))
        .map(async (key) => (await (await caches.open(key)).keys()).map((request) => request.url)),
    );
    return requests.flat().some((url) => /authenticatedReminders-.*\.js/.test(url));
  });
  expect(cached).toBe(true);
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await context.setOffline(true);
  try {
    await page.clock.setFixedTime(advanceFastingTime("2026-10-14"));
    await page.reload();
    const card = page.getByTestId("home-daily-evidence");
    await expect(card).toHaveAttribute("data-evidence-id", "tirmidhi:747");
    await expect(card.locator("a")).toHaveAttribute("href", "https://sunnah.com/tirmidhi:747");
    await card.getByTestId("daily-evidence-refresh").click();
    await expect(card).not.toHaveAttribute("data-evidence-id", "tirmidhi:747");
  } finally {
    await context.setOffline(false);
  }
});
