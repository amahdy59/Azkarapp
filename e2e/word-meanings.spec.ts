import { expect, test, type Page } from "@playwright/test";

/**
 * Word meanings step through the passage in place.
 *
 * The stepper is scoped to the mushaf page on screen, which is the passage the
 * reader is actually looking at — not the whole surah.
 */
async function openKahf(page: Page) {
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
  await page.goto("/#/azkar/friday-kahf/1");
  await expect(page.getByTestId("mushaf-pages")).toBeVisible();
}

test.describe("Quran word meanings", () => {
  test("steps from one word to the next without reopening the sheet", async ({ page }) => {
    await openKahf(page);

    const firstPage = page.getByTestId("mushaf-page").first();
    await firstPage.getByTestId("quran-word-help").first().click();
    await expect(page.getByTestId("quran-word-meaning-sheet")).toBeVisible();

    const position = page.getByTestId("word-meaning-position");
    await expect(position).toContainText("١");
    await expect(page.getByTestId("word-meaning-previous")).toBeDisabled();

    const firstWord = await page.getByTestId("quran-word-meaning-entry").first().locator("p").first().textContent();

    await page.getByTestId("word-meaning-next").click();
    await expect(position).toContainText("٢");
    // The sheet stayed open and swapped its content rather than closing.
    await expect(page.getByTestId("quran-word-meaning-sheet")).toBeVisible();
    await expect(page.getByTestId("quran-word-meaning-entry").first().locator("p").first()).not.toHaveText(
      firstWord ?? "",
    );

    await page.getByTestId("word-meaning-previous").click();
    await expect(position).toContainText("١");
    await expect(page.getByTestId("word-meaning-previous")).toBeDisabled();
  });

  test("stops at the last annotated word of the page", async ({ page }) => {
    await openKahf(page);

    const secondPage = page.getByTestId("mushaf-page").nth(1);
    const words = secondPage.getByTestId("quran-word-help");
    const total = await words.count();
    await words.nth(total - 1).click();

    await expect(page.getByTestId("word-meaning-next")).toBeDisabled();
    await expect(page.getByTestId("word-meaning-previous")).toBeEnabled();
  });
});
