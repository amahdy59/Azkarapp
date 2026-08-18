import { expect, test, type Page } from "@playwright/test";

/** Fresh guest at Home, Arabic, with the prayer tracker on screen. */
async function openHome(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    window.localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "ar", themeMode: "midnight", forceRtl: false, reduceMotion: true },
        profile: { displayName: "Guest", lastPhoneNumber: "", isGuest: true },
        completed: { morning: [], evening: [], before_sleep: [] },
        sessions: [],
      }),
    );
  });
  await page.goto("/#/home");
  await expect(page.getByTestId("prayer-tracker-cards")).toBeVisible();
}

test.describe("after-prayer tracking", () => {
  test("fills the completion circle with the info colour when ticked", async ({ page }) => {
    await openHome(page);

    const circle = page.locator("label:has(#prayer-fajr-mosque) .tracking-check");
    const info = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--info").trim(),
    );
    expect(info).not.toBe("");

    const before = await circle.evaluate((el) => getComputedStyle(el).backgroundColor);

    await page.locator("#prayer-fajr-mosque").check();

    // The state was previously announced but invisible: the circle kept a
    // transparent fill, so "completed" and "not completed" looked identical.
    await expect.poll(async () => circle.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(before);
    await expect(circle).toHaveAttribute("data-checked", "true");

    const filled = await circle.evaluate((el) => ({
      bg: getComputedStyle(el).backgroundColor,
      border: getComputedStyle(el).borderTopColor,
    }));
    expect(filled.bg).toBe(filled.border);
    expect(filled.bg).not.toBe("rgba(0, 0, 0, 0)");
  });

  test("shows the prayer's virtue after recording it at the mosque, and not on undo", async ({ page }) => {
    await openHome(page);
    await page.locator("#prayer-fajr-mosque").check();

    const modal = page.getByTestId("prayer-virtue-modal");
    await expect(modal).toBeVisible();
    await expect(modal.getByTestId("prayer-virtue-item")).toHaveCount(3);
    await expect(modal.getByTestId("prayer-virtue-closing")).toContainText("تَقَبَّلَ اللهُ");

    await page.getByTestId("prayer-virtue-close").click();
    await expect(modal).toBeHidden();

    // Clearing a mistake must stay silent.
    await page.locator("#prayer-fajr-mosque").uncheck();
    await expect(modal).toBeHidden();
  });

  test("shows every prayer on desktop and two with a reveal below it on mobile", async ({ page }) => {
    await openHome(page);
    const cards = page.getByTestId("prayer-tracker-cards").locator("article");

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(cards).toHaveCount(5);
    await expect(page.getByTestId("prayer-show-upcoming")).toHaveCount(0);

    await page.setViewportSize({ width: 375, height: 812 });
    await expect(cards).toHaveCount(2);
    await page.getByTestId("prayer-show-upcoming").click();
    await expect(cards).toHaveCount(5);
  });
});
