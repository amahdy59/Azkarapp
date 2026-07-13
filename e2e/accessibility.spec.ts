import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("initial flow has no automatically detectable WCAG A/AA violations", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#main-content")).toBeVisible();
  await expect(page.getByRole("status", { name: "Loading Azkar" })).toHaveCount(0, { timeout: 5000 });
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(results.violations).toEqual([]);
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
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(results.violations).toEqual([]);
});
