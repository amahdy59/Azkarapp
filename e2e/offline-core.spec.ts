import { expect, test } from "@playwright/test";

test("core Reader and Settings are available on a first offline visit after install", async ({
  page,
  context,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop-chromium",
    "Service-worker cache coverage is asserted once in Chromium.",
  );

  await page.addInitScript(() => {
    window.localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    window.localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "en", themeMode: "midnight", reduceMotion: true },
        profile: { displayName: "Guest", isGuest: true },
        completed: { morning: [], evening: [], before_sleep: [] },
        sessions: [],
      }),
    );
  });

  await page.goto("/");
  await expect(page.getByTestId("home-primary-cta")).toBeVisible();
  await page.evaluate(async () => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);

  await context.setOffline(true);
  try {
    await page.getByTestId("nav-azkar").click();
    await page.getByTestId("category-card-morning").click();
    await page.getByRole("button", { name: "Start Session", exact: true }).click();
    const counter = page.getByTestId("counter-surface");
    await expect(counter).toBeVisible();
    await counter.click();
    // The accessible name, not the visible digits. `toContainText("1")` passed
    // on the unclicked "0 / 1" too, so it could not fail for the reason it was
    // written; this asserts the count actually registered offline.
    await expect(counter).toHaveAccessibleName(/Completed\s*1\s*\/\s*1/);

    await page.goto("/");
    await page.getByTestId("nav-settings").click();
    await expect(page.getByRole("heading", { name: "Settings", exact: true })).toBeVisible();
  } finally {
    await context.setOffline(false);
  }
});
