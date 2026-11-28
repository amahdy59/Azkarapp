import { expect, test } from "@playwright/test";
import { getAzkarForMode } from "../src/app/content/azkar";
import { startOutageOrigin } from "./helpers/outage-origin";

for (const language of ["ar", "en"] as const) {
  test(`first final count opens the completion summary in ${language} @cross-browser`, async ({
    page,
    baseURL,
  }, info) => {
    await page.setViewportSize({ width: 390, height: 844 });
    // A stopped test-owned origin proves actual cache recovery. Playwright's
    // context.setOffline can bypass the service worker for cold module loads
    // in WebKit (internal-error responses), rather than simulating an outage.
    const origin = await startOutageOrigin(baseURL!);
    try {
      const items = getAzkarForMode("home", "complete");
      await page.addInitScript(
        ({ language, completed }) => {
          if (localStorage.getItem("azkarapp.state.v1")) return;
          localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
          localStorage.setItem(
            "azkarapp.state.v1",
            JSON.stringify({
              settings: { language, reduceMotion: true, hapticFeedback: false },
              profile: { isGuest: true },
              completed: { home: completed },
            }),
          );
        },
        { language, completed: items.slice(0, -1).map((item) => item.id) },
      );
      await page.goto(`${origin.url}/#/azkar/home/${items.length}`, { waitUntil: "domcontentloaded" });
      await page.evaluate(async () => navigator.serviceWorker.ready);
      await page.reload({ waitUntil: "domcontentloaded" });
      await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
      await expect(page.getByTestId("counter-surface")).toBeVisible();
      await origin.stop();
      await page.getByTestId("counter-surface").click();
      await expect(
        page.getByRole("heading", {
          name: language === "ar" ? "أكملت أذكار المنزل" : "You completed Home",
          level: 1,
        }),
      ).toBeVisible();
      await expect(page.getByTestId("completion-reflection-source")).toBeVisible();
      await expect(page.getByTestId("completion-reflection-text")).not.toContainText(/Loading|جارٍ التحميل/u);
      const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1") ?? "{}"));
      expect(saved.completed.home).toHaveLength(items.length);
      expect(saved.sessions.filter((session: { category: string }) => session.category === "home")).toHaveLength(1);
      await expect(page.getByRole("button", { name: language === "ar" ? "تم" : "Done", exact: true })).toBeVisible();
      const completion = page.getByTestId("completion-screen");
      expect(await completion.evaluate((node) => node.scrollHeight - node.clientHeight)).toBeLessThanOrEqual(1);
      for (const action of await page.getByTestId("completion-actions").getByRole("button").all()) {
        const rect = (await action.boundingBox())!;
        expect(rect.y + rect.height).toBeLessThanOrEqual(844);
      }
      await page.screenshot({ path: info.outputPath(`completion-${language}-offline-restart.png`), scale: "css" });
      await page
        .getByRole("button", { name: language === "ar" ? "بدء جلسة جديدة" : "Start new session", exact: true })
        .click();
      await expect(page.getByTestId("reader-screen")).toBeVisible();
      const restarted = await page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1") ?? "{}"));
      expect(restarted.completed.home).toEqual([]);
      expect(restarted.sessions.filter((session: { category: string }) => session.category === "home")).toHaveLength(1);
      await page.reload({ waitUntil: "domcontentloaded" });
      await expect(page.getByTestId("reader-screen")).toBeVisible();
      expect(
        await page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1") ?? "{}").completed.home),
      ).toEqual([]);
    } finally {
      await origin.stop();
    }
  });
}
