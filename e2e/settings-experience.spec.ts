import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function enterEnglishGuestMode(page: Page) {
  await page.goto("/");
  await page.getByTestId("language-option-en").click();
  await page.getByTestId("confirm-language").click();
  await page.getByTestId("onboarding-get-started").click();
  await page.getByTestId("continue-as-guest").click();
  await expect(page.getByRole("navigation", { name: "Bottom Navigation" })).toBeVisible();
}

async function openSettings(page: Page) {
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Settings", exact: true })).toBeVisible();
}

async function expectNoWcagViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(results.violations).toEqual([]);
}

test("all product themes apply atomically and remain accessible", async ({ page }) => {
  await enterEnglishGuestMode(page);
  await openSettings(page);

  const themePicker = page.getByRole("radiogroup", { name: "Choose a color theme" });
  await expect(themePicker).toBeVisible();
  await expect(themePicker.getByRole("radio")).toHaveCount(3);
  await expect(page.getByRole("button", { name: /Appearance (Midnight|Light mode|Dark mode)/ })).toHaveCount(0);

  const expectations = [
    { mode: "midnight", background: "#0a1228", scheme: "dark" },
    { mode: "light", background: "#f8f5f0", scheme: "light" },
    { mode: "dark", background: "#0d0d0d", scheme: "dark" },
  ] as const;

  for (const { mode, background, scheme } of expectations) {
    await page.getByTestId(`theme-option-${mode}`).click();
    await expect(page.locator("html")).toHaveClass(new RegExp(`theme-${mode}`));
    const themeState = await page.evaluate(() => ({
      productThemeClasses: [...document.documentElement.classList].filter((name) => name.startsWith("theme-")),
      background: getComputedStyle(document.documentElement).getPropertyValue("--background").trim(),
      scheme: getComputedStyle(document.documentElement).colorScheme,
    }));
    expect(themeState).toEqual({ productThemeClasses: [`theme-${mode}`], background, scheme });
    await expectNoWcagViolations(page);
  }
});

test("high contrast explains why a selected theme is visually overridden", async ({ page }) => {
  await enterEnglishGuestMode(page);
  await openSettings(page);
  await page.getByRole("button", { name: "Accessibility", exact: true }).click();
  await page.getByRole("switch", { name: "High contrast mode" }).click();
  await page.getByRole("button", { name: "Back" }).click();

  await expect(page.getByRole("heading", { name: "High contrast is overriding theme colors" })).toBeVisible();
  await page.getByRole("button", { name: "Turn off high contrast" }).click();
  await expect(page.getByRole("heading", { name: "High contrast is overriding theme colors" })).toHaveCount(0);
});

test("text size is exposed only inside Accessibility", async ({ page }) => {
  await enterEnglishGuestMode(page);
  await openSettings(page);

  await expect(page.getByText("Text size", { exact: true })).toHaveCount(0);
  await expect(page.getByTestId("text-size-option-medium")).toHaveCount(0);

  await page.getByRole("button", { name: "Accessibility", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Accessibility", exact: true })).toBeVisible();
  const textSizePicker = page.getByRole("radiogroup", { name: "Text size" });
  await expect(textSizePicker).toBeVisible();
  await expect(textSizePicker.getByRole("radio")).toHaveCount(3);
  await page.getByTestId("text-size-option-large").click();
  await expect(page.getByTestId("text-size-option-large")).toBeChecked();

  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByRole("heading", { name: "Settings", exact: true })).toBeVisible();
  await expect(page.getByText("Text size", { exact: true })).toHaveCount(0);
  await expect(page.getByTestId("text-size-option-large")).toHaveCount(0);
});

test("language changes in place from the Settings selector", async ({ page }) => {
  await enterEnglishGuestMode(page);
  await openSettings(page);

  const settingsUrl = page.url();
  const historyLength = await page.evaluate(() => window.history.length);
  const languageSelector = page.getByTestId("settings-language-select");

  await expect(languageSelector).toBeVisible();
  await expect(languageSelector).toHaveValue("en");
  await languageSelector.selectOption("ar");

  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(languageSelector).toBeVisible();
  await expect(languageSelector).toHaveValue("ar");
  await expect(
    page.getByRole("heading", { name: "\u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a", exact: true }),
  ).toBeVisible();
  expect(page.url()).toBe(settingsUrl);
  expect(await page.evaluate(() => window.history.length)).toBe(historyLength);
});

test("forced RTL updates settings controls and their keyboard direction", async ({ page }) => {
  await enterEnglishGuestMode(page);
  await openSettings(page);

  const themePicker = page.getByRole("radiogroup", { name: "Choose a color theme" });
  await expect(themePicker).toHaveAttribute("dir", "ltr");

  await page.getByRole("button", { name: "Accessibility", exact: true }).click();
  const textSizePicker = page.getByRole("radiogroup", { name: "Text size" });
  await expect(textSizePicker).toHaveAttribute("dir", "ltr");

  await page.getByRole("switch", { name: "Right-to-left layout" }).click();
  await expect(textSizePicker).toHaveAttribute("dir", "rtl");

  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(themePicker).toHaveAttribute("dir", "rtl");
});

test("launch-critical settings screens are discoverable and accessible", async ({ page }) => {
  await enterEnglishGuestMode(page);
  await openSettings(page);

  const destinations = [
    { row: "Content sources & corrections", heading: "Content sources & corrections" },
    { row: "Account & data Activate account", heading: "Account & data" },
    { row: "Help & FAQ", heading: "Help & FAQ" },
    { row: "Privacy & terms", heading: "Privacy & terms" },
  ];

  for (const destination of destinations) {
    await page.getByRole("button", { name: destination.row }).click();
    await expect(page.getByRole("heading", { name: destination.heading, exact: true })).toBeVisible();
    await expectNoWcagViolations(page);
    await page.getByRole("button", { name: "Back" }).click();
  }
});

test("malformed legacy preferences recover without a blank screen", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: {
          language: "en",
          themeMode: "sepia",
          textSize: "huge",
          reminders: { morning: null, evening: { enabled: true, time: "99:99" } },
        },
        profile: null,
        completed: null,
        sessions: [null, { id: "broken" }],
      }),
    );
  });

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Choose Your Language" })).toBeVisible({ timeout: 5000 });
  await expect(page.locator("html")).toHaveClass(/theme-midnight/);
  await expect(page.locator("body")).not.toBeEmpty();
});

test("onboarding is shown once and returning users resume at Home", async ({ page }) => {
  await enterEnglishGuestMode(page);

  await page.reload();
  await expect(page.getByRole("heading", { name: "Azkar", exact: true })).toBeVisible({ timeout: 5000 });
  await expect(page.getByRole("heading", { name: "Choose Your Language" })).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "Bottom Navigation" })).toBeVisible();
});
