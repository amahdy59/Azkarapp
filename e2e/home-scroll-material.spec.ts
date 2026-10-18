import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("scrolled Home keeps an unboxed row and preserves individual card fallbacks", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-transparency", value: "no-preference" }],
  });
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "ar", themeMode: "midnight", homeMaterial: "system", reduceMotion: true },
        profile: { isGuest: true },
      }),
    );
  });
  await page.goto("/#/home");
  const sticky = page.getByTestId("home-sticky-prayers");
  await sticky.locator("..").evaluate((node) => {
    node.scrollTop = 150;
  });
  await expect(sticky).toHaveAttribute("data-prayer-cards-condensed", "true");
  await expect(sticky).toHaveCSS("backdrop-filter", "none");
  await expect(sticky).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  for (const card of await sticky.locator(".hero-glass.home-glass-surface").all())
    await expect(card).toHaveCSS("backdrop-filter", "blur(22px) saturate(1.35)");
  await page.screenshot({ path: testInfo.outputPath("scrolled-unboxed-frost.png"), scale: "css" });
  expect((await new AxeBuilder({ page }).include('[data-testid="home-sticky-prayers"]').analyze()).violations).toEqual(
    [],
  );
  await cdp.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-transparency", value: "reduce" }],
  });
  await expect(sticky).toHaveCSS("backdrop-filter", "none");
  await page.evaluate(() => document.querySelector(".home-photo-canvas")?.classList.add("home-force-glass"));
  await expect(sticky).toHaveCSS("backdrop-filter", "none");
  await expect(sticky).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  for (const card of await sticky.locator(".hero-glass.home-glass-surface").all())
    await expect(card).toHaveCSS("backdrop-filter", "blur(22px) saturate(1.35)");
  await page.evaluate(() => document.documentElement.classList.add("high-contrast"));
  await expect(sticky).toHaveCSS("backdrop-filter", "none");
  await page.evaluate(() => document.documentElement.classList.remove("high-contrast"));
  await page.emulateMedia({ forcedColors: "active" });
  await expect(sticky).toHaveCSS("backdrop-filter", "none");
});
