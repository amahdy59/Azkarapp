import { fixtureReminderCatalogue } from "./fixtures/reminderCatalogue";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => fixtureReminderCatalogue(page));
import { getPrayerTimeline } from "../src/app/prayerTimeline";
import { DEFAULT_LOCATION } from "../src/app/content/prayerCalculation";
import { locationTime } from "../src/app/content/locationTime";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";

const reminderManifest = JSON.parse(readFileSync("src/app/content/homeReminderManifest.json", "utf8")) as {
  url: string;
};

// Stop a test-owned origin to exercise real SW/cache fallback in every engine.
// Pinned WebKit's offline flag rejects even literal service-worker responses:
// https://github.com/microsoft/playwright/issues/42775
async function startOutageOrigin(upstream: string) {
  const server = createServer(async (request, response) => {
    try {
      const result = await fetch(new URL(request.url ?? "/", upstream));
      response.writeHead(result.status, {
        "Content-Type": result.headers.get("content-type") ?? "application/octet-stream",
        "Cache-Control": "no-store",
      });
      response.end(Buffer.from(await result.arrayBuffer()));
    } catch {
      response.writeHead(502).end();
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    url: `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
    stop: () =>
      new Promise<void>((resolve, reject) => {
        if (!server.listening) return resolve();
        server.close((error) => (error ? reject(error) : resolve()));
        server.closeAllConnections();
      }),
  };
}

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
    await expect(card.getByTestId("daily-evidence-source")).toHaveAttribute("href", "https://sunnah.com/tirmidhi:747");
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

test("authenticated extension is cached before its first offline use @cross-browser", async ({ page, baseURL }) => {
  const origin = await startOutageOrigin(baseURL!);
  // Exact local package fixture; the uploader verifies live R2 bytes and CORS.
  await page.route(reminderManifest.url, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/octet-stream",
      headers: { "Access-Control-Allow-Origin": origin.url },
      body: readFileSync("src/app/content/home-reminder-readings.bin"),
    }),
  );
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({ settings: { language: "en", reduceMotion: true }, profile: { isGuest: true } }),
    );
  });
  // Install at an immediate prayer moment before the optional evidence loader runs.
  await page.clock.setFixedTime(new Date("2026-10-14T12:45:00+03:00"));
  await page.goto(origin.url);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect
    .poll(() =>
      page.evaluate(async (catalogueUrl) => {
        const cache = await caches.open("azkar-home-reminders-v1");
        return Boolean(await cache.match(catalogueUrl));
      }, reminderManifest.url),
    )
    .toBe(true);
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await origin.stop();
  await page.route(/^https:\/\//, (route) => route.abort("failed"));
  try {
    await page.clock.setFixedTime(advanceFastingTime("2026-10-14"));
    await page.reload();
    const card = page.getByTestId("home-daily-evidence");
    await expect(card).toHaveAttribute("data-evidence-id", "tirmidhi:747");
    await expect(card.getByTestId("daily-evidence-source")).toHaveAttribute("href", "https://sunnah.com/tirmidhi:747");
    const meaning = card.getByTestId("daily-evidence-meaning");
    await meaning.locator("summary").click();
    await expect(meaning).toHaveAttribute("open");
    await expect(meaning.locator("p")).not.toBeEmpty();
    await card.getByTestId("daily-evidence-refresh").click();
    await expect(card).not.toHaveAttribute("data-evidence-id", "tirmidhi:747");
  } finally {
    await origin.stop();
  }
});

test("R2 unavailability leaves core install and offline reading usable @cross-browser", async ({ page, baseURL }) => {
  const origin = await startOutageOrigin(baseURL!);
  await page.route(reminderManifest.url, (route) => route.abort("failed"));
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({ settings: { language: "en", reduceMotion: true }, profile: { isGuest: true } }),
    );
  });
  await page.goto(origin.url);
  await expect(page.getByTestId("home-hero")).toBeVisible();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await origin.stop();
  await page.route(/^https:\/\//, (route) => route.abort("failed"));
  try {
    await page.getByTestId("nav-azkar").click();
    await page.getByTestId("category-card-morning").click();
    await expect(page.getByTestId("reader-screen")).toBeVisible();
    await expect(page.getByTestId("counter-surface")).toBeVisible();
  } finally {
    await origin.stop();
  }
});

for (const language of ["ar", "en"] as const) {
  test(`full reminder and independent meaning disclosure ${language} @cross-browser`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: language === "ar" ? 390 : 1440, height: 950 });
    await page.clock.setFixedTime(new Date("2026-10-14T22:00:00+03:00"));
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language, reduceMotion: true },
          profile: { isGuest: true },
        }),
      );
    }, language);
    await page.goto("/#/home");
    const card = page.getByTestId("home-daily-evidence");
    await expect(card).toBeVisible();
    await expect(card).toHaveAttribute("data-evidence-id", /.+/);
    for (let attempt = 0; attempt < 12 && (await card.getAttribute("data-evidence-id")) !== "H16"; attempt++) {
      const previous = await card.getAttribute("data-evidence-id");
      await card.getByTestId("daily-evidence-refresh").click();
      await expect
        .poll(async () => {
          const current = await card.getAttribute("data-evidence-id");
          return Boolean(current && current !== previous);
        })
        .toBe(true);
    }
    await expect(card).toHaveAttribute("data-evidence-id", "H16");
    const text = card.getByTestId("daily-evidence-hadith");
    const fullText = await text.textContent();
    expect(fullText!.length).toBeGreaterThan(1500);
    const expand = card.getByTestId("daily-evidence-expand");
    const meaning = card.getByTestId("daily-evidence-meaning");
    await expect(expand).toHaveAttribute("aria-expanded", "false");
    await expect(meaning).not.toHaveAttribute("open");
    const geometry = await text.evaluate((node) => ({
      height: node.getBoundingClientRect().height,
      lineHeight: Number.parseFloat(getComputedStyle(node).lineHeight),
      scrollHeight: node.scrollHeight,
      clamp: getComputedStyle(node).webkitLineClamp,
    }));
    expect(geometry.clamp).toBe("4");
    expect(geometry.height).toBeLessThanOrEqual(geometry.lineHeight * 4 + 2);
    expect(geometry.scrollHeight).toBeGreaterThan(geometry.height);
    await card.scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath(`reminder-collapsed-${language}.png`), scale: "css" });

    await meaning.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(meaning).toHaveAttribute("open");
    await expect(expand).toHaveAttribute("aria-expanded", "false");
    await expect(meaning.locator("a")).toHaveAttribute("href", "https://sunnah.com/bukhari:2311");
    await expand.focus();
    await page.keyboard.press("Enter");
    await expect(expand).toHaveAttribute("aria-expanded", "true");
    await expect(meaning).toHaveAttribute("open");
    await expect(text).toHaveText(fullText!);
    expect(await text.evaluate((node) => node.getBoundingClientRect().height)).toBeGreaterThan(geometry.height);
    await page.screenshot({ path: testInfo.outputPath(`reminder-expanded-${language}.png`), scale: "css" });
    await page.setViewportSize({ width: language === "ar" ? 1440 : 320, height: 950 });
    await expect(text).toHaveText(fullText!);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.clock.setFixedTime(new Date("2026-10-15T12:45:00+03:00"));
    await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
    await expect(card).toHaveAttribute("data-evidence-id", "H16");
    await expand.click();
    await expect(meaning).toHaveAttribute("open");
    await meaning.locator("summary").click();
    await meaning.locator("summary").blur();
    await expect(card).not.toHaveAttribute("data-evidence-id", "H16");
    expect(
      (await new AxeBuilder({ page }).include('[data-testid="home-daily-evidence"]').analyze()).violations,
    ).toEqual([]);
  });
}
