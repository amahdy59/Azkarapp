import { expect, test, type Page } from "@playwright/test";

async function enterAsEnglishGuest(page: Page) {
  await page.goto("/");
  await page.getByTestId("language-option-en").click();
  await page.getByTestId("confirm-language").click();
  await page.getByTestId("onboarding-get-started").click();
  await page.getByTestId("continue-as-guest").click();
}

test("@cross-browser Azkar tab opens the library and exposes search", async ({ page }) => {
  await enterAsEnglishGuest(page);

  await page.getByRole("button", { name: "Azkar", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Azkar Library", exact: true })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Search adhkar and duas", exact: true })).toBeVisible();

  await page.getByTestId("category-card-morning").click();
  await expect(page.locator("h1", { hasText: "Morning Azkar" })).toBeVisible();
  await expect(page.getByText(/\d+ of \d+/).first()).toBeVisible();

  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Azkar Library", exact: true })).toBeVisible();
});

test("hash routes restore lazy collections, reject invalid positions, and preserve PWA shortcuts", async ({ page }) => {
  await enterAsEnglishGuest(page);

  await page.goto("/#/azkar/comprehensive-duas");
  await expect(page.getByRole("heading", { name: "Comprehensive Duas", exact: true })).toBeVisible();
  await expect(page).toHaveURL(/#\/azkar\/comprehensive-duas$/);

  await page.goto("/#/azkar/morning/9999");
  await expect(page).toHaveURL(/#\/azkar\/morning$/);
  await expect(page.getByRole("heading", { name: "Morning Azkar", exact: true })).toBeVisible();

  await page.goto("/?category=evening");
  await expect(page.getByRole("heading", { name: "Evening Azkar", exact: true })).toBeVisible();
  await expect(page).toHaveURL(/#\/azkar\/evening$/);
});

test("saved zikr is visible from the first-class Saved library tab", async ({ page }) => {
  await enterAsEnglishGuest(page);

  await page.getByTestId("home-primary-cta").click();
  // Save is a visible hero action on tablet/desktop and lives in the compact
  // menu on phones. The menu intentionally excludes actions already visible.
  const saveButton = page.getByRole("button", { name: "Save zikr", exact: true });
  if ((page.viewportSize()?.width ?? 0) >= 768) {
    await expect(saveButton).toBeVisible();
    await saveButton.click();
  } else {
    await page.getByRole("button", { name: "Reader options", exact: true }).click();
    await page.getByRole("menuitem", { name: "Save zikr", exact: true }).click();
  }
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.getByRole("button", { name: "Azkar", exact: true }).click();
  await page.getByTestId("library-section-filter").click();
  await page.getByRole("menuitemradio", { name: /Saved/ }).click();

  await expect(page.getByRole("heading", { name: "Saved remembrance", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Azkar:/ }).first()).toBeVisible();
});

test("Continue Azkar resumes at the first incomplete zikr", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    window.localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: {
          language: "en",
          themeMode: "midnight",
          progressDayStartHour: 4,
          routineModes: { morning: "core", evening: "core", before_sleep: "core" },
        },
        profile: { displayName: "Guest", lastPhoneNumber: "", isGuest: true },
        completed: {
          morning: ["m-hm-77m", "m-hm-78m", "m-hm-75"],
          evening: ["e-hm-77e", "e-hm-78e", "e-hm-75"],
          before_sleep: ["s-hm-100", "s-hm-101", "s-hm-99-ikhlas"],
        },
        sessions: [],
        dailyCompletions: [],
        savedZikrIds: [],
      }),
    );
  });

  await page.goto("/");
  await expect(page.getByRole("status", { name: "Loading Azkar" })).toHaveCount(0, { timeout: 5000 });
  await expect(page.getByTestId("home-primary-cta")).toContainText("Continue");
  await page.getByTestId("home-primary-cta").click();

  await expect(page.getByTestId("reader-screen")).toHaveAttribute("data-zikr-index", "3");
});

test("collection keeps canonical order and reset stays inside the app canvas", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    window.localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: {
          language: "en",
          themeMode: "midnight",
          progressDayStartHour: 4,
          routineModes: { morning: "complete", evening: "core", before_sleep: "core" },
        },
        profile: { displayName: "Guest", lastPhoneNumber: "", isGuest: true },
        completed: {
          morning: ["m-hm-77m", "m-hm-78m", "m-hm-75"],
          evening: [],
          before_sleep: [],
        },
        sessions: [],
        dailyCompletions: [],
        savedZikrIds: [],
      }),
    );
  });

  await page.goto("/");
  await expect(page.getByRole("status", { name: "Loading Azkar" })).toHaveCount(0, { timeout: 5000 });
  await page.getByTestId("home-primary-cta").click();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.getByRole("button", { name: "Azkar", exact: true }).click();
  await page.getByTestId("category-card-morning").click();

  await expect(page.getByText("Collection introduction", { exact: true })).toBeVisible();
  await expect(
    page.getByText(
      "All praise is due to Allah alone, and prayers and peace be upon the one after whom there is no Prophet.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Begin", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Qur’anic protection", exact: true })).toBeVisible();
  await expect(page.locator('[data-ritual-group="three_quls"]')).toHaveCount(1);
  await expect(page.getByTestId("routine-mode-filter")).toHaveAccessibleName("Routine length: Complete");

  await page.getByRole("button", { name: "Reset Progress", exact: true }).click();

  const shellBox = await page.locator(".app-shell").boundingBox();
  const dialogBox = await page.getByRole("alertdialog").boundingBox();
  expect(shellBox).not.toBeNull();
  expect(dialogBox).not.toBeNull();
  expect(dialogBox!.x).toBeGreaterThanOrEqual(shellBox!.x);
  expect(dialogBox!.x + dialogBox!.width).toBeLessThanOrEqual(shellBox!.x + shellBox!.width);

  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.getByText("0 of 25", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Reset Progress", exact: true })).toHaveCount(0);
});
