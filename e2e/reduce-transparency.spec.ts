import { expect, test } from "@playwright/test";

/**
 * Reduced transparency: blurred materials go solid and the decorative grain
 * over them goes.
 *
 * Headless Chromium reports `prefers-reduced-transparency: reduce` by default,
 * so the media query is already satisfied in every run and a naive test would
 * pass without the class doing anything at all. CDP forces the preference back
 * to no-preference, which is what a real browser reports, so what is measured
 * here is the in-app setting on its own.
 */
test("the setting makes blurred materials solid", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "Emulation.setEmulatedMedia is Chromium-only");

  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-transparency", value: "no-preference" }],
  });

  await page.goto("/");
  await page.getByTestId("language-option-en").click();
  await page.getByTestId("confirm-language").click();
  await page.getByTestId("onboarding-get-started").click();
  await page.getByTestId("continue-as-guest").click();
  await page.getByRole("navigation").first().waitFor();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("heading", { name: "Settings", exact: true }).waitFor();
  await page.getByRole("button", { name: /Help & FAQ/ }).click();
  await page.getByRole("heading", { name: "Help & FAQ", exact: true }).waitFor();

  const measure = () =>
    page.evaluate(() => {
      const shell = document.querySelector(".app-shell");
      return {
        blurred: [...document.querySelectorAll("*")].filter(
          (element) => (getComputedStyle(element).backdropFilter || "none") !== "none",
        ).length,
        texture: shell ? getComputedStyle(shell, "::after").display : "no shell",
        preferenceReported: matchMedia("(prefers-reduced-transparency: reduce)").matches,
      };
    });

  const before = await measure();
  expect(before.preferenceReported).toBe(false);
  // Something on this screen is actually blurred, or the test proves nothing.
  expect(before.blurred).toBeGreaterThan(0);
  expect(before.texture).not.toBe("none");

  await page.evaluate(() => document.documentElement.classList.add("reduce-transparency"));

  const after = await measure();
  // The -webkit- alias written beside the standard property let the minifier
  // collapse the pair to the alias alone, which left Tailwind's own
  // backdrop-filter unopposed. The rule read correctly and did nothing.
  expect(after.blurred).toBe(0);
  expect(after.texture).toBe("none");
});
