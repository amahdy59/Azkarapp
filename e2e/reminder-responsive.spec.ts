import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { fixtureReminderCatalogue } from "./fixtures/reminderCatalogue";

test.use({ serviceWorkers: "block" });

const appearances = [
  { name: "light-solid", themeMode: "light", homeMaterial: "solid", highContrast: false, reduceTransparency: false },
  { name: "dark-glass", themeMode: "dark", homeMaterial: "glass", highContrast: false, reduceTransparency: false },
  {
    name: "midnight-glass",
    themeMode: "midnight",
    homeMaterial: "glass",
    highContrast: false,
    reduceTransparency: false,
  },
  { name: "contrast", themeMode: "light", homeMaterial: "glass", highContrast: true, reduceTransparency: false },
  { name: "opaque", themeMode: "dark", homeMaterial: "glass", highContrast: false, reduceTransparency: true },
];

for (const language of ["ar", "en"] as const) {
  for (const mode of appearances) {
    test(`Relevant now reading and actions reflow across devices in ${language} ${mode.name} @cross-browser`, async ({
      page,
    }, info) => {
      await fixtureReminderCatalogue(page);
      await page.setViewportSize({ width: 390, height: 844 });
      await page.clock.setFixedTime(new Date("2026-11-01T13:31:00+02:00"));
      await page.addInitScript(
        ({ language, mode }) => {
          localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
          localStorage.setItem(
            "azkarapp.state.v1",
            JSON.stringify({ settings: { language, reduceMotion: true, ...mode }, profile: { isGuest: true } }),
          );
        },
        { language, mode },
      );
      await page.goto("/#/home");
      await expect(page.locator("html")).toHaveClass(new RegExp(`theme-${mode.themeMode}`));
      const card = page.getByTestId("home-daily-evidence");
      await expect(card.getByTestId("daily-evidence-hadith")).not.toBeEmpty();
      const identity = await card.getAttribute("data-evidence-id");
      for (const viewport of [
        { width: 390, height: 844, scale: 100 },
        { width: 320, height: 700, scale: 200 },
        { width: 834, height: 1112, scale: 100 },
        { width: 1440, height: 900, scale: 100 },
      ]) {
        await page.setViewportSize(viewport);
        await page.locator("html").evaluate((node, scale) => {
          node.style.fontSize = `${scale}%`;
        }, viewport.scale);
        await expect(card).toHaveAttribute("data-evidence-id", identity!);
        expect(await card.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        for (const action of await card.locator("button, summary, a").all()) {
          if (!(await action.isVisible())) continue;
          const box = (await action.boundingBox())!;
          // Firefox can report 43.9999847 for a computed 44px target.
          expect(Math.round(box.height * 100) / 100).toBeGreaterThanOrEqual(44);
          await action.focus();
          await action.scrollIntoViewIfNeeded();
          await expect(action).toBeInViewport();
        }
        await card.scrollIntoViewIfNeeded();
        await page.screenshot({
          path: info.outputPath(
            `reminder-${language}-${mode.themeMode}-${mode.highContrast ? "contrast" : mode.reduceTransparency ? "opaque" : mode.homeMaterial}-${viewport.width}-${viewport.scale}.png`,
          ),
        });
      }
      expect(
        (await new AxeBuilder({ page }).include('[data-testid="home-daily-evidence"]').analyze()).violations,
      ).toEqual([]);
      const meaning = card.getByTestId("daily-evidence-meaning");
      await meaning.locator("summary").focus();
      await page.keyboard.press("Enter");
      await expect(meaning).toHaveAttribute("open");
      await expect(meaning.locator("p")).not.toBeEmpty();
      await card.getByTestId("daily-evidence-refresh").click();
      await expect(card).not.toHaveAttribute("data-evidence-id", identity!);
    });
  }
}

test("Relevant now recovers after a failed first request without reloading or refetching each minute @cross-browser", async ({
  page,
}) => {
  const manifest = JSON.parse(readFileSync("src/app/content/homeReminderManifest.json", "utf8")) as { url: string };
  const bytes = readFileSync("src/app/content/home-reminder-readings.bin");
  let requests = 0;
  await page.route(manifest.url, (route) => {
    requests++;
    return requests === 1
      ? route.fulfill({ status: 503, body: "Unavailable" })
      : route.fulfill({ body: bytes, contentType: "application/octet-stream" });
  });
  await page.clock.install({ time: new Date("2026-11-01T13:31:00+02:00") });
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({ settings: { language: "ar", reduceMotion: true }, profile: { isGuest: true } }),
    );
  });
  await page.goto("/#/home");
  await expect.poll(() => requests).toBe(1);
  await expect(page.getByTestId("home-daily-evidence")).toBeHidden();
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
  const card = page.getByTestId("home-daily-evidence");
  await expect(card.getByTestId("daily-evidence-hadith")).not.toBeEmpty();
  expect(requests).toBe(2);
  await page.clock.fastForward(2 * 60_000);
  await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
  await expect(card).toBeVisible();
  expect(requests).toBe(2);
});
