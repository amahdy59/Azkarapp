import { expect, test, type Page } from "@playwright/test";

/**
 * The streak and palm indicators open the day's path.
 *
 * The two numbers are two readings of the same day, so they are one control
 * rather than two decorated spans — reachable by keyboard and announcing what
 * it opens.
 */
async function openHome(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    window.localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "en", themeMode: "midnight" },
        profile: { displayName: "Guest", lastPhoneNumber: "", isGuest: true },
        completed: { morning: [], evening: [], before_sleep: [] },
        sessions: [],
      }),
    );
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.getByRole("navigation").first()).toBeVisible({ timeout: 15000 });
}

test("the indicators open today's path", async ({ page }) => {
  await openHome(page);
  const indicators = page.getByTestId("home-header-routine-summary");
  await expect(indicators).toBeVisible();

  await indicators.click();
  const sheet = page.getByTestId("todays-path-sheet");
  await expect(sheet).toBeVisible();

  // The three summaries follow the reviewed order and expose their state in
  // text rather than colour.
  await expect(sheet.getByText("Prayer", { exact: true })).toBeVisible();
  await expect(sheet.getByText("0 of 5 recorded · 0 in congregation", { exact: true })).toBeVisible();
  await expect(sheet.getByText("Qur'an wird", { exact: true })).toBeVisible();
  await expect(sheet.getByText("Dhikr", { exact: true })).toBeVisible();
  await expect(sheet.getByText("0 of 3 complete")).toBeVisible();
});

test("a phone keeps the full date and opens palm and streak counts in today's path @cross-browser", async ({
  page,
}) => {
  await openHome(page);
  await page.setViewportSize({ width: 320, height: 740 });
  const date = page.getByTestId("hijri-date");
  await expect(date.locator("time")).toBeVisible();
  expect(await date.evaluate((node) => node.querySelector("time")!.scrollWidth <= node.clientWidth + 1)).toBe(true);
  const path = page.getByTestId("home-header-routine-summary-mobile");
  await expect(path).toBeVisible();
  await expect(path).toHaveAttribute("aria-label", /Today's path.*Enduring Palms.*Consecutive practice days/);
  await expect(path.locator("svg")).toHaveCount(2);
  await path.click();
  const sheet = page.getByTestId("todays-path-sheet");
  await expect(sheet).toBeVisible();
  await expect(sheet).toContainText("Consecutive practice days:");
  await expect(sheet).toContainText("Enduring Palms:");
});

test("the secondary congregation intention can be set from its disclosure", async ({ page }) => {
  await openHome(page);
  await page.getByTestId("home-header-routine-summary").click();
  const sheet = page.getByTestId("todays-path-sheet");

  // The optional congregation intention is configured separately from the
  // prayer record and stays out of the primary summary until requested.
  await sheet.getByText("Adjust congregation intention", { exact: true }).click();

  const three = sheet.getByTestId("mosque-goal-3");
  await expect(three).toHaveAttribute("aria-checked", "false");
  await three.click();
  await expect(three).toHaveAttribute("aria-checked", "true");
});

test("the day's record is explained without loss or faith-scoring language", async ({ page }) => {
  await openHome(page);
  await page.getByTestId("home-header-routine-summary").click();
  const summary = page.getByTestId("todays-path-summary");
  await expect(summary).toBeVisible();

  const text = (await summary.textContent()) ?? "";
  expect(text).toMatch(/what you recorded/i);
  expect(text).toMatch(/does not measure faith or reward/i);
  // Never phrased as failure, loss, or a streak about to die.
  expect(text).not.toMatch(/lost|failed|don't break|dies/i);
});

test("the indicators are reachable by keyboard", async ({ page }) => {
  await openHome(page);
  const indicators = page.getByTestId("home-header-routine-summary");
  await indicators.focus();
  await expect(indicators).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("todays-path-sheet")).toBeVisible();
});
