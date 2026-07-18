import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function enterEnglishGuestMode(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByTestId("language-option-en").click();
  await page.getByTestId("confirm-language").click();
  await page.getByTestId("onboarding-get-started").click();
  await page.getByTestId("continue-as-guest").click();
  await expect(page.getByRole("navigation", { name: "Bottom Navigation" })).toBeVisible();
}

async function expectNoWcagViolations(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(results.violations).toEqual([]);
}

async function expectVisibleInteractiveTargetsAtLeast44px(page: import("@playwright/test").Page, screenName: string) {
  const undersized = await page
    .locator(
      'button:visible, a[href]:visible, input:visible, select:visible, [role="button"]:visible, [role="tab"]:visible, [role="radio"]:visible, [role="switch"]:visible',
    )
    .evaluateAll((nodes) => {
      const uniqueNodes = [...new Set(nodes)] as HTMLElement[];
      return uniqueNodes.flatMap((node) => {
        const ownBounds = node.getBoundingClientRect();
        const associatedLabel =
          node instanceof HTMLInputElement || node instanceof HTMLSelectElement
            ? node.labels?.item(0)?.getBoundingClientRect()
            : null;
        const targetBounds =
          associatedLabel && associatedLabel.width >= ownBounds.width && associatedLabel.height >= ownBounds.height
            ? associatedLabel
            : ownBounds;

        if (targetBounds.width >= 44 && targetBounds.height >= 44) return [];

        return [
          {
            label:
              node.getAttribute("aria-label") ||
              node.getAttribute("title") ||
              node.textContent?.replace(/\s+/g, " ").trim() ||
              node.tagName,
            tag: node.tagName,
            width: Math.round(targetBounds.width),
            height: Math.round(targetBounds.height),
          },
        ];
      });
    });

  expect(undersized, `${screenName} has interactive targets below the 44px product standard`).toEqual([]);
}

test("initial flow has no automatically detectable WCAG A/AA violations", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#main-content")).toBeVisible();
  // Wait for the splash screen to finish by looking for the Language screen content
  await expect(page.getByRole("heading", { name: "Choose Your Language" })).toBeVisible({ timeout: 5000 });
  await expectNoWcagViolations(page);
});

test("skip link moves keyboard focus to the main content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("marketing landing page has no automatically detectable WCAG A/AA violations", async ({ page }) => {
  await page.goto("/landing");
  await expect(page.getByRole("heading", { name: "Build a lasting azkar habit." })).toBeVisible();
  await expectNoWcagViolations(page);
});

test("home and settings flows have no automatically detectable WCAG A/AA violations", async ({ page }) => {
  await enterEnglishGuestMode(page);
  await expectNoWcagViolations(page);

  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Preferences" })).toBeVisible();
  await expectNoWcagViolations(page);

  await page.getByRole("button", { name: "Accessibility", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Accessibility", exact: true })).toBeVisible();
  await expectNoWcagViolations(page);
});

test("visible settings controls meet the 44px minimum touch target", async ({ page }) => {
  await enterEnglishGuestMode(page);
  await page.getByRole("button", { name: "Settings" }).click();
  await page.getByRole("button", { name: "Accessibility", exact: true }).click();

  const undersized = await page
    .locator("button:visible, a:visible, input:visible, select:visible")
    .evaluateAll((nodes) =>
      nodes.flatMap((node) => {
        const rect = node.getBoundingClientRect();
        if (rect.width >= 44 && rect.height >= 44) {
          return [];
        }
        return [
          {
            label: node.getAttribute("aria-label") || node.textContent?.trim() || node.tagName,
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          },
        ];
      }),
    );

  expect(undersized).toEqual([]);
});

test("visible core-flow controls meet the 44px product touch-target standard", async ({ page }) => {
  await enterEnglishGuestMode(page);
  await expectVisibleInteractiveTargetsAtLeast44px(page, "Home");

  await page.getByRole("button", { name: "Azkar", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Azkar Library", exact: true })).toBeVisible();
  await expectVisibleInteractiveTargetsAtLeast44px(page, "Azkar Library");

  await page.getByRole("button", { name: /Morning Azkar, \d+ of \d+ complete/ }).click();
  await expectVisibleInteractiveTargetsAtLeast44px(page, "Category");

  await page.getByRole("button", { name: "Start Session", exact: true }).click();
  await expect(page.getByTestId("reader-screen")).toBeVisible();
  await expectVisibleInteractiveTargetsAtLeast44px(page, "Reader");

  await page.getByRole("button", { name: "Benefit", exact: true }).click();
  await expect(page.getByTestId("reference-sheet")).toBeVisible();
  await expectVisibleInteractiveTargetsAtLeast44px(page, "Benefit sheet");
});
