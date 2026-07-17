import { expect, test, type Page } from "@playwright/test";

async function enterAsEnglishGuest(page: Page) {
  await page.goto("/");
  await page.getByTestId("language-option-en").click();
  await page.getByTestId("confirm-language").click();
  await page.getByTestId("onboarding-get-started").click();
  await page.getByTestId("continue-as-guest").click();
}

test("Azkar tab opens the library and exposes search", async ({ page }) => {
  await enterAsEnglishGuest(page);

  await page.getByRole("button", { name: "Azkar", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Azkar Library", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Search adhkar and duas", exact: true })).toBeVisible();

  await page.getByRole("button", { name: /Morning Azkar, \d+ of \d+ complete/ }).click();
  await expect(page.locator("h1", { hasText: "Morning Azkar" })).toBeVisible();
  await expect(page.getByText(/\d+ of \d+/).first()).toBeVisible();

  await page.getByRole("button", { name: "Go back", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Azkar Library", exact: true })).toBeVisible();
});

test("saved zikr is visible from the first-class Saved library tab", async ({ page }) => {
  await enterAsEnglishGuest(page);

  await page.getByTestId("home-primary-cta").click();
  await page.getByRole("button", { name: "Save zikr", exact: true }).click();
  await page.getByRole("button", { name: "Go back", exact: true }).click();
  await page.getByRole("button", { name: "Azkar", exact: true }).click();
  await page.getByRole("tab", { name: /Saved/ }).click();

  await expect(page.getByRole("heading", { name: "Saved remembrance", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Azkar:/ }).first()).toBeVisible();
});
