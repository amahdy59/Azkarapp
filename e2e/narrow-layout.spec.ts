import { expect, test, type Page } from "@playwright/test";

async function enterEnglishGuestMode(page: Page) {
  await page.goto("/");
  await page.getByTestId("language-option-en").click();
  await page.getByTestId("confirm-language").click();
  await page.getByTestId("onboarding-get-started").click();
  await page.getByTestId("continue-as-guest").click();
  await expect(page.getByRole("navigation", { name: "Bottom Navigation" })).toBeVisible();
}

async function expectNoHorizontalOverflow(page: Page, screenName: string) {
  await expect
    .poll(
      () =>
        page.evaluate(() => ({
          viewportWidth: document.documentElement.clientWidth,
          documentWidth: document.documentElement.scrollWidth,
          bodyWidth: document.body.scrollWidth,
        })),
      { message: `${screenName} should fit the 320px viewport without horizontal scrolling` },
    )
    .toEqual({ viewportWidth: 320, documentWidth: 320, bodyWidth: 320 });
}

test("core app screens do not overflow a 320px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await enterEnglishGuestMode(page);
  await expectNoHorizontalOverflow(page, "Home");

  await page.getByRole("button", { name: "Azkar", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Azkar Library", exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page, "Azkar Library");

  await page.getByRole("button", { name: /Morning Azkar, \d+ of \d+ complete/ }).click();
  await expect(page.locator("h1", { hasText: "Morning Azkar" })).toBeVisible();
  await expectNoHorizontalOverflow(page, "Category");

  await page.getByRole("button", { name: "Start Session", exact: true }).click();
  await expect(page.getByTestId("reader-screen")).toBeVisible();
  await expectNoHorizontalOverflow(page, "Reader");

  await page.getByRole("button", { name: "Benefit", exact: true }).click();
  await expect(page.getByTestId("reference-sheet")).toBeVisible();
  await expectNoHorizontalOverflow(page, "Benefit sheet");
  await page.getByTestId("reference-sheet").getByRole("button", { name: "Close benefit", exact: true }).click();

  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Settings", exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page, "Settings");
});
