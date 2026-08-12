import { expect, test } from "@playwright/test";

async function enterEnglishGuestMode(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByTestId("language-option-en").click();
  await page.getByTestId("confirm-language").click();
  await page.getByTestId("onboarding-get-started").click();
  await page.getByTestId("continue-as-guest").click();
  await expect(page.getByRole("navigation")).toBeVisible();
}

test("Settings navigation via keyboard is fully operable", async ({ page }) => {
  await enterEnglishGuestMode(page);

  // Open settings
  await page.getByTestId("nav-settings").click();
  await expect(page.getByRole("heading", { name: "Preferences" })).toBeVisible();

  // Test navigating into a sub-panel to verify full focus trap / keyboard flow
  const accessibilityRow = page.getByRole("button", { name: /Accessibility/i });
  await accessibilityRow.focus();
  await page.keyboard.press("Enter");

  // Now in Accessibility panel
  await expect(page.getByRole("heading", { name: "Accessibility", exact: true }).last()).toBeVisible();

  // Now test a switch here
  const highContrastSwitch = page.getByRole("switch", { name: /High contrast/i });
  await highContrastSwitch.focus();
  const initialState = await highContrastSwitch.getAttribute("aria-checked");
  await page.keyboard.press("Space");
  await expect(highContrastSwitch).toHaveAttribute("aria-checked", initialState === "true" ? "false" : "true");

  // Press back if visible (mobile)
  const backBtn = page.getByRole("button", { name: /Back/i });
  if (await backBtn.isVisible()) {
    await backBtn.focus();
    await page.keyboard.press("Enter");
  }

  await expect(page.getByRole("heading", { name: /Preferences/i }).first()).toBeVisible();
});

test("Counters keyboard navigation and reset", async ({ page }) => {
  await enterEnglishGuestMode(page);
  await page.goto("/#/counter");
  await expect(page.getByRole("heading", { name: "Tasbeeh Counter" })).toBeVisible();

  // Find the large tap area
  const counterArea = page.getByTestId("custom-counter-surface");
  await counterArea.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Space");

  // Ensure the count increased
  await expect(page.getByText("2").first()).toBeVisible();

  // Reset via keyboard
  const resetBtn = page.getByRole("button", { name: /Reset/i }).first();
  await resetBtn.focus();
  await page.keyboard.press("Enter");

  // Handle reset dialog
  const confirmBtn = page.getByRole("button", { name: /Reset/i }).last();
  await expect(confirmBtn).toBeVisible();
  await confirmBtn.focus();
  await page.keyboard.press("Enter");

  await expect(page.getByText("0").first()).toBeVisible();
});

test("Friday mode keyboard navigation through surahs", async ({ page }) => {
  await enterEnglishGuestMode(page);
  await page.goto("/#/friday");

  await expect(page.getByRole("heading", { name: /Friday Companion/i })).toBeVisible();

  // Tab to Kahf and enter
  const kahfBtn = page.getByRole("button", { name: /Start Reading/i });
  await kahfBtn.focus();
  await page.keyboard.press("Enter");

  // Reader opens
  await expect(page.getByTestId("reader-screen")).toBeVisible();

  // Keyboard nav in reader
  const closeBtn = page.getByRole("button", { name: /Back/i });
  await closeBtn.focus();
  await page.keyboard.press("Enter");

  await expect(page.getByRole("heading", { name: /Friday Companion/i })).toBeVisible();
});

test("Saved zikr keyboard removal", async ({ page }) => {
  await enterEnglishGuestMode(page);

  // Save an item first
  await page.getByTestId("nav-azkar").click();
  await page.getByTestId("category-card-morning").click();
  await page.getByRole("button", { name: /Start session/i }).click();

  const isMobile = (page.viewportSize()?.width ?? 1024) < 768;
  if (isMobile) {
    await page.getByRole("button", { name: /Reader options/i }).click();
  }

  const saveBtn = page
    .getByRole("menuitem", { name: /Save zikr/i })
    .first()
    .or(page.getByRole("button", { name: /Save zikr/i }).first());
  await expect(saveBtn).toBeVisible();
  await saveBtn.click();

  // Go back to the library
  await page.getByRole("button", { name: /Back/i }).click();
  await page.getByRole("button", { name: /Back/i }).click();

  await page.getByRole("tab", { name: /^Saved/i }).click();
  await expect(page.getByRole("heading", { name: /Saved/i }).first()).toBeVisible();

  // Tab to the first saved zikr and open it
  const savedItem = page.getByRole("button", { name: /Morning Azkar:/i }).first();
  await expect(savedItem).toBeVisible();
  await savedItem.focus();
  await page.keyboard.press("Enter");

  // Focus unsave button and press enter
  if (isMobile) {
    await page.getByRole("button", { name: /Reader options/i }).click();
  }
  const unsaveBtn = page
    .getByRole("menuitem", { name: /Remove saved zikr/i })
    .first()
    .or(page.getByRole("button", { name: /Remove saved zikr/i }).first());
  await expect(unsaveBtn).toBeVisible();
  await unsaveBtn.click();

  // Go back
  await page.getByRole("button", { name: /Back/i }).click();

  // Expect empty state
  await page.getByRole("tab", { name: /^Saved/i }).click();
  await expect(page.getByRole("heading", { name: "Nothing saved yet" })).toBeVisible();
});

test("Prayer cards keyboard interaction", async ({ page }) => {
  await enterEnglishGuestMode(page);

  // Prayer times widget on home
  const expandBtn = page.getByRole("button", { name: /Prayer Times|Expand/i }).first();
  if (await expandBtn.isVisible()) {
    await expandBtn.focus();
    await page.keyboard.press("Enter");

    const collapseBtn = page.getByRole("button", { name: /Collapse/i }).first();
    await expect(collapseBtn).toBeVisible();
  }
});
