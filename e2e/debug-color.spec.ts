import { test, expect } from "@playwright/test";

test("debug: check computed color of Settings section labels", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("language-option-en").click();
  await page.getByTestId("confirm-language").click();
  await page.getByTestId("onboarding-get-started").click();
  await page.getByTestId("continue-as-guest").click();
  await page.getByRole("navigation", { name: "Bottom Navigation" }).waitFor({ state: "visible" });
  await page.getByRole("button", { name: "Settings" }).click();
  await page.getByRole("heading", { name: "Preferences" }).waitFor({ state: "visible" });
  await page.waitForTimeout(500);

  const info = await page.evaluate(() => {
    const htmlEl = document.documentElement;
    const htmlClass = htmlEl.className;
    const foregroundVar = getComputedStyle(htmlEl).getPropertyValue("--foreground").trim();
    const mutedFgVar = getComputedStyle(htmlEl).getPropertyValue("--muted-foreground").trim();
    const cardVar = getComputedStyle(htmlEl).getPropertyValue("--card").trim();
    const bgVar = getComputedStyle(htmlEl).getPropertyValue("--background").trim();

    const h2els = Array.from(document.querySelectorAll("h2")).filter((h2) =>
      ["Account", "Support"].includes(h2.textContent?.trim() || ""),
    );
    const h2colors = h2els.map((h2) => ({
      text: h2.textContent?.trim(),
      color: getComputedStyle(h2).color,
      bgColor: getComputedStyle(h2).backgroundColor,
      opacity: getComputedStyle(h2).opacity,
    }));

    const buttons = Array.from(document.querySelectorAll(".min-h-16.transition-all"));
    const btnColors = buttons.slice(0, 3).map((btn) => ({
      text: btn.textContent?.substring(0, 30),
      bg: getComputedStyle(btn).backgroundColor,
    }));

    return {
      htmlClass,
      foregroundVar,
      mutedFgVar,
      cardVar,
      bgVar,
      h2colors,
      btnColors,
    };
  });

  console.log(JSON.stringify(info, null, 2));
  expect(info.htmlClass).toContain("theme-midnight");
});
