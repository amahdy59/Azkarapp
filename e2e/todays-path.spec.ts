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
