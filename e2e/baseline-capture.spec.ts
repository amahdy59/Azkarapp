import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

function createInitialState(language: "ar" | "en" = "ar", themeMode: "midnight" | "dark" | "light" = "midnight") {
  return {
    settings: {
      language,
      themeMode,
      showTransliteration: true,
      showTranslation: true,
      textSize: "medium",
      highContrast: false,
      boldText: false,
      reduceMotion: true,
      hapticFeedback: false,
      forceRtl: false,
      voiceOver: false,
      audioQuality: "high",
      colorBlindSupport: "none",
    },
    profile: { displayName: "Guest", lastPhoneNumber: "", isGuest: true },
    completed: { morning: [], evening: [], before_sleep: [] },
    sessions: [],
  };
}

test.describe("Baseline Capture Suite", () => {
  test("capture home screen in Arabic Midnight theme", async ({ page }, testInfo) => {
    await page.addInitScript(
      (state) => {
        window.localStorage.setItem("azkarapp.state.v1", JSON.stringify(state));
      },
      createInitialState("ar", "midnight"),
    );

    await page.goto("/");
    await page.getByTestId("language-option-ar").click();
    await page.getByTestId("confirm-language").click();
    await page.getByTestId("onboarding-get-started").click();
    await page.getByTestId("continue-as-guest").click();

    await expect(page.getByRole("navigation")).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("baseline-home-ar-midnight.png"), fullPage: true });

    const axeResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .disableRules(["color-contrast"])
      .analyze();
    expect(axeResults.violations).toEqual([]);
  });

  test("capture library and category screens in English Light theme", async ({ page }, testInfo) => {
    await page.addInitScript(
      (state) => {
        window.localStorage.setItem("azkarapp.state.v1", JSON.stringify(state));
      },
      createInitialState("en", "light"),
    );

    await page.goto("/");
    await page.getByTestId("language-option-en").click();
    await page.getByTestId("confirm-language").click();
    await page.getByTestId("onboarding-get-started").click();
    await page.getByTestId("continue-as-guest").click();

    await page.getByTestId("nav-azkar").click();
    await expect(page.getByRole("heading", { name: "Azkar Library", exact: true })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("baseline-library-en-light.png"), fullPage: true });

    await page.getByTestId("category-card-morning").click();
    await expect(page.getByRole("heading", { name: "Morning Azkar", exact: true })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("baseline-category-morning-en-light.png"), fullPage: true });
  });

  test("capture reader session and reference sheet", async ({ page }, testInfo) => {
    await page.addInitScript(
      (state) => {
        window.localStorage.setItem("azkarapp.state.v1", JSON.stringify(state));
      },
      createInitialState("ar", "dark"),
    );

    await page.goto("/");
    await page.getByTestId("language-option-ar").click();
    await page.getByTestId("confirm-language").click();
    await page.getByTestId("onboarding-get-started").click();
    await page.getByTestId("continue-as-guest").click();

    await page.getByTestId("nav-azkar").click();
    await page.getByTestId("category-card-morning").click();
    await page.getByRole("button", { name: /Start Session|ابدأ الجلسة/ }).click();
    await expect(page.getByTestId("reader-screen")).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("baseline-reader-session.png"), fullPage: true });

    await page.getByRole("button", { name: /Benefit|فائدة|الفائدة/ }).click();
    await expect(page.getByTestId("reference-sheet")).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("baseline-benefit-sheet.png"), fullPage: true });
  });

  test("capture settings and accessibility options", async ({ page }, testInfo) => {
    await page.addInitScript(
      (state) => {
        window.localStorage.setItem("azkarapp.state.v1", JSON.stringify(state));
      },
      createInitialState("en", "midnight"),
    );

    await page.goto("/");
    await page.getByTestId("language-option-en").click();
    await page.getByTestId("confirm-language").click();
    await page.getByTestId("onboarding-get-started").click();
    await page.getByTestId("continue-as-guest").click();

    await page.getByRole("button", { name: "Settings" }).click();
    await expect(page.getByRole("heading", { name: "Preferences" })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("baseline-settings.png"), fullPage: true });

    await page.getByRole("button", { name: "Accessibility", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Accessibility", exact: true }).first()).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("baseline-accessibility-settings.png"), fullPage: true });
  });
});
